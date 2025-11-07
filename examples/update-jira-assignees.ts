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

    if (!jiraConfig.projectKey) {
        console.error("Error: JIRA_PROJECT_KEY not found in .env file");
        process.exit(1);
    }

    const logger = {
        info: (...args: any[]) => console.log(...args),
        debug: (...args: any[]) => console.log(...args),
        warn: (...args: any[]) => console.warn(...args),
        error: (...args: any[]) => console.error(...args)
    };

    const client = new JiraProvider({ config: jiraConfig, logger });

    const jql = `project = ${jiraConfig.projectKey} ORDER BY key ASC`;
    console.log(`Searching for issues: ${jql}`);

    const result = await client.searchIssues(jql, 0, 100);
    console.log(`Found ${result.issues.length} issues`);

    let currentUser: any = null;
    try {
        const myselfResponse = await fetch(`${jiraConfig.jiraUrl}/rest/api/3/myself`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${jiraConfig.email}:${jiraConfig.apiToken}`).toString('base64')}`,
                'Accept': 'application/json'
            }
        });
        currentUser = await myselfResponse.json();
        console.log(`Current user: ${currentUser.displayName} (${currentUser.accountId})`);
    } catch (error) {
        console.error(`Error getting current user:`, error);
        return;
    }

    for (const issue of result.issues) {
        const issueKey = issue.key;
        const currentAssignee = issue.fields.assignee?.displayName || "Unassigned";

        console.log(`\nProcessing ${issueKey}: ${issue.fields.summary}`);
        console.log(`  Current assignee: ${currentAssignee}`);

        if (issue.fields.assignee?.accountId === currentUser.accountId) {
            console.log(`  ✓ Already assigned to ${currentUser.displayName}`);
            continue;
        }

        try {
            await client.updateIssue(issueKey, {
                fields: {
                    assignee: {
                        accountId: currentUser.accountId
                    }
                }
            });
            console.log(`  ✓ Updated assignee to ${currentUser.displayName}`);
        } catch (error) {
            console.error(`  ✗ Error updating ${issueKey}:`, (error as Error).message);
        }
    }

    console.log(`\nDone! Updated assignees for ${result.issues.length} issues.`);
}

main().catch(error => {
    console.error("Error:", error.message);
    process.exit(1);
});
