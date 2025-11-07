# Quick Start Guide

## Installation

```bash
npm install
npm run build
```

## Configuration

Create `.env` file:

```env
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=JMS
JIRA_ISSUE_TYPE_ID=10006
MD_INPUT_DIR=examples/md
MD_OUTPUT_DIR=examples/jira
```

## Common Commands

### Export from Jira

```bash
cd examples

npm run jira-to-md

npm run jira-to-md JMS-5

npm run jira-to-md JMS-5 ./output

npm run jira-to-md:dry-run
```

### Import to Jira

```bash
cd examples

npm run md-to-jira

npm run md-to-jira ./my-stories

npm run md-to-jira:dry-run
```

### Update Assignees

```bash
cd examples
npm run update-assignees
```

### Run Tests

```bash
npm test

cd examples
npm run test:integration
```

## Markdown Format

```markdown
## Story: Your Story Title

### Status
To Do

### Description
Your story description here.

### Acceptance Criteria
- [ ] Task 1
- [ ] Task 2
- [x] Completed task

### Priority
High

### Labels
feature, backend, api

### Assignees
John Doe

### Reporter
Jane Smith
```

## Workflow

### 1. Create Stories in Markdown

```bash
cd examples/md
```

Create `my-story.md` with story content.

### 2. Import to Jira

```bash
cd examples
npm run md-to-jira
```

### 3. Work in Jira

Update issues, change status, add comments.

### 4. Export from Jira

```bash
npm run jira-to-md
```

### 5. Review Changes

Check `examples/jira/` for updated markdown files.

## Tips

### Dry Run First

Always test with dry run:

```bash
npm run md-to-jira:dry-run
npm run jira-to-md:dry-run
```

### Single Issue

Export specific issue for quick checks:

```bash
npm run jira-to-md JMS-123
```

### Custom Paths

Use custom directories:

```bash
npm run md-to-jira ./sprint-1
npm run jira-to-md "" ./backlog
```

### Debug Mode

Enable detailed logging:

```bash
npm run md-to-jira:debug
npm run jira-to-md:debug
```

## Troubleshooting

### Authentication Error

Check your API token and email in `.env`.

### Issue Not Found

Verify issue key format: `PROJECT-NUMBER` (e.g., JMS-5).

### Directory Not Found

Use absolute paths or paths relative to project root.

### User Not Found

Ensure user display name matches exactly in Jira.

## Next Steps

1. Read [CLI-USAGE.md](CLI-USAGE.md) for detailed commands
2. Check [IMPROVEMENTS.md](IMPROVEMENTS.md) for features
3. Review [TEST-REPORT.md](TEST-REPORT.md) for test results
4. See examples in `examples/md/` directory

## Support

For issues or questions:
1. Check error messages (they're descriptive)
2. Run with debug mode
3. Review test files for examples
4. Check Jira API documentation
