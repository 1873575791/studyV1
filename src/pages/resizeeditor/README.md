# ResizeEditor 元素调整编辑器

## 功能概述

ResizeEditor 是一个支持元素拖拽、缩放、旋转的编辑器组件，提供了完整的元素变换交互能力。

## 核心功能

| 功能 | 操作方式 | 说明 |
|------|----------|------|
| 移动 | 直接拖拽元素 | 移动元素位置 |
| 缩放 | 拖拽控制点 | 8个控制点支持不同方向的缩放 |
| 旋转 | 拖拽四角外侧区域 | 支持90度吸附 |

---

## 坐标系统

### 两种坐标系

```
┌─────────────────────────────────────────────────────┐
│                    画布坐标系                        │
│  ┌─────────────────────────────────────────────┐   │
│  │              元素本地坐标系                   │   │
│  │                                              │   │
│  │    tl -------- tm -------- tr               │   │
│  │     |                     |                 │   │
│  │    ml       center       mr                │   │
│  │     |                     |                 │   │
│  │    bl -------- bm -------- br               │   │
│  │                                              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- **画布坐标系**：元素在页面上的实际位置，原点在画布左上角
- **本地坐标系**：元素自身的坐标系，原点在元素中心，随元素旋转

### 坐标转换公式

```typescript
// 本地坐标 → 画布坐标（正向旋转）
const canvasX = centerX + localX * cos(rad) - localY * sin(rad);
const canvasY = centerY + localX * sin(rad) + localY * cos(rad);

// 画布坐标 → 本地坐标（反向旋转）
const localX = dx * cos(rad) + dy * sin(rad);
const localY = -dx * sin(rad) + dy * cos(rad);
```

---

## 控制点布局

### 8个控制点

```
    tl -------- tm -------- tr
     |                     |
    ml       center       mr
     |                     |
    bl -------- bm -------- br
```

| 控制点 | 名称 | 位置 | 功能 |
|--------|------|------|------|
| tl | 左上角 | (0, 0) | 缩放 + 旋转 |
| tr | 右上角 | (width, 0) | 缩放 + 旋转 |
| bl | 左下角 | (0, height) | 缩放 + 旋转 |
| br | 右下角 | (width, height) | 缩放 + 旋转 |
| tm | 上中 | (width/2, 0) | 仅缩放 |
| bm | 下中 | (width/2, height) | 仅缩放 |
| ml | 左中 | (0, height/2) | 仅缩放 |
| mr | 右中 | (width, height/2) | 仅缩放 |

### 控制点定位样式

```typescript
const getHandleStyle = (handle: HandleType): React.CSSProperties => {
  const positions = {
    tl: { left: 0, top: 0, transform: 'translate(-50%, -50%)' },
    tr: { right: 0, top: 0, transform: 'translate(50%, -50%)' },
    bl: { left: 0, bottom: 0, transform: 'translate(-50%, 50%)' },
    br: { right: 0, bottom: 0, transform: 'translate(50%, 50%)' },
    tm: { left: '50%', top: 0, transform: 'translate(-50%, -50%)' },
    bm: { left: '50%', bottom: 0, transform: 'translate(-50%, 50%)' },
    ml: { left: 0, top: '50%', transform: 'translate(-50%, -50%)' },
    mr: { right: 0, top: '50%', transform: 'translate(50%, -50%)' },
  };
  return positions[handle];
};
```

---

## 锚点机制

### 锚点定义

拖拽某个控制点时，**对角点或对边中点**作为固定锚点，保持不动。

| 拖拽点 | 锚点 | 变化方向 |
|--------|------|----------|
| tl (左上) | br (右下) | 宽高双向 |
| tr (右上) | bl (左下) | 宽高双向 |
| bl (左下) | tr (右上) | 宽高双向 |
| br (右下) | tl (左上) | 宽高双向 |
| tm (上中) | bm (下中) | 仅高度 |
| bm (下中) | tm (上中) | 仅高度 |
| ml (左中) | mr (右中) | 仅宽度 |
| mr (右中) | ml (左中) | 仅宽度 |

### 锚点固定原理

```typescript
// 1. 在开始拖拽时计算锚点位置
const anchorHandle = getAnchorHandle(handle);
const anchorPos = getHandleAbsolutePosition(element, anchorHandle);

// 2. 存储锚点位置，拖拽过程中不再变化
resizeStartRef.current = {
  anchorPos,
  // ...
};

// 3. 计算新尺寸时，锚点作为参考点
const dx = mouseX - anchorPos.x;
const dy = mouseY - anchorPos.y;
```

---

## 缩放逻辑

### 四角缩放

```
        鼠标位置
            ●
            │
      ┌─────┼─────┐
      │     │     │
      │     │     │
      └─────●─────┘
            │
        锚点位置（固定）
```

- 新中心点 = (锚点 + 鼠标) / 2
- 新宽度 = |本地坐标dx|
- 新高度 = |本地坐标dy|

```typescript
if (isCorner) {
  newWidth = Math.abs(localDx);
  newHeight = Math.abs(localDy);
  newCenterX = (anchorPos.x + mouseX) / 2;
  newCenterY = (anchorPos.y + mouseY) / 2;
}
```

### 边中点缩放

限制只能沿一个方向移动：

```typescript
// 上下边中点：只允许Y轴移动
if (activeHandle === 'tm' || activeHandle === 'bm') {
  newWidth = startElement.width;  // 宽度不变
  newHeight = Math.abs(localDy);  // 高度变化
  
  // 中心点偏移：本地X=0，Y=localDy/2
  const localCenterOffsetX = 0;
  const localCenterOffsetY = localDy / 2;
  
  // 转换回画布坐标
  newCenterX = anchorPos.x + localCenterOffsetX * cos - localCenterOffsetY * sin;
  newCenterY = anchorPos.y + localCenterOffsetX * sin + localCenterOffsetY * cos;
}

