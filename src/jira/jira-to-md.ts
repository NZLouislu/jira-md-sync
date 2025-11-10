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
  const maxResults = 50;
  let nextPageToken: string | undefined = undefined;

  while (true) {
    const result = await client.searchIssues(searchJql, 0, maxResults, nextPageToken);

    if (verbose) {
      logger?.debug?.(`jira-to-md: API returned ${result.issues?.length || 0} issues, isLast=${result.isLast}, nextPageToken=${result.nextPageToken ? 'present' : 'none'}`);
    }

    if (!result.issues || result.issues.length === 0) {
      if (verbose) {
        logger?.info?.(`jira-to-md: No more issues returned from API`);
      }
      break;
    }

    allIssues = allIssues.concat(result.issues);

    if (verbose) {
      logger?.info?.(`jira-to-md: Fetched ${result.issues.length} issues (${allIssues.length} total)`);
    }

    // Check if this is the last page (Jira Cloud API v3)
    if (result.isLast === true) {
      if (verbose) {
        logger?.info?.(`jira-to-md: Last page reached (isLast=true)`);
      }
      break;
    }

    // Check if there's a next page token
    if (!result.nextPageToken) {
      if (verbose) {
        logger?.info?.(`jira-to-md: No nextPageToken, stopping pagination`);
      }
      break;
    }

    if (allIssues.length >= 1000) {
      if (verbose) {
        logger?.warn?.(`jira-to-md: Reached limit of 1000 issues. Use JQL to filter results.`);
      }
      break;
    }

    nextPageToken = result.nextPageToken;
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

export async function jiraToMdSingleIssue(options: JiraToMdOptions & { issueKey: string }): Promise<{
  success: boolean;
  file?: string;
  storyId?: string;
  title?: string;
  status?: string;
  errors?: string[];
}> {
  const { issueKey, jiraConfig, outputDir, dryRun = false, logger } = options;

  const verbose = logger?.debug || logger?.info;

  try {
    await fs.mkdir(outputDir, { recursive: true });

    const client = new JiraProvider({ config: jiraConfig, logger });
    const converter = new FormatConverter();

    const jql = `key = ${issueKey}`;

    if (verbose) {
      logger?.info?.(`jiraToMdSingleIssue: Fetching issue ${issueKey}`);
    }

    const result = await client.searchIssues(jql, 0, 1);

    if (!result.issues || result.issues.length === 0) {
      if (verbose) {
        logger?.error?.(`jiraToMdSingleIssue: Issue ${issueKey} not found`);
      }
      return {
        success: false,
        errors: [`Issue ${issueKey} not found`]
      };
    }

    const issue = result.issues[0];
    const story = mapIssueToStory(issue, jiraConfig, converter);
    const md = renderSingleStoryMarkdown(story);
    const fileName = fileNameFromStory(story);
    const filePath = path.join(outputDir, fileName);

    if (!dryRun) {
      await fs.writeFile(filePath, md, "utf8");
      if (verbose) {
        logger?.info?.(`jiraToMdSingleIssue: Wrote "${filePath}" | ${story.storyId} | ${story.title} | ${story.status}`);
      }
    } else {
      if (verbose) {
        logger?.info?.(`jiraToMdSingleIssue: [DRY RUN] Would write "${filePath}" | ${story.storyId} | ${story.title} | ${story.status}`);
      }
    }

    return {
      success: true,
      file: filePath,
      storyId: story.storyId,
      title: story.title,
      status: story.status
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (verbose) {
      logger?.error?.(`jiraToMdSingleIssue: Error - ${errorMessage}`);
    }
    return {
      success: false,
      errors: [errorMessage]
    };
  }
}
