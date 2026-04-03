import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './index.less';

interface MaskState {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  color: string;
}

interface ImageInfo {
  url: string;
  width: number;
  height: number;
  file: File | null;
}

const ImageMaskEditor: React.FC = () => {
  const [image, setImage] = useState<ImageInfo>({
    url: '',
    width: 0,
    height: 0,
    file: null,
  });

  const [mask, setMask] = useState<MaskState>({
    x: 100,
    y: 100,
    width: 150,
    height: 100,
    rotate: 0,
    color: 'rgba(255, 0, 0, 0.5)',
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dragStartRef = useRef({ x: 0, y: 0, maskX: 0, maskY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, mask: {} as MaskState });
  const rotateStartRef = useRef({
    centerX: 0,
    centerY: 0,
    startAngle: 0,
    startRotate: 0,
  });

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage({
          url: event.target?.result as string,
          width: img.width,
          height: img.height,
          file: file,
        });
        // 重置蒙版位置
        setMask({
          x: img.width / 2 - 75,
          y: img.height / 2 - 50,
          width: 150,
          height: 100,
          rotate: 0,
          color: 'rgba(255, 0, 0, 0.5)',
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 获取控制点位置
  const getHandlePosition = (position: string) => {
    const { x, y, width, height, rotate } = mask;
    const rad = (rotate * Math.PI) / 180;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    let hx = 0,
      hy = 0;
    switch (position) {
      case 'tl':
        hx = x;
        hy = y;
        break;
      case 'tr':
        hx = x + width;
        hy = y;
        break;
      case 'bl':
        hx = x;
        hy = y + height;
        break;
      case 'br':
        hx = x + width;
        hy = y + height;
        break;
      case 'ml':
        hx = x;
        hy = y + height / 2;
        break;
      case 'mr':
        hx = x + width;
        hy = y + height / 2;
        break;
    }

    // 应用旋转
    const rotatedX =
      centerX + (hx - centerX) * Math.cos(rad) - (hy - centerY) * Math.sin(rad);
    const rotatedY =
      centerY + (hx - centerX) * Math.sin(rad) + (hy - centerY) * Math.cos(rad);

    return { x: rotatedX, y: rotatedY };
  };

  // 开始拖拽蒙版
  const handleMaskMouseDown = (e: React.MouseEvent) => {
    if (!image.url) return;
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      maskX: mask.x,
      maskY: mask.y,
    };
  };

  // 开始调整大小
  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    if (!image.url) return;
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setActiveHandle(handle);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      mask: { ...mask },
    };
  };

  // 开始旋转
  const handleRotateMouseDown = (e: React.MouseEvent, handle: string) => {
    if (!image.url) return;
    e.preventDefault();
    e.stopPropagation();

    const centerX = mask.x + mask.width / 2;
    const centerY = mask.y + mask.height / 2;

    setIsRotating(true);
    setActiveHandle(handle);
    rotateStartRef.current = {
      centerX,
      centerY,
      startAngle: Math.atan2(e.clientY - centerY, e.clientX - centerX),
      startRotate: mask.rotate,
    };
  };

  // 鼠标移动
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        setMask((prev) => ({
          ...prev,
          x: dragStartRef.current.maskX + deltaX,
          y: dragStartRef.current.maskY + deltaY,
        }));
      }

      if (isResizing && activeHandle) {
        const startMask = resizeStartRef.current.mask;
        const deltaX = e.clientX - resizeStartRef.current.x;
        const deltaY = e.clientY - resizeStartRef.current.y;

        let newX = startMask.x;
        let newY = startMask.y;
        let newWidth = startMask.width;
        let newHeight = startMask.height;

        switch (activeHandle) {
          case 'tl':
            newX = startMask.x + deltaX;
            newY = startMask.y + deltaY;
            newWidth = startMask.width - deltaX;
            newHeight = startMask.height - deltaY;
            break;
          case 'tr':
            newY = startMask.y + deltaY;
            newWidth = startMask.width + deltaX;
            newHeight = startMask.height - deltaY;
            break;
          case 'bl':
            newX = startMask.x + deltaX;
            newWidth = startMask.width - deltaX;
            newHeight = startMask.height + deltaY;
            break;
          case 'br':
            newWidth = startMask.width + deltaX;
            newHeight = startMask.height + deltaY;
            break;
          case 'ml':
            newX = startMask.x + deltaX;
            newWidth = startMask.width - deltaX;
            break;
          case 'mr':
            newWidth = startMask.width + deltaX;
            break;
        }

        // 最小尺寸限制
        if (newWidth >= 20 && newHeight >= 20) {
          setMask((prev) => ({
            ...prev,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          }));
        }
      }

      if (isRotating) {
        const { centerX, centerY, startAngle, startRotate } =
          rotateStartRef.current;
        const currentAngle = Math.atan2(
          e.clientY - centerY,
          e.clientX - centerX,
        );
        const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
        setMask((prev) => ({
          ...prev,
          rotate: startRotate + angleDiff,
        }));
      }
    },
    [isDragging, isResizing, isRotating, activeHandle],
  );

  // 鼠标释放
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setActiveHandle('');
  }, []);

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

  // 导出合并图片
  const handleExport = () => {
    if (!image.url || !image.file) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas尺寸为原图尺寸
    canvas.width = image.width;
    canvas.height = image.height;

    // 绘制原图
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, image.width, image.height);

      // 绘制蒙版
      ctx.save();
      ctx.translate(mask.x + mask.width / 2, mask.y + mask.height / 2);
      ctx.rotate((mask.rotate * Math.PI) / 180);
      ctx.fillStyle = mask.color;
      ctx.fillRect(-mask.width / 2, -mask.height / 2, mask.width, mask.height);
      ctx.restore();

      // 导出图片
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `masked_${image.file?.name || 'image.png'}`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = image.url;
  };

  // 颜色选择
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMask((prev) => ({ ...prev, color: e.target.value }));
  };

  // 透明度调整
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const opacity = parseFloat(e.target.value);
    const hex =
      mask.color.replace(/rgba?\([^)]+\)/, '').match(/#[0-9a-fA-F]{6}/)?.[0] ||
      '#ff0000';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    setMask((prev) => ({
      ...prev,
      color: `rgba(${r}, ${g}, ${b}, ${opacity})`,
    }));
  };

  // 计算显示比例
  const getDisplayScale = () => {
    if (!image.width || !containerRef.current) return 1;
    const containerWidth = containerRef.current.clientWidth - 40;
    const containerHeight = 600;
    const scaleX = containerWidth / image.width;
    const scaleY = containerHeight / image.height;
    return Math.min(scaleX, scaleY, 1);
  };

  const scale = getDisplayScale();

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '#fff',
    border: '2px solid #1890ff',
    cursor: 'pointer',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  const rotateHandleStyle: React.CSSProperties = {
    ...handleStyle,
    background: '#1890ff',
    cursor: 'grab',
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>图片蒙版编辑器</h2>

      <div className={styles.toolbar}>
        <label className={styles.uploadBtn}>
          上传图片
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            hidden
          />
        </label>

        {image.url && (
          <>
            <div className={styles.colorPicker}>
              <label>颜色：</label>
              <input
                type="color"
                defaultValue="#ff0000"
                onChange={handleColorChange}
              />
            </div>
            <div className={styles.opacitySlider}>
              <label>透明度：</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.5"
                onChange={handleOpacityChange}
              />
            </div>
            <button className={styles.exportBtn} onClick={handleExport}>
              导出合并图片
            </button>
          </>
        )}
      </div>

      <div className={styles.editorArea} ref={containerRef}>
        {!image.url ? (
          <div className={styles.placeholder}>
            <p>请上传一张图片开始编辑</p>
          </div>
        ) : (
          <div
            className={styles.imageWrapper}
            style={{
              width: image.width * scale,
              height: image.height * scale,
            }}
          >
            <img
              src={image.url}
              alt="编辑图片"
              className={styles.image}
              style={{
                width: image.width * scale,
                height: image.height * scale,
              }}
              draggable={false}
            />

            {/* 蒙版层 */}
            <div
              className={styles.mask}
              style={{
                left: mask.x * scale,
                top: mask.y * scale,
                width: mask.width * scale,
                height: mask.height * scale,
                transform: `rotate(${mask.rotate}deg)`,
                background: mask.color,
              }}
              onMouseDown={handleMaskMouseDown}
            />

            {/* 控制点 - 四个角（可旋转和缩放） */}
            {['tl', 'tr', 'bl', 'br'].map((pos) => {
              const { x, y } = getHandlePosition(pos);
              return (
                <div
                  key={pos}
                  style={{
                    ...rotateHandleStyle,
                    left: x * scale,
                    top: y * scale,
                  }}
                  onMouseDown={(e) => handleRotateMouseDown(e, pos)}
                  title="拖拽旋转"
                />
              );
            })}

            {/* 控制点 - 左右中点（仅缩放） */}
            {['ml', 'mr'].map((pos) => {
              const { x, y } = getHandlePosition(pos);
              return (
                <div
                  key={pos}
                  style={{
                    ...handleStyle,
                    left: x * scale,
                    top: y * scale,
                  }}
                  onMouseDown={(e) => handleResizeMouseDown(e, pos)}
                  title="拖拽调整大小"
                />
              );
            })}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {image.url && (
        <div className={styles.info}>
          <p>
            原图尺寸: {image.width} x {image.height} px
          </p>
          <p>
            蒙版位置: X: {Math.round(mask.x)}, Y: {Math.round(mask.y)}
          </p>
          <p>
            蒙版尺寸: {Math.round(mask.width)} x {Math.round(mask.height)} px
          </p>
          <p>旋转角度: {Math.round(mask.rotate)}°</p>
        </div>
      )}
    </div>
  );
};

export default ImageMaskEditor;
