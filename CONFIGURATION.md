# Configuration Guide - Jira MD Sync

## Environment Variables

### Required Parameters

These parameters are **mandatory** for the tool to work:

| Parameter | Description | How to Get |
|-----------|-------------|------------|
| `JIRA_URL` | Your Jira Cloud instance URL | Format: `https://your-domain.atlassian.net` |
| `JIRA_EMAIL` | Your Jira account email | The email you use to log into Jira |
| `JIRA_API_TOKEN` | Your Jira API token (ATATT-prefixed) | Visit [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens) |
| `JIRA_PROJECT_KEY` | Target Jira project key | Found in your project settings or issue keys (e.g., PROJ in PROJ-123) |

**Example:**
```env
JIRA_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your.email@example.com
JIRA_API_TOKEN=ATATT3xFfGF0abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
JIRA_PROJECT_KEY=PROJ
```

### Optional Parameters

#### Directory Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `MD_INPUT_DIR` | `./jira` | Input directory for markdown files |
| `MD_OUTPUT_DIR` | `./jira` | Output directory for generated markdown files |

#### Jira Issue Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `JIRA_ISSUE_TYPE_ID` | `10001` | Issue type ID for creating issues (Story, Task, Bug, etc.) |
| `JIRA_JQL` | `project = {PROJECT_KEY} ORDER BY key ASC` | Custom JQL query for filtering issues |

**Example:**
```env
JIRA_ISSUE_TYPE_ID=10001
JIRA_JQL=project = PROJ AND status IN ('In Progress', 'In Review') ORDER BY created DESC
```

#### Status Mapping

Built-in status mapping with aliases:

| Input Status | Normalized Status |
|--------------|-------------------|
| `Backlog`, `To Do`, `Ready` | `Backlog` |
| `In Progress`, `In progress` | `In Progress` |
| `In Review`, `In review` | `In Review` |
| `Done` | `Done` |
| Any other | `Backlog` (default) |

#### Label Configuration

Labels in markdown files are automatically synced to Jira. No special configuration needed.

**Example in markdown:**
```markdown
Labels: [frontend, ui, high-priority]
```

#### Member Configuration

Assignees and reporters are synced using Jira account IDs or usernames.

**Example in markdown:**
```markdown
Assignees: jane.smith
Reporter: john.doe
```

#### Filtering Options

Use `JIRA_JQL` to filter issues during export:

**Example:**
```env
# Filter by status
JIRA_JQL=project = PROJ AND status = 'In Progress'

# Filter by assignee
JIRA_JQL=project = PROJ AND assignee = currentUser()

# Filter by labels
JIRA_JQL=project = PROJ AND labels IN (frontend, backend)

# Filter by date range
JIRA_JQL=project = PROJ AND created >= -30d

# Complex filter
JIRA_JQL=project = PROJ AND status IN ('In Progress', 'In Review') AND assignee = currentUser() ORDER BY priority DESC
```

#### Runtime Behavior

| Parameter | Default | Description |
|-----------|---------|-------------|
| `DRY_RUN` | `false` | Preview changes without executing API writes |

## Complete .env Template

```env
# ====================================
# REQUIRED: Jira API Configuration
# ====================================
# Get your API token from https://id.atlassian.com/manage-profile/security/api-tokens
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your.email@example.com
JIRA_API_TOKEN=ATATT3xFfGF0abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
JIRA_PROJECT_KEY=PROJ

# ====================================
# OPTIONAL: Directory Configuration
# ====================================
MD_INPUT_DIR=./md
MD_OUTPUT_DIR=./jira

# ====================================
# OPTIONAL: Jira Issue Configuration
# ====================================
# Issue type ID (10001=Story, 10002=Task, 10003=Bug, etc.)
JIRA_ISSUE_TYPE_ID=10001

# Custom JQL query for filtering issues
JIRA_JQL=project = PROJ ORDER BY key ASC

# ====================================
# OPTIONAL: Runtime Behavior
# ====================================
DRY_RUN=false
```

## Common Use Cases

### Basic Workflow

