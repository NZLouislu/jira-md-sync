import dotenv from "dotenv";
import path from "path";
import { JiraProvider } from "../src/jira/provider";
import type { JiraConfig } from "../src/jira/types";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function checkAC() {
  const jiraConfig: JiraConfig = {
    jiraUrl: process.env.JIRA_URL || "",
    email: process.env.JIRA_EMAIL || "",
    apiToken: process.env.JIRA_API_TOKEN || "",
    projectKey: process.env.JIRA_PROJECT_KEY || ""
  };

  const provider = new JiraProvider({ config: jiraConfig });
  const issueKey = "JMST-104";

  console.log(`Checking ${issueKey} Acceptance Criteria...\n`);

  const issue = await provider.getIssue(issueKey, false);
  
  console.log("Subtasks:", issue.fields.subtasks);
  console.log("\nSubtasks count:", issue.fields.subtasks?.length || 0);
  
  if (issue.fields.subtasks && issue.fields.subtasks.length > 0) {
    console.log("\nSubtask details:");
    issue.fields.subtasks.forEach((subtask: any, index: number) => {
      console.log(`${index + 1}. ${subtask.key}: ${subtask.fields.summary}`);
      console.log(`   Status: ${subtask.fields.status.name}`);
    });
  } else {
    console.log("\n❌ No subtasks found!");
    console.log("\nThis means Acceptance Criteria were not converted to subtasks.");
    console.log("They are probably just in the description as text.");
  }
  
  console.log("\n--- Description Content ---");
  if (issue.fields.description) {
    const desc = JSON.stringify(issue.fields.description, null, 2);
    const acIndex = desc.indexOf("Acceptance");
    if (acIndex > 0) {
      console.log(desc.substring(acIndex - 50, acIndex + 300));
    }
  }
}

checkAC().catch(error => {
  console.error("Error:", error.message);
  process.exit(1);
});
