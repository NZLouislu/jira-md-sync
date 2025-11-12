interface JiraConfig {
  jiraUrl: string;
  email: string;
  apiToken: string;
}

interface DeleteResult {
  success: boolean;
  issueKey: string;
  statusCode?: number;
  error?: string;
}

export class JiraDeleteUtil {
  private authHeader: string;
  private jiraUrl: string;

  constructor(config: JiraConfig) {
    this.jiraUrl = config.jiraUrl;
    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');
    this.authHeader = `Basic ${auth}`;
  }

  async deleteIssue(issueKey: string, maxRetries: number = 3): Promise<DeleteResult> {
    let lastError: string = '';
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.jiraUrl}/rest/api/3/issue/${issueKey}`, {
          method: 'DELETE',
          headers: {
            'Authorization': this.authHeader,
            'Accept': 'application/json'
          }
        });

        if (response.status === 204) {
          console.log(`  ✓ Deleted: ${issueKey}`);
          return {
            success: true,
            issueKey,
            statusCode: 204
          };
        }

        if (response.status === 404) {
          return {
            success: false,
            issueKey,
            statusCode: 404,
            error: `Issue ${issueKey} not found`
          };
        }

        if (response.status === 403) {
          return {
            success: false,
            issueKey,
            statusCode: 403,
            error: `Permission denied: Cannot delete ${issueKey}`
          };
        }

        // For 5xx errors, retry
        if (response.status >= 500 && attempt < maxRetries) {
          const errorText = await response.text();
          lastError = `Server error (${response.status}): ${errorText}`;
          console.log(`  Retry ${attempt}/${maxRetries} for ${issueKey}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        const errorText = await response.text();
        return {
          success: false,
          issueKey,
          statusCode: response.status,
          error: `Failed to delete ${issueKey}: ${errorText}`
        };
      } catch (error) {
        lastError = (error as Error).message;
        if (attempt < maxRetries) {
          console.log(`  Retry ${attempt}/${maxRetries} for ${issueKey}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }
    }

    return {
      success: false,
      issueKey,
      error: `Failed after ${maxRetries} attempts: ${lastError}`
    };
  }
}
