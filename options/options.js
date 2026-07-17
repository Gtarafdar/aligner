// Aligner Options Page Script

let currentSettings = null;
let saveTimeout = null;

// Initialize options page
document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings();
  setupNavigation();
  setupEventListeners();
  updateUI();
  openHashSection();
});

function openHashSection() {
  const hash = (location.hash || "").replace(/^#/, "");
  if (hash) switchSection(hash);
}

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

function ensureUiSettings() {
  if (!currentSettings.ui) currentSettings.ui = {};
  if (!currentSettings.ui.popupGroups) {
    currentSettings.ui.popupGroups = { ...WORKSPACE_PRESETS.all };
  }
  return currentSettings.ui.popupGroups;
}

function setupWorkspaceControls() {
  document.querySelectorAll("[data-popup-group]").forEach((input) => {
    input.addEventListener("change", async () => {
      const group = input.getAttribute("data-popup-group");
      const groups = ensureUiSettings();
      groups[group] = Boolean(input.checked);
      await saveWorkspaceGroups(groups);
    });
  });

  document.querySelectorAll("[data-workspace-preset]").forEach((button) => {
    button.addEventListener("click", async () => {
      const preset = button.getAttribute("data-workspace-preset");
      const groups = { ...(WORKSPACE_PRESETS[preset] || WORKSPACE_PRESETS.all) };
      ensureUiSettings();
      currentSettings.ui.popupGroups = groups;
      updateWorkspaceUI();
      await saveWorkspaceGroups(groups);
    });
  });

  document
    .getElementById("open-aligner-home-options")
    ?.addEventListener("click", () => {
      chrome.tabs.create({
        url: chrome.runtime.getURL("welcome/welcome.html"),
      });
    });
  document
    .getElementById("open-aligner-home-footer")
    ?.addEventListener("click", () => {
      chrome.tabs.create({
        url: chrome.runtime.getURL("welcome/welcome.html"),
      });
    });
}

function updateWorkspaceUI() {
  const groups = ensureUiSettings();
  Object.keys(WORKSPACE_PRESETS.all).forEach((group) => {
    setToggleValue(`ui-group-${group}`, groups[group] !== false);
  });
}

async function saveWorkspaceGroups(groups) {
  try {
    await chrome.runtime.sendMessage({
      type: "updateSettings",
      settings: {
        ui: {
          popupGroups: { ...groups },
        },
      },
    });
    showSaveStatus("saved");
  } catch (error) {
    console.error("[Aligner Options] Failed to save workspace:", error);
    showSaveStatus("error");
  }
}

// Load current settings
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "getSettings" });

    if (chrome.runtime.lastError) {
      console.error(
        "[Aligner Options] Error loading settings:",
        chrome.runtime.lastError
      );
      return;
    }

    if (response && response.success) {
      currentSettings = response.settings;
    }
  } catch (error) {
    console.error("[Aligner Options] Error loading settings:", error);
  }
}

// Setup navigation
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const section = item.dataset.section;
      switchSection(section);
    });
  });
}

