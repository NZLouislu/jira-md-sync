import { expect } from 'chai';
import {
  compareMarkdown,
  normalizeWhitespace,
  extractFormatElements,
  findDifferences,
  calculateSimilarity,
  highlightDifferences,
  createDifferenceReport,
  filterDifferences
} from '../utils/format-compare';

describe('Format Compare Utilities', () => {
  describe('normalizeWhitespace', () => {
    it('should normalize line endings', () => {
      const text = 'line1\r\nline2\r\nline3';
      const result = normalizeWhitespace(text);
      expect(result).to.equal('line1\nline2\nline3');
    });

    it('should convert tabs to spaces', () => {
      const text = 'line1\tline2';
      const result = normalizeWhitespace(text);
      expect(result).to.equal('line1  line2');
    });

    it('should remove trailing spaces', () => {
      const text = 'line1   \nline2   ';
      const result = normalizeWhitespace(text);
      expect(result).to.equal('line1\nline2');
    });

    it('should collapse multiple blank lines', () => {
      const text = 'line1\n\n\n\nline2';
      const result = normalizeWhitespace(text);
      expect(result).to.equal('line1\n\nline2');
    });

    it('should trim leading and trailing whitespace', () => {
      const text = '  \n  text  \n  ';
      const result = normalizeWhitespace(text);
      expect(result).to.equal('text');
    });
  });

  describe('extractFormatElements', () => {
    it('should extract headings', () => {
      const markdown = '# H1\n## H2\n### H3';
      const elements = extractFormatElements(markdown);
      const headings = elements.filter(e => e.type === 'heading');
      expect(headings).to.have.lengthOf(3);
      expect(headings[0].level).to.equal(1);
      expect(headings[1].level).to.equal(2);
      expect(headings[2].level).to.equal(3);
    });

    it('should extract code blocks', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const elements = extractFormatElements(markdown);
      const codeBlocks = elements.filter(e => e.type === 'code');
      expect(codeBlocks).to.have.lengthOf(1);
      expect(codeBlocks[0].language).to.equal('javascript');
      expect(codeBlocks[0].content).to.include('const x = 1');
    });

    it('should extract lists', () => {
      const markdown = '* item1\n* item2\n- item3';
      const elements = extractFormatElements(markdown);
      const lists = elements.filter(e => e.type === 'list');
      expect(lists).to.have.lengthOf(3);
    });

    it('should extract links', () => {
      const markdown = '[text](http://example.com)';
      const elements = extractFormatElements(markdown);
      const links = elements.filter(e => e.type === 'link');
      expect(links).to.have.lengthOf(1);
      expect(links[0].content).to.equal('text');
    });

    it('should extract bold text', () => {
      const markdown = '**bold text**';
      const elements = extractFormatElements(markdown);
      const bold = elements.filter(e => e.type === 'bold');
      expect(bold).to.have.lengthOf(1);
      expect(bold[0].content).to.equal('bold text');
    });

    it('should extract italic text', () => {
      const markdown = '*italic text*';
      const elements = extractFormatElements(markdown);
      const italic = elements.filter(e => e.type === 'italic');
      expect(italic).to.have.lengthOf(1);
      expect(italic[0].content).to.equal('italic text');
    });
  });

  describe('calculateSimilarity', () => {
    it('should return 100 for identical empty arrays', () => {
      const similarity = calculateSimilarity([], [], []);
      expect(similarity).to.equal(100);
    });

    it('should return 0 when one array is empty', () => {
      const original = [{ type: 'heading' as const, content: 'test' }];
      const similarity = calculateSimilarity(original, [], []);
      expect(similarity).to.equal(0);
    });

    it('should calculate similarity correctly', () => {
      const original = [
        { type: 'heading' as const, content: 'h1' },
        { type: 'heading' as const, content: 'h2' }
      ];
      const compared = [
        { type: 'heading' as const, content: 'h1' },
        { type: 'heading' as const, content: 'h2' }
      ];
      const differences = findDifferences(original, compared);
      const similarity = calculateSimilarity(original, compared, differences);
      expect(similarity).to.equal(100);
    });
  });

  describe('compareMarkdown', () => {
    it('should compare identical markdown', () => {
      const markdown = '# Heading\n\nSome text';
      const result = compareMarkdown(markdown, markdown);
      expect(result.similarity).to.equal(100);
      expect(result.differences).to.have.lengthOf(0);
    });

    it('should detect differences', () => {
      const original = '# Heading 1';
      const compared = '# Heading 2';
      const result = compareMarkdown(original, compared);
      expect(result.similarity).to.be.lessThan(100);
      expect(result.differences.length).to.be.greaterThan(0);
    });

    it('should normalize whitespace before comparison', () => {
      const original = 'text\r\n\r\nmore';
      const compared = 'text\n\nmore';
      const result = compareMarkdown(original, compared);
      expect(result.normalizedOriginal).to.equal(result.normalizedCompared);
    });
  });

  describe('highlightDifferences', () => {
    it('should return message for no differences', () => {
      const result = highlightDifferences([]);
      expect(result).to.equal('No differences found');
    });

    it('should highlight missing elements', () => {
      const differences = [{
        type: 'missing' as const,
        element: 'heading',
        location: 'document',
        original: '2 headings',
        compared: '1 heading'
      }];
      const result = highlightDifferences(differences);
      expect(result).to.include('Missing');
      expect(result).to.include('heading');
    });

    it('should highlight extra elements', () => {
      const differences = [{
        type: 'extra' as const,
        element: 'list',
        location: 'document'
      }];
      const result = highlightDifferences(differences);
      expect(result).to.include('Extra');
      expect(result).to.include('list');
    });

    it('should highlight modified elements', () => {
      const differences = [{
        type: 'modified' as const,
        element: 'heading',
        location: 'heading #1',
        original: 'Old text',
        compared: 'New text'
      }];
      const result = highlightDifferences(differences);
      expect(result).to.include('Modified');
      expect(result).to.include('Old text');
      expect(result).to.include('New text');
    });
  });

  describe('createDifferenceReport', () => {
    it('should create report with no differences', () => {
      const result = {
        similarity: 100,
        differences: [],
        normalizedOriginal: 'text',
        normalizedCompared: 'text'
      };
      const report = createDifferenceReport(result);
      expect(report).to.include('100.00%');
      expect(report).to.include('No differences found');
    });

    it('should create report with differences', () => {
      const result = {
        similarity: 80,
        differences: [{
          type: 'missing' as const,
          element: 'heading',
          location: 'document'
        }],
        normalizedOriginal: 'text',
        normalizedCompared: 'text'
      };
      const report = createDifferenceReport(result);
      expect(report).to.include('80.00%');
      expect(report).to.include('Differences found: 1');
    });
  });

  describe('filterDifferences', () => {
    it('should filter differences by pattern', () => {
      const differences = [
        { type: 'missing' as const, element: 'metadata', location: 'header' },
        { type: 'missing' as const, element: 'heading', location: 'body' }
      ];
      const filtered = filterDifferences(differences, ['metadata']);
      expect(filtered).to.have.lengthOf(1);
      expect(filtered[0].element).to.equal('heading');
    });

    it('should return all differences when no patterns match', () => {
      const differences = [
        { type: 'missing' as const, element: 'heading', location: 'body' }
      ];
      const filtered = filterDifferences(differences, ['metadata']);
      expect(filtered).to.have.lengthOf(1);
    });

    it('should filter by location pattern', () => {
      const differences = [
        { type: 'missing' as const, element: 'text', location: 'header' },
        { type: 'missing' as const, element: 'text', location: 'body' }
      ];
      const filtered = filterDifferences(differences, ['header']);
      expect(filtered).to.have.lengthOf(1);
      expect(filtered[0].location).to.equal('body');
    });
  });
});
