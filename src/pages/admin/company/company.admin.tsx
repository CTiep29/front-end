import ModalCompany from "@/components/admin/company/modal.company";
import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCompany } from "@/redux/slice/companySlide";
import { ICompany } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined, UndoOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, message, notification, Tag } from "antd";
import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { callDeleteCompany, callRestoreCompany } from "@/config/api";
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfLike } from "spring-filter-query-builder";

const CompanyPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<ICompany | null>(null);
    const user = useAppSelector(state => state.account.user);

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.company.isFetching);
    const meta = useAppSelector(state => state.company.meta);
    const companies = useAppSelector(state => state.company.result);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (user?.id) {
            const query = 'page=1&size=10&sort=updatedAt,desc';
            dispatch(fetchCompany({ query }));
        }
    }, [user?.id, dispatch]);

    const handleDeleteCompany = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteCompany(id);
            if (res && +res.statusCode === 200) {
                message.success('Xóa mềm Công ty thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const handleRestoreCompany = async (id: string | undefined) => {
        if (id) {
            const res = await callRestoreCompany(id);
            if (res && +res.statusCode === 200) {
                message.success('Khôi phục Công ty thành công');
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

    const columns: ProColumns<ICompany>[] = [
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
            title: 'Tên công ty',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            sorter: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            render(dom, entity, index, action, schema) {
                return <>
                    <Tag color={entity.active ? "lime" : "red"} >
                        {entity.active ? "ACTIVE" : "INACTIVE"}
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
                                permission={ALL_PERMISSIONS.COMPANIES.UPDATE}
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
                                permission={ALL_PERMISSIONS.COMPANIES.DELETE}
                                hideChildren
                            >
                                <Popconfirm
                                    placement="leftTop"
                                    title={"Xác nhận xóa company"}
                                    description={"Bạn có chắc chắn muốn xóa công ty này ?"}
                                    onConfirm={() => handleDeleteCompany(entity.id)}
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
                            permission={ALL_PERMISSIONS.COMPANIES.UPDATE}
                            hideChildren
                        >
                            <Popconfirm
                                placement="leftTop"
                                title={"Xác nhận khôi phục company"}
                                description={"Bạn có chắc chắn muốn khôi phục company này ?"}
                                onConfirm={() => handleRestoreCompany(entity.id)}
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
        const clone = { ...params };
        const q: any = {
            page: params.current,
            size: params.pageSize,
            filter: ""
        }



        if (clone.name) q.filter = `${sfLike("name", clone.name)}`;
        if (clone.address) {
            q.filter = clone.name ?
                q.filter + " and " + `${sfLike("address", clone.address)}`
                : `${sfLike("address", clone.address)}`;
        }

        if (!q.filter) delete q.filter;

        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.name) {
            sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
        }
        if (sort && sort.address) {
            sortBy = sort.address === 'ascend' ? "sort=address,asc" : "sort=address,desc";
        }
        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }
        if (sort && sort.updatedAt) {
            sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
        }

        //mặc định sort theo updatedAt
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
                permission={ALL_PERMISSIONS.COMPANIES.GET_PAGINATE}
            >
                <DataTable<ICompany>
                    actionRef={tableRef}
                    headerTitle="Danh sách Công Ty"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={companies}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchCompany({ query }))
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
                            <Access
                                permission={ALL_PERMISSIONS.COMPANIES.CREATE}
                                hideChildren
                            >
                                <Button
                                    icon={<PlusOutlined />}
                                    type="primary"
                                    onClick={() => setOpenModal(true)}
                                >
                                    Thêm mới
                                </Button>
                            </Access>
                        );
                    }}
                />
            </Access>
            <ModalCompany
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div >
    )
}

export default CompanyPage;