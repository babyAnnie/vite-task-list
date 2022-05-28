import { message, Divider } from 'antd';
import { useEffect, useState } from 'react'
import TodoItem from './components/ToDoItem'
import * as styles from './styles/app.module.css'

import { MenuOutlined } from '@ant-design/icons';
import { arrayMoveImmutable } from 'array-move';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
const DragHandle = SortableHandle(() => (
  <MenuOutlined
    style={{
      cursor: 'grab',
      color: '#999',
    }}
  />
));

const SortableItem = SortableElement((props) => <tr {...props} />);
const SortableBody = SortableContainer((props) => <tbody {...props} />);


const getStoreFn = () => {
  try {
    return JSON.parse(localStorage.getItem('task-list')) || [
      {
        content: "第一个任务",
        deadline: "2022-05-27",
        id: "dongdanyan",
        name: "测试",
        status: 1,
      }
    ];
  } catch {
    localStorage.clear()
    return []
  }
}


function App() {
  // 任务列表
  const [tableDataSource, setTableDataSource] = useState(getStoreFn());

  useEffect(() => {
    localStorage.setItem('task-list', JSON.stringify(tableDataSource))
  }, [tableDataSource])

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(tableDataSource.slice(), oldIndex, newIndex).filter(
        (el) => !!el,
      );
      setTableDataSource(newData);
    }
  };

  const DraggableContainer = (props) => (
    <SortableBody
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  );

  const DraggableBodyRow = ({ className, style, ...restProps }) => {
    const id = tableDataSource.findIndex((x) => x.id === restProps['data-row-key']);
    return <SortableItem index={id} {...restProps} />;
  };

  const handleTableData = (type, obj) => {
    switch (type) {
      case 'create':
        try {
          setTableDataSource([...tableDataSource, obj])
          message.success('新建任务成功！')
        } catch {
          message.info('新建任务失败！')
        }
        break;
      case 'update':
      case 'update_status':
        try {
          const tempArr = JSON.parse(JSON.stringify(tableDataSource));
          for (let v of tempArr) {
            if (v.id === obj.id) {
              for (let k in obj) {
                if (obj[k]) {
                  v[k] = obj[k]
                }
              }
              break;
            }
          }
          setTableDataSource(tempArr);
          if (type === 'update') {
            message.success('编辑成功！')
          } else {
            message.success(`状态修改成功！`)
          }
        } catch {
          if (type === 'update') {
            message.info('编辑失败！')
          } else {
            message.info(`状态修改失败！`)
          }
        }
        break;
      case 'delete':
        try {
          const tempList = JSON.parse(JSON.stringify(tableDataSource));
          for (let i in tempList) {
            const v = tempList[i]
            if (v.id === obj.id) {
              tempList.splice(i, 1)
              break;
            }
          }
          setTableDataSource(tempList);
          message.success('删除成功！')
        } catch {
          message.info('删除失败！')
        }
        break;
      default:
        break;
    }
    localStorage.setItem('task-list', JSON.stringify(tableDataSource))
  }


  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {/* 下划线 */}
      <div className={styles.appHeader}>
        任务列表
      </div>
      <TodoItem
        handleTableData={handleTableData}
        tableDataSource={tableDataSource}
        DraggableContainer={DraggableContainer}
        DraggableBodyRow={DraggableBodyRow}
      // DragHandle={<DragHandle />}
      />
    </div>
  )
}

export default App
