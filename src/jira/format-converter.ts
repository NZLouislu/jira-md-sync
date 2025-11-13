const j2m = require('jira2md') as {
  to_jira: (markdown: string) => string;
  to_markdown: (jiraText: string) => string;
  md_to_html: (markdown: string) => string;
  jira_to_html: (jiraText: string) => string;
};

export class FormatConverter {
  markdownToJira(markdown: string): string {
    return j2m.to_jira(markdown);
  }

  jiraToMarkdown(jiraText: string): string {
    return j2m.to_markdown(jiraText);
  }

  markdownToHtml(markdown: string): string {
    return j2m.md_to_html(markdown);
  }

  jiraToHtml(jiraText: string): string {
    return j2m.jira_to_html(jiraText);
  }

  markdownToADF(markdown: string): any {
    const jiraWiki = this.markdownToJira(markdown);
    return this.jiraWikiToADF(jiraWiki);
  }

  adfToMarkdown(adf: any): string {
    if (!adf) return '';
    const jiraWiki = this.adfToJiraWiki(adf);
    let markdown = this.jiraToMarkdown(jiraWiki);

    markdown = markdown.replace(/- < > /g, '- [ ] ');
    markdown = markdown.replace(/- <x> /g, '- [x] ');
    markdown = markdown.replace(/- <X> /g, '- [X] ');

    markdown = this.fixOrderedListNumbers(markdown);

    return markdown;
  }

  private fixOrderedListNumbers(markdown: string): string {
    const lines = markdown.split('\n');
    const result: string[] = [];
    let inOrderedList = false;
    let listCounter = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const orderedListMatch = line.match(/^(\s*)1\.\s+(.+)$/);

      if (orderedListMatch) {
        const indent = orderedListMatch[1];
        const content = orderedListMatch[2];

        if (!inOrderedList || (i > 0 && !lines[i - 1].match(/^(\s*)1\.\s+/))) {
          inOrderedList = true;
          listCounter = 1;
        } else {
          listCounter++;
        }

        result.push(`${indent}${listCounter}. ${content}`);
      } else {
        if (line.trim() === '' || !line.match(/^\s*1\.\s+/)) {
          inOrderedList = false;
          listCounter = 0;
        }
        result.push(line);
      }
    }

