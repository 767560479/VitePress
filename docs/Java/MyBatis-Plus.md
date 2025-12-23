# MyBatis Plus

## 优点

- 无侵入：  只做增强不做改变，引入它不会对现有工程产生影响，如丝般顺滑

- 损耗小：  启动即会自动注入基本 CURD，性能基本无损耗，直接面向对象

- 操作强大的 CRUD 操作：  内置通用 Mapper、通用 Service，仅仅通过少量配置即可实现单表大部分 CRUD 操作，更有强大的条件构造器，满足各类使用需求
- 支持 Lambda 形式调用：  通过 Lambda 表达式，方便的编写各类查询条件，无需再担心字段写错支持主键自动生成：
- 支持多达 4 种主键策略（内含分布式唯一 ID 生成器 - Sequence），可自由配置，完美解决主键问题
- 支持 ActiveRecord 模式：  支持 ActiveRecord 形式调用，实体类只需继承 Model 类即可进行强大的 CRUD
- 操作支持自定义全局通用操作：  支持全局通用方法注入（ Write once, use anywhere ）内置代码生成器：  采用代码或者 Maven 插件可快速生成 Mapper 、 Model 、 Service 、 Controller 层代码，支持模板引擎，更有超多自定义配置等您来使用
- 内置分页插件：  基于 MyBatis 物理分页，开发者无需关心具体操作，配置好插件之后，写分页等同于普通 List 查询
- 分页插件支持多种数据库：  支持 MySQL、MariaDB、Oracle、DB2、H2、HSQL、SQLite、Postgre、SQLServer 等多种数据库
- 内置性能分析插件：  可输出 Sql 语句以及其执行时间，建议开发测试时启用该功能，能快速揪出慢查询
- 内置全局拦截插件：  提供全表 delete 、 update 操作智能分析阻断，也可自定义拦截规则，预防误操作

## 基本使用

### 1. 引入依赖

```xml
<dependency>
      <groupId>com.baomidou</groupId>
      <artifactId>mybatis-plus-boot-starter</artifactId>
      <version>Latest Version</version>
</dependency>
```

### 2. 配置数据源

```yaml
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
#mysql 8 需要配置时区，不然会出现启动报错的情况   serverTimezone=GMT%2B8
spring.datasource.url=jdbc:mysql://localhost:3306/mybatis_plus?serverTimezone=GMT%2B8&useSSL=true&useUnicode=true&characterEncoding=utf8
spring.datasource.username=root
spring.datasource.password=233031
```

### 3. 配置 Mapper 扫描

```java
@MapperScan("com.example.mapper")
```

### 4. 编写实体类

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Integer age;
    private String email;
}
```

### 5. 编写 Mapper 接口

```java
public interface UserMapper extends BaseMapper<User> {
}
```

### 6. 配置日志

```yaml
mybatis-plus.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
```

### 7. 测试

```java
@SpringBootTest
class MybatisPlusApplicationTests {

    @Autowired
    private UserMapper userMapper;

    @Test
    void contextLoads() {
        List<User> users = userMapper.selectList(null);
        users.forEach(System.out::println);
    }

}
```

## CRUD 扩展

### 1. 自动填充

#### 1.1 实体类字段添加注解

```java
@TableField(fill = FieldFill.INSERT)
private LocalDateTime createTime;
@TableField(fill = FieldFill.INSERT_UPDATE)
private LocalDateTime updateTime;
```

#### 1.2 编写元数据对象处理器

```java
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", LocalDateTime::now, LocalDateTime.class);
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime::now, LocalDateTime.class);
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime::now, LocalDateTime.class);
    }
    }
}
```

### 2.乐观锁

#### 2.1 实体类字段添加注解

```java
@Version
private Integer version;
```

#### 2.2 配置乐观锁插件

```java
@Configuration
public class MybatisPlusConfig {

    @Bean
    public OptimisticLockerInterceptor optimisticLockerInterceptor() {
        return new OptimisticLockerInterceptor();
    }
}
```

#### 2.3 测试

```java
@Test
void testOptimisticLocker() {
    // 1.修改用户信息
    User user = new User();
    user.setId(1L);
    user.setName("zhangsan");
    user.setAge(20);
    user.setEmail("test@mybatis-plus.com");
    user.setVersion(1);
    int result = userMapper.updateById(user);
    System.out.println("result = " + result);
    // 2.模拟脏读
    User user2 = new User();
    user2.setId(1L);
    user2.setName("zhangsan");
    user2.setAge(20);
    user2.setEmail("test@mybatis-plus.com");
    user2.setVersion(1);
     int result = userMapper.updateById(user2);
    System.out.println("result = " + result);
    }


```

### 3.分页

#### 3.1 配置分页插件

```java
@Configuration
public class MybatisPlusConfig {

