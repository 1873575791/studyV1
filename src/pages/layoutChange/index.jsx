import { useSize, useUpdate } from 'ahooks';
import { Select } from 'antd';
import { useRef, useState } from 'react';
import './index.less';

const Index = () => {
  const size = useSize(document.querySelector('#root'));
  const data = useRef({});
  const line1 = useRef(null);
  const line2 = useRef(null);
  const line3 = useRef(null);
  const w = (size?.width || 0) / 100;
  const h = (size?.height - 64 || 0) / 100;
  const [selected, setSelected] = useState('default');
  const update = useUpdate();
  const layoutLine = useRef({
    default: {
      1: {
        width: 4,
        top: 0,
        left: w * 28,
        height: h * 58,
      },
      2: {
        width: 4,
        top: 0,
        left: w * 45 - 4 + w * 28 + 4,
        height: h * 58,
      },
      3: {
        width: w * 100,
        top: h * 58,
        left: 0,
        height: 4,
      },
    },
    material: {
      1: {
        width: 4,
        top: 0,
        left: w * 28,
        height: h * 100,
      },
      2: {
        width: 4,
        top: 0,
        left: w * 45 - 4 + w * 28 + 4,
        height: h * 58,
      },
      3: {
        width: w * 72,
        top: h * 58,
        left: w * 28 + 4,
        height: 4,
      },
    },
  });

  const layout = useRef({
    default: {
      1: {
        width: w * 28,
        top: h * 0,
        left: w * 0,
        height: h * 58,
      },
      2: {
        width: w * 45 - 4,
        top: h * 0,
        left: w * 28 + 4,
        height: h * 58,
      },
      3: {
        width: w * 27 - 4,
        top: h * 0,
        left: w * 45 - 4 + w * 28 + 8,
        height: h * 58,
      },
      4: {
        width: w * 100,
        top: h * 58 + 4,
        left: w * 0,
        height: h * 42 - 4,
      },
    },
    material: {
      1: {
        width: w * 28,
        top: h * 0,
        left: w * 0,
        height: h * 100,
      },
      2: {
        width: w * 45 - 4,
        top: h * 0,
        left: w * 28 + 4,
        height: h * 58,
      },
      3: {
        width: w * 27 - 4,
        top: h * 0,
        left: w * 45 - 4 + w * 28 + 8,
        height: h * 58,
      },
      4: {
        width: w * 72 - 4,
        top: h * 58 + 4,
        left: w * 28 + 4,
        height: h * 42 - 4,
      },
    },
  });

  const handleMouseMove1 = (e) => {
    const deltaX = e.clientX - data.current.offsetX;
    const newWidth1 =
      data.current.oldWidth1 - (data.current.rect1.left - deltaX);
    const newWidth2 =
      data.current.oldWidth2 + (data.current.rect1.left - deltaX);
    if (
      deltaX < 300 ||
      data.current.oldWidth2 + (data.current.rect1.left - deltaX) < 300
    )
      return;
    layoutLine.current[selected]['1'].left = deltaX;
    layout.current[selected]['1'].width = newWidth1;
    layout.current[selected]['2'].width = newWidth2;
    layout.current[selected]['2'].left = deltaX + 4;
    if (selected === 'material') {
      layoutLine.current[selected]['3'].width =
        newWidth2 + layout.current[selected]['3'].width + 4;
      layoutLine.current[selected]['3'].left = deltaX + 4;
      layout.current[selected]['4'].width =
        newWidth2 + layout.current[selected]['3'].width + 4;
      layout.current[selected]['4'].left = deltaX + 4;
    }
    update();
  };

  const handleMouseMove2 = (e) => {
    const deltaX = e.clientX - data.current.offsetX;
    const newWidth2 =
      data.current.oldWidth2 - (data.current.rect2.left - deltaX);
    const newWidth3 =
      data.current.oldWidth3 + (data.current.rect2.right - deltaX);
    if (newWidth3 < 300 || newWidth2 < 300) return;
    layoutLine.current[selected]['2'].left = deltaX;
    layout.current[selected]['2'].width = newWidth2;
    layout.current[selected]['3'].left = deltaX + 4;
    layout.current[selected]['3'].width = newWidth3;
    update();
  };

  const handleMouseMove3 = (e) => {
    const deltaY = e.clientY - data.current.offsetY - 64;
    const newHeight = deltaY;
    const newHeight4 =
      data.current.oldHeight4 + (data.current.rect3.top - deltaY) - 64;
    if (newHeight < 300 || newHeight4 < 300) return;
    if (selected === 'default') {
      layoutLine.current[selected]['1'].height = deltaY;
    }
    layoutLine.current[selected]['2'].height = deltaY;
    layoutLine.current[selected]['3'].top = deltaY;
    // layout.current[selected]['1'].height = newHeight;
    layout.current[selected]['2'].height = newHeight;
    layout.current[selected]['3'].height = newHeight;
    layout.current[selected]['4'].top = deltaY + 4;
    layout.current[selected]['4'].height = newHeight4;
    update();
  };

  const onMouseDown = (e, dom) => {
    e.stopPropagation();
    switch (dom) {
      case '1':
        {
          document.body.style.cursor = 'col-resize';
          const rect1 = line1.current.getBoundingClientRect();
          data.current.rect1 = rect1;
          data.current.offsetX = e.clientX - rect1.left;
          data.current.oldWidth1 = layout.current[selected]['1'].width;
          data.current.oldWidth2 = layout.current[selected]['2'].width;
        }
        break;
      case '2':
        {
          document.body.style.cursor = 'col-resize';
          const rect2 = line2.current.getBoundingClientRect();
          data.current.rect2 = rect2;
          data.current.offsetX = e.clientX - rect2.left;
          data.current.oldWidth2 = layout.current[selected]['2'].width;
          data.current.oldWidth3 = layout.current[selected]['3'].width;
          data.current.oldLeft3 = layout.current[selected]['3'].left;
        }
        break;
      case '3':
        {
          document.body.style.cursor = 'row-resize';
          const rect3 = line3.current.getBoundingClientRect();
          data.current.rect3 = rect3;
          data.current.offsetY = e.clientY - rect3.top;
          data.current.oldTop4 = layout.current[selected]['4'].top;
          data.current.oldHeight4 = layout.current[selected]['4'].height;
        }
        break;
    }

    const moveEvent = {
      1: handleMouseMove1,
      2: handleMouseMove2,
      3: handleMouseMove3,
    };
    const handleMouseUp = () => {
      document.body.style.cursor = 'auto';
      data.current = {};
      document.removeEventListener('mousemove', moveEvent[dom]);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', moveEvent[dom]);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleChange = (value) => {
    setSelected(value);
  };

  const popupRender = (menu) => {
    console.log(menu);
    return <div>123</div>;
  };

  return (
    <div className="App">
      <div
        className="card"
        style={{ ...layout.current[selected]['1'], background: '#f0f0f0' }}
      >
        1
      </div>
      <div
        className="card"
        style={{ ...layout.current[selected]['2'], background: '#e0e0e0' }}
      >
        <Select
          value={selected}
          style={{ width: 120 }}
          onChange={handleChange}
          options={[
            { value: 'default', label: 'default' },
            { value: 'material', label: 'material' },
            { value: 'attribute', label: 'attribute' },
            { value: 'vertical', label: 'vertical' },
          ]}
        />
      </div>
      <div
        className="card"
        style={{ ...layout.current[selected]['3'], background: '#aaa' }}
      >
        3
      </div>
      <div
        className="card"
        style={{ ...layout.current[selected]['4'], background: 'red' }}
      >
        4
      </div>
      <div
        className="line"
        ref={line1}
        onMouseDown={(e) => onMouseDown(e, '1')}
        style={{ ...layoutLine.current[selected]['1'], cursor: 'col-resize' }}
      ></div>
      <div
        className="line"
        ref={line2}
        onMouseDown={(e) => onMouseDown(e, '2')}
        style={{ ...layoutLine.current[selected]['2'], cursor: 'col-resize' }}
      ></div>
      <div
        className="line"
        ref={line3}
        onMouseDown={(e) => onMouseDown(e, '3')}
        style={{ ...layoutLine.current[selected]['3'], cursor: 'row-resize' }}
      ></div>
    </div>
  );
};

export default Index;
