const WORKSPACE_PRESETS = {
  all: {
    layout: true,
    inspect: true,
    colorMedia: true,
    quality: true,
    utilities: true,
    wordpress: true,
  },
  designer: {
    layout: true,
    inspect: true,
    colorMedia: true,
    quality: false,
    utilities: false,
    wordpress: false,
  },
  wordpress: {
    layout: false,
    inspect: false,
    colorMedia: false,
    quality: false,
    utilities: true,
    wordpress: true,
  },
  qa: {
    layout: false,
    inspect: true,
    colorMedia: false,
    quality: true,
    utilities: true,
    wordpress: false,
  },
  minimal: {
    layout: true,
    inspect: true,
    colorMedia: false,
    quality: false,
    utilities: false,
    wordpress: false,
  },
};

/** Product screenshots shipped in assets/screenshots/ (user-provided CleanShot set). */
const SCREENSHOT_SLOTS = [
  { file: "23-aligner-home.png", caption: "Aligner Home — welcome dashboard & tool guide" },
  { file: "24-aligner-settings.png", caption: "Aligner Settings — workspace & per-tool controls" },
  { file: "01-popup-overview.png", caption: "WP Tools — quick actions, theme & plugin detection" },
  { file: "02-rulers.png", caption: "Rulers — pixel rulers over the live page" },
  { file: "03-guides.png", caption: "Guides — alignment lines with rulers" },
  { file: "04-grids.png", caption: "Grids — column overlays with rulers & guides" },
  { file: "05-measure.png", caption: "Measure — distance, delta, and angle" },
  { file: "06-drawing.png", caption: "Measure — rectangle width, height, and area" },
  { file: "07-layout-controls.png", caption: "Settings — measurement, ruler, and grid controls" },
  { file: "08-tools-grid.png", caption: "Drawing — lines, shapes, arrows, and text" },
  { file: "09-feature-panel.png", caption: "Responsive — device preview beside the tool grid" },
  { file: "10-workspace-tools.png", caption: "Inspect — box model, details, and structure" },
  { file: "11-popup-tools.png", caption: "Inspect — WCAG contrast and typography" },
  { file: "12-active-tools.png", caption: "Media — scan and download page assets" },
  { file: "13-measurement-rulers.png", caption: "Color Picker — sample HEX, RGB, and HSL" },
  { file: "14-drawing-wordpress.png", caption: "Palette — extract and save page colors" },
  { file: "15-responsive.png", caption: "Accessibility — audit score and issue summary" },
  { file: "16-inspect.png", caption: "Design Check — typography and color consistency" },
  { file: "17-contrast-check.png", caption: "Page Speed — Core Web Vitals and score" },
  { file: "18-media-manager.png", caption: "Design System — tokens, DESIGN.md, SKILL.md" },
  { file: "19-color-picker.png", caption: "Wireframe — grayscale structural preview" },
  { file: "20-palette.png", caption: "Cache Cleaner — clear site browsing data" },
  { file: "21-accessibility.png", caption: "Page Load Timer — performance milestones" },
  { file: "22-design-check.png", caption: "Page Controls — disable elements while testing" },
];

function openWorkspaceSettings() {
  chrome.tabs.create({
    url: chrome.runtime.getURL("options/options.html#workspace"),
  });
}

function openOptions() {
  chrome.runtime.openOptionsPage();
}

async function applyPreset(presetKey) {
  const groups = { ...(WORKSPACE_PRESETS[presetKey] || WORKSPACE_PRESETS.all) };
  const status = document.getElementById("preset-status");
  document.querySelectorAll(".preset").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.preset === presetKey);
  });
  try {
    await chrome.runtime.sendMessage({
      type: "updateSettings",
      settings: {
        ui: {
          popupGroups: groups,
        },
      },
    });
    if (status) {
      status.textContent = `Workspace updated to “${presetKey}”. Open the popup to see the decluttered tools.`;
    }
  } catch (error) {
    if (status) {
      status.textContent = "Could not save workspace preset. Try again from Settings.";
    }
    console.error("[Aligner Welcome] preset failed:", error);
  }
}

