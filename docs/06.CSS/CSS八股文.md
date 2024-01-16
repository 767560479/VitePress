<!--
 * @Description: 
 * @Author: zhengfei.tan
 * @Date: 2023-09-11 23:12:18
 * @FilePath: \VitePress\docs\06.CSS\CSS八股文.md
 * @LastEditors: zhengfei.tan
 * @LastEditTime: 2024-01-17 00:05:40
-->


# CSS八股文


## 什么是BFC?如何触发?有何特点?如何解决 margin"塌陷"?
BFC(Block Formatting Context)块级格式化上下文，是CSS布局中的一种定位机制，用于决定元素如何对其内容进行定位，以及与其他元素的关系和相互作用。

BFC的触发条件:

- 根元素
- float属性不为none
- position为absolute或fixed
- overflow不为visible
- display为inline-block、table-cell、table-caption、flex、inline-flex

BFC的特点:

- 内部的Box会在垂直方向上一个接一个放置。
- Box垂直方向的距离由margin决定，属于同一个BFC的两个相邻Box的margin会发生重叠

## CSS如何出来溢出?说一下overflow不同值的区别。
overflow:hidden;

overflow属性可设置以下值:
- visible-默认。溢出没有被剪裁。内容在元素框外渲染
- hidden-溢出被剪裁,其余内容将不可见
- scroll-溢出被剪裁,同时添加滚动条以查看其余内容
- auto-与scroll类似,但仅在必要时添加滚动条示滚动条

## 栏布局有什么实现方式?
栏布局实现方式:
- flex布局
- grid布局
- float布局
- 绝对定位布局

## 什么是Flex布局?flex布局的实现原理是什么?
Flex布局是CSS3新增的一种布局方式，它可以轻松地实现各种布局，并且它非常灵活，可以适应各种场景。

Flex布局的实现原理:
- 弹性容器(flex container)通过设置display:flex属性来创建一个弹性容器，弹性容器中的子元素称为弹性项目(flex item)。
- 弹性容器通过设置flex-direction属性来决定子元素的排列方向，flex-direction属性有4个值，分别对应4个方向：
  - row(默认值):从左到右
  - row-reverse:从右到左
  - column:从上到下
  - column-reverse:从下到上
- 弹性容器通过设置justify-content属性来决定弹性项目在主轴上的对齐方式，justify-content属性有6个值，分别对应6个方向：
  - flex-start(默认值):弹性项目在主轴上从起始位置开始排列
  - flex-end:弹性项目在主轴上从结束位置开始排列
  - center:弹性项目在主轴上居中对齐
  - space-between:弹性项目在主轴上均匀排列，相邻的弹性项目间隔相等
  - space-around:弹性项目在主轴上均匀排列，相邻的弹性项目左右间隔相等
  - space-evenly:弹性项目在主轴上均匀排列，相邻的弹性项目左右间隔相等，项目与项目之间的间隔相等   
- 弹性容器通过设置align-items属性来决定弹性项目在交叉轴上如何对齐，align-items属性有6个值，分别对应6个方向：
  - flex-start:弹性项目在交叉轴上从起始位置开始排列
  - flex-end:弹性项目在交叉轴上从结束位置开始排列
  - center:弹性项目在交叉轴上居中对齐
  - baseline:弹性项目在交叉轴上以基线对齐
  - stretch:弹性项目在交叉轴上拉伸对齐
  - auto:弹性项目在交叉轴上以基线对齐
- 弹性容器通过设置flex-wrap属性来决定弹性项目是否在一行排列，flex-wrap属性有3个值，分别对应3种情况：
  - nowrap(默认值):弹性项目在一行中从左到右排列
  - wrap:弹性项目在一行中从上到下排列
  - wrap-reverse:弹性项目在一行中从下到上排列
- 弹性容器通过设置align-content属性来决定弹性项目在交叉轴上的对齐方式，align-content属性有6个值，分别对应6个方向：
  - flex-start:弹性项目在交叉轴上从起始位置开始排列
  - flex-end:弹性项目在交叉轴上从结束位置开始排列
  - center:弹性项目在交叉轴上居中对齐
  - space-between:弹性项目在交叉轴上均匀排列，相邻的弹性项目间隔相等
  - space-around:弹性项目在交叉轴上均匀排列，相邻的弹性项目左右间隔相等
  - space-evenly:弹性项目在交叉轴上均匀排列，相邻的弹性项目左右间隔相等，项目与项目之间的间隔相等
