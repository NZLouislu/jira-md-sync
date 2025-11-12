# Jira MD Sync

[![npm version](https://img.shields.io/badge/npm-v0.1.0-orange.svg)](https://www.npmjs.com/package/jira-md-sync)
![MD Sync Series](https://img.shields.io/badge/MD%20Sync%20Series-NZLouis-2EA44F?logo=githubactions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Bidirectional sync between Jira Cloud and Markdown files. Manage Jira issues as text files with full format support.

![Markdown Example](https://cdn.jsdelivr.net/gh/NZLouislu/jira-md-sync@main/images/jira-md-sync.png)

## Features

✅ **One-Way Sync**
- Import: Markdown → Jira (create-only, safe)
- Export: Jira → Markdown (backup/documentation)

✅ **Rich Format Support**
- Headers, bold, italic, code blocks, tables
- Interactive checkboxes for Acceptance Criteria
- Priority, labels, assignees, status

✅ **Developer Friendly**
- TypeScript API
- CLI commands
- Dry-run mode
- Unlimited pagination

## Requirements

- Node.js 18+
- Jira Cloud account with API access

## Installation

```bash
npm install jira-md-sync dotenv
npm install -D typescript ts-node @types/node
```

## Quick Start

### 1. Project Structure

```
your-project/
├── src/
│   └── jira/
│       ├── md-to-jira.ts      # Import script
│       ├── jira-to-md.ts      # Export script
│       └── md/                # Markdown files
│           └── stories.md
├── jira-exports/              # Exported files (gitignore)
├── .env                       # Jira credentials
├── .env.example              # Template
├── package.json
└── tsconfig.json
```

### 2. Environment Setup

Create `.env`:

```env
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=PROJ
JIRA_ISSUE_TYPE_ID=10001

# Optional: Custom status mapping (JSON format)
# Maps your markdown status names to Jira status names
# If not set, uses default mapping: Backlog→Backlog, In Progress→In Progress, etc.
# STATUS_MAP={"To Do":"Backlog","Code Review":"In Review","Closed":"Done"}
```

Get API token: https://id.atlassian.com/manage-profile/security/api-tokens

### 3. Package Configuration

Add to `package.json`:

```json
{
  "scripts": {
    "md-to-jira": "ts-node src/jira/md-to-jira.ts",
    "jira-to-md": "ts-node src/jira/jira-to-md.ts"
  },
  "dependencies": {
    "jira-md-sync": "^0.1.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "ts-node": "^10.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 4. Create Your First Story

Create `src/jira/md/stories.md`:

```markdown
## Backlog

- Story: Setup Project Infrastructure
  Description:
    Initialize the project with basic configuration.
    
    **Acceptance Criteria:**
    - [ ] Setup repository
    - [ ] Configure CI/CD
  Priority: High
  Labels: [setup, infrastructure]
```

**Note:** Don't include Story ID (like `PROJ-123`) - Jira will auto-generate it.

### 5. Run Import

```bash
npm run md-to-jira
```

Jira will create the issue and assign it an ID (e.g., `PROJ-1`).

## Usage

### Import Script (src/jira/md-to-jira.ts)

Create a script to import markdown files to Jira:

```typescript
import dotenv from 'dotenv';
import path from 'path';
import { mdToJira } from 'jira-md-sync';

dotenv.config();

async function main() {
  const result = await mdToJira({
    jiraConfig: {
      jiraUrl: process.env.JIRA_URL!,
      email: process.env.JIRA_EMAIL!,
      apiToken: process.env.JIRA_API_TOKEN!,
      projectKey: process.env.JIRA_PROJECT_KEY!,
      issueTypeId: process.env.JIRA_ISSUE_TYPE_ID
    },
    inputDir: path.join(__dirname, 'md'),
    dryRun: process.env.DRY_RUN === 'true',
    logger: console
  });

  console.log(`✅ Created: ${result.created}`);
  console.log(`⏭️  Skipped: ${result.skipped}`);
  
  if (result.errors.length > 0) {
    console.error('❌ Errors:', result.errors);
    process.exit(1);
  }
}

main().catch(console.error);
```

**Run:**
```bash
npm run md-to-jira
```

### Export Script (src/jira/jira-to-md.ts)

Create a script to export Jira issues to markdown:

```typescript
import dotenv from 'dotenv';
import path from 'path';
import { jiraToMd } from 'jira-md-sync';

dotenv.config();

async function main() {
  const args = process.argv.slice(2);
  const issueKey = args[0];
  const outputDir = args[1] || path.join(__dirname, '../jira-exports');

  let jql = process.env.JIRA_JQL;
  
  // Export single issue if key provided
  if (issueKey && /^[A-Z]+-\d+$/.test(issueKey)) {
    jql = `key = ${issueKey}`;
    console.log(`📄 Exporting single issue: ${issueKey}`);
  } else {
    console.log(`📦 Exporting all issues from project`);
  }

  const result = await jiraToMd({
    jiraConfig: {
      jiraUrl: process.env.JIRA_URL!,
      email: process.env.JIRA_EMAIL!,
      apiToken: process.env.JIRA_API_TOKEN!,
      projectKey: process.env.JIRA_PROJECT_KEY!
    },
    outputDir,
    jql,
    logger: console
  });

  console.log(`✅ Exported ${result.written} files from ${result.totalIssues} issues`);
}

main().catch(console.error);
```

**Run:**
```bash
# Export all issues
npm run jira-to-md

# Export single issue
npm run jira-to-md -- PROJ-123

# Export to custom directory
npm run jira-to-md -- PROJ-123 ./custom-output
```

## Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `JIRA_URL` | Yes | Jira instance URL | - |
| `JIRA_EMAIL` | Yes | Email for Jira authentication | - |
| `JIRA_API_TOKEN` | Yes | API token for authentication | - |
| `JIRA_PROJECT_KEY` | Yes | Jira project key (e.g., PROJ) | - |
| `JIRA_ISSUE_TYPE_ID` | No | Issue type ID for creating issues | `10001` |
| `STATUS_MAP` | No | Custom status mapping (JSON format) | See below |
| `DRY_RUN` | No | Set to "true" for dry run mode | `false` |

**Default Status Mapping:**
If `STATUS_MAP` is not set, the following default mapping is used:
- `Backlog`, `To Do`, `Ready` → `Backlog`
- `In Progress` → `In Progress`
- `In Review` → `In Review`
- `Done` → `Done`

**Custom Status Mapping Example:**
```env
STATUS_MAP={"To Do":"Backlog","Code Review":"In Review","Closed":"Done"}
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
| **Priority** | `Priority: High` | Jira priority field | ✅ |

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

## Markdown Format

### Input Format (src/jira/md/stories.md)

Create markdown files with multiple stories:

```markdown
## Backlog

- Story: Add User Profile Page
  Description:
    Create a user profile page with editable fields.
    
    **Acceptance Criteria:**
    - [ ] Design profile layout
    - [ ] Implement edit functionality
    - [ ] Add avatar upload
  Priority: High
  Labels: [frontend, ui]
  Assignees: Jane Smith
  Reporter: John Doe

- Story: Database Migration
  Description:
    Migrate from MySQL to PostgreSQL.
    
    **Acceptance Criteria:**
    - [ ] Export existing data
    - [ ] Create PostgreSQL schema
  Priority: Medium
  Labels: [backend, database]
  Assignees: John Doe

## In Progress

- Story: API Authentication
  Description: Implement JWT-based authentication
  Priority: High
  Labels: [backend, security]
```

**Important Notes:**
- ⚠️ **Do not include Story ID** (e.g., `PROJ-123`) in markdown
- Jira automatically generates Story IDs sequentially (PROJ-1, PROJ-2, etc.)
- This tool is **create-only** - use Jira UI for updates and refinements

**Status Sections:**
- `Backlog`, `To Do`, `Ready` → Backlog
- `In Progress` → In Progress
- `In Review` → In Review
- `Done` → Done

### Output Format (Exported from Jira)

Each issue exports to a separate file:

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

### Priority
High

### Labels
backend, security, authentication

### Assignees
John Doe

### Reporter
John Doe
```

## Dry Run Mode

Preview changes before executing:

```bash
DRY_RUN=true npm run md-to-jira
```

Or in code:
```typescript
const result = await mdToJira({
  jiraConfig,
  inputDir: './md',
  dryRun: true,
  logger: console
});
```

## Workflow & Limitations

### Recommended Workflow

**Markdown → Jira (Create Only)**
1. Write stories in markdown for quick bulk creation
2. Run `npm run md-to-jira` to create issues in Jira
3. Refine and update stories in Jira UI (use Jira's AI tools)
4. Jira becomes the single source of truth

**Jira → Markdown (Export Only)**
- Export for backup, documentation, or sharing
- Exported files are read-only references

### Behavior
- **Create-only**: Tool only creates new issues, never updates
- **Duplicate detection**: Existing issues (by title) are automatically skipped
- **Auto-generated IDs**: Jira assigns Story IDs sequentially (PROJ-1, PROJ-2, etc.)
- **Rate limits**: Large operations may hit Jira API limits

### Format Conversion
Some formats may not survive round-trip perfectly:
- Bold+Italic combination: `***text***`
- Strikethrough: `~~text~~`
- Template strings in code blocks
- Complex nested tables

**Workaround**: Verify complex formatting in Jira UI after import.

## Troubleshooting

**Authentication:**
- `401 Unauthorized`: Check JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN
- `403 Forbidden`: Verify project permissions
- Get API token: https://id.atlassian.com/manage-profile/security/api-tokens

**Common Issues:**
- "No stories found": Check markdown format (`- Story:` prefix required)
- "Issue already exists": Expected (create-only mode)
- Checkboxes not interactive: Use `- [ ]` format with spaces

**Debug:**
```bash
DRY_RUN=true npm run md-to-jira  # Preview without changes
```

## Feedback

If you encounter any problems during use, or have suggestions for improvement, feel free to contact me:

- 🌐 Personal Website: [https://nzlouis.com](https://nzlouis.com)
- 📝 Blog: [https://blog.nzlouis.com](https://blog.nzlouis.com)
- 💼 LinkedIn: [https://www.linkedin.com/in/ailouis](https://www.linkedin.com/in/ailouis)
- 📧 Email: nzlouis.com@gmail.com

You are also welcome to submit feedback directly in [GitHub Issues](https://github.com/nzlouislu/jira-md-sync/issues) 🙌

---

If you find this tool helpful, please consider giving it a ⭐️ Star on [GitHub](https://github.com/nzlouislu/jira-md-sync) to support the project, or connect with me on [LinkedIn](https://www.linkedin.com/in/ailouis).
