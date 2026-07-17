// Aligner Popup Script

let currentSettings = null;
let activeTabId = null;

async function getActiveTabId() {
  try {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    activeTabId = tabs[0]?.id ?? null;
    return activeTabId;
  } catch (_) {
    activeTabId = null;
    return null;
  }
}

async function notifySettingsToTabs(settings) {
  if (!settings) return;

  if (settings.applyScope === "allTabs") {
    const tabs = await chrome.tabs.query({});
    await Promise.all(
      tabs.map((tab) =>
        chrome.tabs
          .sendMessage(tab.id, {
            type: "settingsUpdated",
            settings,
          })
          .catch(() => {}),
      ),
    );
    return;
  }

  const tabId = activeTabId || (await getActiveTabId());
  if (tabId) {
    chrome.tabs
      .sendMessage(tabId, {
        type: "settingsUpdated",
        settings,
      })
      .catch(() => {});
  }
}

// Initialize popup
document.addEventListener("DOMContentLoaded", async () => {
  await getActiveTabId();
  await loadSettings();
  setupEventListeners();
  setupMeasurementControls();
  setupRulersControls();
  setupGridControls();
  setupGuideControls();
  setupDrawingControls();
  setupWordPressControls();
});

// Load current settings
async function loadSettings() {
  try {
    const tabId = activeTabId || (await getActiveTabId());
    const response = await chrome.runtime.sendMessage({
      type: "getSettings",
      tabId,
    });

    if (chrome.runtime.lastError) {
      console.error(
        "[Aligner Popup] Error loading settings:",
        chrome.runtime.lastError
      );
      return;
    }

    if (response && response.success) {
      currentSettings = response.settings;
      updateUI();
    }
  } catch (error) {
    console.error("[Aligner Popup] Error loading settings:", error);
  }
}

// Presentation-only: hide popup tools by workspace group without clearing feature settings
function getPopupGroups() {
  return (
    currentSettings?.ui?.popupGroups || {
      layout: true,
      inspect: true,
      colorMedia: true,
      quality: true,
      utilities: true,
      wordpress: true,
    }
  );
}

function isPopupGroupVisible(group) {
  if (!group) return true;
  const groups = getPopupGroups();
  return groups[group] !== false;
}

function applyPopupGroupVisibility() {
  const groups = getPopupGroups();
  const featureButtons = document.querySelectorAll(".feature-button[data-popup-group]");
  let visibleCount = 0;
  featureButtons.forEach((button) => {
    const group = button.dataset.popupGroup;
    const visible = groups[group] !== false;
    button.style.display = visible ? "" : "none";
    if (visible) visibleCount += 1;
  });

  document.querySelectorAll("[data-popup-group]").forEach((el) => {
    if (el.classList.contains("feature-button")) return;
    const group = el.dataset.popupGroup;
    if (groups[group] === false) {
      el.style.display = "none";
    } else if (el.id === "wordpress-section") {
      el.style.display = "";
    } else if (el.id === "wordpress-controls-section") {
      // keep existing logic in updateUI; only force-hide when group off
    }
  });

  const wordpressSection = document.getElementById("wordpress-section");
  if (wordpressSection && groups.wordpress === false) {
    wordpressSection.style.display = "none";
  }

  const wordpressControls = document.getElementById("wordpress-controls-section");
  if (wordpressControls && groups.wordpress === false) {
    wordpressControls.style.display = "none";
  }

  const allGroupsOn = Object.values(groups).every((value) => value !== false);
  const hint = document.getElementById("workspace-hint");
  const emptyHint = document.getElementById("workspace-empty-hint");
  if (hint) {
    hint.style.display = !allGroupsOn && visibleCount > 0 ? "block" : "none";
  }
  if (emptyHint) {
    emptyHint.style.display = visibleCount === 0 ? "block" : "none";
  }

  const featuresSection = document.getElementById("features-section");
  const featureGrid = featuresSection?.querySelector(".feature-grid");
  if (featureGrid) {
    featureGrid.style.display = visibleCount === 0 ? "none" : "";
  }
}

