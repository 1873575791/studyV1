import { useDrop, useDrag } from 'ahooks';
import { useRef, useState } from 'react';

import './index.less';

export default function Index() {
  const [data, setData] = useState([{ id: 1 }, { id: 2 }]);
  const [list, setList] = useState([]);
  const [isHovering, setIsHovering] = useState(false);

  const changeList = (d) => {
    const newList = [...list];
    newList.push(d);
    setList(newList);
  };

  const changeData = (drapId, dropId) => {
    if (!drapId || !dropId) return;
    const drapIndex = list.findIndex((item) => item.id == drapId);
    const dropIndex = list.findIndex((item) => item.id == dropId);
    const newData = [...list];
    newData[drapIndex] = list[dropIndex];
    newData[dropIndex] = list[drapIndex];
    setList(newData);
  };

  return (
    <div>
      {data.map((item) => {
        return (
          <DragItem
            isHovering={isHovering}
            addList={changeList}
            // changeData={changeData}
            key={item.id}
            data={item}
          />
        );
      })}
      <DrogItem list={list} changeList={changeList} changeData={changeData} setIsHovering={setIsHovering} />
    </div>
  );
}

const DragItem = ({ data, changeData, isSort = true, isHovering = false, addList }) => {
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragData, setDragData] = useState();

  useDrag(data, dragRef, {
    onDragStart: () => {
      setDragging(true);
      setDragData(data);
    },
    onDragEnd: (e) => {
      setDragging(false);
      setDragData(undefined);
      if (isHovering) {
        addList(data);
      }
    },
  });

  useDrop(dragRef, {
    onDragEnter: (e) => {
      if (!isSort) return;
      if (
        e.fromElement?.getAttribute('dom-type') !== 'item' &&
        e.toElement?.getAttribute('dom-type') !== 'item'
      )
        return;
      if (dragData && dragData.id === data.id) return;
      changeData(e.fromElement.getAttribute('data-id'), data.id);
      // changeData(data.id, e.toElement.getAttribute('data-id'))
    },
  });

  return (
    <div
      ref={dragRef}
      data-id={data.id}
      dom-type="item"
      className={`drag ${dragging ? 'dragging' : ''}`}
    >
      拖拽元素{data.id}
    </div>
  );
};

const DrogItem = ({ list, changeData, setIsHovering, changeList }) => {
  console.log(list)

  const dropRef = useRef(null);

  useDrop(dropRef, {
    onDragEnter: () => {
      setIsHovering(true);
      // changeList({ id: 'new' })
    },
    onDragLeave: () => {
      setIsHovering(false);
    },
  });

  return (
    <div ref={dropRef} className="dropList" dom-type="list">
      {list.map((it) => {
        return <DragItem
          changeData={changeData}
          key={it.id}
          data={it}
        />;
      })}
    </div>
  );
};
