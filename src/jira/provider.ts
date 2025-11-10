import type {
  JiraConfig,
  JiraIssue,
  JiraProject,
  JiraSearchResult,
  JiraTransition,
  JiraCreateIssuePayload,
  JiraUpdateIssuePayload
} from "./types";

type RetryOpts = { retries?: number; baseMs?: number; factor?: number };
type ProviderLogger = { debug?: (...args: any[]) => void; warn?: (...args: any[]) => void; info?: (...args: any[]) => void };
type CacheEntry<T> = { value: T; createdAt: number };

export class JiraProvider {
  private config: JiraConfig;
  private logger: ProviderLogger;
  private projectCache?: CacheEntry<JiraProject>;
  private issueCache: Map<string, CacheEntry<JiraIssue>>;
  private authHeader: string;

  constructor(params: { config: JiraConfig; logger?: ProviderLogger }) {
    this.config = params.config;
    this.logger = params.logger || {};
    this.issueCache = new Map();
    const credentials = Buffer.from(`${this.config.email}:${this.config.apiToken}`).toString('base64');
    this.authHeader = `Basic ${credentials}`;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async request(path: string, init?: RequestInit, retry: RetryOpts = {}): Promise<any> {
    const max = retry.retries ?? 4;
    const baseMs = retry.baseMs ?? 300;
    const factor = retry.factor ?? 2;
    let attempt = 0;
    let lastErr: any;

    const url = `${this.config.jiraUrl}/rest/api/3${path}`;
    const headers = {
      'Authorization': this.authHeader,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    };

    while (attempt <= max) {
      try {
        const res = await fetch(url, { ...init, headers });

        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
          lastErr = new Error(`HTTP ${res.status}`);
          const delay = baseMs * Math.pow(factor, attempt);
          this.logger.warn?.("jira.retry", { attempt, path, status: res.status, delay });
          await this.sleep(delay);
          attempt++;
          continue;
        }

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }

        if (res.status === 204) {
          return null;
        }

        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          return res.json();
        }
        return res.text();
      } catch (err) {
        if (attempt >= max) throw err;
        lastErr = err;
        const delay = baseMs * Math.pow(factor, attempt);
        this.logger.warn?.("jira.request.error", { attempt, path, error: (err as any)?.message, delay });
        await this.sleep(delay);
        attempt++;
      }
    }
    throw lastErr;
  }

  async getProject(projectKey?: string): Promise<JiraProject> {
    const key = projectKey || this.config.projectKey;
    const now = Date.now();

    if (this.projectCache && now - this.projectCache.createdAt < 300_000) {
      return this.projectCache.value;
    }

    const value = await this.request(`/project/${key}`, { method: "GET" });
    this.projectCache = { value, createdAt: now };
    return value;
  }

  async searchIssues(jql: string, _startAt: number = 0, maxResults: number = 50, nextPageToken?: string): Promise<JiraSearchResult> {
    const fields = [
      'summary',
      'description',
      'status',
      'issuetype',
      'project',
      'assignee',
      'reporter',
      'labels',
      'subtasks',
      'priority',
      'created',
      'updated'
    ];

    const params: Record<string, string> = {
      jql,
      maxResults: maxResults.toString(),
      fields: fields.join(',')
    };

    // Use nextPageToken for pagination if provided (Jira Cloud API v3)
    if (nextPageToken) {
      params.nextPageToken = nextPageToken;
    }

    const queryString = new URLSearchParams(params).toString();

    return this.request(`/search/jql?${queryString}`, {
      method: 'GET'
    });
  }

  async getIssue(issueKey: string, useCache: boolean = true): Promise<JiraIssue> {
    const now = Date.now();

    if (useCache && this.issueCache.has(issueKey)) {
      const cached = this.issueCache.get(issueKey)!;
      if (now - cached.createdAt < 60_000) {
        return cached.value;
      }
    }

    const value = await this.request(`/issue/${issueKey}`, { method: "GET" });
    this.issueCache.set(issueKey, { value, createdAt: now });
    return value;
  }

  async createIssue(payload: JiraCreateIssuePayload): Promise<JiraIssue> {
    const body = JSON.stringify(payload);
    const result = await this.request('/issue', {
      method: 'POST',
      body
    });

    if (result.key) {
      return this.getIssue(result.key, false);
    }

    throw new Error('Failed to create issue: no key returned');
  }

  async updateIssue(issueKey: string, payload: JiraUpdateIssuePayload): Promise<void> {
    const body = JSON.stringify(payload);
    await this.request(`/issue/${issueKey}`, {
      method: 'PUT',
      body
    });

    this.issueCache.delete(issueKey);
  }

  async getTransitions(issueKey: string): Promise<JiraTransition[]> {
    const result = await this.request(`/issue/${issueKey}/transitions`, { method: 'GET' });
    return result.transitions || [];
  }

  async transitionIssue(issueKey: string, transitionId: string): Promise<void> {
    const body = JSON.stringify({
      transition: { id: transitionId }
    });

    await this.request(`/issue/${issueKey}/transitions`, {
      method: 'POST',
      body
    });

    this.issueCache.delete(issueKey);
  }

  async findTransitionByName(issueKey: string, targetStatusName: string): Promise<JiraTransition | undefined> {
    const transitions = await this.getTransitions(issueKey);
    return transitions.find(t =>
      t.to.name.toLowerCase() === targetStatusName.toLowerCase() ||
      t.name.toLowerCase() === targetStatusName.toLowerCase()
    );
  }

  clearCache(): void {
    this.projectCache = undefined;
    this.issueCache.clear();
  }
}
