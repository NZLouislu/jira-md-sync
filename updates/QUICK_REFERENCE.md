# Quick Reference Guide

## Installation

```bash
npm install jira-md-sync
```

## Setup

Create `.env` file:
```env
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=PROJ
JIRA_ISSUE_TYPE_ID=10001
JIRA_MD_INPUT_DIR=./md
JIRA_MD_OUTPUT_DIR=./jira
```

## Common Commands

### Import Markdown to Jira

```bash
# Import all markdown files
npm run md-to-jira

# Import specific file
npm run md-to-jira -- ./stories/my-story.md

# Dry run (preview only)
DRY_RUN=true npm run md-to-jira
```

### Export Jira to Markdown

```bash
# Export all issues
npm run jira-to-md

# Export single issue
npm run jira-to-md -- PROJ-123

# Export to custom directory
npm run jira-to-md -- PROJ-123 ./output

# Export with custom JQL
JIRA_JQL="project = PROJ AND status = 'In Progress'" npm run jira-to-md
```

### Update Existing Issues

```bash
# Enable update mode (use with caution!)
ALLOW_JIRA_UPDATE=true npm run md-to-jira

# Dry run first (recommended)
ALLOW_JIRA_UPDATE=true DRY_RUN=true npm run md-to-jira
```

## PowerShell Commands

```powershell
# Dry run
$env:DRY_RUN="true"; npm run md-to-jira

# Update mode
$env:ALLOW_JIRA_UPDATE="true"; $env:DRY_RUN="false"; npm run md-to-jira

# Custom JQL
$env:JIRA_JQL="project = PROJ AND status = 'Done'"; npm run jira-to-md
```

## Markdown Format

### Multi-Story Format (for import)

```markdown
## Backlog

- Story: PROJ-123 Story Title
  Description: Story description here
  
    Additional content with proper indentation
    
  Acceptance_Criteria:
    - [ ] Criterion 1
    - [ ] Criterion 2
  Priority: High
  Labels: [feature, backend]
  Assignees: John Doe
  Reporter: Jane Smith
```

### Single-Story Format (from export)

```markdown
## Story: PROJ-123 Story Title

### Story ID
PROJ-123

### Status
In Progress

### Description
Story description here

### Priority
High

### Labels
backend, feature

### Assignees
John Doe

### Reporter
Jane Smith
```

## Priority Values

- Highest (ID: 1)
- High (ID: 2)
- Medium (ID: 3)
- Low (ID: 4)
- Lowest (ID: 5)

## Supported Formats

✅ Headers (H1-H6)
✅ Bold, Italic, Inline Code
✅ Code Blocks (with language tags)
✅ Lists (ordered, unordered, nested)
✅ Links
✅ Tables
✅ Blockquotes
✅ Checkboxes (interactive in Jira)
✅ Emojis & Unicode
✅ Priority field

⚠️ Known Limitations:
- Bold+Italic combination may vary
- Strikethrough format may change
- Template strings in code blocks

## Troubleshooting

### Authentication Error
```bash
# Verify credentials
echo $JIRA_URL
echo $JIRA_EMAIL
# Generate new token: https://id.atlassian.com/manage-profile/security/api-tokens
```

### Content Loss
```markdown
# Ensure proper indentation (2+ spaces for description content)
- Story: Title
  Description: Summary
  
    [Content must be indented]
    
  Acceptance_Criteria:
    - [ ] Item
```

### Priority Not Syncing
```bash
# Check if priority is specified in markdown
Priority: High

# Verify after sync
npm run jira-to-md -- PROJ-123
```

## API Usage

```typescript
import { mdToJira, jiraToMd } from 'jira-md-sync';

// Import
await mdToJira({
  jiraConfig: { jiraUrl, email, apiToken, projectKey },
  inputDir: './md',
  dryRun: false
});

// Export all
await jiraToMd({
  jiraConfig: { jiraUrl, email, apiToken, projectKey },
  outputDir: './jira',
  jql: 'project = PROJ ORDER BY key ASC'
});

// Export single
await jiraToMd({
  jiraConfig: { jiraUrl, email, apiToken, projectKey },
  outputDir: './jira',
  jql: 'key = PROJ-123'
});
```

## Best Practices

1. **Always use dry-run first** for updates
2. **Keep markdown as source of truth** for version control
3. **Use proper indentation** (2+ spaces) for description content
4. **Place Acceptance_Criteria at the end** of story
5. **Test complex stories** with export/compare
6. **Verify priority values** after sync

## Quick Links

- Get API Token: https://id.atlassian.com/manage-profile/security/api-tokens
- Jira REST API: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
- GitHub Issues: https://github.com/nzlouislu/jira-md-sync/issues

---

**Version:** 0.1.0
**Last Updated:** 2025-11-12