// Update UI based on current settings
function updateUI() {
  if (!currentSettings) return;

  // Update master toggle
  const masterToggle = document.getElementById("master-toggle");
  if (masterToggle) {
    masterToggle.checked = currentSettings.enabled;
  }

  // Apply scope
  const scope = currentSettings.applyScope || "currentTab";
  const currentTabBtn = document.getElementById("scope-current-tab");
  const allTabsBtn = document.getElementById("scope-all-tabs");
  const hint = document.getElementById("apply-scope-hint");
  if (currentTabBtn && allTabsBtn) {
    currentTabBtn.classList.toggle("active", scope === "currentTab");
    allTabsBtn.classList.toggle("active", scope === "allTabs");
  }
  if (hint) {
    hint.textContent =
      scope === "allTabs"
        ? "Tools stay on across every tab until you turn them off."
        : "Tools only run on the tab where you turn them on.";
  }

  // Update features section state
  const featuresSection = document.getElementById("features-section");
  if (featuresSection) {
    if (currentSettings.enabled) {
      featuresSection.classList.remove("disabled");
    } else {
      featuresSection.classList.add("disabled");
    }
  }

  const wordpressSection = document.getElementById("wordpress-section");
  if (wordpressSection) {
    if (currentSettings.enabled) {
      wordpressSection.classList.remove("disabled");
    } else {
      wordpressSection.classList.add("disabled");
    }
  }

  // Update feature buttons
  const featureButtons = document.querySelectorAll(".feature-button");
  featureButtons.forEach((button) => {
    const feature = button.dataset.feature;
    if (feature && currentSettings[feature]) {
      if (currentSettings[feature].enabled) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    }
  });

  applyPopupGroupVisibility();
  const groups = getPopupGroups();

  // Show/hide measurement controls based on measurement enabled state
  const measurementControlsSection = document.getElementById(
    "measurement-controls-section"
  );
  if (measurementControlsSection && currentSettings.measurement) {
    if (
      currentSettings.enabled &&
      currentSettings.measurement.enabled &&
      groups.layout !== false
    ) {
      measurementControlsSection.style.display = "block";
      updateMeasurementControls();
    } else {
      measurementControlsSection.style.display = "none";
    }
  }

  // Show/hide rulers controls based on rulers enabled state
  const rulersControlsSection = document.getElementById(
    "rulers-controls-section"
  );
  if (rulersControlsSection && currentSettings.rulers) {
    if (
      currentSettings.enabled &&
      currentSettings.rulers.enabled &&
      groups.layout !== false
    ) {
      rulersControlsSection.style.display = "block";
      updateRulersControls();
    } else {
      rulersControlsSection.style.display = "none";
    }
  }

  // Show/hide grid controls based on grids enabled state
  const gridControlsSection = document.getElementById("grid-controls-section");
  if (gridControlsSection && currentSettings.grids) {
    if (
      currentSettings.enabled &&
      currentSettings.grids.enabled &&
      groups.layout !== false
    ) {
      gridControlsSection.style.display = "block";
      updateGridControls();
    } else {
      gridControlsSection.style.display = "none";
    }
  }

  // Show/hide guide controls based on guides enabled state
  const guideControlsSection = document.getElementById(
    "guide-controls-section"
  );
  if (guideControlsSection && currentSettings.guides) {
    if (
      currentSettings.enabled &&
      currentSettings.guides.enabled &&
      groups.layout !== false
    ) {
      guideControlsSection.style.display = "block";
      updateGuideControls();
    } else {
      guideControlsSection.style.display = "none";
    }
  }

  // Show/hide drawing controls based on drawing enabled state
  const drawingControlsSection = document.getElementById(
    "drawing-controls-section"
  );
  if (drawingControlsSection && currentSettings.drawing) {
    if (
      currentSettings.enabled &&
      currentSettings.drawing.enabled &&
      groups.layout !== false
    ) {
      drawingControlsSection.style.display = "block";
      updateDrawingControls();
    } else {
      drawingControlsSection.style.display = "none";
    }
  }

  // WordPress controls
  const wordpressControlsSection = document.getElementById(
    "wordpress-controls-section"
  );
  if (wordpressControlsSection && currentSettings.wordpressTools) {
    if (
      currentSettings.enabled &&
      currentSettings.wordpressTools.enabled &&
      groups.wordpress !== false
    ) {
      wordpressControlsSection.style.display = "block";
      updateWordPressControls();
    } else {
      wordpressControlsSection.style.display = "none";
    }
  }
}

// Setup event listeners
function setupEventListeners() {
  // Master toggle
  const masterToggle = document.getElementById("master-toggle");
  if (masterToggle) {
    masterToggle.addEventListener("change", handleMasterToggle);
  }

  // Apply scope
  document.querySelectorAll(".scope-button").forEach((button) => {
    button.addEventListener("click", () => {
      const scope = button.dataset.scope;
      if (scope) {
        handleApplyScopeChange(scope);
      }
    });
  });

  // Feature buttons
  const featureButtons = document.querySelectorAll(".feature-button");
  featureButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const feature = button.dataset.feature;
      if (feature) {
        handleFeatureToggle(feature);
      }
    });
  });

  // Open options button
  const openOptionsButton = document.getElementById("open-options");
  if (openOptionsButton) {
    openOptionsButton.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
  }

  const openWorkspace = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("options/options.html#workspace"),
    });
  };
  const openHome = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("welcome/welcome.html"),
    });
  };
  document
    .getElementById("open-workspace-settings")
    ?.addEventListener("click", openWorkspace);
  document
    .getElementById("open-workspace-settings-empty")
    ?.addEventListener("click", openWorkspace);
  document.getElementById("open-aligner-home")?.addEventListener("click", openHome);

  // Clear guides button
  const clearGuidesButton = document.getElementById("clear-guides");
  if (clearGuidesButton) {
    clearGuidesButton.addEventListener("click", handleClearGuides);
  }

  // Clear drawings button
  const clearDrawingsButton = document.getElementById("clear-drawings");
  if (clearDrawingsButton) {
    clearDrawingsButton.addEventListener("click", handleClearDrawings);
  }

  // Presets
  const savePresetButton = document.getElementById("save-preset");
  if (savePresetButton) {
    savePresetButton.addEventListener("click", handleSavePreset);
  }

  const loadPresetSelect = document.getElementById("load-preset");
  if (loadPresetSelect) {
    loadPresetSelect.addEventListener("change", handleLoadPreset);
    loadPresets(); // Populate dropdown
  }

  // Built-in templates
  const templateButtons = document.querySelectorAll(".template-button");
  templateButtons.forEach((button) => {
    button.addEventListener("click", handleTemplateClick);
    // Add hover effect
    button.addEventListener("mouseenter", (e) => {
      e.target.style.transform = "translateY(-2px)";
      e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
    });
    button.addEventListener("mouseleave", (e) => {
      e.target.style.transform = "";
      e.target.style.boxShadow = "";
    });
  });
}

