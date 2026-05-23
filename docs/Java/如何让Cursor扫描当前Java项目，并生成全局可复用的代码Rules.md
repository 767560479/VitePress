# 如何让 Cursor 扫描当前 Java 项目，并生成全局可复用的代码 Rules？

很多人在使用 Cursor 写 Java 项目时，都会遇到一个问题：

> Cursor 写出来的代码能跑，但不一定符合我当前项目的代码风格。

比如你的项目里明明有统一返回对象，Cursor 却自己新建了一个返回结构；你的项目里 Controller 只负责接收请求，Cursor 却把业务逻辑写进了 Controller；你的项目里异常都是统一抛 `BusinessException`，Cursor 却随手写了一个 `RuntimeException`。

这不是 Cursor 不聪明，而是它缺少一份明确的“项目开发规范”。

Cursor Rules 的作用，就是告诉 Cursor：

> 以后写代码时，请按这些规则来。

本文会讲清楚：

1. Cursor Rules 是什么
2. 如何让 Cursor 扫描当前项目代码风格
3. 如何生成项目级 Rules
4. 如何提炼成全局 Java Rules
5. 一份可直接使用的 Java 全局 Rules 模板
6. 常见误区和推荐工作流

---

## 一、先说本质：Cursor Rules 是给 AI 的长期开发规范

Cursor Rules 可以理解成：

> 写给 Cursor 的团队开发规范。

就像一个新同事刚加入项目，你不会只跟他说：

> 你看着项目风格写吧。

这样他大概率会模仿一部分，但不稳定。

更好的方式是给他一份明确规范：

```text
Controller 只负责接收请求和调用 Service
Service 负责业务逻辑
Mapper 只负责数据库访问
异常统一使用 BusinessException
日志统一使用 Slf4j
接口返回统一使用 Result<T>
Entity 不要直接返回给前端
```

Cursor Rules 的作用也是一样。

它不会真正“训练模型”，而是把这些规则作为上下文指令，让 Cursor 在生成代码、修改代码、重构代码时优先遵守。

---

## 二、Cursor Rules 分为两类

Cursor 中常见的 Rules 有两类：项目级 Rules 和全局 User Rules。

### 1. 项目级 Rules

项目级 Rules 只对当前项目生效。

一般放在项目根目录下：

```text
.cursor/rules/
```

例如：

```text
.cursor/rules/java-project-style.mdc
.cursor/rules/spring-boot-style.mdc
.cursor/rules/mybatis-style.mdc
```

项目级 Rules 适合写当前项目特有的东西，比如：

- 当前项目目录结构
- 当前项目模块划分
- 当前项目统一返回对象
- 当前项目异常处理方式
- 当前项目日志风格
- 当前项目 DTO / VO / Entity 使用规范
- 当前项目 Mapper / Repository 写法
- 当前项目权限、租户、审计字段等特殊规范

### 2. 全局 User Rules

全局 Rules 对你在 Cursor 中打开的所有项目都生效。

一般入口是：

```text
Cursor Settings
→ Rules
→ User Rules
```

不同版本 Cursor 的菜单名称可能略有差异，但你可以在设置里搜索：

```text
Rules
User Rules
```

全局 Rules 适合写通用 Java 规范，比如：

- Java 命名规范
- Spring Boot 分层规范
- Controller / Service / Mapper 职责
- 异常处理规范
- 日志规范
- 参数校验规范
- 单元测试规范
- 禁止使用 `System.out.println()`
- 禁止把 Entity 直接返回给前端

---

## 三、为什么不建议直接把当前项目规范放进全局 Rules？

这是很多人容易犯的错误。

假设你当前项目里有这样的规则：

```text
所有后台接口都放在 com.company.admin.controller 包下
```

这条规则只适合当前项目。

如果你把它放到全局 User Rules，后面打开其他 Java 项目时，Cursor 也可能参考这条规则，反而造成干扰。

所以正确做法是：

```text
当前项目代码风格
        ↓
生成项目级 Rules
        ↓
提炼通用规则
        ↓
放入全局 User Rules
```

简单说：

```text
项目级 Rules = 当前项目的特殊规范
全局 Rules = 你个人长期使用的 Java 编码底线
```

---

## 四、第一步：让 Cursor 扫描当前 Java 项目

在 Cursor 中打开当前项目，然后打开 Chat，建议使用 Agent 模式。

输入下面这段提示词：

