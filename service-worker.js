// Aligner Service Worker
// State management and messaging for the extension

// Debounce utility to prevent excessive chrome.storage.sync writes
// Sync allows ~120 writes/minute; bursty UI updates easily exceed that.
let saveTimeout = null;
let pendingSettings = null;
let lastSyncWriteAt = 0;
let syncRetryTimeout = null;
const SYNC_DEBOUNCE_MS = 800;
const SYNC_MIN_INTERVAL_MS = 1000;

function writeSettingsToSync(settings, callback) {
  chrome.storage.sync.set({ settings }, () => {
    if (chrome.runtime.lastError) {
      const message =
        chrome.runtime.lastError.message || String(chrome.runtime.lastError);
      console.warn("[Aligner] Sync write failed:", message);

      // Keep a local mirror so settings aren't lost while quota cools down
      chrome.storage.local.set({ settings }, () => {});

      // Retry later if we hit the per-minute quota
      if (/MAX_WRITE_OPERATIONS_PER_MINUTE|quota/i.test(message)) {
        if (syncRetryTimeout) clearTimeout(syncRetryTimeout);
        syncRetryTimeout = setTimeout(() => {
          writeSettingsToSync(settings, null);
        }, 60000);
      }

      if (callback) callback({ success: false, error: message });
      return;
    }

    lastSyncWriteAt = Date.now();
    // Keep local mirror in sync for faster reads / fallback
    chrome.storage.local.set({ settings }, () => {});
    if (callback) callback({ success: true, settings });
  });
}

function debouncedSave(settings, callback) {
  pendingSettings = settings;

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  const elapsed = Date.now() - lastSyncWriteAt;
  const wait = Math.max(SYNC_DEBOUNCE_MS, SYNC_MIN_INTERVAL_MS - elapsed);

  saveTimeout = setTimeout(() => {
    const toSave = pendingSettings;
    pendingSettings = null;
    writeSettingsToSync(toSave, callback);
  }, wait);
}

const DEFAULT_SETTINGS = {
  enabled: false,
  // "currentTab" = only the tab where user toggles; "allTabs" = classic global behavior
  applyScope: "currentTab",
  rulers: {
    enabled: false,
    color: "#2563eb",
    opacity: 0.8,
    thickness: 20,
    units: "px",
    tickDensity: 10,
    originX: 0,
    originY: 0,
    showOrigin: false,
  },
  guides: {
    enabled: false,
    color: "#10b981",
    opacity: 0.7,
    thickness: 1,
    snapToPixel: true,
    locked: false,
    mode: "straight", // straight or free-draw
    defaultAngle: 0, // default angle for angled guides
  },
  grids: {
    enabled: false,
    type: "column",
    columns: 12,
    spacing: 8,
    baselineOffset: 0,
    baselineThickness: 1,
    gutter: 16,
    margins: 24,
    color: "#f59e0b",
    opacity: 0.3,
    responsive: false,
    currentBreakpoint: "desktop",
    breakpoints: {
      mobile: {
        maxWidth: 768,
        columns: 4,
        gutter: 12,
        margins: 16,
      },
      tablet: {
        maxWidth: 1024,
        columns: 8,
        gutter: 16,
        margins: 20,
      },
      desktop: {
        maxWidth: Infinity,
        columns: 12,
        gutter: 20,
        margins: 24,
      },
    },
  },
  measurement: {
    enabled: false,
    units: "px",
    snap: true,
    showDevicePixels: false,
    mode: "point", // point or rectangle
  },
  drawing: {
    enabled: false,
    tool: "line",
    arrowStyle: "simple",
    color: "#ef4444",
    opacity: 0.6,
    strokeWidth: 2,
    locked: false,
    fontSize: 16,
    fontWeight: 600,
    fontStyle: "normal",
    textDecoration: "none",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  toolbar: {
    enabled: false,
    visible: false,
    position: { x: 20, y: 20 },
    collapsed: false,
  },
  tooltips: {
    enabled: true,
    showOnboarding: true,
  },
  responsive: {
    enabled: false,
    currentDevice: null,
    customWidth: null,
    customHeight: null,
    controlsSticky: true,
  },
  inspect: {
    enabled: false,
    showBoxModel: true,
    showTypography: true,
    enableColorPicker: true,
    tooltipPosition: "auto",
  },
  mediaManager: {
    enabled: false,
    autoScan: true,
  },
  colorPicker: {
    enabled: false,
    format: "hex",
    maxHistory: 50,
    autoOpen: false,
  },
  paletteGenerator: {
    enabled: false,
    scanScope: "visible",
    includeTypes: {
      text: true,
      background: true,
      border: true,
      svg: true,
    },
    maxColors: 48,
    groupingTolerance: 8,
    ignoreTransparent: true,
    ignoreWhiteBlack: false,
    maxElementsScan: 10000,
  },
  accessibility: {
    enabled: false,
    autoScan: false,
    highlightIssues: true,
    showCritical: true,
    showSerious: true,
    showModerate: true,
    showMinor: true,
  },
  designConsistency: {
    enabled: false,
    autoScan: false,
    checkTypography: true,
    checkColors: true,
    checkSpacing: true,
    typographyTolerance: 2,
    colorTolerance: 5,
    spacingTolerance: 4,
    highlightIssues: true,
  },
  pageSpeed: {
    enabled: false,
    autoRun: false,
    showMetrics: true,
    showOpportunities: true,
    showDiagnostics: true,
  },
  designSystem: {
    enabled: false,
    autoScan: false,
    scanDepth: "visible",
    includeTypography: true,
    includeColors: true,
    includeButtons: true,
    includeInputs: true,
    maxElementsScan: 10000,
  },
  wireframeGenerator: {
    enabled: false,
    scanScope: "visible", // "visible" or "fullPage"
    includeText: true,
    textMode: "bars", // "bars", "lines", "keepText"
    borderStyle: "medium", // "thin", "medium", "thick"
    density: "medium", // "low", "medium", "high"
    ignoreSmallElements: true,
    minElementSize: 8, // pixels
    groupInlineElements: true,
    maxElements: 1500,
    includePlaceholders: true, // for images/videos
    backgroundColor: "#ffffff",
    blockColor: "#e5e7eb",
    borderColor: "#9ca3af",
    textBarColor: "#d1d5db",
  },
  cacheCleaner: {
    enabled: false,
    autoReload: true, // Reload page after clearing
    showFloatingButton: false, // Show floating quick-access button
    dataTypes: {
      cache: true,
      cacheStorage: true,
      cookies: true,
      fileSystems: true,
      indexedDB: true,
      localStorage: true,
      pluginData: false, // Often restricted
      serviceWorkers: true,
      webSQL: false, // Deprecated
    },
  },
  pageLoadTimer: {
    enabled: false,
    autoShow: false, // Automatically show panel after page load
    showFloatingButton: false, // Show floating metrics button
    historyLimit: 10, // Number of historical measurements to keep
    showMetrics: {
      domContentLoaded: true,
      windowLoad: true,
      firstPaint: true,
      firstContentfulPaint: true,
      largestContentfulPaint: true,
      timeToInteractive: true,
    },
  },
  pageControls: {
    enabled: false,
    disabledItems: {
      javascript: false,
      css: false,
      images: false,
      videos: false,
      audio: false,
      iframes: false,
      links: false,
      forms: false,
      animations: false,
      customFonts: false,
      backgroundImages: false,
      cookies: false,
      notifications: false,
      popups: false,
      trackpadNavigation: false,
      csp: false,
      extensions: false,
    },
    showFloatingButton: false,
    showStatusBadge: true,
    previouslyActiveExtensions: [], // legacy; restore list now lives in chrome.storage.local
  },
  wordpressTools: {
    enabled: false,
    showFloatingBar: true,
    rememberAdminBarHidden: true,
    tools: {
      adminBarToggle: true,
      adminSwitcher: true,
      pageEditor: true,
      roleSwitcher: true,
      themeSwitcher: true,
      acfTools: true,
      themePluginDetector: true,
      updateBacklog: true,
      adminMenuSearch: true,
      hideAdminNotices: true,
      classicCustomizer: true,
      sidebarShrink: true,
    },
  },
  // Presentation-only: hide groups from popup without clearing feature settings
  ui: {
    popupGroups: {
      layout: true, // rulers, guides, grids, measure, drawing
      inspect: true, // inspect, responsive, wireframe
      colorMedia: true, // color picker, palette, media
      quality: true, // a11y, design check, page speed, design system
      utilities: true, // cache, load timer, page controls
      wordpress: true, // WP Tools + its sub-toggles
    },
  },
};

// Feature keys whose `.enabled` flag is toggled from the popup / shortcuts
const FEATURE_ENABLE_KEYS = [
  "rulers",
  "guides",
  "grids",
  "measurement",
  "drawing",
  "toolbar",
  "responsive",
  "inspect",
  "mediaManager",
  "colorPicker",
  "paletteGenerator",
  "accessibility",
  "designConsistency",
  "pageSpeed",
  "designSystem",
  "wireframeGenerator",
  "cacheCleaner",
  "pageLoadTimer",
  "pageControls",
  "wordpressTools",
];

const TAB_OVERRIDES_STORAGE_KEY = "alignerTabOverrides";
const DISABLED_EXTENSIONS_STORAGE_KEY = "alignerTemporarilyDisabledExtensions";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeWithDefaults(stored) {
  const settings = deepClone(DEFAULT_SETTINGS);
  if (!stored || typeof stored !== "object") {
    return settings;
  }

  Object.keys(stored).forEach((key) => {
    if (
      stored[key] &&
      typeof stored[key] === "object" &&
      !Array.isArray(stored[key]) &&
      settings[key] &&
      typeof settings[key] === "object" &&
      !Array.isArray(settings[key])
    ) {
      settings[key] = { ...settings[key], ...stored[key] };
      // Keep nested feature maps complete (WP tools, pageControls items, etc.)
      if (
        settings[key].tools &&
        typeof settings[key].tools === "object" &&
        stored[key].tools &&
        typeof stored[key].tools === "object"
      ) {
        settings[key].tools = {
          ...settings[key].tools,
          ...stored[key].tools,
        };
      }
      if (
        settings[key].disabledItems &&
        typeof settings[key].disabledItems === "object" &&
        stored[key].disabledItems &&
        typeof stored[key].disabledItems === "object"
      ) {
        settings[key].disabledItems = {
          ...settings[key].disabledItems,
          ...stored[key].disabledItems,
        };
      }
      if (
        settings[key].popupGroups &&
        typeof settings[key].popupGroups === "object" &&
        stored[key].popupGroups &&
        typeof stored[key].popupGroups === "object"
      ) {
        settings[key].popupGroups = {
          ...settings[key].popupGroups,
          ...stored[key].popupGroups,
        };
      }
    } else {
      settings[key] = stored[key];
    }
  });

  if (settings.applyScope !== "allTabs") {
    settings.applyScope = "currentTab";
  }

  return settings;
}

function extractFeatureEnableMap(settings) {
  const features = {};
  FEATURE_ENABLE_KEYS.forEach((key) => {
    if (settings[key] && typeof settings[key].enabled === "boolean") {
      features[key] = settings[key].enabled;
    }
  });
  return features;
}

function applyActivationFlags(settings, enabled, features) {
  const next = deepClone(settings);
  next.enabled = Boolean(enabled);
  FEATURE_ENABLE_KEYS.forEach((key) => {
    if (next[key] && typeof next[key] === "object") {
      next[key].enabled = Boolean(features?.[key]);
    }
  });
  return next;
}

async function getStoredSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["settings"], (result) => {
      if (chrome.runtime.lastError) {
        console.error(
          "[Aligner] Error getting settings:",
          chrome.runtime.lastError,
        );
        // Fallback to local mirror if sync is unavailable / mid-quota
        chrome.storage.local.get(["settings"], (localResult) => {
          resolve(mergeWithDefaults(localResult.settings));
        });
        return;
      }
      if (result.settings) {
        resolve(mergeWithDefaults(result.settings));
        return;
      }
      chrome.storage.local.get(["settings"], (localResult) => {
        resolve(mergeWithDefaults(localResult.settings));
      });
    });
  });
}

