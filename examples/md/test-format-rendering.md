## Backlog

- Story: JMST-104 Format-Render-001 Headers Test
  Description: This story contains **all six header levels** to test H1-H6 conversion.
  
  # Header 1
  ## Header 2
  ### Header 3
  #### Header 4
  ##### Header 5
  ###### Header 6
  
  All headers should render correctly in Jira.
  Acceptance_Criteria:
    - [ ] All header levels display correctly
    - [ ] Header hierarchy is maintained
  Priority: High
  Labels: [test, format-render, headers]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: JMST-105 Format-Render-002 Text Styles Test
  Description: Testing **bold text**, *italic text*, ***bold and italic***, ~~strikethrough~~, and `inline code`.
  
  This paragraph has **bold words**, *italic words*, and ***both bold and italic*** text.
  
  You can also use ~~strikethrough~~ for deleted text.
  
  Inline code like `const x = 10;` should be monospaced.
  Acceptance_Criteria:
    - [ ] Bold text renders correctly
    - [ ] Italic text renders correctly
    - [ ] Combined styles work
    - [ ] Strikethrough works
    - [ ] Inline code is monospaced
  Priority: High
  Labels: [test, format-render, text-styles]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: JMST-106 Format-Render-003 Lists Test
  Description: Testing unordered and ordered lists with nesting.
  
  **Unordered List:**
  - First item
  - Second item
    - Nested item 2.1
    - Nested item 2.2
  - Third item
  
  **Ordered List:**
  1. First step
  2. Second step
  3. Third step
     1. Sub-step 3.1
     2. Sub-step 3.2
  4. Fourth step
  
  **Mixed List:**
  - Item with `code`
  - Item with **bold**
  - Item with [link](https://example.com)
  Acceptance_Criteria:
    - [ ] Unordered lists render correctly
    - [ ] Ordered lists render correctly
    - [ ] Nested lists maintain hierarchy
    - [ ] Mixed formatting in lists works
  Priority: High
  Labels: [test, format-render, lists]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: JMST-107 Format-Render-004 Code Blocks Test
  Description: Testing fenced code blocks with different languages.
  
  **JavaScript Code:**
  ```javascript
  function hello(name) {
    console.log(`Hello, ${name}!`);
    return true;
  }
  ```
  
  **Python Code:**
  ```python
  def calculate(x, y):
      result = x + y
      return result
  ```
  
  **Plain Code Block:**
  ```
  This is a plain code block
  without language specification
  ```
  Acceptance_Criteria:
    - [ ] JavaScript code block renders correctly
    - [ ] Python code block renders correctly
    - [ ] Plain code block renders correctly
    - [ ] Syntax highlighting is preserved
  Priority: High
  Labels: [test, format-render, code-blocks]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: JMST-108 Format-Render-005 Links Test
  Description: Testing different types of links.
  
  **Named Links:**
  - [Google](https://www.google.com)
  - [GitHub](https://github.com)
  - [Jira Documentation](https://www.atlassian.com/software/jira)
  
  **Auto Links:**
  - <https://www.example.com>
  - <mailto:test@example.com>
  
  **Links in Text:**
  Visit [our website](https://example.com) for more information.
  Acceptance_Criteria:
    - [ ] Named links work correctly
    - [ ] Auto links work correctly
    - [ ] Links in text work correctly
    - [ ] All links are clickable in Jira
  Priority: High
  Labels: [test, format-render, links]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: JMST-109 Format-Render-006 Blockquotes Test
  Description: Testing blockquote formatting.
  
  Normal paragraph before quote.
  
  > This is a blockquote.
  > It can span multiple lines.
  > All lines should be quoted.
  
  Normal paragraph after quote.
  
  > Another blockquote with **bold** and *italic* text.
  Acceptance_Criteria:
    - [ ] Blockquotes render correctly
    - [ ] Multi-line blockquotes work
    - [ ] Formatting inside blockquotes works
  Priority: Medium
  Labels: [test, format-render, blockquotes]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: JMST-110 Format-Render-007 Tables Test
  Description: Testing table formatting.
  
  **Simple Table:**
  
  | Column 1 | Column 2 | Column 3 |
  |----------|----------|----------|
  | Row 1 A  | Row 1 B  | Row 1 C  |
  | Row 2 A  | Row 2 B  | Row 2 C  |
  | Row 3 A  | Row 3 B  | Row 3 C  |
  
  **Table with Formatting:**
  
  | Feature | Status | Priority |
  |---------|--------|----------|
  | **Bold** | *Italic* | `Code` |
  | [Link](https://example.com) | ~~Strike~~ | Normal |
  Acceptance_Criteria:
    - [ ] Simple table renders correctly
    - [ ] Table headers are bold
    - [ ] Table with formatting works
    - [ ] All cells are properly aligned
  Priority: Medium
  Labels: [test, format-render, tables]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: JMST-111 Format-Render-008 Complex Mixed Formatting
  Description: Testing complex combinations of multiple formats in one story.
  
  # Main Title
  
  This story tests **multiple formats** together.
  
  ## Section 1: Lists with Code
  
  Here's a list with code examples:
  - Install package: `npm install jira-md-sync`
  - Run command: `npm run md-to-jira`
  - Check result in **Jira dashboard**
  
  ## Section 2: Code Block with Explanation
  
  Example configuration:
  
  ```json
  {
    "jiraUrl": "https://your-domain.atlassian.net",
    "projectKey": "JMST",
    "issueTypeId": "10001"
  }
  ```
  
  > **Note:** Make sure to replace the values with your actual Jira configuration.
  
  ## Section 3: Table with Links
  
  | Resource | Link | Description |
  |----------|------|-------------|
  | Documentation | [Read Docs](https://example.com/docs) | Full API documentation |
  | GitHub | [View Code](https://github.com/example) | Source code repository |
  | Support | [Get Help](https://example.com/support) | Contact support team |
  
  ### Subsection: Important Notes
  
  1. Always test with `--dry-run` first
  2. Check your **API permissions**
  3. Review the [security guidelines](https://example.com/security)
  
  **Final checklist:**
  - [ ] Configuration is correct
  - [ ] Permissions are granted
  - [ ] Backup is created
  Acceptance_Criteria:
    - [ ] All headers render correctly
    - [ ] Lists with inline code work
    - [ ] Code blocks display properly
    - [ ] Blockquotes with formatting work
    - [ ] Tables with links work
    - [ ] Nested sections maintain hierarchy
    - [ ] All formatting is preserved
  Priority: High
  Labels: [test, format-render, complex, integration]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: JMST-112 Format-Render-009 Special Characters Test
  Description: Testing special characters and escaping.
  
  **Special Characters:**
  - Ampersand: AT&T, Q&A
  - Less than: 5 < 10
  - Greater than: 10 > 5
  - Quotes: "double quotes" and 'single quotes'
  - Apostrophe: it's, don't, can't
  
  **Code with Special Chars:**
  ```javascript
  const html = '<div class="test">Hello & Goodbye</div>';
  const comparison = (a < b) && (c > d);
  ```
  
  **Escaped Characters:**
  - Asterisk: \*not italic\*
  - Underscore: \_not italic\_
  - Backtick: \`not code\`
  Acceptance_Criteria:
    - [ ] Special characters display correctly
    - [ ] HTML entities are handled properly
    - [ ] Code blocks preserve special chars
    - [ ] Escaped characters work correctly
  Priority: Medium
  Labels: [test, format-render, special-chars]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: JMST-113 Format-Render-010 Emoji and Unicode Test
  Description: Testing emoji and unicode character support.
  
  **Emojis:**
  - ✅ Checkmark
  - ❌ Cross mark
  - 🚀 Rocket
  - 💡 Light bulb
  - ⚠️ Warning
  
  **Unicode Characters:**
  - Arrows: → ← ↑ ↓
  - Math: ≈ ≠ ≤ ≥ ∞
  - Symbols: © ® ™ § ¶
  - Currency: $ € £ ¥
  
  **Mixed Content:**
  ✅ Task completed successfully
  ⚠️ **Warning:** Check configuration
  🚀 Deployment in progress...
  Acceptance_Criteria:
    - [ ] Emojis render correctly
    - [ ] Unicode characters display properly
    - [ ] Mixed emoji and text work
    - [ ] No encoding issues
  Priority: Low
  Labels: [test, format-render, unicode, emoji]
  Assignees: Louis Lu
  Reporter: Louis Lu
