import "dotenv/config";
import { PlatformFactory } from "../platform/factory";
import type { PlatformConfig } from "../platform/types";

export async function syncCli(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  const command = args[0];

  if (command === 'export' || command === 'to-md') {
    await exportToMarkdown();
  } else if (command === 'import' || command === 'from-md') {
    await importFromMarkdown();
  } else if (command === 'validate') {
    await validateConfig();
  } else {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }
}

async function exportToMarkdown(): Promise<void> {
  const config = buildConfig();
  const outputDir = process.env.JIRA_MD_OUTPUT_DIR || `./jira`;
  const dryRun = process.env.DRY_RUN === 'true';
  const jql = process.env.JIRA_JQL;

  const logger = {
    info: (...args: any[]) => console.log(...args),
    debug: (...args: any[]) => console.log(...args),
    warn: (...args: any[]) => console.warn(...args),
    error: (...args: any[]) => console.error(...args)
  };

  const validation = PlatformFactory.validateConfig(config);
  if (!validation.isValid) {
    const errorMessages = validation.errors.map(e =>
      `${e.field}: ${e.message}${e.suggestion ? ` (${e.suggestion})` : ''}`
    );
    throw new Error(`Configuration validation failed: ${errorMessages.join('; ')}`);
  }

  const result = await PlatformFactory.exportToMarkdown(config, {
    outputDir,
    dryRun,
    logger,
    jql
  });

  console.log(`Export complete: ${result.written} files written from ${result.totalItems} items`);
}

async function importFromMarkdown(): Promise<void> {
  const config = buildConfig();
  const inputDir = process.env.JIRA_MD_INPUT_DIR || `./jira`;
  const dryRun = process.env.DRY_RUN === 'true';

  const logger = {
    info: (...args: any[]) => console.log(...args),
    debug: (...args: any[]) => console.log(...args),
    warn: (...args: any[]) => console.warn(...args),
    error: (...args: any[]) => console.error(...args)
  };

  const validation = PlatformFactory.validateConfig(config);
  if (!validation.isValid) {
    const errorMessages = validation.errors.map(e =>
      `${e.field}: ${e.message}${e.suggestion ? ` (${e.suggestion})` : ''}`
    );
    throw new Error(`Configuration validation failed: ${errorMessages.join('; ')}`);
  }

  const result = await PlatformFactory.importFromMarkdown(config, {
    inputDir,
    dryRun,
    logger
  });

  console.log(`Import complete: ${result.processedFiles} files processed, ${result.created} created, ${result.skipped} skipped`);

  if (result.errors.length > 0) {
    console.error(`${result.errors.length} errors occurred:`);
    result.errors.forEach(err => console.error(`  - ${err}`));
  }
}

async function validateConfig(): Promise<void> {
  const config = buildConfig();
  const validation = PlatformFactory.validateConfig(config);

  if (validation.isValid) {
    console.log('Configuration is valid');
  } else {
    console.error('Configuration validation failed:');
    validation.errors.forEach(e => {
      console.error(`  - ${e.field}: ${e.message}${e.suggestion ? ` (${e.suggestion})` : ''}`);
    });
    process.exit(1);
  }

  if (validation.warnings.length > 0) {
    console.warn('Warnings:');
    validation.warnings.forEach(w => {
      console.warn(`  - ${w.field}: ${w.message}${w.suggestion ? ` (${w.suggestion})` : ''}`);
    });
  }
}

function buildConfig(): PlatformConfig {
  return {
    platform: 'jira',
    jiraUrl: process.env.JIRA_URL || '',
    email: process.env.JIRA_EMAIL || '',
    apiToken: process.env.JIRA_API_TOKEN || '',
    projectKey: process.env.JIRA_PROJECT_KEY || '',
    issueTypeId: process.env.JIRA_ISSUE_TYPE_ID
  };
}

function printHelp(): void {
  console.log(`
jira-md-sync - CLI for syncing between Jira and Markdown

USAGE:
  jira-sync <command> [options]

COMMANDS:
  export, to-md      Export from Jira to Markdown files
  import, from-md    Import from Markdown files to Jira
  validate           Validate Jira configuration
  --help, -h         Show this help message

ENVIRONMENT VARIABLES:
  DRY_RUN                Set to 'true' for dry run mode
  JIRA_MD_OUTPUT_DIR     Output directory for markdown files (default: ./jira)
  JIRA_MD_INPUT_DIR      Input directory for markdown files (default: ./jira)

JIRA CONFIGURATION:
  JIRA_URL           Jira instance URL (e.g., https://your-domain.atlassian.net)
  JIRA_EMAIL         Email for Jira authentication
  JIRA_API_TOKEN     API token for Jira authentication
  JIRA_PROJECT_KEY   Jira project key (e.g., PROJ)
  JIRA_JQL           JQL query for filtering issues (optional)
  JIRA_ISSUE_TYPE_ID Issue type ID for creating issues (optional)

EXAMPLES:
  # Export Jira issues to Markdown
  jira-sync export

  # Import Markdown to Jira (dry run)
  DRY_RUN=true jira-sync import

  # Validate Jira configuration
  jira-sync validate

  # Export with custom JQL
  JIRA_JQL="project = PROJ AND status = 'In Progress'" jira-sync export
`);
}

if (require.main === module) {
  syncCli().catch(e => {
    console.error(`[ERROR] ${e.message}`);
    const stack = (e as any)?.stack ? String((e as any).stack) : "";
    const nl = stack.indexOf(String.fromCharCode(10));
    const first = nl >= 0 ? stack.slice(0, nl) : (stack || String(e));
    console.error("[stack]", first);
    process.exit(1);
  });
}
