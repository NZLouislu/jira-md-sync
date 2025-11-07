# Jira MD Sync

[![npm version](https://img.shields.io/badge/npm-v0.1.0-orange.svg)](https://www.npmjs.com/package/jira-md-sync)
![MD Sync Series](https://img.shields.io/badge/MD%20Sync%20Series-NZLouis-2EA44F?logo=githubactions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Sync Jira issues with Markdown files. Licensed under the MIT License.

## Overview

A powerful CLI tool for bidirectional synchronization between Jira and Markdown files.

**Key Features:**
- **Export**: Jira issues → Markdown files (read-only export)
- **Import**: Markdown files → Jira issues (create/update)
- **Status Mapping**: Flexible status normalization with custom mappings
- **Dry-run Mode**: Preview changes before applying
- **Type-Safe**: Full TypeScript implementation

This tool enables teams to manage Jira issues as Markdown files, providing version control and text-based workflows while keeping Jira synchronized.

## Requirements

- Node.js 18 or newer
- Jira Cloud account with API access

## Quick Start

### 1. Install

```bash
npm install -g jira-md-sync
```

### 2. Setup Configuration

Create a `.env` file with your Jira credentials:

```env
# Required
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=PROJ

# Optional
MD_OUTPUT_DIR=./jira
MD_INPUT_DIR=./jira
JIRA_JQL=project = PROJ ORDER BY key ASC
JIRA_ISSUE_TYPE_ID=10001
```

**Get your Jira API token:** https://id.atlassian.com/manage-profile/security/api-tokens

### 3. Start Using

```bash
# Export Jira issues to markdown
jira-to-md

# Import markdown to Jira
md-to-jira

# Preview changes (dry-run)
DRY_RUN=true jira-to-md

# Validate configuration
validate-jira-config
```

## CLI Commands

### Export (Jira → Markdown)

```bash
# Export all issues from project
jira-to-md

# With custom JQL
JIRA_JQL="project = PROJ AND status = 'In Progress'" jira-to-md

# Dry run
DRY_RUN=true jira-to-md
```

### Import (Markdown → Jira)

```bash
# Import markdown files to Jira
md-to-jira

# Dry run
DRY_RUN=true md-to-jira
```

### Unified Sync CLI

```bash
# Export
PLATFORM=jira jira-sync export

# Import
PLATFORM=jira jira-sync import

# Validate config
PLATFORM=jira jira-sync validate
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JIRA_URL` | Yes | Jira instance URL (e.g., https://your-domain.atlassian.net) |
| `JIRA_EMAIL` | Yes | Email for Jira authentication |
| `JIRA_API_TOKEN` | Yes | API token for authentication |
| `JIRA_PROJECT_KEY` | Yes | Jira project key (e.g., PROJ) |
| `JIRA_JQL` | No | Custom JQL query for filtering issues |
| `JIRA_ISSUE_TYPE_ID` | No | Issue type ID for creating issues (default: 10001) |
| `MD_OUTPUT_DIR` | No | Output directory for markdown files (default: ./jira) |
| `MD_INPUT_DIR` | No | Input directory for markdown files (default: ./jira) |
| `DRY_RUN` | No | Set to "true" for dry run mode |

### Status Mapping

Default status mappings:

| Jira Status | Markdown Status |
|-------------|-----------------|
| To Do | Backlog |
| In Progress | In Progress |
| In Review | In Review |
| Done | Done |

Custom mappings can be configured via `statusMap` in the configuration.

## Usage as Library

### Installation

```bash
npm install jira-md-sync
```

### Export Jira to Markdown

```typescript
import { jiraToMd } from 'jira-md-sync';

const result = await jiraToMd({
  jiraConfig: {
    jiraUrl: 'https://your-domain.atlassian.net',
    email: 'your-email@example.com',
    apiToken: 'your-api-token',
    projectKey: 'PROJ'
  },
  outputDir: './jira',
  jql: 'project = PROJ ORDER BY key ASC',
  dryRun: false,
  logger: console
});

console.log(`Exported ${result.written} files from ${result.totalIssues} issues`);
```

### Import Markdown to Jira

```typescript
import { mdToJira } from 'jira-md-sync';

const result = await mdToJira({
  jiraConfig: {
    jiraUrl: 'https://your-domain.atlassian.net',
    email: 'your-email@example.com',
    apiToken: 'your-api-token',
    projectKey: 'PROJ',
    issueTypeId: '10001'
  },
  inputDir: './jira',
  dryRun: false,
  logger: console
});

console.log(`Processed ${result.processedFiles} files`);
console.log(`Created: ${result.created}, Updated: ${result.updated}`);
```

## Markdown Format

### Single-Story Format (Export)

Each exported file contains one Jira issue:

```markdown
## Story: PROJ-123 Implement User Authentication

### Story ID
PROJ-123

### Status
In Progress

### Description
Implement JWT-based authentication for the API.

### Acceptance Criteria
- [x] Create login endpoint
- [ ] Implement token refresh
- [ ] Add logout functionality

### Priority
High

### Labels
backend, security, authentication

### Assignees
john.doe, jane.smith
```

### Multi-Story Format (Import)

For importing multiple stories:

```markdown
## Backlog

- Story: PROJ-124 Add User Profile Page
  Description: Create a user profile page with editable fields
  Acceptance_Criteria:
    - [ ] Design profile layout
    - [ ] Implement edit functionality
    - [ ] Add avatar upload
  Priority: Medium
  Labels: [frontend, ui]
  Assignees: [jane.smith]

## In Progress

- Story: PROJ-125 Database Migration
  Description: Migrate from MySQL to PostgreSQL
  Priority: High
  Labels: [backend, database]
```

## Examples

See the `examples/` directory for complete working examples:

- `examples/jira-to-md.ts` - Export Jira issues to Markdown
- `examples/md-to-jira.ts` - Import Markdown to Jira
- `examples/check-jira-project.ts` - Verify Jira connection
- `examples/jira-config-example.json` - Configuration template

## API Reference

### jiraToMd(options)

Export Jira issues to Markdown files.

**Parameters:**
- `jiraConfig`: Jira configuration object
- `outputDir`: Output directory for markdown files
- `jql`: Optional JQL query for filtering
- `dryRun`: Preview mode (default: false)
- `logger`: Optional logger object

**Returns:** `Promise<{ written: number; files: Array; totalIssues: number }>`

### mdToJira(options)

Import Markdown files to Jira.

**Parameters:**
- `jiraConfig`: Jira configuration object
- `inputDir`: Input directory containing markdown files
- `dryRun`: Preview mode (default: false)
- `logger`: Optional logger object

**Returns:** `Promise<{ processedFiles: number; created: number; updated: number; errors: string[] }>`

## Troubleshooting

### Authentication Errors

- Verify your Jira URL is correct (should include https://)
- Check that your email matches your Jira account
- Ensure API token is valid and not expired
- Verify you have permission to access the project

### Connection Issues

```bash
# Test your connection
node examples/check-jira-project.ts
```

### Validation Errors

```bash
# Validate your configuration
validate-jira-config
```

## Development

```bash
# Clone repository
git clone https://github.com/nzlouislu/jira-md-sync.git
cd jira-md-sync

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Projects

- [trello-md-sync](https://github.com/nzlouislu/trello-md-sync) - Sync Trello boards with Markdown
- [github-projects-md-sync](https://github.com/nzlouislu/github-projects-md-sync) - Sync GitHub Projects with Markdown

## Contact

- 🌐 Website: [https://nzlouis.com](https://nzlouis.com)
- 📝 Blog: [https://blog.nzlouis.com](https://blog.nzlouis.com)
- 💼 LinkedIn: [https://www.linkedin.com/in/ailouis](https://www.linkedin.com/in/ailouis)
- 📧 Email: nzlouis.com@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/nzlouislu/jira-md-sync/issues)

---

If you find this tool helpful, please consider giving it a ⭐️ on [GitHub](https://github.com/nzlouislu/jira-md-sync)!
