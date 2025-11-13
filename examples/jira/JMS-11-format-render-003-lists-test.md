## Story: JMS-11 Format-Render-003 Lists Test

### Story ID
JMS-11

### Status
Backlog

### Description
Testing unordered and ordered lists with nesting.

**Unordered List:**

* First item
* Second item

  - Nested item 2.1

  - Nested item 2.2

* Third item

**Ordered List:**

1. First step
2. Second step
3. Third step

   1. Sub-step 3.1

   1. Sub-step 3.2

1. Fourth step

**Mixed List:**

* Item with `code`
* Item with **bold**
* Item with [link](https://example.com)

### Acceptance Criteria

- [ ] Unordered lists render correctly
- [ ] Ordered lists render correctly
- [ ] Nested lists maintain hierarchy
- [ ] Mixed formatting in lists works

### Priority
High

### Labels
format-render, lists, test

### Assignees
Louis Lu

### Reporter
Louis Lu
