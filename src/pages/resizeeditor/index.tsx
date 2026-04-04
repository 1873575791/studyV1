import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './index.less';

interface ElementState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  backgroundColor: string;
}

// 控制点类型
type HandleType = 'tl' | 'tr' | 'bl' | 'br' | 'tm' | 'bm' | 'ml' | 'mr';

const ResizeEditor: React.FC = () => {
  const [elements, setElements] = useState<ElementState[]>([
    {
      id: '1',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      rotate: 0,
      backgroundColor: '#1890ff',
    },
    {
      id: '2',
      x: 400,
      y: 200,
      width: 180,
      height: 120,
      rotate: 15,
      backgroundColor: '#52c41a',
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [activeHandle, setActiveHandle] = useState<HandleType | ''>('');

  const containerRef = useRef<HTMLDivElement>(null);

  // 拖拽状态引用
  const dragStartRef = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const resizeStartRef = useRef({
    x: 0,
    y: 0,
    element: {} as ElementState,
    handle: '' as HandleType,
    anchorPos: { x: 0, y: 0 },
  });
  const rotateStartRef = useRef({
    centerX: 0,
    centerY: 0,
    startAngle: 0,
    startRotate: 0,
  });

  // 容器偏移量
  const containerOffsetRef = useRef({ left: 0, top: 0 });

  const selectedElement = elements.find((el) => el.id === selectedId);

  // 获取控制点相对于元素的定位样式（不需要计算旋转，元素本身已旋转）
  const getHandleStyle = (handle: HandleType): React.CSSProperties => {
    const positions: Record<HandleType, React.CSSProperties> = {
      tl: { left: 0, top: 0, transform: 'translate(-50%, -50%)' },
      tr: { right: 0, top: 0, transform: 'translate(50%, -50%)', left: 'auto' },
      bl: {
        left: 0,
        bottom: 0,
        transform: 'translate(-50%, 50%)',
        top: 'auto',
      },
      br: {
        right: 0,
        bottom: 0,
        transform: 'translate(50%, 50%)',
        left: 'auto',
        top: 'auto',
      },
      tm: { left: '50%', top: 0, transform: 'translate(-50%, -50%)' },
      bm: {
        left: '50%',
        bottom: 0,
        transform: 'translate(-50%, 50%)',
        top: 'auto',
      },
      ml: { left: 0, top: '50%', transform: 'translate(-50%, -50%)' },
      mr: {
        right: 0,
        top: '50%',
        transform: 'translate(50%, -50%)',
        left: 'auto',
      },
    };
    return positions[handle];
  };

  // 获取控制点在画布上的绝对位置
  const getHandleAbsolutePosition = (
    element: ElementState,
    handle: HandleType,
  ): { x: number; y: number } => {
    const { x, y, width, height, rotate } = element;
    const rad = (rotate * Math.PI) / 180;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // 控制点相对于元素中心的本地坐标
    let localX = 0,
      localY = 0;
    switch (handle) {
      case 'tl':
        localX = -width / 2;
        localY = -height / 2;
        break;
      case 'tr':
        localX = width / 2;
        localY = -height / 2;
        break;
      case 'bl':
        localX = -width / 2;
        localY = height / 2;
        break;
      case 'br':
        localX = width / 2;
        localY = height / 2;
        break;
      case 'tm':
        localX = 0;
        localY = -height / 2;
        break;
      case 'bm':
        localX = 0;
        localY = height / 2;
        break;
      case 'ml':
        localX = -width / 2;
        localY = 0;
        break;
      case 'mr':
        localX = width / 2;
        localY = 0;
        break;
    }

    // 应用旋转得到画布坐标
    const rotatedX = centerX + localX * Math.cos(rad) - localY * Math.sin(rad);
    const rotatedY = centerY + localX * Math.sin(rad) + localY * Math.cos(rad);

    return { x: rotatedX, y: rotatedY };
  };

  // 获取锚点（固定的对角点或对边中心）
  const getAnchorHandle = (handle: HandleType): HandleType => {
    const anchorMap: Record<HandleType, HandleType> = {
      tl: 'br',
      tr: 'bl',
      bl: 'tr',
      br: 'tl',
      tm: 'bm',
      bm: 'tm',
      ml: 'mr',
      mr: 'ml',
    };
    return anchorMap[handle];
  };

  // 选中元素
  const handleElementClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
  };

  // 开始拖拽元素
  const handleElementMouseDown = (
    e: React.MouseEvent,
    element: ElementState,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedId(element.id);
    setIsDragging(true);

    // 记录容器偏移量
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerOffsetRef.current = { left: rect.left, top: rect.top };
    }

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: element.x,
      elementY: element.y,
    };
  };

  // 开始旋转（旋转区域点击）
  const handleRotateMouseDown = (e: React.MouseEvent, handle: HandleType) => {
    if (!selectedElement) return;
    e.preventDefault();
    e.stopPropagation();

    // 旋转模式
    setIsRotating(true);
    setActiveHandle(handle);

    // 记录容器偏移量
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerOffsetRef.current = { left: rect.left, top: rect.top };
    }

    const centerX = selectedElement.x + selectedElement.width / 2;
    const centerY = selectedElement.y + selectedElement.height / 2;

    // 将鼠标坐标转换为容器坐标系
    const mouseX = e.clientX - containerOffsetRef.current.left;
    const mouseY = e.clientY - containerOffsetRef.current.top;

    rotateStartRef.current = {
      centerX,
      centerY,
      startAngle: Math.atan2(mouseY - centerY, mouseX - centerX),
      startRotate: selectedElement.rotate,
    };
  };

  // 开始调整大小
  const handleResizeMouseDown = (e: React.MouseEvent, handle: HandleType) => {
    if (!selectedElement) return;
    e.preventDefault();
    e.stopPropagation();

    // 缩放模式
    setIsResizing(true);
    setActiveHandle(handle);

    // 记录容器偏移量
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerOffsetRef.current = { left: rect.left, top: rect.top };
    }

    // 计算并固定锚点位置
    const anchorHandle = getAnchorHandle(handle);
    const anchorPos = getHandleAbsolutePosition(selectedElement, anchorHandle);

    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      element: { ...selectedElement },
      handle,
      anchorPos,
    };
  };

  // 鼠标移动
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && selectedId) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        setElements((prev) =>
          prev.map((el) =>
            el.id === selectedId
              ? {
                  ...el,
                  x: dragStartRef.current.elementX + deltaX,
                  y: dragStartRef.current.elementY + deltaY,
                }
              : el,
          ),
        );
      }

      if (isResizing && selectedId && activeHandle) {
        const startElement = resizeStartRef.current.element;
        const rad = (startElement.rotate * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // 使用固定的锚点位置（在开始拖拽时就计算好了）
        const anchorPos = resizeStartRef.current.anchorPos;

        // 将鼠标坐标转换为容器坐标系
        const mouseX = e.clientX - containerOffsetRef.current.left;
        const mouseY = e.clientY - containerOffsetRef.current.top;

        // 鼠标相对于锚点的向量
        const dx = mouseX - anchorPos.x;
        const dy = mouseY - anchorPos.y;

        // 将向量反向旋转到元素的本地坐标系
        const localDx = dx * cos + dy * sin;
        const localDy = -dx * sin + dy * cos;

        // 新的宽高（本地坐标系中的投影距离）
        let newWidth: number;
        let newHeight: number;
        // 新的中心点在画布坐标系中的位置
        let newCenterX: number;
        let newCenterY: number;

        // 元素原始中心点
        const originalCenterX = startElement.x + startElement.width / 2;
        const originalCenterY = startElement.y + startElement.height / 2;

        const isCorner = ['tl', 'tr', 'bl', 'br'].includes(activeHandle);

        if (isCorner) {
          // 四个角：宽高都可以变化，中心点是锚点和鼠标的中点
          newWidth = Math.abs(localDx);
          newHeight = Math.abs(localDy);
          newCenterX = (anchorPos.x + mouseX) / 2;
          newCenterY = (anchorPos.y + mouseY) / 2;
        } else {
          // 四条边的中点：限制只能沿一个方向移动
          if (activeHandle === 'tm' || activeHandle === 'bm') {
            // 上下边中点：只允许沿本地Y轴移动，本地X保持为0
            newWidth = startElement.width;
            newHeight = Math.abs(localDy);
            // 在本地坐标系中，新的中心点相对于锚点的偏移
            // X方向为0，Y方向为 localDy/2
            const localCenterOffsetX = 0;
            const localCenterOffsetY = localDy / 2;
            // 转换回画布坐标系
            newCenterX =
              anchorPos.x + localCenterOffsetX * cos - localCenterOffsetY * sin;
            newCenterY =
              anchorPos.y + localCenterOffsetX * sin + localCenterOffsetY * cos;
          } else {
            // 左右边中点：只允许沿本地X轴移动，本地Y保持为0
            newWidth = Math.abs(localDx);
            newHeight = startElement.height;
            // 在本地坐标系中，新的中心点相对于锚点的偏移
            // X方向为 localDx/2，Y方向为0
            const localCenterOffsetX = localDx / 2;
            const localCenterOffsetY = 0;
            // 转换回画布坐标系
            newCenterX =
              anchorPos.x + localCenterOffsetX * cos - localCenterOffsetY * sin;
            newCenterY =
              anchorPos.y + localCenterOffsetX * sin + localCenterOffsetY * cos;
          }
        }

        // 最小尺寸限制
        if (newWidth >= 30 && newHeight >= 30) {
          // 新的元素左上角位置
          const newX = newCenterX - newWidth / 2;
          const newY = newCenterY - newHeight / 2;

          setElements((prev) =>
            prev.map((el) =>
              el.id === selectedId
                ? {
                    ...el,
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight,
                  }
                : el,
            ),
          );
        }
      }

      if (isRotating && selectedId) {
        const { centerX, centerY, startAngle, startRotate } =
          rotateStartRef.current;
        // 使用容器坐标系
        const mouseX = e.clientX - containerOffsetRef.current.left;
        const mouseY = e.clientY - containerOffsetRef.current.top;
        const currentAngle = Math.atan2(mouseY - centerY, mouseX - centerX);
        let angleDiff = (currentAngle - startAngle) * (180 / Math.PI);

        let newRotate = startRotate + angleDiff;

        // 旋转吸附效果（每90度吸附）
        const snapAngles = [0, 90, 180, 270, 360, -90, -180, -270, -360];
        const snapThreshold = 5; // 吸附阈值，5度以内吸附

        // 标准化角度到 -360 到 360 范围
        for (const snapAngle of snapAngles) {
          if (Math.abs(newRotate - snapAngle) < snapThreshold) {
            newRotate = snapAngle;
            break;
          }
        }

        // 标准化到 -180 到 180
        if (newRotate > 180) {
          newRotate -= 360;
        } else if (newRotate < -180) {
          newRotate += 360;
        }

        setElements((prev) =>
          prev.map((el) =>
            el.id === selectedId ? { ...el, rotate: newRotate } : el,
          ),
        );
      }
    },
    [isDragging, isResizing, isRotating, selectedId, activeHandle],
  );

  // 鼠标释放
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setActiveHandle('');
  }, []);

  // 点击空白处取消选中
  const handleContainerClick = () => {
    setSelectedId(null);
  };

  // 添加新元素
  const addElement = () => {
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];
    const newElement: ElementState = {
      id: Date.now().toString(),
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 100 + Math.random() * 100,
      height: 80 + Math.random() * 80,
      rotate: 0,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedId(newElement.id);
  };

  // 删除选中元素
  const deleteSelected = () => {
    if (selectedId) {
      setElements((prev) => prev.filter((el) => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, isRotating, handleMouseMove, handleMouseUp]);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button className={styles.btn} onClick={addElement}>
          添加元素
        </button>
        <button
          className={`${styles.btn} ${styles.danger}`}
          onClick={deleteSelected}
          disabled={!selectedId}
        >
          删除选中
        </button>
        {selectedElement && (
          <div className={styles.info}>
            <span>宽: {Math.round(selectedElement.width)}px</span>
            <span>高: {Math.round(selectedElement.height)}px</span>
            <span>旋转: {Math.round(selectedElement.rotate)}°</span>
          </div>
        )}
      </div>

      <div className={styles.hint}>
        提示：拖拽元素移动位置 | 拖拽圆点调整大小 |
        拖拽四角外侧区域旋转（吸附角度：0°、90°、180°、270°）
      </div>

      <div
        ref={containerRef}
        className={styles.canvas}
        onClick={handleContainerClick}
      >
        {elements.map((element) => {
          const isSelected = element.id === selectedId;
          const handles: HandleType[] = [
            'tl',
            'tr',
            'bl',
            'br',
            'tm',
            'bm',
            'ml',
            'mr',
          ];

          return (
            <div
              key={element.id}
              className={`${styles.element} ${
                isSelected ? styles.selected : ''
              }`}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                backgroundColor: element.backgroundColor,
                transform: `rotate(${element.rotate}deg)`,
              }}
              onMouseDown={(e) => handleElementMouseDown(e, element)}
              onClick={(e) => handleElementClick(e, element.id)}
            >
              {isSelected && (
                <>
                  {/* 8个控制点 */}
                  {handles.map((handle) => {
                    const isCorner = ['tl', 'tr', 'bl', 'br'].includes(handle);
                    const handleStyle = getHandleStyle(handle);

                    return (
                      <React.Fragment key={handle}>
                        {/* 角落旋转区域指示器 */}
                        {isCorner && (
                          <div
                            className={styles.rotateZone}
                            style={{
                              ...handleStyle,
                              width: 28,
                              height: 28,
                            }}
                            onMouseDown={(e) =>
                              handleRotateMouseDown(e, handle)
                            }
                            title="拖拽旋转"
                          />
                        )}
                        {/* 控制点 */}
                        <div
                          className={`${styles.handle} ${
                            isCorner ? styles.corner : styles.edge
                          }`}
                          style={{
                            ...handleStyle,
                            cursor: isCorner ? 'nwse-resize' : 'ns-resize',
                          }}
                          onMouseDown={(e) => handleResizeMouseDown(e, handle)}
                          title="拖拽调整大小"
                        />
                      </React.Fragment>
                    );
                  })}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResizeEditor;
