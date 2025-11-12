import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import { mdToJira } from "../src/jira/md-to-jira";
import { jiraToMd } from "../src/jira/jira-to-md";
import type { JiraConfig } from "../src/jira/types";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

interface TestResult {
  storyId: string;
  title: string;
  passed: boolean;
  fidelity: number;
  differences: string[];
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  averageFidelity: number;
  results: TestResult[];
}

interface TrackingData {
  testRunId: string;
  timestamp: string;
  issueKeys: string[];
  inputFile: string;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const cleanup = args.includes('--cleanup');
  const inputFile = args.find(arg => !arg.startsWith('--')) || './md/test-formats.md';

  console.log('=== Format Synchronization Test ===\n');
  console.log(`Input file: ${inputFile}`);
  console.log(`Dry-run: ${dryRun}`);
  console.log(`Cleanup: ${cleanup}\n`);

  const jiraConfig: JiraConfig = {
    jiraUrl: process.env.JIRA_URL || "",
    email: process.env.JIRA_EMAIL || "",
    apiToken: process.env.JIRA_API_TOKEN || "",
    projectKey: process.env.JIRA_PROJECT_KEY || "",
    issueTypeId: process.env.JIRA_ISSUE_TYPE_ID || "10001"
  };

  validateConfig(jiraConfig);

  const logger = createLogger();

  console.log('Step 1: Loading test markdown file...');
  const originalContent = await loadMarkdownFile(inputFile);
  console.log(`✓ Loaded ${originalContent.length} characters\n`);

  if (dryRun) {
    console.log('[DRY-RUN] Would create issues in Jira');
    console.log('[DRY-RUN] Would export issues back to markdown');
    console.log('[DRY-RUN] Would compare formats');
    console.log('\n[DRY-RUN] No actual operations performed');
    process.exit(0);
  }

  console.log('Step 2: Importing markdown to Jira...');
  const importResult = await mdToJira({
    jiraConfig,
    inputDir: path.dirname(path.resolve(inputFile)),
    dryRun: false,
    logger
  });

  console.log(`✓ Created ${importResult.created} issues`);
  console.log(`✓ Updated ${importResult.updated} issues\n`);

  if (importResult.created === 0 && importResult.updated === 0) {
    console.log('No issues were created or updated. Exiting.');
    process.exit(0);
  }

  const trackingFile = await saveTrackingData(inputFile, importResult);
  console.log(`✓ Saved tracking data to ${trackingFile}\n`);

  await sleep(2000);

  console.log('Step 3: Exporting issues back to markdown...');
  const exportDir = './test-output';
  await ensureDirectory(exportDir);

  const jql = `project = ${jiraConfig.projectKey} AND labels = "format-test" ORDER BY key ASC`;
  const exportResult = await jiraToMd({
    jiraConfig,
    outputDir: exportDir,
    jql,
    dryRun: false,
    logger
  });

  console.log(`✓ Exported ${exportResult.written} files\n`);

  console.log('Step 4: Comparing formats...');
  const exportedContent = await loadExportedFiles(exportDir);
  const summary = compareFormats(originalContent, exportedContent);

  displayTestResults(summary);

  if (cleanup) {
    console.log('\nStep 5: Cleaning up...');
    await cleanupTestData(trackingFile, exportDir);
    console.log('✓ Cleanup completed');
  } else {
    console.log(`\nTo clean up test issues, run:`);
    console.log(`  npm run delete -- --labels=format-test --confirm`);
    console.log(`\nTo remove exported files:`);
    console.log(`  rm -rf ${exportDir}`);
  }

  const exitCode = summary.failed > 0 ? 1 : 0;
  process.exit(exitCode);
}

function validateConfig(config: JiraConfig): void {
  if (!config.jiraUrl || !config.email || !config.apiToken || !config.projectKey) {
    console.error('Error: Missing required Jira configuration');
    console.error('Please set JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN, and JIRA_PROJECT_KEY in .env file');
    process.exit(1);
  }
}

function createLogger() {
  return {
    info: (...args: any[]) => {},
    debug: (...args: any[]) => {},
    warn: (...args: any[]) => console.warn(...args),
    error: (...args: any[]) => console.error(...args)
  };
}

async function loadMarkdownFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(path.resolve(filePath), 'utf-8');
  } catch (error) {
    console.error(`Error loading file ${filePath}:`, (error as Error).message);
    process.exit(1);
  }
}

