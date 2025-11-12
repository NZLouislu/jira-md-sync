## Story: JMS-16 Format-Render-008 Complex Mixed Formatting

### Story ID
JMS-16

### Status
Backlog

### Description
Testing complex combinations of multiple formats in one story.

1. Main Title

  This story tests **multiple formats** together.

   1. Section 1: Lists with Code

  Here's a list with code examples:

  - Install package: `npm install jira-md-sync`

  - Run command: `npm run md-to-jira`

  - Check result in **Jira dashboard**

   1. Section 2: Code Block with Explanation

  Example configuration:

  ```json

  {

    "jiraUrl": "https://your-domain.atlassian.net",

    "projectKey": "JMST",

    "issueTypeId": "10001"

  }

  
```

  > **Note:** Make sure to replace the values with your actual Jira configuration.

   1. Section 3: Table with Links

| Resource | Link | Description |

|----------|------|-------------|

| Documentation | [Read Docs](https://example.com/docs) | Full API documentation |

| GitHub | [View Code](https://github.com/example) | Source code repository |

| Support | [Get Help](https://example.com/support) | Contact support team |

      1. Subsection: Important Notes

1. Always test with `--dry-run` first
1. Check your **API permissions**
1. Review the [security guidelines](https://example.com/security)

  **Final checklist:**

  - [ ] Configuration is correct

  - [ ] Permissions are granted

  - [ ] Backup is created

**Acceptance Criteria:**

- [ ] All headers render correctly
- [ ] Lists with inline code work
- [ ] Code blocks display properly
- [ ] Blockquotes with formatting work
- [ ] Tables with links work
- [ ] Nested sections maintain hierarchy
- [ ] All formatting is preserved

### Priority
High

### Labels
complex, format-render, integration, test

### Assignees
Louis Lu

### Reporter
Louis Lu
