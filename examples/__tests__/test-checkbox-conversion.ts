import { FormatConverter } from "../src/jira/format-converter";

const converter = new FormatConverter();

const markdown = `This is a test.

**Acceptance Criteria:**

- [ ] Task 1
- [x] Task 2 completed
- [ ] Task 3`;

console.log("=== Markdown Input ===");
console.log(markdown);
console.log();

const jiraWiki = converter.markdownToJira(markdown);
console.log("=== Jira Wiki ===");
console.log(jiraWiki);
console.log();

const adf = converter.markdownToADF(markdown);
console.log("=== ADF Output ===");
console.log(JSON.stringify(adf, null, 2));
