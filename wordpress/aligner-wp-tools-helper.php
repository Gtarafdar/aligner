<?php
/**
 * Plugin Name: Aligner WP Tools Helper
 * Description: Optional helper for the Aligner extension to switch sample users by role and privately preview installed themes per user/session.
 * Version: 0.2.0
 * Author: Aligner
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Aligner_WP_Tools_Helper {
    private const REST_NAMESPACE = 'aligner/v1';
    private const ROLE_REST_BASE = 'role-switcher';
    private const THEME_REST_BASE = 'theme-switcher';
    private const ROLE_COOKIE_NAME = 'aligner_role_switch_token';
    private const THEME_COOKIE_NAME = 'aligner_theme_preview_token';
    private const TRANSIENT_PREFIX = 'aligner_role_switch_';
    private const ROLE_TOKEN_TTL = 2 * HOUR_IN_SECONDS;
    private const THEME_TOKEN_TTL = 6 * HOUR_IN_SECONDS;
    private const PLUGIN_VERSION = '0.2.0';
    private static $printed_bootstrap = false;

    public static function init(): void {
        add_filter('pre_option_stylesheet', [__CLASS__, 'filter_preview_stylesheet']);
        add_filter('pre_option_template', [__CLASS__, 'filter_preview_template']);
        add_action('init', [__CLASS__, 'handle_switch_back_request']);
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
        add_action('admin_head', [__CLASS__, 'print_bootstrap']);
        add_action('wp_head', [__CLASS__, 'print_bootstrap']);
        add_action('admin_footer', [__CLASS__, 'print_bootstrap']);
        add_action('wp_footer', [__CLASS__, 'print_bootstrap']);
        add_action('admin_footer', [__CLASS__, 'print_switch_back_link']);
        add_action('wp_footer', [__CLASS__, 'print_switch_back_link']);
    }

    public static function register_routes(): void {
        register_rest_route(self::REST_NAMESPACE, '/' . self::ROLE_REST_BASE . '/candidates', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_candidates'],
            'permission_callback' => [__CLASS__, 'can_view_switcher'],
        ]);

        register_rest_route(self::REST_NAMESPACE, '/' . self::ROLE_REST_BASE . '/switch', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'switch_user'],
            'permission_callback' => [__CLASS__, 'can_manage_users'],
            'args' => [
                'user_id' => [
                    'required' => true,
                    'sanitize_callback' => 'absint',
                ],
            ],
        ]);

        register_rest_route(self::REST_NAMESPACE, '/' . self::ROLE_REST_BASE . '/switch-back', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'switch_back'],
            'permission_callback' => [__CLASS__, 'can_switch_back'],
        ]);

        register_rest_route(self::REST_NAMESPACE, '/' . self::THEME_REST_BASE . '/themes', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_themes'],
            'permission_callback' => [__CLASS__, 'can_preview_themes'],
        ]);

        register_rest_route(self::REST_NAMESPACE, '/' . self::THEME_REST_BASE . '/preview', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'preview_theme'],
            'permission_callback' => [__CLASS__, 'can_preview_themes'],
            'args' => [
                'stylesheet' => [
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);

        register_rest_route(self::REST_NAMESPACE, '/' . self::THEME_REST_BASE . '/reset', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'reset_theme_preview'],
            'permission_callback' => [__CLASS__, 'can_preview_themes'],
        ]);
    }

    public static function print_bootstrap(): void {
        if (self::$printed_bootstrap) {
            return;
        }

        if (!is_user_logged_in()) {
            return;
        }

        if (!self::can_manage_users() && !self::has_valid_switch_token() && !self::can_preview_themes()) {
            return;
        }

        $data = [
            'endpoint' => esc_url_raw(rest_url(self::REST_NAMESPACE)),
            'roleSwitcherEndpoint' => esc_url_raw(rest_url(self::REST_NAMESPACE . '/' . self::ROLE_REST_BASE)),
            'themeSwitcherEndpoint' => esc_url_raw(rest_url(self::REST_NAMESPACE . '/' . self::THEME_REST_BASE)),
            'nonce' => wp_create_nonce('wp_rest'),
            'pluginName' => 'Aligner WP Tools Helper',
            'pluginVersion' => self::PLUGIN_VERSION,
            'switchBackUrl' => self::has_valid_switch_token(false) ? self::get_switch_back_url() : '',
        ];
        $role_data = [
            'endpoint' => $data['roleSwitcherEndpoint'],
            'nonce' => $data['nonce'],
            'switchBackUrl' => $data['switchBackUrl'],
        ];
        $theme_data = [
            'endpoint' => $data['themeSwitcherEndpoint'],
            'nonce' => $data['nonce'],
            'pluginVersion' => self::PLUGIN_VERSION,
        ];

        self::$printed_bootstrap = true;
        printf('<meta name="aligner-wp-tools-helper" content="%s" />', esc_attr(self::PLUGIN_VERSION));
        printf('<meta name="aligner-wp-tools-nonce" content="%s" />', esc_attr($data['nonce']));
        printf('<meta name="aligner-role-switcher-endpoint" content="%s" />', esc_attr($data['roleSwitcherEndpoint']));
        printf('<meta name="aligner-role-switcher-nonce" content="%s" />', esc_attr($data['nonce']));
        printf('<meta name="aligner-theme-switcher-endpoint" content="%s" />', esc_attr($data['themeSwitcherEndpoint']));
        printf('<meta name="aligner-theme-switcher-nonce" content="%s" />', esc_attr($data['nonce']));
        printf(
            '<script type="application/json" id="aligner-wp-tools-helper-bootstrap">%s</script>',
            wp_json_encode($data)
        );
        printf(
            '<script type="application/json" id="aligner-role-switcher-bootstrap">%s</script>',
            wp_json_encode($role_data)
        );
        printf(
            '<script type="application/json" id="aligner-theme-switcher-bootstrap">%s</script>',
            wp_json_encode($theme_data)
        );
    }

    public static function print_switch_back_link(): void {
        if (!self::has_valid_switch_token(false)) {
            return;
        }

        printf(
            '<p id="aligner-role-switcher-switch-back" style="position:fixed;left:16px;bottom:16px;z-index:2147483647;margin:0;"><a href="%s" style="display:inline-block;background:#111827;color:#fff;padding:9px 12px;border-radius:6px;text-decoration:none;font:600 12px/1.2 system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;">%s</a></p>',
            esc_url(self::get_switch_back_url()),
            esc_html__('Switch back to admin', 'aligner-wp-tools-helper')
        );
    }

    public static function can_manage_users(): bool {
        return (
            current_user_can('edit_users') ||
            current_user_can('promote_users') ||
            current_user_can('manage_options') ||
            current_user_can('install_plugins') ||
            current_user_can('activate_plugins')
        );
    }

    public static function can_view_switcher(): bool {
        return self::can_manage_users() || self::has_valid_switch_token();
    }

    public static function can_switch_back(): bool {
        return self::has_valid_switch_token(false);
    }

    public static function can_preview_themes(): bool {
        if (!function_exists('current_user_can')) {
            return false;
        }

        return current_user_can('switch_themes') || current_user_can('edit_theme_options');
    }

    public static function get_candidates(): WP_REST_Response {
        $candidates = [];
        $missing_roles = [];

        if (self::can_manage_users()) {
            $current_user_id = get_current_user_id();
            $roles = wp_roles();

            foreach ($roles->roles as $role_slug => $role_data) {
                $users = get_users([
                    'role' => $role_slug,
                    'number' => 1,
                    'orderby' => 'ID',
                    'order' => 'ASC',
                    'exclude' => [$current_user_id],
                    'fields' => ['ID', 'display_name', 'user_login'],
                ]);

                if (!$users) {
                    $missing_roles[] = [
                        'role' => sanitize_key($role_slug),
                        'roleLabel' => translate_user_role($role_data['name']),
                    ];
                    continue;
                }

                $user = $users[0];
                $candidates[] = [
                    'id' => (int) $user->ID,
                    'role' => sanitize_key($role_slug),
                    'roleLabel' => translate_user_role($role_data['name']),
                    'name' => $user->display_name,
                    'username' => $user->user_login,
                ];
            }
        }

        return new WP_REST_Response([
            'candidates' => $candidates,
            'missingRoles' => $missing_roles,
            'switchBack' => self::has_valid_switch_token(),
            'switchBackUrl' => self::has_valid_switch_token(false) ? self::get_switch_back_url() : '',
        ]);
    }

    public static function switch_user(WP_REST_Request $request) {
        $target_user_id = absint($request->get_param('user_id'));
        $target_user = get_userdata($target_user_id);

        if (!$target_user) {
            return new WP_Error('aligner_missing_user', 'Target user was not found.', ['status' => 404]);
        }

        $current_user_id = get_current_user_id();
        if ($target_user_id === $current_user_id) {
            return new WP_Error('aligner_same_user', 'You are already signed in as that user.', ['status' => 400]);
        }

        $token = wp_generate_password(48, false, false);
        set_transient(self::TRANSIENT_PREFIX . $token, [
            'original_user_id' => $current_user_id,
            'target_user_id' => $target_user_id,
            'created' => time(),
        ], self::ROLE_TOKEN_TTL);

        self::set_role_switch_cookie($token);
        wp_clear_auth_cookie();
        wp_set_current_user($target_user_id);
        wp_set_auth_cookie($target_user_id, false, is_ssl());

        return new WP_REST_Response([
            'success' => true,
            'redirect' => home_url('/'),
            'switchBackUrl' => self::get_switch_back_url(),
        ]);
    }

    public static function switch_back() {
        $result = self::restore_original_user();
        if (is_wp_error($result)) {
            return $result;
        }

        return new WP_REST_Response([
            'success' => true,
            'redirect' => admin_url('/'),
        ]);
    }

    public static function handle_switch_back_request(): void {
        if (!isset($_GET['aligner_role_switch_back'])) {
            return;
        }

        $result = self::restore_original_user();
        if (is_wp_error($result)) {
            wp_die(
                esc_html($result->get_error_message()),
                esc_html__('Aligner role switch back failed', 'aligner-wp-tools-helper'),
                ['response' => (int) ($result->get_error_data()['status'] ?? 403)]
            );
        }

        wp_safe_redirect(admin_url('/'));
        exit;
    }

    public static function get_themes(): WP_REST_Response {
        return new WP_REST_Response(self::get_theme_payload());
    }

    public static function preview_theme(WP_REST_Request $request) {
        $stylesheet = sanitize_text_field((string) $request->get_param('stylesheet'));
        $theme = wp_get_theme($stylesheet);

        if (!$theme->exists()) {
            return new WP_Error('aligner_missing_theme', 'Selected theme was not found.', ['status' => 404]);
        }

        self::set_theme_preview_cookie($theme);

        return new WP_REST_Response(self::get_theme_payload());
    }

    public static function reset_theme_preview(): WP_REST_Response {
        self::clear_theme_preview_cookie();
        return new WP_REST_Response(self::get_theme_payload());
    }

    public static function filter_preview_stylesheet($stylesheet) {
        $data = self::get_theme_preview_token_data();
        return $data ? $data['stylesheet'] : $stylesheet;
    }

    public static function filter_preview_template($template) {
        $data = self::get_theme_preview_token_data();
        return $data ? $data['template'] : $template;
    }

    private static function get_theme_payload(): array {
        $themes = [];
        foreach (wp_get_themes() as $theme) {
            $themes[] = self::format_theme($theme);
        }

        usort($themes, static function ($a, $b) {
            return strcasecmp($a['name'], $b['name']);
        });

        $active_theme = wp_get_theme(self::get_public_stylesheet());
        $preview_data = self::get_theme_preview_token_data();
        $preview_theme = null;
        if ($preview_data) {
            $theme = wp_get_theme($preview_data['stylesheet']);
            if ($theme->exists()) {
                $preview_theme = self::format_theme($theme);
            }
        }

        return [
            'activeTheme' => self::format_theme($active_theme),
            'previewTheme' => $preview_theme,
            'themes' => $themes,
            'canSwitchThemes' => self::can_preview_themes(),
            'pluginVersion' => self::PLUGIN_VERSION,
        ];
    }

    private static function format_theme(WP_Theme $theme): array {
        return [
            'name' => $theme->get('Name'),
            'stylesheet' => $theme->get_stylesheet(),
            'template' => $theme->get_template(),
            'version' => $theme->get('Version'),
            'author' => wp_strip_all_tags($theme->get('Author')),
            'screenshot' => $theme->get_screenshot(),
            'isChild' => $theme->parent() ? true : false,
        ];
    }

    private static function get_public_stylesheet(): string {
        remove_filter('pre_option_stylesheet', [__CLASS__, 'filter_preview_stylesheet']);
        $stylesheet = (string) get_option('stylesheet');
        add_filter('pre_option_stylesheet', [__CLASS__, 'filter_preview_stylesheet']);
        return $stylesheet;
    }

    private static function set_theme_preview_cookie(WP_Theme $theme): void {
        $data = [
            'user_id' => get_current_user_id(),
            'stylesheet' => $theme->get_stylesheet(),
            'template' => $theme->get_template(),
            'expires' => time() + self::THEME_TOKEN_TTL,
        ];
        $payload = self::base64_url_encode(wp_json_encode($data));
        $signature = hash_hmac('sha256', $payload, wp_salt('auth'));
        $token = $payload . '.' . $signature;

        foreach (self::get_cookie_paths() as $path) {
            self::set_cookie(self::THEME_COOKIE_NAME, $token, time() + self::THEME_TOKEN_TTL, $path, true);
        }
        $_COOKIE[self::THEME_COOKIE_NAME] = $token;
    }

    private static function clear_theme_preview_cookie(): void {
        foreach (self::get_cookie_paths() as $path) {
            self::set_cookie(self::THEME_COOKIE_NAME, '', time() - HOUR_IN_SECONDS, $path, true);
        }
        unset($_COOKIE[self::THEME_COOKIE_NAME]);
    }

    private static function get_theme_preview_token_data(): ?array {
        if (!function_exists('is_user_logged_in') || !function_exists('get_current_user_id')) {
            return null;
        }

        if (!is_user_logged_in() || !self::can_preview_themes()) {
            return null;
        }

        $token = isset($_COOKIE[self::THEME_COOKIE_NAME])
            ? sanitize_text_field(wp_unslash($_COOKIE[self::THEME_COOKIE_NAME]))
            : '';
        if (!$token || strpos($token, '.') === false) {
            return null;
        }

        [$payload, $signature] = explode('.', $token, 2);
        $expected = hash_hmac('sha256', $payload, wp_salt('auth'));
        if (!hash_equals($expected, $signature)) {
            return null;
        }

        $decoded = self::base64_url_decode($payload);
        $data = json_decode($decoded, true);
        if (!is_array($data)) {
            return null;
        }

        $user_id = absint($data['user_id'] ?? 0);
        $stylesheet = sanitize_text_field((string) ($data['stylesheet'] ?? ''));
        $template = sanitize_text_field((string) ($data['template'] ?? ''));
        $expires = absint($data['expires'] ?? 0);

        if (!$user_id || $user_id !== get_current_user_id() || !$stylesheet || !$template || $expires < time()) {
            return null;
        }

        $theme = wp_get_theme($stylesheet);
        if (!$theme->exists() || $theme->get_stylesheet() !== $stylesheet || $theme->get_template() !== $template) {
            return null;
        }

        return [
            'user_id' => $user_id,
            'stylesheet' => $stylesheet,
            'template' => $template,
            'expires' => $expires,
        ];
    }

    private static function restore_original_user() {
        $token_data = self::get_switch_token_data(false);
        if (!$token_data) {
            return new WP_Error('aligner_missing_switch_token', 'No valid switch-back session was found.', ['status' => 403]);
        }

        $original_user_id = absint($token_data['original_user_id'] ?? 0);
        if (!$original_user_id || !get_userdata($original_user_id)) {
            return new WP_Error('aligner_missing_original_user', 'Original admin user was not found.', ['status' => 404]);
        }

        self::clear_role_switch_cookie();
        wp_clear_auth_cookie();
        wp_set_current_user($original_user_id);
        wp_set_auth_cookie($original_user_id, false, is_ssl());

        return true;
    }

    private static function get_switch_back_url(): string {
        return esc_url_raw(add_query_arg('aligner_role_switch_back', '1', home_url('/')));
    }

    private static function has_valid_switch_token(bool $match_current_user = true): bool {
        return (bool) self::get_switch_token_data($match_current_user);
    }

    private static function get_switch_token_data(bool $match_current_user = true): ?array {
        $token = isset($_COOKIE[self::ROLE_COOKIE_NAME])
            ? sanitize_text_field(wp_unslash($_COOKIE[self::ROLE_COOKIE_NAME]))
            : '';

        if (!$token) {
            return null;
        }

        $data = get_transient(self::TRANSIENT_PREFIX . $token);
        if (!is_array($data)) {
            return null;
        }

        $target_user_id = absint($data['target_user_id'] ?? 0);
        if ($match_current_user && $target_user_id && $target_user_id !== get_current_user_id()) {
            return null;
        }

        return $data;
    }

    private static function set_role_switch_cookie(string $token): void {
        foreach (self::get_cookie_paths() as $path) {
            self::set_cookie(self::ROLE_COOKIE_NAME, $token, time() + self::ROLE_TOKEN_TTL, $path, true);
        }
        $_COOKIE[self::ROLE_COOKIE_NAME] = $token;
    }

    private static function clear_role_switch_cookie(): void {
        $token = isset($_COOKIE[self::ROLE_COOKIE_NAME])
            ? sanitize_text_field(wp_unslash($_COOKIE[self::ROLE_COOKIE_NAME]))
            : '';

        if ($token) {
            delete_transient(self::TRANSIENT_PREFIX . $token);
        }

        foreach (self::get_cookie_paths() as $path) {
            self::set_cookie(self::ROLE_COOKIE_NAME, '', time() - HOUR_IN_SECONDS, $path, true);
        }
        unset($_COOKIE[self::ROLE_COOKIE_NAME]);
    }

    private static function set_cookie(string $name, string $value, int $expires, string $path, bool $http_only): void {
        $domain = defined('COOKIE_DOMAIN') ? COOKIE_DOMAIN : '';
        if (PHP_VERSION_ID >= 70300) {
            setcookie($name, $value, [
                'expires' => $expires,
                'path' => $path,
                'domain' => $domain,
                'secure' => is_ssl(),
                'httponly' => $http_only,
                'samesite' => 'Lax',
            ]);
            return;
        }

        setcookie($name, $value, $expires, $path, $domain, is_ssl(), $http_only);
    }

    private static function get_cookie_paths(): array {
        $paths = ['/'];
        if (defined('COOKIEPATH') && COOKIEPATH) {
            $paths[] = COOKIEPATH;
        }
        if (defined('SITECOOKIEPATH') && SITECOOKIEPATH) {
            $paths[] = SITECOOKIEPATH;
        }
        if (defined('ADMIN_COOKIE_PATH') && ADMIN_COOKIE_PATH) {
            $paths[] = ADMIN_COOKIE_PATH;
        }
        return array_values(array_unique($paths));
    }

    private static function base64_url_encode(string $value): string {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64_url_decode(string $value): string {
        $padding = strlen($value) % 4;
        if ($padding) {
            $value .= str_repeat('=', 4 - $padding);
        }
        return base64_decode(strtr($value, '-_', '+/')) ?: '';
    }
}

Aligner_WP_Tools_Helper::init();
