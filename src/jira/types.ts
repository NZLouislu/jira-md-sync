export interface JiraConfig {
  jiraUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  statusMap?: Record<string, string>;
  issueTypeId?: string;
  customFieldMappings?: Record<string, string>;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: any;
    status: {
      id: string;
      name: string;
      statusCategory: {
        key: string;
        name: string;
      };
    };
    issuetype: {
      id: string;
      name: string;
    };
    project: {
      id: string;
      key: string;
      name: string;
    };
    assignee?: {
      accountId: string;
      displayName: string;
      emailAddress: string;
    };
    reporter?: {
      accountId: string;
      displayName: string;
      emailAddress: string;
    };
    labels: string[];
    subtasks?: JiraSubtask[];
    priority?: {
      id: string;
      name: string;
    };
    created: string;
    updated: string;
    [key: string]: any;
  };
}

export interface JiraSubtask {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      id: string;
      name: string;
    };
  };
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  description?: string;
  lead?: {
    accountId: string;
    displayName: string;
  };
  issueTypes: JiraIssueType[];
}

export interface JiraIssueType {
  id: string;
  name: string;
  description: string;
  subtask: boolean;
}

export interface JiraTransition {
  id: string;
  name: string;
  to: {
    id: string;
    name: string;
  };
}

export interface JiraStory {
  storyId: string;
  title: string;
  status: string;
  body: string;
  todos: JiraTodo[];
  assignees: string[];
  reporter?: string;
  labels: string[];
  meta: Record<string, any>;
}

export interface JiraTodo {
  text: string;
  done: boolean;
  assignee?: string;
  due?: string;
}

export interface JiraSearchResult {
  expand?: string;
  startAt?: number;
  maxResults?: number;
  total?: number;
  issues: JiraIssue[];
  // Jira Cloud API v3 pagination
  nextPageToken?: string;
  isLast?: boolean;
}

export interface JiraCreateIssuePayload {
  fields: {
    project: {
      key: string;
    };
    summary: string;
    description?: any;
    issuetype: {
      id: string;
    };
    labels?: string[];
    assignee?: {
      accountId: string;
    };
    [key: string]: any;
  };
}

export interface JiraUpdateIssuePayload {
  fields?: {
    summary?: string;
    description?: any;
    labels?: string[];
    assignee?: {
      accountId: string;
    } | null;
    [key: string]: any;
  };
}

export interface JiraToMdOptions {
  jiraConfig: JiraConfig;
  outputDir?: string; // Optional: defaults to 'jira' in project root
  inputDir?: string; // Optional: directory with original markdown files to preserve labels order
  jql?: string;
  dryRun?: boolean;
  logger?: any;
}

export interface MdToJiraOptions {
  jiraConfig: JiraConfig;
  inputDir?: string; // Optional: defaults to 'jiramd' in project root
  dryRun?: boolean;
  logger?: any;
}