// Switch between sections
function switchSection(sectionName) {
  // Update nav items
  document.querySelectorAll(".nav-item").forEach((item) => {
    if (item.dataset.section === sectionName) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Update sections
  document.querySelectorAll(".section").forEach((section) => {
    if (section.id === `${sectionName}-section`) {
      section.classList.add("active");
    } else {
      section.classList.remove("active");
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // General settings
  setupToggle("tooltips-enabled", "tooltips", "enabled");
  setupToggle("onboarding-enabled", "tooltips", "showOnboarding");

  // Rulers
  setupToggle("rulers-enabled", "rulers", "enabled");
  setupColorInput("rulers-color", "rulers", "color");
  setupRangeInput("rulers-opacity", "rulers", "opacity");
  setupNumberInput("rulers-thickness", "rulers", "thickness");
  setupNumberInput("rulers-tick-density", "rulers", "tickDensity");
  setupSelect("rulers-units", "rulers", "units");
  setupToggle("rulers-show-origin", "rulers", "showOrigin");

  // Add listener to update origin display when toggle changes
  const showOriginToggle = document.getElementById("rulers-show-origin");
  if (showOriginToggle) {
    showOriginToggle.addEventListener("change", () => {
      updateOriginDisplay();
    });
  }

  // Guides
  setupToggle("guides-enabled", "guides", "enabled");
  setupColorInput("guides-color", "guides", "color");
  setupRangeInput("guides-opacity", "guides", "opacity");
  setupNumberInput("guides-thickness", "guides", "thickness");
  setupToggle("guides-snap", "guides", "snapToPixel");
  setupToggle("guides-locked", "guides", "locked");

  // Grids
  setupToggle("grids-enabled", "grids", "enabled");
  setupSelect("grids-type", "grids", "type");
  setupNumberInput("grids-columns", "grids", "columns");
  setupNumberInput("grids-spacing", "grids", "spacing");
  setupNumberInput("grids-gutter", "grids", "gutter");
  setupNumberInput("grids-margins", "grids", "margins");
  setupColorInput("grids-color", "grids", "color");
  setupRangeInput("grids-opacity", "grids", "opacity");

  // Measurement
  setupToggle("measurement-enabled", "measurement", "enabled");
  setupSelect("measurement-units", "measurement", "units");
  setupToggle("measurement-snap", "measurement", "snap");
  setupToggle("measurement-device-px", "measurement", "showDevicePixels");

  // Drawing
  setupToggle("drawing-enabled", "drawing", "enabled");
  setupColorInput("drawing-color", "drawing", "color");
  setupRangeInput("drawing-opacity", "drawing", "opacity");
  setupNumberInput("drawing-stroke-width", "drawing", "strokeWidth");
  setupToggle("drawing-locked", "drawing", "locked");

  // Media Manager
  setupToggle("media-enabled", "mediaManager", "enabled");
  setupToggle("media-auto-scan", "mediaManager", "autoScan");

  // Color Picker
  setupToggle("colorPicker-enabled", "colorPicker", "enabled");
  setupSelect("colorPicker-format", "colorPicker", "format");
  setupNumberInput("colorPicker-maxHistory", "colorPicker", "maxHistory");
  setupToggle("colorPicker-autoOpen", "colorPicker", "autoOpen");

  // Palette Generator
  setupToggle("paletteGenerator-enabled", "paletteGenerator", "enabled");
  setupSelect("paletteGenerator-scanScope", "paletteGenerator", "scanScope");
  setupPaletteGeneratorCheckboxes();
  setupPaletteGeneratorSliders();
  setupToggle(
    "paletteGenerator-ignoreTransparent",
    "paletteGenerator",
    "ignoreTransparent"
  );
  setupToggle(
    "paletteGenerator-ignoreWhiteBlack",
    "paletteGenerator",
    "ignoreWhiteBlack"
  );
  setupNumberInput(
    "paletteGenerator-maxElementsScan",
    "paletteGenerator",
    "maxElementsScan"
  );

  // Cache Cleaner
  setupToggle("cacheCleaner-enabled", "cacheCleaner", "enabled");
  setupToggle("cacheCleaner-autoReload", "cacheCleaner", "autoReload");
  setupToggle(
    "cacheCleaner-showFloatingButton",
    "cacheCleaner",
    "showFloatingButton"
  );
  setupToggle(
    "cacheCleaner-dataTypes-cache",
    "cacheCleaner.dataTypes",
    "cache"
  );
  setupToggle(
    "cacheCleaner-dataTypes-cacheStorage",
    "cacheCleaner.dataTypes",
    "cacheStorage"
  );
  setupToggle(
    "cacheCleaner-dataTypes-cookies",
    "cacheCleaner.dataTypes",
    "cookies"
  );
  setupToggle(
    "cacheCleaner-dataTypes-fileSystems",
    "cacheCleaner.dataTypes",
    "fileSystems"
  );
  setupToggle(
    "cacheCleaner-dataTypes-indexedDB",
    "cacheCleaner.dataTypes",
    "indexedDB"
  );
  setupToggle(
    "cacheCleaner-dataTypes-localStorage",
    "cacheCleaner.dataTypes",
    "localStorage"
  );
  setupToggle(
    "cacheCleaner-dataTypes-serviceWorkers",
    "cacheCleaner.dataTypes",
    "serviceWorkers"
  );
  setupToggle(
    "cacheCleaner-dataTypes-pluginData",
    "cacheCleaner.dataTypes",
    "pluginData"
  );
  setupToggle(
    "cacheCleaner-dataTypes-webSQL",
    "cacheCleaner.dataTypes",
    "webSQL"
  );

  // Page Load Timer
  setupToggle("pageLoadTimer-enabled", "pageLoadTimer", "enabled");
  setupToggle("pageLoadTimer-autoShow", "pageLoadTimer", "autoShow");
  setupToggle(
    "pageLoadTimer-showFloatingButton",
    "pageLoadTimer",
    "showFloatingButton"
  );
  setupNumberInput(
    "pageLoadTimer-historyLimit",
    "pageLoadTimer",
    "historyLimit"
  );

  setupWorkspaceControls();

  // Reset button
  const resetButton = document.getElementById("reset-button");
  if (resetButton) {
    resetButton.addEventListener("click", handleReset);
  }

  // Export button
  const exportButton = document.getElementById("export-button");
  if (exportButton) {
    exportButton.addEventListener("click", handleExport);
  }

  // Import button
  const importButton = document.getElementById("import-button");
  if (importButton) {
    importButton.addEventListener("click", handleImport);
  }

  // Import file input
  const importFile = document.getElementById("import-file");
  if (importFile) {
    importFile.addEventListener("change", handleFileSelected);
  }
}

// Setup toggle input
function setupToggle(elementId, feature, property) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.addEventListener("change", (e) => {
    updateSetting(feature, property, e.target.checked);
  });
}

// Setup color input
function setupColorInput(elementId, feature, property) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.addEventListener("change", (e) => {
    const colorValue = e.target.value;
    updateSetting(feature, property, colorValue);

    // Update text display
    const textInput = element.nextElementSibling;
    if (textInput && textInput.classList.contains("color-text")) {
      textInput.value = colorValue;
    }
  });
}

// Setup range input
function setupRangeInput(elementId, feature, property) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);

    // Update display
    const valueDisplay = element.parentElement.querySelector(".slider-value");
    if (valueDisplay) {
      valueDisplay.textContent = `${Math.round(value * 100)}%`;
    }

    updateSetting(feature, property, value);
  });
}

