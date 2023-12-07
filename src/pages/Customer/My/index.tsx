import { ProTable, TableDropdown } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Modal } from 'antd'
import { useRef } from 'react'
import type { CrudModalRef } from '../components/CrudModal'
import CrudModal from '../components/CrudModal'
import type { FollowModalRef } from '../components/FollowModal'
import FollowModal from '../components/FollowModal'
import type { ViewModalRef } from '../components/ViewModal'
import ViewModal from '../components/ViewModal'
import type { Customer } from '../types'
import { EnumFromMode } from '@/enums'
import { CUSTOMER_CATEGORY, CUSTOMER_SOURCE } from '@/constants/dictionary'
import { deleteCustomer, moveToPublic, queryCustomer } from '@/services/customer'

const MyCustomer = () => {
  const actionRef = useRef<ActionType>()
  const crudModalRef = useRef<CrudModalRef>(null)
  const followModalRef = useRef<FollowModalRef>(null)
  const viewModalRef = useRef<ViewModalRef>(null)

  const [modal, contextHolder] = Modal.useModal()

  const handleClickCrud = (mode: EnumFromMode, record?: Customer) => {
    crudModalRef?.current?.showModal(mode, record)
  }

  const handleClickView = (record: Customer) => {
    viewModalRef?.current?.showModal(record)
  }

  const handleClickFollow = (record: Customer) => {
    followModalRef?.current?.showModal(record)
  }

  const handleClickTransfer = (record: Customer) => {
    modal.confirm({
      title: '确定移入公海？',
      content: '移入公海后所有人可见。',
      onOk: async () => {
        await moveToPublic(record.id)
        actionRef.current?.reload()
      },
    })
  }

  const handleClickDelete = (record: Customer) => {
    modal.confirm({
      title: '确定删除？',
      content: '删除后无法恢复。',
      onOk: async () => {
        await deleteCustomer(record.id)
        actionRef.current?.reload()
      },
    })
  }

  const handleClickActionGroup = (key: string, record: Customer) => {
    switch (key) {
      case 'intention':
        // TODO 转意向客户
        break
      case 'transfer':
        handleClickTransfer(record)
        break
      case 'update':
        handleClickCrud(EnumFromMode.UPDATE, record)
        break
      case 'delete':
        handleClickDelete(record)
        break
      default:
        break
    }
  }

  const columns: ProColumns<Customer>[] = [
    {
      title: '联系人',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      copyable: true,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '微信号',
      dataIndex: 'wechat',
      copyable: true,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '线索来源',
      dataIndex: 'source',
      ellipsis: true,
      valueType: 'select',
      fieldProps: {
        options: CUSTOMER_SOURCE,
      },
    },
    {
      title: '需求分类',
      dataIndex: 'category',
      ellipsis: true,
      valueType: 'select',
      fieldProps: {
        options: CUSTOMER_CATEGORY,
      },
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '跟进人',
      dataIndex: 'follower',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '最新跟进内容',
      ellipsis: true,
      hideInSearch: true,
      render: (_, record) => record.followRecords?.[0]?.followContent,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '操作',
      width: 160,
      valueType: 'option',
      render: (_, record) => [
        <a key="read" onClick={() => handleClickView(record)}>查看</a>,
        <a key="follow" onClick={() => handleClickFollow(record)}>写跟进</a>,
        <TableDropdown
          key="actionGroup"
          onSelect={(key: string) => handleClickActionGroup(key, record)}
          menus={[
            { key: 'intention', name: '转意向客戶' },
            { key: 'transfer', name: '移入公海' },
            { key: 'update', name: '编辑' },
            { key: 'delete', name: '刪除' },
          ]}
        />,
      ],
    },
  ]

  return (
    <>
      {contextHolder}
      <ProTable<Customer>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        headerTitle="我的客户"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          showQuickJumper: true,
        }}
        toolBarRender={() => [
          <Button type="primary" key="create" onClick={() => handleClickCrud(EnumFromMode.CREATE)}>新增客户</Button>,
        ]}
        params={{ page: 'MY' }}
        request={async (params = {}) => {
          const response = await queryCustomer(params) as any
          const { data: { data, total }, success } = response
          return {
            data,
            total,
            success,
          }
        }}
      />

      <CrudModal ref={crudModalRef} onReload={() => actionRef.current?.reload()} />
      <FollowModal ref={followModalRef} onReload={() => actionRef.current?.reload()} />
      <ViewModal ref={viewModalRef} onReload={() => actionRef.current?.reload()}/>
    </>
  )
}

export default MyCustomer
