import type { JiraStory } from "../jira/types";

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    field: string;
    message: string;
    suggestion?: string;
    value?: any;
}

export interface ValidationWarning {
    field: string;
    message: string;
    suggestion?: string;
}

export function validateStory(story: JiraStory, context?: { filePath?: string }): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!story.title || story.title.trim() === '') {
        errors.push({
            field: 'title',
            message: `Story has no title${context?.filePath ? ` in ${context.filePath}` : ''}`,
            suggestion: 'Add a title using "Story: Your Title Here" format'
        });
    }

    if (story.title && story.title.length > 255) {
        errors.push({
            field: 'title',
            message: `Story title exceeds 255 characters (${story.title.length})`,
            suggestion: 'Shorten the title or move detailed information to the description',
            value: story.title.substring(0, 50) + '...'
        });
    }

    if (!story.body || story.body.trim() === '') {
        warnings.push({
            field: 'description',
            message: `Story "${story.title}" has no description`,
            suggestion: 'Add a description to provide context for the story'
        });
    }

    if (story.body && story.body.length > 32767) {
        errors.push({
            field: 'description',
            message: `Description exceeds Jira's maximum length (${story.body.length} characters)`,
            suggestion: 'Reduce description length or split into multiple stories'
        });
    }

    if (story.labels && story.labels.length > 20) {
        warnings.push({
            field: 'labels',
            message: `Story "${story.title}" has ${story.labels.length} labels`,
            suggestion: 'Jira typically supports up to 20 labels per issue. Consider reducing the number of labels.'
        });
    }

    if (story.labels) {
        for (const label of story.labels) {
            if (label.length > 255) {
                errors.push({
                    field: 'labels',
                    message: `Label exceeds 255 characters: "${label.substring(0, 50)}..."`,
                    suggestion: 'Shorten the label name'
                });
            }

            if (label.includes(' ')) {
                warnings.push({
                    field: 'labels',
                    message: `Label contains spaces: "${label}"`,
                    suggestion: 'Jira labels typically use hyphens or underscores instead of spaces'
                });
            }
        }
    }

    if (story.assignees && story.assignees.length > 1) {
        warnings.push({
            field: 'assignees',
            message: `Story "${story.title}" has ${story.assignees.length} assignees`,
            suggestion: 'Jira issues typically have a single assignee. Only the first assignee will be used.'
        });
    }

    if (story.meta?.priority) {
        const validPriorities = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
        if (!validPriorities.includes(story.meta.priority)) {
            warnings.push({
                field: 'priority',
                message: `Unknown priority value: "${story.meta.priority}"`,
                suggestion: `Use one of: ${validPriorities.join(', ')}`
            });
        }
    }

    const validStatuses = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'];
    if (story.status && !validStatuses.includes(story.status)) {
        warnings.push({
            field: 'status',
            message: `Unknown status: "${story.status}"`,
            suggestion: `Use one of: ${validStatuses.join(', ')}`
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

export function formatValidationResult(result: ValidationResult, storyTitle?: string): string {
    const lines: string[] = [];

    if (storyTitle) {
        lines.push(`Validation for: "${storyTitle}"`);
    }

    if (result.errors.length > 0) {
        lines.push('\nErrors:');
        for (const error of result.errors) {
            lines.push(`  ❌ ${error.field}: ${error.message}`);
            if (error.suggestion) {
                lines.push(`     💡 ${error.suggestion}`);
            }
        }
    }

    if (result.warnings.length > 0) {
        lines.push('\nWarnings:');
        for (const warning of result.warnings) {
            lines.push(`  ⚠️  ${warning.field}: ${warning.message}`);
            if (warning.suggestion) {
                lines.push(`     💡 ${warning.suggestion}`);
            }
        }
    }

    if (result.isValid && result.warnings.length === 0) {
        lines.push('✅ Validation passed');
    }

    return lines.join('\n');
}

export function validateStories(stories: JiraStory[], context?: { filePath?: string }): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];

    for (const story of stories) {
        const result = validateStory(story, context);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
    }

    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings
    };
}
