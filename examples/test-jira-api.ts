import dotenv from "dotenv";
import path from "path";
import { JiraProvider } from "../src/jira/provider";
import type { JiraConfig } from "../src/jira/types";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function testJiraApi() {
  const jiraConfig: JiraConfig = {
    jiraUrl: process.env.JIRA_URL || "",
    email: process.env.JIRA_EMAIL || "",
    apiToken: process.env.JIRA_API_TOKEN || "",
    projectKey: process.env.JIRA_PROJECT_KEY || ""
  };

  const provider = new JiraProvider({ config: jiraConfig });

  console.log("Testing Jira API search response...\n");

  const jql = `project = ${jiraConfig.projectKey} ORDER BY key ASC`;
  const result = await provider.searchIssues(jql, 0, 10);

  console.log("API Response structure:");
  console.log("- startAt:", result.startAt);
  console.log("- maxResults:", result.maxResults);
  console.log("- total:", result.total);
  console.log("- issues.length:", result.issues?.length || 0);
  console.log("- expand:", result.expand);
  
  console.log("\nFull response keys:", Object.keys(result));
  
  if (result.issues && result.issues.length > 0) {
    console.log("\nFirst issue key:", result.issues[0].key);
  }
}

testJiraApi().catch(error => {
  console.error("Error:", error.message);
  process.exit(1);
});
