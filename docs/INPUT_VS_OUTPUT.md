# Input vs Output: Understanding the File Structure

## The Key Difference

### Input Files (jiramd/)
**One file = Multiple stories**

```markdown
📄 jiramd/multi-story.md
┌─────────────────────────────────────┐
│ ## Backlog                          │
│                                     │
│ - Story: Feature A                  │
│   Description: ...                  │
│   Priority: High                    │
│                                     │
│ - Story: Feature B                  │
│   Description: ...                  │
│   Priority: Medium                  │
│                                     │
│ - Story: Feature C                  │
│   Description: ...                  │
│   Priority: High                    │
│                                     │
│ ## In Progress                      │
│                                     │
│ - Story: Feature D                  │
│   Description: ...                  │
│                                     │
│ - Story: Feature E                  │
│   Description: ...                  │
└─────────────────────────────────────┘

Total: 5 stories in 1 file
```

### Output Files (jira/)
**One file = One issue**

```markdown
📁 jira/
├── 📄 JMS-1-feature-a.md
│   ┌─────────────────────────────┐
│   │ ## Story: JMS-1 Feature A   │
│   │ ### Story ID: JMS-1         │
│   │ ### Status: Backlog         │
│   │ ### Description: ...        │
│   │ ### Priority: High          │
│   └─────────────────────────────┘
│
├── 📄 JMS-2-feature-b.md
│   ┌─────────────────────────────┐
│   │ ## Story: JMS-2 Feature B   │
│   │ ### Story ID: JMS-2         │
│   │ ### Status: Backlog         │
│   │ ### Description: ...        │
│   │ ### Priority: Medium        │
│   └─────────────────────────────┘
│
├── 📄 JMS-3-feature-c.md
├── 📄 JMS-4-feature-d.md
└── 📄 JMS-5-feature-e.md

Total: 5 files for 5 issues
```

## Visual Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WORKFLOW DIAGRAM                            │
└─────────────────────────────────────────────────────────────────────┘

Step 1: Create Input File
┌──────────────────────┐
│ jiramd/              │
│  └─ multi-story.md   │  ← You edit this
│     (5 stories)      │
└──────────────────────┘

Step 2: Upload to Jira
         │
         │ npm run md-to-jira
         ↓
┌──────────────────────┐
│   Jira Cloud         │
│   ┌──────────────┐   │
│   │ JMS-1        │   │  ← Creates 5 separate issues
│   │ JMS-2        │   │
│   │ JMS-3        │   │
│   │ JMS-4        │   │
│   │ JMS-5        │   │
│   └──────────────┘   │
└──────────────────────┘

Step 3: Download from Jira
         │
         │ npm run jira-to-md
         ↓
┌──────────────────────┐
│ jira/                │
│  ├─ JMS-1-*.md       │  ← Creates 5 separate files
│  ├─ JMS-2-*.md       │
│  ├─ JMS-3-*.md       │
│  ├─ JMS-4-*.md       │
│  └─ JMS-5-*.md       │
└──────────────────────┘
```

## Real-World Example

### Scenario: Sprint Planning

You're planning Sprint 5 with 15 stories.

**Traditional Approach (Without Tool):**
1. Open Jira web interface
2. Click "Create Issue" 15 times
3. Fill in form for each story
4. Copy-paste descriptions
5. Set priority, labels, assignees manually
6. Time: ~30 minutes

**With jira-md-sync:**
1. Create `jiramd/sprint-5.md` with 15 stories
2. Run `npm run md-to-jira`
3. Time: ~2 minutes

### Input File Example

```markdown
📄 jiramd/sprint-5.md

## Backlog

- Story: User Login
  Description: Implement JWT authentication
  Priority: Highest
  Labels: [backend, security]
  Assignees: Alice

- Story: User Profile
  Description: Create profile page
  Priority: High
  Labels: [frontend, ui]
  Assignees: Bob

- Story: Password Reset
  Description: Email-based password reset
  Priority: High
  Labels: [backend, email]
  Assignees: Alice

... (12 more stories)
```

**Result:** 15 Jira issues created in seconds!

### Output Files Example

```markdown
📁 jira/

JMS-101-user-login.md
JMS-102-user-profile.md
JMS-103-password-reset.md
JMS-104-...
JMS-105-...
... (15 files total)
```

## Comparison Table

| Aspect | Input (jiramd/) | Output (jira/) |
|--------|----------------|----------------|
| **Files** | Few files | Many files |
| **Organization** | By feature/sprint | By Jira key |
| **Story ID** | Not needed | Auto-generated |
| **Editing** | ✅ Edit freely | ❌ Read-only |
| **Git** | ✅ Commit | ❌ Ignore |
| **Purpose** | Source of truth | Sync cache |
| **Format** | Grouped by status | Individual issues |

## Why This Design?

### Benefits of Multi-Story Input Files

1. **Batch Editing**
   - Edit 10 stories in one file
   - Copy-paste common fields
   - Bulk operations

2. **Organization**
   - Group related stories
   - Sprint planning
   - Feature sets

3. **Version Control**
   - One commit for related stories
   - Clear history
   - Easy to review

4. **Speed**
   - Write stories faster
   - Less context switching
   - Markdown efficiency

### Benefits of Single-Issue Output Files

1. **Jira Compatibility**
   - Matches Jira's structure
   - One issue = one file
   - Easy to find specific issues

2. **Comparison**
   - Compare individual stories
   - Track changes per issue
   - Verify sync accuracy

3. **Flexibility**
   - Can be regenerated anytime
   - No manual maintenance
   - Always up-to-date

## Common Questions

### Q: Can I have multiple input files?

**A:** Yes! You can organize stories however you want:

```
jiramd/
├── features.md      (10 stories)
├── bugs.md          (5 stories)
├── sprint-1.md      (8 stories)
└── technical.md     (3 stories)
```

All files will be processed, creating 26 total issues.

### Q: Why not edit output files directly?

**A:** Output files are regenerated from Jira. Any edits would be lost. Always edit input files.

### Q: What if I want to update a story?

**A:** This tool is create-only. Update stories in Jira UI, then export to see changes.

### Q: Can I mix single and multi-story files?

**A:** Yes! Each input file can have 1 or more stories. The tool processes all stories found.

## Best Practices

### ✅ Do

- Keep input files in `jiramd/`
- Organize by feature/sprint/category
- Commit input files to Git
- Use output files for verification
- Run `jira-to-md` to check sync

### ❌ Don't

- Edit output files in `jira/`
- Commit output files to Git
- Include Story IDs in input files
- Mix input and output directories

## Summary

```
Input (jiramd/)          →    Jira Cloud    →    Output (jira/)
─────────────────             ──────────          ───────────────
1 file                        Multiple            Multiple files
Multiple stories              Issues              1 file per issue
You edit                      Cloud storage       Auto-generated
Commit to Git                 Single source       Ignore in Git
                              of truth
```

**Remember:** 
- **Input** = Your workspace (multi-story files)
- **Output** = Jira's view (single-issue files)