    return result.join('\n');
  }

  private jiraWikiToADF(jiraWiki: string): any {
    if (!jiraWiki) {
      return {
        type: 'doc',
        version: 1,
        content: []
      };
    }

    const lines = jiraWiki.split('\n');
    const content: any[] = [];
    let currentList: any = null;
    let currentCodeBlock: any = null;
    let currentTable: any = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (currentCodeBlock) {
        if (line.startsWith('{code}')) {
          content.push(currentCodeBlock);
          currentCodeBlock = null;
        } else {
          currentCodeBlock.content[0].text += (currentCodeBlock.content[0].text ? '\n' : '') + line;
        }
        continue;
      }

      if (line.startsWith('{code')) {
        if (currentList) {
          content.push(currentList);
          currentList = null;
        }
        if (currentTable) {
          content.push(currentTable);
          currentTable = null;
        }
        const langMatch = line.match(/\{code:([^}]+)\}/);
        currentCodeBlock = {
          type: 'codeBlock',
          attrs: langMatch ? { language: langMatch[1] } : {},
          content: [{ type: 'text', text: '' }]
        };
        continue;
      }

      if (line.startsWith('||') || line.startsWith('|')) {
        if (currentList) {
          content.push(currentList);
          currentList = null;
        }

        const isHeader = line.startsWith('||');
        const cells = line.split(isHeader ? '||' : '|').filter(c => c.trim());

        if (!currentTable) {
          currentTable = {
            type: 'table',
            attrs: { isNumberColumnEnabled: false, layout: 'default' },
            content: []
          };
        }

        const row: any = {
          type: 'tableRow',
          content: cells.map(cell => ({
            type: isHeader ? 'tableHeader' : 'tableCell',
            attrs: {},
            content: [{
              type: 'paragraph',
              content: this.parseInlineJiraWiki(cell.trim())
            }]
          }))
        };

        currentTable.content.push(row);
        continue;
      } else if (currentTable) {
        content.push(currentTable);
        currentTable = null;
      }

      if (!line.trim()) {
        if (currentList) {
          content.push(currentList);
          currentList = null;
        }
        continue;
      }

      if (line.startsWith('h1.')) {
        if (currentList) {
          content.push(currentList);
          currentList = null;
        }
        content.push({
          type: 'heading',
          attrs: { level: 1 },
          content: this.parseInlineJiraWiki(line.substring(3).trim())
        });
      } else if (line.startsWith('h2.')) {
        if (currentList) {
          content.push(currentList);
          currentList = null;
        }
        content.push({
          type: 'heading',
          attrs: { level: 2 },
          content: this.parseInlineJiraWiki(line.substring(3).trim())
        });
      } else if (line.startsWith('h3.')) {
        if (currentList) {
          content.push(currentList);
          currentList = null;
        }
        content.push({
          type: 'heading',
          attrs: { level: 3 },
          content: this.parseInlineJiraWiki(line.substring(3).trim())
        });
      } else if (line.startsWith('h4.')) {
        if (currentList) {
          content.push(currentList);
          currentList = null;
        }
        content.push({
          type: 'heading',
          attrs: { level: 4 },
          content: this.parseInlineJiraWiki(line.substring(3).trim())
        });
      } else if (line.startsWith('h5.')) {
        if (currentList) {
          content.push(currentList);
          currentList = null;
        }
        content.push({
          type: 'heading',
          attrs: { level: 5 },
          content: this.parseInlineJiraWiki(line.substring(3).trim())
        });
      } else if (line.startsWith('h6.')) {
        if (currentList) {
          content.push(currentList);
          currentList = null;
        }
        content.push({
          type: 'heading',
          attrs: { level: 6 },
          content: this.parseInlineJiraWiki(line.substring(3).trim())
        });
      } else if (line.startsWith('bq.')) {
        if (currentList) {
          content.push(currentList);
          currentList = null;
        }
        content.push({
          type: 'blockquote',
          content: [{
            type: 'paragraph',
            content: this.parseInlineJiraWiki(line.substring(3).trim())
          }]
        });
      } else if (line.startsWith('{quote}')) {
        if (currentList) {
          content.push(currentList);
          currentList = null;
        }
        // Collect all lines until {quote} closing tag
        const quoteLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('{quote}')) {
          quoteLines.push(lines[i]);
          i++;
        }
        content.push({
          type: 'blockquote',
          content: [{
            type: 'paragraph',
            content: this.parseInlineJiraWiki(quoteLines.join('\n'))
          }]
        });
      } else if (line.startsWith('* ') || line.startsWith('*\t') || line.startsWith('- ') || line.startsWith('-\t')) {
        const bulletChar = line.startsWith('*') ? '*' : '-';
        const itemText = line.substring(line.indexOf(bulletChar) + 1).trim();

        // Check if this is a checkbox item (task)
        const checkboxMatch = itemText.match(/^\[([ xX])\]\s+(.+)$/);

        if (checkboxMatch) {
          // This is a checkbox item - create taskList
          const isChecked = checkboxMatch[1].toLowerCase() === 'x';
          const taskText = checkboxMatch[2];

          if (!currentList || currentList.type !== 'taskList') {
            if (currentList) {
              content.push(currentList);
            }
            currentList = {
              type: 'taskList',
              attrs: { localId: `task-list-${Date.now()}` },
              content: []
            };
          }

          currentList.content.push({
            type: 'taskItem',
            attrs: {
              localId: `task-${Date.now()}-${currentList.content.length}`,
              state: isChecked ? 'DONE' : 'TODO'
            },
            content: [{
              type: 'text',
              text: taskText
            }]
          });
        } else {
          // Regular bullet list item
          if (!currentList || currentList.type !== 'bulletList') {
            if (currentList) {
              content.push(currentList);
            }
            currentList = {
              type: 'bulletList',
              content: []
            };
          }
          currentList.content.push({
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: this.parseInlineJiraWiki(itemText)
            }]
          });
        }
      } else if (line.startsWith('# ') || line.startsWith('#\t')) {
        const itemText = line.substring(line.indexOf('#') + 1).trim();
        if (!currentList || currentList.type !== 'orderedList') {
          if (currentList) {
            content.push(currentList);
          }
          currentList = {
            type: 'orderedList',
            content: []
          };
        }
        currentList.content.push({
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: this.parseInlineJiraWiki(itemText)
          }]
        });
      } else {
        if (currentList) {
          content.push(currentList);
          currentList = null;
        }
        content.push({
          type: 'paragraph',
          content: this.parseInlineJiraWiki(line)
        });
      }
    }

    if (currentList) {
      content.push(currentList);
    }

    if (currentCodeBlock) {
      content.push(currentCodeBlock);
    }

    if (currentTable) {
      content.push(currentTable);
    }

    return {
      type: 'doc',
      version: 1,
      content
    };
  }

  private parseInlineJiraWiki(text: string): any[] {
    if (!text) return [{ type: 'text', text: '' }];

    const content: any[] = [];
    let i = 0;

    while (i < text.length) {
      // Check for combined bold+italic: _*text*_
      if (text[i] === '_' && text[i + 1] === '*') {
        const endIndex = text.indexOf('*_', i + 2);
        if (endIndex !== -1) {
          const innerText = text.substring(i + 2, endIndex);
          content.push({
            type: 'text',
            text: innerText,
            marks: [{ type: 'strong' }, { type: 'em' }]
          });
          i = endIndex + 2;
          continue;
        }
      }

      // Check for bold: *text*
      if (text[i] === '*') {
        const endIndex = text.indexOf('*', i + 1);
        if (endIndex !== -1 && endIndex > i + 1) {
          const innerText = text.substring(i + 1, endIndex);
          content.push({
            type: 'text',
            text: innerText,
            marks: [{ type: 'strong' }]
          });
          i = endIndex + 1;
          continue;
        }
      }

      // Check for italic: _text_
      if (text[i] === '_') {
        const endIndex = text.indexOf('_', i + 1);
        if (endIndex !== -1 && endIndex > i + 1) {
          const innerText = text.substring(i + 1, endIndex);
          content.push({
            type: 'text',
            text: innerText,
            marks: [{ type: 'em' }]
          });
          i = endIndex + 1;
          continue;
        }
      }

      // Check for strikethrough: -text-
      // Only match if surrounded by non-space characters to avoid list conflicts
      if (text[i] === '-' && i < text.length - 1) {
        // Look ahead to find matching closing dash
        let endIndex = -1;
        for (let j = i + 1; j < text.length; j++) {
          if (text[j] === '-' && j > i + 1) {
            // Check if this could be a valid strikethrough
            // Must have content between dashes and not be part of a list
            const beforeChar = i > 0 ? text[i - 1] : '';
            const afterChar = j < text.length - 1 ? text[j + 1] : '';
            const hasContent = j > i + 1;

            // Valid if: has content, not at line start, and not followed by space (list marker)
            if (hasContent && beforeChar !== '\n' && afterChar !== ' ') {
              endIndex = j;
              break;
            }
          }
        }

        if (endIndex !== -1) {
          const innerText = text.substring(i + 1, endIndex);
          content.push({
            type: 'text',
            text: innerText,
            marks: [{ type: 'strike' }]
          });
          i = endIndex + 1;
          continue;
        }
      }

      // Check for code: {{text}}
      if (text[i] === '{' && text[i + 1] === '{') {
        const endIndex = text.indexOf('}}', i + 2);
        if (endIndex !== -1) {
          const innerText = text.substring(i + 2, endIndex);
          content.push({
            type: 'text',
            text: innerText,
            marks: [{ type: 'code' }]
          });
          i = endIndex + 2;
          continue;
        }
      }

      // Check for link: [text|url]
      if (text[i] === '[') {
        const endIndex = text.indexOf(']', i + 1);
        if (endIndex !== -1) {
          const linkContent = text.substring(i + 1, endIndex);
          const pipeIndex = linkContent.indexOf('|');
          if (pipeIndex !== -1) {
            const linkText = linkContent.substring(0, pipeIndex);
            const linkUrl = linkContent.substring(pipeIndex + 1);
            content.push({
              type: 'text',
              text: linkText,
              marks: [{
                type: 'link',
                attrs: { href: linkUrl }
              }]
            });
            i = endIndex + 1;
            continue;
          }
        }
      }

      // Regular text
      let nextSpecial = text.length;
      for (let j = i + 1; j < text.length; j++) {
        if (text[j] === '*' || text[j] === '_' || text[j] === '-' || text[j] === '{' || text[j] === '[') {
          nextSpecial = j;
          break;
        }
      }

      if (content.length > 0 && content[content.length - 1].marks === undefined) {
        content[content.length - 1].text += text.substring(i, nextSpecial);
      } else {
        content.push({ type: 'text', text: text.substring(i, nextSpecial) });
      }
      i = nextSpecial;
    }

    return content.length > 0 ? content : [{ type: 'text', text }];
  }

  private adfToJiraWiki(adf: any): string {
    if (!adf || !adf.content) return '';

    return adf.content.map((node: any) => this.nodeToJiraWiki(node)).filter((s: string) => s).join('\n\n');
  }

  private nodeToJiraWiki(node: any): string {
    if (!node) return '';

    switch (node.type) {
      case 'heading':
        const level = node.attrs?.level || 1;
        const headingText = this.extractTextWithMarks(node);
        return `h${level}. ${headingText}`;

      case 'paragraph':
        return this.extractTextWithMarks(node);

      case 'bulletList':
        return node.content?.map((item: any) =>
          `* ${this.extractTextWithMarks(item)}`
        ).join('\n') || '';

      case 'orderedList':
        return node.content?.map((item: any) => {
          const text = this.extractTextWithMarks(item);
          return `# ${text}`;
        }).join('\n') || '';

      case 'taskList':
        return node.content?.map((item: any) => {
          const state = item.attrs?.state || 'TODO';
          const checkbox = state === 'DONE' ? '[x]' : '[ ]';
          const text = this.extractText(item);
          // Use - instead of * to avoid jira2md converting [ ] to < >
          return `- ${checkbox} ${text}`;
        }).join('\n') || '';

      case 'codeBlock':
        const lang = node.attrs?.language || '';
        const code = this.extractText(node);
        return lang ? `{code:${lang}}\n${code}\n{code}` : `{code}\n${code}\n{code}`;

      case 'blockquote':
        return `bq. ${this.extractTextWithMarks(node)}`;

      case 'table':
        return node.content?.map((row: any) => {
          if (row.type === 'tableRow') {
            const cells = row.content?.map((cell: any) => {
              const text = this.extractTextWithMarks(cell);
              return text;
            }) || [];

            const isHeader = row.content?.[0]?.type === 'tableHeader';
            const separator = isHeader ? '||' : '|';
            return `${separator}${cells.join(separator)}${separator}`;
          }
          return '';
        }).join('\n') || '';

      default:
        return this.extractTextWithMarks(node);
    }
  }

  private extractTextWithMarks(node: any): string {
    if (!node) return '';

    if (node.type === 'text') {
      let text = node.text || '';
      if (node.marks) {
        // Handle combined marks (e.g., strong + em)
        const hasStrong = node.marks.some((m: any) => m.type === 'strong');
        const hasEm = node.marks.some((m: any) => m.type === 'em');
        const hasStrike = node.marks.some((m: any) => m.type === 'strike');
        const hasCode = node.marks.some((m: any) => m.type === 'code');
        const linkMark = node.marks.find((m: any) => m.type === 'link');

        // Apply marks in correct order
        if (hasCode) {
          text = `{{${text}}}`;
        } else {
          if (hasStrong && hasEm) {
            text = `_*${text}*_`;
          } else if (hasStrong) {
            text = `*${text}*`;
          } else if (hasEm) {
            text = `_${text}_`;
          }

          if (hasStrike) {
            text = `-${text}-`;
          }
        }

        if (linkMark) {
          const href = linkMark.attrs?.href || '';
          text = `[${text}|${href}]`;
        }
      }
      return text;
    }

    if (node.type === 'listItem' && node.content) {
      return node.content.map((n: any) => this.extractTextWithMarks(n)).join(' ');
    }

    if (Array.isArray(node.content)) {
      return node.content.map((n: any) => this.extractTextWithMarks(n)).join('');
    }

    return '';
  }

  private extractText(node: any): string {
    if (!node) return '';
    if (node.type === 'text') return node.text || '';
    if (Array.isArray(node.content)) {
      return node.content.map((n: any) => this.extractText(n)).join('');
    }
    return '';
  }
}
