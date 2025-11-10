import dotenv from "dotenv";
import path from "path";
import { existsSync, statSync } from "fs";
import { mdToJira } from "../jira/md-to-jira";
import { validateJiraConfig } from "../utils/config-validator";
import { handleCommonErrors } from "../utils/error-handler";
import type { JiraConfig } from "../jira/types";

function loadEnv(): void {
  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, "../../../.env"),
    path.resolve(__dirname, "../../.env")
  ];

  for (const envPath of candidates) {
    if (existsSync(envPath)) {
      const result = dotenv.config({ path: envPath });
      if (!result.error) {
        return;
      }
    }
  }

  dotenv.config();
}

export async function mdToJiraCli(): Promise<void> {
  loadEnv();

  const args = process.argv.slice(2);
  const customInputDir = args[0];

  const jiraUrl = process.env.JIRA_URL || "";
  const email = process.env.JIRA_EMAIL || "";
  const apiToken = process.env.JIRA_API_TOKEN || "";
  const projectKey = process.env.JIRA_PROJECT_KEY || "";
  const issueTypeId = process.env.JIRA_ISSUE_TYPE_ID;

  const inputDir = customInputDir || (process.env.MD_INPUT_DIR || "./md").trim();

  // Resolve path: if absolute, use as-is; if relative, resolve from project root
  let resolvedInputDir: string;
  if (path.isAbsolute(inputDir)) {
    resolvedInputDir = inputDir;
  } else {
    // Find project root (where .env is located)
    const projectRoot = path.resolve(__dirname, "../../../");
    resolvedInputDir = path.resolve(projectRoot, inputDir);

    // Fallback: if not found in project root, try from cwd (for backward compatibility)
    if (!existsSync(resolvedInputDir)) {
      const cwdPath = path.resolve(process.cwd(), inputDir);
      if (existsSync(cwdPath)) {
        resolvedInputDir = cwdPath;
      }
    }
  }

  if (!existsSync(resolvedInputDir) || !statSync(resolvedInputDir).isDirectory()) {
    throw new Error(`Input directory not found: ${resolvedInputDir}`);
  }
  const dryRun = process.env.DRY_RUN === "true";

  const validation = validateJiraConfig({
    jiraUrl,
    email,
    apiToken,
    projectKey
  });

  if (!validation.isValid) {
    const errorMessages = validation.errors.map(e =>
      `${e.field}: ${e.message}${e.suggestion ? ` (${e.suggestion})` : ''}`
    );
    throw new Error(`Configuration validation failed: ${errorMessages.join('; ')}`);
  }

  if (validation.warnings.length > 0) {
    validation.warnings.forEach(w => {
      const warningMsg = `Warning - ${w.field}: ${w.message}${w.suggestion ? ` (${w.suggestion})` : ''}`;
      console.warn(warningMsg);
    });
  }

  const jiraConfig: JiraConfig = {
    jiraUrl,
    email,
    apiToken,
    projectKey,
    issueTypeId
  };

  const logger = {
    info: (...args: any[]) => console.log(...args),
    debug: (...args: any[]) => console.log(...args),
    warn: (...args: any[]) => console.warn(...args),
    error: (...args: any[]) => console.error(...args)
  };

  const result = await mdToJira({
    jiraConfig,
    inputDir: resolvedInputDir,
    dryRun,
    logger
  });

  console.log(`md-to-jira: ${dryRun ? '[DRY RUN] ' : ''}Processed ${result.processedFiles} files, created ${result.created}, skipped ${result.skipped}`);

  if (result.errors.length > 0) {
    console.error(`md-to-jira: ${result.errors.length} errors occurred:`);
    result.errors.forEach(err => console.error(`  - ${err}`));
  }
}

if (require.main === module) {
  mdToJiraCli().catch(e => {
    const syncError = handleCommonErrors(e);
    console.error(`[ERROR] md-to-jira: ${syncError.message}`);

    if (syncError.suggestion) {
      console.error(`[SUGGESTION] ${syncError.suggestion}`);
    }

    console.error(`[ERROR_CODE] ${syncError.code}`);

    const stack = (e as any)?.stack ? String((e as any).stack) : "";
    const nl = stack.indexOf(String.fromCharCode(10));
    const first = nl >= 0 ? stack.slice(0, nl) : (stack || String(e));
    console.error("[stack]", first);
    process.exit(1);
  });
}