```text
请你扫描并分析当前 Java 项目的代码风格和开发规范。

请重点阅读以下内容：
1. 项目目录结构
2. Controller 层代码
3. Service / ServiceImpl 层代码
4. Mapper / Repository 层代码
5. Entity / DTO / VO / BO 等对象定义
6. 统一返回结果类
7. 异常处理类
8. 日志使用方式
9. 注释风格
10. 单元测试写法
11. 配置文件风格
12. 常用工具类和公共方法

请不要只总结表面现象，而是分析这个项目真实遵循的编码习惯。

最后请输出一份适合 Cursor 使用的项目级 Rules，要求：
- 使用 Markdown 格式
- 内容清晰、可执行
- 每条规则都要明确 Cursor 应该怎么写代码
- 区分“必须遵守”和“建议遵守”
- 不要写空泛原则
- 尽量结合当前项目已有代码风格
- 输出内容可以直接保存为 `.cursor/rules/java-project-style.mdc`
```

这一步的目的不是让 Cursor 马上改代码，而是先让它理解当前项目。

它需要观察：

- 你的代码分层方式
- 类命名习惯
- 方法命名习惯
- 返回结构
- 异常类型
- 日志格式
- DTO / VO / Entity 的边界
- 数据库访问方式
- 事务放在哪里
- 测试怎么写

---

## 五、第二步：生成项目级 Cursor Rules 文件

等 Cursor 分析完之后，继续输入：

```text
请根据刚才总结的项目代码风格，在当前项目根目录创建：

.cursor/rules/java-project-style.mdc

并把完整 Rules 内容写入该文件。

要求：
1. 规则必须适用于当前项目
2. 不要包含无关解释
3. 使用 Cursor Rules 适合的 Markdown 结构
4. 规则要尽量具体，例如命名、分层、异常、日志、返回值、DTO/VO 使用方式
```

生成后，你的项目结构大概会变成：

```text
your-project/
  src/
  pom.xml
  .cursor/
    rules/
      java-project-style.mdc
```

这样 Cursor 在当前项目里写代码时，就会参考这份规则。

---

## 六、第三步：提炼全局 Java Rules

项目级 Rules 生成后，不要直接复制到全局 User Rules。

因为里面可能有很多当前项目特有的内容，比如：

- 具体包名
- 具体模块名
- 具体业务名
- 具体表名
- 具体枚举值
- 具体工具类名

你应该让 Cursor 再提炼一份通用规则。

继续输入：

```text
请基于当前项目的 `.cursor/rules/java-project-style.mdc`，提炼一份适合放到 Cursor User Rules 的全局 Java 编码规范。

要求：
1. 只保留适用于大多数 Java / Spring Boot 项目的通用规则
2. 删除当前项目特有的包名、模块名、业务名、数据库表名
3. 保留通用的分层规范、命名规范、异常规范、日志规范、DTO/VO/Entity 使用规范
4. 输出一份可以直接粘贴到 Cursor User Rules 的内容
5. 内容要简洁但具体
6. 不要写“根据项目情况而定”这种模糊表达
```

---

## 七、第四步：把全局 Rules 放到 Cursor User Rules

打开 Cursor 设置：

```text
Cursor Settings
→ Rules
→ User Rules
```

然后把刚才生成的全局 Java Rules 粘贴进去。

之后你在 Cursor 中打开其他 Java 项目时，这些全局规则也会生效。

---

## 八、一份可直接使用的 Java 全局 Rules 模板

如果你不想从零开始，可以先使用下面这份模板。

