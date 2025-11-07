# CLI Usage Guide

## md-to-jira

Import Markdown files to Jira issues.

### Basic Usage

```bash
npm run md-to-jira
```

### With Custom Input Directory

```bash
npm run md-to-jira examples/md
npm run md-to-jira /path/to/markdown/files
```

### Dry Run Mode

```bash
npm run md-to-jira:dry-run
```

### Debug Mode

```bash
npm run md-to-jira:debug
```

## jira-to-md

Export Jira issues to Markdown files.

### Basic Usage

Export all issues from project:

```bash
npm run jira-to-md
```

### Export Single Issue

```bash
npm run jira-to-md JMS-5
npm run jira-to-md JMS-123
```

### With Custom Output Directory

```bash
npm run jira-to-md JMS-5 ./output
npm run jira-to-md "" ./custom-output
```

### Dry Run Mode

```bash
npm run jira-to-md:dry-run
```

### Debug Mode

```bash
npm run jira-to-md:debug
```

## Environment Variables

Configure in `.env` file:

```env
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=JMS
JIRA_ISSUE_TYPE_ID=10006
MD_INPUT_DIR=examples/md
MD_OUTPUT_DIR=examples/jira
DRY_RUN=false
```

## Examples

### Import all stories from a directory

```bash
npm run md-to-jira examples/md
```

### Export specific issue

```bash
npm run jira-to-md JMS-100
```

### Export all issues to custom directory

```bash
npm run jira-to-md "" ./my-exports
```

## Error Handling

The CLI includes robust error handling:

- Validates Jira configuration
- Checks directory existence
- Handles network errors gracefully
- Provides detailed error messages
- Continues processing on individual failures

## Testing

Run tests:

```bash
npm test
```

Run specific test file:

```bash
npm test markdown-parser.test.ts
```