// Setup number input
function setupNumberInput(elementId, feature, property) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.addEventListener("change", (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      updateSetting(feature, property, value);
    }
  });
}

// Setup select input
function setupSelect(elementId, feature, property) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.addEventListener("change", (e) => {
    updateSetting(feature, property, e.target.value);
  });
}

// Setup Palette Generator checkboxes (for includeTypes object)
function setupPaletteGeneratorCheckboxes() {
  const checkboxes = [
    { id: "paletteGenerator-includeText", property: "text" },
    { id: "paletteGenerator-includeBackground", property: "background" },
    { id: "paletteGenerator-includeBorder", property: "border" },
    { id: "paletteGenerator-includeSvg", property: "svg" },
  ];

  checkboxes.forEach(({ id, property }) => {
    const element = document.getElementById(id);
    if (!element) return;

    element.addEventListener("change", (e) => {
      if (!currentSettings?.paletteGenerator?.includeTypes) return;
      currentSettings.paletteGenerator.includeTypes[property] =
        e.target.checked;
      saveSettings();
    });
  });
}

// Setup Palette Generator sliders (with value display)
function setupPaletteGeneratorSliders() {
  // Max Colors slider
  const maxColorsSlider = document.getElementById("paletteGenerator-maxColors");
  const maxColorsValue = document.getElementById(
    "paletteGenerator-maxColors-value"
  );
  if (maxColorsSlider && maxColorsValue) {
    maxColorsSlider.addEventListener("input", (e) => {
      const value = parseInt(e.target.value, 10);
      maxColorsValue.textContent = value;
      updateSetting("paletteGenerator", "maxColors", value);
    });
  }

  // Grouping Tolerance slider
  const toleranceSlider = document.getElementById(
    "paletteGenerator-groupingTolerance"
  );
  const toleranceValue = document.getElementById(
    "paletteGenerator-groupingTolerance-value"
  );
  if (toleranceSlider && toleranceValue) {
    toleranceSlider.addEventListener("input", (e) => {
      const value = parseInt(e.target.value, 10);
      toleranceValue.textContent = value;
      updateSetting("paletteGenerator", "groupingTolerance", value);
    });
  }
}

