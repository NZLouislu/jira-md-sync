import { normalizeJiraStatus } from "./status-normalizer";
import type { JiraStory, JiraTodo } from "./types";

type ParserLocation = { file?: string; line: number };

export class MarkdownParseError extends Error {
  code: string;
  location: ParserLocation;
  details?: Record<string, any>;
  constructor(message: string, code: string, location: ParserLocation, details?: Record<string, any>) {
    super(message);
    this.name = "MarkdownParseError";
    this.code = code;
    this.location = location;
    this.details = details;
  }
}

type ParseOptions = {
  statusMap?: Record<string, string>;
  filePath?: string;
  strictStatus?: boolean;
  requireStoryId?: boolean;
};

const sectionHeaderRe = /^##\s+Story:\s*(.+)\s*$/i;
const listStoryRe = /^-\s+Story:\s*(.+)\s*$/i;

export function parseMarkdownToStories(md: string, options: ParseOptions = {}): JiraStory[] {
  const lines = md.split(/\r?\n/);
  const stories: JiraStory[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Check for header format: ## Story:
    const sec = line.match(sectionHeaderRe);
    if (sec) {
      const { story, nextIndex } = parseStorySection(lines, i, options);
      stories.push(story);
      i = nextIndex;
      continue;
    }

    // Check for list format: - Story:
    const listSec = line.match(listStoryRe);
    if (listSec) {
      const { story, nextIndex } = parseListStorySection(lines, i, options);
      stories.push(story);
      i = nextIndex;
      continue;
    }

    i++;
  }

  return stories;
}

