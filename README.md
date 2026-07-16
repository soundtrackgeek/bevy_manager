# Ultimate Manager

Ultimate Manager is a football management game built with Rust and Tauri 2.

## Current features

- Cinematic stadium opening screen with a faceted diagonal menu panel.
- Branded Ultimate Manager title treatment over the stadium skyline.
- Main menu actions for starting a new game, loading a game, settings, and quitting.
- Persistent display settings for Windowed, Fullscreen Windowed, and Fullscreen modes, with common resolution choices restored whenever the game starts.
- The Settings button opens the display options and the Quit Game button closes the application; Start New Game and Load Game remain intentionally inactive for now.
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