```bash
# 1. Validate your configuration
npm run validate

# 2. Preview what will be created (dry-run)
npm run md-to-jira -- stories/sprint-1.md --dry-run

# 3. Import stories to Jira
npm run md-to-jira -- stories/sprint-1.md

# 4. Export all issues from Jira
npm run jira-to-md

# 5. Export a single issue
npm run jira-to-md -- PROJ-123
```

### Team Collaboration

```env
# Configure Jira project
JIRA_PROJECT_KEY=TEAM
JIRA_ISSUE_TYPE_ID=10001

# Set input/output directories
MD_INPUT_DIR=./md
MD_OUTPUT_DIR=./jira
```

### CI/CD Integration

```bash
# Validate configuration in CI
npm run validate || exit 1

# Dry-run to check for issues
npm run md-to-jira -- stories/*.md --dry-run

# Import stories
npm run md-to-jira -- stories/*.md
```

### Filtering Exports

```bash
# Export only in-progress issues
JIRA_JQL="project = PROJ AND status = 'In Progress'" npm run jira-to-md

# Export issues assigned to current user
JIRA_JQL="project = PROJ AND assignee = currentUser()" npm run jira-to-md

# Export recent issues
JIRA_JQL="project = PROJ AND created >= -7d" npm run jira-to-md

# Export single issue
npm run jira-to-md -- PROJ-456
```

## Complete Example

Create a `.env` file in the project root:

```env
# Jira Configuration
JIRA_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your.email@example.com
JIRA_API_TOKEN=ATATT3xFfGF0abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
JIRA_PROJECT_KEY=PROJ
JIRA_ISSUE_TYPE_ID=10001

# Directory Configuration
MD_INPUT_DIR=./md
MD_OUTPUT_DIR=./jira

# Optional: Custom JQL
JIRA_JQL=project = PROJ ORDER BY key ASC
```

## Markdown Format

### Multi-Story Format (for Import)

```markdown
## Backlog

- Story: PROJ-101 User Authentication
  Story ID: PROJ-101
  Description:
    Implement JWT-based authentication for the API.
    
    **Acceptance Criteria:**
    - [ ] Create login endpoint
    - [ ] Implement token refresh
    - [ ] Add logout functionality
  Priority: High
  Labels: [backend, security]
  Assignees: john.doe
  Reporter: jane.smith

## In Progress

- Story: PROJ-102 Database Migration
  Story ID: PROJ-102
  Description:
    Migrate from MySQL to PostgreSQL.
    
    **Acceptance Criteria:**
    - [x] Export existing data
    - [ ] Create PostgreSQL schema
    - [ ] Import and verify data
  Priority: High
  Labels: [backend, database]
  Assignees: jane.smith
```

### Single-Story Format (from Export)

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

## Troubleshooting

### Authentication Errors

**Problem:** `HTTP 401 Unauthorized` or `HTTP 403 Forbidden`

**Solution:**
1. Verify `JIRA_URL` includes `https://` (e.g., `https://yourcompany.atlassian.net`)
2. Check `JIRA_EMAIL` matches your Jira account
3. Generate a new API token at: https://id.atlassian.com/manage-profile/security/api-tokens
4. Verify you have "Create Issues" permission in the project

### Format Issues

**Problem:** Checkboxes not interactive in Jira

**Solution:**
1. Ensure checkbox format is `- [ ]` (with spaces)
2. Update to latest version: `npm install jira-md-sync@latest`
3. Re-import the markdown file

### Missing Content

**Problem:** Description or acceptance criteria not showing in Jira

**Solution:**
1. Verify markdown syntax is correct
2. Use `--dry-run` to preview the conversion
3. Check that `Description:` section is properly indented

### Issue Already Exists

**Problem:** "Issue already exists" warning during import

**Solution:**
This is expected behavior (create-only mode). The tool skips existing issues to prevent overwrites. Use unique Story IDs for new issues.

## Testing Configuration

Test your configuration with dry-run mode:

```bash
npm run md-to-jira -- stories/test.md --dry-run
```

This will show what would be created without executing API writes.
