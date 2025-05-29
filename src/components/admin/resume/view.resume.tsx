import { callUpdateResumeStatus } from "@/config/api";
import { IResume } from "@/types/backend";
import { Badge, Button, Descriptions, Drawer, Form, Select, message, notification } from "antd";
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
const { Option } = Select;

interface IProps {
    onClose: (v: boolean) => void;
    open: boolean;
    dataInit: IResume | null | any;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ViewDetailResume = (props: IProps) => {
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { onClose, open, dataInit, setDataInit, reloadTable } = props;
    const [form] = Form.useForm();

    const handleChangeStatus = async () => {
        setIsSubmit(true);

        const status = form.getFieldValue('status');
        const res = await callUpdateResumeStatus(dataInit?.id, status)
        if (res.data) {
            message.success("Cập nhật trạng thái hồ sơ thành công!");
            if (res.data?.message?.includes("tuyển đủ")) {
                notification.info({
                    message: "Đã tuyển đủ ứng viên",
                    description: res.data.message,
                    duration: 6
                });
            }
            setDataInit(null);
            onClose(false);
            reloadTable();
        } else {
            if (res?.message?.includes("đạt giới hạn")) {
                notification.warning({
                    message: "Không thể tuyển thêm",
                    description: "Số lượng ứng viên đã đạt giới hạn cho công việc này.",
                    duration: 5
                });
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message || "Lỗi không xác định"
                });
            }
        }

        setIsSubmit(false);
    }

    useEffect(() => {
        if (dataInit) {
            form.setFieldValue("status", dataInit.status)
        }
        return () => form.resetFields();
    }, [dataInit])

    return (
        <>
            <Drawer
                title="Thông Tin Hồ sơ"
                placement="right"
                onClose={() => { onClose(false); setDataInit(null) }}
                open={open}
                width={"40vw"}
                maskClosable={false}
                destroyOnClose
                extra={
                    <Button loading={isSubmit} type="primary" onClick={handleChangeStatus}>
                        Cập nhật
                    </Button>
                }
            >
                <div style={{ padding: '0 16px' }}>
                    <Descriptions 
                        title="" 
                        bordered 
                        column={1} 
                        layout="vertical"
                        size="small"
                        style={{ 
                            marginBottom: '20px',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}
                    >
                        <Descriptions.Item 
                            label="Thông tin ứng viên" 
                            labelStyle={{ 
                                fontWeight: 'bold', 
                                fontSize: '16px',
                                color: '#1890ff',
                                backgroundColor: '#f0f5ff',
                                padding: '12px 16px',
                                margin: 0
                            }}
                        >
                            <div style={{ padding: '16px' }}>
                                <div style={{ 
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ 
                                        color: '#666',
                                        minWidth: '80px'
                                    }}>Email:</span>
                                    <span style={{ color: '#262626' }}>{dataInit?.email}</span>
                                </div>
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ 
                                        color: '#666',
                                        minWidth: '80px'
                                    }}>CV:</span>
                                    {dataInit?.url ? (
                                        <a href={dataInit.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>
                                            Xem CV
                                        </a>
                                    ) : (
                                        <span style={{ color: '#999' }}>Không có CV</span>
                                    )}
                                </div>
                            </div>
                        </Descriptions.Item>

                        <Descriptions.Item 
                            label="Thông tin công việc" 
                            labelStyle={{ 
                                fontWeight: 'bold', 
                                fontSize: '16px',
                                color: '#1890ff',
                                backgroundColor: '#f0f5ff',
                                padding: '12px 16px',
                                margin: 0
                            }}
                        >
                            <div style={{ padding: '16px' }}>
                                <div style={{ 
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ 
                                        color: '#666',
                                        minWidth: '120px'
                                    }}>Tên công việc:</span>
                                    <span style={{ color: '#262626' }}>{dataInit?.job?.name}</span>
                                </div>
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ 
                                        color: '#666',
                                        minWidth: '120px'
                                    }}>Tên công ty:</span>
                                    <span style={{ color: '#262626' }}>{dataInit?.companyName}</span>
                                </div>
                            </div>
                        </Descriptions.Item>

                        <Descriptions.Item 
                            label="Trạng thái hồ sơ" 
                            labelStyle={{ 
                                fontWeight: 'bold', 
                                fontSize: '16px',
                                color: '#1890ff',
                                backgroundColor: '#f0f5ff',
                                padding: '12px 16px',
                                margin: 0
                            }}
                        >
                            <div style={{ padding: '16px' }}>
                                <Form form={form} style={{ margin: 0 }}>
                                    <Form.Item name={"status"} style={{ margin: 0 }}>
                                        <Select
                                            style={{ width: "100%" }}
                                            defaultValue={dataInit?.status}
                                        >
                                            <Option value="PENDING">Chờ duyệt</Option>
                                            <Option value="REVIEWING">Đang xem xét</Option>
                                            <Option value="APPROVED">Đã duyệt</Option>
                                            <Option value="REJECTED">Từ chối</Option>
                                            <Option value="INTERVIEW_CONFIRMED" disabled>Xác nhận phỏng vấn</Option>
                                            <Option value="HIRED">Đã tuyển</Option>
                                        </Select>
                                    </Form.Item>
                                </Form>
                            </div>
                        </Descriptions.Item>

                        <Descriptions.Item 
                            label="Thông tin thời gian" 
                            labelStyle={{ 
                                fontWeight: 'bold', 
                                fontSize: '16px',
                                color: '#1890ff',
                                backgroundColor: '#f0f5ff',
                                padding: '12px 16px',
                                margin: 0
                            }}
                        >
                            <div style={{ padding: '16px' }}>
                                <div style={{ 
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ 
                                        color: '#666',
                                        minWidth: '100px'
                                    }}>Ngày tạo:</span>
                                    <span style={{ color: '#262626' }}>
                                        {dataInit && dataInit.createdAt ? dayjs(dataInit.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}
                                    </span>
                                </div>
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ 
                                        color: '#666',
                                        minWidth: '100px'
                                    }}>Ngày sửa:</span>
                                    <span style={{ color: '#262626' }}>
                                        {dataInit && dataInit.updatedAt ? dayjs(dataInit.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}
                                    </span>
                                </div>
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            </Drawer>
        </>
    )
}

export default ViewDetailResume;