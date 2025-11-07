import { strict as assert } from 'assert';
import { JiraProvider } from '../provider';
import type { JiraConfig } from '../types';

describe('JiraProvider', () => {
  const mockConfig: JiraConfig = {
    jiraUrl: 'https://test.atlassian.net',
    email: 'test@example.com',
    apiToken: 'test-token',
    projectKey: 'TEST'
  };

  it('should create instance with config', () => {
    const provider = new JiraProvider({ config: mockConfig });
    assert.ok(provider);
  });

  it('should clear cache', () => {
    const provider = new JiraProvider({ config: mockConfig });
    provider.clearCache();
    assert.ok(provider);
  });
});
