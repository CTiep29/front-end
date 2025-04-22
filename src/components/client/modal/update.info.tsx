import { Button, Col, Form, Input, Row, Select, Upload, message } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { callUploadSingleFile, callUpdateUser } from "@/config/api";
import { IUser } from "@/types/backend";
import type { UploadProps } from "antd";

const { Option } = Select;

const UserUpdateInfo = () => {
    const userFromStore = useAppSelector(state => state.account.user);
    const [form] = Form.useForm();

    const [userInfo, setUserInfo] = useState<Partial<IUser>>({
        id: userFromStore.id,
        name: userFromStore.name,
        email: userFromStore.email,
        avatar: userFromStore.avatar,
        cv: userFromStore.cv,
    });

    const [avatarUrl, setAvatarUrl] = useState<string>(userFromStore.avatar || '');
    const [cvFileName, setCvFileName] = useState<string>(userFromStore.cv || '');

    useEffect(() => {
        console.log("userFromStore", userFromStore);
        const updatedUser: Partial<IUser> = {
            id: userFromStore.id,
            name: userFromStore.name,
            email: userFromStore.email,
            avatar: userFromStore.avatar,
            cv: userFromStore.cv,
            age: typeof userFromStore.age === "string" ? parseInt(userFromStore.age) : userFromStore.age,
            gender: userFromStore.gender,
            address: userFromStore.address,
        };

        setUserInfo(updatedUser);
        setAvatarUrl(userFromStore.avatar || '');
        setCvFileName(userFromStore.cv || '');
        form.setFieldsValue(updatedUser);
    }, [userFromStore]);



    const onFinish = async (values: any) => {
        try {
            const payload: IUser = {
                ...userInfo,
                ...values,
            } as IUser;

            const res = await callUpdateUser(payload);
            if (res?.data) {
                message.success("Cập nhật thông tin thành công");
            }
        } catch (err) {
            message.error("Cập nhật thất bại");
        }
    };

    const uploadAvatarProps: UploadProps = {
        maxCount: 1,
        multiple: false,
        accept: "image/*",
        showUploadList: false,
        async customRequest({ file, onSuccess, onError }: any) {
            try {
                const res = await callUploadSingleFile(file, "avatar");
                const fileName = res?.data?.fileName;
                if (!fileName) throw new Error(res?.message || "Không nhận được tên file từ server");

                const payload: IUser = {
                    ...userInfo,
                    name: userInfo.name ?? "",
                    email: userInfo.email ?? "",
                    password: userInfo.password ?? "",
                    age: userInfo.age ?? 0,
                    gender: userInfo.gender ?? "OTHER",
                    address: userInfo.address ?? "",
                    avatar: fileName,
                    cv: userInfo.cv ?? "",
                };

                const updateRes = await callUpdateUser(payload);
                if (updateRes?.data) {
                    message.success("Cập nhật ảnh đại diện thành công");
                    setUserInfo(prev => ({ ...prev, avatar: fileName }));
                    setAvatarUrl(fileName);
                    if (onSuccess) onSuccess("ok");
                } else {
                    throw new Error(updateRes?.message || "Cập nhật thất bại");
                }
            } catch (err: any) {
                message.error(err.message || "Upload ảnh đại diện thất bại");
                if (onError) onError({ event: err });
            }
        }
    };

    const uploadCVProps: UploadProps = {
        maxCount: 1,
        multiple: false,
        accept: "application/pdf,application/msword,.doc,.docx",
        showUploadList: false,
        async customRequest({ file, onSuccess, onError }: any) {
            try {
                const res = await callUploadSingleFile(file, "cv");
                const fileName = res?.data?.fileName;
                if (!fileName) throw new Error(res?.message || "Không nhận được tên file từ server");

                const payload: IUser = {
                    ...userInfo,
                    name: userInfo.name ?? "",
                    email: userInfo.email ?? "",
                    password: userInfo.password ?? "",
                    age: userInfo.age ?? 0,
                    gender: userInfo.gender ?? "OTHER",
                    address: userInfo.address ?? "",
                    cv: fileName,
                    avatar: userInfo.avatar ?? "",
                };

                const updateRes = await callUpdateUser(payload);
                if (updateRes?.data) {
                    message.success("Upload CV thành công");
                    setUserInfo(prev => ({ ...prev, cv: fileName }));
                    setCvFileName(fileName);
                    if (onSuccess) onSuccess("ok");
                } else {
                    throw new Error(updateRes?.message || "Cập nhật CV thất bại");
                }
            } catch (err: any) {
                message.error(err.message || "Upload CV thất bại");
                if (onError) onError({ event: err });
            }
        }
    };

    return (
        <Form form={form} onFinish={onFinish} layout="vertical">
            <Row gutter={[16, 16]}>
                <Col span={24} style={{ textAlign: "center" }}>
                    <Upload {...uploadAvatarProps}>
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="avatar"
                                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ border: "1px dashed #d9d9d9", padding: 16, textAlign: "center", borderRadius: 8 }}>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        )}
                    </Upload>
                </Col>
                <Col span={12}>
                    <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="age" label="Tuổi">
                        <Input type="number" />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="gender" label="Giới tính">
                        <Select>
                            <Option value="MALE">Nam</Option>
                            <Option value="FEMALE">Nữ</Option>
                            <Option value="OTHER">Khác</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input />
                    </Form.Item>
                </Col>

                <Col span={24} style={{ textAlign: "center" }}>
                    <label>Tải lên CV:</label>
                    <Upload {...uploadCVProps}>
                        <Button icon={<UploadOutlined />} style={{ marginLeft: 8 }}>Tải CV</Button>
                    </Upload>
                    {(cvFileName) && (
                        <div style={{ marginTop: 8, fontStyle: "italic" }}>
                            📄 {cvFileName}
                        </div>
                    )}
                </Col>

                <Col span={24}>
                    <Button type="primary" htmlType="submit">
                        Cập nhật thông tin
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

export default UserUpdateInfo;
