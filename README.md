# Ultimate Manager

Ultimate Manager is a football management game built with Rust and Tauri 2.

## Current features

- Cinematic stadium opening screen with a faceted diagonal menu panel.
- Branded Ultimate Manager title treatment over the stadium skyline.
- Main menu actions for starting a new game, loading a game, settings, and quitting.
- Display settings for Windowed, Fullscreen Windowed, and Fullscreen modes, with common resolution choices.
- The Settings button opens the display options and the Quit Game button closes the application; Start New Game and Load Game remain intentionally inactive for now.
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

Each commit must use a new semantic version in `package.json`,
`src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml` so the workflow can
create a unique release.
