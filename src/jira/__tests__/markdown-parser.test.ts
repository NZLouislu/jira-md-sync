import { expect } from 'chai';
import { parseMarkdownToStories } from '../markdown-parser';

describe('parseMarkdownToStories', () => {
  it('should parse story with assignees and reporter', () => {
    const markdown = `
## Story: Test Story

### Status
To Do

### Description
Test description

### Assignees
John Doe

### Reporter
Jane Smith

### Labels
test, feature
`;

    const stories = parseMarkdownToStories(markdown);

    expect(stories).to.have.lengthOf(1);
    expect(stories[0].title).to.equal('Test Story');
    expect(stories[0].assignees).to.deep.equal(['John Doe']);
    expect(stories[0].reporter).to.equal('Jane Smith');
    expect(stories[0].labels).to.deep.equal(['test', 'feature']);
  });

  it('should parse story with acceptance criteria', () => {
    const markdown = `
## Story: Feature Story

### Status
In Progress

### Description
Feature description

### Acceptance Criteria
- [ ] Task 1
- [x] Task 2
- [ ] Task 3
`;

    const stories = parseMarkdownToStories(markdown);

    expect(stories).to.have.lengthOf(1);
    expect(stories[0].todos).to.have.lengthOf(3);
    expect(stories[0].todos[0].done).to.equal(false);
    expect(stories[0].todos[1].done).to.equal(true);
    expect(stories[0].todos[2].done).to.equal(false);
  });

  it('should parse story with Jira ID', () => {
    const markdown = `
## Story: JMS-123 Test Story with ID

### Description
Test description
`;

    const stories = parseMarkdownToStories(markdown);

    expect(stories).to.have.lengthOf(1);
    expect(stories[0].storyId).to.equal('JMS-123');
    expect(stories[0].title).to.equal('Test Story with ID');
  });

  it('should handle empty markdown', () => {
    const stories = parseMarkdownToStories('');
    expect(stories).to.have.lengthOf(0);
  });

  it('should handle multiple stories', () => {
    const markdown = `
## Story: First Story

### Description
First description

## Story: Second Story

### Description
Second description
`;

    const stories = parseMarkdownToStories(markdown);
    expect(stories).to.have.lengthOf(2);
    expect(stories[0].title).to.equal('First Story');
    expect(stories[1].title).to.equal('Second Story');
  });

  it('should parse priority correctly', () => {
    const markdown = `
## Story: Priority Test

### Description
Test

### Priority
High
`;

    const stories = parseMarkdownToStories(markdown);
    expect(stories[0].meta.priority).to.equal('High');
  });

  it('should handle CSV assignees', () => {
    const markdown = `
## Story: Multiple Assignees

### Description
Test

### Assignees
John Doe, Jane Smith, Bob Johnson
`;

    const stories = parseMarkdownToStories(markdown);
    expect(stories[0].assignees).to.deep.equal(['John Doe', 'Jane Smith', 'Bob Johnson']);
  });
});
