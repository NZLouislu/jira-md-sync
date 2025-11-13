# Migration Guide: v0.1.0 to v0.1.1

## Environment Variable Changes

In version 0.1.1, we've renamed the environment variables to include a `JIRA_` prefix. This prevents conflicts when using this tool alongside other MD sync tools (like Trello MD Sync).

### What Changed

| Old Variable (v0.1.0) | New Variable (v0.1.1+) | Description |
|----------------------|------------------------|-------------|
| `MD_INPUT_DIR` | `JIRA_MD_INPUT_DIR` | Input directory for source markdown files |
| `MD_OUTPUT_DIR` | `JIRA_MD_OUTPUT_DIR` | Output directory for Jira exports |

### Why This Change?

This change allows you to use multiple MD sync tools in the same project without environment variable conflicts:

```env
# Jira configuration
JIRA_MD_INPUT_DIR=jiramd
JIRA_MD_OUTPUT_DIR=jira

# Trello configuration (if using trello-md-sync)
TRELLO_MD_INPUT_DIR=trellomd
TRELLO_MD_OUTPUT_DIR=trello

# GitHub configuration (if using github-md-sync)
GITHUB_MD_INPUT_DIR=githubmd
GITHUB_MD_OUTPUT_DIR=github
```

## Migration Steps

### Step 1: Update Your .env File

**Before (v0.1.0):**
```env
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your_token
JIRA_PROJECT_KEY=PROJ
MD_INPUT_DIR=jiramd
MD_OUTPUT_DIR=jira
```

**After (v0.1.1+):**
```env
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your_token
JIRA_PROJECT_KEY=PROJ
JIRA_MD_INPUT_DIR=jiramd
JIRA_MD_OUTPUT_DIR=jira
```

### Step 2: Update Command Line Usage

If you're using environment variables in command line, update them:

**Before:**
```bash
# Linux/macOS
MD_INPUT_DIR=custom/path npm run md-to-jira
MD_OUTPUT_DIR=custom/path npm run jira-to-md

# Windows PowerShell
$env:MD_INPUT_DIR='custom/path'; npm run md-to-jira
$env:MD_OUTPUT_DIR='custom/path'; npm run jira-to-md

# Windows CMD
set MD_INPUT_DIR=custom/path&& npm run md-to-jira
set MD_OUTPUT_DIR=custom/path&& npm run jira-to-md
```

**After:**
```bash
# Linux/macOS
JIRA_MD_INPUT_DIR=custom/path npm run md-to-jira
JIRA_MD_OUTPUT_DIR=custom/path npm run jira-to-md

# Windows PowerShell
$env:JIRA_MD_INPUT_DIR='custom/path'; npm run md-to-jira
$env:JIRA_MD_OUTPUT_DIR='custom/path'; npm run jira-to-md

# Windows CMD
set JIRA_MD_INPUT_DIR=custom/path&& npm run md-to-jira
set JIRA_MD_OUTPUT_DIR=custom/path&& npm run jira-to-md
```

### Step 3: Update CI/CD Scripts

If you're using these variables in CI/CD pipelines, update them:

**GitHub Actions - Before:**
```yaml
env:
  MD_INPUT_DIR: ./markdown
  MD_OUTPUT_DIR: ./jira-export
```

**GitHub Actions - After:**
```yaml
env:
  JIRA_MD_INPUT_DIR: ./markdown
  JIRA_MD_OUTPUT_DIR: ./jira-export
```

**GitLab CI - Before:**
```yaml
variables:
  MD_INPUT_DIR: "./markdown"
  MD_OUTPUT_DIR: "./jira-export"
```

**GitLab CI - After:**
```yaml
variables:
  JIRA_MD_INPUT_DIR: "./markdown"
  JIRA_MD_OUTPUT_DIR: "./jira-export"
```

### Step 4: Update Custom Scripts

If you have custom scripts that use these variables, update them:

**Before:**
```typescript
const inputDir = process.env.MD_INPUT_DIR || 'jiramd';
const outputDir = process.env.MD_OUTPUT_DIR || 'jira';
```

**After:**
```typescript
const inputDir = process.env.JIRA_MD_INPUT_DIR || 'jiramd';
const outputDir = process.env.JIRA_MD_OUTPUT_DIR || 'jira';
```

## Backward Compatibility

**Important:** The old variable names (`MD_INPUT_DIR`, `MD_OUTPUT_DIR`) are **not supported** in v0.1.1+. You must update to the new names.

If you need to maintain backward compatibility temporarily, you can use fallback logic in your scripts:

```typescript
const inputDir = process.env.JIRA_MD_INPUT_DIR || process.env.MD_INPUT_DIR || 'jiramd';
const outputDir = process.env.JIRA_MD_OUTPUT_DIR || process.env.MD_OUTPUT_DIR || 'jira';
```

However, we recommend updating to the new variable names as soon as possible.

## Verification

After migration, verify your configuration:

```bash
# Check current configuration
node -e "console.log('Input:', process.env.JIRA_MD_INPUT_DIR || 'jiramd'); console.log('Output:', process.env.JIRA_MD_OUTPUT_DIR || 'jira')"

# Test with dry run
DRY_RUN=true npm run md-to-jira
```

## Troubleshooting

### Issue: "Input directory does not exist"

**Cause:** The environment variable is not set or has the wrong name.

**Solution:**
1. Check your `.env` file uses `JIRA_MD_INPUT_DIR` (not `MD_INPUT_DIR`)
2. Verify the directory path is correct
3. Create the directory if it doesn't exist: `mkdir -p jiramd`

### Issue: "No markdown files found"

**Cause:** The input directory is empty or the variable points to the wrong location.

**Solution:**
1. Verify `JIRA_MD_INPUT_DIR` points to the correct directory
2. Check that the directory contains `.md` files
3. Use absolute path if relative path doesn't work

### Issue: Scripts still use old variable names

**Cause:** You're using an older version of the package or custom scripts.

**Solution:**
1. Update to v0.1.1+: `npm install jira-md-sync@latest`
2. Update custom scripts to use new variable names
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Need Help?

If you encounter issues during migration:

1. Check the [README.md](../README.md) for updated documentation
2. Review the [.env.example](.env.example) file for reference
3. Submit an issue on [GitHub](https://github.com/nzlouislu/jira-md-sync/issues)
4. Contact: nzlouis.com@gmail.com

## Summary

✅ Rename `MD_INPUT_DIR` → `JIRA_MD_INPUT_DIR`  
✅ Rename `MD_OUTPUT_DIR` → `JIRA_MD_OUTPUT_DIR`  
✅ Update `.env` file  
✅ Update command line usage  
✅ Update CI/CD scripts  
✅ Update custom scripts  
✅ Test with dry run mode  

The migration should take less than 5 minutes for most projects!