    @Bean
    public PaginationInterceptor paginationInterceptor() {
        return new PaginationInterceptor();
    }
}
```

#### 3.2 测试

```java
@Test
void testPage() {
    // 第一个参数：当前页
    // 第二个参数：页面大小
    Page<User> page = new Page<>(1, 3);
    userMapper.selectPage(page, null);
    page.getRecords().forEach(System.out::println);
    System.out.println(page.getTotal());
}
```

### 4.逻辑删除

#### 4.1 数据库修改

```sql
ALTER TABLE user ADD COLUMN deleted tinyint(1) NOT NULL DEFAULT 0;
```

#### 4.2 实体类修改

```java
@TableLogic
private Integer deleted;
```

#### 4.3 配置

```java
@Configuration
public class MybatisPlusConfig {
    @Bean
    public ISqlInjector sqlInjector() {
        return new LogicSqlInjector(); // 逻辑删除插件
    }
}

```

```yml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted # 全局逻辑删除的实体字段名
      logic-delete-value: 1 # 逻辑已删除值
      logic-not-delete-value: 0 # 逻辑未删除值
```

#### 4.4 测试

```java
@Test
void testLogicDelete() {
    int result = userMapper.deleteById(1L);
    System.out.println("result = " + result);
}
```

### 5.性能分析插件

#### 5.1 配置

```java
@Configuration
public class MybatisPlusConfig {
    @Bean
    public PerformanceInterceptor performanceInterceptor() {
        PerformanceInterceptor performanceInterceptor = new PerformanceInterceptor();
        performanceInterceptor.setMaxTime(100); // ms 设置SQL执行的最大时间，如果超过了则不执行
        performanceInterceptor.setFormat(true); //是否格式化代码
        return performanceInterceptor;
    }
    }

```

## 代码生成器

### 1. 引入依赖

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-generator</artifactId>
    <version>3.4.3.4</version>
</dependency>
<dependency>
    <groupId>org.freemarker</groupId>
    <artifactId>freemarker</artifactId>
    <version>2.3.31</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.26</version>
</dependency>
```

### 2. 配置

```java
public class CodeGenerator {
    public static void main(String[] args) {
        AutoGenerator mpg = new AutoGenerator();
        // 全局配置
        GlobalConfig gc = new GlobalConfig();
        String projectPath = System.getProperty("user.dir");
        gc.setOutputDir(projectPath + "/src/main/java");
        gc.setAuthor("zhang");
        gc.setOpen(false);
        mpg.setGlobalConfig(gc);

        // 数据源配置
        DataSourceConfig dsc = new DataSourceConfig();
        dsc.setUrl("jdbc:mysql://localhost:3306/mybatis_plus?useUnicode=true&useSSL=false&characterEncoding=utf8");
        // dsc.setSchemaName("public");
        dsc.setDriverName("com.mysql.cj.jdbc.Driver");
        dsc.setUsername("root");
        dsc.setPassword("123456");
        mpg.setDataSource(dsc);

        // 包配置
        PackageConfig pc = new PackageConfig();
        pc.setModuleName("generator");
        pc.setParent("com.example");
        mpg.setPackageInfo(pc);

        // 策略配置
        StrategyConfig strategy = new StrategyConfig();
        strategy.setNaming(NamingStrategy.underline_to_camel);
        strategy.setColumnNaming(NamingStrategy.underline_to_camel); // 数据库表映射到实体的命名策略
        strategy.setEntityLombokModel(true); // lombok 模型 @Accessors(chain = true) setter链式操作
        strategy.setRestControllerStyle(true); // restful api风格控制器
        strategy.setControllerMappingHyphenStyle(true); // url中驼峰转连字符

        strategy.setInclude(scanner("表名，多个英文逗号分割").split(","));
        strategy.setTablePrefix(pc.getModuleName() + "_");
        mpg.setStrategy(strategy);
        mpg.setTemplateEngine(new FreemarkerTemplateEngine());
        mpg.execute();
    }

    public static String scanner(String tip) {
        Scanner scanner = new Scanner(System.in);
        StringBuilder help = new StringBuilder();
        help.append("请输入" + tip + "：");
        System.out.println(help.toString());
        if (scanner.hasNext()) {
            String ipt = scanner.next();
            if (StringUtils.isNotEmpty(ipt)) {
                return ipt;
            }
        }
        throw new MybatisPlusException("请输入正确的" + tip + "！");
    }
    }
```

## 2. 配置文件

```yml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/mybatis_plus?useUnicode=true&useSSL=false&characterEncoding=utf8&serverTimezone=UTC
    username: root
    password: root
mybatis-plus:
  mapper-locations: classpath:/mapper/*.xml
  type-aliases-package: com.example.demo.entity
  global-config:
    db-config:
      id-type: auto
      logic-delete-field: deleted # 全局逻辑删除的实体字段名
      logic-delete-value: 1 # 逻辑已删除值(默认为 1)
      logic-not-delete-value: 0 # 逻辑未删除值(默认为 0)
```
