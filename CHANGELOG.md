# Changelog

## [0.6.1] - 2026-07-16

### Added

- Back navigation from the playable-country picker to the start-game menu.

## [0.6.0] - 2026-07-16

### Added

- Playable-country selection for new careers, with England available and Italy, Norway, Spain, and France shown as disabled.
- Next control that becomes available after England is selected.

## [0.5.0] - 2026-07-16

### Added

- Start-game menu with Start a new Career, Quickstart, Scenario Mode, and Back To Main Menu options.
- Animated navigation between the main menu and start-game menu.

## [0.4.1] - 2026-07-16

### Fixed

- Saved display mode and resolution are now reapplied whenever Ultimate Manager starts.

## [0.4.0] - 2026-07-16

### Added

- Automatic update check whenever Ultimate Manager starts.
- In-game update notification with download progress, retry handling, installation, and restart.
- Signed updater bundles and `latest.json` metadata in GitHub Releases.

## [0.3.2] - 2026-07-16

### Changed

- Updated the development workflow so pushes no longer wait for GitHub Actions to finish.

## [0.3.1] - 2026-07-16

### Added

- GitHub Actions workflow that creates a Windows release for every push to `master`.
- Installable NSIS `.exe` attached to each versioned GitHub Release.

### Changed

- Windows bundles now target the NSIS installer format.

## [0.3.0] - 2026-07-16

### Added

- Display settings opened from the main menu.
- Windowed, Fullscreen Windowed, and Fullscreen display modes.
- Selectable 720p, 900p, 1080p, 1440p, and 4K window resolutions.

## [0.2.0] - 2026-07-16

### Added

- Selected Ultimate Manager logo on the opening screen.

### Changed

- Updated the visible application branding from Bevy Manager to Ultimate Manager.

## [0.1.0] - 2026-07-15

### Added

- Initial Rust and Tauri 2 application shell.
- Cinematic stadium opening screen with the selected concept's faceted diagonal panel treatment.
- Code-native Start New Game, Load Game, Settings, and Quit Game buttons.
- Working Quit Game action and bottom-left version label.
