export type PlatformType = 'jira';

export interface PlatformConfig {
  platform: PlatformType;
  [key: string]: any;
}

export interface JiraPlatformConfig extends PlatformConfig {
  platform: 'jira';
  jiraUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  statusMap?: Record<string, string>;
  issueTypeId?: string;
}

export interface ToMdOptions {
  outputDir: string;
  dryRun?: boolean;
  logger?: any;
  jql?: string;
}

export interface MdToOptions {
  inputDir: string;
  dryRun?: boolean;
  logger?: any;
}

export interface SyncResult {
  written: number;
  files: { file: string; storyId: string; title: string; status: string }[];
  totalItems: number;
}

export interface ImportResult {
  processedFiles: number;
  created: number;
  skipped: number;
  errors: string[];
}
