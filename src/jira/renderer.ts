import type { JiraStory } from "./types";
import { storyFileName, formatStoryName } from "./story-format";

export function renderSingleStoryMarkdown(s: JiraStory): string {
  const lines: string[] = [];
  const id = (s.storyId || "").trim();
  const title = (s.title || "").trim();

  const displayName = formatStoryName(id, title);
  if (displayName) lines.push(`## Story: ${displayName}`);
  else lines.push("## Story:");

  lines.push("");

  if (id) {
    lines.push("### Story ID");
    lines.push(id);
    lines.push("");
  }

  lines.push("### Status");
  lines.push(s.status || "Backlog");
  lines.push("");

  const hasTodos = s.todos && s.todos.length > 0;
  let bodyText = s.body || "";
  let acceptanceCriteriaText = "";

  // Check if body contains Acceptance Criteria section
  // Match both formats: **Acceptance Criteria:** and Acceptance_Criteria:
  const acceptanceCriteriaMatch = bodyText.match(/(\*\*Acceptance Criteria:\*\*|Acceptance_Criteria:)([\s\S]*)$/i);

  if (acceptanceCriteriaMatch) {
    // Split body and acceptance criteria
    const cleanBody = bodyText.substring(0, acceptanceCriteriaMatch.index).trim();
    acceptanceCriteriaText = acceptanceCriteriaMatch[2].trim();

    lines.push("### Description");
    lines.push(cleanBody);
    lines.push("");

    // Render Acceptance Criteria as a separate section
    if (acceptanceCriteriaText || hasTodos) {
      lines.push("### Acceptance Criteria");
      lines.push("");

      // If we have text from description, render it
      if (acceptanceCriteriaText) {
        lines.push(acceptanceCriteriaText);
        if (hasTodos) lines.push(""); // Add spacing if we also have todos
      }

      // If we have todos (subtasks), render them
      if (hasTodos) {
        for (const t of s.todos) {
          lines.push(`- [${t.done ? "x" : " "}] ${t.text}`);
        }
      }

      lines.push("");
    }
  } else {
    // No Acceptance Criteria in body
    lines.push("### Description");
    lines.push(bodyText);
    lines.push("");

    // Render todos as separate Acceptance Criteria section if present
    if (hasTodos) {
      lines.push("### Acceptance Criteria");
      lines.push("");
      for (const t of s.todos) {
        lines.push(`- [${t.done ? "x" : " "}] ${t.text}`);
      }
      lines.push("");
    }
  }
  const priorityLabel = typeof s.meta?.priorityLabel === "string" ? s.meta.priorityLabel.trim() : "";
  const priorityValue = typeof s.meta?.priority === "string" ? s.meta.priority.trim() : "";
  const priority = priorityLabel || priorityValue;
  if (priority) {
    lines.push("### Priority");
    lines.push(priority);
    lines.push("");
  }
  const labels = Array.isArray(s.labels)
    ? s.labels.map(label => label.trim()).filter(label => {
      if (!label) return false;
      if (!priorityLabel) return true;
      return label !== priorityLabel;
    })
    : [];
  if (labels.length) {
    lines.push("### Labels");
    lines.push(labels.join(", "));
    lines.push("");
  }
  const assignees = Array.isArray(s.assignees)
    ? s.assignees.map(assignee => assignee.trim()).filter(assignee => !!assignee)
    : [];
  if (assignees.length) {
    lines.push("### Assignees");
    lines.push(assignees.join(", "));
    lines.push("");
  }
  const reporter = typeof s.reporter === "string" ? s.reporter.trim() : "";
  if (reporter) {
    lines.push("### Reporter");
    lines.push(reporter);
    lines.push("");
  }
  return lines.join("\n").replace(/\n+$/, "") + "\n";
}

export function preferredStoryFileName(s: JiraStory): string {
  return storyFileName(s);
}
