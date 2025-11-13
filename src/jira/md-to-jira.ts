import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { JiraProvider } from "./provider";
import { FormatConverter } from "./format-converter";
import { parseMarkdownToStories } from "./markdown-parser";
import { mapMarkdownStatusToJira } from "./status-normalizer";
import type { JiraConfig, JiraStory, MdToJiraOptions, JiraCreateIssuePayload } from "./types";

async function getMarkdownFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      try {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const subFiles = await getMarkdownFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      } catch (error) {
        console.warn(`Warning: Could not process ${entry.name}: ${(error as Error).message}`);
      }
    }

    return files;
  } catch (error) {
    throw new Error(`Failed to read directory ${dir}: ${(error as Error).message}`);
  }
}


async function createIssueFromStory(
  client: JiraProvider,
  converter: FormatConverter,
  story: JiraStory,
  config: JiraConfig,
  logger?: any
): Promise<string> {
  const jiraStatus = mapMarkdownStatusToJira(story.status, config.statusMap);

  const payload: JiraCreateIssuePayload = {
    fields: {
      project: {
        key: config.projectKey
      },
      summary: story.title,
      description: converter.markdownToADF(story.body),
      issuetype: {
        id: config.issueTypeId || "10001"
      },
      labels: story.labels
    }
  };

  if (story.meta?.priority) {
    const priorityName = story.meta.priority;
    const priorityMap: Record<string, string> = {
      'Highest': '1',
      'High': '2',
      'Medium': '3',
      'Low': '4',
      'Lowest': '5'
    };

    const priorityId = priorityMap[priorityName] || priorityMap['Medium'];
    payload.fields.priority = { id: priorityId };
  }

  if (logger?.debug) {
    logger.debug(`md-to-jira: Creating issue: ${story.title}`);
  }

  const issue = await client.createIssue(payload);

  if (story.assignees && story.assignees.length > 0) {
    try {
      let assigneeName = story.assignees[0];
      if (!assigneeName || assigneeName.trim() === '') {
        if (logger?.warn) {
          logger.warn(`md-to-jira: Empty assignee name for ${issue.key}`);
        }
        return issue.key;
      }

      // Clean up assignee name: remove brackets and trim
      assigneeName = assigneeName.replace(/^\[|\]$/g, '').trim();

      if (!assigneeName) {
        if (logger?.warn) {
          logger.warn(`md-to-jira: Empty assignee name after cleanup for ${issue.key}`);
        }
        return issue.key;
      }

      const userSearchUrl = `${config.jiraUrl}/rest/api/3/user/search?query=${encodeURIComponent(assigneeName)}`;
      const userResponse = await fetch(userSearchUrl, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${config.email}:${config.apiToken}`).toString('base64')}`,
          'Accept': 'application/json'
        }
      });

      if (!userResponse.ok) {
        throw new Error(`User search failed: ${userResponse.status} ${userResponse.statusText}`);
      }

      const users = await userResponse.json();

      if (!Array.isArray(users)) {
        throw new Error(`Invalid user search response format`);
      }

      if (users.length > 0) {
        const user = users[0];
        if (!user.accountId) {
          throw new Error(`User ${assigneeName} has no accountId`);
        }

        await client.updateIssue(issue.key, {
          fields: {
            assignee: {
              accountId: user.accountId
            }
          }
        });
        if (logger?.debug) {
          logger.debug(`md-to-jira: Assigned ${issue.key} to ${user.displayName}`);
        }
      } else if (logger?.warn) {
        logger.warn(`md-to-jira: Could not find user: ${assigneeName}`);
      }
    } catch (error) {
      if (logger?.warn) {
        logger.warn(`md-to-jira: Error setting assignee for ${issue.key}: ${(error as Error).message}`);
      }
    }
  }

  if (story.status && story.status !== "Backlog") {
    const transition = await client.findTransitionByName(issue.key, jiraStatus);
    if (transition) {
      await client.transitionIssue(issue.key, transition.id);
      if (logger?.debug) {
        logger.debug(`md-to-jira: Transitioned ${issue.key} to ${jiraStatus}`);
      }
    } else if (logger?.warn) {
      logger.warn(`md-to-jira: Could not find transition to ${jiraStatus} for ${issue.key}`);
    }
  }

  return issue.key;
}



