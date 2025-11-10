import dotenv from "dotenv";
import path from "path";
import { JiraProvider } from "../src/jira/provider";
import type { JiraConfig } from "../src/jira/types";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function debugAC() {
  const jiraConfig: JiraConfig = {
    jiraUrl: process.env.JIRA_URL || "",
    email: process.env.JIRA_EMAIL || "",
    apiToken: process.env.JIRA_API_TOKEN || "",
    projectKey: process.env.JIRA_PROJECT_KEY || ""
  };

  const provider = new JiraProvider({ config: jiraConfig });
  const issue = await provider.getIssue("JMST-104", false);
  
  console.log("Full ADF structure:");
  console.log(JSON.stringify(issue.fields.description, null, 2));
}

debugAC().catch(error => {
  console.error("Error:", error.message);
  process.exit(1);
});
