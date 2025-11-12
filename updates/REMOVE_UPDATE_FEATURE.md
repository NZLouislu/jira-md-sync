# Remove Update Feature - Simplify to Create-Only

## Decision

Removed the update feature (`ALLOW_JIRA_UPDATE`) based on sound reasoning about real-world workflow.

## Rationale

### Problems with Update Feature

1. **Conflict Risk**
   - Overwrites changes made in Jira
   - No conflict resolution
   - Data loss potential

2. **Wrong Workflow**
   - PO creates stories in markdown (fast bulk creation)
   - PO refines in Jira (using AI tools, rich editor)
   - Jira should be single source of truth
   - Markdown → Jira should be one-way

3. **Unnecessary Complexity**
   - Added code complexity
   - Increased risk
   - Confusing for users

### Correct Workflow

**Phase 1: Bulk Creation**
```
Markdown (quick draft) → Jira (create)
```

**Phase 2: Refinement**
```
Jira UI (edit, AI tools, collaborate) → Final stories
```

**Phase 3: Backup/Documentation**
```
Jira → Markdown (export for backup)
```

## Changes Made

### 1. Documentation Updates

**README.md:**
- ✅ Fixed name format: `john.doe` → `John Doe`
- ✅ Removed "Update Existing Issues" section
- ✅ Changed "Bidirectional Sync" → "One-Way Sync"
- ✅ Added "Workflow & Limitations" section
- ✅ Clarified create-only behavior
- ✅ Removed references to `ALLOW_JIRA_UPDATE`

**Key Message:**
> This tool is **create-only** - use Jira UI for updates and refinements

### 2. Code Changes

**src/jira/md-to-jira.ts:**
- ✅ Removed `ALLOW_JIRA_UPDATE` environment variable check
- ✅ Removed `updateIssueFromStory()` function (~110 lines)
- ✅ Simplified logic to skip existing issues
- ✅ Removed update mode branching

**Before:**
```typescript
const allowUpdate = process.env.ALLOW_JIRA_UPDATE === 'true';

if (existingIssue) {
  if (allowUpdate) {
    await updateIssueFromStory(...);  // Complex update logic
  } else {
    logger.info('Skipped');
  }
}
```

**After:**
```typescript
if (existingIssue) {
  logger.info('Skipped (already exists)');
  skipped++;
  continue;
}
```

### 3. Name Format Corrections

**Before:**
```markdown
Assignees: jane.smith
Reporter: john.doe
```

**After:**
```markdown
Assignees: Jane Smith
Reporter: John Doe
```

## Benefits

### For Users
- ✅ Clearer workflow
- ✅ No confusion about updates
- ✅ No risk of data loss
- ✅ Simpler mental model

### For Code
- ✅ ~110 lines removed
- ✅ Less complexity
- ✅ Fewer edge cases
- ✅ Easier to maintain

### For Product
- ✅ Clear purpose: bulk creation
- ✅ Jira as single source of truth
- ✅ Leverages Jira's strengths (AI, collaboration)
- ✅ Markdown's strengths (quick drafting)

## Recommended Workflow

### Step 1: Draft in Markdown
```markdown
## Backlog

- Story: Add Login Feature
  Description: Implement user authentication
  Priority: High
  Labels: [auth, security]
  Assignees: John Doe

- Story: Add Dashboard
  Description: Create user dashboard
  Priority: Medium
  Labels: [ui, frontend]
  Assignees: Jane Smith
```

### Step 2: Bulk Create
```bash
npm run md-to-jira
```

Output:
```
✅ Created: PROJ-1
✅ Created: PROJ-2
```

### Step 3: Refine in Jira
- Use Jira's AI tools to improve descriptions
- Add detailed acceptance criteria
- Attach mockups/designs
- Collaborate with team
- Update priorities
- Add comments

### Step 4: Export for Backup (Optional)
```bash
npm run jira-to-md
```

## Migration Guide

### For Existing Users

**If you were using update mode:**

**Before:**
```bash
# Edit markdown
ALLOW_JIRA_UPDATE=true npm run md-to-jira
```

**After:**
```bash
# Edit directly in Jira UI instead
# Use Jira's AI tools, rich editor, and collaboration features
```

**If you need to bulk update:**
- Use Jira's bulk edit feature
- Use Jira API directly
- Use Jira automation rules

## Code Statistics

**Removed:**
- 1 environment variable check
- 1 function (~110 lines)
- Multiple conditional branches
- Update-related logic

**Simplified:**
- Main sync loop
- Error handling
- User messaging

## Testing

```bash
npm run build  # ✅ Success
npm test       # ✅ All tests pass
```

## Documentation Updates

### README.md Sections Updated

1. **Features** - "Bidirectional" → "One-Way"
2. **Markdown Format** - Fixed name format
3. **Advanced Features** - Removed update section
4. **Workflow & Limitations** - New section explaining workflow
5. **All examples** - Fixed name format

### New Messaging

**Clear Purpose:**
> Write stories in markdown for quick bulk creation, then refine in Jira

**Clear Limitation:**
> This tool is create-only - use Jira UI for updates

**Clear Workflow:**
> Markdown → Jira (create) → Jira UI (refine) → Jira (source of truth)

## Conclusion

This change:
- ✅ Simplifies the tool
- ✅ Reduces risk
- ✅ Clarifies purpose
- ✅ Matches real-world workflow
- ✅ Leverages each tool's strengths

The tool is now focused on what it does best: **fast bulk creation of Jira issues from markdown drafts**.

---

**Date:** 2025-11-12
**Status:** ✅ Complete
**Impact:** Simplified, safer, clearer
