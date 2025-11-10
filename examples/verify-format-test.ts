import dotenv from "dotenv";
import path from "path";
import { JiraProvider } from "../src/jira/provider";
import type { JiraConfig } from "../src/jira/types";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

function extractTextFromADF(node: any, indent: string = ""): void {
  if (!node) return;
  
  if (node.type === "text") {
    const marks = node.marks?.map((m: any) => m.type).join(", ") || "none";
    console.log(`${indent}Text: "${node.text}" [marks: ${marks}]`);
  } else if (node.type === "heading") {
    console.log(`${indent}Heading (level ${node.attrs?.level || "?"})`);
  } else if (node.type === "codeBlock") {
    console.log(`${indent}CodeBlock (lang: ${node.attrs?.language || "none"})`);
  } else if (node.type === "bulletList") {
    console.log(`${indent}BulletList`);
  } else if (node.type === "orderedList") {
    console.log(`${indent}OrderedList`);
  } else if (node.type === "listItem") {
    console.log(`${indent}ListItem`);
  } else if (node.type === "table") {
    console.log(`${indent}Table`);
  } else if (node.type === "paragraph") {
    console.log(`${indent}Paragraph`);
  }
  
  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      extractTextFromADF(child, indent + "  ");
    }
  }
}

async function main() {
  const jiraConfig: JiraConfig = {
    jiraUrl: process.env.JIRA_URL || "",
    email: process.env.JIRA_EMAIL || "",
    apiToken: process.env.JIRA_API_TOKEN || "",
    projectKey: process.env.JIRA_PROJECT_KEY || ""
  };

  const provider = new JiraProvider({ config: jiraConfig });

  console.log("Fetching format test issues (JMST-104 to JMST-113)...\n");

  const issueKeys = [
    "JMST-104", "JMST-105", "JMST-106", "JMST-107", "JMST-108",
    "JMST-109", "JMST-110", "JMST-111", "JMST-112", "JMST-113"
  ];

  for (const key of issueKeys) {
    try {
      const issue = await provider.getIssue(key, false);
      
      console.log(`\n${"=".repeat(80)}`);
      console.log(`Issue: ${issue.key}`);
      console.log(`Summary: ${issue.fields.summary}`);
      console.log(`Status: ${issue.fields.status.name}`);
      console.log(`${"=".repeat(80)}`);
      
      // Display description (ADF format)
      if (issue.fields.description) {
        console.log("\nDescription (Full ADF):");
        console.log(JSON.stringify(issue.fields.description, null, 2));
        
        // Extract text content for easier reading
        console.log("\n--- Extracted Text Content ---");
        extractTextFromADF(issue.fields.description);
      } else {
        console.log("\nNo description found");
      }
      
      console.log("\n");
    } catch (error) {
      console.error(`Error fetching ${key}: ${(error as Error).message}`);
    }
  }
}

main().catch(error => {
  console.error("Error:", error.message);
  process.exit(1);
});
