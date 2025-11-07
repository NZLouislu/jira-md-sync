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

export function parseMarkdownToStories(md: string, options: ParseOptions = {}): JiraStory[] {
  const lines = md.split(/\r?\n/);
  const stories: JiraStory[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    const sec = line.match(sectionHeaderRe);
    if (sec) {
      const { story, nextIndex } = parseStorySection(lines, i, options);
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
    body: bodyLines.join("\n").trim(),
    todos,
    assignees,
    reporter,
    labels,
    meta
  };

  return { story, nextIndex: i };
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
