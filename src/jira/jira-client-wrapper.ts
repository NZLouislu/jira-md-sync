import JiraApi from 'jira-client';
import type { JiraConfig, JiraSearchResult, JiraCreateIssuePayload, JiraUpdateIssuePayload, JiraTransition } from './types';

export class JiraClientWrapper {
  private client: JiraApi;
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.config = config;
    
    const url = new URL(config.jiraUrl);
    
    this.client = new JiraApi({
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      host: url.host,
      username: config.email,
      password: config.apiToken,
      apiVersion: '3',
      strictSSL: true
    });
  }

  async getProject(projectKey?: string): Promise<any> {
    const key = projectKey || this.config.projectKey;
    return this.client.getProject(key);
  }

  async searchIssues(jql: string, startAt: number = 0, maxResults: number = 50): Promise<JiraSearchResult> {
    return this.client.searchJira(jql, {
      startAt,
      maxResults,
      fields: [
        'summary',
        'description',
        'status',
        'assignee',
        'labels',
        'priority',
        'issuetype',
        'created',
        'updated',
        'subtasks'
      ]
    }) as Promise<JiraSearchResult>;
  }

  async createIssue(payload: JiraCreateIssuePayload): Promise<any> {
    return this.client.addNewIssue(payload);
  }

  async updateIssue(issueKey: string, payload: JiraUpdateIssuePayload): Promise<any> {
    return this.client.updateIssue(issueKey, payload);
  }

  async getTransitions(issueKey: string): Promise<{ transitions: JiraTransition[] }> {
    return this.client.listTransitions(issueKey) as Promise<{ transitions: JiraTransition[] }>;
  }

  async transitionIssue(issueKey: string, transition: { transition: { id: string } }): Promise<void> {
    await this.client.transitionIssue(issueKey, transition);
  }

  async findTransitionByName(issueKey: string, statusName: string): Promise<JiraTransition | undefined> {
    const result = await this.getTransitions(issueKey);
    return result.transitions.find((t: JiraTransition) => 
      t.name.toLowerCase() === statusName.toLowerCase() ||
      t.to.name.toLowerCase() === statusName.toLowerCase()
    );
  }
}