// Update setting
function updateSetting(feature, property, value) {
  if (!currentSettings) return;

  if (feature === "tooltips") {
    currentSettings.tooltips[property] = value;
  } else {
    currentSettings[feature][property] = value;
  }

  saveSettings();
}

// Save settings with debounce
function saveSettings() {
  showSaveStatus("saving");

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "updateSettings",
        settings: currentSettings,
      });

      if (chrome.runtime.lastError) {
        console.error(
          "[Aligner Options] Error saving:",
          chrome.runtime.lastError
        );
        showSaveStatus("error");
        return;
      }

      if (response && response.success) {
        showSaveStatus("saved");
      } else {
        showSaveStatus("error");
      }
    } catch (error) {
      console.error("[Aligner Options] Error saving:", error);
      showSaveStatus("error");
    }
  }, 500);
}

// Show save status
function showSaveStatus(status) {
  const statusElement = document.getElementById("save-status");
  if (!statusElement) return;

  statusElement.className = "save-status";

  switch (status) {
    case "saving":
      statusElement.classList.add("saving");
      statusElement.textContent = "Saving...";
      break;
    case "saved":
      statusElement.textContent = "All changes saved";
      break;
    case "error":
      statusElement.classList.add("error");
      statusElement.textContent = "Error saving changes";
      break;
  }
}

