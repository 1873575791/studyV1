import React, { useEffect, useRef, useState } from 'react';
import {
  App,
  Rect,
  DragEvent,
  PointerEvent,
  Ellipse,
  Group,
  Pen,
  ZoomEvent,
  Frame,
  Box,
} from 'leafer-ui';
import '@leafer-in/editor';
import '@leafer-in/export';
import './index.less';
const Index = () => {
  const appLeafer = useRef(null);
  const frameLeafer = useRef(null);
  const boxLeafer = useRef(null);
  const imageLeafer = useRef(null);
  const historyData = useRef({
    history: [],
    index: -1,
  });
  const data = [
    { text: '框选', key: 'box' },
    { text: '画笔', key: 'pen' },
    { text: '擦除', key: 'erase' },
    { text: '移动', key: 'move' },
  ];
  const [opacity, setOpacity] = useState('');
  const [range, setRange] = useState(50);
  const [cover, setCover] = useState(undefined);

  const handleBox = () => {
    let rect;
    let oneInfo = null;
    frameLeafer.current.on(DragEvent.START, (e) => {
      const center = { x: e.x, y: e.y };
      const innerPoint = frameLeafer.current.getInnerPoint(center);
      oneInfo = { x: innerPoint.x, y: innerPoint.y };
      rect = new Rect({
        editable: true,
        fill: '#32cd79',
        tag: 'rect',
        x: innerPoint.x,
        y: innerPoint.y,
      });
      boxLeafer.current.add(rect);
    });
    frameLeafer.current.on(DragEvent.DRAG, (e) => {
      const center = { x: e.x, y: e.y };
      const pageInfo = e.getPageBounds();
      const innerPoint = frameLeafer.current.getInnerPoint(center);
      let info = {
        x: oneInfo.x,
        y: oneInfo.y,
        width: pageInfo.width,
        height: pageInfo.height,
      };
      if (innerPoint.x < oneInfo.x) {
        info = { ...info, x: innerPoint.x };
      }
      if (innerPoint.y < oneInfo.y) {
        info = { ...info, y: innerPoint.y };
      }
      if (rect) rect.set(info);
    });
    frameLeafer.current.on(DragEvent.END, (e) => {
      const historyInfo = {
        box: JSON.stringify(boxLeafer.current.children),
      };
      historyData.current.history = [
        ...historyData.current.history,
        historyInfo,
      ];
      historyData.current.index += 1;
    });
  };

  const handlePen = () => {
    // appLeafer.current.tree.hitChildren = false;
    appLeafer.current.editor.visible = false;
    const pen = new Pen();
    boxLeafer.current.add(pen);

    // 按下鼠标拖动开始画线，抬起结束，当缩放平移视图后，仍然可以准确绘制新的线条
    frameLeafer.current.on(DragEvent.START, (e) => {
      const center = { x: e.x, y: e.y };
      const innerPoint = frameLeafer.current.getInnerPoint(center);
      pen.setStyle({
        stroke: '#32cd79',
        strokeWidth: 10,
        strokeCap: 'round',
        strokeJoin: 'round',
      });
      pen.moveTo(innerPoint.x, innerPoint.y);
    });

    frameLeafer.current.on(DragEvent.DRAG, (e) => {
      const center = { x: e.x, y: e.y };
      const innerPoint = frameLeafer.current.getInnerPoint(center);
      pen.lineTo(innerPoint.x, innerPoint.y);
      // pen.blendMode = 'source-over'
    });
  };

  const initMaskBox = (frame, size) => {
    const { width, height } = size;
    const box = new Box({ width, height });
    box.name = 'maskBox';
    const group = new Group({ x: 0, y: 0, opacity: 0.5 });
    group.name = 'maskGroup';
    group.add(box);
    frame.add(group);
    return box;
  };

  const historyMaskBox = (frame, size, boxInfo) => {
    console.log(boxInfo);
    const { width, height } = size;
    const box = new Box({ width, height });
    box.name = 'maskBox';
    box.add(boxInfo);
    const group = new Group({ x: 0, y: 0, opacity: 0.5 });
    group.name = 'maskGroup';
    group.add(box);
    frame.add(group);
    return box;
  };

  const createFactory = (strokeWidth) => {
    const pen = new Pen({
      name: 'brush',
      hitChildren: false,
      editable: false,
      eraser: true,
    });

    pen.setStyle({
      stroke: '#ffffff',
      strokeWidth: strokeWidth,
      strokeCap: 'round',
      strokeJoin: 'round',
    });

    return pen;
  };

  const handleErase = () => {
    frameLeafer.current.cursor = 'none';
    let toolRef = null;
    let ellipse = null;
    appLeafer.current.on(PointerEvent.ENTER, (event) => {
      if (!ellipse) {
        ellipse = new Ellipse({
          width: 20,
          height: 20,
          fill: '#ffffff',
          zIndex: 2,
        });
      }
      const center = { x: event.x, y: event.y };
      const innerPoint = frameLeafer.current.getInnerPoint(center);
      boxLeafer.current.add(ellipse);
      ellipse.set({
        x: innerPoint.x - ellipse.width / 2,
        y: innerPoint.y - ellipse.height / 2,
      });
    });
    appLeafer.current.on(PointerEvent.MOVE, (event) => {
      if (!ellipse) return;
      const center = { x: event.x, y: event.y };
      const innerPoint = frameLeafer.current.getInnerPoint(center);
      ellipse.set({
        x: innerPoint.x - ellipse.width / 2,
        y: innerPoint.y - ellipse.height / 2,
      });
    });

    appLeafer.current.on(PointerEvent.LEAVE, (event) => {
      if (!ellipse) return;
      ellipse.remove();
      ellipse = null;
    });

    frameLeafer.current.on(PointerEvent.DOWN, (event) => {
      if (!event.left) return;
      toolRef = createFactory(20);
      boxLeafer.current.add(toolRef);
      const center = { x: event.x, y: event.y };
      const innerPoint = frameLeafer.current.getInnerPoint(center);
      toolRef.moveTo(innerPoint.x, innerPoint.y);
    });

    frameLeafer.current.on(PointerEvent.MOVE, (event) => {
      if (!event.left) return;
      const center = { x: event.x, y: event.y };
      const innerPoint = frameLeafer.current.getInnerPoint(center);
      toolRef.lineTo(innerPoint.x, innerPoint.y);
    });

    frameLeafer.current.on(PointerEvent.UP, (event) => {
      toolRef = null;
    });
  };

  const handleMove = () => {
    frameLeafer.current.draggable = true;
    frameLeafer.current.cursor = 'move';
    frameLeafer.current.on(DragEvent.START, (event) => {
      const center = { x: event.x, y: event.y };
      // frameLeafer.current.innerToWorld(center);
    });
    frameLeafer.current.on(DragEvent.DRAG, (event) => {
      const center = { x: event.x, y: event.y };
      // frameLeafer.current.set(center);
    });
    frameLeafer.current.on(DragEvent.END, (event) => {
      const center = { x: event.x, y: event.y };
      // frameLeafer.current.innerToWorld(center);
    });
  };

  const handleBack = () => {
    if (historyData.current.index - 1 < 0) return;
    historyData.current.index -= 1;
    frameLeafer.current.destroy();
    _init(
      appLeafer.current,
      historyData.current.history[historyData.current.index],
    );
    setOpacity('');
  };

  const handleNext = () => {
    if (historyData.current.index + 1 > historyData.current.history.length - 1)
      return;
    historyData.current.index += 1;
    frameLeafer.current.destroy();
    _init(
      appLeafer.current,
      historyData.current.history[historyData.current.index],
    );
    setOpacity('');
  };

  const handleDestroy = () => {
    frameLeafer.current.destroy();
    _init(appLeafer.current, null);
    setOpacity('');
  };

  useEffect(() => {
    if (appLeafer.current && frameLeafer.current && boxLeafer.current) {
      frameLeafer.current.draggable = false;
      frameLeafer.current.cursor = 'auto';
      if (opacity === 'box') {
        handleBox(opacity);
      } else if (opacity === 'pen') {
        handlePen(opacity);
      } else if (opacity === 'erase') {
        handleErase(opacity);
      } else if (opacity === 'move') {
        handleMove();
      }
    }
    return () => {
      if (appLeafer.current && frameLeafer.current) {
        frameLeafer.current.off(DragEvent.START);
        frameLeafer.current.off(DragEvent.DRAG);
        frameLeafer.current.off(DragEvent.END);
        frameLeafer.current.off(PointerEvent.DOWN);
        frameLeafer.current.off(PointerEvent.MOVE);
        frameLeafer.current.off(PointerEvent.UP);
        frameLeafer.current.off(PointerEvent.ENTER);
        frameLeafer.current.off(PointerEvent.LEAVE);
        appLeafer.current.off(PointerEvent.ENTER);
        appLeafer.current.off(PointerEvent.MOVE);
        appLeafer.current.off(PointerEvent.LEAVE);
      }
    };
  }, [opacity]);

  const _init = (app, history) => {
    const fra = new Frame({
      width: 500,
      height: 500,
      fill: '#333',
      overflow: 'show',
    });
    const image = new Rect({
      width: 500,
      height: 500,
      fill: {
        type: 'image',
        url: 'https://anim-res.youku.com/yk/ai-material/uploads/aigc/cover_image/15:46:59_660b663c_1.png?x-oss-process=image/resize,w_600/format,avif',
        mode: 'fit',
        align: 'center',
      },
      editable: false,
    });
    fra.add(image);
    let box = null;
    if (history) {
      box = historyMaskBox(
        fra,
        { width: 500, height: 500 },
        JSON.parse(history.box),
      );
    } else {
      box = initMaskBox(fra, { width: 500, height: 500 });
    }
    app.tree.add(fra);
    app.editor.visible = false;
    fra.hitChildren = false;
    appLeafer.current = app;
    frameLeafer.current = fra;
    boxLeafer.current = box;
    imageLeafer.current = image;
    fra.on(ZoomEvent.ZOOM, function (event) {
      // const center = { x: event.x, y: event.y };
      // LeafHelper.zoomOfWorld(fra, center, event.scale);
    });
  };

  useEffect(() => {
    let app = new App({
      view: 'new-leafer', // view 参数支持设置 window 对象
      width: 0, // 不能设置为 0， 否则会变成自动布局
      height: 0,
      fill: '#333',
      editor: {
        hideOnMove: false,
      },
      tree: {
        type: 'viewport',
        zoom: {
          min: 0.02,
          max: 2,
        },
      },
    });
    _init(app);
    return () => {
      app?.destroy();
    };
  }, []);

  return (
    <div className="new-app">
      <div id="new-leafer" className="new-leafer" />
      <div className="new-leafer-tool">
        {data.map((it) => (
          <span
            onClick={() => setOpacity(it.key)}
            key={it.key}
            className={`new-leafer-tool-item ${
              it.key === opacity ? 'active' : ''
            }`}
          >
            {it.text}
          </span>
        ))}
      </div>
      <button onClick={handleBack}>上一步</button>
      <button onClick={handleNext}>下一步</button>
      <button onClick={handleDestroy}>撤销</button>
      <input
        type="range"
        min={0.2}
        max={100}
        value={range}
        onChange={(e) => {
          if (e.target.value / 50 < 0.2) return;
          const scale = e.target.value / 50;
          // frameLeafer.current.set({ scale: e.target.value / 50 });
          imageLeafer.current.scaleOf(
            'center',
            scale / imageLeafer.current.scale,
          );
          console.log(imageLeafer.current);
          setRange(e.target.value);
        }}
      />
      <button
        onClick={() => {
          frameLeafer.current
            .export('png', { scale: 0.2, blob: true, pixelRatio: 5 })
            .then((result) => {
              var url = URL.createObjectURL(result.data);
              console.log(result);
              setCover(url);
            });
        }}
      >
        导出
      </button>
      <img width={500} height={500} src={cover} alt="" />
    </div>
  );
};

export default Index;
