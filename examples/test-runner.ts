import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import { JiraProvider } from "../src/jira/provider";
import type { JiraConfig } from "../src/jira/types";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

interface TestRunOptions {
  skipCleanup: boolean;
  outputFormat: 'text' | 'json' | 'html';
  verbose: boolean;
}

interface TestRunResult {
  success: boolean;
  startTime: string;
  endTime: string;
  duration: number;
  steps: StepResult[];
  summary: TestSummary;
}

interface StepResult {
  step: string;
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
}

interface TestSummary {
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  issuesCreated: number;
  issuesDeleted: number;
  filesGenerated: number;
}

async function main() {
  const args = process.argv.slice(2);
  const options: TestRunOptions = {
    skipCleanup: args.includes('--skip-cleanup'),
    outputFormat: getOutputFormat(args),
    verbose: args.includes('--verbose')
  };

  console.log('=== Automated Test Runner ===\n');
  console.log(`Output format: ${options.outputFormat}`);
  console.log(`Skip cleanup: ${options.skipCleanup}`);
  console.log(`Verbose: ${options.verbose}\n`);

  const startTime = new Date();
  const result: TestRunResult = {
    success: true,
    startTime: startTime.toISOString(),
    endTime: '',
    duration: 0,
    steps: [],
    summary: {
      totalSteps: 0,
      passedSteps: 0,
      failedSteps: 0,
      issuesCreated: 0,
      issuesDeleted: 0,
      filesGenerated: 0
    }
  };

  try {
    await runStep(result, 'Validate Environment', validateEnvironment, options);
    await runStep(result, 'Run Format Sync Test', runFormatSyncTest, options);
    
    if (!options.skipCleanup) {
      await runStep(result, 'Cleanup Test Data', cleanupTestData, options);
    }

    result.success = result.steps.every(s => s.success);
  } catch (error) {
    result.success = false;
    console.error('\nTest run failed:', (error as Error).message);
  }

  const endTime = new Date();
  result.endTime = endTime.toISOString();
  result.duration = endTime.getTime() - startTime.getTime();

  calculateSummary(result);
  await outputResults(result, options);

  const exitCode = result.success ? 0 : 1;
  process.exit(exitCode);
}

function getOutputFormat(args: string[]): 'text' | 'json' | 'html' {
  const formatArg = args.find(arg => arg.startsWith('--format='));
  if (formatArg) {
    const format = formatArg.split('=')[1];
    if (format === 'json' || format === 'html') {
      return format;
    }
  }
  return 'text';
}

async function runStep(
  result: TestRunResult,
  stepName: string,
  stepFunction: (options: TestRunOptions) => Promise<StepResult>,
  options: TestRunOptions
): Promise<void> {
  console.log(`\n[${result.steps.length + 1}] ${stepName}...`);
  
  const stepStart = Date.now();
  
  try {
    const stepResult = await stepFunction(options);
    stepResult.step = stepName;
    stepResult.duration = Date.now() - stepStart;
    result.steps.push(stepResult);

    if (stepResult.success) {
      console.log(`✓ ${stepName} completed (${stepResult.duration}ms)`);
      if (options.verbose && stepResult.output) {
        console.log(stepResult.output);
      }
    } else {
      console.error(`✗ ${stepName} failed`);
      if (stepResult.error) {
        console.error(`  Error: ${stepResult.error}`);
      }
    }
  } catch (error) {
    const stepResult: StepResult = {
      step: stepName,
      success: false,
      duration: Date.now() - stepStart,
      error: (error as Error).message
    };
    result.steps.push(stepResult);
    console.error(`✗ ${stepName} failed: ${stepResult.error}`);
  }
}

async function validateEnvironment(options: TestRunOptions): Promise<StepResult> {
  const jiraConfig: JiraConfig = {
    jiraUrl: process.env.JIRA_URL || "",
    email: process.env.JIRA_EMAIL || "",
    apiToken: process.env.JIRA_API_TOKEN || "",
    projectKey: process.env.JIRA_PROJECT_KEY || ""
  };

  if (!jiraConfig.jiraUrl || !jiraConfig.email || !jiraConfig.apiToken || !jiraConfig.projectKey) {
    return {
      step: 'Validate Environment',
      success: false,
      duration: 0,
      error: 'Missing required Jira configuration'
    };
  }

  try {
    const provider = new JiraProvider({ config: jiraConfig });
    await provider.getProject();

    return {
      step: 'Validate Environment',
      success: true,
      duration: 0,
      output: 'Jira connection validated successfully'
    };
  } catch (error) {
    return {
      step: 'Validate Environment',
      success: false,
      duration: 0,
      error: `Failed to connect to Jira: ${(error as Error).message}`
    };
  }
}

