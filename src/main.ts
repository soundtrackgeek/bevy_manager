import {
  currentMonitor,
  getCurrentWindow,
  LogicalSize,
} from "@tauri-apps/api/window";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { version } from "../package.json";
import "./styles.css";

type DisplayMode = "windowed" | "borderless" | "fullscreen";

type DisplayPreferences = {
  displayMode: DisplayMode;
  resolution: string;
};

type Division = {
  id: string;
  name: string;
  clubs: readonly string[];
};

const ENGLISH_DIVISIONS: readonly Division[] = [
  {
    id: "premier-league",
    name: "Premier League",
    clubs: [
      "AFC Bournemouth",
      "Arsenal",
      "Aston Villa",
      "Brentford",
      "Brighton & Hove Albion",
      "Chelsea",
      "Coventry City",
      "Crystal Palace",
      "Everton",
      "Fulham",
      "Hull City",
      "Ipswich Town",
      "Leeds United",
      "Liverpool",
      "Manchester City",
      "Manchester United",
      "Newcastle United",
      "Nottingham Forest",
      "Sunderland",
      "Tottenham Hotspur",
    ],
  },
  {
    id: "championship",
    name: "Championship",
    clubs: [
      "Birmingham City",
      "Blackburn Rovers",
      "Bolton Wanderers",
      "Bristol City",
      "Burnley",
      "Cardiff City",
      "Charlton Athletic",
      "Derby County",
      "Lincoln City",
      "Middlesbrough",
      "Millwall",
      "Norwich City",
      "Portsmouth",
      "Preston North End",
      "Queens Park Rangers",
      "Sheffield United",
      "Southampton",
      "Stoke City",
      "Swansea City",
      "Watford",
      "West Bromwich Albion",
      "West Ham United",
      "Wolverhampton Wanderers",
      "Wrexham",
    ],
  },
  {
    id: "league-one",
    name: "League One",
    clubs: [
      "AFC Wimbledon",
      "Barnsley",
      "Blackpool",
      "Bradford City",
      "Bromley",
      "Burton Albion",
      "Cambridge United",
      "Doncaster Rovers",
      "Huddersfield Town",
      "Leicester City",
      "Leyton Orient",
      "Luton Town",
      "Mansfield Town",
      "Milton Keynes Dons",
      "Notts County",
      "Oxford United",
      "Peterborough United",
      "Plymouth Argyle",
      "Reading",
      "Sheffield Wednesday",
      "Stevenage",
      "Stockport County",
      "Wigan Athletic",
      "Wycombe Wanderers",
    ],
  },
  {
    id: "league-two",
    name: "League Two",
    clubs: [
      "Accrington Stanley",
      "Barnet",
      "Bristol Rovers",
      "Cheltenham Town",
      "Chesterfield",
      "Colchester United",
      "Crawley Town",
      "Crewe Alexandra",
      "Exeter City",
      "Fleetwood Town",
      "Gillingham",
      "Grimsby Town",
      "Newport County",
      "Northampton Town",
      "Oldham Athletic",
      "Port Vale",
      "Rochdale",
      "Rotherham United",
      "Salford City",
      "Shrewsbury Town",
      "Swindon Town",
      "Tranmere Rovers",
      "Walsall",
      "York City",
    ],
  },
];

const DISPLAY_MODE_KEY = "ultimate-manager.display-mode";
const RESOLUTION_KEY = "ultimate-manager.resolution";

const versionLabel = document.querySelector<HTMLElement>(".version");
const mainMenu = document.querySelector<HTMLElement>('[data-menu="main"]');
const startGameMenu = document.querySelector<HTMLElement>(
  '[data-menu="start-game"]',
);
const countryMenu = document.querySelector<HTMLElement>(
  '[data-menu="countries"]',
);
const clubMenu = document.querySelector<HTMLElement>('[data-menu="clubs"]');
const openStartMenuButton = document.querySelector<HTMLButtonElement>(
  '[data-action="open-start-menu"]',
);
const openCountryMenuButton = document.querySelector<HTMLButtonElement>(
  '[data-action="open-country-menu"]',
);
const backToMainMenuButton = document.querySelector<HTMLButtonElement>(
  '[data-action="back-to-main-menu"]',
);
const backToStartMenuButton = document.querySelector<HTMLButtonElement>(
  '[data-action="back-to-start-menu"]',
);
const englandCountryCheckbox = document.querySelector<HTMLInputElement>(
  '[data-country="england"]',
);
const countryNextButton = document.querySelector<HTMLButtonElement>(
  '[data-action="country-next"]',
);
const backToCountriesButton = document.querySelector<HTMLButtonElement>(
  '[data-action="back-to-countries"]',
);
const divisionButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-division]"),
);
const clubPickerPrompt =
  document.querySelector<HTMLElement>("[data-club-picker-prompt]");
