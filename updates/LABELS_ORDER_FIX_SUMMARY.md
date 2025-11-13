# Labels Order Fix Summary

## Issue Identified

JMS-26 showed that labels were being reordered alphabetically instead of preserving the original order from input Markdown files.

### Example from JMS-26

**Input (fix-sync-issues.md):**
```markdown
Labels: [feature, priority, configuration]
```

**Jira Display:**
```
configuration  feature  priority
```
(Jira sorts alphabetically)

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

## Root Cause Analysis

The code already had logic to preserve label order by reading from input directory, but it wasn't working due to two bugs:

### Bug 1: Incorrect Path Resolution in CLI

**Location:** `src/cli/jira-to-md-cli.ts`

**Problem:**
```typescript
const resolvedInputDir = path.resolve(currentDir, "../../../", inputDirEnv);
```

- `currentDir` = `__dirname` = `dist/src/cli/` (after compilation)
- `../../../` navigation was unreliable
- Failed to find input directory

**Fix:**
```typescript
const resolvedInputDir = path.resolve(process.cwd(), inputDirEnv);
```

- Now resolves relative to project root
- Correctly finds `jiramd/` directory

### Bug 2: Missing inputDir in Examples

**Location:** `examples/jira-to-md.ts`

**Problem:**
- `inputDir` parameter was not passed to `jiraToMd()`
- Label order preservation logic never executed

**Fix:**
```typescript
const inputDirEnv = process.env.JIRA_MD_INPUT_DIR || "jiramd";
const inputDir = path.resolve(process.cwd(), inputDirEnv);

const result = await jiraToMd({
  jiraConfig,
  outputDir,
  inputDir,  // Now passed!
  jql,
  dryRun: false,
  logger
});
```

## How Label Order Preservation Works

### 1. Export Process (jira-to-md)

```typescript
// 1. Get issue from Jira (labels in alphabetical order)
const story = mapIssueToStory(issue, jiraConfig, converter);

// 2. Try to restore original order
if (inputDir) {
  const originalLabels = await getOriginalLabelsOrder(
    inputDir, 
    story.storyId, 
    story.title
  );
  
  if (originalLabels) {
    // 3. Reorder to match original
    const reorderedLabels = [];
    
    // Add labels in original order
    for (const label of originalLabels) {
      if (story.labels.includes(label)) {
        reorderedLabels.push(label);
      }
    }
    
    // Add any new labels from Jira at the end
    for (const label of story.labels) {
      if (!reorderedLabels.includes(label)) {
        reorderedLabels.push(label);
      }
    }
    
    story.labels = reorderedLabels;
  }
}
```

### 2. Finding Original Labels

```typescript
async function getOriginalLabelsOrder(
  inputDir: string, 
  storyId: string, 
  title: string
): Promise<string[] | null> {
  // 1. Read all .md files in inputDir
  const files = await fs.readdir(inputDir);
  
  for (const file of files) {
    // 2. Parse markdown file
    const content = await fs.readFile(filePath, 'utf8');
    const stories = parseMarkdownToStories(content);
    
    // 3. Find matching story by ID or title
    const story = stories.find(s =>
      (s.storyId && s.storyId === storyId) ||
      (s.title && s.title === title)
    );
    
    // 4. Return original labels order
    if (story && story.labels) {
      return story.labels;
    }
  }
  
  return null;
}
```

## Configuration

### Environment Variables

```env
JIRA_MD_INPUT_DIR=jiramd   # Source files with original order
JIRA_MD_OUTPUT_DIR=jira    # Exported files
```

### Directory Structure

```
project/
├── jiramd/                    # Input (source files)
│   └── fix-sync-issues.md    # Original label order here
├── jira/                      # Output (exported files)
│   └── JMS-26-*.md           # Preserves original order
```

## Verification

### Test Case

1. **Create issue in Jira with labels:**
   ```
   configuration, feature, priority
   ```
   (Jira sorts alphabetically)

2. **Original markdown has:**
   ```markdown
   Labels: [feature, priority, configuration]
   ```

3. **Export with fix:**
   ```bash
   npm run jira-to-md
   ```

4. **Result:**
   ```markdown
   ### Labels
   feature, priority, configuration
   ```
   ✅ Original order preserved!

## Impact

### Benefits
- ✅ Labels maintain original order from input files
- ✅ New labels from Jira appended at end
- ✅ Works with CLI and programmatic usage
- ✅ No breaking changes

### Files Modified
1. `src/cli/jira-to-md-cli.ts` - Fixed path resolution
2. `examples/jira-to-md.ts` - Added inputDir parameter
3. `CHANGELOG.md` - Documented fix
4. `docs/LABELS_ORDER_FIX.md` - Detailed documentation

## Test Results

- ✅ All 117 tests passing
- ✅ Build successful
- ✅ No regressions

## Status

✅ **FIXED** in version 0.1.1

---

**Issue:** Labels reordered alphabetically  
**Root Cause:** Path resolution bug + missing parameter  
**Solution:** Fixed path resolution + added inputDir  
**Status:** ✅ Fixed and tested  
**Version:** 0.1.1
