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
    return this.jiraToMarkdown(jiraWiki);
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
        const langMatch = line.match(/\{code:([^}]+)\}/);
        currentCodeBlock = {
          type: 'codeBlock',
          attrs: langMatch ? { language: langMatch[1] } : {},
          content: [{ type: 'text', text: '' }]
        };
        continue;
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
      } else if (line.startsWith('* ') || line.startsWith('*\t')) {
        const itemText = line.substring(line.indexOf('*') + 1).trim();
        if (!currentList) {
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

    return {
      type: 'doc',
      version: 1,
      content
    };
  }

  private parseInlineJiraWiki(text: string): any[] {
    if (!text) return [{ type: 'text', text: '' }];

    const content: any[] = [];
    let lastIndex = 0;

    const patterns = [
      { regex: /\*([^*]+)\*/g, mark: 'strong' },
      { regex: /_([^_]+)_/g, mark: 'em' },
      { regex: /\{\{([^}]+)\}\}/g, mark: 'code' },
      { regex: /\[([^\]]+)\|([^\]]+)\]/g, mark: 'link' }
    ];

    const matches: Array<{ index: number; length: number; text: string; mark: string; url?: string }> = [];

    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.regex.source, 'g');
      let match;
      while ((match = regex.exec(text)) !== null) {
        if (pattern.mark === 'link') {
          matches.push({
            index: match.index,
            length: match[0].length,
            text: match[1],
            mark: pattern.mark,
            url: match[2]
          });
        } else {
          matches.push({
            index: match.index,
            length: match[0].length,
            text: match[1],
            mark: pattern.mark
          });
        }
      }
    });

    matches.sort((a, b) => a.index - b.index);

    matches.forEach(match => {
      if (match.index > lastIndex) {
        content.push({ type: 'text', text: text.substring(lastIndex, match.index) });
      }

      if (match.mark === 'link') {
        content.push({
          type: 'text',
          text: match.text,
          marks: [{
            type: 'link',
            attrs: { href: match.url }
          }]
        });
      } else {
        content.push({
          type: 'text',
          text: match.text,
          marks: [{ type: match.mark }]
        });
      }

      lastIndex = match.index + match.length;
    });

    if (lastIndex < text.length) {
      content.push({ type: 'text', text: text.substring(lastIndex) });
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
        return node.content?.map((item: any) => 
          `# ${this.extractTextWithMarks(item)}`
        ).join('\n') || '';
      
      case 'codeBlock':
        const lang = node.attrs?.language || '';
        const code = this.extractText(node);
        return lang ? `{code:${lang}}\n${code}\n{code}` : `{code}\n${code}\n{code}`;
      
      case 'blockquote':
        return `bq. ${this.extractTextWithMarks(node)}`;
      
      default:
        return this.extractTextWithMarks(node);
    }
  }

  private extractTextWithMarks(node: any): string {
    if (!node) return '';
    
    if (node.type === 'text') {
      let text = node.text || '';
      if (node.marks) {
        node.marks.forEach((mark: any) => {
          switch (mark.type) {
            case 'strong':
              text = `*${text}*`;
              break;
            case 'em':
              text = `_${text}_`;
              break;
            case 'code':
              text = `{{${text}}}`;
              break;
            case 'link':
              const href = mark.attrs?.href || '';
              text = `[${text}|${href}]`;
              break;
          }
        });
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