```markdown
# Global Java Coding Rules

你是一个资深 Java / Spring Boot 工程师。生成、修改、重构 Java 代码时，必须遵守以下规则。

## 1. 基本原则

- 代码必须清晰、可维护、可测试。
- 优先使用简单直接的实现方式，不要为了炫技使用复杂写法。
- 修改代码时，必须尽量保持当前项目已有风格一致。
- 不要随意引入新的框架、依赖或设计模式，除非用户明确要求。
- 不要生成无用代码、重复代码、过度封装代码。

## 2. 分层规范

### Controller 层

- Controller 只负责接收请求、参数校验、调用 Service、返回结果。
- Controller 中禁止编写复杂业务逻辑。
- Controller 中禁止直接访问数据库。
- 请求参数应优先使用 DTO 或 Request 对象承载。
- 返回数据应优先使用 VO 或 Response 对象承载。

### Service 层

- Service 负责业务逻辑编排。
- 涉及多个数据库操作的一致性逻辑，应放在 Service 层。
- 事务注解应优先放在 Service 层方法上。
- Service 方法命名必须表达业务含义，而不是数据库操作细节。
- 不要让 Service 方法变成超长方法，复杂逻辑需要拆分为私有方法。

### Repository / Mapper 层

- Repository / Mapper 只负责数据访问。
- 禁止在 Mapper 层写业务判断。
- SQL 查询条件应清晰可读。
- 复杂 SQL 必须注意可维护性。
- 不要在数据访问层返回 Controller 专用对象，除非项目已有明确规范。

## 3. 对象使用规范

- Entity / DO 只表示数据库持久化结构。
- DTO 用于接收请求参数或跨层传输。
- VO 用于返回给前端的数据。
- 不要直接把 Entity 返回给前端。
- 不要在 Entity 中写复杂业务逻辑。
- 对象转换逻辑应集中处理，避免散落在多个 Controller 中。
- 字段命名必须语义清晰，不要使用模糊缩写。

## 4. 命名规范

- 类名使用大驼峰命名，例如 `UserService`。
- 方法名使用小驼峰命名，例如 `getUserById`。
- 常量使用大写下划线命名，例如 `MAX_RETRY_COUNT`。
- 变量名必须表达业务含义。
- 布尔变量应使用 `is`、`has`、`can`、`should` 等前缀。
- 不要使用 `data`、`info`、`list1`、`temp` 这类含义模糊的命名，除非上下文非常明确。

## 5. 异常处理规范

- 不要吞掉异常。
- 不要只打印异常而不处理。
- 不要使用 `printStackTrace()`。
- 业务异常应使用项目统一的业务异常类型。
- 异常信息必须能帮助定位问题。
- 捕获异常时，应明确说明失败原因。
- 不要把底层异常细节直接暴露给前端。

## 6. 日志规范

- 使用项目统一日志框架，通常为 `Slf4j`。
- 禁止使用 `System.out.println()` 输出日志。
- 日志内容必须包含关键上下文，例如用户 ID、订单 ID、请求 ID、业务 ID。
- 错误日志必须包含异常堆栈。
- 不要打印敏感信息，例如密码、token、身份证号、银行卡号。
- 高频循环中不要打印大量 info 日志。

## 7. 参数校验规范

- 对外接口必须进行必要参数校验。
- 简单格式校验优先使用注解，例如 `@NotNull`、`@NotBlank`、`@Size`。
- 业务规则校验应放在 Service 层。
- 校验失败时，应返回清晰错误信息。
- 不要假设前端传入的数据一定正确。

## 8. 返回值规范

- 接口返回值应遵循项目统一响应结构。
- 不要随意返回 Map，除非项目已有明确约定。
- 返回给前端的数据字段应清晰、稳定。
- 不要返回无关字段。
- 分页接口应返回总数、当前页数据、分页参数等必要信息。

## 9. 数据库与事务规范

- 多个写操作需要保持一致性时，必须考虑事务。
- 事务范围应尽量小。
- 不要在事务中执行耗时外部调用，例如 HTTP 请求、远程 RPC、大文件处理。
- 查询方法不要加不必要的事务。
- 更新和删除操作必须有明确条件，避免误更新全表。

## 10. 集合与空值处理

- 返回集合时，优先返回空集合，而不是 null。
- 使用对象前必须考虑 null 情况。
- 不要滥用 `Optional` 作为字段类型或参数类型。
- 遍历集合前应确认集合来源是否可能为空。
- 对外接口不要返回不稳定的 null 结构。

## 11. 代码修改规范

- 修改已有代码时，优先保持原有代码风格。
- 不要大范围重构与当前任务无关的代码。
- 不要删除用户已有注释，除非注释明显错误。
- 不要改变已有公共方法签名，除非用户明确要求。
- 修改逻辑时，要同步检查调用方影响。
- 如果新增方法，应考虑是否需要测试。

## 12. 注释规范

- 不要给显而易见的代码写废话注释。
- 复杂业务规则必须写注释说明原因。
- 注释应解释“为什么这样做”，而不是简单重复“做了什么”。
- 临时方案、兼容逻辑、特殊判断必须写清楚背景。

## 13. 测试规范

- 新增核心业务逻辑时，应优先补充单元测试。
- 测试方法名应能表达测试场景。
- 测试数据应清晰可读。
- 测试应覆盖正常情况、异常情况和边界情况。
- 不要写没有断言的无效测试。

## 14. 生成代码时的行为要求

- 生成代码前，先观察当前项目已有写法。
- 如果项目已有统一工具类、统一返回结构、统一异常类型，必须优先复用。
- 如果不确定某个类是否存在，应先搜索项目，而不是直接新建。
- 如果需要新增类，应放在符合当前项目结构的位置。
- 如果用户要求修改 bug，应尽量给出原因解释和最小修改方案。
```

---

## 九、一个“一键生成 Rules”的 Cursor 提示词

如果你想省事，可以直接在 Cursor 当前项目中输入下面这段：