// Update UI with current settings
function updateUI() {
  if (!currentSettings) return;

  // General
  setToggleValue("tooltips-enabled", currentSettings.tooltips.enabled);
  setToggleValue("onboarding-enabled", currentSettings.tooltips.showOnboarding);
  updateWorkspaceUI();

  // Rulers
  setToggleValue("rulers-enabled", currentSettings.rulers.enabled);
  setColorValue("rulers-color", currentSettings.rulers.color);
  setRangeValue("rulers-opacity", currentSettings.rulers.opacity);
  setNumberValue("rulers-thickness", currentSettings.rulers.thickness);
  setNumberValue("rulers-tick-density", currentSettings.rulers.tickDensity);
  setSelectValue("rulers-units", currentSettings.rulers.units);
  setToggleValue("rulers-show-origin", currentSettings.rulers.showOrigin);
  updateOriginDisplay();

  // Guides
  setToggleValue("guides-enabled", currentSettings.guides.enabled);
  setColorValue("guides-color", currentSettings.guides.color);
  setRangeValue("guides-opacity", currentSettings.guides.opacity);
  setNumberValue("guides-thickness", currentSettings.guides.thickness);
  setToggleValue("guides-snap", currentSettings.guides.snapToPixel);
  setToggleValue("guides-locked", currentSettings.guides.locked);

  // Grids
  setToggleValue("grids-enabled", currentSettings.grids.enabled);
  setSelectValue("grids-type", currentSettings.grids.type);
  setNumberValue("grids-columns", currentSettings.grids.columns);
  setNumberValue("grids-spacing", currentSettings.grids.spacing);
  setNumberValue("grids-gutter", currentSettings.grids.gutter);
  setNumberValue("grids-margins", currentSettings.grids.margins);
  setColorValue("grids-color", currentSettings.grids.color);
  setRangeValue("grids-opacity", currentSettings.grids.opacity);

  // Measurement
  setToggleValue("measurement-enabled", currentSettings.measurement.enabled);
  setSelectValue("measurement-units", currentSettings.measurement.units);
  setToggleValue("measurement-snap", currentSettings.measurement.snap);
  setToggleValue(
    "measurement-device-px",
    currentSettings.measurement.showDevicePixels
  );

  // Drawing
  setToggleValue("drawing-enabled", currentSettings.drawing.enabled);
  setColorValue("drawing-color", currentSettings.drawing.color);
  setRangeValue("drawing-opacity", currentSettings.drawing.opacity);
  setNumberValue("drawing-stroke-width", currentSettings.drawing.strokeWidth);
  setToggleValue("drawing-locked", currentSettings.drawing.locked);

  // Media Manager
  if (currentSettings.mediaManager) {
    setToggleValue("media-enabled", currentSettings.mediaManager.enabled);
    setToggleValue("media-auto-scan", currentSettings.mediaManager.autoScan);
  }

  // Color Picker
  if (currentSettings.colorPicker) {
    setToggleValue("colorPicker-enabled", currentSettings.colorPicker.enabled);
    setSelectValue("colorPicker-format", currentSettings.colorPicker.format);
    setNumberValue(
      "colorPicker-maxHistory",
      currentSettings.colorPicker.maxHistory
    );
    setToggleValue(
      "colorPicker-autoOpen",
      currentSettings.colorPicker.autoOpen
    );
  }

  // Palette Generator
  if (currentSettings.paletteGenerator) {
    setToggleValue(
      "paletteGenerator-enabled",
      currentSettings.paletteGenerator.enabled
    );
    setSelectValue(
      "paletteGenerator-scanScope",
      currentSettings.paletteGenerator.scanScope
    );

    // Include types checkboxes
    if (currentSettings.paletteGenerator.includeTypes) {
      const element = document.getElementById("paletteGenerator-includeText");
      if (element)
        element.checked = currentSettings.paletteGenerator.includeTypes.text;

      const bgElement = document.getElementById(
        "paletteGenerator-includeBackground"
      );
      if (bgElement)
        bgElement.checked =
          currentSettings.paletteGenerator.includeTypes.background;

      const borderElement = document.getElementById(
        "paletteGenerator-includeBorder"
      );
      if (borderElement)
        borderElement.checked =
          currentSettings.paletteGenerator.includeTypes.border;

      const svgElement = document.getElementById("paletteGenerator-includeSvg");
      if (svgElement)
        svgElement.checked = currentSettings.paletteGenerator.includeTypes.svg;
    }

    // Sliders with value display
    const maxColorsSlider = document.getElementById(
      "paletteGenerator-maxColors"
    );
    const maxColorsValue = document.getElementById(
      "paletteGenerator-maxColors-value"
    );
    if (maxColorsSlider && maxColorsValue) {
      maxColorsSlider.value = currentSettings.paletteGenerator.maxColors;
      maxColorsValue.textContent = currentSettings.paletteGenerator.maxColors;
    }

    const toleranceSlider = document.getElementById(
      "paletteGenerator-groupingTolerance"
    );
    const toleranceValue = document.getElementById(
      "paletteGenerator-groupingTolerance-value"
    );
    if (toleranceSlider && toleranceValue) {
      toleranceSlider.value =
        currentSettings.paletteGenerator.groupingTolerance;
      toleranceValue.textContent =
        currentSettings.paletteGenerator.groupingTolerance;
    }

    setToggleValue(
      "paletteGenerator-ignoreTransparent",
      currentSettings.paletteGenerator.ignoreTransparent
    );
    setToggleValue(
      "paletteGenerator-ignoreWhiteBlack",
      currentSettings.paletteGenerator.ignoreWhiteBlack
    );
    setNumberValue(
      "paletteGenerator-maxElementsScan",
      currentSettings.paletteGenerator.maxElementsScan
    );
  }

  // Cache Cleaner
  if (currentSettings.cacheCleaner) {
    setToggleValue(
      "cacheCleaner-enabled",
      currentSettings.cacheCleaner.enabled
    );
    setToggleValue(
      "cacheCleaner-autoReload",
      currentSettings.cacheCleaner.autoReload
    );
    setToggleValue(
      "cacheCleaner-showFloatingButton",
      currentSettings.cacheCleaner.showFloatingButton
    );

    // Data types
    if (currentSettings.cacheCleaner.dataTypes) {
      setToggleValue(
        "cacheCleaner-dataTypes-cache",
        currentSettings.cacheCleaner.dataTypes.cache
      );
      setToggleValue(
        "cacheCleaner-dataTypes-cacheStorage",
        currentSettings.cacheCleaner.dataTypes.cacheStorage
      );
      setToggleValue(
        "cacheCleaner-dataTypes-cookies",
        currentSettings.cacheCleaner.dataTypes.cookies
      );
      setToggleValue(
        "cacheCleaner-dataTypes-fileSystems",
        currentSettings.cacheCleaner.dataTypes.fileSystems
      );
      setToggleValue(
        "cacheCleaner-dataTypes-indexedDB",
        currentSettings.cacheCleaner.dataTypes.indexedDB
      );
      setToggleValue(
        "cacheCleaner-dataTypes-localStorage",
        currentSettings.cacheCleaner.dataTypes.localStorage
      );
      setToggleValue(
        "cacheCleaner-dataTypes-serviceWorkers",
        currentSettings.cacheCleaner.dataTypes.serviceWorkers
      );
      setToggleValue(
        "cacheCleaner-dataTypes-pluginData",
        currentSettings.cacheCleaner.dataTypes.pluginData
      );
      setToggleValue(
        "cacheCleaner-dataTypes-webSQL",
        currentSettings.cacheCleaner.dataTypes.webSQL
      );
    }
  }

  // Page Load Timer
  if (currentSettings.pageLoadTimer) {
    setToggleValue(
      "pageLoadTimer-enabled",
      currentSettings.pageLoadTimer.enabled
    );
    setToggleValue(
      "pageLoadTimer-autoShow",
      currentSettings.pageLoadTimer.autoShow
    );
    setToggleValue(
      "pageLoadTimer-showFloatingButton",
      currentSettings.pageLoadTimer.showFloatingButton
    );
    setNumberValue(
      "pageLoadTimer-historyLimit",
      currentSettings.pageLoadTimer.historyLimit || 10
    );
  }
}

