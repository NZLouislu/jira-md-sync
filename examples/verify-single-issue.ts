import dotenv from "dotenv";
import path from "path";
import { JiraProvider } from "../src/jira/provider";
import type { JiraConfig } from "../src/jira/types";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const jiraConfig: JiraConfig = {
    jiraUrl: process.env.JIRA_URL || "",
    email: process.env.JIRA_EMAIL || "",
    apiToken: process.env.JIRA_API_TOKEN || "",
    projectKey: process.env.JIRA_PROJECT_KEY || ""
  };

  const provider = new JiraProvider({ config: jiraConfig });
  const issueKey = process.argv[2] || "JMST-104";

  console.log(`Fetching issue ${issueKey}...\n`);

  try {
    const issue = await provider.getIssue(issueKey, false);
    
    console.log(`Issue: ${issue.key}`);
    console.log(`Summary: ${issue.fields.summary}`);
    console.log(`Status: ${issue.fields.status.name}\n`);
    
    if (issue.fields.description) {
      console.log("Full Description (ADF):");
      console.log(JSON.stringify(issue.fields.description, null, 2));
    } else {
      console.log("No description found");
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
  }
}

main();
