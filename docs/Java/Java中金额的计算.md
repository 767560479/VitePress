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
/**
 * 精确计算工具类 - 解决Java浮点数精度丢失问题
 * 支持 null 安全处理，所有方法都考虑了 null 参数的情况
 */
public class BigDecimalUtil {

    // 默认精度（小数点后2位，常用在金融计算）
    private static final int DEFAULT_SCALE = 2;
    // 默认舍入模式（四舍五入）
    private static final RoundingMode DEFAULT_ROUNDING = RoundingMode.HALF_UP;
    // 默认值（用于处理 null 参数）
    private static final BigDecimal DEFAULT_VALUE = BigDecimal.ZERO;

    // 私有构造方法，防止实例化
    private BigDecimalUtil() {
        throw new AssertionError("不能实例化工具类");
    }

    /**
     * 安全转换为 BigDecimal
     */
    public static BigDecimal safe(Object value) {
        return safe(value, DEFAULT_VALUE);
    }

    public static BigDecimal safe(Object value, BigDecimal defaultValue) {
        if (value == null) {
            return defaultValue;
        }

        try {
            if (value instanceof BigDecimal) {
                return (BigDecimal) value;
            } else if (value instanceof Integer) {
                return BigDecimal.valueOf((Integer) value);
            } else if (value instanceof Long) {
                return BigDecimal.valueOf((Long) value);
            } else if (value instanceof Double) {
                return BigDecimal.valueOf((Double) value);
            } else if (value instanceof String) {
                String str = ((String) value).trim();
                return str.isEmpty() ? defaultValue : new BigDecimal(str);
            } else if (value instanceof Number) {
                return new BigDecimal(value.toString());
            } else {
                return defaultValue;
            }
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    /**
     * 精确加法（支持 null 安全）
     */
    public static BigDecimal add(Object v1, Object v2) {
        return safe(v1).add(safe(v2));
    }

    public static BigDecimal add(Object v1, Object v2, Object v3) {
        return safe(v1).add(safe(v2)).add(safe(v3));
    }

    public static BigDecimal add(Object... values) {
        BigDecimal result = BigDecimal.ZERO;
        for (Object value : values) {
            result = result.add(safe(value));
        }
        return result;
    }

    /**
     * 精确减法（支持 null 安全）
     */
    public static BigDecimal subtract(Object v1, Object v2) {
        return safe(v1).subtract(safe(v2));
    }

    /**
     * 精确乘法（支持 null 安全）
     */
    public static BigDecimal multiply(Object v1, Object v2) {
        return safe(v1).multiply(safe(v2));
    }

    public static BigDecimal multiply(Object v1, Object v2, Object v3) {
        return safe(v1).multiply(safe(v2)).multiply(safe(v3));
    }

    /**
     * 精确除法（支持 null 安全）
     *  @param dividend 被除数
     *  @param divisor 除数
     *  @return 两个数的商
     */
    public static BigDecimal divide(Object dividend, Object divisor ) {
        return divide(dividend, divisor , DEFAULT_SCALE, DEFAULT_ROUNDING);
    }

    public static BigDecimal divide(Object v1, Object v2, int scale) {
        return divide(v1, v2, scale, DEFAULT_ROUNDING);
    }

    public static BigDecimal divide(Object v1, Object v2, int scale, RoundingMode roundingMode) {
        BigDecimal divisor = safe(v2);
        if (divisor.compareTo(BigDecimal.ZERO) == 0) {
            throw new ArithmeticException("除数不能为零");
        }
        return safe(v1).divide(divisor, scale, roundingMode);
    }

    /**
     * 安全除法（除数为零时返回默认值）
     */
    public static BigDecimal safeDivide(Object v1, Object v2, BigDecimal defaultValue) {
        BigDecimal divisor = safe(v2);
        if (divisor.compareTo(BigDecimal.ZERO) == 0) {
            return defaultValue;
        }
        return safe(v1).divide(divisor, DEFAULT_SCALE, DEFAULT_ROUNDING);
    }

    public static BigDecimal safeDivide(Object v1, Object v2) {
        return safeDivide(v1, v2, DEFAULT_VALUE);
    }

    /**
     * 比较两个数值
     */
    public static boolean isGreaterThan(Object v1, Object v2) {
        return safe(v1).compareTo(safe(v2)) > 0;
    }

    public static boolean isLessThan(Object v1, Object v2) {
        return safe(v1).compareTo(safe(v2)) < 0;
    }

    public static boolean equals(Object v1, Object v2) {
        return safe(v1).compareTo(safe(v2)) == 0;
    }

    public static boolean equals(Object v1, Object v2, int scale) {
        BigDecimal b1 = safe(v1).setScale(scale, DEFAULT_ROUNDING);
        BigDecimal b2 = safe(v2).setScale(scale, DEFAULT_ROUNDING);
        return b1.compareTo(b2) == 0;
    }

    /**
     * 格式化和舍入
     */
    public static BigDecimal round(Object value) {
        return round(value, DEFAULT_SCALE);
    }

    public static BigDecimal round(Object value, int scale) {
        return round(value, scale, DEFAULT_ROUNDING);
    }

    public static BigDecimal round(Object value, int scale, RoundingMode roundingMode) {
        return safe(value).setScale(scale, roundingMode);
    }

    public static String format(Object value) {
        return format(value, DEFAULT_SCALE);
    }

    public static String format(Object value, int scale) {
        return format(value, scale, DEFAULT_ROUNDING);
    }

    public static String format(Object value, int scale, RoundingMode roundingMode) {
        return round(value, scale, roundingMode).toString();
    }

    /**
     * 百分比计算
     */
    public static BigDecimal percentage(Object value) {
        return safe(value).multiply(new BigDecimal("100"));
    }

    public static BigDecimal calculatePercentage(Object part, Object total) {
        if (safe(total).compareTo(BigDecimal.ZERO) == 0) {
            return DEFAULT_VALUE;
        }
        return safe(part).multiply(new BigDecimal("100"))
                .divide(safe(total), DEFAULT_SCALE, DEFAULT_ROUNDING);
    }

    /**
     * 平均值计算
     */
    public static BigDecimal average(Object... values) {
        if (values == null || values.length == 0) {
            return DEFAULT_VALUE;
        }

        BigDecimal sum = BigDecimal.ZERO;
        int count = 0;

        for (Object value : values) {
            if (value != null) {
                sum = sum.add(safe(value));
                count++;
            }
        }

        return count == 0 ? DEFAULT_VALUE :
                sum.divide(BigDecimal.valueOf(count), DEFAULT_SCALE, DEFAULT_ROUNDING);
    }

    /**
     * 最大值和最小值
     */
    public static BigDecimal max(Object v1, Object v2) {
        BigDecimal b1 = safe(v1);
        BigDecimal b2 = safe(v2);
        return b1.compareTo(b2) > 0 ? b1 : b2;
    }

    public static BigDecimal min(Object v1, Object v2) {
        BigDecimal b1 = safe(v1);
        BigDecimal b2 = safe(v2);
        return b1.compareTo(b2) < 0 ? b1 : b2;
    }

    /**
     * 验证是否为有效的数值
     */
    public static boolean isValidNumber(Object value) {
        try {
            safe(value);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 判断是否为正数、负数或零
     */
    public static boolean isPositive(Object value) {
        return safe(value).compareTo(BigDecimal.ZERO) > 0;
    }

    public static boolean isNegative(Object value) {
        return safe(value).compareTo(BigDecimal.ZERO) < 0;
    }

    public static boolean isZero(Object value) {
        return safe(value).compareTo(BigDecimal.ZERO) == 0;
    }

    /**
     * 保持原有接口的兼容性
     */
    public static BigDecimal add(double v1, double v2) {
        return add(BigDecimal.valueOf(v1), BigDecimal.valueOf(v2));
    }

    public static BigDecimal add(String v1, String v2) {
        return add(safe(v1), safe(v2));
    }

    public static BigDecimal subtract(double v1, double v2) {
        return subtract(BigDecimal.valueOf(v1), BigDecimal.valueOf(v2));
    }

    public static BigDecimal subtract(String v1, String v2) {
        return subtract(safe(v1), safe(v2));
    }

    public static BigDecimal multiply(double v1, double v2) {
        return multiply(BigDecimal.valueOf(v1), BigDecimal.valueOf(v2));
    }

    public static BigDecimal multiply(String v1, String v2) {
        return multiply(safe(v1), safe(v2));
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
