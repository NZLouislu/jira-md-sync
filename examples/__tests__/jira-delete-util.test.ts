import { expect } from 'chai';
import { JiraDeleteUtil } from '../utils/jira-delete-util';

describe('JiraDeleteUtil', () => {
  const mockConfig = {
    jiraUrl: 'https://test.atlassian.net',
    email: 'test@example.com',
    apiToken: 'test-token'
  };

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      const util = new JiraDeleteUtil(mockConfig);
      expect(util).to.be.instanceOf(JiraDeleteUtil);
    });

    it('should generate auth header correctly', () => {
      const util = new JiraDeleteUtil(mockConfig);
      expect(util).to.have.property('authHeader');
    });
  });

  describe('deleteIssue', () => {
    it('should handle successful deletion', async () => {
      const util = new JiraDeleteUtil(mockConfig);
      
      global.fetch = async () => ({
        status: 204,
        ok: true,
        text: async () => '',
        json: async () => ({})
      } as Response);

      const result = await util.deleteIssue('TEST-1');
      expect(result.success).to.be.true;
      expect(result.issueKey).to.equal('TEST-1');
    });

    it('should handle 404 not found', async () => {
      const util = new JiraDeleteUtil(mockConfig);
      
      global.fetch = async () => ({
        status: 404,
        ok: false,
        text: async () => 'Not found',
        json: async () => ({})
      } as Response);

      const result = await util.deleteIssue('TEST-1');
      expect(result.success).to.be.false;
      expect(result.statusCode).to.equal(404);
      expect(result.error).to.include('not found');
    });

    it('should handle 403 forbidden', async () => {
      const util = new JiraDeleteUtil(mockConfig);
      
      global.fetch = async () => ({
        status: 403,
        ok: false,
        text: async () => 'Forbidden',
        json: async () => ({})
      } as Response);

      const result = await util.deleteIssue('TEST-1');
      expect(result.success).to.be.false;
      expect(result.statusCode).to.equal(403);
      expect(result.error).to.include('Permission denied');
    });

    it('should retry on transient failures', async () => {
      const util = new JiraDeleteUtil(mockConfig);
      let attempts = 0;
      
      global.fetch = async () => {
        attempts++;
        if (attempts < 2) {
          return {
            status: 500,
            ok: false,
            text: async () => 'Server error',
            json: async () => ({})
          } as Response;
        }
        return {
          status: 204,
          ok: true,
          text: async () => '',
          json: async () => ({})
        } as Response;
      };

      const result = await util.deleteIssue('TEST-1');
      expect(result.success).to.be.true;
      expect(attempts).to.be.greaterThan(1);
    });
  });
});
