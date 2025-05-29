import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IJob } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined, UndoOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteJob, callRestoreJob } from "@/config/api";
import queryString from 'query-string';
import { useNavigate } from "react-router-dom";
import { fetchJob } from "@/redux/slice/jobSlide";
import { sfIn } from "spring-filter-query-builder";

const JobRecruiterPage = () => {
    const tableRef = useRef<ActionType>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { role, company_id } = useAppSelector(state => state.account.user);
    const jobs = useAppSelector(state => state.job.result);
    const isFetching = useAppSelector(state => state.job.isFetching);
    const meta = useAppSelector(state => state.job.meta);

    const handleDeleteJob = async (id: string | undefined) => {
        if (!id) return;
        try {
            const res = await callDeleteJob(id);
            if (res?.statusCode === 200) {
                message.success("Xóa công việc thành công");
                reloadTable();
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res?.message || "Xóa công việc thất bại"
                });
            }
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

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        let parts = [];

        if (clone.name) parts.push(`name ~ '${clone.name}'`);
        if (clone.salary) parts.push(`salary ~ '${clone.salary}'`);
        if (clone?.level?.length) parts.push(`${sfIn("level", clone.level).toString()}`);

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

        if (!sortBy) {
            temp += `&sort=updatedAt,desc`;
        } else {
            temp += `&${sortBy}`;
        }

        return temp;
    };

    const columns: ProColumns<IJob>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (_, __, index) => (index + 1 + (meta.page - 1) * meta.pageSize),
            hideInSearch: true,
        },
        {
            title: 'Công việc',
            dataIndex: 'name',
            sorter: true
        },
        {
            title: 'Mức lương',
            dataIndex: 'salary',
            sorter: true,
            render: (_, entity) => `${entity.salary?.toLocaleString()} đ`,
        },
        {
            title: 'Trình độ',
            dataIndex: 'level',
            renderFormItem: () => (
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
                    placeholder="Chọn trình độ"
                />
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            render: (_, entity) => (
                <Tag color={entity.active ? "lime" : "red"}>
                    {entity.active ? "ACTIVE" : "INACTIVE"}
                </Tag>
            ),
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
            render: (_, entity) => (
                <Space>
                    {entity.active ? (
                        <>
                            <EditOutlined
                                style={{ fontSize: 20, color: '#ffa500' }}
                                onClick={() => navigate(`upsert?id=${entity.id}`)}
                            />
                            <Popconfirm
                                placement="leftTop"
                                title="Xác nhận xóa công việc"
                                description="Bạn có chắc chắn muốn xóa công việc này?"
                                onConfirm={() => handleDeleteJob(entity.id)}
                                okText="Xác nhận"
                                cancelText="Hủy"
                            >
                                <DeleteOutlined
                                    style={{ fontSize: 20, color: '#ff4d4f', cursor: 'pointer' }}
                                />
                            </Popconfirm>
                        </>
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
                </Space>
            )
        },
    ];

    return (
        <div>
            <DataTable<IJob>
                actionRef={tableRef}
                headerTitle="Danh sách công việc của công ty"
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={jobs}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    if (Number(role?.id) === 2 && company_id) {
                        dispatch(fetchJob({ query, companyId: company_id }));
                    } else {
                        dispatch(fetchJob({ query }));
                    }
                }}
                scroll={{ x: true }}
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    showSizeChanger: true,
                    total: meta.total,
                    showTotal: (total, range) => (
                        <div>{range[0]}-{range[1]} trên {total} rows</div>
                    ),
                }}
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
        </div>
    );
};

export default JobRecruiterPage;
