# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies

```bash
npm install jira-md-sync dotenv
npm install -D typescript ts-node @types/node
```

### 2. Create Directory Structure

```bash
mkdir -p jiramd jira src/jira
```

Your project structure:
```
your-project/
├── jiramd/          # ← Your markdown source files (edit here)
│   └── multi-story.md  # One file with MULTIPLE stories
├── jira/            # ← Jira sync cache (auto-generated, one file per issue)
├── src/jira/        # ← Scripts
└── .env             # ← Configuration
```

**Key Concept:** 
- `jiramd/multi-story.md` = 1 file with MULTIPLE stories
- `jira/` = Multiple files, 1 file per Jira issue

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in your Jira credentials:

```env
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=PROJ
JIRA_ISSUE_TYPE_ID=10001

# Directories (optional, these are defaults)
MD_INPUT_DIR=jiramd
MD_OUTPUT_DIR=jira
```

**Get API Token:** https://id.atlassian.com/manage-profile/security/api-tokens

### 4. Create Your First Stories

Create `jiramd/multi-story.md` with **multiple stories in one file**:

```markdown
## Backlog

- Story: Implement User Login
  Description:
    Create a login page with email and password fields.
    
    Acceptance_Criteria:
    - [ ] Design login form UI
    - [ ] Implement authentication logic
    - [ ] Add error handling
  Priority: High
  Labels: [frontend, authentication]
  Assignees: Your Name
  Reporter: Your Name

- Story: Add Password Reset
  Description: Allow users to reset their password via email
  Priority: Medium
  Labels: [frontend, security]
```

### 5. Create Import Script

Create `src/jira/md-to-jira.ts`:

```typescript
import dotenv from 'dotenv';
import path from 'path';
import { mdToJira } from 'jira-md-sync';

dotenv.config();

async function main() {
  const inputDir = process.env.MD_INPUT_DIR || 'jiramd';

  const result = await mdToJira({
    jiraConfig: {
      jiraUrl: process.env.JIRA_URL!,
      email: process.env.JIRA_EMAIL!,
      apiToken: process.env.JIRA_API_TOKEN!,
      projectKey: process.env.JIRA_PROJECT_KEY!,
      issueTypeId: process.env.JIRA_ISSUE_TYPE_ID
    },
    inputDir,
    dryRun: process.env.DRY_RUN === 'true',
    logger: console
  });

  console.log(`✅ Created: ${result.created}`);
  console.log(`⏭️  Skipped: ${result.skipped}`);
}

main().catch(console.error);
```

### 6. Create Export Script

Create `src/jira/jira-to-md.ts`:

```typescript
import dotenv from 'dotenv';
import path from 'path';
import { jiraToMd } from 'jira-md-sync';

dotenv.config();

async function main() {
  const outputDir = process.env.MD_OUTPUT_DIR || 'jira';
  const inputDir = process.env.MD_INPUT_DIR || 'jiramd';

  const result = await jiraToMd({
    jiraConfig: {
      jiraUrl: process.env.JIRA_URL!,
      email: process.env.JIRA_EMAIL!,
      apiToken: process.env.JIRA_API_TOKEN!,
      projectKey: process.env.JIRA_PROJECT_KEY!
    },
    outputDir,
    inputDir,
    logger: console
  });

  console.log(`✅ Exported ${result.written} files`);
}

main().catch(console.error);
```

### 7. Add Scripts to package.json

```json
{
  "scripts": {
    "jira:push": "ts-node src/jira/md-to-jira.ts",
    "jira:pull": "ts-node src/jira/jira-to-md.ts",
    "jira:dry-run": "DRY_RUN=true ts-node src/jira/md-to-jira.ts"
  }
}
```

### 8. Test with Dry Run

```bash
npm run jira:dry-run
```

Expected output:
```
md-to-jira: [DRY RUN] Would create "Implement User Login"
md-to-jira: [DRY RUN] Would create "Add Password Reset"
✅ Created: 0
⏭️  Skipped: 0
```

### 9. Upload to Jira

