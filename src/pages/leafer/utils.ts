import {
  App,
  Box,
  DragEvent,
  Ellipse,
  Frame,
  Group,
  IUIJSONData,
  MoveEvent,
  Pen,
  PointerEvent,
  Rect,
  ZoomEvent,
} from 'leafer-ui';
import { createBox, createCursor, createFactory, createPen, creatRect, MAXWIDTH, MINWIDTH } from './config';

interface SizeType {
  width: number;
  height: number;
}

export interface HistoryItem {
  box?: IUIJSONData;
  destroy?: boolean;
}

interface HistoryData {
  history: HistoryItem[];
  index: number;
}

export const historyData: HistoryData = {
  history: [],
  index: -1,
};

let size = 10;

export const addHistory = (historyInfo: HistoryItem, setIndex: (index: number) => void) => {
  if (historyData.history.length === 8) {
    historyData.history.shift();
    setIndex(historyData.index);
    return;
  }
  if (historyData.index !== historyData.history.length - 1 && historyData.index !== -1) {
    historyData.history.splice(historyData.index + 1);
    historyData.history.push(historyInfo);
    historyData.index += 1;
    setIndex(historyData.index);
    return;
  }
  historyData.history.push(historyInfo);
  historyData.index += 1;
  setIndex(historyData.index);
};

const getInnerPoint = (e: DragEvent, page: Frame | App | Rect) => {
  const center = { x: e.x, y: e.y };
  const innerPoint = page.getInnerPoint(center);
  return innerPoint;
};

export const changePenStoreWidth = (box: Box) => {
  const newScale = getScale(box.width);
  box.children.forEach((child) => {
    if (child.tag === 'Pen' && child.children && child.children.length > 0 && child.data) {
      const penRatio = child.data.penSize / child.data.penScale;
      child.children[0].strokeWidth = penRatio * newScale;
    }
  });
};

const getScale = (width: number = 0) => {
  return ((width - MINWIDTH) / (MAXWIDTH - MINWIDTH)) * 350 + 50;
};

const setCursor = (app: App, frame: Frame, box: Box, opacity: string) => {
  frame.cursor = 'none';
  let ellipse: Ellipse | null = null;
  app.on(PointerEvent.ENTER, (event) => {
    if (!ellipse) {
      ellipse = createCursor(size);
    }
    if (opacity === 'erase') {
      ellipse.fill = 'rgba(4,4,5,0.4)';
      ellipse.stroke = '#FFFFFF';
    }
    const innerPoint = getInnerPoint(event, frame);
    ellipse.set({
      x: innerPoint.x - (size || 0) / 2,
      y: innerPoint.y - (size || 0) / 2,
    });
    frame.add(ellipse);
  });
  app.on(PointerEvent.MOVE, (event) => {
    if (!ellipse) return;
    const innerPoint = getInnerPoint(event, frame);
    ellipse.set({
      x: innerPoint.x - (size || 0) / 2,
      y: innerPoint.y - (size || 0) / 2,
    });
  });

  app.on(PointerEvent.LEAVE, (event) => {
    if (!ellipse) return;
    ellipse.remove();
    ellipse = null;
  });
};

