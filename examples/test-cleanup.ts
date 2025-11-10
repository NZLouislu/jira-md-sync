import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import readline from "readline";
import { JiraDeleteUtil } from "./utils/jira-delete-util";
import { JiraProvider } from "../src/jira/provider";
import type { JiraConfig } from "../src/jira/types";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

interface CleanupOptions {
  files: boolean;
  jira: boolean;
  all: boolean;
  dryRun: boolean;
  confirm: boolean;
}

interface CleanupSummary {
  filesRemoved: number;
  issuesDeleted: number;
  errors: string[];
}

async function main() {
  const options = parseArguments(process.argv.slice(2));

  console.log('=== Test Cleanup Utility ===\n');

  if (options.dryRun) {
    console.log('[DRY-RUN MODE]\n');
  }

  const summary: CleanupSummary = {
    filesRemoved: 0,
    issuesDeleted: 0,
    errors: []
  };

  if (options.files || options.all) {
    console.log('Cleaning up temporary files...');
    await cleanupFiles(summary, options.dryRun);
  }

  if (options.jira || options.all) {
    console.log('\nCleaning up Jira test issues...');
    await cleanupJiraIssues(summary, options);
  }

  displaySummary(summary, options.dryRun);

  const exitCode = summary.errors.length > 0 ? 1 : 0;
  process.exit(exitCode);
}

function parseArguments(args: string[]): CleanupOptions {
  return {
    files: args.includes('--files'),
    jira: args.includes('--jira'),
    all: args.includes('--all'),
    dryRun: args.includes('--dry-run'),
    confirm: args.includes('--confirm')
  };
}

async function cleanupFiles(summary: CleanupSummary, dryRun: boolean): Promise<void> {
  const filesToClean = [
    './test-output',
    './.test-issues.json',
    './test-temp'
  ];

  for (const filePath of filesToClean) {
    try {
      const fullPath = path.resolve(filePath);
      const stats = await fs.stat(fullPath).catch(() => null);

      if (!stats) {
        continue;
      }

      if (dryRun) {
        console.log(`  [DRY-RUN] Would remove: ${filePath}`);
        summary.filesRemoved++;
      } else {
        if (stats.isDirectory()) {
          await fs.rm(fullPath, { recursive: true, force: true });
        } else {
          await fs.unlink(fullPath);
        }
        console.log(`  ✓ Removed: ${filePath}`);
        summary.filesRemoved++;
      }
    } catch (error) {
      const errorMsg = `Failed to remove ${filePath}: ${(error as Error).message}`;
      console.error(`  ✗ ${errorMsg}`);
      summary.errors.push(errorMsg);
    }
  }

  if (summary.filesRemoved === 0) {
    console.log('  No temporary files found');
  }
}

async function cleanupJiraIssues(
  summary: CleanupSummary,
  options: CleanupOptions
): Promise<void> {
  const jiraConfig: JiraConfig = {
    jiraUrl: process.env.JIRA_URL || "",
    email: process.env.JIRA_EMAIL || "",
    apiToken: process.env.JIRA_API_TOKEN || "",
    projectKey: process.env.JIRA_PROJECT_KEY || ""
  };

  if (!jiraConfig.jiraUrl || !jiraConfig.email || !jiraConfig.apiToken || !jiraConfig.projectKey) {
    console.error('  Error: Missing Jira configuration');
    summary.errors.push('Missing Jira configuration');
    return;
  }

  const provider = new JiraProvider({ config: jiraConfig });
  const deleteUtil = new JiraDeleteUtil(jiraConfig);

  const trackingFile = './.test-issues.json';
  let issueKeys: string[] = [];

  try {
    const trackingData = await fs.readFile(trackingFile, 'utf-8');
    const data = JSON.parse(trackingData);
    issueKeys = data.issueKeys || [];
  } catch (error) {
    console.log('  No tracking file found, searching by labels...');
  }

  if (issueKeys.length === 0) {
    const jql = `project = ${jiraConfig.projectKey} AND (labels = "test" OR labels = "format-test" OR labels = "auto-generated") ORDER BY created DESC`;
    
    try {
      const searchResult = await provider.searchIssues(jql, 0, 100);
      issueKeys = searchResult.issues.map(issue => issue.key);
    } catch (error) {
      const errorMsg = `Failed to search issues: ${(error as Error).message}`;
      console.error(`  ✗ ${errorMsg}`);
      summary.errors.push(errorMsg);
      return;
    }
  }

  if (issueKeys.length === 0) {
    console.log('  No test issues found');
    return;
  }

  console.log(`  Found ${issueKeys.length} test issue(s)`);

  if (options.dryRun) {
    for (const key of issueKeys) {
      console.log(`  [DRY-RUN] Would delete: ${key}`);
      summary.issuesDeleted++;
    }
    return;
  }

  if (!options.confirm) {
    const confirmed = await promptConfirmation(issueKeys.length);
    if (!confirmed) {
      console.log('  Cleanup cancelled');
      return;
    }
  }

  for (const key of issueKeys) {
    const result = await deleteUtil.deleteIssue(key);
    if (result.success) {
      summary.issuesDeleted++;
    } else {
      const errorMsg = `Failed to delete ${key}: ${result.error}`;
      console.error(`  ✗ ${errorMsg}`);
      summary.errors.push(errorMsg);
    }
  }
}

async function promptConfirmation(count: number): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`\n  Delete ${count} test issue(s)? (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

function displaySummary(summary: CleanupSummary, dryRun: boolean): void {
  const prefix = dryRun ? '[DRY-RUN] ' : '';
  
  console.log(`\n${prefix}Cleanup Summary:`);
  console.log(`  Files removed: ${summary.filesRemoved}`);
  console.log(`  Issues deleted: ${summary.issuesDeleted}`);
  
  if (summary.errors.length > 0) {
    console.log(`  Errors: ${summary.errors.length}`);
    console.log('\nErrors:');
    for (const error of summary.errors) {
      console.log(`  - ${error}`);
    }
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