async function handleApplyScopeChange(applyScope) {
  try {
    const tabId = activeTabId || (await getActiveTabId());
    const response = await chrome.runtime.sendMessage({
      type: "setApplyScope",
      applyScope,
      tabId,
    });

    if (chrome.runtime.lastError) {
      console.error(
        "[Aligner Popup] Error setting apply scope:",
        chrome.runtime.lastError
      );
      return;
    }

    if (response && response.success) {
      currentSettings = response.settings;
      updateUI();
    }
  } catch (error) {
    console.error("[Aligner Popup] Error setting apply scope:", error);
  }
}

// Handle master toggle
async function handleMasterToggle(event) {
  try {
    const tabId = activeTabId || (await getActiveTabId());
    const response = await chrome.runtime.sendMessage({
      type: "toggleExtension",
      tabId,
    });

    if (chrome.runtime.lastError) {
      console.error(
        "[Aligner Popup] Error toggling extension:",
        chrome.runtime.lastError
      );
      event.target.checked = !event.target.checked;
      return;
    }

    if (response && response.success) {
      currentSettings = response.settings;
      updateUI();
      await notifySettingsToTabs(currentSettings);
    } else {
      event.target.checked = !event.target.checked;
    }
  } catch (error) {
    console.error("[Aligner Popup] Error toggling extension:", error);
    event.target.checked = !event.target.checked;
  }
}

// Handle feature toggle
async function handleFeatureToggle(feature) {
  if (!currentSettings || !currentSettings.enabled) {
    return;
  }

  try {
    const tabId = activeTabId || (await getActiveTabId());
    const response = await chrome.runtime.sendMessage({
      type: "toggleFeature",
      feature,
      tabId,
    });

    if (chrome.runtime.lastError) {
      console.error(
        "[Aligner Popup] Error toggling feature:",
        chrome.runtime.lastError
      );
      return;
    }

    if (response && response.success) {
      currentSettings = response.settings;
      updateUI();

      // Show/hide grid controls if grids feature is toggled
      if (feature === "grids") {
        const gridControlsSection = document.getElementById(
          "grid-controls-section"
        );
        if (gridControlsSection) {
          if (currentSettings.grids.enabled) {
            gridControlsSection.style.display = "block";
            updateGridControls();
          } else {
            gridControlsSection.style.display = "none";
          }
        }
      }

      await notifySettingsToTabs(currentSettings);
    }
  } catch (error) {
    console.error("[Aligner Popup] Error toggling feature:", error);
  }
}

// Update measurement controls with current settings
function updateMeasurementControls() {
  if (!currentSettings || !currentSettings.measurement) return;

  // Update mode buttons
  const mode = currentSettings.measurement.mode || "point";
  const pointBtn = document.getElementById("measurement-mode-point");
  const rectangleBtn = document.getElementById("measurement-mode-rectangle");

  if (pointBtn && rectangleBtn) {
    pointBtn.classList.toggle("active", mode === "point");
    rectangleBtn.classList.toggle("active", mode === "rectangle");
  }

  // Update device pixels checkbox
  const devicePixelsCheckbox = document.getElementById(
    "measurement-device-pixels"
  );
  if (devicePixelsCheckbox) {
    devicePixelsCheckbox.checked =
      currentSettings.measurement.showDevicePixels || false;
  }
}

// Update rulers controls with current settings
function updateRulersControls() {
  if (!currentSettings || !currentSettings.rulers) return;

  const unitsSelect = document.getElementById("ruler-units");
  if (unitsSelect) {
    unitsSelect.value = currentSettings.rulers.units || "px";
  }

  const showOriginCheckbox = document.getElementById("ruler-show-origin");
  if (showOriginCheckbox) {
    showOriginCheckbox.checked = currentSettings.rulers.showOrigin || false;
  }

  const originDisplay = document.getElementById("ruler-origin-display");
  const originCoords = document.getElementById("ruler-origin-coords");
  if (originDisplay && originCoords) {
    if (currentSettings.rulers.showOrigin) {
      originDisplay.style.display = "block";
      const x = currentSettings.rulers.originX || 0;
      const y = currentSettings.rulers.originY || 0;
      originCoords.textContent = `X: ${x}px, Y: ${y}px`;
    } else {
      originDisplay.style.display = "none";
    }
  }
}

