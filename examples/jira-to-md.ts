import "dotenv/config";
import { jiraToMd } from "../src/jira/jira-to-md";
import type { JiraConfig } from "../src/jira/types";

async function main() {
  const jiraConfig: JiraConfig = {
    jiraUrl: process.env.JIRA_URL || "https://your-domain.atlassian.net",
    email: process.env.JIRA_EMAIL || "your-email@example.com",
    apiToken: process.env.JIRA_API_TOKEN || "your-api-token",
    projectKey: process.env.JIRA_PROJECT_KEY || "PROJ"
  };

  const logger = {
    info: (...args: any[]) => console.log(...args),
    debug: (...args: any[]) => console.log(...args),
    warn: (...args: any[]) => console.warn(...args),
    error: (...args: any[]) => console.error(...args)
  };

  console.log("Starting Jira to Markdown export...");
  
  const result = await jiraToMd({
    jiraConfig,
    outputDir: "./md",
    jql: `project = ${jiraConfig.projectKey} ORDER BY key ASC`,
    dryRun: false,
    logger
  });

  console.log(`\nExport complete!`);
  console.log(`- Total issues: ${result.totalIssues}`);
  console.log(`- Files written: ${result.written}`);
  console.log(`\nFiles created:`);
  result.files.forEach(f => {
    console.log(`  - ${f.file}`);
    console.log(`    ${f.storyId}: ${f.title} [${f.status}]`);
  });
}

main().catch(error => {
  console.error("Error:", error.message);
  process.exit(1);
});
