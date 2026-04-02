# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](https://semver.org/).

---

## [1.0.1] - 2026-04-02

### Added
- Unit tests for core components, formatters, writers, and output factories.
- Coverage reporting integration with Coveralls.
- Typed linting alignment for the TypeScript codebase.

### Changed
- Updated GitHub Actions workflows for CI and automation.
- Improved project documentation.
- Corrected the README project version.

### Fixed
- Unit test issues and coverage-related test adjustments.
- CI workflow issues affecting GitHub Actions execution.

---

## [1.0.0] - 2026-03-30

### Added
- Initial `logora-file` project setup.
- Text file output support for Logora.
- JSON file output support for Logora.
- File rotation support for:
  - `daily`
  - `size`
  - `startup`
  - and combinations of these policies
- Retention support via:
  - `maxFiles`
  - `maxAgeDays`
- Text log formatting with `formatString`, placeholders, and conditional blocks.
- JSON Lines-style structured log writing.
- Path resolution with support for relative and absolute destinations.
- Automatic directory creation support.
- File session management for writing, rotation, and retention handling.

### Notes
- `logora-file` is designed as a modular output package for `logora`, in the same spirit as `logora-console`.

---

## [0.0.0] - 2025-05-02

### Added
- Initial repository creation.
