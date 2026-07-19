# Ultimate Manager

Ultimate Manager is a football management game built with Rust and Tauri 2.

## Current features

- Cinematic stadium opening screen with a faceted diagonal menu panel.
- Branded Ultimate Manager title treatment over the stadium skyline.
- Custom shield application icon for the Windows Start menu, taskbar, executable, and installer.
- Main menu actions for starting a new game, loading a game, settings, and quitting.
- Start New Game opens a second menu for Start a new Career, Quickstart, and Scenario Mode, with a working return to the main menu.
- Start a new Career opens a playable-country picker with England available; Italy, Norway, Spain, and France are shown but disabled, with Back returning to the start-game menu.
- Continuing with England opens a club picker for the 2026/27 Premier League, Championship, League One, and League Two, covering all 92 clubs across the four divisions.
- Division buttons reveal their clubs, club choices receive a visible selected state, and Back returns to the playable-country picker.
- Persistent display settings for Windowed, Fullscreen Windowed, and Fullscreen modes, with common resolution choices restored whenever the game starts.
- The Settings button opens the display options and the Quit Game button closes the application; Load Game, Quickstart, and Scenario Mode remain intentionally inactive for now.
- Automatic startup update checks with an in-game download and install notification.
- Signed updates install from inside the game and restart Ultimate Manager when finished.
- Application version displayed in the bottom-left corner.

## Development

Install the JavaScript dependencies:

```powershell
npm install
```

Run the desktop application in development mode:

```powershell
npm run tauri dev
```

Build the application:

```powershell
npm run tauri build
```

## Releases

Every push to `master` runs the Windows release workflow. It builds an NSIS
installer and publishes it as an installable `.exe` on a GitHub Release tagged
with the application version, such as `v0.3.1`.

The workflow also signs the updater bundle and publishes `latest.json`, which
installed copies of Ultimate Manager check every time the game starts.

Each commit must use a new semantic version in `package.json`,
`src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml` so the workflow can
create a unique release.
