import { Button, Col, Form, Input, Modal, Row, Select, Table, Tabs, message, notification } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { IResume, ISubscribers } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callChangePassword, callCreateSubscriber, callFetchAllSkill, callFetchResumeByUser, callGetSubscriberSkills, callUpdateSubscriber } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { MonitorOutlined } from "@ant-design/icons";
import { SKILLS_LIST } from "@/config/utils";
import { useAppSelector } from "@/redux/hooks";
import UserUpdateInfo from "./update.info";

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserResume = (props: any) => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            setIsFetching(true);
            const res = await callFetchResumeByUser();
            if (res && res.data) {
                setListCV(res.data.result as IResume[])
            }
            setIsFetching(false);
        }
        init();
    }, [])

    const columns: ColumnsType<IResume> = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1)}
                    </>)
            }
        },
        {
            title: 'Công Ty',
            dataIndex: "companyName",

        },
        {
            title: 'Job title',
            dataIndex: ["job", "name"],

        },
        {
            title: 'Trạng thái',
            dataIndex: "status",
        },
        {
            title: 'Ngày rải CV',
            dataIndex: "createdAt",
            render(value, record, index) {
                return (
                    <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        },
        {
            title: '',
            dataIndex: "",
            render(value, record, index) {
                return (
                    <a
                        href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${record?.url}`}
                        target="_blank"
                    >Chi tiết</a>
                )
            },
        },
    ];

    return (
        <div>
            <Table<IResume>
                columns={columns}
                dataSource={listCV}
                loading={isFetching}
                pagination={false}
            />
        </div>
    )
}

// const UserUpdateInfo = (props: any) => {
//     return (
//         <div>
//             //todo
//         </div>
//     )
// }

const JobByEmail = (props: any) => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);
    const [optionsSkills, setOptionsSkills] = useState<{
        label: string;
        value: string;
    }[]>([]);

    const [subscriber, setSubscriber] = useState<ISubscribers | null>(null);

    useEffect(() => {
        const init = async () => {
            await fetchSkill();
            const res = await callGetSubscriberSkills();
            if (res && res.data) {
                setSubscriber(res.data);
                const d = res.data.skills;
                const arr = d.map((item: any) => {
                    return {
                        label: item.name as string,
                        value: item.id + "" as string
                    }
                });
                form.setFieldValue("skills", arr);
            }
        }
        init();
    }, [])

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
        const { skills } = values;

        const arr = skills?.map((item: any) => {
            if (item?.id) return { id: item.id };
            return { id: item }
        });

        if (!subscriber?.id) {
            //create subscriber
            const data = {
                email: user.email,
                name: user.name,
                skills: arr
            }

            const res = await callCreateSubscriber(data);
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }


        } else {
            //update subscriber
            const res = await callUpdateSubscriber({
                id: subscriber?.id,
                skills: arr
            });
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }


    }

    return (
        <>
            <Form
                onFinish={onFinish}
                form={form}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <Form.Item
                            label={"Kỹ năng"}
                            name={"skills"}
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 skill!' }]}

                        >
                            <Select
                                mode="multiple"
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
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
                        <Button onClick={() => form.submit()}>Cập nhật</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

const ChangePassword = (props: any) => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);

    const onFinish = async (values: any) => {
        const { oldPassword, newPassword } = values;

        try {
            const res = await callChangePassword(user.id, oldPassword, newPassword);

            if (res && (res.statusCode === 200 || res.statusCode === 201)) {
                message.success('Cập nhật mật khẩu thành công');
                form.resetFields();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } catch (error: any) {
            message.error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    return (
        <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
        >
            <Form.Item
                label="Mật khẩu cũ"
                name="oldPassword"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject('Mật khẩu xác nhận không khớp');
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

    const onChange = (key: string) => {
        // console.log(key);
    };

    const items: TabsProps['items'] = [
        {
            key: 'user-resume',
            label: `Rải CV`,
            children: <UserResume />,
        },
        {
            key: 'email-by-skills',
            label: `Nhận Jobs qua Email`,
            children: <JobByEmail />,
        },
        {
            key: 'user-update-info',
            label: `Cập nhật thông tin`,
            children: <UserUpdateInfo />,
        },
        {
            key: 'user-password',
            label: `Thay đổi mật khẩu`,
            children: <ChangePassword />,
        },
    ];


    return (
        <>
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
                    <Tabs
                        defaultActiveKey="user-resume"
                        items={items}
                        onChange={onChange}
                    />
                </div>

            </Modal>
        </>
    )
}

export default ManageAccount;