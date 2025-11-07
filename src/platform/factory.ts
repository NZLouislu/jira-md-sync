import type { 
  PlatformType, 
  PlatformConfig, 
  JiraPlatformConfig,
  ToMdOptions,
  MdToOptions,
  SyncResult,
  ImportResult
} from './types';
import { validateJiraConfig } from '../utils/config-validator';
import { jiraToMd } from '../jira/jira-to-md';
import { mdToJira } from '../jira/md-to-jira';
import type { JiraConfig } from '../jira/types';

export class PlatformFactory {
  static detectPlatform(config: PlatformConfig): PlatformType {
    if (config.platform) {
      return config.platform;
    }
    
    if ('jiraUrl' in config || 'apiToken' in config || 'projectKey' in config) {
      return 'jira';
    }
    
    throw new Error('Unable to detect platform type. Please specify "platform" field as "jira"');
  }

  static validateConfig(config: PlatformConfig): { isValid: boolean; errors: any[]; warnings: any[] } {
    return validateJiraConfig(config);
  }

  static async exportToMarkdown(config: PlatformConfig, options: ToMdOptions): Promise<SyncResult> {
    const jiraConfig = config as JiraPlatformConfig;
    const jiraOpts: JiraConfig = {
      jiraUrl: jiraConfig.jiraUrl,
      email: jiraConfig.email,
      apiToken: jiraConfig.apiToken,
      projectKey: jiraConfig.projectKey,
      statusMap: jiraConfig.statusMap,
      issueTypeId: jiraConfig.issueTypeId
    };
    
    const result = await jiraToMd({
      jiraConfig: jiraOpts,
      outputDir: options.outputDir,
      jql: options.jql,
      dryRun: options.dryRun,
      logger: options.logger
    });
    
    return {
      written: result.written,
      files: result.files,
      totalItems: result.totalIssues
    };
  }

  static async importFromMarkdown(config: PlatformConfig, options: MdToOptions): Promise<ImportResult> {
    const jiraConfig = config as JiraPlatformConfig;
    const jiraOpts: JiraConfig = {
      jiraUrl: jiraConfig.jiraUrl,
      email: jiraConfig.email,
      apiToken: jiraConfig.apiToken,
      projectKey: jiraConfig.projectKey,
      statusMap: jiraConfig.statusMap,
      issueTypeId: jiraConfig.issueTypeId
    };
    
    const result = await mdToJira({
      jiraConfig: jiraOpts,
      inputDir: options.inputDir,
      dryRun: options.dryRun,
      logger: options.logger
    });
    
    return result;
  }
}