export async function mdToJira(options: MdToJiraOptions): Promise<{
  processedFiles: number;
  created: number;
  skipped: number;
  errors: string[];
}> {
  const { jiraConfig, dryRun = false, logger } = options;

  if (!jiraConfig || !jiraConfig.jiraUrl || !jiraConfig.projectKey) {
    throw new Error('Invalid Jira configuration: jiraUrl and projectKey are required');
  }

  // Validate input directory
  if (options.inputDir !== undefined && options.inputDir.trim() === '') {
    throw new Error('Input directory is required');
  }

  // Get input directory: use provided value, or default to 'jiramd' in project root
  const inputDirRaw = options.inputDir || 'jiramd';
  const inputDir = path.isAbsolute(inputDirRaw)
    ? inputDirRaw
    : path.resolve(process.cwd(), inputDirRaw);

  try {
    const stats = await fs.stat(inputDir);
    if (!stats.isDirectory()) {
      throw new Error(`Input path is not a directory: ${inputDir}`);
    }
  } catch (error) {
    throw new Error(`Input directory does not exist or is not accessible: ${inputDir}`);
  }

  const verbose = logger?.debug || logger?.info;

  const client = new JiraProvider({ config: jiraConfig, logger });
  const converter = new FormatConverter();

  const mdFiles = await getMarkdownFiles(inputDir);

  if (verbose) {
    logger?.info?.(`md-to-jira: Found ${mdFiles.length} markdown files`);
  }

  let processedFiles = 0;
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const filePath of mdFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const stories = parseMarkdownToStories(content, {
        statusMap: jiraConfig.statusMap,
        filePath
      });

      if (stories.length === 0) {
        if (verbose) {
          logger?.warn?.(`md-to-jira: No stories found in ${filePath}`);
        }
        continue;
      }

      for (const story of stories) {
        try {
          let existingIssue = null;

          // If story has a storyId (like JMST-104), try to fetch that specific issue
          if (story.storyId && story.storyId.match(/^[A-Z]+-\d+$/)) {
            try {
              const issue = await client.getIssue(story.storyId, false);
              if (issue && issue.key === story.storyId) {
                existingIssue = issue;
                if (verbose) {
                  logger?.info?.(`md-to-jira: Found existing issue by ID: ${story.storyId}`);
                }
              }
            } catch (error) {
              // Issue not found, will create new one
              if (verbose) {
                logger?.debug?.(`md-to-jira: Issue ${story.storyId} not found, will create new`);
              }
            }
          }

          // If no storyId or issue not found by ID, search by title
          if (!existingIssue) {
            const escapedTitle = story.title.replace(/"/g, '\\"');
            const jql = `project = ${jiraConfig.projectKey} AND summary ~ "${escapedTitle}"`;
            const searchResult = await client.searchIssues(jql, 0, 10);

            // Check if any result is an exact match
            if (searchResult.issues && searchResult.issues.length > 0) {
              existingIssue = searchResult.issues.find(issue => issue.fields.summary === story.title);
            }
          }

          // If issue exists, skip it (create-only mode)
          if (existingIssue) {
            if (verbose) {
              logger?.info?.(`md-to-jira: Skipped "${story.title}" (already exists as ${existingIssue.key})`);
            }
            skipped++;
            continue;
          }

          // Create new issue
          if (!dryRun) {
            const issueKey = await createIssueFromStory(client, converter, story, jiraConfig, logger);
            created++;
            if (verbose) {
              logger?.info?.(`md-to-jira: Created ${issueKey} from ${filePath}`);
            }
          } else {
            if (verbose) {
              logger?.info?.(`md-to-jira: [DRY RUN] Would create issue: ${story.title}`);
            }
          }
        } catch (error) {
          const errorMsg = `Error processing story "${story.title}" in ${filePath}: ${(error as Error).message}`;
          errors.push(errorMsg);
          if (logger?.error) {
            logger.error(errorMsg);
          }
        }
      }

      processedFiles++;
    } catch (error) {
      const errorMsg = `Error processing ${filePath}: ${(error as Error).message}`;
      errors.push(errorMsg);
      if (logger?.error) {
        logger.error(errorMsg);
      }
    }
  }

  if (verbose) {
    logger?.info?.(`md-to-jira: ${dryRun ? '[DRY RUN] ' : ''}Processed ${processedFiles} files, created ${created}, skipped ${skipped}`);
  }

  return {
    processedFiles,
    created: dryRun ? 0 : created,
    skipped,
    errors
  };
}