- 弹性容器通过设置align-self属性来决定弹性项目在交叉轴上的对齐方式，align-self属性有6个值，分别对应6个方向：
  - auto(默认值):弹性项目在交叉轴上以基线对齐
  - flex-start:弹性项目在交叉轴上从起始位置开始排列
  - flex-end:弹性项目在交叉轴上从结束位置开始排列
  - center:弹性项目在交叉轴上居中对齐
  - baseline:弹性项目在交叉轴上以基线对齐
  - stretch:弹性项目在交叉轴上拉伸对齐
- 弹性项目通过设置order属性来决定弹性项目在主轴上的排列顺序，order属性有6个值，分别对应6个方向：

## 三栏布局有什么实现方式?
- 1. float + margin
左右两个div浮动,中间div用margin给左右div留空间。
- 2. 绝对定位 + margin
左右两个div绝对定位,中间div用margin给左右div留空间。
- 3. flex布局
用flex布局,通过flex的justify-content和align-items属性来控制中间块的位置。
- 4. grid布局
利用grid的列和行,设置左右两列宽度固定,中间自适应。
- 5. table布局
将布局转换为表格,左右td宽度固定,中间自适应。
- 6. 相对定位 + calc
左右相对定位,中间div使用calc计算宽度。
- 7. 圣杯布局和双飞翼布局
圣杯布局和双飞翼布局都是优化了浮动布局的三栏布局方案。
综上,常见的三栏布局的实现方式很多,可以根据需求选择合适的方案来实现。



## css calc属性作用是什么?主要用于解决什么问题?
- calc() 函数用于动态计算长度值。
- 需要注意的是，运算符前后都需要保留一个空格，例如：width: calc(100% - 10px)；
- 任何长度值都可以使用calc()函数进行计算；
- calc()函数支持 "+", "-", "*", "/" 运算；
- calc()函数使用标准的数学运算优先级规则；
- calc()函数中的运算符前后都需要保留一个空格；
- calc()函数可以与px单位一起使用；
- calc()函数中的运算符前后都需要保留一个空格；
- calc()函数可以与rem单位一起使用。

## css3有哪些新特性?
- CSS3实现圆角（border-radius:8px）
- 阴影（box-shadow:10px）
- 线性渐变（gradient:linear）
1. 新的背景和边框样式
- border-radius 圆角边框
- box-shadow 盒子阴影
- border-image 边框图像
2. 文本效果
- text-shadow 文字阴影
- @font-face 自定义字体
- text-overflow 文字溢出
3. 2D转换
- transform 变换(旋转,缩放,倾斜,位移)
- transform-origin 变换基点
- transform-style preserve-3d
4. 3D转换
- transform 支持3D转换
- backface-visibility 背面是否可见
- perspective 景深
5. 过渡
- transition 过渡效果
- animation 动画
6. 弹性盒模型(Flexbox)
- flexblox 弹性布局
- justify-content 主轴对齐
- align-items 交叉轴对齐
7. 媒体查询
- @media screen宽度设置不同样式
- 响应式布局
8. 新增选择器
- :nth-child()
- :nth-of-type()
- :not()等
此外还有渐变、多列布局等特性,使CSS具有了很强的动态和交互能力


## 有一个固定长宽div,怎么实现在屏幕上垂直水平居中
- 1. 绝对定位 + margin
- 2. 绝对定位 + transform
- 3. flex布局
- 4. grid布局
- 5. table布局


## CSS权重如何计算？
- 元素选择符：1
- class选择符：10
- id选择符：100
- 内联样式：1000
- 继承的样式：0
- 优先级就近原则，同权重情况下样式定义最近者为准
- 载入样式以最后载入的定位为准

## CSS中哪些属性可继承，哪些不可以
- 所有元素可继承：visibility和cursor
- 内联元素可继承：letter-spacing、word-spacing、white-space、line-height、color、font、font-family、font-size、font-style、font-variant、font-weight、text-decoration、text-transform、direction
- 块状元素可继承：text-indent和text-align
- 列表元素可继承：list-style、list-style-type、list-style-position、list-style-image
- 表格元素可继承：border-collapse


