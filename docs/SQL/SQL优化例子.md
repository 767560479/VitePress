# SQL 优化方案

## 一、基础优化篇

### 1\. 只查询需要的字段：告别 SELECT \*

**错误示范：**

```sql
SELECT * FROM users WHERE status = 1;
```

**问题分析：**

- • 查询所有字段，包括大文本字段
- • 网络传输数据量大
- • 内存占用高

**正确做法：**

```sql
SELECT id, name, email, status FROM users WHERE status = 1;
```

**场景举例：**  
用户表有 20 个字段，但列表页只需要显示 4 个字段。使用`SELECT *`比指定字段**慢 3 倍**！

### 2\. EXISTS vs IN：根据数据量选择

**传统认知：**`EXISTS`  比  `IN`  快

**实际情况：**  需要看子查询数据量

**小数据量场景（子查询结果<1000 条）：**

```SQL
-- 两种方式性能相当
SELECT * FROM orders
WHERE user_id IN (SELECT id FROM users WHERE vip_level > 3);

SELECT * FROM orders o
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = o.user_id AND u.vip_level > 3);
```

**大数据量场景（子查询结果>10000 条）：**

```sql

-- EXISTS通常更优
SELECT * FROM large_table t1
WHERE EXISTS (SELECT 1 FROM large_table t2 WHERE t2.parent_id = t1.id);
```

### 3\. 避免 WHERE 子句中的函数计算

**错误示范：**

```sql
-- 索引失效！
SELECT * FROM orders WHERE DATE_FORMAT(create_time, '%Y-%m-%d') = '2024-01-01';
SELECT * FROM products WHERE LOWER(name) = 'iphone';
```

**正确做法：**

```SQL
-- 使用范围查询
SELECT * FROM orders
WHERE create_time >= '2024-01-01' AND create_time < '2024-01-02';

-- 保持字段原样查询
SELECT * FROM products WHERE name = 'iPhone';
```

**原理：**  对索引字段使用函数会使索引失效，变成全表扫描。

### 4\. UNION ALL vs UNION：明确是否需要去重

**需要去重：**

```SQL
-- 性能较差，但结果准确
SELECT city FROM customers
UNION
SELECT city FROM suppliers;
```

**不需要去重：**

```SQL
-- 性能更好
SELECT city FROM customers
UNION ALL
SELECT city FROM suppliers;
```

**性能对比：**  在 100 万数据量下，UNION ALL 比 UNION**快 5-8 倍**！

## 二、索引优化篇

### 5\. 为高频查询条件建立索引

**场景分析：**

```SQL
-- 高频查询1：按状态查询
SELECT * FROM orders WHERE status = 'pending';

-- 高频查询2：按用户+时间查询
SELECT * FROM orders WHERE user_id = 123 AND create_time > '2024-01-01';

-- 索引方案
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_user_time ON orders(user_id, create_time);

```

### 6\. 掌握最左前缀原则

**复合索引：** (status, create_time, user_id)

**有效使用索引的查询：**

```SQL
WHERE status = 'pending'  -- 使用索引
WHERE status = 'pending' AND create_time > '2024-01-01'  -- 使用索引
WHERE status = 'pending' AND create_time > '2024-01-01' AND user_id = 123  -- 使用索引
```

**索引失效的查询：**

```SQL
WHERE create_time > '2024-01-01'  -- 索引失效！
WHERE user_id = 123  -- 索引失效！
WHERE status = 'pending' AND user_id = 123  -- 部分使用索引
```

### 7\. 避免索引列参与计算

**错误示范：**

```SQL
-- 索引失效的写法
SELECT * FROM products WHERE price + 100 > 500;
SELECT * FROM users WHERE YEAR(create_time) = 2024;
```

**正确做法：**

```SQL
-- 优化后的写法
SELECT * FROM products WHERE price > 400;
SELECT * FROM users WHERE create_time >= '2024-01-01' AND create_time < '2025-01-01';
```

