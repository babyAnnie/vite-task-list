import React, { useState, } from 'react';
import { Table, Space, Button, Modal, Input, DatePicker, Popconfirm, Select, BackTop, } from 'antd';
import moment from 'moment';
import * as appStyles from '../../styles/todo-item.module.css';
import { STATUS } from '../../config/status';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { MenuOutlined } from '@ant-design/icons';

const DragHandle = SortableHandle(() => (
  <MenuOutlined
    style={{
      cursor: 'grab',
      color: '#999',
    }}
  />
));
const { Option } = Select,
  { TextArea } = Input,
  newTitle = <span style={{ fontWeight: 'bold' }}>新建任务</span>,
  editTitle = (id = '') => <span style={{ fontWeight: 'bold' }}>
    编辑任务
    {/* ( ID: {id} ) */}
  </span>,
  initObj = {
    deadline: '',
    name: '',
    status: 1,
  };

function index(props) {
  const {
    handleTableData = () => { },
    tableDataSource = [],
    DraggableContainer = () => { },
    DraggableBodyRow = () => { }
  } = props;
  const [isModalVisible, setIsModalVisible] = useState(false); // 是否对话框可见
  const [isCreate, setIsCreate] = useState(false); // 是否创建新任务
  const [editingRecordInfo, setEditingRecordInfo] = useState(null);  // 编辑任务

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    const bool = Object.values(editingRecordInfo).reduce((a, b) => a && b, true);
    if (bool) {
      if (isCreate) {
        handleTableData(
          'create',
          {
            "id": Math.random().toString(36).slice(2),
            "name": editingRecordInfo.name,
            "deadline": editingRecordInfo.deadline,
            "content": editingRecordInfo.content,
            "status": 1
          }
        )
      } else {
        if (editingRecordInfo) {
          handleTableData(
            'update',
            {
              "id": editingRecordInfo.id,
              "name": editingRecordInfo.name,
              "deadline": editingRecordInfo.deadline,
              "content": editingRecordInfo.content
            }
          )
        }
      }
      setIsModalVisible(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const onInputChange = (v) => {
    const val = v?.target?.value;
    const tempObj = { ...editingRecordInfo };
    tempObj.name = val;
    setEditingRecordInfo(tempObj);
  }

  const onDatePickerChange = (date, dateString) => {
    const tempObj = { ...editingRecordInfo };
    tempObj.deadline = dateString;
    setEditingRecordInfo(tempObj);
  }

  const handleTextAreaChange = (v) => {
    const val = v?.target?.value;
    const tempObj = { ...editingRecordInfo };
    tempObj.content = val;
    setEditingRecordInfo(tempObj);
  }

  const handleSelectChange = (v, id) => {
    if (!v || !id) return;
    handleTableData(
      'update_status',
      {
        id,
        "status": v
      }
    )
  }

  const handleDeleteTask = (k) => {
    if (k) {
      handleTableData(
        'delete',
        { id: k }
      )
    }
  }

  const columns = [
    {
      title: '',
      dataIndex: 'sort',
      width: 32,
      className: 'drag-visible',
      render: (text, record) => {
        return <div>
          <DragHandle />
          {text}
        </div>
      },
    },
    {
      title: '标题',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 200,
      // className: 'drag-visible',
      // render: (text, record) => {
      //   return <div>
      //     <DragHandle />
      //     {text}
      //   </div>
      // },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      filters: [
        {
          text: '待办',
          value: 1,
        },
        {
          text: '完成',
          value: 2,
        },
        {
          text: '进行中',
          value: 3,
        },
      ],
      filtered: true,
      onFilter: (value, record) => record.status === value,
      render: (text, record) => {
        return <Select
          size="small"
          defaultValue={STATUS[text].name}
          style={{ width: 88, color: STATUS[text]['color'] || '#000' }}
          bordered={false}
          onChange={(e) => handleSelectChange(e, record.id)}
        >
          <Option value={1} style={{ color: STATUS[1]['color'], fontWeight: 'bold' }}>{STATUS[1]['name']}</Option>
          <Option value={2} style={{ color: STATUS[2]['color'], fontWeight: 'bold' }}>{STATUS[2]['name']}</Option>
          <Option value={3} style={{ color: STATUS[3]['color'], fontWeight: 'bold' }}>{STATUS[3]['name']}</Option>
        </Select>
      },
      width: 200,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      align: 'center',
      className: appStyles.tableContent,
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      align: 'center',
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (text, record) => (
        <Space size="middle" style={{ display: 'flex', flexDirection: 'column' }}>
          <Button
            type='primary'
            size='small'
            style={{ width: '68px', fontSize: 14 }}
            onClick={() => {
              setEditingRecordInfo(record);
              showModal();
              setIsCreate(false);
              taskNameInputGetFocus();
            }}
          >
            编辑
          </Button>
          <Button
            type='primary'
            size='small'
            style={{ width: '68px', fontSize: 14 }}

          >
            <Popconfirm
              placement="left"
              title="确定要删除?"
              onConfirm={() => handleDeleteTask(record.id)}
              okText="确定"
              cancelText="取消"
            >
              删除
            </Popconfirm>
          </Button>
        </Space>
      ),
      width: 200,
    },
  ];

  const taskNameInputGetFocus = () => {
    setTimeout(() => {
      const dom = document.getElementById('taskNameInput');
      if (dom) {
        dom.focus();
      }
    }, 0)
  }

  return (
    <div className={appStyles.todoItemWrapper}>
      {/* 新建按钮 */}
      <Button
        type='primary'
        onClick={() => {
          showModal();
          setIsCreate(true);
          setEditingRecordInfo(initObj);
          taskNameInputGetFocus();
        }}
        style={{ width: '148px', marginBottom: '0.5rem', letterSpacing: '2px' }}
      >
        新建任务
      </Button>
      {/* 编辑时弹出的对话框 */}
      <Modal
        title={isCreate ? newTitle : editTitle(editingRecordInfo?.id)}
        visible={isModalVisible}
        closable={false}
        okText={'确定'}
        cancelText={'取消'}
        centered={true}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <div className={appStyles.modalContent}>
          <div className={appStyles.modalContentItem}>
            <span className={appStyles.modalContentStar}>*</span>
            任务名称：
          </div>
          <Input
            id='taskNameInput'
            size='middle'
            onChange={onInputChange}
            value={editingRecordInfo?.name || ''}
          />
        </div>
        <div className={appStyles.modalContent}>
          <div className={appStyles.modalContentItem}>
            <span className={appStyles.modalContentStar}>*</span>
            任务截止日期：
          </div>
          <DatePicker
            placeholder=''
            size='middle'
            value={(editingRecordInfo?.deadline) ? moment(editingRecordInfo?.deadline) : ''}
            onChange={onDatePickerChange}
            style={{ width: '100%' }}
            disabledDate={(currentDate) => {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              if (currentDate >= now) {
                return false;
              }
              return true;
            }}
          />
        </div>
        <div className={appStyles.modalContent}>
          <div className={appStyles.modalContentItem}>
            <span className={appStyles.modalContentStar}>*</span>
            任务内容：
          </div>
          <TextArea
            rows={5}
            value={editingRecordInfo?.content || ''}
            size='middle'
            autoSize={{ minRows: 5, maxRows: 10 }}
            onChange={handleTextAreaChange}
          />
        </div>
      </Modal>
      {/* 表格 */}
      <Table
        size='middle'
        rowKey={record => record.id}
        columns={columns}
        dataSource={[...tableDataSource]}
        bordered
        pagination={{ position: ['bottomCenter'] }}
        components={{
          body: {
            wrapper: DraggableContainer,
            row: DraggableBodyRow,
          },
        }}
      />
      <BackTop>
        <div style={{
          height: 32,
          width: 32,
          lineHeight: '32px',
          borderRadius: 4,
          backgroundColor: '#1088e9',
          color: '#fff',
          textAlign: 'center',
          fontSize: 14,
        }}>UP</div>
      </BackTop>
    </div>
  );
}

export default index;