function updateGridControls() {
  if (!currentSettings || !currentSettings.grids) return;

  const gridType = document.getElementById("grid-type");
  const gridColumns = document.getElementById("grid-columns");
  const gridColumnsValue = document.getElementById("grid-columns-value");
  const gridGutter = document.getElementById("grid-gutter");
  const gridGutterValue = document.getElementById("grid-gutter-value");
  const gridMargins = document.getElementById("grid-margins");
  const gridMarginsValue = document.getElementById("grid-margins-value");
  const gridSpacing = document.getElementById("grid-spacing");
  const gridSpacingValue = document.getElementById("grid-spacing-value");
  const gridBaselineOffset = document.getElementById("grid-baseline-offset");
  const gridBaselineOffsetValue = document.getElementById(
    "grid-baseline-offset-value"
  );
  const gridColor = document.getElementById("grid-color");
  const gridOpacity = document.getElementById("grid-opacity");
  const gridOpacityValue = document.getElementById("grid-opacity-value");
  const gridResponsive = document.getElementById("grid-responsive");
  const breakpointConfig = document.getElementById("breakpoint-config");

  // Update responsive checkbox
  if (gridResponsive) {
    gridResponsive.checked = currentSettings.grids.responsive || false;
  }

  // Show/hide breakpoint config
  if (breakpointConfig) {
    breakpointConfig.style.display = currentSettings.grids.responsive
      ? "block"
      : "none";
  }

  if (gridType) gridType.value = currentSettings.grids.type || "column";
  if (gridColumns) gridColumns.value = currentSettings.grids.columns || 12;
  if (gridColumnsValue)
    gridColumnsValue.textContent = currentSettings.grids.columns || 12;
  if (gridGutter) gridGutter.value = currentSettings.grids.gutter || 16;
  if (gridGutterValue)
    gridGutterValue.textContent = currentSettings.grids.gutter || 16;
  if (gridMargins) gridMargins.value = currentSettings.grids.margins || 24;
  if (gridMarginsValue)
    gridMarginsValue.textContent = currentSettings.grids.margins || 24;
  if (gridSpacing) gridSpacing.value = currentSettings.grids.spacing || 8;
  if (gridSpacingValue)
    gridSpacingValue.textContent = currentSettings.grids.spacing || 8;
  if (gridBaselineOffset)
    gridBaselineOffset.value = currentSettings.grids.baselineOffset || 0;
  if (gridBaselineOffsetValue)
    gridBaselineOffsetValue.textContent =
      currentSettings.grids.baselineOffset || 0;

  const gridBaselineThickness = document.getElementById(
    "grid-baseline-thickness"
  );
  const gridBaselineThicknessValue = document.getElementById(
    "grid-baseline-thickness-value"
  );
  if (gridBaselineThickness)
    gridBaselineThickness.value = currentSettings.grids.baselineThickness || 1;
  if (gridBaselineThicknessValue)
    gridBaselineThicknessValue.textContent =
      currentSettings.grids.baselineThickness || 1;

  if (gridColor) gridColor.value = currentSettings.grids.color || "#f59e0b";
  if (gridOpacity) gridOpacity.value = currentSettings.grids.opacity || 0.3;
  if (gridOpacityValue)
    gridOpacityValue.textContent = (
      currentSettings.grids.opacity || 0.3
    ).toFixed(2);
}

// Setup measurement control event listeners
function setupMeasurementControls() {
  // Setup mode buttons
  const modeButtons = document.querySelectorAll(".mode-button");
  modeButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const mode = e.target.dataset.mode;
      if (mode) {
        updateMeasurementSetting("mode", mode);
        // Update button states
        modeButtons.forEach((btn) => btn.classList.remove("active"));
        e.target.classList.add("active");
      }
    });
  });

  // Setup device pixels checkbox
  const devicePixelsCheckbox = document.getElementById(
    "measurement-device-pixels"
  );
  if (devicePixelsCheckbox) {
    devicePixelsCheckbox.addEventListener("change", (e) => {
      updateMeasurementSetting("showDevicePixels", e.target.checked);
    });
  }
}

function updateMeasurementSetting(key, value) {
  if (!currentSettings || !currentSettings.measurement) return;

  currentSettings.measurement[key] = value;

  chrome.runtime.sendMessage(
    {
      type: "updateSettings",
      settings: currentSettings,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error updating measurement settings:",
          chrome.runtime.lastError
        );
      }
    }
  );
}

// Setup rulers control event listeners
function setupRulersControls() {
  const unitsSelect = document.getElementById("ruler-units");

  if (unitsSelect) {
    unitsSelect.addEventListener("change", (e) => {
      updateRulersSetting("units", e.target.value);
    });
  }

  const showOriginCheckbox = document.getElementById("ruler-show-origin");
  if (showOriginCheckbox) {
    showOriginCheckbox.addEventListener("change", (e) => {
      updateRulersSetting("showOrigin", e.target.checked);
      updateRulersControls();
    });
  }

  const resetOriginButton = document.getElementById("ruler-reset-origin");
  if (resetOriginButton) {
    resetOriginButton.addEventListener("click", () => {
      updateRulersSetting("originX", 0);
      updateRulersSetting("originY", 0);
      updateRulersControls();
    });
  }
}

function updateRulersSetting(key, value) {
  if (!currentSettings || !currentSettings.rulers) return;

  currentSettings.rulers[key] = value;

  chrome.runtime.sendMessage(
    {
      type: "updateSettings",
      settings: currentSettings,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error updating rulers settings:",
          chrome.runtime.lastError
        );
      }
    }
  );
}

