import { Box, Ellipse, Frame, Pen, Rect } from 'leafer-ui';

export const WIDTH = 896;
export const HEIGHT = 504;
export const MINWIDTH = 448;
export const MAXWIDTH = 3584;
export const MINHEIGHT = 252;
export const MAXHEIGHT = 2016;

interface SizeType {
  width: number;
  height: number;
}

export const toolsData = [
  { text: '框选', key: 'box', icon: 'icon2-kuangxuan' },
  { text: '画笔', key: 'pen', icon: 'icon2-huabi' },
  { text: '擦除', key: 'erase', icon: 'icon2-xiangpi' },
  { text: '移动', key: 'move', icon: 'icon2-yidonghuabu' },
];

export const recordData = [
  { text: '上一步', key: 'prev', icon: 'icon2-houtuiyibu' },
  { text: '下一步', key: 'next', icon: 'icon2-qianjinyibu' },
  { text: '重置', key: 'reset', icon: 'icon2-qingchu' },
];

export const penText: Record<string, string> = {
  pen: '画笔尺寸',
  erase: '橡皮尺寸',
};

export const creatRect = (x: number, y: number) => {
  const rect = new Rect({
    editable: true,
    fill: '#4177FF',
    x,
    y,
  });
  return rect;
};

export const createPen = (size: number = 10) => {
  const pen = new Pen();
  pen.setStyle({
    stroke: '#4177FF',
    strokeWidth: size,
    strokeCap: 'round',
    strokeJoin: 'round',
  });

  return pen;
};

export const createCursor = (size: number = 10) => {
  const ellipse = new Ellipse({
    width: size,
    height: size,
    fill: 'rgba(65, 119, 255, .4)',
    zIndex: 2,
    stroke: '#8DAFFF',
    strokeWidth: 1,
  });

  return ellipse;
};

export const createFactory = (size: number = 10) => {
  const pen = new Pen({
    name: 'brush',
    hitChildren: false,
    editable: false,
    eraser: true,
  });

  pen.setStyle({
    stroke: '#ffffff',
    strokeWidth: size,
    strokeCap: 'round',
    strokeJoin: 'round',
  });

  return pen;
};

export const createFrame = () => {
  const frame = new Frame({
    width: WIDTH,
    height: HEIGHT,
    fill: '#131317',
    overflow: 'show',
  });
  return frame;
};

export const createImage = (img: string) => {
  const image = new Rect({
    width: WIDTH,
    height: HEIGHT,
    fill: {
      type: 'image',
      url: img,
      mode: 'stretch',
      align: 'center',
    },
    widthRange: { min: MINWIDTH, max: MAXWIDTH },
    heightRange: { min: MINHEIGHT, max: MAXHEIGHT },
    editable: false,
  });
  return image;
};

export const createBox = (size: SizeType) => {
  const { width, height } = size;
  const box = new Box({
    width,
    height,
    resizeChildren: true,
    widthRange: { min: MINWIDTH, max: MAXWIDTH },
    heightRange: { min: MINHEIGHT, max: MAXHEIGHT },
  });

  return box;
};