async function getTabOverrides() {
  return new Promise((resolve) => {
    chrome.storage.session.get([TAB_OVERRIDES_STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        console.warn(
          "[Aligner] session storage unavailable, using memory fallback:",
          chrome.runtime.lastError,
        );
        resolve(globalThis.__alignerTabOverrides || {});
        return;
      }
      resolve(result[TAB_OVERRIDES_STORAGE_KEY] || {});
    });
  });
}

async function setTabOverrides(overrides) {
  globalThis.__alignerTabOverrides = overrides;
  return new Promise((resolve) => {
    chrome.storage.session.set(
      { [TAB_OVERRIDES_STORAGE_KEY]: overrides },
      () => {
        if (chrome.runtime.lastError) {
          console.warn(
            "[Aligner] Failed to persist tab overrides:",
            chrome.runtime.lastError,
          );
        }
        resolve();
      },
    );
  });
}

async function getTabOverride(tabId) {
  if (tabId == null) return null;
  const overrides = await getTabOverrides();
  return overrides[String(tabId)] || null;
}

async function setTabOverride(tabId, override) {
  if (tabId == null) return;
  const overrides = await getTabOverrides();
  overrides[String(tabId)] = {
    enabled: Boolean(override.enabled),
    features: override.features || {},
  };
  await setTabOverrides(overrides);
}

async function clearTabOverride(tabId) {
  if (tabId == null) return;
  const overrides = await getTabOverrides();
  delete overrides[String(tabId)];
  await setTabOverrides(overrides);
}

async function getMergedSettingsForTab(tabId) {
  const base = await getStoredSettings();

  if (base.applyScope !== "currentTab" || tabId == null) {
    return base;
  }

  const override = await getTabOverride(tabId);
  return applyActivationFlags(
    base,
    override?.enabled ?? false,
    override?.features || {},
  );
}

async function notifyTabsSettings(tabIds = null) {
  const tabs =
    tabIds == null
      ? await chrome.tabs.query({})
      : (
          await Promise.all(
            tabIds.map((id) =>
              chrome.tabs.get(id).catch(() => null),
            ),
          )
        ).filter(Boolean);

  await Promise.all(
    tabs.map(async (tab) => {
      if (!tab?.id) return;
      const settings = await getMergedSettingsForTab(tab.id);
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: "settingsUpdated",
          settings,
        });
      } catch (_) {
        // Tab may not have a content script
      }
    }),
  );
}

async function getTemporarilyDisabledExtensions() {
  return new Promise((resolve) => {
    chrome.storage.local.get([DISABLED_EXTENSIONS_STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        resolve({ ids: [], names: {} });
        return;
      }
      const stored = result[DISABLED_EXTENSIONS_STORAGE_KEY];
      if (!stored || !Array.isArray(stored.ids)) {
        resolve({ ids: [], names: {} });
        return;
      }
      resolve({
        ids: stored.ids,
        names: stored.names || {},
      });
    });
  });
}

async function setTemporarilyDisabledExtensions(payload) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { [DISABLED_EXTENSIONS_STORAGE_KEY]: payload },
      () => resolve(),
    );
  });
}