// Setup grid control event listeners
function setupGridControls() {
  const gridType = document.getElementById("grid-type");
  const gridColumns = document.getElementById("grid-columns");
  const gridGutter = document.getElementById("grid-gutter");
  const gridMargins = document.getElementById("grid-margins");
  const gridSpacing = document.getElementById("grid-spacing");
  const gridColor = document.getElementById("grid-color");
  const gridOpacity = document.getElementById("grid-opacity");
  const gridResponsive = document.getElementById("grid-responsive");
  const gridBreakpointSelect = document.getElementById(
    "grid-breakpoint-select"
  );
  const breakpointConfig = document.getElementById("breakpoint-config");

  // Current breakpoint being edited
  let currentEditBreakpoint = "mobile";

  // Responsive toggle
  if (gridResponsive) {
    gridResponsive.addEventListener("change", (e) => {
      const isResponsive = e.target.checked;
      updateGridSetting("responsive", isResponsive);

      // Show/hide breakpoint selector
      if (breakpointConfig) {
        breakpointConfig.style.display = isResponsive ? "block" : "none";
      }

      // If enabling responsive, load breakpoint settings
      if (isResponsive && currentSettings.grids.breakpoints) {
        loadBreakpointSettings(currentEditBreakpoint);
      }
    });
  }

  // Breakpoint selector
  if (gridBreakpointSelect) {
    gridBreakpointSelect.addEventListener("change", (e) => {
      currentEditBreakpoint = e.target.value;
      loadBreakpointSettings(currentEditBreakpoint);
    });
  }

  // Load breakpoint settings into controls
  function loadBreakpointSettings(breakpoint) {
    if (
      !currentSettings.grids.breakpoints ||
      !currentSettings.grids.breakpoints[breakpoint]
    )
      return;

    const bp = currentSettings.grids.breakpoints[breakpoint];
    if (gridColumns) {
      gridColumns.value = bp.columns;
      document.getElementById("grid-columns-value").textContent = bp.columns;
    }
    if (gridGutter) {
      gridGutter.value = bp.gutter;
      document.getElementById("grid-gutter-value").textContent = bp.gutter;
    }
    if (gridMargins) {
      gridMargins.value = bp.margins;
      document.getElementById("grid-margins-value").textContent = bp.margins;
    }
  }

  if (gridType) {
    gridType.addEventListener("change", (e) =>
      updateGridSetting("type", e.target.value)
    );
  }

  if (gridColumns) {
    gridColumns.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      document.getElementById("grid-columns-value").textContent = value;

      // Update breakpoint if responsive mode
      if (currentSettings.grids.responsive) {
        updateBreakpointSetting(currentEditBreakpoint, "columns", value);
      } else {
        updateGridSetting("columns", value);
      }
    });
  }

  if (gridGutter) {
    gridGutter.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      document.getElementById("grid-gutter-value").textContent = value;

      if (currentSettings.grids.responsive) {
        updateBreakpointSetting(currentEditBreakpoint, "gutter", value);
      } else {
        updateGridSetting("gutter", value);
      }
    });
  }

  if (gridMargins) {
    gridMargins.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      document.getElementById("grid-margins-value").textContent = value;

      if (currentSettings.grids.responsive) {
        updateBreakpointSetting(currentEditBreakpoint, "margins", value);
      } else {
        updateGridSetting("margins", value);
      }
    });
  }

  if (gridSpacing) {
    gridSpacing.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      document.getElementById("grid-spacing-value").textContent = value;
      updateGridSetting("spacing", value);
    });
  }

  const gridBaselineOffset = document.getElementById("grid-baseline-offset");
  if (gridBaselineOffset) {
    gridBaselineOffset.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      document.getElementById("grid-baseline-offset-value").textContent = value;
      updateGridSetting("baselineOffset", value);
    });
  }

  const gridBaselineThickness = document.getElementById(
    "grid-baseline-thickness"
  );
  if (gridBaselineThickness) {
    gridBaselineThickness.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      document.getElementById("grid-baseline-thickness-value").textContent =
        value;
      updateGridSetting("baselineThickness", value);
    });
  }

  if (gridColor) {
    gridColor.addEventListener("change", (e) =>
      updateGridSetting("color", e.target.value)
    );
  }

  if (gridOpacity) {
    gridOpacity.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      document.getElementById("grid-opacity-value").textContent =
        value.toFixed(2);
      updateGridSetting("opacity", value);
    });
  }
}

// Update individual grid setting
async function updateGridSetting(key, value) {
  if (!currentSettings) return;

  try {
    currentSettings.grids[key] = value;

    const response = await chrome.runtime.sendMessage({
      type: "updateSettings",
      settings: { grids: currentSettings.grids },
    });

    if (response && response.success) {
      // Notify active tab
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs[0]) {
        chrome.tabs
          .sendMessage(tabs[0].id, {
            type: "settingsUpdated",
            settings: currentSettings,
          })
          .catch(() => {});
      }
    }
  } catch (error) {
    console.error("[Aligner Popup] Error updating grid setting:", error);
  }
}

