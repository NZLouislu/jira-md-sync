import { strict as assert } from 'assert';
import { normalizeJiraStatus, mapMarkdownStatusToJira, getStatusCategory } from '../status-normalizer';

describe('Status Normalizer', () => {
  describe('normalizeJiraStatus', () => {
    it('should normalize "To Do" to "Backlog"', () => {
      assert.strictEqual(normalizeJiraStatus('To Do'), 'Backlog');
    });

    it('should normalize "In Progress" to "In Progress"', () => {
      assert.strictEqual(normalizeJiraStatus('In Progress'), 'In Progress');
    });

    it('should normalize "Done" to "Done"', () => {
      assert.strictEqual(normalizeJiraStatus('Done'), 'Done');
    });

    it('should use custom map when provided', () => {
      const customMap = { 'custom': 'Custom Status' };
      assert.strictEqual(normalizeJiraStatus('custom', customMap), 'Custom Status');
    });

    it('should return original value for unknown status', () => {
      assert.strictEqual(normalizeJiraStatus('Unknown Status'), 'Unknown Status');
    });
  });

  describe('mapMarkdownStatusToJira', () => {
    it('should map "Backlog" to "To Do"', () => {
      assert.strictEqual(mapMarkdownStatusToJira('Backlog'), 'To Do');
    });

    it('should map "In Progress" to "In Progress"', () => {
      assert.strictEqual(mapMarkdownStatusToJira('In Progress'), 'In Progress');
    });

    it('should return original for unknown status', () => {
      assert.strictEqual(mapMarkdownStatusToJira('Unknown'), 'Unknown');
    });
  });

  describe('getStatusCategory', () => {
    it('should return "todo" for Backlog', () => {
      assert.strictEqual(getStatusCategory('Backlog'), 'todo');
    });

    it('should return "indeterminate" for In Progress', () => {
      assert.strictEqual(getStatusCategory('In Progress'), 'indeterminate');
    });

    it('should return "done" for Done', () => {
      assert.strictEqual(getStatusCategory('Done'), 'done');
    });
  });
});
