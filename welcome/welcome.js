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
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 },
  );

  sections.forEach((section) => observer.observe(section));
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

  document.getElementById("hero-popup-hint")?.addEventListener("click", () => {
    const note = document.getElementById("popup-note");
    if (!note) return;
    note.hidden = !note.hidden;
    if (!note.hidden) note.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });

  setupRailActiveState();
});