// Update breakpoint setting
async function updateBreakpointSetting(breakpoint, key, value) {
  if (!currentSettings || !currentSettings.grids.breakpoints) return;

  try {
    if (!currentSettings.grids.breakpoints[breakpoint]) {
      currentSettings.grids.breakpoints[breakpoint] = {};
    }

    currentSettings.grids.breakpoints[breakpoint][key] = value;

    const response = await chrome.runtime.sendMessage({
      type: "updateSettings",
      settings: { grids: currentSettings.grids },
    });

    if (response && response.success) {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs[0]) {
        chrome.tabs
          .sendMessage(tabs[0].id, {
            type: "settingsUpdated",
            settings: currentSettings,
          })
          .catch(() => {});
      }
    }
  } catch (error) {
    console.error("[Aligner Popup] Error updating breakpoint setting:", error);
  }
}

// Update guide controls values from settings
function updateGuideControls() {
  if (!currentSettings || !currentSettings.guides) return;

  const guideColor = document.getElementById("guide-color");
  const guideOpacity = document.getElementById("guide-opacity");
  const guideOpacityValue = document.getElementById("guide-opacity-value");
  const guideThickness = document.getElementById("guide-thickness");
  const guideThicknessValue = document.getElementById("guide-thickness-value");
  const guideModeButtons = document.querySelectorAll("[id^='guide-mode-']");
  const guideDefaultAngle = document.getElementById("guide-default-angle");

  // Update mode buttons
  const currentMode = currentSettings.guides.mode || "straight";
  guideModeButtons.forEach((btn) => {
    if (btn.dataset.mode === currentMode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update default angle
  if (guideDefaultAngle) {
    guideDefaultAngle.value = currentSettings.guides.defaultAngle || 0;
  }

  if (guideColor) guideColor.value = currentSettings.guides.color || "#10b981";
  if (guideOpacity) guideOpacity.value = currentSettings.guides.opacity || 0.7;
  if (guideOpacityValue)
    guideOpacityValue.textContent = (
      currentSettings.guides.opacity || 0.7
    ).toFixed(2);
  if (guideThickness)
    guideThickness.value = currentSettings.guides.thickness || 1;
  if (guideThicknessValue)
    guideThicknessValue.textContent = currentSettings.guides.thickness || 1;
}

// Setup guide control event listeners
function setupGuideControls() {
  const guideColor = document.getElementById("guide-color");
  const guideOpacity = document.getElementById("guide-opacity");
  const guideThickness = document.getElementById("guide-thickness");
  const guideModeButtons = document.querySelectorAll("[id^='guide-mode-']");
  const guideDefaultAngle = document.getElementById("guide-default-angle");

  // Mode buttons
  guideModeButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const mode = e.target.dataset.mode;
      guideModeButtons.forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");
      updateGuideSetting("mode", mode);
    });
  });

  // Default angle
  if (guideDefaultAngle) {
    guideDefaultAngle.addEventListener("change", (e) => {
      let value = parseInt(e.target.value);
      if (isNaN(value)) value = 0;
      if (value < 0) value = 0;
      if (value > 359) value = 359;
      e.target.value = value;
      updateGuideSetting("defaultAngle", value);
    });
  }

  if (guideColor) {
    guideColor.addEventListener("change", (e) =>
      updateGuideSetting("color", e.target.value)
    );
  }

  if (guideOpacity) {
    guideOpacity.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      document.getElementById("guide-opacity-value").textContent =
        value.toFixed(2);
      updateGuideSetting("opacity", value);
    });
  }

  if (guideThickness) {
    guideThickness.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      document.getElementById("guide-thickness-value").textContent = value;
      updateGuideSetting("thickness", value);
    });
  }
}

// Update individual guide setting
async function updateGuideSetting(key, value) {
  if (!currentSettings) return;

  try {
    currentSettings.guides[key] = value;

    const response = await chrome.runtime.sendMessage({
      type: "updateSettings",
      settings: { guides: currentSettings.guides },
    });

    if (response && response.success) {
      // Notify active tab
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs[0]) {
        chrome.tabs
          .sendMessage(tabs[0].id, {
            type: "settingsUpdated",
            settings: currentSettings,
          })
          .catch(() => {});
      }
    }
  } catch (error) {
    console.error("[Aligner Popup] Error updating guide setting:", error);
  }
}

// Update drawing controls values from settings
function updateDrawingControls() {
  if (!currentSettings || !currentSettings.drawing) return;

  const drawingTool = document.getElementById("drawing-tool");
  const arrowStyle = document.getElementById("arrow-style");
  const arrowStyleGroup = document.getElementById("arrow-style-group");
  const drawingColor = document.getElementById("drawing-color");
  const drawingStroke = document.getElementById("drawing-stroke");
  const drawingStrokeValue = document.getElementById("drawing-stroke-value");
  const drawingOpacity = document.getElementById("drawing-opacity");
  const drawingOpacityValue = document.getElementById("drawing-opacity-value");

  if (drawingTool) {
    drawingTool.value = currentSettings.drawing.tool || "line";
    // Show/hide arrow style based on current tool
    if (arrowStyleGroup) {
      arrowStyleGroup.style.display =
        currentSettings.drawing.tool === "arrow" ? "block" : "none";
    }
  }
  if (arrowStyle)
    arrowStyle.value = currentSettings.drawing.arrowStyle || "simple";
  if (drawingColor)
    drawingColor.value = currentSettings.drawing.color || "#ef4444";
  if (drawingStroke)
    drawingStroke.value = currentSettings.drawing.strokeWidth || 2;
  if (drawingStrokeValue)
    drawingStrokeValue.textContent = currentSettings.drawing.strokeWidth || 2;
  if (drawingOpacity)
    drawingOpacity.value = currentSettings.drawing.opacity || 0.6;
  if (drawingOpacityValue)
    drawingOpacityValue.textContent = (
      currentSettings.drawing.opacity || 0.6
    ).toFixed(2);
}