## 如何画一条0.5px的线
- transform: scale(0.5, 1);
- transform-origin: 100% 0;
- 设置border-width: 0 0 1px 0;
- 设置border-color: #00000;
- 设置border-style: solid;
- 设置box-shadow: 0 0 0.5px #00000;

## 什么是浮动，浮动会引起什么问题，有什么解决方案？

- 浮动元素脱离文档流，不占据空间（引起父元素高度塌陷）
- 浮动元素碰到包含它的边界或者浮动元素的边界停止浮动
- 浮动元素后面元素会自动识别浮动元素，跟随其后
- 父元素不设置高度，子元素设置浮动后，父元素会发生高度塌陷，子元素会一起浮动起来
- 浮动元素经常被用来做网页布局，因为可以使用浮动来实现网页布局，有灵活性

- 清除浮动：
  - 父元素设置高度
  - 最后一个浮动元素后面添加一个空的div，并添加css样式clear:both
  - 包含浮动元素的父元素添加一个class，然后给该class添加一个:after伪元素
  - 包含浮动元素的父元素添加一个overflow:hidden


## 清除浮动的几种方式，各自的优缺点

- 父级div定义height
  - 优点：简单、代码少、容易掌握
  - 缺点：只适合高度固定的布局，要给出精确的高度，如果高度和父级div不一样时，会产生问题
  - 建议：不推荐使用，只建议高度固定的布局时使用

- 结尾处加空div标签clear:both
  - 优点：简单、代码少、容易掌握
  - 缺点：不少初学者不理解原理；如果页面浮动模块很多，每个地方都要添加。
  - 建议：不推荐使用，只推荐高度固定的布局时使用

- 父级div定义伪类:after 和 zoom
  - 优点：浏览器兼容性好，不容易出现怪问题
  - 缺点：代码多、不少初学者不理解原理
  - 建议：推荐使用，建议定义公共类，以减少CSS代码。

- 父级div定义overflow:hidden
  - 优点：简单、代码少、浏览器支持好
  - 缺点：不能和position配合使用，因为超出的尺寸会被隐藏。
  - 建议：不推荐使用，如果你需要定位的话，还是应该使用相对或绝对定位方法。

- 父级div也一起浮动
  - 优点：简单、代码少、浏览器支持好
  - 缺点：会产生新的浮动问题。
  - 建议：不推荐使用，只适合特殊情况下使用

- 父级div定义display:table
  - 优点：简单、代码少、浏览器支持好
  - 缺点：会产生新的未知问题
  - 建议：不推荐使用，只适合特殊情况下使用


## 为什么在浮动元素后面添加一个空的div，并给该元素添加clear:both可以清除浮动？

- 清除浮动是为了清除使用浮动元素产生的影响。浮动的元素，高度会塌陷，而高度的塌陷，会使后面的元素位置发生变化，所以必须清除浮动，让后面的元素 position 属性生效
- 浮动元素脱离文档流，使用clear属性来清除浮动，这样不会对后面的元素产生影响
- 清除浮动之后，会形成一个块级格式化上下文，在这个块级格式化上下文中，里面的浮动元素不会影响外部的布局


## ::before 和 :after 中双冒号和单冒号有什么区别？解释一下这2个伪元素的作用。

- 单冒号(:)用于CSS3伪类，双冒号(::)用于CSS3伪元素。
- 单冒号是为向后兼容而存在的，而双冒号是为了未来可能出现的CSS3扩展所保留。
- 目前，除了IE8及更早的版本外，双冒号在所有主流浏览器中都可以支持。
- 伪类用于当已有元素处于的某个状态时，为其添加对应的样式，这个状态是根据用户行为而动态变化的。比如说，当用户悬停在指定的元素时，我们可以通过:hover来描述这个元素的状态。
- 伪元素用于创建一些不在文档树中的元素，并为其添加样式。比如说，我们可以通过:before来在一个元素前增加一些内容，并为这些内容添加样式。不过，目前浏览器对它们的支持不是太理想，所以需要添加浏览器前缀。

## 什么是伪元素，什么是伪类
- 伪元素用于创建一些不在文档树中的元素，并为其添加样式。比如说，我们可以通过:before来在一个元素前增加一些内容，并为这些内容添加样式。
- 伪类用于当已有元素处于的某个状态时，为其添加对应的样式，这个状态是根据用户行为而动态变化的。比如说，当用户悬停在指定的元素时，我们可以通过:hover来描述这个元素的状态。