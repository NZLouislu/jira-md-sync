# ⚠️ IMPORTANT: jira2md Dependency Requirement

## Critical Information

**The `jira2md` package is a REQUIRED dependency for this tool to work correctly.**

## Why is jira2md Required?

`jira2md` is responsible for converting between Markdown and Jira Wiki markup formats. Without it, you will experience severe formatting issues:

### Without jira2md:
- ❌ Strikethrough shows as `~~text~~` instead of ~~strikethrough~~
- ❌ Bold shows as `**text**` instead of **bold**
- ❌ Italic shows as `*text*` instead of *italic*
- ❌ Code blocks are malformed
- ❌ Lists don't render correctly
- ❌ Links are broken
- ❌ Tables are malformed
- ❌ Checkboxes don't work

### With jira2md:
- ✅ All formatting renders correctly in Jira
- ✅ Interactive checkboxes work
- ✅ Code blocks with syntax highlighting
- ✅ Proper list formatting
- ✅ Working links and tables

## Installation

### For Your Project (Required)

When using `jira-md-sync` in your project, you MUST install `jira2md`:

```bash
npm install jira-md-sync jira2md dotenv
npm install -D typescript ts-node @types/node
```

### Why Both Packages?

- **jira-md-sync**: The main tool (this package)
- **jira2md**: Format conversion library (peer dependency)
- **dotenv**: Environment variable management

Even though `jira-md-sync` includes `jira2md` in its own dependencies, your project needs it installed separately to ensure the format conversion works correctly.

## package.json Configuration

Your project's `package.json` should include:

```json
{
  "dependencies": {
    "jira-md-sync": "^0.1.1",
    "jira2md": "^3.0.1",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "ts-node": "^10.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Verification

After installation, verify that `jira2md` is installed:

```bash
npm list jira2md
```

You should see:
```
your-project@1.0.0
├─┬ jira-md-sync@0.1.1
│ └── jira2md@3.0.1
└── jira2md@3.0.1
```

## Troubleshooting

### Issue: Format not rendering correctly in Jira

**Symptoms:**
- Text formatting shows as raw Markdown syntax
- Strikethrough shows as `~~text~~`
- Bold shows as `**text**`

**Solution:**
```bash
npm install jira2md
```

### Issue: "Cannot find module 'jira2md'"

**Solution:**
```bash
npm install jira2md
```

### Issue: Format was working before, now broken

**Possible Causes:**
1. `node_modules` was deleted and reinstalled without `jira2md`
2. Different environment (CI/CD) missing the dependency

**Solution:**
```bash
npm install jira2md
```

## For CI/CD Pipelines

Make sure your CI/CD configuration installs all dependencies:

### GitHub Actions
```yaml
- name: Install dependencies
  run: |
    npm install jira-md-sync jira2md dotenv
    npm install -D typescript ts-node @types/node
```

### GitLab CI
```yaml
install:
  script:
    - npm install jira-md-sync jira2md dotenv
    - npm install -D typescript ts-node @types/node
```

### Docker
```dockerfile
RUN npm install jira-md-sync jira2md dotenv && \
    npm install -D typescript ts-node @types/node
```

## Summary

| Requirement | Status | Action |
|-------------|--------|--------|
| jira-md-sync | Required | `npm install jira-md-sync` |
| jira2md | **REQUIRED** | `npm install jira2md` |
| dotenv | Required | `npm install dotenv` |

**Remember:** Always install `jira2md` alongside `jira-md-sync`!

## Documentation References

- [README.md](README.md) - Full documentation
- [Installation Guide](README.md#installation)
- [Troubleshooting](README.md#troubleshooting)
- [Package Configuration](README.md#3-package-configuration)

---

**Don't forget to install jira2md!** 🚀