function setupRailActiveState() {
  const links = Array.from(document.querySelectorAll(".rail-nav a"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === id);
        });
        sections.forEach((section) => {
          section.classList.toggle("is-in-view", section === entry.target);
        });
      });
    },
    { rootMargin: "-28% 0px -55% 0px", threshold: 0.01 },
  );

  sections.forEach((section) => observer.observe(section));
}

function downloadWpHelper() {
  const url = chrome.runtime.getURL("wordpress/aligner-wp-tools-helper.zip");
  const link = document.createElement("a");
  link.href = url;
  link.download = "aligner-wp-tools-helper.zip";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function setupScrollTop() {
  const btn = document.getElementById("scroll-top");
  if (!btn) return;

  const sync = () => {
    const show = window.scrollY > 420;
    btn.hidden = !show;
    btn.classList.toggle("is-visible", show);
  };

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", sync, { passive: true });
  sync();
}

function setupShotLightbox() {
  const dialog = document.getElementById("shot-lightbox");
  const img = document.getElementById("shot-lightbox-img");
  const caption = document.getElementById("shot-lightbox-caption");
  const closeBtn = document.getElementById("shot-lightbox-close");
  if (!dialog || !img || !caption) return;

  const close = () => {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  };

  closeBtn?.addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.open) close();
  });

  return (src, text) => {
    img.src = src;
    img.alt = text || "Product screenshot";
    caption.textContent = text || "";
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  };
}

function screenshotUrl(file) {
  try {
    if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
      return chrome.runtime.getURL(`assets/screenshots/${file}`);
    }
  } catch (_) {
    /* fall through */
  }
  return `../assets/screenshots/${file}`;
}

function tryLoadScreenshot(slot) {
  return new Promise((resolve) => {
    const img = new Image();
    img.alt = slot.caption;
    // Eager load: detached images with loading="lazy" never fire onload/onerror.
    img.loading = "eager";
    img.decoding = "async";
    const done = (ok) => {
      clearTimeout(timer);
      resolve(ok ? { img, caption: slot.caption, file: slot.file } : null);
    };
    const timer = setTimeout(() => done(false), 8000);
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = screenshotUrl(slot.file);
  });
}

async function loadProductScreenshots() {
  const grid = document.getElementById("shot-grid");
  const empty = document.getElementById("shot-empty");
  const countEl = document.getElementById("shot-count");
  if (!grid) return;

  const openLightbox = setupShotLightbox();
  const results = await Promise.all(SCREENSHOT_SLOTS.map((slot) => tryLoadScreenshot(slot)));

  let loaded = 0;
  results.forEach((result) => {
    if (!result) return;
    const figure = document.createElement("figure");
    figure.className = "shot";
    figure.tabIndex = 0;
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", `Open screenshot: ${result.caption}`);

    result.img.loading = "lazy";

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = result.caption;

    const open = () => openLightbox?.(result.img.src, result.caption);
    figure.addEventListener("click", open);
    figure.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });

    figure.appendChild(result.img);
    figure.appendChild(figcaption);
    grid.appendChild(figure);
    loaded += 1;
  });

  if (empty) empty.hidden = loaded > 0;
  if (countEl) {
    countEl.textContent =
      loaded > 0
        ? `${loaded} product screenshots — click any image to enlarge`
        : "Screenshots will appear here when files are present";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("open-workspace")
    ?.addEventListener("click", openWorkspaceSettings);
  document
    .getElementById("open-workspace-footer")
    ?.addEventListener("click", openWorkspaceSettings);
  document.getElementById("hero-workspace")?.addEventListener("click", openWorkspaceSettings);
  document.getElementById("open-options")?.addEventListener("click", openOptions);
  document.getElementById("footer-options")?.addEventListener("click", openOptions);
  document
    .getElementById("download-wp-helper")
    ?.addEventListener("click", downloadWpHelper);

  document.getElementById("hero-popup-hint")?.addEventListener("click", () => {
    const note = document.getElementById("popup-note");
    if (!note) return;
    note.hidden = !note.hidden;
    if (!note.hidden) note.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("hero-gallery")?.addEventListener("click", () => {
    document.getElementById("screenshots")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });

  setupRailActiveState();
  setupScrollTop();
  loadProductScreenshots();
});
