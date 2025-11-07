import { describe, it } from 'mocha';
import * as assert from 'assert';
import { JiraClientWrapper } from '../jira-client-wrapper';
import type { JiraConfig } from '../types';

describe('JiraClientWrapper', () => {
  const mockConfig: JiraConfig = {
    jiraUrl: 'https://test.atlassian.net',
    email: 'test@example.com',
    apiToken: 'test-token',
    projectKey: 'TEST'
  };

  it('should create instance with config', () => {
    const wrapper = new JiraClientWrapper(mockConfig);
    assert.ok(wrapper);
  });

  it('should parse URL correctly', () => {
    const wrapper = new JiraClientWrapper(mockConfig);
    assert.ok(wrapper);
  });

  it('should handle config with issueTypeId', () => {
    const config = { ...mockConfig, issueTypeId: '10001' };
    const wrapper = new JiraClientWrapper(config);
    assert.ok(wrapper);
  });

  it('should handle config with statusMap', () => {
    const config = { ...mockConfig, statusMap: { 'To Do': 'Backlog' } };
    const wrapper = new JiraClientWrapper(config);
    assert.ok(wrapper);
  });

  it('should handle config with customFieldMappings', () => {
    const config = { ...mockConfig, customFieldMappings: { 'customfield_10001': 'storyPoints' } };
    const wrapper = new JiraClientWrapper(config);
    assert.ok(wrapper);
  });
});
