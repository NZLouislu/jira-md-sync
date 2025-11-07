declare module 'jira2md' {
  export function to_jira(markdown: string): string;
  export function to_markdown(jiraText: string): string;
  export function md_to_html(markdown: string): string;
  export function jira_to_html(jiraText: string): string;
}