### 8\. 索引不是越多越好：平衡读写性能

**索引的代价：**

- • **写操作变慢**：每次 INSERT/UPDATE/DELETE 都要更新索引
- • **存储空间增加**：索引占用额外磁盘空间
- • **选择困难**：过多索引让优化器难以选择

**建议：**

- • 单表索引数量控制在**3-5 个**以内
- • 优先为**高频查询**和**WHERE 条件**建立索引
- • 定期清理**未使用**的索引

## 三、高级技巧篇

### 9\. 深度分页优化：告别 LIMIT 偏移量

**传统分页的问题：**

```SQL
-- 越往后越慢！
SELECT * FROM orders ORDER BY id LIMIT 100000, 20;
```

需要先扫描 100000 条记录，再取 20 条。

**优化方案：**

```SQL
-- 使用游标分页
SELECT * FROM orders WHERE id > 100000 ORDER BY id LIMIT 20;

-- 或者记录上次查询的最大ID
SELECT * FROM orders WHERE id > last_max_id ORDER BY id LIMIT 20;
```

**性能对比：**

- • LIMIT 1000,20: 0.01s
- • LIMIT 100000,20: 2.3s
- • WHERE id > 100000 LIMIT 20: 0.01s

### 10\. 批量操作：大幅减少 IO 次数

**错误示范（Java 示例）：**

```Java
for (User user : userList) {
    String sql = "INSERT INTO users(name, age) VALUES(?, ?)";
    // 每次插入都产生网络IO和事务开销
}
```

**正确做法：**

```Java
-- 一次批量插入
INSERT INTO users(name, age)
VALUES('张三', 25), ('李四', 30), ('王五', 28);
```

**性能提升：**  插入 1000 条数据，批量操作比单条插入**快 50 倍**！

### 11\. JOIN 优化：理解执行计划

**需要优化的子查询：**

```SQL
SELECT * FROM products
WHERE category_id IN (
    SELECT id FROM categories WHERE type = 'electronic'
);
```

**优化为 JOIN：**

```SQL
SELECT p.* FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE c.type = 'electronic';

```

**进阶技巧：**  使用 STRAIGHT_JOIN 指导优化器

```SQL
SELECT p.* FROM products p
STRAIGHT_JOIN categories c ON p.category_id = c.id
WHERE c.type = 'electronic';
```

### 12\. 覆盖索引：避免回表查询

**什么是回表查询？**

```SQL
-- 假设在age字段有索引
SELECT name FROM users WHERE age > 18;
```

需要先查索引找到主键，再用主键查数据行。

**覆盖索引解决方案：**

```SQL
-- 建立复合索引
CREATE INDEX idx_users_age_name ON users(age, name);

-- 现在查询直接在索引中完成
SELECT name FROM users WHERE age > 18;
```

**性能提升：**  减少一次磁盘 IO，性能提升**30%-50%**。

## 四、设计优化篇

### 13\. 选择合适的数据类型

**常见误区：**

```SQL
-- 错误选择
CREATE TABLE users (
    id VARCHAR(50),  -- 应该用INT/BIGINT
    age VARCHAR(10), -- 应该用TINYINT
    create_time VARCHAR(20) -- 应该用DATETIME
);
```

**优化方案：**

```SQL
-- 正确选择
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT,
    age TINYINT UNSIGNED,
    create_time DATETIME,
    PRIMARY KEY(id)
);
```

### 14\. 谨慎使用 NULL 值

**NULL 值的问题：**

```SQL
-- 查询变得复杂
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;

-- 聚合函数忽略NULL
SELECT AVG(age) FROM users; -- 忽略NULL值
```

**解决方案：**

```SQL
-- 设置默认值
CREATE TABLE users (
    phone VARCHAR(20) NOT NULL DEFAULT '',
    age INT NOT NULL DEFAULT 0
);
```

### 15\. 反规范化：用空间换时间

**规范化设计（3NF）：**

