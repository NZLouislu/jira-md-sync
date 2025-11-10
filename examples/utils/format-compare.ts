export interface ComparisonResult {
  similarity: number;
  differences: Difference[];
  normalizedOriginal: string;
  normalizedCompared: string;
}

export interface Difference {
  type: 'missing' | 'extra' | 'modified';
  element: string;
  original?: string;
  compared?: string;
  location: string;
}

export interface FormatElement {
  type: 'heading' | 'list' | 'code' | 'link' | 'text' | 'bold' | 'italic';
  content: string;
  level?: number;
  language?: string;
}

export function compareMarkdown(original: string, compared: string): ComparisonResult {
  const normalizedOriginal = normalizeWhitespace(original);
  const normalizedCompared = normalizeWhitespace(compared);

  const originalElements = extractFormatElements(normalizedOriginal);
  const comparedElements = extractFormatElements(normalizedCompared);

  const differences = findDifferences(originalElements, comparedElements);
  const similarity = calculateSimilarity(originalElements, comparedElements, differences);

  return {
    similarity,
    differences,
    normalizedOriginal,
    normalizedCompared
  };
}

export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, '  ')
    .replace(/ +\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function extractFormatElements(markdown: string): FormatElement[] {
  const elements: FormatElement[] = [];

  const headingMatches = markdown.matchAll(/^(#{1,6})\s+(.+)$/gm);
  for (const match of headingMatches) {
    elements.push({
      type: 'heading',
      content: match[2],
      level: match[1].length
    });
  }

  const codeBlockMatches = markdown.matchAll(/```(\w+)?\n([\s\S]+?)```/g);
  for (const match of codeBlockMatches) {
    elements.push({
      type: 'code',
      content: match[2].trim(),
      language: match[1] || undefined
    });
  }

  const listMatches = markdown.matchAll(/^[\*\-\+]\s+(.+)$/gm);
  for (const match of listMatches) {
    elements.push({
      type: 'list',
      content: match[1]
    });
  }

  const linkMatches = markdown.matchAll(/\[([^\]]+)\]\(([^\)]+)\)/g);
  for (const match of linkMatches) {
    elements.push({
      type: 'link',
      content: match[1]
    });
  }

  const boldMatches = markdown.matchAll(/\*\*([^\*]+)\*\*/g);
  for (const match of boldMatches) {
    elements.push({
      type: 'bold',
      content: match[1]
    });
  }

  const italicMatches = markdown.matchAll(/\*([^\*]+)\*/g);
  for (const match of italicMatches) {
    elements.push({
      type: 'italic',
      content: match[1]
    });
  }

  return elements;
}

export function findDifferences(
  original: FormatElement[],
  compared: FormatElement[]
): Difference[] {
  const differences: Difference[] = [];

  const originalByType = groupByType(original);
  const comparedByType = groupByType(compared);

  for (const type of Object.keys(originalByType)) {
    const origElements = originalByType[type];
    const compElements = comparedByType[type] || [];

    if (origElements.length > compElements.length) {
      differences.push({
        type: 'missing',
        element: type,
        location: 'compared document',
        original: `${origElements.length} ${type}s`,
        compared: `${compElements.length} ${type}s`
      });
    } else if (origElements.length < compElements.length) {
      differences.push({
        type: 'extra',
        element: type,
        location: 'compared document',
        original: `${origElements.length} ${type}s`,
        compared: `${compElements.length} ${type}s`
      });
    }

    for (let i = 0; i < Math.min(origElements.length, compElements.length); i++) {
      if (origElements[i].content !== compElements[i].content) {
        differences.push({
          type: 'modified',
          element: type,
          location: `${type} #${i + 1}`,
          original: origElements[i].content,
          compared: compElements[i].content
        });
      }
    }
  }

  return differences;
}

function groupByType(elements: FormatElement[]): Record<string, FormatElement[]> {
  const grouped: Record<string, FormatElement[]> = {};
  
  for (const element of elements) {
    if (!grouped[element.type]) {
      grouped[element.type] = [];
    }
    grouped[element.type].push(element);
  }
  
  return grouped;
}

export function calculateSimilarity(
  original: FormatElement[],
  compared: FormatElement[],
  differences: Difference[]
): number {
  if (original.length === 0 && compared.length === 0) {
    return 100;
  }

  if (original.length === 0 || compared.length === 0) {
    return 0;
  }

  const totalElements = Math.max(original.length, compared.length);
  const differenceCount = differences.length;
  
  const similarity = ((totalElements - differenceCount) / totalElements) * 100;
  return Math.max(0, Math.min(100, similarity));
}

export function highlightDifferences(differences: Difference[]): string {
  if (differences.length === 0) {
    return 'No differences found';
  }

  const lines: string[] = [];
  
  for (const diff of differences) {
    switch (diff.type) {
      case 'missing':
        lines.push(`- Missing ${diff.element} in ${diff.location}`);
        if (diff.original) lines.push(`  Expected: ${diff.original}`);
        if (diff.compared) lines.push(`  Found: ${diff.compared}`);
        break;
      
      case 'extra':
        lines.push(`+ Extra ${diff.element} in ${diff.location}`);
        if (diff.original) lines.push(`  Expected: ${diff.original}`);
        if (diff.compared) lines.push(`  Found: ${diff.compared}`);
        break;
      
      case 'modified':
        lines.push(`~ Modified ${diff.element} at ${diff.location}`);
        if (diff.original) lines.push(`  Original: ${diff.original}`);
        if (diff.compared) lines.push(`  Compared: ${diff.compared}`);
        break;
    }
  }

  return lines.join('\n');
}

export function createDifferenceReport(result: ComparisonResult): string {
  const lines: string[] = [];
  
  lines.push('=== Format Comparison Report ===\n');
  lines.push(`Similarity: ${result.similarity.toFixed(2)}%`);
  lines.push(`Differences found: ${result.differences.length}\n`);
  
  if (result.differences.length > 0) {
    lines.push('Differences:');
    lines.push(highlightDifferences(result.differences));
  } else {
    lines.push('✓ No differences found - formats match perfectly!');
  }
  
  return lines.join('\n');
}

export function shouldIgnoreDifference(diff: Difference, ignorePatterns: string[]): boolean {
  for (const pattern of ignorePatterns) {
    if (diff.element.includes(pattern)) {
      return true;
    }
    if (diff.location.includes(pattern)) {
      return true;
    }
  }
  return false;
}

export function filterDifferences(
  differences: Difference[],
  ignorePatterns: string[]
): Difference[] {
  return differences.filter(diff => !shouldIgnoreDifference(diff, ignorePatterns));
}
