import '@leafer-in/editor';
import '@leafer-in/viewport';
import { Slider } from 'antd';
import {
  App,
  Box,
  Frame,
  ImageEvent,
  IUIJSONData,
  Rect,
  ZoomEvent,
} from 'leafer-ui';
import React, {
  ForwardedRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  createFrame,
  createImage,
  HEIGHT,
  MAXHEIGHT,
  MAXWIDTH,
  MINHEIGHT,
  MINWIDTH,
  penText,
  recordData,
  toolsData,
  WIDTH,
} from './config';
import {
  _init,
  addHistory,
  changePenStoreWidth,
  destroyEvent,
  getOpacityHandle,
  historyData,
  HistoryItem,
  historyMaskBox,
  initMaskBox,
} from './utils';

// import { IconFont } from '@/components/UI';
import { useUpdate } from 'ahooks';
import classNames from 'classnames';
import styles from './index.less';

interface PictureCanvasProps {
  img: string;
  index: number;
  setIndex: (index: number) => void;
  leaferJson: IUIJSONData;
}

interface RefType {
  getApp: () => App | null;
  getImage: () => Rect | null;
  getBox: () => Box | null;
}

const PictureCanvas = (
  props: PictureCanvasProps,
  ref: ForwardedRef<RefType>,
) => {
  const { img, setIndex, leaferJson } = props;
  const updata = useUpdate();
  const appLeafer = useRef<App | null>(null);
  const frameLeafer = useRef<Frame | null>(null);
  const boxLeafer = useRef<Box | null>(null);
  const imageLeafer = useRef<Rect | null>(null);

  const [opacity, setOpacity] = useState('');
  const [range, setRange] = useState(100);
  const [size, setSize] = useState(40);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  useImperativeHandle(ref, () => ({
    getApp: () => appLeafer.current || null,
    getImage: () => imageLeafer.current || null,
    getImageSize: () => imgSize,
    getBox: () => boxLeafer.current || null,
  }));

  const changeoOpacity = (value: string) => {
    setOpacity(value);
    setSize(40);
  };

  const setHistory = (app: App, history?: any) => {
    let box = null;
    const frame = createFrame();
    const image = createImage(img);
    frame.add(image);
    if (history) {
      box = historyMaskBox(
        frame,
        { width: WIDTH, height: HEIGHT },
        history.box,
      );
    } else {
      box = initMaskBox(frame, { width: WIDTH, height: HEIGHT });
    }
    app.tree.add(frame);
    app.editor.visible = false;
    frame.hitChildren = false;
    appLeafer.current = app;
    frameLeafer.current = frame;
    imageLeafer.current = image;
    boxLeafer.current = box;
    updata();
  };

  const handlePrev = () => {
    if (historyData.index - 1 < 0) return;
    historyData.index -= 1;
    setIndex(historyData.index);
    console.log(
      'handleBack',
      historyData.history,
      historyData.index,
      historyData.history[historyData.index],
    );
    handleHistoryData(historyData.history[historyData.index]);
  };

  const handleNext = () => {
    if (historyData.index + 1 > historyData.history.length - 1) return;
    historyData.index += 1;
    setIndex(historyData.index);
    handleHistoryData(historyData.history[historyData.index]);
  };

  const handleDestroy = () => {
    if (appLeafer.current) {
      setHistory(appLeafer.current);
      addHistory({ destroy: true }, setIndex);
    }
  };

  const recordHandle = (key: string) => {
    switch (key) {
      case 'reset':
        handleDestroy();
        break;
      case 'prev':
        handlePrev();
        break;
      case 'next':
        handleNext();
        break;
      default:
        break;
    }
  };

  const handleHistoryData = (data: HistoryItem) => {
    if (appLeafer.current) {
      let historyItem: HistoryItem | null = data;
      if (historyItem.destroy) {
        historyItem = null;
      }
      setHistory(appLeafer.current, historyItem);
    }
  };

  const handleRange = (value: number) => {
    if (!imageLeafer.current || !boxLeafer.current) return;
    const newRange = value;
    setRange(newRange);
    const widthScale = (MAXWIDTH - MINWIDTH) / 350;
    const heightScale = (MAXHEIGHT - MINHEIGHT) / 350;
    const width = widthScale * newRange;
    const height = heightScale * newRange;
    let center = { x: (WIDTH - width) / 2, y: (HEIGHT - height) / 2 };
    if (width > WIDTH || height > HEIGHT) {
      const center = { x: -(width - WIDTH) / 2, y: -(height - HEIGHT) / 2 };
      imageLeafer.current.set(center);
    }
    imageLeafer.current.resizeWidth(width);
    imageLeafer.current.resizeHeight(height);
    imageLeafer.current.set(center);
    boxLeafer.current.resizeWidth(width);
    boxLeafer.current.resizeHeight(height);
    boxLeafer.current.set(center);
    changePenStoreWidth(boxLeafer.current);
  };

  const handleRangeFixed = (type: string) => {
    let newRange = range;
    if (type === 'add') {
      newRange += 10;
      if (newRange > 400) return;
    } else {
      newRange -= 10;
      if (newRange < 50) return;
    }
    handleRange(newRange);
  };

  const ZoomSetRange = () => {
    if (!imageLeafer.current || !appLeafer.current) return;
    const width = imageLeafer.current.width || 0;
    const scale = ((width - MINWIDTH) / (MAXWIDTH - MINWIDTH)) * 350 + 50;
    setRange(scale);
  };

  useEffect(() => {
    if (
      appLeafer.current &&
      appLeafer.current.config.move &&
      frameLeafer.current &&
      boxLeafer.current &&
      imageLeafer.current
    ) {
      appLeafer.current.config.move.drag = false;
      frameLeafer.current.cursor = 'auto';
      getOpacityHandle(
        opacity,
        appLeafer.current,
        frameLeafer.current,
        boxLeafer.current,
        imageLeafer.current,
        size,
        setIndex,
      );
      appLeafer.current.tree.on(ZoomEvent.ZOOM, ZoomSetRange);
      imageLeafer.current.on(ImageEvent.LOADED, (e) => {
        const { image } = e;
        setImgSize({ width: image.width, height: image.height });
      });
    }
    return () => {
      if (appLeafer.current && frameLeafer.current && imageLeafer.current) {
        destroyEvent(appLeafer.current, frameLeafer.current);
        imageLeafer.current.off(ImageEvent.LOADED);
      }
    };
  }, [opacity, size, boxLeafer.current]);

  useEffect(() => {
    const app = _init();
    if (leaferJson) {
      setHistory(app, leaferJson);
    } else {
      setHistory(app);
    }
    setOpacity('pen');
    return () => {
      app.destroy();
    };
  }, [img, leaferJson]);

  // 工具栏
  const toolsRender = () => {
    return (
      <div className={styles['opacity-tools']}>
        <div className={styles['opacity-card']}>
          {toolsData.map((it) => (
            <span
              onClick={() => changeoOpacity(it.key)}
              key={it.key}
              className={classNames(styles['opacity-item'], {
                [styles['active']]: it.key === opacity,
              })}
            >
              {it.text}
            </span>
          ))}
        </div>
        <div className={styles['opacity-card']}>
          {recordData.map((it) => {
            return (
              <span
                onClick={() => recordHandle(it.key)}
                key={it.key}
                className={classNames(styles['opacity-item'])}
              >
                {it.text}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const formatter = (value: any) => `${value}%`;

  // 进度栏
  const rangeRender = () => {
    return (
      <div className={styles['opacity-card']}>
        <span
          className={classNames(styles['opacity-item'])}
          onClick={() => handleRangeFixed('subtract')}
        >
          {/* {it.text} */}
        </span>
        <Slider
          value={range}
          step={1}
          className={styles['opacity-range']}
          min={50}
          max={400}
          onChange={handleRange}
          // tooltip={{ arrow: false, formatter }}
        />
        <span
          className={classNames(styles['opacity-item'])}
          onClick={() => handleRangeFixed('add')}
        >
          {/* <IconFont className={styles['opacity-icon']} type="icon2-tianjia" /> */}
        </span>
      </div>
    );
  };

  const penAndEraseRender = () => {
    const isShow = opacity === 'pen' || opacity === 'erase';
    return (
      <div
        className={styles['change-size']}
        style={{ display: isShow ? 'flex' : 'none' }}
      >
        <span className={classNames(styles['pen-size-title'])}>
          {penText[opacity]}
        </span>
        <span className={classNames(styles['pen-size-line'])}></span>
        <span
          className={classNames(styles['pen-size-small'], styles[opacity])}
        ></span>
        <Slider
          value={size}
          step={1}
          className={classNames(
            styles['opacity-range'],
            styles['w208'],
            styles[`${opacity}-range`],
          )}
          min={20}
          max={160}
          onChange={setSize}
          tooltip={{ open: false }}
        />
        <span
          className={classNames(styles['pen-size-big'], styles[opacity])}
        ></span>
      </div>
    );
  };

  const opacityRender = () => {
    return (
      <div className={styles['opacity-container']}>
        {toolsRender()}
        {rangeRender()}
        {penAndEraseRender()}
      </div>
    );
  };

  return (
    <div className={styles['picture-canvas']}>
      <div
        id="picture-canvas"
        className={classNames(
          'picture-canvas',
          styles['picture-canvas-container'],
        )}
      ></div>
      {opacityRender()}
    </div>
  );
};

export default React.forwardRef(PictureCanvas);
