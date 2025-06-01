import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IJob } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined, UndoOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, message, notification, Tabs, Badge } from "antd";
import { useRef, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { callDeleteJob, callRestoreJob, callApproveJob, callRejectJob, callCountPendingJobs } from "@/config/api";
import queryString from 'query-string';
import { useNavigate } from "react-router-dom";
import { fetchJob } from "@/redux/slice/jobSlide";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfIn } from "spring-filter-query-builder";

const JobPage = () => {
    const tableRef = useRef<ActionType>();
    const [activeTab, setActiveTab] = useState('all');
    const [pendingCount, setPendingCount] = useState<number>(0);

    const isFetching = useAppSelector(state => state.job.isFetching);
    const meta = useAppSelector(state => state.job.meta);
    const jobs = useAppSelector(state => state.job.result);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Add useEffect to reload table when activeTab changes
    useEffect(() => {
        if (tableRef.current) {
            tableRef.current.reload();
        }
    }, [activeTab]);

    const fetchPendingCount = async () => {
        try {
            const res = await callCountPendingJobs();
            if (res?.data) {
                setPendingCount(res.data);
            }
        } catch (error) {
            console.error('Error fetching pending jobs count:', error);
        }
    };

    useEffect(() => {
        fetchPendingCount();
    }, [jobs]); // Fetch count whenever jobs list changes

    const handleDeleteJob = async (id: string | undefined) => {
        if (!id) return;
        try {
            const res = await callDeleteJob(id);
            message.success("Xóa công việc thành công");
            reloadTable();
        } catch (error: any) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: error?.response?.data?.message || "Xóa công việc thất bại"
            });
        }
    };

    const handleRestoreJob = async (id: string | undefined) => {
        if (!id) return;
        try {
            const res = await callRestoreJob(id);
            if (res?.statusCode === 200) {
                message.success("Khôi phục công việc thành công");
                reloadTable();
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res?.message || "Khôi phục công việc thất bại"
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: error?.response?.data?.message || "Khôi phục công việc thất bại"
            });
        }
    };

    const handleApproveJob = async (id: string | undefined) => {
        if (!id) return;
        try {
            const res = await callApproveJob(id);
            if (res?.statusCode === 200) {
                message.success("Duyệt công việc thành công");
                reloadTable();
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res?.message || "Duyệt công việc thất bại"
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: error?.response?.data?.message || "Duyệt công việc thất bại"
            });
        }
    };

    const handleRejectJob = async (id: string | undefined) => {
        if (!id) return;
        try {
            const res = await callRejectJob(id);
            if (res?.statusCode === 200) {
                message.success("Từ chối công việc thành công");
                reloadTable();
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res?.message || "Từ chối công việc thất bại"
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: error?.response?.data?.message || "Từ chối công việc thất bại"
            });
        }
    };

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IJob>[] = [
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
            title: 'Công việc',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Công ty',
            dataIndex: ["company", "name"],
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'Mức lương',
            dataIndex: 'salary',
            sorter: true,
            render(dom, entity, index, action, schema) {
                const str = "" + entity.salary;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</>
            },
        },
        {
            title: 'Cấp độ',
            dataIndex: 'level',
            renderFormItem: (item, props, form) => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        INTERN: 'INTERN',
                        FRESHER: 'FRESHER',
                        JUNIOR: 'JUNIOR',
                        MIDDLE: 'MIDDLE',
                        SENIOR: 'SENIOR',
                    }}
                    placeholder="Chọn level"
                />
            ),
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
            title: 'Trạng thái duyệt',
            dataIndex: 'status',
            render(dom, entity) {
                const statusConfig = {
                    PENDING: { color: 'orange', text: 'Chờ duyệt' },
                    APPROVED: { color: 'green', text: 'Đã duyệt' },
                    REJECTED: { color: 'red', text: 'Đã từ chối' }
                };
                
                const status = statusConfig[entity.status];
                return (
                    <Tag color={status.color}>
                        {status.text}
                    </Tag>
                );
            },
            hideInSearch: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 150,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            width: 150,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Hành động',
            hideInSearch: true,
            width: 60,
            render: (_value, entity, _index, _action) => (
                <Space size="middle">
                    <Access permission={ALL_PERMISSIONS.JOBS.UPDATE} hideChildren>
                        {entity.status === 'PENDING' && (
                            <>
                                <CheckOutlined
                                    style={{
                                        fontSize: 20,
                                        color: '#52c41a',
                                        cursor: 'pointer',
                                        marginRight: '2px'
                                    }}
                                    onClick={() => handleApproveJob(entity.id)}
                                />
                                <CloseOutlined
                                    style={{
                                        fontSize: 20,
                                        color: '#ff4d4f',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleRejectJob(entity.id)}
                                />
                            </>
                        )}
                        {entity.status === 'APPROVED' && (
                            <>
                                <EditOutlined
                                    style={{
                                        fontSize: 20,
                                        color: '#ffa500',
                                        marginRight: '2px'
                                    }}
                                    onClick={() => {
                                        navigate(`/admin/job/upsert?id=${entity.id}`)
                                    }}
                                />
                                {entity.active ? (
                                    <Popconfirm
                                        placement="leftTop"
                                        title={"Xác nhận xóa job"}
                                        description={"Bạn có chắc chắn muốn xóa công việc này ?"}
                                        onConfirm={() => handleDeleteJob(entity.id)}
                                        okText="Xác nhận"
                                        cancelText="Hủy"
                                    >
                                        <DeleteOutlined
                                            style={{
                                                fontSize: 20,
                                                color: '#ff4d4f',
                                            }}
                                        />
                                    </Popconfirm>
                                ) : (
                                    <Popconfirm
                                        placement="leftTop"
                                        title="Xác nhận khôi phục công việc"
                                        description="Bạn có chắc chắn muốn khôi phục công việc này?"
                                        onConfirm={() => handleRestoreJob(entity.id)}
                                        okText="Xác nhận"
                                        cancelText="Hủy"
                                    >
                                        <UndoOutlined
                                            style={{ fontSize: 20, color: '#1890ff', cursor: 'pointer' }}
                                        />
                                    </Popconfirm>
                                )}
                            </>
                        )}
                    </Access>
                </Space>
            ),
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        let parts = [];
        if (clone.name) parts.push(`name ~ '${clone.name}'`);
        if (clone.salary) parts.push(`salary ~ '${clone.salary}'`);
        if (clone?.level?.length) {
            parts.push(`${sfIn("level", clone.level).toString()}`);
        }

        // Add status filter based on active tab
        if (activeTab === 'pending') {
            parts.push(`status = 'PENDING'`);
            parts.push(`active = false`);
        }

        clone.filter = parts.join(' and ');
        if (!clone.filter) delete clone.filter;

        clone.page = clone.current;
        clone.size = clone.pageSize;

        delete clone.current;
        delete clone.pageSize;
        delete clone.name;
        delete clone.salary;
        delete clone.level;

        let temp = queryString.stringify(clone);

        let sortBy = "";
        const fields = ["name", "salary", "createdAt", "updatedAt"];
        if (sort) {
            for (const field of fields) {
                if (sort[field]) {
                    sortBy = `sort=${field},${sort[field] === 'ascend' ? 'asc' : 'desc'}`;
                    break;
                }
            }
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
                permission={ALL_PERMISSIONS.JOBS.GET_PAGINATE}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'all',
                            label: 'Tất cả công việc',
                            children: (
                                <DataTable<IJob>
                                    actionRef={tableRef}
                                    headerTitle="Danh sách Công việc"
                                    rowKey="id"
                                    loading={isFetching}
                                    columns={columns}
                                    dataSource={jobs}
                                    request={async (params, sort, filter): Promise<any> => {
                                        const query = buildQuery(params, sort, filter);
                                        dispatch(fetchJob({ query }))
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
                                                onClick={() => navigate('upsert')}
                                            >
                                                Thêm mới
                                            </Button>
                                        );
                                    }}
                                />
                            )
                        },
                        {
                            key: 'pending',
                            label: (
                                <span>
                                    Công việc chờ duyệt
                                    {pendingCount > 0 && (
                                        <Badge
                                            count={pendingCount}
                                            style={{
                                                marginLeft: '8px',
                                                backgroundColor: '#ff4d4f'
                                            }}
                                        />
                                    )}
                                </span>
                            ),
                            children: (
                                <DataTable<IJob>
                                    actionRef={tableRef}
                                    headerTitle="Danh sách công việc chờ duyệt"
                                    rowKey="id"
                                    loading={isFetching}
                                    columns={columns}
                                    dataSource={jobs}
                                    request={async (params, sort, filter): Promise<any> => {
                                        const query = buildQuery(params, sort, filter);
                                        dispatch(fetchJob({ query }))
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
                                />
                            )
                        }
                    ]}
                />
            </Access>
        </div>
    )
}

export default JobPage;