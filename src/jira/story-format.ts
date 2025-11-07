import type { JiraStory } from "./types";

const disallowedFileChars = /[<>:"/\\|?*]+/g;

function normalize(value: string): string {
  return (value || "").trim();
}

export function formatStoryName(issueKey: string, title: string): string {
  const key = normalize(issueKey);
  const cleanTitle = normalize(title);
  if (key && cleanTitle) return `${key} ${cleanTitle}`;
  if (key) return key;
  return cleanTitle;
}

export function issueNameForStory(story: JiraStory): string {
  return formatStoryName(story.storyId, story.title);
}

export function parseFormattedStoryName(value: string): { storyId: string; title: string } {
  const raw = normalize(value);
  const jiraMatch = raw.match(/^([A-Z]+-\d+)(?:\s+(.+))?$/);
  if (jiraMatch) {
    const id = normalize(jiraMatch[1]);
    const title = normalize(jiraMatch[2] || "");
    return { storyId: id, title };
  }
  const storyMatch = raw.match(/^(STORY-[^\s]+)(?:\s+(.+))?$/i);
  if (storyMatch) {
    const id = normalize(storyMatch[1]);
    const title = normalize(storyMatch[2] || "");
    return { storyId: id, title };
  }
  const match = raw.match(/^ID:\s*([^\s]+)(?:\s+(.+))?$/i);
  if (match) {
    const id = normalize(match[1]);
    const title = normalize(match[2] || "");
    return { storyId: id, title };
  }
  return { storyId: "", title: raw };
}

export function storyFileName(story: JiraStory): string {
  const base = formatStoryName(story.storyId, story.title || "untitled") || "untitled";
  const sanitized = base.replace(disallowedFileChars, "-").replace(/\s+/g, " ").trim() || "untitled";
  const parts = sanitized.split(/\s+/);
  if (parts.length > 1 && /^[A-Z]+-\d+$/.test(parts[0])) {
    const key = parts.shift()!;
    const rest = parts.join(" ") || "untitled";
    const slug = rest.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "untitled";
    return `${key}-${slug}.md`;
  }
  if (/^[A-Z]+-\d+$/.test(sanitized)) return `${sanitized}.md`;
  const slug = sanitized.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "untitled";
  return `${slug}.md`;
}
