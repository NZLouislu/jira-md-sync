import { strict as assert } from 'assert';
import { validateJiraConfig } from '../config-validator';

describe('Jira Config Validator', () => {
  it('should validate valid Jira config', () => {
    const result = validateJiraConfig({
      jiraUrl: 'https://test.atlassian.net',
      email: 'test@example.com',
      apiToken: 'test-token',
      projectKey: 'PROJ'
    });

    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  it('should reject missing jiraUrl', () => {
    const result = validateJiraConfig({
      email: 'test@example.com',
      apiToken: 'test-token',
      projectKey: 'PROJ'
    });

    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.field === 'jiraUrl'));
  });

  it('should reject invalid jiraUrl format', () => {
    const result = validateJiraConfig({
      jiraUrl: 'invalid-url',
      email: 'test@example.com',
      apiToken: 'test-token',
      projectKey: 'PROJ'
    });

    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.field === 'jiraUrl' && e.code === 'INVALID_FORMAT'));
  });

  it('should reject missing email', () => {
    const result = validateJiraConfig({
      jiraUrl: 'https://test.atlassian.net',
      apiToken: 'test-token',
      projectKey: 'PROJ'
    });

    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.field === 'email'));
  });

  it('should reject invalid email format', () => {
    const result = validateJiraConfig({
      jiraUrl: 'https://test.atlassian.net',
      email: 'invalid-email',
      apiToken: 'test-token',
      projectKey: 'PROJ'
    });

    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.field === 'email' && e.code === 'INVALID_FORMAT'));
  });

  it('should reject missing apiToken', () => {
    const result = validateJiraConfig({
      jiraUrl: 'https://test.atlassian.net',
      email: 'test@example.com',
      projectKey: 'PROJ'
    });

    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.field === 'apiToken'));
  });

  it('should reject missing projectKey', () => {
    const result = validateJiraConfig({
      jiraUrl: 'https://test.atlassian.net',
      email: 'test@example.com',
      apiToken: 'test-token'
    });

    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.field === 'projectKey'));
  });

  it('should reject invalid projectKey format', () => {
    const result = validateJiraConfig({
      jiraUrl: 'https://test.atlassian.net',
      email: 'test@example.com',
      apiToken: 'test-token',
      projectKey: 'invalid-key'
    });

    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.field === 'projectKey' && e.code === 'INVALID_FORMAT'));
  });

  it('should not include security warning for apiToken when using env vars', () => {
    const result = validateJiraConfig({
      jiraUrl: 'https://test.atlassian.net',
      email: 'test@example.com',
      apiToken: 'test-token',
      projectKey: 'PROJ'
    });

    assert.ok(!result.warnings.some(w => w.field === 'apiToken'));
  });
});
