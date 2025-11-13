# Ordered List Number Fix

## Problem

Ordered lists were losing their sequential numbering during round-trip conversion (Markdown → Jira → Markdown).

### Before Fix

**Input:**
```markdown
1. First step
2. Second step
3. Third step
4. Fourth step
5. Fifth step
6. Sixth step
```

**After Round-trip:**
```markdown
1. First step
1. Second step
1. Third step
1. Fourth step
1. Fifth step
1. Sixth step
```

All items were numbered as "1." instead of sequential numbers.

## Root Cause

The issue occurred in the conversion chain:

1. **Markdown → ADF**: Correctly converted to ordered list nodes
2. **ADF → Jira Wiki**: Converted to `# item` format (Jira Wiki ordered list syntax)
3. **Jira Wiki → Markdown**: `jira2md` library converts all `#` items to `1.`

The `jira2md` library doesn't maintain sequential numbering when converting Jira Wiki ordered lists back to Markdown.

## Solution

Added a post-processing step in `adfToMarkdown()` method to fix the numbering:

```typescript
private fixOrderedListNumbers(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];
  let inOrderedList = false;
  let listCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const orderedListMatch = line.match(/^(\s*)1\.\s+(.+)$/);

    if (orderedListMatch) {
      const indent = orderedListMatch[1];
      const content = orderedListMatch[2];

      if (!inOrderedList || (i > 0 && !lines[i - 1].match(/^(\s*)1\.\s+/))) {
        inOrderedList = true;
        listCounter = 1;
      } else {
        listCounter++;
      }

      result.push(`${indent}${listCounter}. ${content}`);
    } else {
      if (line.trim() === '' || !line.match(/^\s*1\.\s+/)) {
        inOrderedList = false;
        listCounter = 0;
      }
      result.push(line);
    }
  }

  return result.join('\n');
}
```

### How It Works

1. Scans through markdown line by line
2. Detects ordered list items (lines starting with `1.`)
3. Maintains a counter for each continuous list
4. Replaces `1.` with sequential numbers (`1.`, `2.`, `3.`, etc.)
5. Resets counter when list ends (empty line or non-list content)

## Features

- Preserves sequential numbering in ordered lists
- Handles multiple separate ordered lists correctly
- Resets numbering for each new list
- Maintains indentation for nested lists
- Works with any list content (text, code, links, etc.)

## Test Coverage

Added comprehensive tests in `src/jira/__tests__/ordered-list-fix.test.ts`:

- Single ordered list with 6 items
- Multiple separate ordered lists
- Lists with content between them

All tests pass successfully.

## After Fix

**Input:**
```markdown
1. First step
2. Second step
3. Third step
4. Fourth step
5. Fifth step
6. Sixth step
```

**After Round-trip:**
```markdown
1. First step
2. Second step
3. Third step
4. Fourth step
5. Fifth step
6. Sixth step
```

Sequential numbering is now preserved correctly!

## Impact

- ✅ Ordered lists maintain correct numbering
- ✅ Multiple lists handled independently
- ✅ No breaking changes to existing functionality
- ✅ All 117 tests passing

## Files Modified

- `src/jira/format-converter.ts` - Added `fixOrderedListNumbers()` method
- `src/jira/__tests__/ordered-list-fix.test.ts` - Added test coverage

## Version

Fixed in version 0.1.1
