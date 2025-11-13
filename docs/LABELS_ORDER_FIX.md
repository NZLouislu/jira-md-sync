# Labels Order Preservation Fix

## Problem

Labels were being reordered alphabetically when exporting from Jira, instead of preserving the original order from the input Markdown files.

### Example

**Original Markdown (fix-sync-issues.md):**
```markdown
Labels: [feature, priority, configuration]
```

**Jira UI Display:**
```
configuration  feature  priority
```
(Alphabetically sorted by Jira)

**Expected Export:**
```markdown
### Labels
feature, priority, configuration
```

**Actual Export (Before Fix):**
```markdown
### Labels
configuration, feature, priority
```

## Root Cause

1. Jira API returns labels in alphabetical order
2. The code had logic to preserve original order by reading from input directory
3. **Bug**: `inputDir` path resolution was incorrect in CLI
4. **Bug**: `inputDir` was not passed in examples script

### Path Resolution Issue

**Before:**
```typescript
const resolvedInputDir = path.resolve(currentDir, "../../../", inputDirEnv);
```

`currentDir` is `__dirname` which points to `dist/src/cli/` after compilation. The `../../../` navigation was unreliable.

**After:**
```typescript
const resolvedInputDir = path.resolve(process.cwd(), inputDirEnv);
```

Now correctly resolves relative to the project root (current working directory).

## Solution

### 1. Fixed Path Resolution in CLI

**File:** `src/cli/jira-to-md-cli.ts`

Changed from:
```typescript
const resolvedInputDir = path.resolve(currentDir, "../../../", inputDirEnv);
```

To:
```typescript
const resolvedInputDir = path.resolve(process.cwd(), inputDirEnv);
```

### 2. Added inputDir to Examples Script

**File:** `examples/jira-to-md.ts`

Added:
```typescript
const inputDirEnv = process.env.JIRA_MD_INPUT_DIR || "jiramd";
const inputDir = path.isAbsolute(inputDirEnv)
  ? inputDirEnv
  : path.resolve(process.cwd(), inputDirEnv);

const result = await jiraToMd({
  jiraConfig,
  outputDir,
  inputDir,  // Now passed!
  jql: `project = ${jiraConfig.projectKey} ORDER BY key ASC`,
  dryRun: false,
  logger
});
```

## How It Works

1. **Export (jira-to-md):**
   - Reads Jira issues (labels in alphabetical order)
   - Looks for original Markdown file in `inputDir`
   - Finds matching story by ID or title
   - Extracts original labels order
   - Reorders Jira labels to match original order
   - Adds any new labels from Jira at the end

2. **Label Reordering Logic:**
```typescript
const originalLabels = await getOriginalLabelsOrder(inputDir, story.storyId, story.title);
if (originalLabels) {
  const jiraLabels = story.labels;
  const reorderedLabels: string[] = [];

  // Add labels in original order
  for (const label of originalLabels) {
    if (jiraLabels.includes(label)) {
      reorderedLabels.push(label);
    }
  }

  // Add any new labels from Jira
  for (const label of jiraLabels) {
    if (!reorderedLabels.includes(label)) {
      reorderedLabels.push(label);
    }
  }

  story.labels = reorderedLabels;
}
```

## Configuration

Set the input directory in `.env`:
```env
JIRA_MD_INPUT_DIR=jiramd
JIRA_MD_OUTPUT_DIR=jira
```

Or use default values:
- Input: `jiramd/` (source files)
- Output: `jira/` (exported files)

## Verification

### Before Fix
```bash
# Input: jiramd/fix-sync-issues.md
Labels: [feature, priority, configuration]

# Export: jira/JMS-26-*.md
Labels: configuration, feature, priority  # ❌ Alphabetical
```

### After Fix
```bash
# Input: jiramd/fix-sync-issues.md
Labels: [feature, priority, configuration]

# Export: jira/JMS-26-*.md
Labels: feature, priority, configuration  # ✅ Original order
```

## Test Coverage

Existing tests verify the label reordering logic:
- `src/jira/__tests__/jira-to-md.test.ts`
- Label order preservation is tested in integration scenarios

## Impact

- ✅ Labels maintain original order from input files
- ✅ New labels from Jira are appended at the end
- ✅ Works with both CLI and programmatic usage
- ✅ No breaking changes

## Files Modified

1. `src/cli/jira-to-md-cli.ts` - Fixed path resolution
2. `examples/jira-to-md.ts` - Added inputDir parameter
3. `docs/LABELS_ORDER_FIX.md` - This documentation

## Status

✅ **FIXED** in version 0.1.1

## Related

- Environment variables: `JIRA_MD_INPUT_DIR`, `JIRA_MD_OUTPUT_DIR`
- See: [README.md](../README.md#directory-configuration)
- See: [ENV_VARS_UPDATE_CN.md](ENV_VARS_UPDATE_CN.md)
