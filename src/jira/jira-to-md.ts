import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { JiraProvider } from "./provider";
import { FormatConverter } from "./format-converter";
import { renderSingleStoryMarkdown } from "./renderer";
import { normalizeJiraStatus } from "./status-normalizer";
import { storyFileName } from "./story-format";
import type { JiraConfig, JiraIssue, JiraStory, JiraTodo, JiraToMdOptions } from "./types";


function mapIssueToStory(issue: JiraIssue, config: JiraConfig, converter: FormatConverter): JiraStory {
  const storyId = issue.key;
  const title = issue.fields.summary || "";
  const status = normalizeJiraStatus(issue.fields.status.name, config.statusMap);
  const body = converter.adfToMarkdown(issue.fields.description);

  const todos: JiraTodo[] = [];
  if (Array.isArray(issue.fields.subtasks)) {
    for (const subtask of issue.fields.subtasks) {
      const isDone = subtask.fields.status.name.toLowerCase() === "done" ||
        subtask.fields.status.name.toLowerCase() === "closed" ||
        subtask.fields.status.name.toLowerCase() === "resolved";
      todos.push({
        text: subtask.fields.summary,
        done: isDone
      });
    }
  }

  const assignees: string[] = [];
  if (issue.fields.assignee) {
    assignees.push(issue.fields.assignee.displayName);
  }

  const reporter = issue.fields.reporter?.displayName || "";

  const labels = issue.fields.labels || [];

  const meta: Record<string, any> = {
    issueType: issue.fields.issuetype.name,
    created: issue.fields.created,
    updated: issue.fields.updated
  };

  if (issue.fields.priority) {
    meta.priority = issue.fields.priority.name;
  }

  return {
    storyId,
    title,
    status,
    body,
    todos,
    assignees,
    reporter,
    labels,
    meta
  };
}

function truncateBaseName(name: string, max: number): string {
  if (name.length <= max) return name;
  const extIdx = name.lastIndexOf(".");
  const ext = extIdx >= 0 ? name.slice(extIdx) : "";
  const base = extIdx >= 0 ? name.slice(0, extIdx) : name;
  const keep = Math.max(1, max - ext.length);
  return base.slice(0, keep) + ext;
}

function fileNameFromStory(s: JiraStory): string {
  const base = storyFileName(s);
  return truncateBaseName(base, 200);
}

export async function jiraToMd(options: JiraToMdOptions): Promise<{
  written: number;
  files: { file: string; storyId: string; title: string; status: string }[];
  totalIssues: number;
}> {
  const { jiraConfig, outputDir, jql, dryRun = false, logger } = options;

  const verbose = logger?.debug || logger?.info;

  await fs.mkdir(outputDir, { recursive: true });

  const client = new JiraProvider({ config: jiraConfig, logger });
  const converter = new FormatConverter();

  const searchJql = jql || `project = ${jiraConfig.projectKey} ORDER BY key ASC`;

  if (verbose) {
    logger?.info?.(`jira-to-md: Searching with JQL: ${searchJql}`);
  }

  let allIssues: JiraIssue[] = [];
  let startAt = 0;
  const maxResults = 50;

  while (true) {
    const result = await client.searchIssues(searchJql, startAt, maxResults);

    if (!result.issues || result.issues.length === 0) {
      break;
    }

    const newIssues = result.issues.filter(issue =>
      !allIssues.some(existing => existing.key === issue.key)
    );

    if (newIssues.length === 0) {
      if (verbose) {
        logger?.info?.(`jira-to-md: No new issues found, stopping pagination`);
      }
      break;
    }

    allIssues = allIssues.concat(newIssues);

    if (verbose) {
      logger?.info?.(`jira-to-md: Fetched ${newIssues.length} new issues (${allIssues.length} total)`);
    }

    if (result.total && allIssues.length >= result.total) {
      break;
    }

    if (allIssues.length >= 1000) {
      if (verbose) {
        logger?.warn?.(`jira-to-md: Reached limit of 1000 issues. Use JQL to filter results.`);
      }
      break;
    }

    startAt += maxResults;
  }

  if (verbose) {
    logger?.info?.(`jira-to-md: Total issues fetched: ${allIssues.length}`);
  }

  let written = 0;
  const writtenFiles: { file: string; storyId: string; title: string; status: string }[] = [];

  for (const issue of allIssues) {
    const story = mapIssueToStory(issue, jiraConfig, converter);
    const md = renderSingleStoryMarkdown(story);
    const fileName = fileNameFromStory(story);
    const filePath = path.join(outputDir, fileName);

    if (!dryRun) {
      await fs.writeFile(filePath, md, "utf8");
      written++;
      writtenFiles.push({
        file: filePath,
        storyId: story.storyId,
        title: story.title,
        status: story.status
      });

      if (verbose) {
        logger?.info?.(`jira-to-md: Wrote "${filePath}" | ${story.storyId} | ${story.title} | ${story.status}`);
      }
    } else {
      if (verbose) {
        logger?.info?.(`jira-to-md: [DRY RUN] Would write "${filePath}" | ${story.storyId} | ${story.title} | ${story.status}`);
      }
      writtenFiles.push({
        file: filePath,
        storyId: story.storyId,
        title: story.title,
        status: story.status
      });
    }
  }

  if (verbose) {
    logger?.info?.(`jira-to-md: ${dryRun ? '[DRY RUN] Would write' : 'Written'} ${writtenFiles.length} files`);
  }

  return {
    written: dryRun ? 0 : written,
    files: writtenFiles,
    totalIssues: allIssues.length
  };
}