// Built-in profile templates
const BUILT_IN_TEMPLATES = {
  designer: {
    enabled: true,
    rulers: {
      enabled: true,
      color: "#6b7280",
      opacity: 0.8,
      thickness: 20,
      units: "px",
      tickDensity: 10,
    },
    guides: {
      enabled: false,
      color: "#10b981",
      opacity: 0.7,
      thickness: 1,
      snapToPixel: true,
      locked: false,
    },
    grids: {
      enabled: true,
      type: "column",
      columns: 12,
      spacing: 8,
      baselineOffset: 0,
      baselineThickness: 1,
      gutter: 16,
      margins: 24,
      color: "#ec4899",
      opacity: 0.2,
    },
    measurement: {
      enabled: false,
      units: "px",
      snap: true,
      showDevicePixels: false,
    },
    drawing: {
      enabled: false,
      tool: "line",
      arrowStyle: "simple",
      color: "#ef4444",
      opacity: 0.6,
      strokeWidth: 2,
      locked: false,
      fontSize: 16,
      fontWeight: 600,
      fontStyle: "normal",
      textDecoration: "none",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    toolbar: {
      enabled: false,
      visible: false,
      position: { x: 20, y: 20 },
      collapsed: false,
    },
    tooltips: {
      enabled: true,
      showOnboarding: false,
    },
    responsive: {
      enabled: false,
      breakpoints: [
        { name: "Mobile", width: 320, color: "#ef4444" },
        { name: "Tablet", width: 768, color: "#f59e0b" },
        { name: "Desktop", width: 1024, color: "#10b981" },
        { name: "Wide", width: 1440, color: "#3b82f6" },
      ],
      opacity: 0.6,
      showLabels: true,
    },
    inspect: {
      enabled: false,
      showBoxModel: true,
      showTypography: true,
      enableColorPicker: true,
      tooltipPosition: "auto",
    },
    accessibility: {
      enabled: false,
      autoScan: false,
      highlightIssues: true,
      showCritical: true,
      showSerious: true,
      showModerate: true,
      showMinor: true,
    },
    designConsistency: {
      enabled: false,
      autoScan: false,
      checkTypography: true,
      checkColors: true,
      checkSpacing: true,
      typographyTolerance: 2,
      colorTolerance: 5,
      spacingTolerance: 4,
      highlightIssues: true,
    },
    pageSpeed: {
      enabled: false,
      autoRun: false,
      showMetrics: true,
      showOpportunities: true,
      showDiagnostics: true,
    },
  },
  developer: {
    enabled: true,
    rulers: {
      enabled: true,
      color: "#3b82f6",
      opacity: 0.7,
      thickness: 20,
      units: "px",
      tickDensity: 10,
    },
    guides: {
      enabled: true,
      color: "#10b981",
      opacity: 0.6,
      thickness: 1,
      snapToPixel: true,
      locked: false,
    },
    grids: {
      enabled: true,
      type: "baseline",
      columns: 12,
      spacing: 8,
      baselineOffset: 0,
      baselineThickness: 1,
      gutter: 16,
      margins: 24,
      color: "#8b5cf6",
      opacity: 0.15,
    },
    measurement: {
      enabled: true,
      units: "px",
      snap: true,
      showDevicePixels: false,
    },
    drawing: {
      enabled: false,
      tool: "line",
      arrowStyle: "simple",
      color: "#ef4444",
      opacity: 0.6,
      strokeWidth: 2,
      locked: false,
      fontSize: 16,
      fontWeight: 600,
      fontStyle: "normal",
      textDecoration: "none",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    toolbar: {
      enabled: false,
      visible: false,
      position: { x: 20, y: 20 },
      collapsed: false,
    },
    tooltips: {
      enabled: true,
      showOnboarding: false,
    },
    responsive: {
      enabled: false,
      breakpoints: [
        { name: "Mobile", width: 320, color: "#ef4444" },
        { name: "Tablet", width: 768, color: "#f59e0b" },
        { name: "Desktop", width: 1024, color: "#10b981" },
        { name: "Wide", width: 1440, color: "#3b82f6" },
      ],
      opacity: 0.6,
      showLabels: true,
    },
    inspect: {
      enabled: false,
      showBoxModel: true,
      showTypography: true,
      enableColorPicker: true,
      tooltipPosition: "auto",
    },
    accessibility: {
      enabled: false,
      autoScan: false,
      highlightIssues: true,
      showCritical: true,
      showSerious: true,
      showModerate: true,
      showMinor: true,
    },
    designConsistency: {
      enabled: false,
      autoScan: false,
      checkTypography: true,
      checkColors: true,
      checkSpacing: true,
      typographyTolerance: 2,
      colorTolerance: 5,
      spacingTolerance: 4,
      highlightIssues: true,
    },
    pageSpeed: {
      enabled: false,
      autoRun: false,
      showMetrics: true,
      showOpportunities: true,
      showDiagnostics: true,
    },
  },
  review: {
    enabled: true,
    rulers: {
      enabled: false,
      color: "#2563eb",
      opacity: 0.8,
      thickness: 20,
      units: "px",
      tickDensity: 10,
    },
    guides: {
      enabled: true,
      color: "#f59e0b",
      opacity: 0.7,
      thickness: 1,
      snapToPixel: true,
      locked: false,
    },
    grids: {
      enabled: false,
      type: "column",
      columns: 12,
      spacing: 8,
      baselineOffset: 0,
      baselineThickness: 1,
      gutter: 16,
      margins: 24,
      color: "#f59e0b",
      opacity: 0.3,
    },
    measurement: {
      enabled: true,
      units: "px",
      snap: true,
      showDevicePixels: false,
    },
    drawing: {
      enabled: true,
      tool: "line",
      arrowStyle: "simple",
      color: "#ef4444",
      opacity: 0.8,
      strokeWidth: 2,
      locked: false,
      fontSize: 16,
      fontWeight: 600,
      fontStyle: "normal",
      textDecoration: "none",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    toolbar: {
      enabled: false,
      visible: false,
      position: { x: 20, y: 20 },
      collapsed: false,
    },
    tooltips: {
      enabled: true,
      showOnboarding: false,
    },
    responsive: {
      enabled: false,
      breakpoints: [
        { name: "Mobile", width: 320, color: "#ef4444" },
        { name: "Tablet", width: 768, color: "#f59e0b" },
        { name: "Desktop", width: 1024, color: "#10b981" },
        { name: "Wide", width: 1440, color: "#3b82f6" },
      ],
      opacity: 0.6,
      showLabels: true,
    },
    inspect: {
      enabled: false,
      showBoxModel: true,
      showTypography: true,
      enableColorPicker: true,
      tooltipPosition: "auto",
    },
    accessibility: {
      enabled: false,
      autoScan: false,
      highlightIssues: true,
      showCritical: true,
      showSerious: true,
      showModerate: true,
      showMinor: true,
    },
    designConsistency: {
      enabled: false,
      autoScan: false,
      checkTypography: true,
      checkColors: true,
      checkSpacing: true,
      typographyTolerance: 2,
      colorTolerance: 5,
      spacingTolerance: 4,
      highlightIssues: true,
    },
    pageSpeed: {
      enabled: false,
      autoRun: false,
      showMetrics: true,
      showOpportunities: true,
      showDiagnostics: true,
    },
  },
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    if (details.reason === "install") {
      await chrome.storage.sync.set({ settings: deepClone(DEFAULT_SETTINGS) });
      await chrome.storage.local.set({ settings: deepClone(DEFAULT_SETTINGS) });
      console.log("[Aligner] Extension installed and initialized");
      chrome.tabs.create({
        url: chrome.runtime.getURL("welcome/welcome.html"),
      });
      return;
    }

    // On update: merge defaults so new keys (like ui.popupGroups) appear
    // without wiping the user's existing feature settings.
    const stored = await getStoredSettings();
    const merged = mergeWithDefaults(stored);
    await new Promise((resolve) => {
      debouncedSave(merged, () => resolve());
    });
    console.log("[Aligner] Extension updated; settings merged with defaults");
  } catch (error) {
    console.error("[Aligner] onInstalled failed:", error);
  }
});

// On service worker wake, push merged settings so old global overlays clear
chrome.runtime.onStartup?.addListener?.(() => {
  notifyTabsSettings(null).catch(() => {});
});

// Also notify shortly after SW loads (covers extension reload during session)
setTimeout(() => {
  notifyTabsSettings(null).catch(() => {});
}, 500);

// Load built-in template
async function handleLoadBuiltInTemplate(templateName) {
  try {
    if (!BUILT_IN_TEMPLATES[templateName]) {
      console.error("[Aligner] Unknown template:", templateName);
      return { success: false, error: "Template not found" };
    }

    const templateSettings = BUILT_IN_TEMPLATES[templateName];
    console.log(`[Aligner] Loading built-in template: ${templateName}`);

    return new Promise((resolve) => {
      debouncedSave(templateSettings, (result) => {
        if (result.success) {
          console.log(`[Aligner] Template ${templateName} loaded successfully`);
        }
        resolve(result);
      });
    });
  } catch (error) {
    console.error("[Aligner] Error loading template:", error);
    return { success: false, error: error.message };
  }
}

// Inject Lottie hooks into MAIN world (bypasses CSP inline script restrictions)
async function injectLottieHooks(tabId) {
  try {
    // Check if the tab URL is valid for script injection
    const tab = await chrome.tabs.get(tabId);
    const url = tab.url || "";

    // Cannot inject into chrome:// pages, extension pages, or browser internal pages
    if (
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("about:") ||
      url.startsWith("edge://") ||
      url.startsWith("view-source:") ||
      url.startsWith("devtools://") ||
      !url
    ) {
      return {
        success: false,
        error: "Cannot inject into restricted pages",
        skipped: true,
      };
    }

    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      world: "MAIN",
      files: ["lottie-hooks.js"],
      injectImmediately: true,
    });
    console.log("[Aligner] Lottie hooks injected into tab", tabId);
    return { success: true };
  } catch (error) {
    console.error("[Aligner] Failed to inject Lottie hooks:", error);
    return { success: false, error: error.message };
  }
}

// Inject axe-core into MAIN world (bypasses CSP restrictions)
async function injectAxeCore(tabId) {
  try {
    // Check if the tab URL is valid for script injection
    const tab = await chrome.tabs.get(tabId);
    const url = tab.url || "";

    // Cannot inject into chrome:// pages, extension pages, or browser internal pages
    if (
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("about:") ||
      url.startsWith("edge://") ||
      url.startsWith("view-source:") ||
      !url
    ) {
      return {
        success: false,
        error: "Cannot inject into restricted pages",
        skipped: true,
      };
    }

    console.log("[Aligner] Fetching axe-core from CDN...");

    // Fetch axe-core from CDN (service workers can make external requests)
    const response = await fetch(
      "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js",
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const axeCode = await response.text();
    console.log(
      "[Aligner] Axe-core fetched, size:",
      Math.round(axeCode.length / 1024),
      "KB",
    );

    // Inject the code into the MAIN world (bypasses CSP)
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: false },
      world: "MAIN",
      func: (code) => {
        // Execute axe-core code in MAIN world
        eval(code);
      },
      args: [axeCode],
    });

    console.log("[Aligner] Axe-core injected into tab", tabId);
    return { success: true };
  } catch (error) {
    console.error("[Aligner] Failed to inject axe-core:", error);
    return { success: false, error: error.message };
  }
}