// Helper functions to set values
function setToggleValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.checked = value;
  }
}

function setColorValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.value = value;
    const textInput = element.nextElementSibling;
    if (textInput && textInput.classList.contains("color-text")) {
      textInput.value = value;
    }
  }
}

function setRangeValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.value = value;
    const valueDisplay = element.parentElement.querySelector(".slider-value");
    if (valueDisplay) {
      valueDisplay.textContent = `${Math.round(value * 100)}%`;
    }
  }
}

function setNumberValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.value = value;
  }
}

function setSelectValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.value = value;
  }
}

// Update origin display based on showOrigin toggle
function updateOriginDisplay() {
  const showOriginToggle = document.getElementById("rulers-show-origin");
  const originSection = document.getElementById("rulers-origin-section");

  if (showOriginToggle && originSection) {
    originSection.style.display = showOriginToggle.checked ? "block" : "none";
  }
}

// Handle reset to defaults
async function handleReset() {
  if (!confirm("Reset all settings to defaults? This cannot be undone.")) {
    return;
  }

  try {
    // Get default settings by sending empty update
    const response = await chrome.runtime.sendMessage({
      type: "updateSettings",
      settings: {}, // This will trigger service worker to merge with defaults
    });

    if (chrome.runtime.lastError) {
      console.error(
        "[Aligner Options] Error resetting:",
        chrome.runtime.lastError
      );
      return;
    }

    if (response && response.success) {
      // Reload page to show defaults
      window.location.reload();
    }
  } catch (error) {
    console.error("[Aligner Options] Error resetting:", error);
  }
}

// Export settings
async function handleExport() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "getSettings" });

    if (response && response.success) {
      const settingsJSON = JSON.stringify(response.settings, null, 2);
      const blob = new Blob([settingsJSON], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `aligner-settings-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSaveStatus("Settings exported successfully!");
    }
  } catch (error) {
    console.error("[Aligner Options] Error exporting:", error);
    alert("Error exporting settings. Please try again.");
  }
}

// Import settings
async function handleImport() {
  const fileInput = document.getElementById("import-file");
  fileInput.click();
}

// Handle file selected
async function handleFileSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const settings = JSON.parse(text);

    // Validate settings object
    if (typeof settings !== "object" || settings === null) {
      throw new Error("Invalid settings format");
    }

    // Apply settings
    const response = await chrome.runtime.sendMessage({
      type: "updateSettings",
      settings: settings,
    });

    if (response && response.success) {
      showSaveStatus("Settings imported successfully!");
      setTimeout(() => window.location.reload(), 1000);
    }
  } catch (error) {
    console.error("[Aligner Options] Error importing:", error);
    alert("Error importing settings. Please check the file format.");
  } finally {
    // Reset file input
    event.target.value = "";
  }
}
