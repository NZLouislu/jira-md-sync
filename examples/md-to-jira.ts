import "dotenv/config";
import path from "path";
import { mdToJira } from "../src/jira/md-to-jira";
import type { JiraConfig } from "../src/jira/types";

async function main() {
  const jiraConfig: JiraConfig = {
    jiraUrl: process.env.JIRA_URL || "https://your-domain.atlassian.net",
    email: process.env.JIRA_EMAIL || "your-email@example.com",
    apiToken: process.env.JIRA_API_TOKEN || "your-api-token",
    projectKey: process.env.JIRA_PROJECT_KEY || "PROJ",
    issueTypeId: process.env.JIRA_ISSUE_TYPE_ID || "10001"
  };

  // Get input directory from environment variable or use default
  // Priority: JIRA_MD_INPUT_DIR > default (jiramd)
  const inputDirEnv = process.env.JIRA_MD_INPUT_DIR || "jiramd";

  // Resolve path: if absolute, use as-is; if relative, resolve from current directory
  const inputDir = path.isAbsolute(inputDirEnv)
    ? inputDirEnv
    : path.resolve(process.cwd(), inputDirEnv);

  const logger = {
    info: (...args: any[]) => console.log(...args),
    debug: (...args: any[]) => console.log(...args),
    warn: (...args: any[]) => console.warn(...args),
    error: (...args: any[]) => console.error(...args)
  };

  console.log("Starting Markdown to Jira import...");
  console.log(`Input directory: ${inputDir}`);

  const result = await mdToJira({
    jiraConfig,
    inputDir,
    dryRun: false,
    logger
  });

  console.log(`\nImport complete!`);
  console.log(`- Files processed: ${result.processedFiles}`);
  console.log(`- Issues created: ${result.created}`);
  console.log(`- Issues skipped: ${result.skipped}`);

  if (result.errors.length > 0) {
    console.error(`\nErrors (${result.errors.length}):`);
    result.errors.forEach(err => console.error(`  - ${err}`));
  }
}

main().catch(error => {
  console.error("Error:", error.message);
  process.exit(1);
});