// Run axe accessibility audit in MAIN world
async function runAxeAudit(tabId) {
  try {
    // Check if the tab URL is valid for script injection
    const tab = await chrome.tabs.get(tabId);
    const url = tab.url || "";

    // Cannot run audit on chrome:// pages, extension pages, or browser internal pages
    if (
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("about:") ||
      url.startsWith("edge://") ||
      url.startsWith("view-source:") ||
      !url
    ) {
      console.log(
        "[Aligner] Skipping accessibility audit for restricted URL:",
        url,
      );
      return {
        success: false,
        error: "Cannot run audit on restricted pages",
        skipped: true,
      };
    }

    console.log("[Aligner] Starting accessibility audit for tab", tabId);

    // First, ensure axe-core is loaded
    const injectionResult = await injectAxeCore(tabId);
    if (!injectionResult.success) {
      throw new Error(injectionResult.error || "Failed to inject axe-core");
    }

    // Wait a bit for axe-core to initialize
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Run the audit in MAIN world and get results
    const results = await chrome.scripting.executeScript({
      target: { tabId, allFrames: false },
      world: "MAIN",
      func: async () => {
        // This runs in MAIN world where axe is available
        if (typeof window.axe === "undefined") {
          throw new Error("Axe-core not loaded in page context");
        }

        // Run axe audit
        const auditResults = await window.axe.run(document, {
          resultTypes: ["violations", "passes", "incomplete"],
          runOnly: {
            type: "tag",
            values: [
              "wcag2a",
              "wcag2aa",
              "wcag21a",
              "wcag21aa",
              "best-practice",
            ],
          },
        });

        return auditResults;
      },
    });

    // Extract results from executeScript response
    if (!results || !results[0] || !results[0].result) {
      throw new Error("No results returned from audit");
    }

    const auditResults = results[0].result;
    console.log(
      "[Aligner] Audit completed:",
      auditResults.violations.length,
      "violations,",
      auditResults.passes.length,
      "passes",
    );

    return { success: true, results: auditResults };
  } catch (error) {
    console.error("[Aligner] Failed to run accessibility audit:", error);
    return { success: false, error: error.message };
  }
}

// Handle clearing browsing data for a specific origin
async function handleClearBrowsingData(origin, dataTypes) {
  try {
    if (!origin) {
      return { success: false, error: "No origin provided" };
    }

    // Build removal options for the specific origin
    const removalOptions = { origins: [origin] };

    // Build data to remove based on selected types
    const dataToRemove = {};
    if (dataTypes.cache) dataToRemove.cache = true;
    if (dataTypes.cacheStorage) dataToRemove.cacheStorage = true;
    if (dataTypes.cookies) dataToRemove.cookies = true;
    if (dataTypes.fileSystems) dataToRemove.fileSystems = true;
    if (dataTypes.indexedDB) dataToRemove.indexedDB = true;
    if (dataTypes.localStorage) dataToRemove.localStorage = true;
    if (dataTypes.pluginData) dataToRemove.pluginData = true;
    if (dataTypes.serviceWorkers) dataToRemove.serviceWorkers = true;
    if (dataTypes.webSQL) dataToRemove.webSQL = true;

    // Clear browsing data
    await chrome.browsingData.remove(removalOptions, dataToRemove);

    return {
      success: true,
      message: "Cache cleared successfully",
      clearedTypes: Object.keys(dataToRemove),
    };
  } catch (error) {
    console.error("[Aligner] Failed to clear browsing data:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// FAKE FILLER CONTEXT MENU
// ==========================================

let fakeFillerMenusCreated = false;

// Create context menus for Fake Filler
function createFakeFillerMenus() {
  if (fakeFillerMenusCreated) {
    console.log("[Aligner] Fake Filler menus already created, skipping");
    return;
  }

  try {
    // Remove existing menus first to prevent duplicates
    chrome.contextMenus.removeAll(() => {
      // Parent menu item
      chrome.contextMenus.create({
        id: "aligner-fake-filler",
        title: "㊣ Aligner Fake Filler",
        contexts: ["editable"],
      });

      // Show Fake Card Data (Always shows credit card info)
      chrome.contextMenus.create({
        id: "aligner-show-card-data",
        parentId: "aligner-fake-filler",
        title: "💳 Show Fake Card Data",
        contexts: ["editable"],
      });

      // Show Fake Data (Detects field type and shows appropriate data)
      chrome.contextMenus.create({
        id: "aligner-show-field-data",
        parentId: "aligner-fake-filler",
        title: "📋 Show Fake Data",
        contexts: ["editable"],
      });

      // Generate Lorem Ipsum
      chrome.contextMenus.create({
        id: "aligner-lorem-ipsum",
        parentId: "aligner-fake-filler",
        title: "📝 Generate Lorem Ipsum",
        contexts: ["editable"],
      });

      // Fill This Field
      chrome.contextMenus.create({
        id: "aligner-fill-field",
        parentId: "aligner-fake-filler",
        title: "Fill This Field",
        contexts: ["editable"],
      });

      // Fill Entire Form
      chrome.contextMenus.create({
        id: "aligner-fill-form",
        parentId: "aligner-fake-filler",
        title: "Fill Entire Form",
        contexts: ["editable"],
      });

      // Clear Form
      chrome.contextMenus.create({
        id: "aligner-clear-form",
        parentId: "aligner-fake-filler",
        title: "Clear Form",
        contexts: ["editable"],
      });

      fakeFillerMenusCreated = true;
      console.log("[Aligner] Fake Filler context menus created");
    });
  } catch (error) {
    console.error("[Aligner] Error creating context menus:", error);
    fakeFillerMenusCreated = false;
  }
}

// Remove context menus for Fake Filler
function removeFakeFillerMenus() {
  if (!fakeFillerMenusCreated) return;

  try {
    chrome.contextMenus.removeAll(() => {
      if (chrome.runtime.lastError) {
        console.log("[Aligner] Context menus already removed");
      } else {
        console.log("[Aligner] Fake Filler context menus removed");
      }
      fakeFillerMenusCreated = false;
    });
  } catch (error) {
    console.error("[Aligner] Error removing context menus:", error);
    fakeFillerMenusCreated = false;
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  switch (info.menuItemId) {
    case "aligner-show-card-data":
      chrome.tabs.sendMessage(tab.id, {
        type: "fakeFillerAction",
        action: "showCardData",
      });
      break;

    case "aligner-show-field-data":
      chrome.tabs.sendMessage(tab.id, {
        type: "fakeFillerAction",
        action: "showFieldData",
      });
      break;

    case "aligner-lorem-ipsum":
      chrome.tabs.sendMessage(tab.id, {
        type: "loremIpsum",
        wordCount: 50, // Default word count
      });
      break;

    case "aligner-fill-field":
      chrome.tabs.sendMessage(tab.id, {
        type: "fakeFillerAction",
        action: "fillField",
      });
      break;

    case "aligner-fill-form":
      chrome.tabs.sendMessage(tab.id, {
        type: "fakeFillerAction",
        action: "fillForm",
      });
      break;

    case "aligner-clear-form":
      chrome.tabs.sendMessage(tab.id, {
        type: "fakeFillerAction",
        action: "clearForm",
      });
      break;
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!sender.id || sender.id !== chrome.runtime.id) {
    return;
  }

  if (!message.type) {
    return;
  }

  switch (message.type) {
    case "getSettings":
      handleGetSettings(message.tabId ?? sender.tab?.id).then(sendResponse);
      return true;

    case "updateSettings":
      handleUpdateSettings(
        message.settings,
        message.tabId ?? sender.tab?.id,
        message.notifyMode,
      ).then(sendResponse);
      return true;

    case "setApplyScope":
      handleSetApplyScope(
        message.applyScope,
        message.tabId ?? sender.tab?.id,
      ).then(sendResponse);
      return true;

    case "listManagedExtensions":
      handleListManagedExtensions().then(sendResponse);
      return true;

    case "setManagedExtensionEnabled":
      handleSetManagedExtensionEnabled(
        message.extensionId,
        message.enabled,
      ).then(sendResponse);
      return true;

    case "injectLottieHooks":
      // Content script requests Lottie hook injection
      if (sender.tab?.id) {
        injectLottieHooks(sender.tab.id).then(sendResponse);
      } else {
        sendResponse({ success: false, error: "No tab ID" });
      }
      return true;

    case "injectAxeCore":
      // Content script requests axe-core injection
      if (sender.tab?.id) {
        injectAxeCore(sender.tab.id).then(sendResponse);
      } else {
        sendResponse({ success: false, error: "No tab ID" });
      }
      return true;

    case "runAxeAudit":
      // Content script requests to run accessibility audit
      if (sender.tab?.id) {
        runAxeAudit(sender.tab.id).then(sendResponse);
      } else {
        sendResponse({ success: false, error: "No tab ID" });
      }
      return true;

    case "toggleExtension":
      handleToggleExtension(message.tabId ?? sender.tab?.id).then(sendResponse);
      return true;

    case "captureWireframe":
      // Capture visible tab for wireframe export
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.captureVisibleTab(
            tabs[0].windowId,
            { format: "png" },
            (dataUrl) => {
              if (chrome.runtime.lastError) {
                sendResponse({
                  success: false,
                  error: chrome.runtime.lastError.message,
                });
              } else {
                sendResponse({ success: true, dataUrl });
              }
            },
          );
        } else {
          sendResponse({ success: false, error: "No active tab" });
        }
      });
      return true;

    case "toggleFeature":
      handleToggleFeature(
        message.feature,
        message.tabId ?? sender.tab?.id,
      ).then(sendResponse);
      return true;

    case "savePreset":
      handleSavePreset(message.preset).then(sendResponse);
      return true;

    case "loadPreset":
      handleLoadPreset(message.presetName).then(sendResponse);
      return true;

    case "loadBuiltInTemplate":
      handleLoadBuiltInTemplate(message.templateName).then(sendResponse);
      return true;

    case "fetchImageForColorPicking":
      handleFetchImageForColorPicking(message.imageUrl).then(sendResponse);
      return true;

    case "fetchWpDirectoryMetadata":
      handleFetchWpDirectoryMetadata(message.kind, message.slug).then(
        sendResponse,
      );
      return true;

    case "captureVisibleTab":
      handleCaptureVisibleTab(sender.tab?.id).then(sendResponse);
      return true;

    case "clearBrowsingData":
      handleClearBrowsingData(message.origin, message.dataTypes).then(
        sendResponse,
      );
      return true;

    case "disableExtensions":
      handleDisableExtensions().then(sendResponse);
      return true;

    case "restoreExtensions":
      handleRestoreExtensions().then(sendResponse);
      return true;

    case "openExtensionsPage":
      chrome.tabs.create({ url: "chrome://extensions" }, () => {
        sendResponse({
          success: !chrome.runtime.lastError,
          error: chrome.runtime.lastError?.message,
        });
      });
      return true;

    case "blockJavaScript":
      handleBlockJavaScript(sender.tab?.id).then(sendResponse);
      return true;

    case "unblockJavaScript":
      handleUnblockJavaScript(sender.tab?.id).then(sendResponse);
      return true;

    case "injectPopupBlocker":
      handleInjectPopupBlocker(sender.tab?.id).then(sendResponse);
      return true;

    case "injectNotificationBlocker":
      handleInjectNotificationBlocker(sender.tab?.id).then(sendResponse);
      return true;

    case "injectCookieBlocker":
      handleInjectCookieBlocker(sender.tab?.id).then(sendResponse);
      return true;

    case "removeCookieBlocker":
      handleRemoveCookieBlocker(sender.tab?.id).then(sendResponse);
      return true;

    case "enableFakeFillerMenus":
      createFakeFillerMenus();
      sendResponse({ success: true });
      return true;

    case "disableFakeFillerMenus":
      removeFakeFillerMenus();
      sendResponse({ success: true });
      return true;

    default:
      console.warn("[Aligner] Unknown message type:", message.type);
  }
});

