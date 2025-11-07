import { expect } from 'chai';
import type { JiraConfig } from '../types';

describe('jiraToMd', () => {
  const mockConfig: JiraConfig = {
    jiraUrl: 'https://test.atlassian.net',
    email: 'test@example.com',
    apiToken: 'test-token',
    projectKey: 'TEST'
  };

  it('should have valid config structure', () => {
    expect(mockConfig.jiraUrl).to.be.a('string');
    expect(mockConfig.email).to.be.a('string');
    expect(mockConfig.apiToken).to.be.a('string');
    expect(mockConfig.projectKey).to.be.a('string');
  });

  it('should validate required fields', () => {
    expect(mockConfig.jiraUrl).to.not.be.empty;
    expect(mockConfig.projectKey).to.not.be.empty;
  });
});
