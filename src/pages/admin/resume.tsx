import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IResume } from "@/types/backend";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';
import { Space, message, notification, Input, Popconfirm, Tag, Tooltip } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteResume, callRestoreResume } from "@/config/api";
import queryString from 'query-string';
import { fetchResume } from "@/redux/slice/resumeSlide";
import ViewDetailResume from "@/components/admin/resume/view.resume";
import { ALL_PERMISSIONS } from "@/config/permissions";
import Access from "@/components/share/access";
import { sfIn, sfLike } from "spring-filter-query-builder";
import { EditOutlined, DeleteOutlined, UndoOutlined } from "@ant-design/icons";

const ResumePage = () => {
    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.resume.isFetching);
    const meta = useAppSelector(state => state.resume.meta);
    const resumes = useAppSelector(state => state.resume.result);
    console.log("Resumes list:", resumes);
    const dispatch = useAppDispatch();

    const [dataInit, setDataInit] = useState<IResume | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    const handleDeleteResume = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteResume(id);
            if (res && res.data) {
                message.success('Xóa Hồ sơ thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const handleRestoreResume = async (id: string | undefined) => {
        if (id) {
            const res = await callRestoreResume(id);
            if (res && res.data) {
                message.success('Khôi phục Hồ sơ thành công');
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

    const columns: ProColumns<IResume>[] = [
        {
            title: 'Id',
            dataIndex: 'id',
            width: 50,
            render: (text, record, index, action) => {
                return (
                    <a href="#" onClick={() => {
                        setOpenViewDetail(true);
                        setDataInit(record);
                    }}>
                        {record.id}
                    </a>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            sorter: true,
            align: 'center',
            render: (_, entity) => {
                let color = 'default';
                let text = entity.status;
                let tooltip = '';

                switch (entity.status) {
                    case 'PENDING':
                        color = '#1890ff';
                        text = 'Chờ duyệt';
                        tooltip = 'Hồ sơ đang chờ được xem xét';
                        break;
                    case 'REVIEWING':
                        color = '#fa8c16';
                        text = 'Đang xem xét';
                        tooltip = 'Hồ sơ đang được xem xét bởi nhà tuyển dụng';
                        break;
                    case 'APPROVED':
                        color = '#52c41a';
                        text = 'Đã duyệt';
                        tooltip = 'Hồ sơ đã được duyệt và chờ phỏng vấn';
                        break;
                    case 'REJECTED':
                        color = '#f5222d';
                        text = 'Từ chối';
                        tooltip = 'Hồ sơ đã bị từ chối';
                        break;
                    case 'INTERVIEW_CONFIRMED':
                        color = '#a93297';
                        text = 'Xác nhận phỏng vấn';
                        tooltip = 'Ứng viên đã xác nhận tham gia phỏng vấn';
                        break;
                    case 'INTERVIEW_REJECTED':
                        color = '#ff4d4f';
                        text = 'Từ chối phỏng vấn';
                        tooltip = 'Ứng viên đã từ chối tham gia phỏng vấn';
                        break;
                    case 'FAILED':
                        color = '#ff4d4f';
                        text = 'Không đạt yêu cầu';
                        tooltip = 'Ứng viên không đạt yêu cầu sau phỏng vấn';
                        break;
                    case 'HIRED':
                        color = '#13c2c2';
                        text = 'Đã tuyển';
                        tooltip = 'Ứng viên đã được tuyển dụng';
                        break;
                }

                return (
                    <Tooltip title={tooltip}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Tag
                                color={color}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    minWidth: '120px',
                                    textAlign: 'center',
                                    display: 'inline-block'
                                }}
                            >
                                {text}
                            </Tag>
                        </div>
                    </Tooltip>
                );
            },
            renderFormItem: (item, props, form) => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        PENDING: 'Chờ duyệt',
                        REVIEWING: 'Đang xem xét',
                        APPROVED: 'Đã duyệt',
                        REJECTED: 'Từ chối',
                        INTERVIEW_CONFIRMED: 'Xác nhận phỏng vấn',
                        INTERVIEW_REJECTED: 'Từ chối phỏng vấn',
                        FAILED: 'Không đạt yêu cầu',
                        HIRED: 'Đã tuyển'
                    }}
                    placeholder="Chọn trạng thái"
                    fieldProps={{
                        style: { width: '250px' }
                    }}
                />
            ),
        },
        {
            title: 'Trạng thái hoạt động',
            dataIndex: 'active',
            width: 120,
            render: (_, entity) => (
                <Tag color={entity.active ? "lime" : "red"}>
                    {entity.active ? "ACTIVE" : "INACTIVE"}
                </Tag>
            ),
            hideInSearch: true,
        },
        {
            title: 'Công việc',
            dataIndex: ["job", "name"],
            hideInSearch: false,
            renderFormItem: (item, props, form) => (
                <Input placeholder="Nhập tên công việc" />
            ),
        },
        {
            title: 'Công ty',
            dataIndex: "companyName",
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
            width: 100,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setOpenViewDetail(true);
                            setDataInit(entity);
                        }}
                    />

                    {entity.active ? (
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa hồ sơ"}
                            description={"Bạn có chắc chắn muốn xóa hồ sơ này ?"}
                            onConfirm={() => handleDeleteResume(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <DeleteOutlined
                                style={{
                                    fontSize: 20,
                                    color: '#ff4d4f',
                                    cursor: 'pointer'
                                }}
                            />
                        </Popconfirm>
                    ) : (
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận khôi phục hồ sơ"}
                            description={"Bạn có chắc chắn muốn khôi phục hồ sơ này ?"}
                            onConfirm={() => handleRestoreResume(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <UndoOutlined
                                style={{
                                    fontSize: 20,
                                    color: '#1890ff',
                                    cursor: 'pointer'
                                }}
                            />
                        </Popconfirm>
                    )}
                </Space>
            ),

        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };

        if (clone?.status?.length) {
            clone.filter = sfIn("status", clone.status).toString();
            delete clone.status;
        }

        if (clone?.job?.name) {
            clone.filter = clone.filter ?
                clone.filter + " and " + `${sfLike("job.name", clone.job.name)}` :
                `${sfLike("job.name", clone.job.name)}`;
            delete clone.job;
        }

        clone.page = clone.current;
        clone.size = clone.pageSize;

        delete clone.current;
        delete clone.pageSize;

        let temp = queryString.stringify(clone);

        let sortBy = "";
        if (sort && sort.status) {
            sortBy = sort.status === 'ascend' ? "sort=status,asc" : "sort=status,desc";
        }

        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }
        if (sort && sort.updatedAt) {
            sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
        }

        //mặc định sort theo updatedAt
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=createdAt,asc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        // temp += "&populate=companyId,jobId&fields=companyId.id, companyId.name, companyId.logo, jobId.id, jobId.name";
        return temp;
    }

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.RESUMES.GET_PAGINATE}
            >
                <DataTable<IResume>
                    actionRef={tableRef}
                    headerTitle="Danh sách Hồ sơ"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={resumes}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchResume({ query }))
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
                            <></>
                        );
                    }}
                />
            </Access>
            <ViewDetailResume
                open={openViewDetail}
                onClose={setOpenViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={reloadTable}
            />
        </div >
    )
}

export default ResumePage;