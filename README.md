# Jira MD Sync

[![npm version](https://img.shields.io/badge/npm-v0.1.0-orange.svg)](https://www.npmjs.com/package/jira-md-sync)
![MD Sync Series](https://img.shields.io/badge/MD%20Sync%20Series-NZLouis-2EA44F?logo=githubactions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Bidirectional sync between Jira Cloud and Markdown files. Manage Jira issues as text files with full format support.

## How It Works

**Markdown → Jira (Import)**
```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Markdown File  │  ────>  │    npm run       │  ────>  │   Jira Issues   │
│                 │         │   md-to-jira     │         │                 │
│  - Story A      │         │                  │         │  ✓ PROJ-1       │
│  - Story B      │         │  ✓ Created 5     │         │  ✓ PROJ-2       │
│  - Story C      │         │  ✓ Skipped 2     │         │  ✓ PROJ-3       │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

**Jira → Markdown (Export)**
```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Jira Issues   │  ────>  │    npm run       │  ────>  │ Markdown Files  │
│                 │         │   jira-to-md     │         │                 │
│  ✓ PROJ-1       │         │                  │         │  PROJ-1.md      │
│  ✓ PROJ-2       │         │  ✓ Exported 5    │         │  PROJ-2.md      │
│  ✓ PROJ-3       │         │                  │         │  PROJ-3.md      │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```
## See It In Action
![Markdown Example](https://cdn.jsdelivr.net/gh/NZLouislu/jira-md-sync@main/images/jira-md-sync.png)
*Left: Write stories in Markdown | Right: See them in Jira*

## Features

✅ **Batch Story Management**
- **Input**: Multiple stories in one markdown file
- **Output**: One file per Jira issue
- Organize stories by feature, sprint, or category

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
├── jiramd/                    # Input: Source markdown files (edit here)
│   └── multi-story.md        # ⭐ One file with MULTIPLE stories
├── jira/                      # Output: Synced from Jira (auto-generated)
│   ├── PROJ-1-story.md        # One file per issue
│   ├── PROJ-2-story.md
│   └── PROJ-3-story.md
├── src/
│   └── jira/
│       ├── md-to-jira.ts     # Import script
│       └── jira-to-md.ts     # Export script
├── .env                       # Jira credentials
├── .env.example              # Template
├── .gitignore                # Ignore jira/ directory
├── package.json
└── tsconfig.json
```

**Directory Explanation:**

📝 **`jiramd/multi-story.md`** - Your source file (manually edited)
  - **One file contains MULTIPLE stories** organized by status sections
  - Example: 10 stories in Backlog, 5 in Progress → all in one file
  - Commit to Git for version control
  - This is your "source of truth" for local edits
  - You can create multiple files if needed (e.g., `features.md`, `bugs.md`)
  
📦 **`jira/`** - Synced cache from Jira (auto-generated)
  - **One file per Jira issue** (split from your multi-story file)
  - Example: `multi-story.md` with 15 stories → creates 15 separate files
  - Add to `.gitignore` (regenerated from Jira)
  - Used for comparison and verification

**Input vs Output:**

| Input (`jiramd/multi-story.md`) | Output (`jira/`) |
|----------------------------------|------------------|
| 1 file = Multiple stories | 1 file = 1 issue |
| Organized by status sections | Organized by Jira key |
| `## Backlog`<br>`- Story: A`<br>`- Story: B`<br>`- Story: C` | `PROJ-1-story-a.md`<br>`PROJ-2-story-b.md`<br>`PROJ-3-story-c.md` |

**Why Separate Directories?**
- ✅ **Safety**: Source files never get overwritten
- ✅ **Clarity**: Easy to see what's local vs. synced
- ✅ **Flexibility**: Compare differences before merging
- ✅ **Git-friendly**: Only commit source files
- ✅ **Batch editing**: Edit multiple stories in one file, upload all at once

### 2. Environment Setup

Create `.env`:

```env
# Jira Connection
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=PROJ
JIRA_ISSUE_TYPE_ID=10001

# Directory Configuration (Optional)
# Input: Where you edit markdown files (default: jiramd)
MD_INPUT_DIR=jiramd

# Output: Where Jira exports go (default: jira)
MD_OUTPUT_DIR=jira

# Optional: Custom status mapping (JSON format)
# Maps your markdown status names to Jira status names
# If not set, uses default mapping: Backlog→Backlog, In Progress→In Progress, etc.
# STATUS_MAP={"To Do":"Backlog","Code Review":"In Review","Closed":"Done"}
```

**Directory Configuration:**
- If not set, uses defaults: `jiramd/` (input), `jira/` (output)
- Can be overridden via environment variables or command line

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

## Usage

### Import Script (src/jira/md-to-jira.ts)

Create a script to import markdown files to Jira:

```typescript
import dotenv from 'dotenv';
import path from 'path';
import { mdToJira } from 'jira-md-sync';

dotenv.config();

async function main() {
  // Input directory: where you edit markdown files
  // Priority: CLI arg > MD_INPUT_DIR > default (jiramd)
  const inputDir = process.env.MD_INPUT_DIR || 
                   path.join(process.cwd(), 'jiramd');

  const result = await mdToJira({
    jiraConfig: {
      jiraUrl: process.env.JIRA_URL!,
      email: process.env.JIRA_EMAIL!,
      apiToken: process.env.JIRA_API_TOKEN!,
      projectKey: process.env.JIRA_PROJECT_KEY!,
      issueTypeId: process.env.JIRA_ISSUE_TYPE_ID
    },
    inputDir,
    dryRun: false,  // Set to true to preview without creating issues
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
# Create issues in Jira
npm run md-to-jira
```

**Use Custom Directory:**
Set in `.env` file (recommended, works on all platforms):
```env
MD_INPUT_DIR=custom/path
```

Or use environment variable:
```bash
# Linux/macOS
MD_INPUT_DIR=custom/path npm run md-to-jira

# Windows PowerShell
$env:MD_INPUT_DIR='custom/path'; npm run md-to-jira

# Windows CMD
set MD_INPUT_DIR=custom/path&& npm run md-to-jira
```

**Dry Run Mode:**
Set in `.env` file (recommended):
```env
DRY_RUN=true
```

Or use environment variable:
```bash
# Linux/macOS
DRY_RUN=true npm run md-to-jira

# Windows PowerShell
$env:DRY_RUN='true'; npm run md-to-jira

# Windows CMD
set DRY_RUN=true&& npm run md-to-jira
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
  
  // Output directory: where Jira exports go
  // Priority: CLI arg > MD_OUTPUT_DIR > default (jira)
  const outputDir = args[1] || 
                    process.env.MD_OUTPUT_DIR || 
                    path.join(process.cwd(), 'jira');

  // Input directory: for preserving labels order
  const inputDir = process.env.MD_INPUT_DIR || 
                   path.join(process.cwd(), 'jiramd');

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
    inputDir,  // For preserving labels order
    jql,
    logger: console
  });

  console.log(`✅ Exported ${result.written} files from ${result.totalIssues} issues`);
}

main().catch(console.error);
```

**Run:**
```bash
# Export all issues (to jira/ directory)
npm run jira-to-md

# Export single issue
npm run jira-to-md -- PROJ-123
```

**Use Custom Output Directory:**
Set in `.env` file (recommended, works on all platforms):
```env
MD_OUTPUT_DIR=exports
```

Or use environment variable:
```bash
# Linux/macOS
MD_OUTPUT_DIR=exports npm run jira-to-md

# Windows PowerShell
$env:MD_OUTPUT_DIR='exports'; npm run jira-to-md

# Windows CMD
set MD_OUTPUT_DIR=exports&& npm run jira-to-md
```

## Configuration

### Directory Configuration

The tool uses separate directories for input (source) and output (cache):

**Default Directories:**
- Input: `jiramd/` - Your markdown source files
- Output: `jira/` - Synced from Jira (cache)

**Configuration Methods:**

1. **Environment Variables in .env File** (Recommended - works on all platforms)
```env
MD_INPUT_DIR=jiramd
MD_OUTPUT_DIR=jira
```

2. **Command Line Environment Variables**

Linux/macOS:
```bash
MD_INPUT_DIR=custom/input npm run md-to-jira
MD_OUTPUT_DIR=custom/output npm run jira-to-md
```

Windows PowerShell:
```powershell
$env:MD_INPUT_DIR='custom/input'; npm run md-to-jira
$env:MD_OUTPUT_DIR='custom/output'; npm run jira-to-md
```

Windows CMD:
```cmd
set MD_INPUT_DIR=custom/input&& npm run md-to-jira
set MD_OUTPUT_DIR=custom/output&& npm run jira-to-md
```

3. **Programmatic**
```typescript
await mdToJira({
  jiraConfig: { /* ... */ },
  inputDir: './custom/input',
  // ...
});

await jiraToMd({
  jiraConfig: { /* ... */ },
  outputDir: './custom/output',
  inputDir: './custom/input',  // For preserving labels order
  // ...
});
```

**Priority Order:**
1. Command line argument (highest)
2. Environment variable (`MD_INPUT_DIR`, `MD_OUTPUT_DIR`)
3. Default value (`jiramd`, `jira`)

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `JIRA_URL` | Yes | Jira instance URL | - |
| `JIRA_EMAIL` | Yes | Email for Jira authentication | - |
| `JIRA_API_TOKEN` | Yes | API token for authentication | - |
| `JIRA_PROJECT_KEY` | Yes | Jira project key (e.g., PROJ) | - |
| `JIRA_ISSUE_TYPE_ID` | No | Issue type ID for creating issues | `10001` |
| `MD_INPUT_DIR` | No | Input directory (source markdown files) | `jiramd` |
| `MD_OUTPUT_DIR` | No | Output directory (Jira exports) | `jira` |
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
Acceptance_Criteria:
- [ ] Implement login endpoint
- [x] Add unit tests
- [ ] Update documentation
```

**Jira Display:**
- ☐ Implement login endpoint (clickable)
- ☑ Add unit tests (checked)
- ☐ Update documentation (clickable)

## Input vs Output Files

### Key Differences

| Aspect | Input Files (`jiramd/`) | Output Files (`jira/`) |
|--------|------------------------|------------------------|
| **Purpose** | Source files for editing | Sync cache from Jira |
| **File Structure** | Multiple stories per file | One file per issue |
| **Naming** | Your choice (e.g., `features.md`) | Auto-generated (`JMS-1-title.md`) |
| **Story ID** | No Story ID needed | Includes Jira key (JMS-1) |
| **Git** | ✅ Commit to version control | ❌ Add to `.gitignore` |
| **Editing** | ✅ Edit freely | ❌ Read-only (regenerated) |
| **Organization** | By feature/sprint/category | By Jira issue |

### Example Workflow

```bash
# 1. Create/edit ONE source file with MULTIPLE stories
$ cat jiramd/multi-story.md
## Backlog
- Story: Feature A
  Description: ...
- Story: Feature B
  Description: ...
- Story: Feature C
  Description: ...

## In Progress
- Story: Feature D
  Description: ...
- Story: Feature E
  Description: ...

# Total: 5 stories in 1 file

# 2. Upload to Jira (creates 5 separate issues)
$ npm run md-to-jira
md-to-jira: Created "Feature A" as JMS-1
md-to-jira: Created "Feature B" as JMS-2
md-to-jira: Created "Feature C" as JMS-3
md-to-jira: Created "Feature D" as JMS-4
md-to-jira: Created "Feature E" as JMS-5
✅ Created: 5 issues from 1 file

# 3. Export from Jira (creates 5 separate files)
$ npm run jira-to-md
✅ Exported 5 files

# 4. Check output (one file per issue)
$ ls jira/
JMS-1-feature-a.md
JMS-2-feature-b.md
JMS-3-feature-c.md
JMS-4-feature-d.md
JMS-5-feature-e.md

# 5. Compare if needed
$ diff jiramd/multi-story.md jira/JMS-1-feature-a.md
# Shows differences between your source and Jira's version
```

## Markdown Format

### Input Format (jiramd/multi-story.md)

**⭐ Key Concept:** Input files contain **MULTIPLE stories in a SINGLE file**. This is the main difference from output files.

**Example:** One `multi-story.md` file can contain:
- 10 stories in Backlog section
- 5 stories in In Progress section  
- 3 stories in Done section
- **Total: 18 stories in 1 file** → Creates 18 separate Jira issues

Create a markdown file with multiple stories organized by status sections:

```markdown
## Backlog

- Story: Add User Profile Page
  Description:
    Create a user profile page with editable fields.
    
    Acceptance_Criteria:
    - [ ] Design profile layout
    - [ ] Implement edit functionality
    - [ ] Add avatar upload
  Priority: High
  Labels: [frontend, ui]
  Assignees: Alice Chen
  Reporter: Bob Wilson

- Story: Database Migration
  Description:
    Migrate from MySQL to PostgreSQL.
    
    Acceptance_Criteria:
    - [ ] Export existing data
    - [ ] Create PostgreSQL schema
  Priority: Medium
  Labels: [backend, database]
  Assignees: David Lee

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
- 📝 **Multiple stories per file** - Organize stories by feature, sprint, or category
- 📁 **File organization** - Create multiple files in `jiramd/` directory:
  - `jiramd/features.md` - Feature stories
  - `jiramd/bugs.md` - Bug fixes
  - `jiramd/sprint-1.md` - Sprint-specific stories

**Status Sections:**
- `Backlog`, `To Do`, `Ready` → Backlog
- `In Progress` → In Progress
- `In Review` → In Review
- `Done` → Done

### Output Format (Exported from Jira)

**Important:** Output files are **one file per Jira issue**. Each issue is exported to a separate file in the `jira/` directory with the format `{KEY}-{title}.md`.

Each issue exports to a separate file:

```markdown
## Story: PROJ-123 Implement User Authentication

### Story ID
PROJ-123

### Status
In Progress

### Description
Implement JWT-based authentication for the API.

Acceptance_Criteria:
- [x] Create login endpoint
- [ ] Implement token refresh

### Priority
High

### Labels
backend, security, authentication

### Assignees
Alice Chen

### Reporter
Bob Wilson
```

## Dry Run Mode

Preview changes before executing.

**Method 1: Set in .env file (recommended)**
```env
DRY_RUN=true
```

Then run:
```bash
npm run md-to-jira
```

**Method 2: Command line environment variable**
```bash
# Linux/macOS
DRY_RUN=true npm run md-to-jira

# Windows PowerShell
$env:DRY_RUN='true'; npm run md-to-jira

# Windows CMD
set DRY_RUN=true&& npm run md-to-jira
```

**Method 3: Set in code**
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
- "Input directory not found": Check `JIRA_INPUT_DIR` or create `jiramd/` directory
- Checkboxes not interactive: Use `- [ ]` format with spaces
- Labels order changed: Tool now preserves original order from input files

**Directory Issues:**
```bash
# Check current configuration
$ node -e "console.log('Input:', process.env.MD_INPUT_DIR || 'jiramd'); console.log('Output:', process.env.MD_OUTPUT_DIR || 'jira')"

# Create default directories
$ mkdir -p jiramd jira

# Verify directory structure
$ ls -la
drwxr-xr-x  jiramd/    # Your source files
drwxr-xr-x  jira/      # Jira sync cache
```

**Debug:**

Set in `.env` file:
```env
DRY_RUN=true
```

Or use command line:
```bash
# Linux/macOS
DRY_RUN=true npm run md-to-jira

# Windows PowerShell
$env:DRY_RUN='true'; npm run md-to-jira

# Windows CMD
set DRY_RUN=true&& npm run md-to-jira
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