```bash
npm run jira:push
```

Expected output:
```
md-to-jira: Found 1 markdown file
md-to-jira: Created "Implement User Login" as PROJ-1
md-to-jira: Created "Add Password Reset" as PROJ-2
✅ Created: 2 issues from 1 file
⏭️  Skipped: 0
```

**What happened:** 
- Read 1 file (`multi-story.md`)
- Found 2 stories in that file
- Created 2 separate Jira issues

### 10. Export from Jira

```bash
npm run jira:pull
```

Expected output:
```
jira-to-md: Fetched 2 issues
jira-to-md: Wrote "jira/PROJ-1-implement-user-login.md"
jira-to-md: Wrote "jira/PROJ-2-add-password-reset.md"
✅ Exported 2 files from 2 issues
```

Check the results:
```bash
ls jira/
# PROJ-1-implement-user-login.md
# PROJ-2-add-password-reset.md

# Compare with source
ls jiramd/
# multi-story.md  (contains both stories)
```

**What happened:**
- Downloaded 2 Jira issues
- Created 2 separate files (1 per issue)
- Your source file `multi-story.md` remains unchanged

## Next Steps

### Organize Your Stories

**Option 1: Single file (Recommended for beginners)**
```bash
jiramd/
└── multi-story.md   # All stories in one file
```

**Option 2: Multiple files (Recommended for large projects)**
```bash
jiramd/
├── features.md      # Feature stories (10+ stories)
├── bugs.md          # Bug fixes (5+ stories)
├── sprint-1.md      # Sprint-specific (8+ stories)
└── technical.md     # Technical tasks (3+ stories)
```

Each file can contain multiple stories organized by status sections.

### Compare Changes

```bash
# After editing in Jira, pull and compare
npm run jira:pull

# Compare your source file with Jira's version
diff jiramd/multi-story.md jira/PROJ-1-*.md

# Or compare all files
diff -r jiramd/ jira/
```

### Git Workflow

```bash
# Add source files to Git
git add jiramd/
git commit -m "Add new stories"

# Ignore sync cache
echo "jira/" >> .gitignore
```

### Advanced Usage

See [README.md](README.md) for:
- Custom status mapping
- JQL queries
- Format support details
- Troubleshooting

## Common Workflows

### Daily Development

```bash
# Morning: Pull latest from Jira
npm run jira:pull

# Edit source files
vim jiramd/features.md

# Push changes to Jira
npm run jira:push

# Verify
npm run jira:pull
diff jiramd/ jira/
```

### Sprint Planning

```bash
# Create sprint file with multiple stories
cat > jiramd/sprint-5.md << EOF
## Backlog
- Story: Feature A
  Description: ...
- Story: Feature B
  Description: ...
- Story: Feature C
  Description: ...
- Story: Feature D
  Description: ...
- Story: Feature E
  Description: ...
EOF

# Upload all 5 stories at once
npm run jira:push
# Creates: PROJ-10, PROJ-11, PROJ-12, PROJ-13, PROJ-14

# Export for review (creates 5 separate files)
npm run jira:pull
```

### Backup

```bash
# Export all issues
npm run jira:pull

# Archive
tar -czf jira-backup-$(date +%Y%m%d).tar.gz jira/
```

## Troubleshooting

### "No stories found"

Check your markdown format:
```markdown
## Backlog

- Story: Your Title Here    ← Must start with "- Story:"
  Description: ...           ← Indented with 2 spaces
```

### "Input directory not found"

```bash
# Create directory
mkdir -p jiramd

# Or set custom path
export MD_INPUT_DIR=custom/path
```

### "Authentication failed"

1. Check `.env` file exists
2. Verify credentials:
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.JIRA_URL)"
   ```
3. Test API token: https://id.atlassian.com/manage-profile/security/api-tokens

### Need Help?

- 📖 Full documentation: [README.md](README.md)
- 🐛 Report issues: [GitHub Issues](https://github.com/nzlouislu/jira-md-sync/issues)
- 💬 Contact: nzlouis.com@gmail.com
