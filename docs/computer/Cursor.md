<!--
 * @Description: 
 * @Author: zhengfei.tan
 * @Date: 2026-03-24 10:22:05
 * @FilePath: \VitePress\docs\computer\Cursor.md
-->
# Cursor 使用技巧

## .cursorignore的使用

`.cursorignore` 文件类似于 `.gitignore`，用于指定在使用 [Cursor 编辑器](https://www.cursor.so/) 或相关 AI 工具过程中，哪些文件或目录应被自动忽略（即不做自动分析、搜索、补全等）。

常用的有
```
dist/
build/
coverage/
*.log

```


## Rules


Cursor 的 Rules（.cursor/rules/*.md 文件）是对 AI 编程助手行为的定制规定，可以自动化团队规范、限制或增强编辑器 AI 的智能提示、重构、代码生成等能力。比如可以为不同的目录、文件类型、技术规范、约定优先级等，做出明确指引。

下面给出前端、后端常见的 Rules 书写场景和例子：

---

### 前端相关的 Cursor Rules 示例

1. **强制使用 eslint/prettier 规范：**
   ```markdown
   # .cursor/rules/formatting.md

   - Always format JavaScript/TypeScript, Vue, and React files according to .prettierrc and .eslintrc.
   - Do not accept AI code completions that do not pass lint checks.
   ```

2. **避免直接改动自动生成文件：**
   ```markdown
   # .cursor/rules/no-edit-generated.md

   - Never edit files in src/generated/ or dist/ directories, except when explicitly asked.
   ```

3. **优先推荐函数组件（React）：**
   ```markdown
   # .cursor/rules/react.md

   - Prefer functional components over class components in all React code.
   - Use hooks whenever possible for state and lifecycle management.
   ```

4. **Vue 约定：使用 script setup**
   ```markdown
   # .cursor/rules/vue.md

   - All new Vue 3 components should use <script setup> syntax.
   - Use Composition API instead of Options API.
   ```

---

### 后端相关的 Cursor Rules 示例

1. **敏感信息泄露保护：**
   ```markdown
   # .cursor/rules/secrets.md

   - Never suggest, generate, or accept committed secrets (API keys, passwords, etc.).
   - Always use environment variables for sensitive configuration.
   ```

2. **Node.js 项目规范：**
   ```markdown
   # .cursor/rules/node.md

   - Default to CommonJS or ES Module syntax as per package.json type field.
   - Prefer async/await over callbacks for asynchronous code.
   ```

3. **接口命名和结构规范：**
   ```markdown
   # .cursor/rules/api.md

   - RESTful API endpoints should use kebab-case for URLs and camelCase for JSON body keys.
   - Always include status codes and error messages in API responses.
   ```

4. **数据库操作约束（以 TypeORM 为例）：**
   ```markdown
   # .cursor/rules/database.md

   - Use parameterized queries or ORM methods instead of raw SQL to prevent SQL injection.
   - Always define explicit entity relationships (OneToMany, ManyToOne, etc.) in the model layer.
   ```


5.

---

> 更多定制和进阶用法可参考官方文档或团队协作约定，在 `.cursor/rules/` 目录下新增/调整规则文件，持续提升 AI 助力开发体验。



## skills

```markdown
# .cursor/skills

## 1. 编码前先思考

**不要假设。不要掩饰困惑。明确呈现权衡。**

在实现之前：
- 明确写出你的假设。如果不确定，就提问。
- 如果存在多种解释，先把它们列出来，不要默默自行选择。
- 如果有更简单的方法，就直接指出来。在有必要时提出异议。
- 如果有不清楚的地方，就停下来。说清楚困惑点，并提问。

## 2. 简单优先

**只写解决问题所需的最少代码。不做任何预设性扩展。**

- 不要加入超出需求范围的功能。
- 不要为一次性代码做抽象。
- 不要加入未被要求的“灵活性”或“可配置性”。
- 不要为不可能发生的场景写错误处理。
- 如果你写了 200 行，但 50 行就够，就重写。

问问自己：“一个资深工程师会认为这太复杂了吗？” 如果答案是会，那就继续简化。

## 3. 外科手术式修改

**只改必须改的内容。只清理你自己造成的问题。**

编辑现有代码时：
- 不要“顺手优化”相邻代码、注释或格式。
- 不要重构没有坏掉的部分。
- 保持现有风格，即使你个人会写成别的样子。
- 如果发现无关的死代码，可以指出，但不要删除。

当你的改动产生遗留项时：
- 删除那些因你的修改而变成未使用的 import、变量或函数。
- 不要删除原本就存在的死代码，除非被明确要求。

检验标准：每一行改动都应当能直接追溯到用户请求。

## 4. 目标驱动执行

**先定义成功标准，再循环推进，直到验证通过。**

把任务转换成可验证的目标：
- “添加校验” → “先为非法输入写测试，再让测试通过”
- “修复这个 bug” → “先写能复现它的测试，再让测试通过”
- “重构 X” → “确保改动前后测试都通过”

对于多步骤任务，先给出简短计划：
```
1. [步骤] → 验证：[检查项]
2. [步骤] → 验证：[检查项]
3. [步骤] → 验证：[检查项]
```

```

