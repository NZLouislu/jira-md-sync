import { strict as assert } from 'assert';
import { renderSingleStoryMarkdown, preferredStoryFileName } from '../renderer';
import type { JiraStory } from '../types';

describe('Renderer', () => {
  const mockStory: JiraStory = {
    storyId: 'PROJ-123',
    title: 'Test Story',
    status: 'In Progress',
    body: 'This is a test description',
    todos: [
      { text: 'First task', done: true },
      { text: 'Second task', done: false }
    ],
    assignees: ['john', 'jane'],
    labels: ['bug', 'feature'],
    meta: { priority: 'High' }
  };

  describe('renderSingleStoryMarkdown', () => {
    it('should render complete story markdown', () => {
      const md = renderSingleStoryMarkdown(mockStory);
      
      assert.ok(md.includes('## Story: PROJ-123 Test Story'));
      assert.ok(md.includes('### Story ID'));
      assert.ok(md.includes('PROJ-123'));
      assert.ok(md.includes('### Status'));
      assert.ok(md.includes('In Progress'));
      assert.ok(md.includes('### Description'));
      assert.ok(md.includes('This is a test description'));
      assert.ok(md.includes('### Acceptance Criteria'));
      assert.ok(md.includes('- [x] First task'));
      assert.ok(md.includes('- [ ] Second task'));
      assert.ok(md.includes('### Priority'));
      assert.ok(md.includes('High'));
      assert.ok(md.includes('### Labels'));
      assert.ok(md.includes('bug, feature'));
      assert.ok(md.includes('### Assignees'));
      assert.ok(md.includes('john, jane'));
    });

    it('should handle story without optional fields', () => {
      const minimalStory: JiraStory = {
        storyId: 'PROJ-456',
        title: 'Minimal Story',
        status: 'Backlog',
        body: '',
        todos: [],
        assignees: [],
        labels: [],
        meta: {}
      };

      const md = renderSingleStoryMarkdown(minimalStory);
      
      assert.ok(md.includes('## Story: PROJ-456 Minimal Story'));
      assert.ok(md.includes('### Status'));
      assert.ok(md.includes('Backlog'));
      assert.ok(!md.includes('### Priority'));
    });
  });

  describe('preferredStoryFileName', () => {
    it('should return filename for story', () => {
      const fileName = preferredStoryFileName(mockStory);
      assert.strictEqual(fileName, 'PROJ-123-test-story.md');
    });
  });
});
