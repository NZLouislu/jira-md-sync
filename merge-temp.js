const fs = require('fs');
const path = require('path');

const part2Path = path.join(__dirname, 'tasks', 'upgrade-content-part2.txt');
const targetPath = path.join(__dirname, 'tasks', '利用 jira2md 等包更好的实现jira md sync 功能.md');

const part2Content = fs.readFileSync(part2Path, 'utf-8');
fs.appendFileSync(targetPath, part2Content, 'utf-8');

console.log('Successfully merged content!');