// 画框
const handleBox = (app: App, frame: Frame, box: Box, image: Rect, setIndex: (index: number) => void) => {
  frame.cursor = 'crosshair';
  let rect: Rect | null = null;
  let oneInfo: { x: number; y: number } = { x: 0, y: 0 };
  frame.on(DragEvent.START, (e) => {
    const innerPoint = getInnerPoint(e, box);
    oneInfo = { x: innerPoint.x, y: innerPoint.y };
    rect = creatRect(innerPoint.x, innerPoint.y);
    box.add(rect);
  });
  frame.on(DragEvent.DRAG, (e) => {
    const pageInfo = e.getPageBounds();
    const innerPoint = getInnerPoint(e, box);
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
  frame.on(DragEvent.END, (e) => {
    const json = box.toJSON();
    const historyInfo = {
      box: json,
    };
    addHistory(historyInfo, setIndex);
  });
};

// 画线
const handlePen = (app: App, frame: Frame, box: Box, opacity: string, setIndex: (index: number) => void) => {
  app.editor.visible = false;
  let pen: Pen | null = null;
  setCursor(app, frame, box, opacity);
  frame.on(DragEvent.START, (e) => {
    pen = createPen(size);
    const penScale = getScale(box.width);
    pen.data = { penScale, penSize: size };
    box.add(pen);
    const innerPoint = getInnerPoint(e, box);
    pen.moveTo(innerPoint.x, innerPoint.y);
  });
  frame.on(DragEvent.DRAG, (e) => {
    if (!pen) return;
    const innerPoint = getInnerPoint(e, box);
    pen.lineTo(innerPoint.x, innerPoint.y);
  });
  frame.on(DragEvent.END, (e) => {
    pen = null;
    const json = box.toJSON();
    const historyInfo = {
      box: json,
    };
    addHistory(historyInfo, setIndex);
  });
};

// 橡皮擦
const handleErase = (app: App, frame: Frame, box: Box, opacity: string, setIndex: (index: number) => void) => {
  let toolRef: Pen | null = null;
  setCursor(app, frame, box, opacity);
  frame.on(DragEvent.START, (event) => {
    if (!event.left) return;
    toolRef = createFactory(size);
    const penScale = getScale(box.width);
    toolRef.data = { penScale, penSize: size };
    box.add(toolRef);
    const innerPoint = getInnerPoint(event, box);
    toolRef.moveTo(innerPoint.x, innerPoint.y);
  });

  frame.on(DragEvent.DRAG, (event) => {
    if (!event.left) return;
    const innerPoint = getInnerPoint(event, box);
    toolRef?.lineTo(innerPoint.x, innerPoint.y);
  });

  frame.on(DragEvent.END, (event) => {
    toolRef = null;
    const json = box.toJSON();
    const historyInfo = {
      box: json,
    };
    addHistory(historyInfo, setIndex);
  });
};

// 移动
const handleMove = (app: App, frame: Frame, box: Box, image: Rect) => {
  if (app && app.config.move) {
    app.config.move.drag = true;
    app.tree.on(MoveEvent.BEFORE_MOVE, (e: MoveEvent) => {
      image.move(e.moveX, e.moveY);
      box.move(e.moveX, e.moveY);
    });
    app.tree.on(ZoomEvent.BEFORE_ZOOM, (e: ZoomEvent) => {
      const scaleWidth = (image.width || 0) * e.scale;
      const max = image.widthRange?.max || 0;
      const min = image.widthRange?.min || 0;
      if (scaleWidth > max || scaleWidth < min) return;
      image.scaleOf('center', e.scale, e.scale, true);
      box.scaleOf('center', e.scale, e.scale, true);
      changePenStoreWidth(box);
    });
  }
};

export const getOpacityHandle = (
  opacity: string,
  app: App,
  frame: Frame,
  box: Box,
  image: Rect,
  cursorSize: number,
  setIndex: (index: number) => void,
) => {
  size = cursorSize;
  switch (opacity) {
    case 'box':
      handleBox(app, frame, box, image, setIndex);
      break;
    case 'pen':
      handlePen(app, frame, box, opacity, setIndex);
      break;
    case 'erase':
      handleErase(app, frame, box, opacity, setIndex);
      break;
    case 'move':
      handleMove(app, frame, box, image);
      break;
    default:
      break;
  }
};

// 初始化画布内容
export const initMaskBox = (frame: Frame, size: SizeType) => {
  const box = createBox(size);
  box.name = 'maskBox';
  const group = new Group({ x: 0, y: 0, opacity: 0.4 });
  group.name = 'maskGroup';
  group.add(box);
  frame.add(group);
  return box;
};

// 画布历史内容
export const historyMaskBox = (frame: Frame, size: SizeType, boxInfo: Box) => {
  const box = createBox(size);
  box.name = 'maskBox';
  box.add(boxInfo);
  const group = new Group({ x: 0, y: 0, opacity: 0.4 });
  group.name = 'maskGroup';
  group.add(box);
  frame.add(group);
  return box;
};

// 初始化画布
export const _init = () => {
  let app = new App({
    view: 'picture-canvas', // view 参数支持设置 window 对象
    width: 0, // 不能设置为 0， 否则会变成自动布局
    height: 0,
    fill: '#131317',
    editor: {
      hideOnMove: false,
    },
    tree: {
      type: 'viewport',
    },
  });
  return app;
};

// 销毁绑定事件
export const destroyEvent = (app: App, frame: Frame) => {
  app.off(PointerEvent.ENTER);
  app.off(PointerEvent.MOVE);
  app.off(PointerEvent.LEAVE);
  app.tree.off(MoveEvent.BEFORE_MOVE);
  app.tree.off(ZoomEvent.ZOOM);
  app.tree.off(ZoomEvent.BEFORE_ZOOM);
  frame.off(DragEvent.START);
  frame.off(DragEvent.DRAG);
  frame.off(DragEvent.END);
  frame.off(PointerEvent.DOWN);
  frame.off(PointerEvent.MOVE);
  frame.off(PointerEvent.UP);
  frame.off(PointerEvent.ENTER);
  frame.off(PointerEvent.LEAVE);
};