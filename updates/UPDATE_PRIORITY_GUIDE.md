# Update Priority for Existing Issues

## Problem

Issues JMS-9 to JMS-18 were created before the priority fix was implemented, so they all have Medium priority instead of their specified values (High, Medium, or Low).

## Solution: Use Update Mode

The tool supports an update mode via the `ALLOW_JIRA_UPDATE` environment variable.

### Option 1: Update All Issues (Recommended)

Update all issues in the markdown files:

```bash
cd examples
ALLOW_JIRA_UPDATE=true npm run md-to-jira
```

This will:
- Skip creating new issues (they already exist)
- Update all existing issues with current markdown content
- Fix the priority field for JMS-9 to JMS-18
- Update any other changed fields

**Expected Output:**
```
md-to-jira: Found existing issue by ID: JMS-9
md-to-jira: Updated JMS-9 from test-format-rendering.md
md-to-jira: Found existing issue by ID: JMS-10
md-to-jira: Updated JMS-10 from test-format-rendering.md
...
```

### Option 2: Update Specific File

If you only want to update issues from one file:

```bash
cd examples
ALLOW_JIRA_UPDATE=true npm run md-to-jira -- md/test-format-rendering.md
```

### Option 3: Dry Run First (Recommended)

Preview what will be updated without making changes:

```bash
cd examples
ALLOW_JIRA_UPDATE=true DRY_RUN=true npm run md-to-jira
```

**Expected Output:**
```
md-to-jira: [DRY RUN] Would update JMS-9: Format-Render-001 Headers Test
md-to-jira: [DRY RUN] Would update JMS-10: Format-Render-002 Text Styles Test
...
```

## Verification Steps

### Step 1: Run Update with Dry Run

```bash
cd examples
ALLOW_JIRA_UPDATE=true DRY_RUN=true npm run md-to-jira
```

Check the output to confirm which issues will be updated.

### Step 2: Run Actual Update

```bash
cd examples
ALLOW_JIRA_UPDATE=true npm run md-to-jira
```

### Step 3: Export and Verify

```bash
npm run jira-to-md
```

### Step 4: Check Priority Values

Open the exported files and verify priorities:

```bash
# Should be High
cat jira/JMS-9-format-render-001-headers-test.md | grep "Priority"
cat jira/JMS-10-format-render-002-text-styles-test.md | grep "Priority"
cat jira/JMS-11-format-render-003-lists-test.md | grep "Priority"
cat jira/JMS-12-format-render-004-code-blocks-test.md | grep "Priority"
cat jira/JMS-13-format-render-005-links-test.md | grep "Priority"
cat jira/JMS-16-format-render-008-complex-mixed-formatting.md | grep "Priority"

# Should be Medium
cat jira/JMS-14-format-render-006-blockquotes-test.md | grep "Priority"
cat jira/JMS-15-format-render-007-tables-test.md | grep "Priority"
cat jira/JMS-17-format-render-009-special-characters-test.md | grep "Priority"

# Should be Low
cat jira/JMS-18-format-render-010-emoji-and-unicode-test.md | grep "Priority"
```

## Expected Results

After update, the priorities should be:

| Issue | Title | Expected Priority |
|-------|-------|------------------|
| JMS-9 | Format-Render-001 Headers Test | High |
| JMS-10 | Format-Render-002 Text Styles Test | High |
| JMS-11 | Format-Render-003 Lists Test | High |
| JMS-12 | Format-Render-004 Code Blocks Test | High |
| JMS-13 | Format-Render-005 Links Test | High |
| JMS-14 | Format-Render-006 Blockquotes Test | Medium |
| JMS-15 | Format-Render-007 Tables Test | Medium |
| JMS-16 | Format-Render-008 Complex Mixed Formatting | High |
| JMS-17 | Format-Render-009 Special Characters Test | Medium |
| JMS-18 | Format-Render-010 Emoji and Unicode Test | Low |

## Windows PowerShell Commands

If you're using PowerShell on Windows:

```powershell
cd examples

# Dry run
$env:ALLOW_JIRA_UPDATE="true"; $env:DRY_RUN="true"; npm run md-to-jira

# Actual update
$env:ALLOW_JIRA_UPDATE="true"; npm run md-to-jira

# Export and verify
npm run jira-to-md

# Check priorities (PowerShell)
Select-String -Path "jira\JMS-9-*.md" -Pattern "Priority"
Select-String -Path "jira\JMS-10-*.md" -Pattern "Priority"
```

## Important Notes

### ⚠️ Update Mode Behavior

When `ALLOW_JIRA_UPDATE=true`:
- Updates ALL fields: description, labels, assignees, priority, etc.
- Overwrites current Jira content with markdown content
- Cannot be undone (except manually in Jira)

### ✅ Safe to Use When

- Markdown files are the source of truth
- You want to sync changes from markdown to Jira
- You've reviewed changes with dry run first

### ⚠️ Use with Caution When

- Jira has been updated directly (changes will be overwritten)
- Multiple people are editing the same issues
- You're not sure what will change

### 🔒 Production Safety

The default behavior (create-only) is intentionally safe:
- Never overwrites existing issues
- Prevents accidental data loss
- Markdown → Jira is one-way by default

Update mode is available but requires explicit opt-in via environment variable.

## Alternative: Manual Update in Jira

If you prefer not to use update mode, you can manually update priorities in Jira:

1. Open each issue in Jira (JMS-9 to JMS-18)
2. Click "Priority" field
3. Select correct priority value
4. Save

Then export again:
```bash
npm run jira-to-md
```

## Troubleshooting

### Issue: "Skipped" instead of "Updated"

**Problem:** Issues are being skipped instead of updated.

**Solution:** Make sure `ALLOW_JIRA_UPDATE=true` is set:
```bash
ALLOW_JIRA_UPDATE=true npm run md-to-jira
```

### Issue: Permission Denied

**Problem:** API returns 403 Forbidden when updating.

**Solution:** Verify your Jira API token has "Edit Issues" permission.

### Issue: Priority Not Changing

**Problem:** Priority field is updated but doesn't change in Jira.

**Possible Causes:**
1. Priority ID mapping is incorrect for your Jira instance
2. Priority field is locked by workflow
3. User doesn't have permission to change priority

**Solution:** Check Jira priority IDs:
```bash
# Add this to examples folder
node -e "
const fetch = require('node-fetch');
const auth = Buffer.from(\`\${process.env.JIRA_EMAIL}:\${process.env.JIRA_API_TOKEN}\`).toString('base64');
fetch(\`\${process.env.JIRA_URL}/rest/api/3/priority\`, {
  headers: { 'Authorization': \`Basic \${auth}\` }
})
.then(r => r.json())
.then(d => console.log(JSON.stringify(d, null, 2)));
"
```

## Summary

**Recommended Approach:**

1. ✅ Run dry run first: `ALLOW_JIRA_UPDATE=true DRY_RUN=true npm run md-to-jira`
2. ✅ Review what will change
3. ✅ Run actual update: `ALLOW_JIRA_UPDATE=true npm run md-to-jira`
4. ✅ Export and verify: `npm run jira-to-md`
5. ✅ Check priority values in exported files

This will update all existing issues with correct priority values from the markdown files.
