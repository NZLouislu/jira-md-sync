import dotenv from "dotenv";
import path from "path";
import { existsSync } from "fs";
import { promises as fs } from "fs";
import { jiraToMd } from "../jira/jira-to-md";
import { validateJiraConfig } from "../utils/config-validator";
import { handleCommonErrors } from "../utils/error-handler";
import { getOutputDir, getInputDir } from "../config/defaults";
import type { JiraConfig } from "../jira/types";

// Use __dirname for CommonJS compatibility
const currentDir = __dirname;

function loadEnv(): void {
  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(currentDir, "../../../.env"),
    path.resolve(currentDir, "../../.env")
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

export async function jiraToMdCli(): Promise<void> {
  loadEnv();

  const args = process.argv.slice(2);
  const issueKey = args[0];
  const customOutputDir = args[1];

  const jiraUrl = process.env.JIRA_URL || "";
  const email = process.env.JIRA_EMAIL || "";
  const apiToken = process.env.JIRA_API_TOKEN || "";
  const projectKey = process.env.JIRA_PROJECT_KEY || "";

  // Priority: CLI arg > MD_OUTPUT_DIR > default (jira)
  const outputDirEnv = customOutputDir || getOutputDir();

  // Resolve path: if absolute, use as-is; if relative, resolve from project root
  let outputDir: string;
  if (path.isAbsolute(outputDirEnv)) {
    outputDir = outputDirEnv;
  } else {
    // Find project root (where .env is located)
    const projectRoot = path.resolve(currentDir, "../../../");
    outputDir = path.resolve(projectRoot, outputDirEnv);
  }

  let jql = process.env.JIRA_JQL || "";
  if (issueKey && /^[A-Z]+-\d+$/.test(issueKey)) {
    jql = `key = ${issueKey}`;
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

  let statusMap: Record<string, string> | undefined;
  if (process.env.STATUS_MAP) {
    try {
      statusMap = JSON.parse(process.env.STATUS_MAP);
    } catch (error) {
      console.warn(`Warning: Invalid STATUS_MAP JSON format, using default mapping`);
    }
  }

  const jiraConfig: JiraConfig = {
    jiraUrl,
    email,
    apiToken,
    projectKey,
    statusMap
  };

  const logger = {
    info: (...args: any[]) => console.log(...args),
    debug: (...args: any[]) => console.log(...args),
    warn: (...args: any[]) => console.warn(...args),
    error: (...args: any[]) => console.error(...args)
  };

  // Try to find input directory for preserving labels order
  // Priority: MD_INPUT_DIR > default (jiramd)
  const inputDirEnv = getInputDir();
  let inputDir: string | undefined;

  if (inputDirEnv) {
    const resolvedInputDir = path.isAbsolute(inputDirEnv)
      ? inputDirEnv
      : path.resolve(currentDir, "../../../", inputDirEnv);

    try {
      await fs.access(resolvedInputDir);
      inputDir = resolvedInputDir;
    } catch {
      // Input directory doesn't exist, that's okay
    }
  }

  const result = await jiraToMd({
    jiraConfig,
    outputDir,
    inputDir,
    jql: jql || undefined,
    dryRun,
    logger
  });

  console.log(`jira-to-md: ${dryRun ? '[DRY RUN] ' : ''}Written ${result.written} files from ${result.totalIssues} issues`);
}

if (require.main === module) {
  jiraToMdCli().catch(e => {
    const syncError = handleCommonErrors(e);
    console.error(`[ERROR] jira-to-md: ${syncError.message}`);

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
