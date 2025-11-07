export interface ValidationError {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface JiraConfigInput {
  jiraUrl?: string;
  email?: string;
  apiToken?: string;
  projectKey?: string;
  [key: string]: any;
}

const JIRA_API_DOCS = "https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/";

export function validateJiraConfig(config: JiraConfigInput): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (config.jiraUrl === undefined || config.jiraUrl === null) {
    errors.push({
      field: 'jiraUrl',
      message: 'Jira URL is required',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Provide your Jira instance URL (e.g., https://your-domain.atlassian.net)'
    });
  } else if (typeof config.jiraUrl !== 'string') {
    errors.push({
      field: 'jiraUrl',
      message: 'Jira URL must be a string',
      code: 'INVALID_TYPE',
      suggestion: 'Ensure the URL is provided as a string value'
    });
  } else if (!config.jiraUrl.trim()) {
    errors.push({
      field: 'jiraUrl',
      message: 'Jira URL cannot be empty',
      code: 'EMPTY_VALUE',
      suggestion: 'Provide your Jira instance URL (e.g., https://your-domain.atlassian.net)'
    });
  } else {
    const url = config.jiraUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      errors.push({
        field: 'jiraUrl',
        message: 'Jira URL must start with http:// or https://',
        code: 'INVALID_FORMAT',
        suggestion: 'Use a valid URL format (e.g., https://your-domain.atlassian.net)'
      });
    }
  }

  if (config.email === undefined || config.email === null) {
    errors.push({
      field: 'email',
      message: 'Email is required for Jira authentication',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Provide the email address associated with your Jira account'
    });
  } else if (typeof config.email !== 'string') {
    errors.push({
      field: 'email',
      message: 'Email must be a string',
      code: 'INVALID_TYPE',
      suggestion: 'Ensure the email is provided as a string value'
    });
  } else if (!config.email.trim()) {
    errors.push({
      field: 'email',
      message: 'Email cannot be empty',
      code: 'EMPTY_VALUE',
      suggestion: 'Provide the email address associated with your Jira account'
    });
  } else if (!config.email.includes('@')) {
    errors.push({
      field: 'email',
      message: 'Email format appears invalid',
      code: 'INVALID_FORMAT',
      suggestion: 'Provide a valid email address (e.g., user@example.com)'
    });
  }

  if (config.apiToken === undefined || config.apiToken === null) {
    errors.push({
      field: 'apiToken',
      message: 'API token is required for Jira authentication',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: `Generate an API token from ${JIRA_API_DOCS}`
    });
  } else if (typeof config.apiToken !== 'string') {
    errors.push({
      field: 'apiToken',
      message: 'API token must be a string',
      code: 'INVALID_TYPE',
      suggestion: 'Ensure the API token is provided as a string value'
    });
  } else if (!config.apiToken.trim()) {
    errors.push({
      field: 'apiToken',
      message: 'API token cannot be empty',
      code: 'EMPTY_VALUE',
      suggestion: `Generate an API token from ${JIRA_API_DOCS}`
    });
  }

  if (config.projectKey === undefined || config.projectKey === null) {
    errors.push({
      field: 'projectKey',
      message: 'Project key is required',
      code: 'MISSING_REQUIRED_FIELD',
      suggestion: 'Provide your Jira project key (e.g., PROJ, DEV, etc.)'
    });
  } else if (typeof config.projectKey !== 'string') {
    errors.push({
      field: 'projectKey',
      message: 'Project key must be a string',
      code: 'INVALID_TYPE',
      suggestion: 'Ensure the project key is provided as a string value'
    });
  } else if (!config.projectKey.trim()) {
    errors.push({
      field: 'projectKey',
      message: 'Project key cannot be empty',
      code: 'EMPTY_VALUE',
      suggestion: 'Provide your Jira project key (e.g., PROJ, DEV, etc.)'
    });
  } else if (!/^[A-Z][A-Z0-9]*$/.test(config.projectKey.trim())) {
    errors.push({
      field: 'projectKey',
      message: 'Project key format appears invalid',
      code: 'INVALID_FORMAT',
      suggestion: 'Project keys must start with a letter and contain only uppercase letters and numbers'
    });
  }



  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}