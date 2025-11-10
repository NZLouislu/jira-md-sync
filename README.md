# Jira MD Sync

[![npm version](https://img.shields.io/badge/npm-v0.1.0-orange.svg)](https://www.npmjs.com/package/jira-md-sync)
![MD Sync Series](https://img.shields.io/badge/MD%20Sync%20Series-NZLouis-2EA44F?logo=githubactions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Sync Jira Cloud issues with Markdown files. Licensed under the MIT License.

![Markdown Example](https://cdn.jsdelivr.net/gh/NZLouislu/jira-md-sync@main/images/jira-md-sync.png)

## Overview

The latest release provides a safe, bidirectional sync model:
- Create-only import: Multi-Story Markdown → Jira issues (no overwrites)
- Read-only export: Jira issues → Single-Story Markdown files
- Interactive checkboxes: Acceptance Criteria as clickable task lists in Jira
- Unlimited pagination: Export all issues using Jira Cloud API v3
- Dry-run diagnostics for CI and previewing plans

This tool synchronizes Markdown documents and Jira Cloud so teams can manage issues in text while keeping Jira current.

## Requirements

- Node.js 18 or newer

## Features

- Create-only import: Multi-Story Markdown → Jira issues by Story ID
- Read-only export: Jira issues → Single-Story Markdown files
- Interactive checkboxes: Acceptance Criteria as clickable task lists
- Rich format support: Headers, bold, italic, strikethrough, code blocks, lists, links, tables, blockquotes
- Status mapping: Backlog, In Progress, In Review, Done (with aliases)
- Unlimited pagination: Export all issues using Jira Cloud API v3
- Deterministic, idempotent behavior keyed by Story ID
- Dry-run with structured logs for CI gates
- TypeScript API and runnable examples

## Quick start

1. Install the package in a Node.js workspace:

```bash
npm install jira-md-sync
```

2. Create a `.env` file in the project root with credentials that can access Jira Cloud:

```env
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=PROJ
```

**Get your Jira API token:** https://id.atlassian.com/manage-profile/security/api-tokens

3. Run the CLI commands or consume the TypeScript API as described below.

## Usage

### CLI

| Command | Purpose | Key options |
| --- | --- | --- |
| `npm run md-to-jira -- <path>` | Import Multi-Story Markdown into Jira (create-only) | `--dry-run` to print the plan without calling the API |
| `npm run jira-to-md [-- <ISSUE-KEY>] [<outputDir>]` | Export all issues or a single issue into Markdown files | Positional `ISSUE-KEY` selects a single issue, positional `outputDir` overrides the destination |
| `npm run jira-to-md:issue -- [ISSUE-KEY] [outputDir]` | Convenience wrapper for single-issue export | Accepts `ISSUE-KEY` and `outputDir` as positional args or via `--issue`, `--output` |

- Import Multi-Story Markdown to Jira (create-only):
```bash
npm run md-to-jira -- stories/test-multi-stories.md
```
- Optional dry-run plan: simulates the sync and prints the intended Jira mutations without executing API writes:
```bash
npm run md-to-jira -- stories/test-multi-stories.md --dry-run
```
- Export Jira issues to Single-Story Markdown files:
```bash
npm run jira-to-md
npm run jira-to-md -- PROJ-123
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JIRA_URL` | Yes | Jira instance URL (e.g., https://your-domain.atlassian.net) |
| `JIRA_EMAIL` | Yes | Email for Jira authentication |
| `JIRA_API_TOKEN` | Yes | API token for authentication |
| `JIRA_PROJECT_KEY` | Yes | Jira project key (e.g., PROJ) |
| `JIRA_JQL` | No | Custom JQL query for filtering issues (default: project = PROJ ORDER BY key ASC) |
| `JIRA_ISSUE_TYPE_ID` | No | Issue type ID for creating issues (default: 10001) |
| `MD_OUTPUT_DIR` | No | Output directory for markdown files (default: ./jira) |
| `MD_INPUT_DIR` | No | Input directory for markdown files (default: ./md) |
| `DRY_RUN` | No | Set to "true" for dry run mode |

### As a Library

```typescript
import {
  mdToJira,
  jiraToMd,
  jiraToMdSingleIssue
} from "jira-md-sync";

const jiraConfig = {
  jiraUrl: process.env.JIRA_URL!,
  email: process.env.JIRA_EMAIL!,
  apiToken: process.env.JIRA_API_TOKEN!,
  projectKey: process.env.JIRA_PROJECT_KEY!
};

// Import markdown files to Jira
const mdResult = await mdToJira({
  jiraConfig,
  inputDir: "./md",
  dryRun: false,
  logger: console
});

console.log(`Created ${mdResult.created} issues, skipped ${mdResult.skipped}`);

// Export all issues from Jira to markdown
const exportAllResult = await jiraToMd({
  jiraConfig,
  outputDir: "./jira",
  jql: "project = PROJ ORDER BY key ASC",
  logger: console
});

console.log(`Exported ${exportAllResult.totalIssues} issues to ${exportAllResult.written} files`);

// Export a single issue from Jira to markdown
const exportSingleResult = await jiraToMdSingleIssue({
  jiraConfig,
  issueKey: "PROJ-123",
  outputDir: "./jira",
  dryRun: false,
  logger: console
});

if (exportSingleResult.success) {
  console.log(`Exported ${exportSingleResult.storyId}: ${exportSingleResult.title}`);
  console.log(`File: ${exportSingleResult.file}`);
} else {
  console.error("Single issue export failed:", exportSingleResult.errors);
}
```

### Examples

The `examples/` workspace demonstrates end-to-end usage with ready-made scripts:

- `examples/md-to-jira.ts` — imports markdown from `examples/md/` into Jira.
- `examples/jira-to-md.ts` — exports Jira issues into `examples/jira/`.
- `examples/tests/` — Mocha scenarios that validate the flows.

Sample `package.json` scripts (from `examples/package.json`):

```json
{
  "scripts": {
    "md-to-jira": "ts-node ./md-to-jira.ts",
    "jira-to-md": "ts-node ./jira-to-md.ts",
    "jira-to-md:issue": "ts-node ./jira-to-md.ts --issue"
  }
}
```

Run them from the `examples/` directory once `.env` is configured:

```bash
npm run md-to-jira            # imports multi-story markdown from examples/md/
npm run jira-to-md            # exports all issues to examples/jira/
npm run jira-to-md:issue      # exports a single issue, prompting when IDs are missing
```

### Using jira-to-md:issue

```bash
npm run jira-to-md:issue -- PROJ-123
```

- Prompts for Jira credentials if env vars `JIRA_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, and `JIRA_PROJECT_KEY` are not set
- Generates markdown for the specified issue key under `jira/` by default
- Accepts `PROJ-XXX` via positional arg or `--issue PROJ-XXX`
- Overrides the output directory via positional path or `--output ./custom-dir`

Parameter rules:

- `ISSUE-KEY` positional detection checks for values that match `/^[A-Z]+-\d+$/i`. If omitted, all issues are exported.
- The first remaining positional argument is treated as the output directory. Without it, files are written to `./jira`.
- Flags `--issue=value` / `--output=value` are equivalent to their spaced counterparts.

Examples:

```bash
npm run jira-to-md -- PROJ-456
npm run jira-to-md ./jira/out -- PROJ-112
npm run jira-to-md:issue -- PROJ-112 ./jira/single
npm run jira-to-md:issue -- --issue PROJ-112 --output ./jira/single
```

## Format Support

| Element | Markdown | Jira Display | Status |
|---------|----------|--------------|--------|
| **Headers** | `# H1` to `###### H6` | H1-H6 headings | ✅ |
| **Bold** | `**text**` | **text** | ✅ |
| **Italic** | `*text*` | *text* | ✅ |
| **Bold+Italic** | `***text***` | ***text*** | ✅ |
| **Strikethrough** | `~~text~~` | ~~text~~ | ✅ |
| **Inline Code** | `` `code` `` | `code` | ✅ |
| **Code Blocks** | ` ```lang ` | Syntax-highlighted | ✅ |
| **Unordered Lists** | `- item` | • item | ✅ |
| **Ordered Lists** | `1. item` | 1. item | ✅ |
| **Nested Lists** | Indented items | Hierarchical | ✅ |
| **Checkboxes** | `- [ ] task` | ☐ Interactive checkbox | ✅ |
| **Links** | `[text](url)` | Clickable link | ✅ |
| **Blockquotes** | `> quote` | Quoted block | ✅ |
| **Tables** | Markdown tables | Jira tables | ✅ |
| **Emoji** | `:emoji:` or Unicode | Rendered emoji | ✅ |

### Interactive Checklists

Acceptance Criteria are converted to **interactive checkboxes** in Jira. Users can click checkboxes directly in Jira to track progress!

**Markdown:**
```markdown
**Acceptance Criteria:**
- [ ] Implement login endpoint
- [x] Add unit tests
- [ ] Update documentation
```

**Jira Display:**
- ☐ Implement login endpoint (clickable)
- ☑ Add unit tests (checked)
- ☐ Update documentation (clickable)

## Story File Formats

Two complementary formats are supported:

- Multi-Story files (for `mdToJira()` import)
- Single-Story files (for `jiraToMd()` export)

### Multi-Story format (md→jira)

Sections represent status. Each story must include `- Story:`, `Story ID:`, and `Description:`.

```markdown
## Backlog

- Story: PROJ-124 Add User Profile Page
  Story ID: PROJ-124
  Description:
    Create a user profile page with editable fields.
    
    Users should be able to view and edit their profile information.
    
    **Acceptance Criteria:**
    - [ ] Design profile layout
    - [ ] Implement edit functionality
    - [ ] Add avatar upload
  Priority: Medium
  Labels: [frontend, ui]
  Assignees: jane.smith
  Reporter: john.doe

## In Progress

- Story: PROJ-125 Database Migration
  Story ID: PROJ-125
  Description:
    Migrate from MySQL to PostgreSQL for better performance.
    
    This includes schema migration and data transfer.
    
    **Acceptance Criteria:**
    - [ ] Export existing data
    - [ ] Create PostgreSQL schema
    - [ ] Import and verify data
  Priority: High
  Labels: [backend, database]
  Assignees: john.doe

## In Review

- Story: PROJ-126 Improve accessibility
  Story ID: PROJ-126
  Description:
    Audit key screens and fix critical issues.
```

Rules:
- Allowed headings: Backlog, In Progress, In Review, Done
- Aliases: `To Do → Backlog`, `Ready → Backlog`
- Unrecognized headings map to Backlog
- `Story ID` must be unique; existing IDs in Jira are skipped (no update, no delete)
- Within a file, duplicate IDs: only the first entry is honored; later duplicates are skipped
- `Description:` content is free-form Markdown and preserved verbatim

### Single-Story format (jira→md, read-only)

Each file contains exactly one issue and includes a `Story ID` section.

```markdown
## Story: PROJ-123 Implement User Authentication

### Story ID

PROJ-123

### Status

In Progress

### Description

Implement JWT-based authentication for the API.

**Acceptance Criteria:**
- [x] Create login endpoint
- [ ] Implement token refresh
- [ ] Add logout functionality

### Priority

High

### Labels

backend, security, authentication

### Assignees

john.doe, jane.smith

### Reporter

john.doe
```

This format is generated by export and must not be used for import.

### Status mapping

`mdToJira()` normalizes headings/status strings using the logic in `src/jira/md-to-jira.ts`:

| Input heading / status | Stored status |
| --- | --- |
| `Backlog`, `To Do`, `Ready` | `Backlog` |
| `In Progress`, `In progress` | `In Progress` |
| `In Review`, `In review` | `In Review` |
| `Done` | `Done` |
| Any other heading | Treated as `Backlog` |

## Examples

### Basic Usage

**Export all issues from a project:**
```bash
export JIRA_URL="https://your-domain.atlassian.net"
export JIRA_EMAIL="your-email@example.com"
export JIRA_API_TOKEN="your-api-token"
export JIRA_PROJECT_KEY="PROJ"

jira-to-md
```

**Import markdown files to Jira:**
```bash
md-to-jira
```

**Filter by JQL:**
```bash
JIRA_JQL="project = PROJ AND status = 'In Progress'" jira-to-md
```

### Advanced Examples

See the `examples/` directory for complete working examples:

- `examples/md/test-format-rendering.md` - Format conversion test cases
- `examples/md/test-todo-list.md` - Multi-story import example
- `examples/README.md` - Detailed usage guide
- `examples/verify-single-issue.ts` - Issue inspection tool
- `examples/test-jira-api.ts` - API testing utility

### Programmatic Usage

**Export all issues with custom configuration:**
```typescript
import { jiraToMd } from 'jira-md-sync';

const result = await jiraToMd({
  jiraConfig: {
    jiraUrl: process.env.JIRA_URL!,
    email: process.env.JIRA_EMAIL!,
    apiToken: process.env.JIRA_API_TOKEN!,
    projectKey: 'PROJ',
    statusMap: {
      'To Do': 'Backlog',
      'Done': 'Completed'
    }
  },
  outputDir: './jira',
  jql: 'project = PROJ AND created >= -30d',
  logger: {
    info: (msg) => console.log(`[INFO] ${msg}`),
    error: (msg) => console.error(`[ERROR] ${msg}`)
  }
});

console.log(`Exported ${result.totalIssues} issues to ${result.written} files`);
```

**Export a single issue:**
```typescript
import { jiraToMdSingleIssue } from 'jira-md-sync';

const result = await jiraToMdSingleIssue({
  jiraConfig: {
    jiraUrl: process.env.JIRA_URL!,
    email: process.env.JIRA_EMAIL!,
    apiToken: process.env.JIRA_API_TOKEN!,
    projectKey: 'PROJ'
  },
  issueKey: 'PROJ-123',
  outputDir: './jira',
  dryRun: false
});

if (result.success) {
  console.log(`Exported: ${result.file}`);
} else {
  console.error('Export failed:', result.errors);
}
```

**Import with error handling:**
```typescript
import { mdToJira } from 'jira-md-sync';

try {
  const result = await mdToJira({
    jiraConfig: {
      jiraUrl: process.env.JIRA_URL!,
      email: process.env.JIRA_EMAIL!,
      apiToken: process.env.JIRA_API_TOKEN!,
      projectKey: 'PROJ',
      issueTypeId: '10001'
    },
    inputDir: './md',
    dryRun: false
  });

  console.log(`Created: ${result.created}`);
  console.log(`Skipped: ${result.skipped}`);
  
  if (result.errors.length > 0) {
    console.error('Errors:', result.errors);
  }
} catch (error) {
  console.error('Failed:', error.message);
}
```

## Advanced Features

### Pagination Support

Automatically handles Jira Cloud API v3 pagination to export **unlimited issues**:

```bash
# Export all issues (no 50-issue limit)
jira-to-md
```

The tool uses `nextPageToken` for efficient pagination and can export thousands of issues.

### Update Mode

**Default Behavior (Safe):**
- Creates new issues only
- Skips existing issues (no overwrites)
- Prevents accidental data loss

**Test Mode (Examples Only):**
```bash
# Enable update mode for testing
ALLOW_JIRA_UPDATE=true md-to-jira
```

⚠️ **Warning:** Update mode should only be used in test environments to avoid overwriting Jira data.

### Custom Status Mapping

Map Jira statuses to your workflow:

```typescript
const config = {
  statusMap: {
    'To Do': 'Backlog',
    'In Progress': 'In Progress',
    'Code Review': 'In Review',
    'Done': 'Done',
    'Closed': 'Done'
  }
};
```

### Format Conversion Pipeline

```
Markdown → jira2md → Jira Wiki → Custom Parser → ADF → Jira API
Jira API → ADF → Custom Parser → Jira Wiki → jira2md → Markdown
```

The tool uses **Atlassian Document Format (ADF)** for high-fidelity format conversion.

## Import and Export Behavior

- md→jira (import)
  - Input: Multi-Story files only
  - Action: Create new issues when `Story ID` does not exist in Jira; skip otherwise
  - No updates or deletes from Markdown
- jira→md (export)
  - Output: Multiple Single-Story files, each with `### Story ID`
  - Read-only: do not feed these files back into import

## API Reference

### mdToJira(options)

Import Multi-Story markdown files from a directory into Jira. Create-only and idempotent by Story ID.

**Parameters:**
- `jiraConfig`: Jira Cloud configuration (URL, email, API token, project key)
- `inputDir`: Path to directory containing markdown files (default: `./md`)
- `dryRun` (optional): Preview changes without executing API writes
- `logger` (optional): Custom logger for structured output

**Returns:**
```typescript
{
  created: number;      // Number of issues created
  skipped: number;      // Number of issues skipped (already exist)
  errors: string[];     // Array of error messages
}
```

### jiraToMd(options)

Export all Jira issues to Single-Story markdown files.

**Parameters:**
- `jiraConfig`: Jira Cloud configuration (URL, email, API token, project key)
- `outputDir` (optional): Output directory path (default: `./jira`)
- `jql` (optional): Custom JQL query for filtering issues
- `dryRun` (optional): Preview changes without executing API writes
- `logger` (optional): Custom logger for structured output

**Returns:**
```typescript
{
  written: number;      // Number of files written
  files: Array<{        // Array of exported files
    file: string;       // File path
    storyId: string;    // Issue key
    title: string;      // Issue title
    status: string;     // Issue status
  }>;
  totalIssues: number;  // Total number of issues fetched
}
```

### jiraToMdSingleIssue(options)

Export a single Jira issue to a markdown file.

**Parameters:**
- `jiraConfig`: Jira Cloud configuration (URL, email, API token, project key)
- `issueKey`: Jira issue key (e.g., "PROJ-123")
- `outputDir` (optional): Output directory path (default: `./jira`)
- `dryRun` (optional): Preview changes without executing API writes
- `logger` (optional): Custom logger for structured output

**Returns:**
```typescript
{
  success: boolean;     // Whether the export succeeded
  file?: string;        // File path (if successful)
  storyId?: string;     // Issue key (if successful)
  title?: string;       // Issue title (if successful)
  status?: string;      // Issue status (if successful)
  errors?: string[];    // Array of error messages (if failed)
}
```

## Limitations and caveats

- The importer is create-only. Updating or deleting existing Jira issues must be done in Jira Cloud.
- Exporters overwrite files with the same name inside the target directory.
- All commands expect `JIRA_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, and `JIRA_PROJECT_KEY` to be available; the API token must allow Jira Cloud access.
- Large exports/imports may trigger Jira API rate limits. Use `--dry-run` to validate before executing.
- `Story ID` matching is case-insensitive, but duplicates in the same markdown file keep only the first occurrence.

## Story ID

- Matching uses Story ID only; titles never overwrite existing issues
- If an issue with the same ID exists in Jira: skip
- Missing `Story ID`: strictly skipped and logged with file name, start line, and title
- Missing ID plus exact title match triggers an additional "Possible title duplicate" warning

## Dry-run and Diagnostics

Use dry-run to preview planned operations, with logs covering create plans, skip reasons, missing IDs, duplicates, and unknown keys. Ideal for CI gates and author feedback.

## Format Conversion Pipeline

```
Markdown → jira2md → Jira Wiki → Custom Parser → ADF → Jira API
Jira API → ADF → Custom Parser → Jira Wiki → jira2md → Markdown
```

The tool uses **Atlassian Document Format (ADF)** for high-fidelity format conversion.

**Checkbox Implementation:**
- Markdown `- [ ]` → Jira Wiki `- [ ]` → ADF `taskItem` (state: TODO)
- Markdown `- [x]` → Jira Wiki `- [x]` → ADF `taskItem` (state: DONE)
- Interactive checkboxes in Jira UI for task tracking

**Special Handling:**
- Strikethrough: `~~text~~` → Jira Wiki `-text-` → ADF strike mark
- Bold+Italic: `***text***` → Jira Wiki `_*text*_` → ADF strong+em marks
- Code blocks: Language-specific syntax highlighting preserved

## Troubleshooting

**Authentication Errors:**
- `HTTP 401 Unauthorized`: Verify Jira URL (must include `https://`), email, and API token validity
- `HTTP 403 Forbidden`: Check project access permissions and "Create Issues" permission
- Generate new token at: https://id.atlassian.com/manage-profile/security/api-tokens

**Format Issues:**
- Checkboxes not interactive: Ensure format is `- [ ]` (with spaces), update to latest version
- Missing content: Verify markdown syntax, use `--dry-run` to preview

**Common Errors:**
- "No stories found": Check markdown format matches expected structure (`- Story:` prefix)
- "Issue already exists": Expected behavior (create-only mode), use unique Story IDs

## GitHub Actions

### MD Sync

```yaml
name: MD Sync
on:
  push:
    paths:
      - examples/md/**/*.md
  workflow_dispatch:
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - env:
          JIRA_URL: ${{ secrets.JIRA_URL }}
          JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
          JIRA_PROJECT_KEY: ${{ secrets.JIRA_PROJECT_KEY }}
        run: npx ts-node examples/md-to-jira.ts
```

### Daily Jira to MD

```yaml
name: Daily Jira to MD
on:
  schedule:
    - cron: "0 16 * * *"
  workflow_dispatch:
jobs:
  export:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - env:
          JIRA_URL: ${{ secrets.JIRA_URL }}
          JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
          JIRA_PROJECT_KEY: ${{ secrets.JIRA_PROJECT_KEY }}
        run: npx ts-node examples/jira-to-md.ts examples/jira
```

## Notes

- Requires Node.js 18+
- Runs in Node.js/server environments, not in the browser

## Feedback

If you encounter any problems during use, or have suggestions for improvement, feel free to contact me:

- 🌐 Personal Website: [https://nzlouis.com](https://nzlouis.com)
- 📝 Blog: [https://blog.nzlouis.com](https://blog.nzlouis.com)
- 💼 LinkedIn: [https://www.linkedin.com/in/ailouis](https://www.linkedin.com/in/ailouis)
- 📧 Email: nzlouis.com@gmail.com

You are also welcome to submit feedback directly in [GitHub Issues](https://github.com/nzlouislu/jira-md-sync/issues) 🙌

---

If you find this tool helpful, please consider giving it a ⭐️ Star on [GitHub](https://github.com/nzlouislu/jira-md-sync) to support the project, or connect with me on [LinkedIn](https://www.linkedin.com/in/ailouis).
