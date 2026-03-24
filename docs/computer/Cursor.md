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

---

> 更多定制和进阶用法可参考官方文档或团队协作约定，在 `.cursor/rules/` 目录下新增/调整规则文件，持续提升 AI 助力开发体验。