// 左右边中点：只允许X轴移动
else {
  newWidth = Math.abs(localDx);      // 宽度变化
  newHeight = startElement.height;   // 高度不变
  
  // 中心点偏移：本地X=localDx/2，Y=0
  const localCenterOffsetX = localDx / 2;
  const localCenterOffsetY = 0;
  
  // 转换回画布坐标
  newCenterX = anchorPos.x + localCenterOffsetX * cos - localCenterOffsetY * sin;
  newCenterY = anchorPos.y + localCenterOffsetX * sin + localCenterOffsetY * cos;
}
```

---

## 旋转逻辑

### 旋转区域

四角控制点外侧有旋转区域（虚线圆圈），点击该区域触发旋转模式。

```
    ┌───────────────┐
    │    旋转区域    │
    │   ┌─────┐     │
    │   │ ●   │ ←───┼── 控制点（缩放）
    │   └─────┘     │
    │   (虚线圆圈)   │
    └───────────────┘
```

### 旋转计算

```typescript
// 1. 计算鼠标相对于元素中心的角度
const currentAngle = Math.atan2(mouseY - centerY, mouseX - centerX);

// 2. 计算角度差值
const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);

// 3. 新角度 = 初始角度 + 差值
let newRotate = startRotate + angleDiff;
```

### 旋转吸附

```typescript
// 吸附角度：0°、90°、180°、270°
const snapAngles = [0, 90, 180, 270, 360, -90, -180, -270, -360];
const snapThreshold = 5; // 5度阈值

for (const snapAngle of snapAngles) {
  if (Math.abs(newRotate - snapAngle) < snapThreshold) {
    newRotate = snapAngle;  // 吸附到最近的角度
    break;
  }
}

// 标准化到 -180° ~ 180°
if (newRotate > 180) newRotate -= 360;
else if (newRotate < -180) newRotate += 360;
```

---

## 事件处理流程

### 状态机

```
                    ┌──────────────┐
                    │   idle       │
                    │   (空闲)     │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  dragging    │ │  resizing    │ │  rotating    │
    │  (拖拽中)    │ │  (缩放中)    │ │  (旋转中)    │
    └──────────────┘ └──────────────┘ └──────────────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   mouseup    │
                    │   (释放)     │
                    └──────────────┘
```

### 事件绑定

```typescript
useEffect(() => {
  if (isDragging || isResizing || isRotating) {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }
}, [isDragging, isResizing, isRotating]);
```

---

## 数据结构

### 元素状态

```typescript
interface ElementState {
  id: string;           // 唯一标识
  x: number;            // 左上角X坐标
  y: number;            // 左上角Y坐标
  width: number;        // 宽度
  height: number;       // 高度
  rotate: number;       // 旋转角度（度）
  backgroundColor: string;  // 背景颜色
}
```

### 拖拽状态引用

```typescript
// 元素拖拽
const dragStartRef = useRef({
  x: 0,          // 鼠标起始X
  y: 0,          // 鼠标起始Y
  elementX: 0,   // 元素起始X
  elementY: 0,   // 元素起始Y
});

// 缩放
const resizeStartRef = useRef({
  x: 0,              // 鼠标起始X
  y: 0,              // 鼠标起始Y
  element: {},       // 元素初始状态
  handle: '',        // 当前控制点
  anchorPos: { x: 0, y: 0 },  // 锚点位置
});

// 旋转
const rotateStartRef = useRef({
  centerX: 0,       // 元素中心X
  centerY: 0,       // 元素中心Y
  startAngle: 0,    // 起始角度（弧度）
  startRotate: 0,   // 起始旋转角度
});

// 容器偏移量（用于坐标转换）
const containerOffsetRef = useRef({
  left: 0,
  top: 0,
});
```

---

## 关键实现细节

### 1. 阻止事件冒泡

```typescript
e.preventDefault();
e.stopPropagation();
```

防止控制点事件触发元素拖拽事件。

### 2. 容器坐标转换

```typescript
// 记录容器偏移量
const rect = containerRef.current.getBoundingClientRect();
containerOffsetRef.current = { left: rect.left, top: rect.top };

// 将视口坐标转为容器坐标
const mouseX = e.clientX - containerOffsetRef.current.left;
const mouseY = e.clientY - containerOffsetRef.current.top;
```

### 3. 最小尺寸限制

```typescript
if (newWidth >= 30 && newHeight >= 30) {
  // 更新元素状态
}
```

---

## UI 布局结构

```tsx
<div className="canvas">
  {elements.map(element => (
    <div className="element">
      {isSelected && handles.map(handle => (
        <>
          {/* 旋转区域（仅四角） */}
          {isCorner && <div className="rotateZone" />}
          {/* 控制点 */}
          <div className="handle" />
        </>
      ))}
    </div>
  ))}
</div>
```

---

## 总结

ResizeEditor 的核心原理：

1. **双坐标系**：画布坐标系 + 元素本地坐标系，通过旋转矩阵转换
2. **锚点机制**：拖拽时固定对角点，保证变换的可预测性
3. **事件分离**：旋转区域和控制点使用独立的处理函数，避免事件冲突
4. **吸附反馈**：旋转时提供90度吸附，提升用户体验
