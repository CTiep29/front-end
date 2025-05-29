import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUser } from "@/redux/slice/userSlide";
import { IUser } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined, EyeOutlined, UndoOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, message, notification, Tag } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteUser, callRestoreUser } from "@/config/api";
import queryString from 'query-string';
import ModalUser from "@/components/admin/user/modal.user";
import ViewDetailUser from "@/components/admin/user/view.user";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfLike } from "spring-filter-query-builder";

const UserPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IUser | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.user.isFetching);
    const meta = useAppSelector(state => state.user.meta);
    const users = useAppSelector(state => state.user.result);
    const dispatch = useAppDispatch();

    const handleDeleteUser = async (id: string | undefined) => {
        if (id) {
            try {
                const res = await callDeleteUser(id);
                if (res?.statusCode === 200) {
                    message.success('Xóa mềm Tài khoản thành công');
                    reloadTable();
                } else {
                    notification.error({
                        message: 'Có lỗi xảy ra',
                        description: res?.message || 'Không thể xóa tài khoản'
                    });
                }
            } catch (error: any) {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: error?.response?.data?.message || 'Không thể xóa tài khoản'
                });
            }
        }
    }

    const handleRestoreUser = async (id: string | undefined) => {
        if (id) {
            const res = await callRestoreUser(id);
            if (res && +res.statusCode === 200) {
                message.success('Khôi phục Tài khoản thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IUser>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1) + (meta.page - 1) * (meta.pageSize)}
                    </>)
            },
            hideInSearch: true,
        },
        {
            title: 'Họ tên',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            sorter: true,
        },

        {
            title: 'Vai trò',
            dataIndex: ["role", "name"],
            sorter: true,
            hideInSearch: true
        },

        {
            title: 'Công ty',
            dataIndex: ["company", "name"],
            sorter: true,
            hideInSearch: true
        },

        {
            title: 'Trạng thái',
            dataIndex: 'active',
            render(dom, entity, index, action, schema) {
                const isActive = entity.active === undefined ? true : entity.active;
                return <>
                    <Tag color={isActive ? "lime" : "red"} >
                        {isActive ? "ACTIVE" : "INACTIVE"}
                    </Tag>
                </>
            },
            hideInSearch: true,
        },

        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Hành động',
            hideInSearch: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    {entity.active ? (
                        <>
                            <Access
                                permission={ALL_PERMISSIONS.USERS.UPDATE}
                                hideChildren
                            >
                                <EditOutlined
                                    style={{
                                        fontSize: 20,
                                        color: '#ffa500',
                                    }}
                                    type=""
                                    onClick={() => {
                                        setOpenModal(true);
                                        setDataInit(entity);
                                    }}
                                />
                            </Access>
                            <Access
                                permission={ALL_PERMISSIONS.USERS.DELETE}
                                hideChildren
                            >
                                <Popconfirm
                                    placement="leftTop"
                                    title={"Xác nhận xóa tài khoản"}
                                    description={"Bạn có chắc chắn muốn xóa tài khoản này ?"}
                                    onConfirm={() => handleDeleteUser(entity.id)}
                                    okText="Xác nhận"
                                    cancelText="Hủy"
                                >
                                    <span style={{ cursor: "pointer", margin: "0 10px" }}>
                                        <DeleteOutlined
                                            style={{
                                                fontSize: 20,
                                                color: '#ff4d4f',
                                            }}
                                        />
                                    </span>
                                </Popconfirm>
                            </Access>
                        </>
                    ) : (
                        <Access
                            permission={ALL_PERMISSIONS.USERS.UPDATE}
                            hideChildren
                        >
                            <Popconfirm
                                placement="leftTop"
                                title={"Xác nhận khôi phục tài khoản"}
                                description={"Bạn có chắc chắn muốn khôi phục tài khoản này ?"}
                                onConfirm={() => handleRestoreUser(entity.id)}
                                okText="Xác nhận"
                                cancelText="Hủy"
                            >
                                <span style={{ cursor: "pointer", margin: "0 10px" }}>
                                    <UndoOutlined
                                        style={{
                                            fontSize: 20,
                                            color: '#1890ff',
                                        }}
                                    />
                                </span>
                            </Popconfirm>
                        </Access>
                    )}
                </Space>
            ),
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const q: any = {
            page: params.current,
            size: params.pageSize,
            filter: ""
        }

        const clone = { ...params };
        if (clone.name) q.filter = `${sfLike("name", clone.name)}`;
        if (clone.email) {
            q.filter = clone.name ?
                q.filter + " and " + `${sfLike("email", clone.email)}`
                : `${sfLike("email", clone.email)}`;
        }

        if (!q.filter) delete q.filter;
        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.name) {
            sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
        }
        if (sort && sort.email) {
            sortBy = sort.email === 'ascend' ? "sort=email,asc" : "sort=email,desc";
        }
        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }
        if (sort && sort.updatedAt) {
            sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
        }

        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=updatedAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    }

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.USERS.GET_PAGINATE}
            >
                <DataTable<IUser>
                    actionRef={tableRef}
                    headerTitle="Danh sách Tài khoản"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={users}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchUser({ query }))
                    }}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.page,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                        }
                    }
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <Button
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={() => setOpenModal(true)}
                            >
                                Thêm mới
                            </Button>
                        );
                    }}
                />
            </Access>
            <ModalUser
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <ViewDetailUser
                onClose={setOpenViewDetail}
                open={openViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div >
    )
}

export default UserPage;