async function ensureDirectory(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error(`Error creating directory ${dir}:`, (error as Error).message);
    process.exit(1);
  }
}

async function saveTrackingData(inputFile: string, importResult: any): Promise<string> {
  const trackingData: TrackingData = {
    testRunId: `test-${Date.now()}`,
    timestamp: new Date().toISOString(),
    issueKeys: [],
    inputFile
  };

  const trackingFile = '.test-issues.json';
  await fs.writeFile(trackingFile, JSON.stringify(trackingData, null, 2));
  return trackingFile;
}

async function loadExportedFiles(exportDir: string): Promise<string> {
  try {
    const files = await fs.readdir(exportDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    const contents = await Promise.all(
      mdFiles.map(f => fs.readFile(path.join(exportDir, f), 'utf-8'))
    );
    
    return contents.join('\n\n');
  } catch (error) {
    console.error(`Error loading exported files:`, (error as Error).message);
    return '';
  }
}

function compareFormats(original: string, exported: string): TestSummary {
  const originalStories = extractStories(original);
  const exportedStories = extractStories(exported);

  const results: TestResult[] = [];

  for (const origStory of originalStories) {
    const exportedStory = exportedStories.find(s => 
      s.title.includes(origStory.title) || origStory.title.includes(s.title)
    );

    if (!exportedStory) {
      results.push({
        storyId: origStory.id,
        title: origStory.title,
        passed: false,
        fidelity: 0,
        differences: ['Story not found in exported files']
      });
      continue;
    }

    const comparison = compareStoryContent(origStory, exportedStory);
    results.push({
      storyId: origStory.id,
      title: origStory.title,
      passed: comparison.fidelity >= 80,
      fidelity: comparison.fidelity,
      differences: comparison.differences
    });
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const averageFidelity = results.reduce((sum, r) => sum + r.fidelity, 0) / results.length;

  return {
    total: results.length,
    passed,
    failed,
    averageFidelity,
    results
  };
}

function extractStories(content: string): Array<{ id: string; title: string; content: string }> {
  const stories: Array<{ id: string; title: string; content: string }> = [];
  const storyPattern = /- Story: (.+?)\n/g;
  
  let match;
  while ((match = storyPattern.exec(content)) !== null) {
    const title = match[1].trim();
    const id = title.split(' ')[0];
    stories.push({ id, title, content: '' });
  }

  return stories;
}

function compareStoryContent(
  original: { id: string; title: string; content: string },
  exported: { id: string; title: string; content: string }
): { fidelity: number; differences: string[] } {
  const differences: string[] = [];
  let matchScore = 100;

  if (original.title !== exported.title) {
    differences.push(`Title mismatch: "${original.title}" vs "${exported.title}"`);
    matchScore -= 10;
  }

  return {
    fidelity: Math.max(0, matchScore),
    differences
  };
}

function displayTestResults(summary: TestSummary): void {
  console.log('\n=== Test Results ===\n');
  console.log(`Total tests: ${summary.total}`);
  console.log(`Passed: ${summary.passed} (${((summary.passed / summary.total) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${summary.failed} (${((summary.failed / summary.total) * 100).toFixed(1)}%)`);
  console.log(`Average fidelity: ${summary.averageFidelity.toFixed(1)}%\n`);

  if (summary.failed > 0) {
    console.log('Failed tests:');
    for (const result of summary.results.filter(r => !r.passed)) {
      console.log(`\n  ${result.storyId}: ${result.title}`);
      console.log(`  Fidelity: ${result.fidelity.toFixed(1)}%`);
      for (const diff of result.differences) {
        console.log(`    - ${diff}`);
      }
    }
  }

  if (summary.passed > 0) {
    console.log('\nPassed tests:');
    for (const result of summary.results.filter(r => r.passed)) {
      console.log(`  ✓ ${result.storyId}: ${result.title} (${result.fidelity.toFixed(1)}%)`);
    }
  }
}

async function cleanupTestData(trackingFile: string, exportDir: string): Promise<void> {
  try {
    await fs.unlink(trackingFile);
    console.log(`✓ Removed ${trackingFile}`);
  } catch (error) {
    console.warn(`Warning: Could not remove ${trackingFile}`);
  }

  try {
    await fs.rm(exportDir, { recursive: true, force: true });
    console.log(`✓ Removed ${exportDir}`);
  } catch (error) {
    console.warn(`Warning: Could not remove ${exportDir}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