function parseStorySection(lines: string[], start: number, options: ParseOptions): { story: JiraStory; nextIndex: number } {
  const rawTitle = (lines[start].match(sectionHeaderRe)![1] || "").trim();
  let storyId = "";
  let title = rawTitle;

  const jiraMatch = rawTitle.match(/^([A-Z]+-\d+)(?:\s+(.+))?$/);
  if (jiraMatch) {
    storyId = jiraMatch[1].trim();
    title = (jiraMatch[2] || "").trim();
  } else {
    const storyMatch = rawTitle.match(/^(STORY-[^\s]+)(?:\s+(.+))?$/i);
    if (storyMatch) {
      storyId = storyMatch[1].trim();
      title = (storyMatch[2] || "").trim();
    } else {
      const idMatch = rawTitle.match(/^ID:\s*([^\s]+)(?:\s+(.+))?$/i);
      if (idMatch) {
        storyId = idMatch[1].trim();
        title = (idMatch[2] || "").trim();
      }
    }
  }

  let status = "";
  let bodyLines: string[] = [];
  const todos: JiraTodo[] = [];
  const assignees: string[] = [];
  let reporter = "";
  const labels: string[] = [];
  const meta: Record<string, any> = {};

  let i = start + 1;
  let section = "";

  while (i < lines.length) {
    const l = lines[i];

    if (l.match(/^##\s+/) && i !== start) break;

    const h3 = l.match(/^###\s+(.+?)\s*$/);
    if (h3) {
      section = h3[1].toLowerCase();
      i++;
      continue;
    }

    if (section.includes("story id")) {
      if (l.trim() && !storyId) storyId = l.trim();
    } else if (section.includes("status")) {
      if (l.trim()) status = l.trim();
    } else if (section.includes("description")) {
      bodyLines.push(l);
    } else if (section.includes("acceptance") || section.includes("criteria") || section.includes("todos")) {
      const todo = parseTodoLine(l);
      if (todo) todos.push(todo);
    } else if (section.includes("assignee")) {
      const vals = splitCsvLine(l);
      for (const v of vals) if (v) assignees.push(v);
    } else if (section.includes("reporter")) {
      if (l.trim()) reporter = l.trim();
    } else if (section.includes("label")) {
      const vals = splitCsvLine(l);
      for (const v of vals) if (v) labels.push(v);
    } else if (section.includes("priority")) {
      if (l.trim()) {
        const text = l.trim();
        meta.priorityLabel = text;
        if (!meta.priority) meta.priority = text;
      }
    }

    i++;
  }

  const normalizedStatus = normalizeJiraStatus(status, options.statusMap);

  if (!storyId && options.requireStoryId) {
    throw new MarkdownParseError("Story ID is required", "STORY_ID_MISSING", { file: options.filePath, line: start + 1 }, { title });
  }

  const story: JiraStory = {
    storyId,
    title,
    status: normalizedStatus,
    body: combineBodyAndTodos(bodyLines, todos),
    todos,
    assignees,
    reporter,
    labels,
    meta
  };

  return { story, nextIndex: i };
}

function combineBodyAndTodos(bodyLines: string[], todos: JiraTodo[]): string {
  let fullBody = bodyLines.join("\n").trim();
  
  // Add Acceptance Criteria section if there are todos
  if (todos.length > 0) {
    if (fullBody) {
      fullBody += "\n\n";
    }
    fullBody += "**Acceptance Criteria:**\n";
    for (const todo of todos) {
      const checkbox = todo.done ? "[x]" : "[ ]";
      fullBody += `- ${checkbox} ${todo.text}\n`;
    }
  }
  
  return fullBody;
}

function parseTodoLine(line: string): JiraTodo | null {
  const match = line.match(/^-\s*\[([x\s])\]\s*(.+)$/i);
  if (!match) return null;
  const done = match[1].toLowerCase() === "x";
  const text = match[2].trim();
  return { text, done };
}

function splitCsvLine(line: string): string[] {
  return line.split(",").map(s => s.trim()).filter(Boolean);
}

function parseListStorySection(lines: string[], start: number, options: ParseOptions): { story: JiraStory; nextIndex: number } {
  const rawTitle = (lines[start].match(listStoryRe)![1] || "").trim();
  let storyId = "";
  let title = rawTitle;

  // Try to extract story ID from title
  const jiraMatch = rawTitle.match(/^([A-Z]+-\d+)(?:\s+(.+))?$/);
  if (jiraMatch) {
    storyId = jiraMatch[1].trim();
    title = (jiraMatch[2] || "").trim();
  }

  let status = "";
  let bodyLines: string[] = [];
  const todos: JiraTodo[] = [];
  const assignees: string[] = [];
  let reporter = "";
  const labels: string[] = [];
  const meta: Record<string, any> = {};

  let i = start + 1;
  let currentField = "";

  // Parse indented content under the story
  while (i < lines.length) {
    const l = lines[i];

    // Stop if we hit another story (list item starting with "- Story:")
    if (l.match(listStoryRe)) break;

    // Stop if we hit a section header at the same or higher level
    if (l.match(/^##?\s+/) && !l.match(/^\s/)) break;

    // Check for field definitions (indented lines with field names)
    const fieldMatch = l.match(/^\s{2}(\w+(?:\s+\w+)*):\s*(.*)$/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1].toLowerCase();
      const fieldValue = fieldMatch[2].trim();
      currentField = fieldName;

      if (fieldName === "description") {
        if (fieldValue) bodyLines.push(fieldValue);
      } else if (fieldName === "status") {
        status = fieldValue;
      } else if (fieldName.includes("assignee")) {
        if (fieldValue) {
          const vals = splitCsvLine(fieldValue);
          assignees.push(...vals.filter(Boolean));
        }
      } else if (fieldName === "reporter") {
        reporter = fieldValue;
      } else if (fieldName.includes("label")) {
        if (fieldValue) {
          // Handle both comma-separated and array format [label1, label2]
          const arrayMatch = fieldValue.match(/^\[(.*)\]$/);
          if (arrayMatch) {
            const vals = splitCsvLine(arrayMatch[1]);
            labels.push(...vals.filter(Boolean));
          } else {
            const vals = splitCsvLine(fieldValue);
            labels.push(...vals.filter(Boolean));
          }
        }
      } else if (fieldName === "priority") {
        meta.priorityLabel = fieldValue;
        if (!meta.priority) meta.priority = fieldValue;
      } else if (fieldName.includes("acceptance") || fieldName.includes("criteria")) {
        currentField = "acceptance_criteria";
      }

      i++;
      continue;
    }

    // Handle continuation lines for description (any indented content or content after description field)
    if (currentField === "description") {
      // Include any line that's not a field definition and not another story
      // This includes empty lines, markdown content, etc.
      if (!l.match(/^\s{2}[A-Z]\w+(?:\s+\w+)*:\s/) && !l.match(listStoryRe)) {
        // Remove leading indentation (2 spaces minimum if present)
        const content = l.replace(/^\s{2}/, '');
        bodyLines.push(content);
        i++;
        continue;
      }
    }

    // Handle continuation lines for acceptance criteria (more indented content)
    if (l.match(/^\s{4,}/)) {
      const content = l.trim();
      
      if (currentField === "acceptance_criteria" || currentField.includes("acceptance") || currentField.includes("criteria")) {
        const todo = parseTodoLine(content);
        if (todo) {
          todos.push(todo);
        } else {
          // If it's not a todo, it might be continuation of description
          bodyLines.push(content);
        }
      }

      i++;
      continue;
    }

    // Handle todo items directly under Acceptance_Criteria
    const todo = parseTodoLine(l.trim());
    if (todo && (currentField === "acceptance_criteria" || currentField.includes("acceptance") || currentField.includes("criteria"))) {
      todos.push(todo);
      i++;
      continue;
    }

    i++;
  }

  const normalizedStatus = normalizeJiraStatus(status, options.statusMap);

  if (!storyId && options.requireStoryId) {
    throw new MarkdownParseError("Story ID is required", "STORY_ID_MISSING", { file: options.filePath, line: start + 1 }, { title });
  }

  const story: JiraStory = {
    storyId,
    title,
    status: normalizedStatus,
    body: combineBodyAndTodos(bodyLines, todos),
    todos,
    assignees,
    reporter,
    labels,
    meta
  };

  return { story, nextIndex: i };
}
