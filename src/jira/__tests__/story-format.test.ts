import { strict as assert } from 'assert';
import { formatStoryName, parseFormattedStoryName, storyFileName } from '../story-format';
import type { JiraStory } from '../types';

describe('Story Format', () => {
  describe('formatStoryName', () => {
    it('should format with key and title', () => {
      assert.strictEqual(formatStoryName('PROJ-123', 'Test Story'), 'PROJ-123 Test Story');
    });

    it('should handle only key', () => {
      assert.strictEqual(formatStoryName('PROJ-123', ''), 'PROJ-123');
    });

    it('should handle only title', () => {
      assert.strictEqual(formatStoryName('', 'Test Story'), 'Test Story');
    });
  });

  describe('parseFormattedStoryName', () => {
    it('should parse Jira key format', () => {
      const result = parseFormattedStoryName('PROJ-123 Test Story');
      assert.strictEqual(result.storyId, 'PROJ-123');
      assert.strictEqual(result.title, 'Test Story');
    });

    it('should parse STORY format', () => {
      const result = parseFormattedStoryName('STORY-123 Test Story');
      assert.strictEqual(result.storyId, 'STORY-123');
      assert.strictEqual(result.title, 'Test Story');
    });

    it('should handle plain title', () => {
      const result = parseFormattedStoryName('Just a title');
      assert.strictEqual(result.storyId, '');
      assert.strictEqual(result.title, 'Just a title');
    });
  });

  describe('storyFileName', () => {
    it('should generate filename with key and title', () => {
      const story: JiraStory = {
        storyId: 'PROJ-123',
        title: 'Test Story',
        status: 'Backlog',
        body: '',
        todos: [],
        assignees: [],
        labels: [],
        meta: {}
      };
      assert.strictEqual(storyFileName(story), 'PROJ-123-test-story.md');
    });

    it('should handle special characters', () => {
      const story: JiraStory = {
        storyId: 'PROJ-123',
        title: 'Test: Story / With Special',
        status: 'Backlog',
        body: '',
        todos: [],
        assignees: [],
        labels: [],
        meta: {}
      };
      assert.strictEqual(storyFileName(story), 'PROJ-123-test-story-with-special.md');
    });
  });
});
