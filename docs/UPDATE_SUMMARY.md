# Update Summary - v0.1.1

## Quick Overview

This update includes bug fixes and environment variable renaming to prevent conflicts with other MD sync tools.

## What Changed

### 1. Environment Variables (Breaking Change)
- `MD_INPUT_DIR` → `JIRA_MD_INPUT_DIR`
- `MD_OUTPUT_DIR` → `JIRA_MD_OUTPUT_DIR`

**Why?** To avoid conflicts when using multiple MD sync tools (Jira, Trello, GitHub) in the same project.

### 2. Bug Fixes
- ✅ Fixed assignee parsing with brackets: `[backend]` → `backend`
- ✅ Fixed labels parsing with brackets: `[label1, label2]`
- ✅ Improved strikethrough detection to avoid list marker conflicts
- ✅ Better error messages for user lookup failures

### 3. Format Support
Now supports both formats:
- Array format: `Assignees: [backend, frontend]`
- CSV format: `Assignees: backend, frontend`

## How to Update

### Step 1: Update .env File
```env
# Change this:
MD_INPUT_DIR=jiramd
MD_OUTPUT_DIR=jira

# To this:
JIRA_MD_INPUT_DIR=jiramd
JIRA_MD_OUTPUT_DIR=jira
```

### Step 2: Update Package
```bash
npm install jira-md-sync@0.1.1
```

### Step 3: Test
```bash
DRY_RUN=true npm run md-to-jira
```

## Files Updated

### Core Files
- ✅ All source files in `src/`
- ✅ All example files in `examples/`
- ✅ All CLI commands
- ✅ Configuration defaults

### Documentation
- ✅ README.md
- ✅ CHANGELOG.md
- ✅ All docs in `docs/`
- ✅ All docs in `updates/`

### New Files
- ✅ `.env.example` - Configuration template
- ✅ `docs/MIGRATION_GUIDE.md` - Detailed migration steps
- ✅ `docs/环境变量更新说明.md` - Chinese migration guide
- ✅ `docs/修复说明_中文.md` - Chinese bug fix documentation
- ✅ `docs/NPM_PACKAGE_FIXES.md` - Detailed fix explanations
- ✅ `examples/correct-format-example.md` - Format examples

## Test Results

```
✅ 114 tests passing
✅ 0 tests failing
✅ Code coverage: 57.21%
✅ Build successful
```

## Migration Time

⏱️ **< 5 minutes** for most projects

Just rename two environment variables in your `.env` file!

## Need Help?

- 📖 [Migration Guide](docs/MIGRATION_GUIDE.md) - Step-by-step instructions
- 📖 [中文说明](docs/环境变量更新说明.md) - Chinese documentation
- 🐛 [GitHub Issues](https://github.com/nzlouislu/jira-md-sync/issues)
- 📧 Email: nzlouis.com@gmail.com

## Summary

| Category | Status |
|----------|--------|
| Environment Variables | ✅ Renamed with JIRA_ prefix |
| Bug Fixes | ✅ Assignees, Labels, Strikethrough |
| Tests | ✅ All 114 passing |
| Documentation | ✅ Fully updated |
| Examples | ✅ Updated and expanded |
| Migration Guide | ✅ Available in EN & CN |

**Ready to use!** 🚀
