#!/usr/bin/env node

import "dotenv/config";
import { validateAndEnsureDirectory } from "../utils/directory-manager";
import { validateJiraConfig } from "../utils/config-validator";
import { JiraProvider } from "../jira/provider";
import path from "path";

interface ValidateConfigArgs {
  jiraUrl?: string;
  email?: string;
  apiToken?: string;
  projectKey?: string;
  mdInputDir?: string;
  mdOutputDir?: string;
  projectRoot?: string;
  verbose?: boolean;
}

async function testJiraConnectivity(jiraUrl: string, email: string, apiToken: string, projectKey: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const provider = new JiraProvider({
      config: {
        jiraUrl,
        email,
        apiToken,
        projectKey
      }
    });

    await provider.getProject();
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to connect to Jira API"
    };
  }
}

export async function validateConfig(args: ValidateConfigArgs = {}): Promise<{
  success: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const projectRoot = args.projectRoot || process.cwd();
  const jiraUrl = args.jiraUrl !== undefined ? args.jiraUrl : (process.env.JIRA_URL || "");
  const email = args.email !== undefined ? args.email : (process.env.JIRA_EMAIL || "");
  const apiToken = args.apiToken !== undefined ? args.apiToken : (process.env.JIRA_API_TOKEN || "");
  const projectKey = args.projectKey !== undefined ? args.projectKey : (process.env.JIRA_PROJECT_KEY || "");

  const configValidation = validateJiraConfig({
    jiraUrl,
    email,
    apiToken,
    projectKey
  });

  if (!configValidation.isValid) {
    configValidation.errors.forEach(error => {
      errors.push(`${error.field}: ${error.message}${error.suggestion ? ` (${error.suggestion})` : ''}`);
    });
  }

  configValidation.warnings.forEach(warning => {
    warnings.push(`${warning.field}: ${warning.message}${warning.suggestion ? ` (${warning.suggestion})` : ''}`);
  });

  if (configValidation.isValid) {
    const connectivityTest = await testJiraConnectivity(jiraUrl, email, apiToken, projectKey);

    if (!connectivityTest.success) {
      errors.push(`Jira API connectivity test failed: ${connectivityTest.error}`);
    }
  }

  const inputDir = args.mdInputDir
    ? (path.isAbsolute(args.mdInputDir) ? args.mdInputDir : path.resolve(projectRoot, args.mdInputDir))
    : path.resolve(projectRoot, "jira");

  const outputDir = args.mdOutputDir
    ? (path.isAbsolute(args.mdOutputDir) ? args.mdOutputDir : path.resolve(projectRoot, args.mdOutputDir))
    : path.resolve(projectRoot, "jira");

  const inputDirValidation = await validateAndEnsureDirectory(inputDir);
  if (!inputDirValidation.success) {
    errors.push(`Input directory validation failed: ${inputDirValidation.error}`);
  }

  const outputDirValidation = await validateAndEnsureDirectory(outputDir);
  if (!outputDirValidation.success) {
    errors.push(`Output directory validation failed: ${outputDirValidation.error}`);
  }

  if (inputDirValidation.created) {
    warnings.push(`Created input directory: ${inputDir}`);
  }
  if (outputDirValidation.created) {
    warnings.push(`Created output directory: ${outputDir}`);
  }

  return {
    success: errors.length === 0,
    errors,
    warnings
  };
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');

  console.log("Validating Jira configuration...\n");

  try {
    const result = await validateConfig({ verbose });

    if (result.warnings.length > 0) {
      console.log("Warnings:");
      result.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
      console.log();
    }

    if (result.success) {
      console.log("✅ Configuration validation passed!");
      console.log("All required parameters are valid and Jira API is accessible.");
      process.exit(0);
    } else {
      console.log("❌ Configuration validation failed:");
      result.errors.forEach(error => console.log(`  ❌ ${error}`));
      console.log("\nPlease fix the above issues and try again.");
      process.exit(1);
    }
  } catch (error: any) {
    console.error("❌ Validation failed with error:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
