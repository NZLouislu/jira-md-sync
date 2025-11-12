# Jira MD Sync - Examples

This directory contains test and example scripts.

## Commands

### Import Markdown to Jira (Create New Issues)

```bash
npm run md-to-jira
```

**Behavior:**
- ✅ Creates new issues
- ❌ Skips existing issues (no updates)
- This is the **default and recommended** behavior

### Export Jira to Markdown

```bash
npm run jira-to-md
```

**Behavior:**
- Exports all issues from Jira to markdown files
- Supports pagination, can export unlimited issues (not limited to 50)

### Other Commands

```bash
# Dry-run mode (preview without executing)
npm run md-to-jira:dry-run

# Debug mode (show detailed logs)
npm run md-to-jira:debug

# Export a single issue
npm run jira-to-md -- PROJ-123
```

## Important Notes

### Why No Updates?

This tool is **create-only** by design:

1. **Avoid Conflicts** - Content in Jira may have been modified by others
2. **One-way Sync** - Jira is the source of truth, Markdown is for bulk creation
3. **Safety** - Prevents accidental overwriting of important data

**Recommended Workflow:**
- Use markdown for quick bulk creation of issues
- Manage and update issues in Jira UI
- Export from Jira for backup/documentation

## Test Files

- `md/test-format-rendering.md` - Format testing (10 stories)
- `md/test-todo-list.md` - Todo list testing (20 stories)
- `md/test-formats.md` - Format specification testing (13 stories)

## Environment Variables

Configure in `.env` file:

```env
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your.email@example.com
JIRA_API_TOKEN=your_api_token_here
JIRA_PROJECT_KEY=PROJ
JIRA_ISSUE_TYPE_ID=10001

# Optional: Custom status mapping (JSON format)
# STATUS_MAP={"To Do":"Backlog","Code Review":"In Review","Closed":"Done"}
```

## Recommended Workflows

### Normal Usage Flow

1. **Create markdown files** → Edit `md/*.md`
2. **Import to Jira** → `npm run md-to-jira`
3. **Manage issues in Jira UI**
4. **Export for backup** → `npm run jira-to-md`

### Format Testing Flow

1. **Create test markdown** → Edit `md/test-*.md`
2. **Import to Jira** → `npm run md-to-jira`
3. **Verify format in Jira**
4. **Export for verification** → `npm run jira-to-md`
5. **Compare format correctness**