// Setup drawing control event listeners
function setupDrawingControls() {
  const drawingTool = document.getElementById("drawing-tool");
  const arrowStyle = document.getElementById("arrow-style");
  const arrowStyleGroup = document.getElementById("arrow-style-group");
  const textTypographyControls = document.getElementById(
    "text-typography-controls"
  );
  const drawingColor = document.getElementById("drawing-color");
  const drawingStroke = document.getElementById("drawing-stroke");
  const drawingOpacity = document.getElementById("drawing-opacity");

  if (drawingTool) {
    drawingTool.addEventListener("change", (e) => {
      const tool = e.target.value;
      // Show/hide arrow style selector
      if (arrowStyleGroup) {
        arrowStyleGroup.style.display = tool === "arrow" ? "block" : "none";
      }
      // Show/hide text typography controls
      if (textTypographyControls) {
        textTypographyControls.style.display =
          tool === "text" ? "block" : "none";
      }
      updateDrawingSetting("tool", tool);
    });
  }

  if (arrowStyle) {
    arrowStyle.addEventListener("change", (e) =>
      updateDrawingSetting("arrowStyle", e.target.value)
    );
  }

  if (drawingColor) {
    drawingColor.addEventListener("change", (e) =>
      updateDrawingSetting("color", e.target.value)
    );
  }

  if (drawingStroke) {
    drawingStroke.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      document.getElementById("drawing-stroke-value").textContent = value;
      updateDrawingSetting("strokeWidth", value);
    });
  }

  if (drawingOpacity) {
    drawingOpacity.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      document.getElementById("drawing-opacity-value").textContent =
        value.toFixed(2);
      updateDrawingSetting("opacity", value);
    });
  }

  // Text typography controls
  const textFontSize = document.getElementById("text-font-size");
  const textFontWeight = document.getElementById("text-font-weight");
  const textStyleItalic = document.getElementById("text-style-italic");
  const textStyleUnderline = document.getElementById("text-style-underline");

  if (textFontSize) {
    textFontSize.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      document.getElementById("text-font-size-value").textContent = value;
      updateDrawingSetting("fontSize", value);
    });
  }

  if (textFontWeight) {
    textFontWeight.addEventListener("change", (e) => {
      updateDrawingSetting("fontWeight", parseInt(e.target.value));
    });
  }

  if (textStyleItalic) {
    textStyleItalic.addEventListener("click", () => {
      textStyleItalic.classList.toggle("active");
      const isItalic = textStyleItalic.classList.contains("active");
      updateDrawingSetting("fontStyle", isItalic ? "italic" : "normal");
    });
  }

  if (textStyleUnderline) {
    textStyleUnderline.addEventListener("click", () => {
      textStyleUnderline.classList.toggle("active");
      const isUnderline = textStyleUnderline.classList.contains("active");
      updateDrawingSetting(
        "textDecoration",
        isUnderline ? "underline" : "none"
      );
    });
  }
}

// Update individual drawing setting
async function updateDrawingSetting(key, value) {
  if (!currentSettings) return;

  try {
    currentSettings.drawing[key] = value;

    const response = await chrome.runtime.sendMessage({
      type: "updateSettings",
      settings: { drawing: currentSettings.drawing },
    });

    if (response && response.success) {
      // Notify active tab
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs[0]) {
        chrome.tabs
          .sendMessage(tabs[0].id, {
            type: "settingsUpdated",
            settings: currentSettings,
          })
          .catch(() => {});
      }
    }
  } catch (error) {
    console.error("[Aligner Popup] Error updating drawing setting:", error);
  }
}

// Clear all guides
async function handleClearGuides() {
  try {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "clearGuides",
      });
    }
  } catch (error) {
    console.error("[Aligner Popup] Error clearing guides:", error);
  }
}

// Clear all drawings
async function handleClearDrawings() {
  try {
    // Confirm before clearing
    if (!confirm("Clear all drawings on this page? This cannot be undone.")) {
      return;
    }

    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "clearDrawings",
      });
    }
  } catch (error) {
    console.error("[Aligner Popup] Error clearing drawings:", error);
  }
}

// Save preset
async function handleSavePreset() {
  try {
    const presetName = prompt("Enter a name for this preset:");
    if (!presetName || presetName.trim() === "") return;

    const response = await chrome.runtime.sendMessage({ type: "getSettings" });
    if (response && response.success) {
      const presets = await getPresets();
      presets[presetName.trim()] = response.settings;

      await chrome.storage.sync.set({ aligner_presets: presets });
      alert(`Preset "${presetName}" saved successfully!`);
      loadPresets(); // Refresh dropdown
    }
  } catch (error) {
    console.error("[Aligner Popup] Error saving preset:", error);
    alert("Error saving preset. Please try again.");
  }
}

