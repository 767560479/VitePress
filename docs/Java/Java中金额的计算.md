---
top: 16
sticky: 1000
sidebar:
  title: Java中金额的计算
isTimeLine: true
title: Java中金额的计算
date: 2025-12-18 00:00:00
tags:
  - Java
categories:
  - Java
---

# Java 中金额的计算

推荐使用 BigDecimal

Java 的 Math 类（比如 Math.round()）虽然方便，但解决不了精度问题，它只是帮你做取整，而不是解决浮点数本身精度丢失的问题。

为什么 BigDecimal 是解法？

因为 BigDecimal 使用十进制表示数字，而不是二进制，所以能精确表示 0.1、0.2 这样的小数，而不会像 float/double 那样变成 0.10000000000000000555...

通用工具类推荐

```java
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 精确计算工具类 - 解决Java浮点数精度丢失问题
 */
public class BigDecimalUtil {

    // 默认精度（小数点后2位，常用在金融计算）
    private static final int DEFAULT_SCALE = 2;
    // 默认舍入模式（四舍五入）
    private static final RoundingMode DEFAULT_ROUNDING = RoundingMode.HALF_UP;

    // 私有构造方法，防止实例化
    private BigDecimalUtil() {}

    /**
     * 精确加法
     * @param v1 被加数
     * @param v2 加数
     * @return 两个数的和
     */
    public static BigDecimal add(double v1, double v2) {
        return add(String.valueOf(v1), String.valueOf(v2));
    }

    /**
     * 精确加法（推荐使用字符串形式，避免精度丢失）
     * @param v1 被加数（字符串形式）
     * @param v2 加数（字符串形式）
     * @return 两个数的和
     */
    public static BigDecimal add(String v1, String v2) {
        BigDecimal b1 = new BigDecimal(v1);
        BigDecimal b2 = new BigDecimal(v2);
        return b1.add(b2);
    }

    /**
     * 精确减法
     */
    public static BigDecimal subtract(double v1, double v2) {
        return subtract(String.valueOf(v1), String.valueOf(v2));
    }

    public static BigDecimal subtract(String v1, String v2) {
        BigDecimal b1 = new BigDecimal(v1);
        BigDecimal b2 = new BigDecimal(v2);
        return b1.subtract(b2);
    }

    /**
     * 精确乘法
     */
    public static BigDecimal multiply(double v1, double v2) {
        return multiply(String.valueOf(v1), String.valueOf(v2));
    }

    public static BigDecimal multiply(String v1, String v2) {
        BigDecimal b1 = new BigDecimal(v1);
        BigDecimal b2 = new BigDecimal(v2);
        return b1.multiply(b2);
    }

    /**
     * 精确除法（推荐指定精度和舍入模式）
     */
    public static BigDecimal divide(double v1, double v2, int scale) {
        return divide(String.valueOf(v1), String.valueOf(v2), scale, DEFAULT_ROUNDING);
    }

    public static BigDecimal divide(double v1, double v2) {
        return divide(String.valueOf(v1), String.valueOf(v2), DEFAULT_SCALE, DEFAULT_ROUNDING);
    }

    public static BigDecimal divide(String v1, String v2, int scale, RoundingMode roundingMode) {
        BigDecimal b1 = new BigDecimal(v1);
        BigDecimal b2 = new BigDecimal(v2);
        return b1.divide(b2, scale, roundingMode);
    }

    /**
     * 格式化为字符串（带精度）
     */
    public static String format(BigDecimal value, int scale) {
        return value.setScale(scale, DEFAULT_ROUNDING).toString();
    }
}

```

- 使用字符串构造：避免了 new BigDecimal(0.1)这种错误用法，直接用 new BigDecimal("0.1")，确保精度
- 默认精度设置：金融计算通常需要保留 2 位小数，所以默认是 2 位
- 舍入模式：默认使用 HALF_UP（四舍五入），符合大多数业务需求
- 避免了 double 的精度问题：所有方法都推荐使用字符串形式

使用示例

```java
// 正确做法：使用字符串形式
BigDecimal result = BigDecimalUtil.add("0.1", "0.2");
System.out.println(result); // 输出: 0.3

// 错误做法：使用double，会导致精度问题
BigDecimal wrongResult = new BigDecimal(0.1 + 0.2);
System.out.println(wrongResult); // 输出: 0.30000000000000004
```

注意事项

- 不要用 double 构造 BigDecimal：new BigDecimal(0.1)会出问题，必须用 new BigDecimal("0.1")
- 除法必须指定精度：divide()方法必须指定精度，否则可能抛出 ArithmeticException
- 性能考虑：BigDecimal 比基本类型慢，但对精度要求高的场景（如金融）是值得的
