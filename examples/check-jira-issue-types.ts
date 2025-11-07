import 'dotenv/config';
import { JiraClientWrapper } from '../src/jira/jira-client-wrapper';

async function checkIssueTypes() {
  const config = {
    jiraUrl: process.env.JIRA_URL || '',
    email: process.env.JIRA_EMAIL || '',
    apiToken: process.env.JIRA_API_TOKEN || '',
    projectKey: process.env.JIRA_PROJECT_KEY || ''
  };

  const client = new JiraClientWrapper(config);

  try {
    console.log('Fetching project info...');
    const project = await client.getProject();
    console.log('\nProject:', project.key, '-', project.name);
    
    if (project.issueTypes) {
      console.log('\nAvailable Issue Types:');
      project.issueTypes.forEach((type: any) => {
        console.log(`  - ${type.name} (ID: ${type.id})`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkIssueTypes();
