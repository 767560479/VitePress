# Sortable.js 在 Grid 布局中拖动的关键

必须挂载在 Grid 节点！

最近在项目中实现网格拖拽功能时，我踩了一个大坑，经过反复调试才发现一个关键问题：**在 CSS Grid 布局中使用 Sortable.js 时，必须将 Sortable 实例挂载在 Grid 容器节点上，否则拖拽行为会完全失效或表现异常！** 这个发现解决了我几天来的困惑，今天就来分享一下这个经验。

## 问题重现：为什么拖拽失效了？

最初，我的代码是这样的：

```html
<!-- 错误示例：Sortable绑定在父容器上 -->
<div class="wrapper" id="sortable-wrapper">
  <div class="grid-container">
    <div class="grid-item">项目1</div>
    <div class="grid-item">项目2</div>
    <div class="grid-item">项目3</div>
  </div>
</div>

<script>
  // 错误：Sortable绑定在wrapper上
  const wrapper = document.getElementById('sortable-wrapper')
  const sortable = new Sortable(wrapper, {
    // 配置项
  })
</script>
```

看起来逻辑很清晰，但实际拖拽时却发现：

1. 拖拽元素会脱离 Grid 布局
2. 占位符位置错乱
3. 拖拽结束后布局混乱
4. 动画效果异常

## 根本原因：布局上下文丢失

经过深入研究和测试，我发现问题的根源在于**布局上下文**。Sortable.js 在计算元素位置和动画时，需要理解其父容器的布局方式。

当 Sortable 绑定在非 Grid 容器上时：

- Sortable 无法感知 Grid 布局的计算规则
- 拖拽元素会脱离 Grid 的布局上下文
- 位置计算基于错误的容器尺寸和布局方式
- 最终导致视觉和交互上的各种问题

## 正确做法：直接绑定 Grid 容器

解决方案其实很简单：**将 Sortable 直接绑定到 Grid 容器上**。

```html
<!-- 正确示例：Sortable直接绑定Grid容器 -->
<div class="grid-container" id="sortable-grid">
  <div class="grid-item">项目1</div>
  <div class="grid-item">项目2</div>
  <div class="grid-item">项目3</div>
</div>

<script>
  // 正确：Sortable绑定在Grid容器上
  const gridContainer = document.getElementById('sortable-grid')
  const sortable = new Sortable(gridContainer, {
    animation: 150,
    ghostClass: 'ghost',
    chosenClass: 'dragging',
    onEnd: function (evt) {
      // 处理拖拽结束逻辑
    },
  })
</script>
```

## Vue2 中的正确实现

在 Vue2 项目中，正确的实现方式如下：

```vue
<template>
  <div>
    <!-- 正确：ref绑定在Grid容器上 -->
    <div ref="gridContainer" class="grid-container" :style="gridStyle">
      <div v-for="(item, index) in items" :key="item.id" class="grid-item">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script>
  import Sortable from 'sortablejs'

  export default {
    data() {
      return {
        items: [
          { id: 1, name: '项目1' },
          { id: 2, name: '项目2' },
          // ...
        ],
        columns: 3,
      }
    },
    computed: {
      gridStyle() {
        return {
          gridTemplateColumns: `repeat(${this.columns}, 1fr)`,
          gap: '20px',
        }
      },
    },
    mounted() {
      this.initSortable()
    },
    beforeDestroy() {
      if (this.sortable) {
        this.sortable.destroy()
      }
    },
    methods: {
      initSortable() {
        // 关键：获取Grid容器引用
        const container = this.$refs.gridContainer

        this.sortable = new Sortable(container, {
          animation: 150,
          onEnd: event => {
            this.handleDragEnd(event)
          },
        })
      },

      handleDragEnd(event) {
        const { oldIndex, newIndex } = event

        if (oldIndex !== newIndex) {
          // 更新数据顺序
          const movedItem = this.items[oldIndex]
          this.items.splice(oldIndex, 1)
          this.items.splice(newIndex, 0, movedItem)
        }
      },
    },
  }
</script>
```

## 为什么必须这样做？

### 1. 布局计算依赖

Sortable.js 在拖拽时需要计算：

- 元素的初始位置
- 拖拽过程中的位置
- 放置目标的可能位置
- 动画的开始和结束点

这些计算都依赖于父容器的布局方式。Grid 布局有自己独特的计算规则（网格线、网格轨道等），Sortable 必须了解这些规则才能正确工作。

### 2. DOM 结构一致性

当 Sortable 直接管理 Grid 容器时：

- 拖拽元素始终保持在 Grid 上下文中
- 占位符能够正确插入到 Grid 布局中
- 排序后元素能正确回到 Grid 布局位置

### 3. 性能优化

直接绑定可以减少不必要的 DOM 查询和计算，因为 Sortable 可以直接操作它需要管理的元素。

## 常见错误模式

### 错误 1：嵌套容器

```javascript
// 错误：Sortable绑定在Grid的父元素上
<div class="parent">
  <div class="grid-container"> <!-- 实际应该绑定这里 -->
    <!-- grid items -->
  </div>
</div>
```

### 错误 2：多层包装

```javascript
// 错误：多了一层包装容器
<div class="sortable-wrapper">
  <div class="grid-container"> <!-- 实际应该绑定这里 -->
    <!-- grid items -->
  </div>
</div>
```

### 错误 3：动态生成容器

```javascript
// 错误：绑定在动态生成的父级上
<div v-for="section in sections" :key="section.id">
  <div class="grid-container"> <!-- 实际应该绑定这里 -->
    <!-- grid items -->
  </div>
</div>
```

## 实用技巧

### 1. 调试方法

如果遇到拖拽问题，可以添加以下调试代码：

```javascript
const sortable = new Sortable(container, {
  onStart: function (evt) {
    console.log('容器display样式:', window.getComputedStyle(evt.from).display)
    console.log('是否为Grid布局:', window.getComputedStyle(evt.from).display === 'grid')
  },
})
```

### 2. 响应式 Grid 布局

当 Grid 布局变化时，需要重新初始化 Sortable：

```javascript
// 监听布局变化
window.addEventListener('resize', this.reinitSortable);

methods: {
  reinitSortable() {
    if (this.sortable) {
      this.sortable.destroy();
    }
    this.initSortable();
  }
}
```

### 3. 多 Grid 容器场景

如果有多个独立的 Grid 容器需要拖拽，需要为每个容器分别创建 Sortable 实例：

```javascript
mounted() {
  this.gridContainers.forEach((container, index) => {
    new Sortable(container, {
      group: 'shared', // 可以跨容器拖拽
      animation: 150,
      // ...其他配置
    });
  });
}
```

## 总结

这个看似简单的发现实际上解决了一个关键的技术问题。总结一下要点：

1. **Sortable.js 必须绑定到直接包含可拖拽元素的容器上**
2. **对于 Grid 布局，这个容器必须是`display: grid`的元素**
3. **不要将 Sortable 绑定在 Grid 容器的任何父元素上**
4. **在 Vue/React 等框架中，确保在正确的生命周期中初始化和销毁**

这个经验不仅适用于 Grid 布局，对于 Flex 布局等其他布局方式也同样适用。核心原则是：**让 Sortable 直接管理它需要操作的元素所在的布局容器**。

希望这篇分享能帮助到正在使用 Sortable.js 和 CSS Grid 的开发者们，避免踩同样的坑。如果你也遇到过类似问题，或者有更好的解决方案，欢迎在评论区分享！

---
