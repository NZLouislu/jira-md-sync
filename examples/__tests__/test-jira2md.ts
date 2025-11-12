import * as j2m from 'jira2md';

console.log("=== Testing jira2md conversions ===\n");

// Test checkbox
const md1: string = "- [ ] Task 1\n- [x] Task 2";
const jira1: string = j2m.to_jira(md1);
console.log("Markdown:", md1);
console.log("Jira Wiki:", jira1);
const jira1back: string = j2m.to_markdown(jira1);
console.log("Back to Markdown:", jira1back);
console.log();

// Test if plain text with [ ] is preserved
const plainText: string = "- [ ] This is plain text";
console.log("Plain text:", plainText);
console.log("To Jira:", j2m.to_jira(plainText));
console.log("Back to MD:", j2m.to_markdown(j2m.to_jira(plainText)));
console.log();
