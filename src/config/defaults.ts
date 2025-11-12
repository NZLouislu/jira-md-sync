/**
 * Default input directory (source files for editing)
 */
export const DEFAULT_INPUT_DIR = 'jiramd';

/**
 * Default output directory (sync cache from Jira)
 */
export const DEFAULT_OUTPUT_DIR = 'jira';

/**
 * Get input directory for md-to-jira operations (source files)
 * 
 * Priority order:
 * 1. MD_INPUT_DIR environment variable
 * 2. Default value (jiramd)
 * 
 * @returns The resolved input directory path
 */
export function getInputDir(): string {
    return process.env.MD_INPUT_DIR || DEFAULT_INPUT_DIR;
}

/**
 * Get output directory for jira-to-md operations (sync cache)
 * 
 * Priority order:
 * 1. MD_OUTPUT_DIR environment variable
 * 2. Default value (jira)
 * 
 * @returns The resolved output directory path
 */
export function getOutputDir(): string {
    return process.env.MD_OUTPUT_DIR || DEFAULT_OUTPUT_DIR;
}
