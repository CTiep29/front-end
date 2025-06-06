import { Button, Col, Form, Input, Modal, Popconfirm, Row, Select, Table, Tabs, message, notification, Space } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from "antd";
import { IResume, ISubscribers } from "@/types/backend";
import { useState, useEffect } from "react";
import { callChangePassword, callCreateSubscriber, callFetchAllSkill, callFetchResumeByUser, callGetSubscriberSkills, callUpdateSubscriber, callUpdateResumeStatus, callSendEmailJobs, callDeleteSubscriber } from "@/config/api";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { MonitorOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/redux/hooks";
import UserUpdateInfo from "./update.info";

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}
const UserResume = () => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const user = useAppSelector((state) => state.account.user);
    const fetchData = async () => {
        setIsFetching(true);
        const res = await callFetchResumeByUser();
        if (res && res.data) {
            setListCV(res.data.result as IResume[]);
        }
        setIsFetching(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleConfirmInterview = async (resumeId: number) => {
        try {
            const res = await callUpdateResumeStatus(resumeId, "INTERVIEW_CONFIRMED");
            if (res?.data) {
                message.success("Bạn đã xác nhận tham gia phỏng vấn");
                fetchData(); // reload lại bảng
            } else {
                notification.error({
                    message: "Lỗi",
                    description: res.message,
                });
            }
        } catch (error) {
            message.error("Có lỗi xảy ra khi xác nhận");
        }
    };

    const handleRejectInterview = async (resumeId: number) => {
        try {
            const res = await callUpdateResumeStatus(resumeId, "INTERVIEW_REJECTED");
            if (res?.data) {
                message.success("Bạn đã từ chối tham gia phỏng vấn");
                fetchData(); // reload lại bảng
            } else {
                notification.error({
                    message: "Lỗi",
                    description: res.message,
                });
            }
        } catch (error) {
            message.error("Có lỗi xảy ra khi từ chối");
        }
    };

    const columns: ColumnsType<IResume> = [
        {
            title: "STT",
            key: "index",
            width: 50,
            align: "center",
            render: (_, __, index) => <>{index + 1}</>,
        },
        {
            title: "Công Ty",
            dataIndex: "companyName",
        },
        {
            title: "Job title",
            dataIndex: ["job", "name"],
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (value) => {
                switch (value) {
                    case "PENDING":
                        return "Chờ duyệt";
                    case "APPROVED":
                        return "Mời phỏng vấn";
                    case "REJECTED":
                        return "Bị từ chối";
                    case "INTERVIEW_CONFIRMED":
                        return "Đã xác nhận phỏng vấn";
                    case "INTERVIEW_REJECTED":
                        return "Đã từ chối phỏng vấn";
                    case "FAILED":
                        return "Không đạt yêu cầu";
                    case "HIRED":
                        return "Đã tuyển";
                    default:
                        return value;
                }
            },
        },
        {
            title: "Ngày ứng tuyển",
            dataIndex: "createdAt",
            render: (_, record) => <>{dayjs(record.createdAt).format("DD-MM-YYYY")}</>,
        },
        {
            title: "Hành động",
            width: 200,
            render: (_, record) => {
                if (record.status === "APPROVED") {
                    return (
                        <Space size="small">
                            <Button 
                                type="primary" 
                                size="small"
                                onClick={() => handleConfirmInterview(Number(record.id))}
                                style={{ 
                                    backgroundColor: '#52c41a',
                                    borderColor: '#52c41a',
                                    padding: '0 8px'
                                }}
                            >
                                Xác nhận tham gia
                            </Button>
                            <Button 
                                danger
                                size="small"
                                onClick={() => handleRejectInterview(Number(record.id))}
                                style={{ padding: '0 8px' }}
                            >
                                Từ chối phỏng vấn
                            </Button>
                        </Space>
                    );
                } else if (record.status === "REJECTED") {
                    return <span style={{ color: '#ff4d4f' }}>Đơn đã bị từ chối</span>;
                } else if (record.status === "INTERVIEW_CONFIRMED") {
                    return <span style={{ color: '#52c41a' }}>Đã xác nhận tham gia</span>;
                } else if (record.status === "INTERVIEW_REJECTED") {
                    return <span style={{ color: '#ff4d4f' }}>Đã từ chối phỏng vấn</span>;
                } else if (record.status === "FAILED") {
                    return <span style={{ color: '#ff4d4f' }}>Không đạt yêu cầu</span>;
                } else if (record.status === "HIRED") {
                    return <span style={{ color: '#13c2c2' }}>Đã được tuyển dụng</span>;
                }
                return null;
            },
        },
    ];

    return (
        <div>
            <Table<IResume> columns={columns} dataSource={listCV} loading={isFetching} pagination={false} />
        </div>
    );
};


const JobByEmail = () => {
    const [form] = Form.useForm();
    const user = useAppSelector((state) => state.account.user);
    const [optionsSkills, setOptionsSkills] = useState<{ label: string; value: string }[]>([]);
    const [subscriber, setSubscriber] = useState<ISubscribers | null>(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const init = async () => {
            await fetchSkill();
            const res = await callGetSubscriberSkills();
            if (res && res.data) {
                setSubscriber(res.data);
                const arr = res.data.skills.map((item: any) => ({
                    label: item.name,
                    value: item.id + "",
                }));
                form.setFieldValue("skills", arr);
            }
        };
        init();
    }, []);

    const fetchSkill = async () => {
        let query = `page=1&size=100&sort=createdAt,desc`;

        const res = await callFetchAllSkill(query);
        if (res && res.data) {
            const arr = res?.data?.result?.map(item => {
                return {
                    label: item.name as string,
                    value: item.id + "" as string
                }
            }) ?? [];
            setOptionsSkills(arr);
        }
    }

    const onFinish = async (values: any) => {
        // const skills = values.skills?.map((item: any) => ({ id: item.id || item }));
        const skills = values.skills?.map((item: any) => {
            if (typeof item === "string" || typeof item === "number") {
                return { id: item };
            }
            return { id: item.value ?? item.id };
        });

        setLoading(true);
        try {
            let res;
            if (!subscriber?.id) {
                res = await callCreateSubscriber({
                    email: user.email,
                    name: user.name,
                    skills,
                });
            } else {
                res = await callUpdateSubscriber({
                    id: subscriber.id,
                    skills,
                });
            }

            if (res?.data) {
                setSubscriber(res.data);
                message.success("Cập nhật kỹ năng thành công!");
                notification.info({
                    message: "Đăng ký nhận email thành công",
                    description: "Emails sẽ được gửi đến bạn lúc 9h sáng hàng ngày.",
                });
            } else {
                notification.error({
                    message: "Cập nhật thất bại",
                    description: res.message || "Vui lòng thử lại.",
                });
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật/kích hoạt gửi email:", err);
            message.error("Có lỗi xảy ra khi gửi thông tin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form form={form} onFinish={onFinish}>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <Form.Item
                        label={"Kỹ năng"}
                        name={"skills"}
                        rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 skill!" }]}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            suffixIcon={null}
                            style={{ width: "100%" }}
                            placeholder={
                                <>
                                    <MonitorOutlined /> Tìm theo kỹ năng...
                                </>
                            }
                            optionLabelProp="label"
                            options={optionsSkills}
                        />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    {/* <Button onClick={() => form.submit()} type="primary" htmlType="submit" size="large" style={{ padding: "0 32px" }}>Cập nhật</Button> */}
                    <Button type="primary" htmlType="submit" size="large" style={{ padding: "0 32px" }}>Cập nhật</Button>
                </Col>
                {subscriber?.id && (
                    <Col span={24}>
                        <Popconfirm
                            title="Huỷ đăng ký"
                            description="Bạn có chắc chắn muốn huỷ đăng ký nhận email việc làm?"
                            onConfirm={async () => {
                                try {
                                    if (subscriber.id) {
                                        await callDeleteSubscriber(subscriber.id);
                                    }
                                    message.success("Huỷ đăng ký nhận email thành công!");
                                    setSubscriber(null);
                                    form.resetFields(); // clear form
                                } catch (error) {
                                    console.error("Lỗi khi huỷ đăng ký:", error);
                                    message.error("Có lỗi xảy ra khi huỷ đăng ký.");
                                }
                            }}
                            okText="Đồng ý"
                            cancelText="Huỷ"
                        >
                            <Button danger size="large">Huỷ đăng ký nhận email</Button>
                        </Popconfirm>
                    </Col>
                )}

            </Row>
        </Form>
    );
};

const ChangePassword = () => {
    const [form] = Form.useForm();
    const user = useAppSelector((state) => state.account.user);

    const onFinish = async (values: any) => {
        try {
            const res = await callChangePassword(user.id, values.oldPassword, values.newPassword);
            if (res && (res.statusCode === 200 || res.statusCode === 201)) {
                message.success("Cập nhật mật khẩu thành công");
                form.resetFields();
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res.message,
                });
            }
        } catch {
            message.error("Có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    return (
        <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
                label="Mật khẩu cũ"
                name="oldPassword"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
            >
                <Input.Password />
            </Form.Item>
            <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
            >
                <Input.Password />
            </Form.Item>
            <Form.Item
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu" },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue("newPassword") === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject("Mật khẩu xác nhận không khớp");
                        },
                    }),
                ]}
            >
                <Input.Password />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Cập nhật mật khẩu
                </Button>
            </Form.Item>
        </Form>
    );
};

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;
    const user = useAppSelector((state) => state.account.user);
    const items: TabsProps["items"] =
        Number(user.role?.id) === 2
            ? [
                {
                    key: "user-update-info",
                    label: `Cập nhật thông tin`,
                    children: <UserUpdateInfo />,
                },
                {
                    key: "user-password",
                    label: `Thay đổi mật khẩu`,
                    children: <ChangePassword />,
                },
            ]
            : [
                {
                    key: "user-resume",
                    label: `Ứng tuyển`,
                    children: <UserResume />,
                },
                {
                    key: "email-by-skills",
                    label: `Nhận công việc qua Email`,
                    children: <JobByEmail />,
                },
                {
                    key: "user-update-info",
                    label: `Cập nhật thông tin`,
                    children: <UserUpdateInfo />,
                },
                {
                    key: "user-password",
                    label: `Thay đổi mật khẩu`,
                    children: <ChangePassword />,
                },
            ];


    return (
        <Modal
            title="Quản lý tài khoản"
            open={open}
            onCancel={() => onClose(false)}
            maskClosable={false}
            footer={null}
            destroyOnClose={true}
            width={isMobile ? "100%" : "1000px"}
        >
            <div style={{ minHeight: 400 }}>
                <Tabs defaultActiveKey={user.role?.id === "2" ? "user-update-info" : "user-resume"} items={items} />
            </div>
        </Modal>
    );
};
export default ManageAccount;