```SQL
-- 多表关联查询
SELECT u.name, o.order_no, p.product_name
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE u.id = 123;
```

**反规范化设计：**

```SQL
-- 单表查询（在orders表中冗余用户和商品信息）
SELECT order_no, user_name, product_name
FROM orders
WHERE user_id = 123;
```

**适用场景：**

- • 读多写少的业务
- • 报表统计类查询
- • 需要极致性能的场景

## 五、实战案例篇

### 16\. 案例：电商订单查询优化

**原始慢查询（执行时间：2.3s）：**

```SQL
SELECT * FROM orders
WHERE user_id = 123
AND status IN ('paid', 'shipped')
AND create_time BETWEEN '2024-01-01' AND '2024-06-30'
ORDER BY create_time DESC;
```

**优化步骤：**

**步骤 1：分析执行计划**

```SQL
EXPLAIN SELECT * FROM orders WHERE user_id = 123 AND status IN ('paid', 'shipped');
```

**步骤 2：创建复合索引**

```SQL
CREATE INDEX idx_orders_user_status_time ON orders(user_id, status, create_time);

```

**步骤 3：优化查询语句**

```SQL
SELECT order_id, user_id, amount, status, create_time
FROM orders
WHERE user_id = 123
AND status IN ('paid', 'shipped')
AND create_time >= '2024-01-01'
AND create_time < '2024-07-01'  -- 避免BETWEEN
ORDER BY create_time DESC;
```

**优化结果：** 2.3s → 0.02s

### 17\. 案例：报表统计优化

**原始查询（全表扫描）：**

```SQL
-- 每天执行一次，但需要30秒
SELECT COUNT(*) as total_orders,
       SUM(amount) as total_amount,
       AVG(amount) as avg_amount
FROM orders
WHERE DATE(create_time) = CURDATE();
```

**优化方案：**

**方案 1：使用范围查询**

```SQL
SELECT COUNT(*) as total_orders,
       SUM(amount) as total_amount,
       AVG(amount) as avg_amount
FROM orders
WHERE create_time >= DATE(CURDATE())
AND create_time < DATE(CURDATE()) + INTERVAL 1 DAY;
```

**方案 2：建立汇总表**

```SQL
-- 每日预聚合
CREATE TABLE order_daily_stats (
    stat_date DATE,
    total_orders INT,
    total_amount DECIMAL(15,2),
    avg_amount DECIMAL(10,2),
    PRIMARY KEY(stat_date)
);

-- 查询时直接查汇总表
SELECT * FROM order_daily_stats WHERE stat_date = CURDATE();
```

## 六、工具使用篇

### 18\. 深入理解 EXPLAIN 执行计划

**关键指标解读：**

```
EXPLAIN SELECT * FROM users WHERE age > 18;
```

**重点关注：**

- • **type**：ALL(全表扫描) → index → range → ref → eq_ref → const
- • **key**：实际使用的索引
- • **rows**：预估扫描行数
- • **Extra**：Using filesort(需要优化), Using temporary(需要优化)

### 19\. 配置慢查询日志

**MySQL 配置：**

```bash
# 开启慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1  # 超过1秒的记录
log_queries_not_using_indexes = 1  # 记录未使用索引的查询
```

**分析慢查询日志：**

```bash
# 使用mysqldumpslow分析
mysqldumpslow -t 10 /var/log/mysql/slow.log

# 使用pt-query-digest分析
pt-query-digest /var/log/mysql/slow.log
```

### 20\. 数据库维护：定期健康检查

**日常维护命令：**

```bash
-- 更新索引统计信息
ANALYZE TABLE users, orders, products;

-- 整理表碎片（每月一次）
OPTIMIZE TABLE large_table;

-- 检查未使用索引
SELECT * FROM sys.schema_unused_indexes;
```

**自动化脚本：**

```bash
-- 每周执行一次的健康检查
CHECK TABLE important_table;
ANALYZE TABLE important_table;
```
