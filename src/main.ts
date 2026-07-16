import {
  currentMonitor,
  getCurrentWindow,
  LogicalSize,
} from "@tauri-apps/api/window";
import { version } from "../package.json";
import "./styles.css";

type DisplayMode = "windowed" | "borderless" | "fullscreen";

const DISPLAY_MODE_KEY = "ultimate-manager.display-mode";
const RESOLUTION_KEY = "ultimate-manager.resolution";

const versionLabel = document.querySelector<HTMLElement>(".version");
const settingsButton = document.querySelector<HTMLButtonElement>(
  '[data-action="settings"]',
);
const quitButton = document.querySelector<HTMLButtonElement>(
  '[data-action="quit"]',
);
const settingsOverlay = document.querySelector<HTMLElement>("[data-settings]");
const settingsForm = document.querySelector<HTMLFormElement>(
  "[data-settings-form]",
);
const resolutionSelect = document.querySelector<HTMLSelectElement>("#resolution");
const settingsStatus = document.querySelector<HTMLElement>(
  "[data-settings-status]",
);
const closeSettingsButtons = document.querySelectorAll<HTMLButtonElement>(
  '[data-action="close-settings"]',
);

let settingsTrigger: HTMLElement | null = null;

if (versionLabel) {
  versionLabel.textContent = `v${version}`;
}

const isDisplayMode = (value: string | null): value is DisplayMode =>
  value === "windowed" || value === "borderless" || value === "fullscreen";

const getSelectedDisplayMode = (): DisplayMode => {
  const selectedMode = document.querySelector<HTMLInputElement>(
    'input[name="display-mode"]:checked',
  );
  const selectedValue = selectedMode?.value ?? null;

  return isDisplayMode(selectedValue) ? selectedValue : "windowed";
};

const restoreDisplayPreferences = () => {
  const storedMode = localStorage.getItem(DISPLAY_MODE_KEY);
  const storedResolution = localStorage.getItem(RESOLUTION_KEY);

  if (isDisplayMode(storedMode)) {
    const modeInput = document.querySelector<HTMLInputElement>(
      `input[name="display-mode"][value="${storedMode}"]`,
    );
    if (modeInput) modeInput.checked = true;
  }

  if (
    resolutionSelect &&
    storedResolution &&
    Array.from(resolutionSelect.options).some(
      (option) => option.value === storedResolution,
    )
  ) {
    resolutionSelect.value = storedResolution;
  }
};

const openSettings = () => {
  if (!settingsOverlay) return;

  settingsTrigger = document.activeElement as HTMLElement | null;
  settingsOverlay.hidden = false;
  settingsOverlay.setAttribute("aria-hidden", "false");
  document.querySelector<HTMLElement>(".opening-screen")?.classList.add(
    "settings-open",
  );

  requestAnimationFrame(() => {
    settingsOverlay.classList.add("is-open");
    settingsOverlay.querySelector<HTMLElement>(".settings-close")?.focus();
  });
};

const closeSettings = () => {
  if (!settingsOverlay) return;

  settingsOverlay.classList.remove("is-open");
  settingsOverlay.setAttribute("aria-hidden", "true");
  document.querySelector<HTMLElement>(".opening-screen")?.classList.remove(
    "settings-open",
  );

  window.setTimeout(() => {
    settingsOverlay.hidden = true;
    settingsTrigger?.focus();
  }, 180);
};

const applyDisplaySettings = async () => {
  if (!resolutionSelect || !settingsStatus) return;

  const displayMode = getSelectedDisplayMode();
  const [width, height] = resolutionSelect.value.split("x").map(Number);
  const submitButton = settingsForm?.querySelector<HTMLButtonElement>(
    'button[type="submit"]',
  );

  settingsStatus.classList.remove("is-error");
  settingsStatus.textContent = "Applying display settings…";
  if (submitButton) submitButton.disabled = true;

  try {
    if (!("__TAURI_INTERNALS__" in window)) {
      localStorage.setItem(DISPLAY_MODE_KEY, displayMode);
      localStorage.setItem(RESOLUTION_KEY, resolutionSelect.value);
      settingsStatus.textContent =
        "Saved for the desktop app. Window changes require Tauri.";
      return;
    }

    const appWindow = getCurrentWindow();

    if (displayMode === "windowed") {
      await appWindow.setFullscreen(false);
      await appWindow.setDecorations(true);
      await appWindow.setSize(new LogicalSize(width, height));
      await appWindow.center();
    } else if (displayMode === "borderless") {
      await appWindow.setFullscreen(false);
      await appWindow.setDecorations(false);

      const monitor = await currentMonitor();
      if (!monitor) throw new Error("No active monitor was found.");

      await appWindow.setPosition(monitor.position);
      await appWindow.setSize(monitor.size);
    } else {
      await appWindow.setDecorations(true);
      await appWindow.setFullscreen(true);
    }

    localStorage.setItem(DISPLAY_MODE_KEY, displayMode);
    localStorage.setItem(RESOLUTION_KEY, resolutionSelect.value);
    settingsStatus.textContent = "Display settings applied.";
  } catch (error) {
    settingsStatus.classList.add("is-error");
    settingsStatus.textContent =
      error instanceof Error
        ? `Could not apply display settings: ${error.message}`
        : "Could not apply display settings.";
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
};

restoreDisplayPreferences();

settingsButton?.addEventListener("click", openSettings);

closeSettingsButtons.forEach((button) => {
  button.addEventListener("click", closeSettings);
});

settingsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await applyDisplaySettings();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && settingsOverlay?.classList.contains("is-open")) {
    closeSettings();
  }
});

quitButton?.addEventListener("click", async () => {
  await getCurrentWindow().close();
});