```text
请你作为资深 Java 架构师，完整扫描当前项目代码，并为 Cursor 生成一份可长期使用的代码规范 Rules。

请分两份输出：

第一份：项目级 Rules
- 适合保存为 `.cursor/rules/java-project-style.mdc`
- 必须结合当前项目的真实代码风格
- 包括目录结构、分层规范、命名规范、异常处理、日志规范、DTO/VO/Entity 使用、数据库访问、事务、测试等

第二份：全局 Java Rules
- 适合粘贴到 Cursor Settings → Rules → User Rules
- 只保留通用 Java / Spring Boot 规范
- 删除当前项目特有的包名、业务名、模块名
- 规则必须具体、可执行
- 不要输出空泛原则

输出格式：
1. 先输出项目级 Rules
2. 再输出全局 Java Rules
3. 每条规则都要使用明确指令句，例如“必须……”、“禁止……”、“优先……”
```

---

## 十、常见误区

### 误区一：以为 Cursor 会自动长期记住项目风格

Cursor 能读取当前上下文，但不代表它会永远稳定记住你的项目风格。

如果你希望 Cursor 长期稳定地按规范写代码，就要把规范写进 Rules。

### 误区二：把项目特有规则放进全局 Rules

比如：

```text
所有接口必须放到 com.xxx.admin.controller
```

这类规则只适合当前项目。

全局规则应该写成：

```text
Controller 应按业务模块组织，避免所有接口堆在一个类中。
```

### 误区三：Rules 写得太抽象

不推荐：

```text
请写高质量代码。
```

推荐：

```text
Controller 中禁止编写复杂业务逻辑，复杂逻辑必须下沉到 Service 层。
```

Cursor 更容易执行具体规则。

### 误区四：Rules 写成一篇长文章

Rules 不是论文。

它应该像团队开发规范，短句、明确、可执行。

好的规则：

```text
禁止使用 System.out.println() 输出日志，必须使用 Slf4j。
```

差的规则：

```text
在现代软件开发过程中，日志系统是非常重要的基础设施，我们应该合理使用日志。
```

---

## 十一、推荐工作流

最终推荐你这样使用 Cursor Rules：

```text
第一步：打开当前 Java 项目

第二步：让 Cursor 扫描 Controller、Service、Mapper、Entity、DTO、VO、异常、日志、返回结构

第三步：生成项目级 Rules
路径：.cursor/rules/java-project-style.mdc

第四步：从项目级 Rules 中提炼通用 Java Rules

第五步：把通用 Java Rules 粘贴到 Cursor User Rules

第六步：以后每个新项目都保留全局规则，再根据项目生成项目级规则
```

可以总结成一句话：

```text
全局 Rules 负责你的编码底线，项目 Rules 负责当前项目的特殊风格。
```

---

## 十二、总结

让 Cursor 更懂你的 Java 项目，不是靠反复提醒它：

```text
你按我项目风格写。
```

而是要把项目风格变成明确的 Rules。

最好的方式是：

1. 让 Cursor 先扫描当前项目
2. 生成 `.cursor/rules/java-project-style.mdc`
3. 再提炼出通用 Java 全局规范
4. 粘贴到 Cursor 的 User Rules
5. 以后所有 Java 项目都能复用这套规范

Cursor Rules 的价值不只是“让 AI 听话”，更重要的是把你的开发习惯、团队规范、代码边界沉淀成一套稳定的工程约束。

当你把这些规则写清楚之后，Cursor 生成的代码会更像你团队里的一个熟练工程师，而不是一个只会补全代码的工具。

---

## 知识卡片

```markdown
# Cursor Java Rules 使用方法

## 核心结论

Cursor Rules 是给 Cursor 的长期开发规范。

推荐做法：

1. 当前项目生成项目级 Rules
2. 从项目级 Rules 提炼通用 Java Rules
3. 把通用 Java Rules 放入 Cursor User Rules

## 项目级 Rules 适合放什么

- 项目目录结构
- 当前项目统一返回对象
- 当前项目异常处理规范
- 当前项目 DTO / VO / Entity 使用方式
- 当前项目 Mapper / Repository 规范
- 当前项目日志风格
- 当前项目测试规范

## 全局 Rules 适合放什么

- Java 命名规范
- Spring Boot 分层规范
- Controller / Service / Mapper 职责边界
- 日志规范
- 异常规范
- 参数校验规范
- 返回值规范
- 测试规范

## 一句话记忆

全局 Rules 是编码底线，项目 Rules 是项目风格。

## 常见错误

- 把项目特有规则放进全局
- Rules 写得太抽象
- 只写“高质量代码”
- 不区分 Controller / Service / Mapper 职责
- 不让 Cursor 先扫描已有代码
```

---

## `.md` 导出建议

- 使用 UTF-8 编码保存。
- 文件名建议使用 kebab-case，例如：`cursor-java-rules-guide.md`。
- 保持一级标题唯一，避免标题层级跳跃。
- 检查代码块、列表缩进、引用符号是否规范。
- 如果后续要转 Word 或 PDF，建议先检查标题层级和代码块显示效果。