// Inject popup blocker into MAIN world
async function handleInjectPopupBlocker(tabId) {
  if (!tabId) {
    return { success: false, error: "No tab ID provided" };
  }

  try {
    const tab = await chrome.tabs.get(tabId);
    const url = tab.url || "";

    if (
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("about:") ||
      url.startsWith("edge://") ||
      url.startsWith("view-source:") ||
      !url
    ) {
      return {
        success: false,
        error: "Cannot inject into restricted pages",
        skipped: true,
      };
    }

    await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      func: () => {
        if (!window.__alignerPopupBlockerInstalled) {
          const originalOpen = window.open;
          window.open = function (...args) {
            console.log(
              "[Aligner Page Controls] Popup blocked:",
              args[0] || "(blank)",
            );
            return null;
          };
          window.__alignerPopupBlockerInstalled = true;
          console.log("[Aligner Page Controls] Popup blocker installed");
        }
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[Aligner] Failed to inject popup blocker:", error);
    return { success: false, error: error.message };
  }
}

// Inject notification blocker into MAIN world
async function handleInjectNotificationBlocker(tabId) {
  if (!tabId) {
    return { success: false, error: "No tab ID provided" };
  }

  try {
    const tab = await chrome.tabs.get(tabId);
    const url = tab.url || "";

    if (
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("about:") ||
      url.startsWith("edge://") ||
      url.startsWith("view-source:") ||
      !url
    ) {
      return {
        success: false,
        error: "Cannot inject into restricted pages",
        skipped: true,
      };
    }

    await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      func: () => {
        if (
          !window.__alignerNotificationBlockerInstalled &&
          window.Notification
        ) {
          const OriginalNotification = window.Notification;
          window.Notification = function () {
            console.log("[Aligner Page Controls] Notification blocked");
            throw new Error("Notifications are disabled by Aligner");
          };
          window.Notification.permission = "denied";
          window.Notification.requestPermission = function () {
            console.log(
              "[Aligner Page Controls] Notification permission request blocked",
            );
            return Promise.resolve("denied");
          };
          window.__alignerNotificationBlockerInstalled = true;
          console.log("[Aligner Page Controls] Notification blocker installed");
        }
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[Aligner] Failed to inject notification blocker:", error);
    return { success: false, error: error.message };
  }
}

// Inject cookie blocker into MAIN world
async function handleInjectCookieBlocker(tabId) {
  if (!tabId) {
    return { success: false, error: "No tab ID provided" };
  }

  try {
    const tab = await chrome.tabs.get(tabId);
    const url = tab.url || "";

    if (
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("about:") ||
      url.startsWith("edge://") ||
      url.startsWith("view-source:") ||
      !url
    ) {
      return {
        success: false,
        error: "Cannot inject into restricted pages",
        skipped: true,
      };
    }

    // Step 1: Block at network level using declarativeNetRequest
    // This blocks Set-Cookie headers from server (HTTP-only cookies)
    if (!cookiesBlockedTabs.has(tabId)) {
      const ruleId = COOKIE_BLOCK_RULE_BASE_ID + (tabId % 100000);

      await chrome.declarativeNetRequest.updateSessionRules({
        addRules: [
          {
            id: ruleId,
            priority: 1,
            action: {
              type: "modifyHeaders",
              responseHeaders: [
                {
                  header: "set-cookie",
                  operation: "remove",
                },
              ],
            },
            condition: {
              tabIds: [tabId],
              resourceTypes: [
                "main_frame",
                "sub_frame",
                "stylesheet",
                "script",
                "image",
                "font",
                "object",
                "xmlhttprequest",
                "ping",
                "csp_report",
                "media",
                "websocket",
                "webtransport",
                "webbundle",
                "other",
              ],
            },
          },
        ],
        removeRuleIds: [ruleId],
      });

      cookiesBlockedTabs.set(tabId, ruleId);
      console.log(
        `[Aligner] Cookie headers blocked at network level for tab ${tabId}`,
      );
    }

    // Step 2: Block at JavaScript level using script injection
    await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      injectImmediately: true,
      func: () => {
        if (!window.__alignerCookieBlockerInstalled) {
          // Block document.cookie (traditional cookie access)
          Object.defineProperty(Document.prototype, "cookie", {
            get: function () {
              console.log(
                "[Aligner Page Controls] Cookie read blocked (document.cookie)",
              );
              return "";
            },
            set: function (value) {
              console.log(
                "[Aligner Page Controls] Cookie write blocked (document.cookie):",
                value,
              );
              // Don't actually set the cookie
              return true;
            },
            configurable: false,
            enumerable: true,
          });

          // Block Cookie Store API (newer browsers)
          if (window.cookieStore) {
            const blockedCookieStore = {
              get: async () => {
                console.log(
                  "[Aligner Page Controls] cookieStore.get() blocked",
                );
                return null;
              },
              getAll: async () => {
                console.log(
                  "[Aligner Page Controls] cookieStore.getAll() blocked",
                );
                return [];
              },
              set: async () => {
                console.log(
                  "[Aligner Page Controls] cookieStore.set() blocked",
                );
                return undefined;
              },
              delete: async () => {
                console.log(
                  "[Aligner Page Controls] cookieStore.delete() blocked",
                );
                return undefined;
              },
            };

            Object.defineProperty(window, "cookieStore", {
              get: () => blockedCookieStore,
              set: () => {},
              configurable: false,
            });
          }

          // Aggressively clear ALL existing cookies immediately
          try {
            // Clear via document.cookie API
            const existingCookies = document.cookie.split(";");
            existingCookies.forEach((cookie) => {
              const eqPos = cookie.indexOf("=");
              const name =
                eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
              if (name) {
                // Try all possible deletion variations
                const domain = location.hostname;
                const paths = ["/", ""];
                const domains = [domain, `.${domain}`];

                // Also try parent domains
                const parts = domain.split(".");
                if (parts.length > 2) {
                  domains.push(`.${parts.slice(1).join(".")}`);
                }
                if (parts.length > 3) {
                  domains.push(`.${parts.slice(2).join(".")}`);
                }

                // Delete with all combinations
                paths.forEach((path) => {
                  domains.forEach((d) => {
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${d}`;
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
                  });
                });
              }
            });
          } catch (e) {
            // Ignore errors
          }

          // Also block localStorage and sessionStorage APIs (often used as cookie fallback)
          try {
            const blockedStorage = {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
              clear: () => {},
              key: () => null,
              length: 0,
            };

            Object.defineProperty(window, "localStorage", {
              get: () => blockedStorage,
              set: () => {},
              configurable: false,
            });

            Object.defineProperty(window, "sessionStorage", {
              get: () => blockedStorage,
              set: () => {},
              configurable: false,
            });

            console.log(
              "[Aligner Page Controls] localStorage and sessionStorage blocked",
            );
          } catch (e) {
            // Ignore if already blocked
          }

          window.__alignerCookieBlockerInstalled = true;
          console.log(
            "[Aligner Page Controls] Cookie blocker installed - all cookie APIs blocked",
          );
        }
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[Aligner] Failed to inject cookie blocker:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove cookie blocking for a tab
 * Removes network-level blocking rules
 * Note: JavaScript-level blocking cannot be removed without page reload
 */
async function handleRemoveCookieBlocker(tabId) {
  if (!tabId) {
    return { success: false, error: "No tab ID provided" };
  }

  try {
    // Remove network-level cookie blocking
    if (cookiesBlockedTabs.has(tabId)) {
      const ruleId = cookiesBlockedTabs.get(tabId);

      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [ruleId],
      });

      cookiesBlockedTabs.delete(tabId);
      console.log(`[Aligner] Cookie blocking removed for tab ${tabId}`);

      return { success: true, needsReload: true };
    } else {
      return { success: true, notBlocked: true };
    }
  } catch (error) {
    console.error("[Aligner] Failed to remove cookie blocker:", error);
    return { success: false, error: error.message };
  }
}

// Handle keyboard commands
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError || !tabs[0]) {
      return;
    }

    const tabId = tabs[0].id;

    switch (command) {
      case "toggle-extension":
        handleToggleExtension(tabId).then((result) => {
          if (result?.success) {
            chrome.tabs
              .sendMessage(tabId, {
                type: "settingsUpdated",
                settings: result.settings,
              })
              .catch(() => {});
          }
        });
        break;

      case "toggle-rulers":
        handleToggleFeature("rulers", tabId).then((result) => {
          if (result?.success) {
            chrome.tabs
              .sendMessage(tabId, {
                type: "settingsUpdated",
                settings: result.settings,
              })
              .catch(() => {});
          }
        });
        break;

      case "toggle-grids":
        handleToggleFeature("grids", tabId).then((result) => {
          if (result?.success) {
            chrome.tabs
              .sendMessage(tabId, {
                type: "settingsUpdated",
                settings: result.settings,
              })
              .catch(() => {});
          }
        });
        break;

      case "toggle-measurement":
        handleToggleFeature("measurement", tabId).then((result) => {
          if (result?.success) {
            chrome.tabs
              .sendMessage(tabId, {
                type: "settingsUpdated",
                settings: result.settings,
              })
              .catch(() => {});
          }
        });
        break;
    }
  });
});

// Get effective settings for a tab (respects applyScope)
async function handleGetSettings(tabId) {
  try {
    const settings = await getMergedSettingsForTab(tabId);
    return { success: true, settings };
  } catch (error) {
    console.error("[Aligner] Error getting settings:", error);
    return { success: false, settings: deepClone(DEFAULT_SETTINGS) };
  }
}

// Update settings (with debouncing to prevent quota exceeded errors)
async function handleUpdateSettings(
  newSettings,
  tabId = null,
  notifyMode = "auto",
) {
  try {
    const currentSettings = await getStoredSettings();
    const updatedSettings = { ...currentSettings };

    Object.keys(newSettings || {}).forEach((key) => {
      if (
        typeof newSettings[key] === "object" &&
        !Array.isArray(newSettings[key]) &&
        newSettings[key] !== null
      ) {
        updatedSettings[key] = {
          ...(currentSettings[key] || {}),
          ...newSettings[key],
        };
        // Deep-merge nested maps used by feature suites
        if (
          newSettings[key].tools &&
          typeof newSettings[key].tools === "object"
        ) {
          updatedSettings[key].tools = {
            ...((currentSettings[key] && currentSettings[key].tools) || {}),
            ...newSettings[key].tools,
          };
        }
        if (
          newSettings[key].disabledItems &&
          typeof newSettings[key].disabledItems === "object"
        ) {
          updatedSettings[key].disabledItems = {
            ...((currentSettings[key] &&
              currentSettings[key].disabledItems) ||
              {}),
            ...newSettings[key].disabledItems,
          };
        }
        if (
          newSettings[key].popupGroups &&
          typeof newSettings[key].popupGroups === "object"
        ) {
          updatedSettings[key].popupGroups = {
            ...((currentSettings[key] && currentSettings[key].popupGroups) ||
              {}),
            ...newSettings[key].popupGroups,
          };
        }
      } else {
        updatedSettings[key] = newSettings[key];
      }
    });

    // Never let UI saves wipe the restore list stored in sync (legacy race)
    const existingPrev =
      currentSettings.pageControls?.previouslyActiveExtensions || [];
    const incomingPrev =
      updatedSettings.pageControls?.previouslyActiveExtensions;
    if (
      updatedSettings.pageControls &&
      Array.isArray(incomingPrev) &&
      incomingPrev.length === 0 &&
      existingPrev.length > 0
    ) {
      updatedSettings.pageControls.previouslyActiveExtensions = existingPrev;
    }

    const touchesActivation =
      Object.prototype.hasOwnProperty.call(newSettings || {}, "enabled") ||
      FEATURE_ENABLE_KEYS.some(
        (k) =>
          newSettings?.[k] &&
          typeof newSettings[k].enabled === "boolean",
      );

    // In current-tab mode, activation flags live in session tab overrides only.
    // Never persist per-tab activation into sync (popup often sends full settings).
    if (updatedSettings.applyScope === "currentTab") {
      if (tabId != null && touchesActivation) {
        const override = (await getTabOverride(tabId)) || {
          enabled: false,
          features: {},
        };
        if (Object.prototype.hasOwnProperty.call(newSettings || {}, "enabled")) {
          override.enabled = Boolean(newSettings.enabled);
        }
        FEATURE_ENABLE_KEYS.forEach((key) => {
          if (
            newSettings[key] &&
            typeof newSettings[key].enabled === "boolean"
          ) {
            override.features[key] = newSettings[key].enabled;
          }
        });
        await setTabOverride(tabId, override);
      }

      updatedSettings.enabled = currentSettings.enabled;
      FEATURE_ENABLE_KEYS.forEach((key) => {
        if (updatedSettings[key] && currentSettings[key]) {
          updatedSettings[key].enabled = currentSettings[key].enabled;
        }
      });
    }

    await new Promise((resolve) => {
      debouncedSave(updatedSettings, () => resolve());
    });

    let mergedForCaller;
    if (updatedSettings.applyScope === "currentTab" && tabId != null) {
      const override = (await getTabOverride(tabId)) || {
        enabled: false,
        features: {},
      };
      mergedForCaller = applyActivationFlags(
        updatedSettings,
        override.enabled,
        override.features,
      );
    } else {
      mergedForCaller = updatedSettings;
    }

    if (notifyMode === "none") {
      // skip notify
    } else if (notifyMode === "tab" && tabId != null) {
      await notifyTabsSettings([tabId]);
    } else {
      await notifyTabsSettings(null);
    }

    return { success: true, settings: mergedForCaller };
  } catch (error) {
    console.error("[Aligner] Error updating settings:", error);
    return { success: false };
  }
}

async function handleSetApplyScope(applyScope, tabId) {
  try {
    const scope = applyScope === "allTabs" ? "allTabs" : "currentTab";
    const currentSettings = await getStoredSettings();
    const previousScope = currentSettings.applyScope || "currentTab";

    if (scope === previousScope) {
      const settings = await getMergedSettingsForTab(tabId);
      return { success: true, settings };
    }

    if (scope === "currentTab") {
      // Move current global activation into the active tab only
      if (tabId != null) {
        await setTabOverride(tabId, {
          enabled: currentSettings.enabled,
          features: extractFeatureEnableMap(currentSettings),
        });
      }
      // Clear overrides on every other tab
      const overrides = await getTabOverrides();
      Object.keys(overrides).forEach((id) => {
        if (String(id) !== String(tabId)) {
          delete overrides[id];
        }
      });
      await setTabOverrides(overrides);

      // Turn off global activation so leftover sync flags don't surprise users
      currentSettings.enabled = false;
      FEATURE_ENABLE_KEYS.forEach((key) => {
        if (currentSettings[key]) {
          currentSettings[key].enabled = false;
        }
      });
    } else {
      // allTabs: promote active tab's effective state to global
      const merged = await getMergedSettingsForTab(tabId);
      currentSettings.enabled = merged.enabled;
      FEATURE_ENABLE_KEYS.forEach((key) => {
        if (currentSettings[key] && merged[key]) {
          currentSettings[key].enabled = Boolean(merged[key].enabled);
        }
      });
      await setTabOverrides({});
    }

    currentSettings.applyScope = scope;
    await new Promise((resolve) => {
      writeSettingsToSync(currentSettings, () => resolve());
    });

    await notifyTabsSettings(null);
    const settings = await getMergedSettingsForTab(tabId);
    return { success: true, settings };
  } catch (error) {
    console.error("[Aligner] Error setting apply scope:", error);
    return { success: false, error: error.message };
  }
}

// Toggle entire extension on/off
async function handleToggleExtension(tabId) {
  try {
    const currentSettings = await getStoredSettings();

    if (currentSettings.applyScope === "currentTab") {
      if (tabId == null) {
        return { success: false, error: "No tab ID" };
      }
      const override = (await getTabOverride(tabId)) || {
        enabled: false,
        features: {},
      };
      override.enabled = !override.enabled;
      await setTabOverride(tabId, override);
      const settings = await getMergedSettingsForTab(tabId);
      return { success: true, settings };
    }

    currentSettings.enabled = !currentSettings.enabled;
    await new Promise((resolve) => {
      writeSettingsToSync(currentSettings, () => resolve());
    });
    const settings = await getMergedSettingsForTab(tabId);
    return { success: true, settings };
  } catch (error) {
    console.error("[Aligner] Error toggling extension:", error);
    return { success: false };
  }
}

// Toggle specific feature
async function handleToggleFeature(feature, tabId) {
  try {
    const currentSettings = await getStoredSettings();
    if (!currentSettings[feature]) {
      return { success: false, error: "Unknown feature" };
    }

    if (currentSettings.applyScope === "currentTab") {
      if (tabId == null) {
        return { success: false, error: "No tab ID" };
      }
      const override = (await getTabOverride(tabId)) || {
        enabled: false,
        features: {},
      };
      override.features = override.features || {};
      override.features[feature] = !Boolean(override.features[feature]);
      // Enabling a feature implies the extension is on for this tab
      if (override.features[feature]) {
        override.enabled = true;
      }
      await setTabOverride(tabId, override);
      const settings = await getMergedSettingsForTab(tabId);
      return { success: true, settings };
    }

    currentSettings[feature].enabled = !currentSettings[feature].enabled;
    await new Promise((resolve) => {
      writeSettingsToSync(currentSettings, () => resolve());
    });
    const settings = await getMergedSettingsForTab(tabId);
    return { success: true, settings };
  } catch (error) {
    console.error("[Aligner] Error toggling feature:", error);
    return { success: false };
  }
}

// Save preset for current domain
async function handleSavePreset(preset) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["presets"], (result) => {
      if (chrome.runtime.lastError) {
        console.error(
          "[Aligner] Error getting presets:",
          chrome.runtime.lastError,
        );
        resolve({ success: false });
        return;
      }

      const presets = result.presets || {};
      presets[preset.name] = {
        ...preset,
        createdAt: new Date().toISOString(),
      };

      chrome.storage.local.set({ presets }, () => {
        if (chrome.runtime.lastError) {
          console.error(
            "[Aligner] Error saving preset:",
            chrome.runtime.lastError,
          );
          resolve({ success: false });
          return;
        }
        resolve({ success: true, preset: presets[preset.name] });
      });
    });
  });
}

// Load preset
async function handleLoadPreset(presetName) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["presets"], (result) => {
      if (chrome.runtime.lastError) {
        console.error(
          "[Aligner] Error getting presets:",
          chrome.runtime.lastError,
        );
        resolve({ success: false });
        return;
      }

      const presets = result.presets || {};
      const preset = presets[presetName];

      if (!preset) {
        resolve({ success: false, error: "Preset not found" });
        return;
      }

      resolve({ success: true, preset });
    });
  });
}

// Fetch image and convert to data URL (bypasses CORS for color picking)
async function handleFetchImageForColorPicking(imageUrl) {
  try {
    // Fetch the image using extension's privileges
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Get as blob
    const blob = await response.blob();

    // Convert blob to data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          success: true,
          dataUrl: reader.result,
        });
      };
      reader.onerror = () => {
        resolve({
          success: false,
          error: "Failed to convert image to data URL",
        });
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to fetch image",
    };
  }
}

function stripWpHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeWpAssetUrl(url) {
  if (!url) return "";
  const value = String(url);
  if (value.startsWith("//")) return `https:${value}`;
  return value;
}

function pickWpImageUrl(collection) {
  if (!collection || typeof collection !== "object") return "";
  return normalizeWpAssetUrl(
    collection["2x"] ||
      collection.high ||
      collection["1x"] ||
      collection.low ||
      collection.svg ||
      Object.values(collection).find(Boolean),
  );
}

function normalizeWpAuthor(author) {
  if (!author) return "";
  if (typeof author === "string") return stripWpHtml(author);
  return stripWpHtml(
    author.display_name || author.author || author.user_nicename || "",
  );
}

async function fetchWpDirectoryJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  if (!data || data.error) {
    throw new Error(data?.error || "No directory data");
  }
  return data;
}

async function handleFetchWpDirectoryMetadata(kind, slug) {
  try {
    const safeKind = kind === "theme" ? "theme" : "plugin";
    const safeSlug = String(slug || "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
    if (!safeSlug) {
      return { success: false, error: "Missing slug" };
    }

    const encodedSlug = encodeURIComponent(safeSlug);
    const url =
      safeKind === "theme"
        ? `https://api.wordpress.org/themes/info/1.2/?action=theme_information&request%5Bslug%5D=${encodedSlug}`
        : `https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=${encodedSlug}`;
    const data = await fetchWpDirectoryJson(url);
    const sections = data.sections || {};
    const homepage =
      data.homepage ||
      data.preview_url ||
      (safeKind === "theme"
        ? `https://wordpress.org/themes/${safeSlug}/`
        : `https://wordpress.org/plugins/${safeSlug}/`);
    const screenshot =
      normalizeWpAssetUrl(data.screenshot_url) || pickWpImageUrl(data.banners);
    const icon = pickWpImageUrl(data.icons) || screenshot;

    return {
      success: true,
      kind: safeKind,
      meta: {
        slug: data.slug || safeSlug,
        name: stripWpHtml(data.name) || safeSlug,
        version: data.version || "",
        author: normalizeWpAuthor(data.author),
        description:
          stripWpHtml(data.short_description) ||
          stripWpHtml(data.description) ||
          stripWpHtml(sections.description || ""),
        homepage,
        directoryUrl:
          safeKind === "theme"
            ? `https://wordpress.org/themes/${safeSlug}/`
            : `https://wordpress.org/plugins/${safeSlug}/`,
        previewUrl: data.preview_url || "",
        icon,
        banner: pickWpImageUrl(data.banners),
        screenshot,
        rating: typeof data.rating === "number" ? data.rating : null,
        numRatings: data.num_ratings || 0,
        activeInstalls: data.active_installs || 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      kind: kind === "theme" ? "theme" : "plugin",
      slug,
    };
  }
}

// Capture visible tab for color picking (bypasses ALL CORS issues)
async function handleCaptureVisibleTab(tabId) {
  try {
    if (!tabId) {
      return { success: false, error: "No tab ID" };
    }

    // Capture the visible tab as a data URL
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: "png",
    });

    return {
      success: true,
      dataUrl: dataUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to capture tab",
    };
  }
}

// Handle disabling other extensions temporarily
async function handleDisableExtensions() {
  try {
    if (!chrome.management) {
      return {
        success: false,
        error: "Management API not available - check permissions",
      };
    }

    const currentExtensionId = chrome.runtime.id;
    const existing = await getTemporarilyDisabledExtensions();

    // Idempotent: if we already have a restore list, don't rescan (which
    // would find zero enabled extensions and wipe the list).
    if (existing.ids.length > 0) {
      // Ensure tracked extensions are still disabled
      for (const extId of existing.ids) {
        try {
          const info = await chrome.management.get(extId);
          if (info?.enabled) {
            await chrome.management.setEnabled(extId, false);
          }
        } catch (error) {
          console.warn(
            `[Aligner] Could not re-disable extension ${extId}:`,
            error,
          );
        }
      }
      return {
        success: true,
        count: existing.ids.length,
        alreadyDisabled: true,
      };
    }

    // Also migrate any legacy sync list once
    const settings = await getStoredSettings();
    const legacyIds = settings.pageControls?.previouslyActiveExtensions || [];
    if (legacyIds.length > 0) {
      await setTemporarilyDisabledExtensions({
        ids: legacyIds,
        names: {},
      });
      settings.pageControls.previouslyActiveExtensions = [];
      await new Promise((resolve) => {
        chrome.storage.sync.set({ settings }, () => resolve());
      });
      return {
        success: true,
        count: legacyIds.length,
        alreadyDisabled: true,
        migrated: true,
      };
    }

    const allExtensions = await chrome.management.getAll();
    const ids = [];
    const names = {};

    for (const ext of allExtensions) {
      if (
        ext.id !== currentExtensionId &&
        ext.enabled &&
        ext.type === "extension"
      ) {
        try {
          ids.push(ext.id);
          names[ext.id] = ext.name;
          await chrome.management.setEnabled(ext.id, false);
        } catch (error) {
          console.warn(
            `[Aligner] Could not disable extension ${ext.name}:`,
            error,
          );
        }
      }
    }

    await setTemporarilyDisabledExtensions({ ids, names });

    // Clear legacy field so UI saves can't race against it
    if (settings.pageControls) {
      settings.pageControls.previouslyActiveExtensions = [];
      await new Promise((resolve) => {
        chrome.storage.sync.set({ settings }, () => resolve());
      });
    }

    return {
      success: true,
      count: ids.length,
    };
  } catch (error) {
    console.error("[Aligner] Error in handleDisableExtensions:", error);
    return {
      success: false,
      error: error.message || "Failed to disable extensions",
    };
  }
}

// Handle restoring previously disabled extensions
async function handleRestoreExtensions() {
  try {
    if (!chrome.management) {
      return {
        success: false,
        error: "Management API not available - check permissions",
      };
    }

    let stored = await getTemporarilyDisabledExtensions();
    let ids = stored.ids || [];

    // Fallback to legacy sync list
    if (ids.length === 0) {
      const settings = await getStoredSettings();
      ids = settings.pageControls?.previouslyActiveExtensions || [];
    }

    if (ids.length === 0) {
      return { success: true, count: 0, restored: false };
    }

    let restoredCount = 0;
    for (const extId of ids) {
      try {
        await chrome.management.setEnabled(extId, true);
        restoredCount++;
      } catch (error) {
        console.warn(`[Aligner] Could not restore extension ${extId}:`, error);
      }
    }

    await setTemporarilyDisabledExtensions({ ids: [], names: {} });

    const settings = await getStoredSettings();
    if (settings.pageControls) {
      settings.pageControls.previouslyActiveExtensions = [];
      await new Promise((resolve) => {
        chrome.storage.sync.set({ settings }, () => resolve());
      });
    }

    return {
      success: true,
      count: restoredCount,
      restored: restoredCount > 0,
    };
  } catch (error) {
    console.error("[Aligner] Error in handleRestoreExtensions:", error);
    return {
      success: false,
      error: error.message || "Failed to restore extensions",
    };
  }
}

async function handleListManagedExtensions() {
  try {
    if (!chrome.management) {
      return {
        success: false,
        error: "Management API not available - check permissions",
      };
    }

    const currentExtensionId = chrome.runtime.id;
    const allExtensions = await chrome.management.getAll();
    const stored = await getTemporarilyDisabledExtensions();
    const trackedSet = new Set(stored.ids || []);

    const extensions = allExtensions
      .filter((ext) => ext.type === "extension" && ext.id !== currentExtensionId)
      .map((ext) => ({
        id: ext.id,
        name: ext.name,
        enabled: ext.enabled,
        mayDisable: ext.mayDisable !== false,
        temporarilyDisabledByAligner: trackedSet.has(ext.id),
        icons: ext.icons || [],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true,
      extensions,
      trackedCount: trackedSet.size,
      note: "Chrome does not allow extensions to pin/unpin other extensions from the toolbar. You can disable/enable them here, then restore.",
    };
  } catch (error) {
    console.error("[Aligner] Error listing extensions:", error);
    return { success: false, error: error.message };
  }
}

async function handleSetManagedExtensionEnabled(extensionId, enabled) {
  try {
    if (!chrome.management) {
      return {
        success: false,
        error: "Management API not available - check permissions",
      };
    }
    if (!extensionId || extensionId === chrome.runtime.id) {
      return { success: false, error: "Invalid extension" };
    }

    const info = await chrome.management.get(extensionId);
    const stored = await getTemporarilyDisabledExtensions();
    const ids = new Set(stored.ids || []);
    const names = { ...(stored.names || {}) };

    if (enabled) {
      await chrome.management.setEnabled(extensionId, true);
      ids.delete(extensionId);
      delete names[extensionId];
    } else {
      if (info.mayDisable === false) {
        return {
          success: false,
          error: "This extension cannot be disabled",
        };
      }
      // Track only if it was previously enabled (so restore can bring it back)
      if (info.enabled) {
        ids.add(extensionId);
        names[extensionId] = info.name;
      }
      await chrome.management.setEnabled(extensionId, false);
    }

    await setTemporarilyDisabledExtensions({
      ids: Array.from(ids),
      names,
    });

    return {
      success: true,
      extensionId,
      enabled: Boolean(enabled),
      trackedCount: ids.size,
    };
  } catch (error) {
    console.error("[Aligner] Error setting extension enabled:", error);
    return { success: false, error: error.message };
  }
}
// Track tabs with JavaScript blocked (Map of tabId -> ruleId)
const javascriptBlockedTabs = new Map();

// Track tabs with cookies blocked (Map of tabId -> ruleId)
const cookiesBlockedTabs = new Map();

// Base rule ID for JavaScript blocking (each tab gets unique ID)
const JS_BLOCK_RULE_BASE_ID = 900000;

// Base rule ID for cookie blocking (each tab gets unique ID)
const COOKIE_BLOCK_RULE_BASE_ID = 800000;

/**
 * Block JavaScript execution for a tab using declarativeNetRequest
 * Uses session-scoped rules which support tabIds
 */
async function handleBlockJavaScript(tabId) {
  if (!tabId) {
    return { success: false, error: "No tab ID provided" };
  }

  try {
    // Check if already blocked
    if (javascriptBlockedTabs.has(tabId)) {
      console.log(`[Aligner] JavaScript already blocked for tab ${tabId}`);
      return { success: true, alreadyBlocked: true };
    }

    // Generate unique rule IDs for this tab (need multiple rules for different file types)
    const ruleId1 = JS_BLOCK_RULE_BASE_ID + (tabId % 100000);
    const ruleId2 = ruleId1 + 1;
    const ruleId3 = ruleId1 + 2;

    console.log(
      `[Aligner] Blocking JavaScript for tab ${tabId} with rule IDs ${ruleId1}-${ruleId3}`,
    );

    // Add SESSION rules to block all scripts for this specific tab
    // Session rules support tabIds, dynamic rules don't!
    // Need separate rules because urlFilter doesn't support OR operator
    await chrome.declarativeNetRequest.updateSessionRules({
      addRules: [
        {
          id: ruleId1,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: "*.js",
            resourceTypes: ["script"],
            tabIds: [tabId],
          },
        },
        {
          id: ruleId2,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: "*.mjs",
            resourceTypes: ["script"],
            tabIds: [tabId],
          },
        },
        {
          id: ruleId3,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: "*.jsx",
            resourceTypes: ["script"],
            tabIds: [tabId],
          },
        },
      ],
      removeRuleIds: [ruleId1, ruleId2, ruleId3], // Remove old rules if exist
    });

    // Track this tab with its rule IDs
    javascriptBlockedTabs.set(tabId, [ruleId1, ruleId2, ruleId3]);
    console.log(`[Aligner] JavaScript blocked for tab ${tabId}`);

    return { success: true, needsReload: true };
  } catch (error) {
    console.error(
      `[Aligner] Error blocking JavaScript for tab ${tabId}:`,
      error,
    );

    return {
      success: false,
      error: error.message || "Failed to block JavaScript",
    };
  }
}

/**
 * Unblock JavaScript execution for a tab
 */
async function handleUnblockJavaScript(tabId) {
  if (!tabId) {
    return { success: false, error: "No tab ID provided" };
  }

  try {
    // Check if blocked
    if (!javascriptBlockedTabs.has(tabId)) {
      console.log(`[Aligner] JavaScript not blocked for tab ${tabId}`);
      return { success: true, notBlocked: true };
    }

    // Get the rule IDs for this tab
    const ruleIds = javascriptBlockedTabs.get(tabId);

    // Remove the blocking rules from session rules
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: ruleIds,
    });

    // Remove from tracking
    javascriptBlockedTabs.delete(tabId);
    console.log(`[Aligner] JavaScript unblocked for tab ${tabId}`);

    return { success: true, needsReload: true };
  } catch (error) {
    console.error(
      `[Aligner] Error unblocking JavaScript for tab ${tabId}:`,
      error,
    );

    // Clean up tracking even on error
    javascriptBlockedTabs.delete(tabId);

    return {
      success: false,
      error: error.message || "Failed to unblock JavaScript",
    };
  }
}

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  // Drop per-tab overlay activation
  clearTabOverride(tabId).catch(() => {});

  // Clean up JavaScript blocking
  if (javascriptBlockedTabs.has(tabId)) {
    const ruleIds = javascriptBlockedTabs.get(tabId);
    console.log(
      `[Aligner] Cleaning up JavaScript blocking for closed tab ${tabId}`,
    );
    // Remove the rules
    chrome.declarativeNetRequest
      .updateSessionRules({
        removeRuleIds: ruleIds,
      })
      .catch((error) => {
        console.warn(`[Aligner] Error cleaning up JS rules ${ruleIds}:`, error);
      });
    javascriptBlockedTabs.delete(tabId);
  }

  // Clean up cookie blocking
  if (cookiesBlockedTabs.has(tabId)) {
    const ruleId = cookiesBlockedTabs.get(tabId);
    console.log(
      `[Aligner] Cleaning up cookie blocking for closed tab ${tabId}`,
    );
    // Remove the rule
    chrome.declarativeNetRequest
      .updateSessionRules({
        removeRuleIds: [ruleId],
      })
      .catch((error) => {
        console.warn(
          `[Aligner] Error cleaning up cookie rule ${ruleId}:`,
          error,
        );
      });
    cookiesBlockedTabs.delete(tabId);
  }
});
