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

### Test Only: Update Mode (⚠️ For Testing Only)

```bash
npm run md-to-jira:update
```

**Behavior:**
- ✅ Creates new issues
- ⚠️ **Updates existing issues** (by storyId)
- **Warning:** This will overwrite content in Jira!
- **Purpose:** Only for testing format conversion

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

### Why No Updates by Default?

1. **Avoid Conflicts** - Content in Jira may have been modified by others
2. **One-way Sync** - Jira is the source of truth, Markdown is the export format
3. **Safety** - Prevents accidental overwriting of important data

### When to Use Update Mode?

**Only use `md-to-jira:update` in these cases:**
- ✅ Testing format conversion functionality
- ✅ Verifying markdown to Jira rendering
- ✅ Development and debugging

**Do NOT use in these cases:**
- ❌ Production environment
- ❌ Team collaboration projects
- ❌ Issues that have been edited by others

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

# For testing only (do NOT set in production)
# ALLOW_JIRA_UPDATE=true
```

## Recommended Workflows

### Normal Usage Flow

1. **Export from Jira** → `npm run jira-to-md`
2. **Edit markdown files**
3. **Create new issues** → `npm run md-to-jira`
4. **Edit and manage issues in Jira**

### Format Testing Flow

1. **Create test markdown** → Edit `md/test-*.md`
2. **Upload to Jira (update mode)** → `npm run md-to-jira:update`
3. **Verify format in Jira**
4. **Export for verification** → `npm run jira-to-md`
5. **Compare format correctness**

## Notes

- Update mode is controlled by the `ALLOW_JIRA_UPDATE=true` environment variable
- This variable **should NOT** be set in production `.env` files
- When published as an npm package, the default behavior is create-only, no updates
- This ensures users won't accidentally overwrite data in Jira
