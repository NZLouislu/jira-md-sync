import { expect } from 'chai';
import { mdToJira } from '../md-to-jira';
import type { JiraConfig } from '../types';

describe('mdToJira', () => {
  const mockConfig: JiraConfig = {
    jiraUrl: 'https://test.atlassian.net',
    email: 'test@example.com',
    apiToken: 'test-token',
    projectKey: 'TEST'
  };

  const mockLogger = {
    info: () => { },
    debug: () => { },
    warn: () => { },
    error: () => { }
  };

  it('should throw error for invalid config', async () => {
    const invalidConfig = { ...mockConfig, jiraUrl: '' };

    try {
      await mdToJira({
        jiraConfig: invalidConfig,
        inputDir: 'test',
        logger: mockLogger
      });
      throw new Error('Should have thrown');
    } catch (error) {
      expect((error as Error).message).to.include('Invalid Jira configuration');
    }
  });

  it('should throw error for empty input directory', async () => {
    try {
      await mdToJira({
        jiraConfig: mockConfig,
        inputDir: '',
        logger: mockLogger
      });
      throw new Error('Should have thrown');
    } catch (error) {
      expect((error as Error).message).to.include('Input directory is required');
    }
  });

  it('should throw error for non-existent directory', async () => {
    try {
      await mdToJira({
        jiraConfig: mockConfig,
        inputDir: '/non/existent/path',
        logger: mockLogger
      });
      throw new Error('Should have thrown');
    } catch (error) {
      expect((error as Error).message).to.include('Input directory does not exist');
    }
  });
});
