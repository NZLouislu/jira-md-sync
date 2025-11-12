# CLI Usage Update - Simplified Single Issue Export

## Changes Made

Simplified the CLI usage for exporting single issues. Now you can use the same command for both exporting all issues and single issues.

### Before

```bash
# Export all issues
npm run jira-to-md

# Export single issue (separate command)
npm run jira-to-md:issue -- PROJ-123
```

### After

```bash
# Export all issues
npm run jira-to-md

# Export single issue (same command!)
npm run jira-to-md -- PROJ-123

# Export to custom directory
npm run jira-to-md -- PROJ-123 ./custom-output
```

## How It Works

The CLI automatically detects the issue key format:
- If the first argument matches `/^[A-Z]+-\d+$/`, it's treated as an issue key
- The CLI then generates JQL: `key = ISSUE-KEY`
- If no issue key is provided, it uses the default JQL or exports all project issues

## Examples

### Export Single Issue

```bash
# Export JMS-16 to default directory (./jira or MD_OUTPUT_DIR)
npm run jira-to-md -- JMS-16

# Output:
# jira-to-md: Searching with JQL: key = JMS-16
# jira-to-md: Written 1 files from 1 issues
```

### Export to Custom Directory

```bash
# Export JMS-19 to ./test-output directory
npm run jira-to-md -- JMS-19 ./test-output

# Output:
# jira-to-md: Wrote "E:\...\test-output\JMS-19-fix-priority-field-sync.md"
# jira-to-md: Written 1 files from 1 issues
```

### Export All Issues

```bash
# Export all issues from project
npm run jira-to-md

# Output:
# jira-to-md: Written 27 files from 27 issues
```

### Export with Custom JQL

```bash
# Export issues matching custom JQL
JIRA_JQL="project = JMS AND status = 'In Progress'" npm run jira-to-md

# PowerShell:
$env:JIRA_JQL="project = JMS AND status = 'In Progress'"; npm run jira-to-md
```

## CLI Implementation

The CLI in `src/cli/jira-to-md-cli.ts` handles this automatically:

```typescript
const args = process.argv.slice(2);
const issueKey = args[0];
const customOutputDir = args[1];

let jql = process.env.JIRA_JQL || "";
if (issueKey && /^[A-Z]+-\d+$/.test(issueKey)) {
  jql = `key = ${issueKey}`;
}
```

## Documentation Updates

Updated the following sections in README.md:

1. **CLI Commands Table** - Simplified to show single command with variations
2. **Usage Examples** - Added clear examples for all use cases
3. **Export Single Issue** - Updated to use unified command
4. **API Reference** - Removed `jiraToMdSingleIssue`, use `jiraToMd` with JQL
5. **Library Usage** - Updated examples to use `jql: 'key = ISSUE-KEY'`

## Benefits

1. **Simpler API** - One command for all export scenarios
2. **Consistent Interface** - Same pattern as other CLI tools
3. **Flexible** - Still supports custom output directories
4. **Backward Compatible** - Old usage still works (just not documented)

## Testing

Tested the following scenarios:

✅ Export single issue: `npm run jira-to-md -- JMS-16`
✅ Export to custom dir: `npm run jira-to-md -- JMS-19 ./test-output`
✅ Export all issues: `npm run jira-to-md`
✅ Issue key detection: Correctly identifies `JMS-16`, `PROJ-123`, etc.

## Migration Guide

If you were using the old `jira-to-md:issue` command:

**Old:**
```bash
npm run jira-to-md:issue -- PROJ-123
npm run jira-to-md:issue -- PROJ-123 ./output
```

**New:**
```bash
npm run jira-to-md -- PROJ-123
npm run jira-to-md -- PROJ-123 ./output
```

Simply remove `:issue` from the command!

## Summary

The CLI now provides a unified, intuitive interface for exporting Jira issues:
- Same command for all scenarios
- Automatic issue key detection
- Flexible output directory specification
- Cleaner, more maintainable code

---

**Updated:** 2025-11-12
**Status:** ✅ Complete and tested
