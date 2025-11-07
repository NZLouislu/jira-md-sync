import "dotenv/config";
import { JiraProvider } from "../src/jira/provider";
import type { JiraConfig } from "../src/jira/types";

async function main() {
  const config: JiraConfig = {
    jiraUrl: process.env.JIRA_URL || "https://your-domain.atlassian.net",
    email: process.env.JIRA_EMAIL || "your-email@example.com",
    apiToken: process.env.JIRA_API_TOKEN || "your-api-token",
    projectKey: process.env.JIRA_PROJECT_KEY || "PROJ"
  };

  console.log("Checking Jira project configuration...\n");
  console.log(`Jira URL: ${config.jiraUrl}`);
  console.log(`Email: ${config.email}`);
  console.log(`Project Key: ${config.projectKey}\n`);

  const provider = new JiraProvider({
    config,
    logger: {
      debug: (...args: any[]) => console.log("[DEBUG]", ...args),
      warn: (...args: any[]) => console.warn("[WARN]", ...args),
      info: (...args: any[]) => console.log("[INFO]", ...args)
    }
  });

  try {
    console.log("Fetching project details...");
    const project = await provider.getProject();
    
    console.log("\nProject Details:");
    console.log(`- ID: ${project.id}`);
    console.log(`- Key: ${project.key}`);
    console.log(`- Name: ${project.name}`);
    
    if (project.description) {
      console.log(`- Description: ${project.description}`);
    }
    
    if (project.lead) {
      console.log(`- Lead: ${project.lead.displayName}`);
    }
    
    console.log(`\nAvailable Issue Types:`);
    project.issueTypes.forEach(type => {
      console.log(`- ${type.name} (ID: ${type.id})${type.subtask ? ' [Subtask]' : ''}`);
    });

    console.log("\nSearching for recent issues...");
    const searchResult = await provider.searchIssues(
      `project = ${config.projectKey} ORDER BY updated DESC`,
      0,
      5
    );
    
    console.log(`\nFound ${searchResult.total} total issues. Showing first ${searchResult.issues.length}:`);
    searchResult.issues.forEach(issue => {
      console.log(`\n- ${issue.key}: ${issue.fields.summary}`);
      console.log(`  Status: ${issue.fields.status.name}`);
      console.log(`  Type: ${issue.fields.issuetype.name}`);
      if (issue.fields.assignee) {
        console.log(`  Assignee: ${issue.fields.assignee.displayName}`);
      }
      if (issue.fields.labels.length > 0) {
        console.log(`  Labels: ${issue.fields.labels.join(', ')}`);
      }
    });

    console.log("\n✓ Connection successful!");
    
  } catch (error) {
    console.error("\n✗ Error:", (error as Error).message);
    process.exit(1);
  }
}

main();
