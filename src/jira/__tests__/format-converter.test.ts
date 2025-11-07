import { describe, it } from 'mocha';
import * as assert from 'assert';
import { FormatConverter } from '../format-converter';

describe('FormatConverter', () => {
  let converter: FormatConverter;

  beforeEach(() => {
    converter = new FormatConverter();
  });

  describe('markdownToJira', () => {
    it('should convert markdown headers to jira format', () => {
      const markdown = '# Header 1\n## Header 2';
      const result = converter.markdownToJira(markdown);
      assert.ok(result.includes('h1.'));
    });

    it('should convert bold text', () => {
      const markdown = '**bold text**';
      const result = converter.markdownToJira(markdown);
      assert.ok(result.includes('*'));
    });

    it('should handle empty string', () => {
      const result = converter.markdownToJira('');
      assert.strictEqual(result, '');
    });
  });

  describe('jiraToMarkdown', () => {
    it('should convert jira headers to markdown', () => {
      const jira = 'h1. Header 1\nh2. Header 2';
      const result = converter.jiraToMarkdown(jira);
      assert.ok(result.includes('#'));
    });

    it('should handle empty string', () => {
      const result = converter.jiraToMarkdown('');
      assert.strictEqual(result, '');
    });
  });

  describe('markdownToADF', () => {
    it('should convert markdown to ADF structure', () => {
      const markdown = '# Header\n\nParagraph text';
      const result = converter.markdownToADF(markdown);
      assert.strictEqual(result.type, 'doc');
      assert.strictEqual(result.version, 1);
      assert.ok(Array.isArray(result.content));
    });

    it('should handle empty markdown', () => {
      const result = converter.markdownToADF('');
      assert.strictEqual(result.type, 'doc');
      assert.strictEqual(result.version, 1);
      assert.deepStrictEqual(result.content, []);
    });

    it('should convert headers', () => {
      const markdown = '# H1\n## H2\n### H3';
      const result = converter.markdownToADF(markdown);
      assert.ok(result.content.length > 0);
      assert.ok(result.content.some((node: any) => node.type === 'heading'));
    });

    it('should convert bullet lists', () => {
      const markdown = '* Item 1\n* Item 2';
      const result = converter.markdownToADF(markdown);
      const list = result.content.find((node: any) => node.type === 'bulletList');
      assert.ok(list);
    });

    it('should convert ordered lists', () => {
      const markdown = '1. Item 1\n2. Item 2';
      const result = converter.markdownToADF(markdown);
      assert.ok(result.content.length > 0);
    });

    it('should convert code blocks', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const result = converter.markdownToADF(markdown);
      assert.ok(result.content.length > 0);
    });

    it('should handle bold text', () => {
      const markdown = '**bold**';
      const result = converter.markdownToADF(markdown);
      assert.ok(result.content.length > 0);
    });

    it('should handle italic text', () => {
      const markdown = '*italic*';
      const result = converter.markdownToADF(markdown);
      assert.ok(result.content.length > 0);
    });

    it('should handle inline code', () => {
      const markdown = '`code`';
      const result = converter.markdownToADF(markdown);
      assert.ok(result.content.length > 0);
    });

    it('should handle links', () => {
      const markdown = '[text](http://example.com)';
      const result = converter.markdownToADF(markdown);
      assert.ok(result.content.length > 0);
    });
  });

  describe('adfToMarkdown', () => {
    it('should convert ADF to markdown', () => {
      const adf = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Hello world' }
            ]
          }
        ]
      };
      const result = converter.adfToMarkdown(adf);
      assert.ok(result.includes('Hello world'));
    });

    it('should handle null ADF', () => {
      const result = converter.adfToMarkdown(null);
      assert.strictEqual(result, '');
    });

    it('should handle ADF without content', () => {
      const adf = { type: 'doc', version: 1 };
      const result = converter.adfToMarkdown(adf);
      assert.strictEqual(result, '');
    });

    it('should convert heading nodes', () => {
      const adf = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Header' }]
          }
        ]
      };
      const result = converter.adfToMarkdown(adf);
      assert.ok(result.includes('Header'));
    });

    it('should convert bullet list nodes', () => {
      const adf = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Item' }]
                  }
                ]
              }
            ]
          }
        ]
      };
      const result = converter.adfToMarkdown(adf);
      assert.ok(result.length > 0);
    });

    it('should convert ordered list nodes', () => {
      const adf = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Item' }]
                  }
                ]
              }
            ]
          }
        ]
      };
      const result = converter.adfToMarkdown(adf);
      assert.ok(result.length > 0);
    });

    it('should convert code block nodes', () => {
      const adf = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'codeBlock',
            attrs: { language: 'javascript' },
            content: [{ type: 'text', text: 'const x = 1;' }]
          }
        ]
      };
      const result = converter.adfToMarkdown(adf);
      assert.ok(result.length > 0);
    });

    it('should handle text with marks', () => {
      const adf = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'bold',
                marks: [{ type: 'strong' }]
              }
            ]
          }
        ]
      };
      const result = converter.adfToMarkdown(adf);
      assert.ok(result.length > 0);
    });

    it('should handle italic marks', () => {
      const adf = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'italic',
                marks: [{ type: 'em' }]
              }
            ]
          }
        ]
      };
      const result = converter.adfToMarkdown(adf);
      assert.ok(result.length > 0);
    });

    it('should handle code marks', () => {
      const adf = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'code',
                marks: [{ type: 'code' }]
              }
            ]
          }
        ]
      };
      const result = converter.adfToMarkdown(adf);
      assert.ok(result.length > 0);
    });

    it('should handle link marks', () => {
      const adf = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'link',
                marks: [{ type: 'link', attrs: { href: 'http://example.com' } }]
              }
            ]
          }
        ]
      };
      const result = converter.adfToMarkdown(adf);
      assert.ok(result.length > 0);
    });
  });

  describe('markdownToHtml', () => {
    it('should convert markdown to HTML', () => {
      const markdown = '# Header';
      const result = converter.markdownToHtml(markdown);
      assert.ok(result.length > 0);
    });
  });

  describe('jiraToHtml', () => {
    it('should convert jira to HTML', () => {
      const jira = 'h1. Header';
      const result = converter.jiraToHtml(jira);
      assert.ok(result.length > 0);
    });
  });
});
