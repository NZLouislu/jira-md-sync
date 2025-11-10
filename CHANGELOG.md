# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