async function runFormatSyncTest(options: TestRunOptions): Promise<StepResult> {
  try {
    const { stdout, stderr } = await execAsync('npm run test:format -- --cleanup', {
      cwd: path.resolve(__dirname),
      env: { ...process.env }
    });

    const output = stdout + stderr;
    const success = !output.includes('Error') && !output.includes('failed');

    return {
      step: 'Run Format Sync Test',
      success,
      duration: 0,
      output: options.verbose ? output : undefined
    };
  } catch (error) {
    return {
      step: 'Run Format Sync Test',
      success: false,
      duration: 0,
      error: (error as Error).message
    };
  }
}

async function cleanupTestData(options: TestRunOptions): Promise<StepResult> {
  try {
    const { stdout, stderr } = await execAsync('npm run test:cleanup -- --all --confirm', {
      cwd: path.resolve(__dirname),
      env: { ...process.env }
    });

    const output = stdout + stderr;
    const success = !output.includes('Error');

    return {
      step: 'Cleanup Test Data',
      success,
      duration: 0,
      output: options.verbose ? output : undefined
    };
  } catch (error) {
    return {
      step: 'Cleanup Test Data',
      success: false,
      duration: 0,
      error: (error as Error).message
    };
  }
}

function calculateSummary(result: TestRunResult): void {
  result.summary.totalSteps = result.steps.length;
  result.summary.passedSteps = result.steps.filter(s => s.success).length;
  result.summary.failedSteps = result.steps.filter(s => !s.success).length;
}

async function outputResults(result: TestRunResult, options: TestRunOptions): Promise<void> {
  console.log('\n=== Test Run Summary ===\n');
  console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
  console.log(`Total steps: ${result.summary.totalSteps}`);
  console.log(`Passed: ${result.summary.passedSteps}`);
  console.log(`Failed: ${result.summary.failedSteps}`);
  console.log(`Success: ${result.success ? 'YES' : 'NO'}\n`);

  if (options.outputFormat === 'json') {
    await outputJson(result);
  } else if (options.outputFormat === 'html') {
    await outputHtml(result);
  }
}

async function outputJson(result: TestRunResult): Promise<void> {
  const outputFile = 'test-report.json';
  await fs.writeFile(outputFile, JSON.stringify(result, null, 2));
  console.log(`JSON report saved to: ${outputFile}`);
}

async function outputHtml(result: TestRunResult): Promise<void> {
  const html = generateHtmlReport(result);
  const outputFile = 'test-report.html';
  await fs.writeFile(outputFile, html);
  console.log(`HTML report saved to: ${outputFile}`);
}

function generateHtmlReport(result: TestRunResult): string {
  const statusColor = result.success ? '#4caf50' : '#f44336';
  const statusText = result.success ? 'PASSED' : 'FAILED';

  return `<!DOCTYPE html>
<html>
<head>
  <title>Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: ${statusColor}; color: white; padding: 20px; border-radius: 5px; }
    .summary { margin: 20px 0; }
    .step { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
    .step.success { border-left: 5px solid #4caf50; }
    .step.failed { border-left: 5px solid #f44336; }
    .duration { color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Test Run Report</h1>
    <h2>${statusText}</h2>
  </div>
  
  <div class="summary">
    <h3>Summary</h3>
    <p>Duration: ${(result.duration / 1000).toFixed(2)}s</p>
    <p>Total Steps: ${result.summary.totalSteps}</p>
    <p>Passed: ${result.summary.passedSteps}</p>
    <p>Failed: ${result.summary.failedSteps}</p>
  </div>
  
  <div class="steps">
    <h3>Steps</h3>
    ${result.steps.map(step => `
      <div class="step ${step.success ? 'success' : 'failed'}">
        <h4>${step.success ? '✓' : '✗'} ${step.step}</h4>
        <p class="duration">Duration: ${step.duration}ms</p>
        ${step.error ? `<p style="color: #f44336;">Error: ${step.error}</p>` : ''}
        ${step.output ? `<pre>${step.output}</pre>` : ''}
      </div>
    `).join('')}
  </div>
  
  <div class="footer">
    <p>Generated: ${new Date().toISOString()}</p>
  </div>
</body>
</html>`;
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