const clubRoster = document.querySelector<HTMLElement>("[data-club-roster]");
const clubRosterTitle = document.querySelector<HTMLElement>(
  "[data-club-roster-title]",
);
const clubRosterCount = document.querySelector<HTMLElement>(
  "[data-club-roster-count]",
);
const clubList = document.querySelector<HTMLElement>("[data-club-list]");
const clubSelectionStatus = document.querySelector<HTMLElement>(
  "[data-club-selection-status]",
);
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
const resolutionSelect =
  document.querySelector<HTMLSelectElement>("#resolution");
const settingsStatus = document.querySelector<HTMLElement>(
  "[data-settings-status]",
);
const closeSettingsButtons = document.querySelectorAll<HTMLButtonElement>(
  '[data-action="close-settings"]',
);
const updateToast = document.querySelector<HTMLElement>("[data-update-toast]");
const updateTitle = document.querySelector<HTMLElement>("[data-update-title]");
const updateMessage = document.querySelector<HTMLElement>(
  "[data-update-message]",
);
const updateProgress = document.querySelector<HTMLElement>(
  "[data-update-progress]",
);
const updateProgressBar = document.querySelector<HTMLElement>(
  "[data-update-progress-bar]",
);
const updateProgressValue = document.querySelector<HTMLElement>(
  "[data-update-progress-value]",
);
const updateProgressLabel = document.querySelector<HTMLElement>(
  "[data-update-progress-label]",
);
const installUpdateButton = document.querySelector<HTMLButtonElement>(
  '[data-action="install-update"]',
);
const dismissUpdateButton = document.querySelector<HTMLButtonElement>(
  '[data-action="dismiss-update"]',
);

let settingsTrigger: HTMLElement | null = null;
let pendingUpdate: Update | null = null;
let updateInstallationStarted = false;
let updateToastHideTimer: number | null = null;
let menuTransitionTimer: number | null = null;
let selectedClubButton: HTMLButtonElement | null = null;

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

const restoreDisplayPreferences = (): DisplayPreferences | null => {
  const storedMode = localStorage.getItem(DISPLAY_MODE_KEY);
  const storedResolution = localStorage.getItem(RESOLUTION_KEY);

  if (isDisplayMode(storedMode)) {
    const modeInput = document.querySelector<HTMLInputElement>(
      `input[name="display-mode"][value="${storedMode}"]`,
    );
    if (modeInput) modeInput.checked = true;
  }

  const hasStoredResolution =
    resolutionSelect &&
    storedResolution &&
    Array.from(resolutionSelect.options).some(
      (option) => option.value === storedResolution,
    );

  if (hasStoredResolution) {
    resolutionSelect.value = storedResolution;
  }

  if (!isDisplayMode(storedMode) || !resolutionSelect) return null;

  return {
    displayMode: storedMode,
    resolution: resolutionSelect.value,
  };
};

const openSettings = () => {
  if (!settingsOverlay) return;

  settingsTrigger = document.activeElement as HTMLElement | null;
  settingsOverlay.hidden = false;
  settingsOverlay.setAttribute("aria-hidden", "false");
  document
    .querySelector<HTMLElement>(".opening-screen")
    ?.classList.add("settings-open");

  requestAnimationFrame(() => {
    settingsOverlay.classList.add("is-open");
    settingsOverlay.querySelector<HTMLElement>(".settings-close")?.focus();
  });
};

const closeSettings = () => {
  if (!settingsOverlay) return;

  settingsOverlay.classList.remove("is-open");
  settingsOverlay.setAttribute("aria-hidden", "true");
  document
    .querySelector<HTMLElement>(".opening-screen")
    ?.classList.remove("settings-open");

  window.setTimeout(() => {
    settingsOverlay.hidden = true;
    settingsTrigger?.focus();
  }, 180);
};

const switchMenu = (
  currentMenu: HTMLElement | null,
  nextMenu: HTMLElement | null,
  direction: "forward" | "back",
) => {
  if (!currentMenu || !nextMenu || currentMenu === nextMenu) return;

  if (menuTransitionTimer !== null) {
    window.clearTimeout(menuTransitionTimer);
    menuTransitionTimer = null;
  }

  currentMenu.classList.remove("is-active");
  currentMenu.classList.add(
    direction === "forward" ? "is-leaving-left" : "is-leaving-right",
  );
  currentMenu.setAttribute("aria-hidden", "true");

  nextMenu.hidden = false;
  nextMenu.setAttribute("aria-hidden", "false");
  nextMenu.classList.remove("is-leaving-left", "is-leaving-right");
  nextMenu.classList.toggle("is-entering-from-left", direction === "back");

  requestAnimationFrame(() => {
    nextMenu.classList.remove("is-entering-from-left");
    nextMenu.classList.add("is-active");
    nextMenu
      .querySelector<HTMLElement>(
        "[data-menu-focus], .menu-button:not(:disabled)",
      )
      ?.focus();
  });

  menuTransitionTimer = window.setTimeout(() => {
    currentMenu.hidden = true;
    currentMenu.classList.remove("is-leaving-left", "is-leaving-right");
    menuTransitionTimer = null;
  }, 220);
};