// Load preset
async function handleLoadPreset(event) {
  try {
    const presetName = event.target.value;
    console.log("[Aligner Popup] Loading preset:", presetName);

    if (!presetName) return;

    const presets = await getPresets();
    const presetSettings = presets[presetName];
    console.log("[Aligner Popup] Preset settings:", presetSettings);

    if (presetSettings) {
      const response = await chrome.runtime.sendMessage({
        type: "updateSettings",
        settings: presetSettings,
      });
      console.log("[Aligner Popup] Update response:", response);

      if (response && response.success) {
        // Notify active tab
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tabs[0]) {
          chrome.tabs
            .sendMessage(tabs[0].id, {
              type: "settingsUpdated",
              settings: presetSettings,
            })
            .catch(() => {});
        }

        // Reload popup UI
        console.log("[Aligner Popup] Reloading popup UI");
        window.location.reload();
      }
    } else {
      console.error("[Aligner Popup] Preset not found:", presetName);
      alert(`Preset "${presetName}" not found.`);
    }
  } catch (error) {
    console.error("[Aligner Popup] Error loading preset:", error);
    alert("Error loading preset. Please try again.");
  }
}

// Handle built-in template click
async function handleTemplateClick(event) {
  try {
    const button = event.currentTarget;
    const templateName = button.dataset.template;
    if (!templateName) return;

    console.log("[Aligner Popup] Loading template:", templateName);

    // Visual feedback - disable button
    button.disabled = true;
    button.style.opacity = "0.5";
    button.textContent = "Loading...";

    const response = await chrome.runtime.sendMessage({
      type: "loadBuiltInTemplate",
      templateName: templateName,
    });

    console.log("[Aligner Popup] Template response:", response);

    if (response && response.success) {
      // Notify active tab
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs[0]) {
        chrome.tabs
          .sendMessage(tabs[0].id, {
            type: "settingsUpdated",
            settings: response.settings,
          })
          .catch(() => {});
      }

      // Show success message briefly before reload
      button.textContent = "✓ Loaded!";
      button.style.background = "#10b981";
      button.style.color = "white";

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      console.error("[Aligner Popup] Template load failed:", response);
      button.disabled = false;
      button.style.opacity = "1";
      alert(`Error loading template "${templateName}". Please try again.`);
    }
  } catch (error) {
    console.error("[Aligner Popup] Error loading template:", error);
    alert("Error loading template. Please try again.");
  }
}

// Get saved presets
async function getPresets() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["aligner_presets"], (result) => {
      resolve(result.aligner_presets || {});
    });
  });
}

// Load presets into dropdown
async function loadPresets() {
  try {
    const presets = await getPresets();
    const select = document.getElementById("load-preset");
    if (!select) return;

    // Clear existing options except first
    while (select.options.length > 1) {
      select.remove(1);
    }

    // Add preset options
    Object.keys(presets).forEach((presetName) => {
      const option = document.createElement("option");
      option.value = presetName;
      option.textContent = presetName;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("[Aligner Popup] Error loading presets:", error);
  }
}

function updateWordPressControls() {
  if (!currentSettings?.wordpressTools) return;
  const wp = currentSettings.wordpressTools;
  const tools = wp.tools || {};

  const remember = document.getElementById("wp-remember-admin-bar");
  if (remember) remember.checked = wp.rememberAdminBarHidden !== false;

  document.querySelectorAll("[data-wp-tool]").forEach((input) => {
    const key = input.getAttribute("data-wp-tool");
    input.checked = tools[key] !== false;
  });
}

function setupWordPressControls() {
  const remember = document.getElementById("wp-remember-admin-bar");
  if (remember) {
    remember.addEventListener("change", () =>
      updateWordPressSetting("rememberAdminBarHidden", remember.checked)
    );
  }

  document.querySelectorAll("[data-wp-tool]").forEach((input) => {
    input.addEventListener("change", () => {
      const key = input.getAttribute("data-wp-tool");
      updateWordPressToolSetting(key, input.checked);
    });
  });
}

async function updateWordPressSetting(key, value) {
  if (!currentSettings.wordpressTools) {
    currentSettings.wordpressTools = {};
  }
  currentSettings.wordpressTools[key] = value;

  const tabId = activeTabId || (await getActiveTabId());
  const response = await chrome.runtime.sendMessage({
    type: "updateSettings",
    tabId,
    settings: {
      wordpressTools: {
        [key]: value,
      },
    },
  });

  if (response?.success) {
    currentSettings = response.settings;
    await notifySettingsToTabs(currentSettings);
  }
}

async function updateWordPressToolSetting(toolKey, enabled) {
  if (!currentSettings.wordpressTools) {
    currentSettings.wordpressTools = { tools: {} };
  }
  if (!currentSettings.wordpressTools.tools) {
    currentSettings.wordpressTools.tools = {};
  }
  currentSettings.wordpressTools.tools[toolKey] = enabled;

  const tabId = activeTabId || (await getActiveTabId());
  const response = await chrome.runtime.sendMessage({
    type: "updateSettings",
    tabId,
    settings: {
      wordpressTools: {
        tools: {
          ...currentSettings.wordpressTools.tools,
          [toolKey]: enabled,
        },
      },
    },
  });

  if (response?.success) {
    currentSettings = response.settings;
    await notifySettingsToTabs(currentSettings);
  }
}
