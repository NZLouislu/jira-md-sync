# NPM 包问题修复说明

## 问题分析

### 1. 依赖包情况
✅ **不缺少依赖包** - 项目的 `package.json` 已经包含了所有必要的依赖：
- `jira2md`: ^3.0.1 - Markdown 和 Jira Wiki 格式转换
- `jira-client`: ^8.2.2 - Jira API 客户端
- 其他必要的依赖都已包含

### 2. 实际问题

#### 问题 A: 删除线格式转换不正确
**现象**：Jira 中显示原始的 Markdown 语法 `~~text~~`，而不是删除线效果

**原因**：
- `jira2md` 将 Markdown `~~text~~` 转换为 Jira Wiki `-text-`
- 但 `-` 符号与列表项冲突，导致解析错误
- `FormatConverter` 的 `parseInlineJiraWiki` 方法需要更智能的删除线检测

**修复**：
- 改进了删除线检测逻辑
- 避免将列表标记 `- ` 误识别为删除线
- 只在合适的上下文中识别删除线（不在行首，不跟空格）

#### 问题 B: 用户查找失败
**现象**：日志显示 "Could not find user: [backend]"

**原因**：
- Markdown 中的 assignee 格式包含方括号：`Assignees: [backend]`
- 代码直接使用 `[backend]` 去 Jira 搜索用户
- Jira 中没有名为 "[backend]" 的用户（应该搜索 "backend"）

**修复**：
- 在搜索用户前清理 assignee 名称
- 移除方括号：`assigneeName.replace(/^\[|\]$/g, '').trim()`
- 现在会正确搜索 "backend" 而不是 "[backend]"

## 已实施的修复

### 1. 改进 Assignees 和 Labels 的方括号处理 (src/jira/markdown-parser.ts)

现在支持两种格式：

**方括号数组格式**：
```markdown
Assignees: [backend, frontend]
Labels: [parser, sync, trello]
```

**逗号分隔格式**：
```markdown
Assignees: backend, frontend
Labels: parser, sync, trello
```

两种格式都会被正确解析，方括号会被自动移除。

### 2. 改进删除线解析 (src/jira/format-converter.ts)
```typescript
// 改进前：简单匹配 -text-，容易与列表冲突
if (text[i] === '-') {
  const endIndex = text.indexOf('-', i + 1);
  // ...
}

// 改进后：智能检测，避免列表冲突
if (text[i] === '-' && i < text.length - 1) {
  // 检查上下文，确保不是列表标记
  const beforeChar = i > 0 ? text[i - 1] : '';
  const afterChar = j < text.length - 1 ? text[j + 1] : '';
  // 只在合适的上下文中识别删除线
  if (hasContent && beforeChar !== '\n' && afterChar !== ' ') {
    // 识别为删除线
  }
}
```

### 3. 双重保护：在 API 调用前再次清理 (src/jira/md-to-jira.ts)

即使 markdown-parser 已经处理了方括号，在调用 Jira API 前还会再次清理，确保万无一失：

```typescript
// 改进前：直接使用原始名称
const assigneeName = story.assignees[0];

// 改进后：清理方括号（双重保护）
let assigneeName = story.assignees[0];
assigneeName = assigneeName.replace(/^\[|\]$/g, '').trim();
```

这样即使有遗漏的方括号，也能在最后一步被清理掉。

## 使用建议

### 1. Markdown 格式建议

#### Assignee 和 Labels 格式
现在支持两种格式，都能正确处理：

**方式 1：逗号分隔（推荐，更简洁）**
```markdown
✅ 推荐：
Assignees: backend, frontend
Labels: parser, sync, trello
```

**方式 2：方括号数组（也支持）**
```markdown
✅ 也支持：
Assignees: [backend, frontend]
Labels: [parser, sync, trello]
```

**注意**：不要在每个元素外单独加方括号：
```markdown
❌ 错误：
Assignees: [backend], [frontend]  # 会被解析为 "[backend]" 和 "[frontend]"
```

#### 删除线格式
使用标准 Markdown 删除线语法：
```markdown
✅ 正确：
~~已删除的文本~~

❌ 避免在列表中使用：
- ~~这可能有问题~~  # 可能与列表标记冲突
```

### 2. 测试建议

在测试项目中运行前：

1. **确保安装了所有依赖**：
```bash
npm install jira-md-sync dotenv
```

2. **检查 .env 配置**：
```env
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=PAT  # 你的项目 key
JIRA_ISSUE_TYPE_ID=10001
```

3. **使用 dry-run 模式测试**：
```bash
DRY_RUN=true npm run md-to-jira
```

4. **检查 Markdown 文件格式**：
```markdown
## Backlog

- Story: 测试故事标题
  Description:
    这是描述内容
    
    支持 **粗体**、*斜体*、~~删除线~~
    
    Acceptance_Criteria:
    - [ ] 任务 1
    - [ ] 任务 2
  Priority: High
  Labels: test, demo
  Assignees: username  # 不要用方括号
```

### 3. 重新打包和发布

如果你需要重新打包 npm 包：

```bash
# 1. 清理旧的构建
npm run clean

# 2. 重新构建
npm run build

# 3. 测试构建结果
npm run test

# 4. 更新版本号
npm version patch  # 或 minor, major

# 5. 发布到 npm
npm publish
```

### 4. 在测试项目中使用

```bash
# 1. 更新到最新版本
npm update jira-md-sync

# 或者指定版本
npm install jira-md-sync@latest

# 2. 运行测试
npm run md-to-jira
```

## 预期结果

修复后，你应该看到：

### 成功的输出
```bash
md-to-jira: Found 1 markdown files
md-to-jira: Creating issue: Refine Trello Markdown Parser
md-to-jira: Assigned PAT-1 to Backend Team  # ✅ 用户查找成功
md-to-jira: Created PAT-1 from test-todo-list.md
✅ Created: 10
⏭️  Skipped: 0
```

### Jira 中的正确格式
- ✅ 删除线正确显示（不是 `~~text~~`）
- ✅ Assignee 正确分配（不是 "[backend]"）
- ✅ 其他格式（粗体、斜体、列表）正常工作

## 常见问题

### Q: 还是看到 "Could not find user" 错误？
A: 检查以下几点：
1. 用户名是否在 Jira 中存在
2. 用户名拼写是否正确
3. 是否有权限查看该用户
4. 尝试使用用户的邮箱地址而不是用户名

### Q: 删除线还是不显示？
A: 可能的原因：
1. Jira 项目的文本渲染器设置
2. 某些 Jira 版本可能不支持删除线
3. 尝试在 Jira UI 中手动测试删除线是否工作

### Q: 如何验证修复是否生效？
A: 
1. 检查 `dist/` 目录中的编译文件
2. 在测试项目中使用 `npm link` 本地测试
3. 使用 dry-run 模式查看转换结果

## 总结

✅ **不需要安装额外的 npm 包**
✅ **已修复删除线解析问题**
✅ **已修复 Assignee 名称清理问题**
✅ **建议使用不带方括号的 Assignee 格式**
✅ **重新构建后即可使用**

如有其他问题，请查看项目的 README.md 或提交 GitHub Issue。
