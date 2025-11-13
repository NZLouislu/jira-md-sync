import "dotenv/config";
import { jiraToMd } from "../src/jira/jira-to-md";
import { mdToJira } from "../src/jira/md-to-jira";
import type { JiraConfig } from "../src/jira/types";

async function testDefaults() {
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

    console.log("=== Testing Default Paths ===\n");

    // Test 1: jiraToMd without outputDir (should use 'jira' as default)
    console.log("Test 1: jiraToMd without outputDir");
    try {
        const result = await jiraToMd({
            jiraConfig,
            // outputDir not specified - should default to 'jira'
            dryRun: true,
            logger
        });
        console.log(`✅ Success: Would write to default 'jira' directory`);
        console.log(`   Total issues: ${result.totalIssues}\n`);
    } catch (error) {
        console.error(`❌ Error: ${(error as Error).message}\n`);
    }

    // Test 2: jiraToMd with explicit outputDir
    console.log("Test 2: jiraToMd with explicit outputDir");
    try {
        const result = await jiraToMd({
            jiraConfig,
            outputDir: "custom-output",
            dryRun: true,
            logger
        });
        console.log(`✅ Success: Would write to 'custom-output' directory`);
        console.log(`   Total issues: ${result.totalIssues}\n`);
    } catch (error) {
        console.error(`❌ Error: ${(error as Error).message}\n`);
    }

    // Test 3: mdToJira without inputDir (should use 'jiramd' as default)
    console.log("Test 3: mdToJira without inputDir");
    try {
        const result = await mdToJira({
            jiraConfig,
            // inputDir not specified - should default to 'jiramd'
            dryRun: true,
            logger
        });
        console.log(`✅ Success: Would read from default 'jiramd' directory`);
        console.log(`   Files processed: ${result.processedFiles}\n`);
    } catch (error) {
        console.error(`❌ Error: ${(error as Error).message}`);
        console.log(`   (This is expected if 'jiramd' directory doesn't exist)\n`);
    }

    // Test 4: mdToJira with explicit inputDir
    console.log("Test 4: mdToJira with explicit inputDir");
    try {
        const result = await mdToJira({
            jiraConfig,
            inputDir: "examples/jiramd",
            dryRun: true,
            logger
        });
        console.log(`✅ Success: Would read from 'examples/jiramd' directory`);
        console.log(`   Files processed: ${result.processedFiles}\n`);
    } catch (error) {
        console.error(`❌ Error: ${(error as Error).message}\n`);
    }

    console.log("=== Test Complete ===");
}

testDefaults().catch(error => {
    console.error("Fatal error:", error.message);
    process.exit(1);
});