const revealDivision = (divisionId: string) => {
  const division = ENGLISH_DIVISIONS.find(({ id }) => id === divisionId);

  if (
    !division ||
    !clubPickerPrompt ||
    !clubRoster ||
    !clubRosterTitle ||
    !clubRosterCount ||
    !clubList ||
    !clubSelectionStatus
  ) {
    return;
  }

  divisionButtons.forEach((button) => {
    const isActive = button.dataset.division === divisionId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive.toString());
  });

  selectedClubButton = null;
  clubRosterTitle.textContent = division.name;
  clubRosterCount.textContent = `${division.clubs.length} clubs · 2026/27`;
  clubSelectionStatus.textContent = "Choose a club from the list.";
  clubList.replaceChildren();
  clubList.scrollTop = 0;

  const clubButtons = document.createDocumentFragment();

  division.clubs.forEach((clubName) => {
    const button = document.createElement("button");
    button.className = "club-button";
    button.type = "button";
    button.textContent = clubName;
    button.dataset.club = clubName;
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      selectedClubButton?.classList.remove("is-selected");
      selectedClubButton?.setAttribute("aria-pressed", "false");

      selectedClubButton = button;
      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
      clubSelectionStatus.textContent = `Selected: ${clubName}`;
    });

    clubButtons.append(button);
  });

  clubList.append(clubButtons);
  clubPickerPrompt.hidden = true;
  clubRoster.hidden = false;
};

const showUpdateToast = (update: Update) => {
  if (!updateToast || !updateTitle || !updateMessage) return;

  if (updateToastHideTimer !== null) {
    window.clearTimeout(updateToastHideTimer);
    updateToastHideTimer = null;
  }

  updateTitle.textContent = "Update available";
  updateMessage.textContent = `Ultimate Manager v${update.version} is ready to install.`;
  updateToast.hidden = false;
  updateToast.setAttribute("aria-hidden", "false");

  requestAnimationFrame(() => updateToast.classList.add("is-visible"));
};

const hideUpdateToast = () => {
  if (!updateToast || updateInstallationStarted) return;

  updateToast.classList.remove("is-visible");
  updateToast.setAttribute("aria-hidden", "true");
  updateToastHideTimer = window.setTimeout(() => {
    updateToast.hidden = true;
    updateToastHideTimer = null;
  }, 200);
};

const setUpdateProgress = (downloaded: number, total?: number) => {
  if (!updateProgressBar || !updateProgressValue || !updateProgressLabel)
    return;

  if (total && total > 0) {
    const percentage = Math.min(100, Math.round((downloaded / total) * 100));
    updateProgressBar.classList.remove("is-indeterminate");
    updateProgressBar.setAttribute("aria-valuenow", percentage.toString());
    updateProgressValue.style.width = `${percentage}%`;
    updateProgressLabel.textContent = `Downloading… ${percentage}%`;
  } else {
    updateProgressBar.classList.add("is-indeterminate");
    updateProgressBar.removeAttribute("aria-valuenow");
    updateProgressValue.style.width = "38%";
    updateProgressLabel.textContent = "Downloading update…";
  }
};

const installPendingUpdate = async () => {
  if (
    !pendingUpdate ||
    updateInstallationStarted ||
    !updateTitle ||
    !updateMessage ||
    !installUpdateButton ||
    !dismissUpdateButton ||
    !updateProgress ||
    !updateProgressBar ||
    !updateProgressValue ||
    !updateProgressLabel
  ) {
    return;
  }

  updateInstallationStarted = true;
  installUpdateButton.disabled = true;
  installUpdateButton.textContent = "Downloading…";
  dismissUpdateButton.disabled = true;
  updateTitle.textContent = "Downloading update";
  updateMessage.textContent = `Ultimate Manager v${pendingUpdate.version} will restart when it is ready.`;
  updateProgress.hidden = false;
  updateProgressBar.classList.add("is-indeterminate");
  updateProgressBar.removeAttribute("aria-valuenow");
  updateProgressValue.style.width = "38%";
  updateProgressLabel.textContent = "Preparing download…";

  let downloadedBytes = 0;
  let totalBytes: number | undefined;

  try {
    await pendingUpdate.downloadAndInstall((event) => {
      if (event.event === "Started") {
        totalBytes = event.data.contentLength;
        setUpdateProgress(0, totalBytes);
      } else if (event.event === "Progress") {
        downloadedBytes += event.data.chunkLength;
        setUpdateProgress(downloadedBytes, totalBytes);
      } else {
        updateProgressBar.classList.remove("is-indeterminate");
        updateProgressBar.setAttribute("aria-valuenow", "100");
        updateProgressValue.style.width = "100%";
        updateProgressLabel.textContent = "Installing update…";
        installUpdateButton.textContent = "Installing…";
      }
    });

    updateTitle.textContent = "Restarting Ultimate Manager";
    updateMessage.textContent = "The update is installed. Restarting now…";
    updateProgressLabel.textContent = "Update installed";
    await relaunch();
  } catch (error) {
    console.error("Could not install the update", error);
    updateInstallationStarted = false;
    updateTitle.textContent = "Update failed";
    updateMessage.textContent =
      "The update could not be installed. Check your connection and try again.";
    updateProgress.hidden = true;
    installUpdateButton.disabled = false;
    installUpdateButton.textContent = "Try again";
    dismissUpdateButton.disabled = false;
  }
};

