## Story: JMS-17 Format-Render-009 Special Characters Test

### Story ID
JMS-17

### Status
Backlog

### Description
Testing special characters and escaping.

**Special Characters:**

* Ampersand: AT&T, Q&A
* Less than: 5 < 10
* Greater than: 10 > 5
* Quotes: "double quotes" and 'single quotes'
* Apostrophe: it's, don't, can't

**Code with Special Chars:**

```javascript
const html = '<div class="test">Hello & Goodbye</div>';
const comparison = (a < b) && (c > d);
```

**Escaped Characters:**

* Asterisk: \*not italic\*
* Underscore: \*not italic\*
* Backtick: \`not code\`

### Acceptance Criteria

- [ ] Special characters display correctly
- [ ] HTML entities are handled properly
- [ ] Code blocks preserve special chars
- [ ] Escaped characters work correctly

### Priority
Medium

### Labels
format-render, special-chars, test

### Assignees
Louis Lu

### Reporter
Louis Lu
