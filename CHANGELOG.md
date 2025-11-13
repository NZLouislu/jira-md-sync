# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-13

### Breaking Changes
- **Environment variables renamed**: `MD_INPUT_DIR` → `JIRA_MD_INPUT_DIR`, `MD_OUTPUT_DIR` → `JIRA_MD_OUTPUT_DIR`
  - This prevents conflicts when using multiple MD sync tools (Jira, Trello, GitHub) in the same project
  - See [Migration Guide](docs/MIGRATION_GUIDE.md) for upgrade instructions

### Fixed
- **Labels order preservation**: Labels now maintain original order from input files instead of alphabetical order from Jira
- **Ordered list numbering**: Sequential numbers now preserved in round-trip conversion (1, 2, 3... instead of all 1s)
- **Assignees and Labels parsing**: Now correctly handles both array format `[value1, value2]` and comma-separated format `value1, value2`
- **Strikethrough rendering**: Improved detection logic to avoid conflicts with list markers
- **User search**: Added cleanup of bracket characters before searching for users in Jira
- **Markdown parser**: Enhanced both section header and list story formats to support bracket notation
- **Path resolution**: Fixed inputDir path resolution in CLI to use process.cwd() instead of __dirname

### Improved
- **Format flexibility**: Both `Assignees: [backend, frontend]` and `Assignees: backend, frontend` now work correctly
- **Error handling**: Better error messages when users are not found in Jira
- **Documentation**: Added comprehensive format examples and troubleshooting guide
- **Multi-tool compatibility**: Environment variables now have `JIRA_` prefix to avoid conflicts

### Added
- New documentation file: `docs/NPM_PACKAGE_FIXES.md` - Detailed explanation of fixes and usage recommendations
- New documentation file: `docs/MIGRATION_GUIDE.md` - Step-by-step guide for upgrading from v0.1.0
- New documentation file: `docs/BUG_FIXES_CN.md` - Chinese documentation for fixes
- New documentation file: `docs/ENV_VARS_UPDATE_CN.md` - Chinese documentation for environment variable updates
- New example file: `examples/correct-format-example.md` - Demonstrates correct Markdown format with Chinese comments
- New template file: `.env.example` - Template for environment configuration
- New summary file: `UPDATE_COMPLETE_CN.md` - Chinese update summary

### Documentation
- **Important**: Clarified that `jira2md` is a **required dependency** for proper format conversion
- Added installation instructions emphasizing `jira2md` requirement in README
- Added troubleshooting section for format issues caused by missing `jira2md`
- Updated all documentation to include `jira2md` in installation commands

## [0.1.0] - 2025-10-10

### Added

#### Core Features
- Create-only import: Multi-Story Markdown → Jira Cloud issues by Story ID
- Read-only export: Jira Cloud issues → Single-Story Markdown files
- Interactive checkboxes: Acceptance Criteria as clickable task lists in Jira
- Unlimited pagination: Export all issues using Jira Cloud API v3
- Status mapping with aliases (Backlog, To Do, Ready, In Progress, In Review, Done)
- Deterministic, idempotent behavior keyed by Story ID
- Dry-run mode with structured logs for CI gates and preview

#### Format Support
- Rich text formatting: Headers (H1-H6), bold, italic, strikethrough
- Code blocks with syntax highlighting
- Lists: ordered, unordered, nested
- Interactive checkboxes for task tracking
- Links, blockquotes, tables, emoji support
- Atlassian Document Format (ADF) conversion pipeline
- High-fidelity Markdown ↔ Jira Wiki ↔ ADF conversion

#### Configuration & Validation
- Comprehensive configuration validation with clear error messages
- Format validation for Jira URL, email, API tokens, and project keys
- Jira Cloud API connectivity testing
- Directory management with automatic creation and permission validation
- CLI validation command (`validate-jira-config`)
- Environment variable configuration support

#### Advanced Features
- Enhanced error handling with recovery recommendations
- Performance optimization with validation caching (5-minute TTL)
- Directory access caching (30-second TTL)
- Performance benchmark testing tools
- Concurrent validation pipeline
- Label management with automatic creation
- Priority mapping to labels
- Member alias support for team assignments
- Custom JQL query support for flexible filtering
- Single-issue export capability

#### CLI Commands
- `md-to-jira` - Import Multi-Story markdown files to Jira (create-only)
- `jira-to-md` - Export all Jira issues to Single-Story markdown files
- `jira-sync` - Bidirectional sync between Jira and markdown
- `validate-jira-config` - Validate configuration and test Jira API connection

#### Developer Experience
- Full TypeScript support with type definitions
- Comprehensive documentation with examples
- Runnable examples in `examples/` directory
- Detailed troubleshooting guide
- Multiple configuration options
- Programmatic API for library usage

### Features

- TypeScript API with full type definitions
- Four CLI commands with help documentation
- Dry-run mode for previewing changes without API writes
- Status mapping with customizable aliases
- Idempotent operations keyed by Story ID
- Interactive checklist synchronization
- Label and member management
- Priority-based labeling
- Custom JQL query support
- Environment variable configuration
- Structured logging with custom logger support
- Single-issue and bulk export modes
- GitHub Actions workflow examples

### Documentation

- Comprehensive README with quick start guide
- Detailed configuration parameter reference
- Story file format specifications (Multi-Story and Single-Story)
- Common use cases and examples
- Troubleshooting guide with authentication and format issues
- API reference documentation
- How to get Jira API token guide
- Format conversion pipeline documentation
- GitHub Actions integration examples

### Technical

- Node.js 18+ support
- MIT License
- GitHub repository integration
- npm package with proper exports
- Source maps for debugging
- Declaration maps for IDE support
- Mocha test framework with NYC coverage
- Dependencies: jira-client, jira2md, unified/remark ecosystem

[0.1.0]: https://github.com/nzlouislu/jira-md-sync/releases/tag/v0.1.0
