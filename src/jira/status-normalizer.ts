export function normalizeJiraStatus(input: string, customMap?: Record<string, string>): string {
  const s = String(input || "").trim();
  if (!s) return s;
  
  const key = s.toLowerCase();
  
  if (customMap && customMap[key]) {
    return customMap[key];
  }
  
  const defaultMap: Record<string, string> = {
    'to do': 'Backlog',
    'todo': 'Backlog',
    'backlog': 'Backlog',
    'open': 'Backlog',
    'new': 'Backlog',
    'ready': 'Ready',
    'ready to start': 'Ready',
    'ready for development': 'Ready',
    'selected for development': 'Ready',
    'in progress': 'In Progress',
    'doing': 'In Progress',
    'progress': 'In Progress',
    'in development': 'In Progress',
    'in review': 'In Review',
    'review': 'In Review',
    'code review': 'In Review',
    'peer review': 'In Review',
    'testing': 'In Review',
    'qa': 'In Review',
    'done': 'Done',
    'completed': 'Done',
    'complete': 'Done',
    'finished': 'Done',
    'closed': 'Done',
    'resolved': 'Done'
  };
  
  if (defaultMap[key]) {
    return defaultMap[key];
  }
  
  return s;
}

export function mapMarkdownStatusToJira(
  markdownStatus: string,
  customMap?: Record<string, string>
): string {
  const s = String(markdownStatus || "").trim();
  if (!s) return s;
  
  const key = s.toLowerCase();
  
  if (customMap) {
    const reverseMap: Record<string, string> = {};
    for (const [jiraStatus, mdStatus] of Object.entries(customMap)) {
      reverseMap[mdStatus.toLowerCase()] = jiraStatus;
    }
    if (reverseMap[key]) {
      return reverseMap[key];
    }
  }
  
  const defaultReverseMap: Record<string, string> = {
    'backlog': 'To Do',
    'ready': 'Ready to Start',
    'in progress': 'In Progress',
    'in review': 'In Review',
    'done': 'Done'
  };
  
  if (defaultReverseMap[key]) {
    return defaultReverseMap[key];
  }
  
  return s;
}

export function getStatusCategory(status: string): string {
  const normalized = normalizeJiraStatus(status);
  const key = normalized.toLowerCase();
  
  if (['backlog', 'ready'].includes(key)) {
    return 'todo';
  }
  
  if (['in progress'].includes(key)) {
    return 'indeterminate';
  }
  
  if (['in review'].includes(key)) {
    return 'indeterminate';
  }
  
  if (['done'].includes(key)) {
    return 'done';
  }
  
  return 'todo';
}
