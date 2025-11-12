import dotenv from "dotenv";
import path from "path";
import { mdToJira } from "../src/jira/md-to-jira";
import { jiraToMd } from "../src/jira/jira-to-md";
import type { JiraConfig } from "../src/jira/types";
import fs from "fs/promises";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function runIntegrationTests() {
    console.log("Starting integration tests...\n");

    const jiraConfig: JiraConfig = {
        jiraUrl: process.env.JIRA_URL || "",
        email: process.env.JIRA_EMAIL || "",
        apiToken: process.env.JIRA_API_TOKEN || "",
        projectKey: process.env.JIRA_PROJECT_KEY || ""
    };

    const logger = {
        info: (...args: any[]) => console.log("[INFO]", ...args),
        debug: (...args: any[]) => console.log("[DEBUG]", ...args),
        warn: (...args: any[]) => console.warn("[WARN]", ...args),
        error: (...args: any[]) => console.error("[ERROR]", ...args)
    };

    try {
        console.log("Test 1: Validate configuration");
        if (!jiraConfig.jiraUrl || !jiraConfig.projectKey) {
            throw new Error("Missing required configuration");
        }
        console.log("✓ Configuration valid\n");

        console.log("Test 2: Create test markdown file");
        const testDir = "./test-temp";
        await fs.mkdir(testDir, { recursive: true });

        const testMarkdown = `
## Story: Integration Test Story

### Status
To Do

### Description
This is an integration test story created automatically.

### Acceptance Criteria
- [ ] Test should pass
- [ ] Story should be created in Jira
- [ ] Story should be exported back to markdown

### Priority
Low

### Labels
test, integration, automated

### Assignees
${process.env.JIRA_EMAIL?.split('@')[0] || 'test'}

### Reporter
${process.env.JIRA_EMAIL?.split('@')[0] || 'test'}
`;

        await fs.writeFile(path.join(testDir, "test-story.md"), testMarkdown);
        console.log("✓ Test markdown file created\n");

        console.log("Test 3: Import to Jira (dry run)");
        const importResult = await mdToJira({
            jiraConfig,
            inputDir: testDir,
            dryRun: true,
            logger
        });
        console.log(`✓ Dry run completed: ${importResult.created} would be created\n`);

        console.log("Test 4: Export from Jira (dry run)");
        const exportResult = await jiraToMd({
            jiraConfig,
            outputDir: path.join(testDir, "export"),
            dryRun: true,
            logger
        });
        console.log(`✓ Dry run completed: ${exportResult.totalIssues} issues found\n`);

        console.log("Test 5: Cleanup");
        await fs.rm(testDir, { recursive: true, force: true });
        console.log("✓ Cleanup completed\n");

        console.log("All integration tests passed! ✓");
        return true;
    } catch (error) {
        console.error("Integration test failed:", (error as Error).message);
        console.error((error as Error).stack);
        return false;
    }
}

runIntegrationTests().then(success => {
    process.exit(success ? 0 : 1);
});
