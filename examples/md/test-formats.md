## Backlog

- Story: Format-Test-001 Headers H1-H6
  Description: Test conversion of all header levels from Markdown (# to ######) to Jira Wiki Syntax (h1. to h6.). This validates that jira2md correctly handles all six header levels in both directions.
  Acceptance_Criteria:
    - [ ] H1 header converts correctly
    - [ ] H2 header converts correctly
    - [ ] H3 header converts correctly
    - [ ] H4 header converts correctly
    - [ ] H5 header converts correctly
    - [ ] H6 header converts correctly
    - [ ] Round-trip conversion maintains header levels
  Priority: High
  Labels: [test, format-test, auto-generated]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: Format-Test-002 Text Styles Bold Italic
  Description: Test conversion of text styles including bold (**text** to *text*), italic (*text* to _text_), and bold+italic combinations. Validates jira2md handles basic text formatting correctly.
  Acceptance_Criteria:
    - [ ] Bold text converts from ** to *
    - [ ] Italic text converts from * to _
    - [ ] Bold+Italic combination converts correctly
    - [ ] Multiple bold/italic in same paragraph work
    - [ ] Round-trip conversion preserves formatting
  Priority: High
  Labels: [test, format-test, auto-generated]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: Format-Test-003 Special Text Styles
  Description: Test conversion of strikethrough (~~text~~ to -text-), insert (+text+), superscript (^text^), and subscript (~text~). These are advanced text formatting features supported by jira2md.
  Acceptance_Criteria:
    - [ ] Strikethrough converts from ~~ to -
    - [ ] Insert text with + converts correctly
    - [ ] Superscript with ^ converts correctly
    - [ ] Subscript with ~ converts correctly
    - [ ] Combinations of special styles work
  Priority: Medium
  Labels: [test, format-test, auto-generated]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: Format-Test-004 Unordered Lists
  Description: Test conversion of unordered lists using * or - in Markdown to * in Jira Wiki Syntax. Includes nested list testing to validate jira2md handles list hierarchy correctly.
  Acceptance_Criteria:
    - [ ] Simple unordered list converts correctly
    - [ ] Nested unordered lists maintain hierarchy
    - [ ] Mixed * and - bullets normalize correctly
    - [ ] List items with formatting work
    - [ ] Empty list items handled properly
  Priority: High
  Labels: [test, format-test, auto-generated]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: Format-Test-005 Ordered Lists
  Description: Test conversion of ordered lists from Markdown (1. 2. 3.) to Jira Wiki Syntax (# # #). Validates that jira2md correctly handles numbered lists and nested combinations.
  Acceptance_Criteria:
    - [ ] Simple ordered list converts correctly
    - [ ] Nested ordered lists maintain hierarchy
    - [ ] Mixed ordered and unordered lists work
    - [ ] List numbering resets properly
    - [ ] List items with formatting work
  Priority: High
  Labels: [test, format-test, auto-generated]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: Format-Test-006 Inline Code
  Description: Test conversion of inline code from Markdown backticks (`code`) to Jira Wiki Syntax double braces ({{code}}). Validates jira2md handles inline preformatted text correctly.
  Acceptance_Criteria:
    - [ ] Single inline code block converts correctly
    - [ ] Multiple inline codes in paragraph work
    - [ ] Special characters in inline code preserved
    - [ ] Inline code with surrounding text works
    - [ ] Empty inline code handled properly
  Priority: High
  Labels: [test, format-test, auto-generated]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: Format-Test-007 Code Blocks with Language
  Description: Test conversion of fenced code blocks with language specification from Markdown (```lang) to Jira Wiki Syntax ({code:lang}). Validates jira2md supports programming language-specific code blocks.
  Acceptance_Criteria:
    - [ ] JavaScript code block converts correctly
    - [ ] Python code block converts correctly
    - [ ] TypeScript code block converts correctly
    - [ ] Code block without language works
    - [ ] Multi-line code blocks preserve formatting
    - [ ] Special characters in code blocks preserved
  Priority: High
  Labels: [test, format-test, auto-generated]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: Format-Test-008 Links Un-named and Named
  Description: Test conversion of links from Markdown (<http://url> and [text](url)) to Jira Wiki Syntax ([http://url] and [text|url]). Validates jira2md handles both link types correctly.
  Acceptance_Criteria:
    - [ ] Un-named URL link converts correctly
    - [ ] Named link with text converts correctly
    - [ ] Multiple links in paragraph work
    - [ ] Links with special characters work
    - [ ] Email links convert correctly
  Priority: High
  Labels: [test, format-test, auto-generated]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: Format-Test-009 Monospaced Text
  Description: Test conversion of monospaced text using backticks in Markdown to {{text}} in Jira Wiki Syntax. This is similar to inline code but specifically for monospaced formatting.
  Acceptance_Criteria:
    - [ ] Monospaced text converts correctly
    - [ ] Multiple monospaced spans work
    - [ ] Monospaced with special chars preserved
    - [ ] Difference from inline code maintained
  Priority: Medium
  Labels: [test, format-test, auto-generated]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: Format-Test-010 Blockquotes
  Description: Test conversion of single-paragraph blockquotes from Markdown (> text) to Jira Wiki Syntax ({quote}text{quote}). Note that jira2md only supports single-paragraph blockquotes, not nested or multi-paragraph ones.
  Acceptance_Criteria:
    - [ ] Single-line blockquote converts correctly
    - [ ] Blockquote with formatting works
    - [ ] Multiple separate blockquotes work
    - [ ] Known limitation: multi-paragraph not supported
    - [ ] Known limitation: nested blockquotes not supported
  Priority: Medium
  Labels: [test, format-test, auto-generated]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: Format-Test-011 Tables
  Description: Test conversion of Markdown tables to Jira Wiki Syntax tables. Validates that jira2md handles table structure, headers, and cell content correctly. Note potential complexity limits.
  Acceptance_Criteria:
    - [ ] Simple 2-column table converts correctly
    - [ ] Table with headers converts correctly
    - [ ] Table with multiple rows works
    - [ ] Cell content with formatting works
    - [ ] Known limitation: complex nested tables may fail
  Priority: Medium
  Labels: [test, format-test, auto-generated]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: Format-Test-012 Panels
  Description: Test conversion of panels from Markdown to Jira Wiki Syntax ({panel}content{panel}). Panels are a Jira-specific feature for highlighting content blocks.
  Acceptance_Criteria:
    - [ ] Simple panel converts correctly
    - [ ] Panel with title works
    - [ ] Panel with formatted content works
    - [ ] Multiple panels in document work
  Priority: Low
  Labels: [test, format-test, auto-generated]
  Assignees: Louis Lu
  Reporter: Louis Lu

- Story: Format-Test-013 Mixed Formats Complex
  Description: Test complex combinations of multiple jira2md supported features in a single story. This validates that jira2md can handle real-world documents with mixed formatting without conflicts or errors.
  Acceptance_Criteria:
    - [ ] Headers with bold/italic text work
    - [ ] Lists with inline code work
    - [ ] Links in bold text work
    - [ ] Code blocks with surrounding text work
    - [ ] Tables with formatted cells work
    - [ ] Blockquotes with links work
    - [ ] Overall format fidelity maintained
  Priority: High
  Labels: [test, format-test, auto-generated]
  Assignees: Louis Lu
  Reporter: Louis Lu