const checkForUpdates = async () => {
  if (!("__TAURI_INTERNALS__" in window)) return;

  try {
    pendingUpdate = await check({ timeout: 15_000 });
    if (pendingUpdate) showUpdateToast(pendingUpdate);
  } catch (error) {
    console.error("Could not check for updates", error);
  }
};

const applyWindowDisplaySettings = async ({
  displayMode,
  resolution,
}: DisplayPreferences) => {
  const [width, height] = resolution.split("x").map(Number);
  if (!width || !height) throw new Error("The saved resolution is invalid.");

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
};

const applyDisplaySettings = async () => {
  if (!resolutionSelect || !settingsStatus) return;

  const preferences: DisplayPreferences = {
    displayMode: getSelectedDisplayMode(),
    resolution: resolutionSelect.value,
  };
  const submitButton = settingsForm?.querySelector<HTMLButtonElement>(
    'button[type="submit"]',
  );

  settingsStatus.classList.remove("is-error");
  settingsStatus.textContent = "Applying display settings…";
  if (submitButton) submitButton.disabled = true;

  try {
    if (!("__TAURI_INTERNALS__" in window)) {
      localStorage.setItem(DISPLAY_MODE_KEY, preferences.displayMode);
      localStorage.setItem(RESOLUTION_KEY, preferences.resolution);
      settingsStatus.textContent =
        "Saved for the desktop app. Window changes require Tauri.";
      return;
    }

    await applyWindowDisplaySettings(preferences);
    localStorage.setItem(DISPLAY_MODE_KEY, preferences.displayMode);
    localStorage.setItem(RESOLUTION_KEY, preferences.resolution);
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

const restoredDisplayPreferences = restoreDisplayPreferences();

if (restoredDisplayPreferences && "__TAURI_INTERNALS__" in window) {
  void applyWindowDisplaySettings(restoredDisplayPreferences).catch((error) => {
    console.error("Could not restore saved display settings", error);
  });
}

settingsButton?.addEventListener("click", openSettings);

openStartMenuButton?.addEventListener("click", () => {
  switchMenu(mainMenu, startGameMenu, "forward");
});

openCountryMenuButton?.addEventListener("click", () => {
  switchMenu(startGameMenu, countryMenu, "forward");
});

backToMainMenuButton?.addEventListener("click", () => {
  switchMenu(startGameMenu, mainMenu, "back");
});

backToStartMenuButton?.addEventListener("click", () => {
  switchMenu(countryMenu, startGameMenu, "back");
});

englandCountryCheckbox?.addEventListener("change", () => {
  if (countryNextButton) {
    countryNextButton.disabled = !englandCountryCheckbox.checked;
  }
});

countryNextButton?.addEventListener("click", () => {
  if (!englandCountryCheckbox?.checked) return;

  switchMenu(countryMenu, clubMenu, "forward");
});

backToCountriesButton?.addEventListener("click", () => {
  switchMenu(clubMenu, countryMenu, "back");
});

divisionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const divisionId = button.dataset.division;
    if (divisionId) revealDivision(divisionId);
  });
});

closeSettingsButtons.forEach((button) => {
  button.addEventListener("click", closeSettings);
});

installUpdateButton?.addEventListener("click", () => {
  void installPendingUpdate();
});

dismissUpdateButton?.addEventListener("click", () => {
  hideUpdateToast();
  void pendingUpdate?.close();
  pendingUpdate = null;
});

settingsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await applyDisplaySettings();
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    settingsOverlay?.classList.contains("is-open")
  ) {
    closeSettings();
  }
});

quitButton?.addEventListener("click", async () => {
  await getCurrentWindow().close();
});

if (document.readyState === "complete") {
  void checkForUpdates();
} else {
  window.addEventListener("load", () => void checkForUpdates(), { once: true });
}
