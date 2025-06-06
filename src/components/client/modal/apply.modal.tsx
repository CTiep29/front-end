import { useAppSelector } from "@/redux/hooks";
import { IJob } from "@/types/backend";
import { ProForm, ProFormText } from "@ant-design/pro-components";
import { Button, Col, ConfigProvider, Divider, Modal, Row, Upload, message, notification } from "antd";
import { useNavigate } from "react-router-dom";
import enUS from 'antd/lib/locale/en_US';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { callCreateResume, callUploadSingleFile } from "@/config/api";
import { useState } from 'react';

interface IProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    jobDetail: IJob | null;
}

const ApplyModal = (props: IProps) => {
    const { isModalOpen, setIsModalOpen, jobDetail } = props;
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [urlCV, setUrlCV] = useState<string>("");

    const navigate = useNavigate();

    const handleOkButton = async () => {
        if (!urlCV && isAuthenticated) {
            message.error("Vui lòng tải lên CV!");
            return;
        }

        if (!isAuthenticated) {
            setIsModalOpen(false);
            navigate(`/login?callback=${window.location.href}`)
        }
        else {
            //todo
            if (jobDetail) {
                const res = await callCreateResume(urlCV, jobDetail?.id, user.email, user.id);
                if (res.data) {
                    message.success("Ứng tuyển thành công!");
                    setIsModalOpen(false);
                } else {
                    if (res.message?.includes("ứng tuyển công việc này rồi")) {
                        notification.warning({
                            message: 'Ứng tuyển thất bại',
                            description: res.message,
                            duration: 5
                        });
                    } else {
                        notification.error({
                            message: 'Có lỗi xảy ra',
                            description: res.message,
                            duration: 5
                        });
                    }
                }
            }
        }
    }

    const propsUpload: UploadProps = {
        maxCount: 1,
        multiple: false,
        accept: "application/pdf,application/msword, .doc, .docx, .pdf",
        async customRequest({ file, onSuccess, onError }: any) {
            const res = await callUploadSingleFile(file, "resume");
            if (res && res.data) {
                setUrlCV(res.data.fileName);
                if (onSuccess) onSuccess('ok')
            } else {
                if (onError) {
                    setUrlCV("");
                    const error = new Error(res.message);
                    onError({ event: error });
                }
            }
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                // console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} đã được tải lên thành công`);
            } else if (info.file.status === 'error') {
                message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.")
            }
        },
    };


    return (
        <>
            <Modal title="Ứng Tuyển Công Việc"
                open={isModalOpen}
                onOk={() => handleOkButton()}
                onCancel={() => setIsModalOpen(false)}
                maskClosable={false}
                okText={isAuthenticated ? "Ứng tuyển " : "Đăng Nhập Nhanh"}
                cancelButtonProps={
                    { style: { display: "none" } }
                }
                destroyOnClose={true}
            >
                <Divider />
                {isAuthenticated ?
                    <div>
                        <ConfigProvider locale={enUS}>
                            <ProForm
                                submitter={{
                                    render: () => <></>
                                }}
                            >
                                <Row gutter={[10, 10]}>
                                    <Col span={24}>
                                        <div>
                                            Bạn đang ứng tuyển công việc <b>{jobDetail?.name} </b>tại  <b>{jobDetail?.company?.name}</b>
                                        </div>
                                    </Col>
                                    <Col span={24}>
                                        <ProFormText
                                            fieldProps={{
                                                type: "email"
                                            }}
                                            label="Email"
                                            name={"email"}
                                            labelAlign="right"
                                            disabled
                                            initialValue={user?.email}
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <ProForm.Item
                                            label={"Tải lên CV"}
                                            rules={[{ required: true, message: 'Vui lòng tải lên CV!' }]}
                                        >

                                            <Upload {...propsUpload}>
                                                <Button icon={<UploadOutlined />}>Tải lên CV của bạn ( Hỗ trợ *.doc, *.docx, *.pdf, and &lt; 5MB )</Button>
                                            </Upload>
                                        </ProForm.Item>
                                    </Col>
                                </Row>

                            </ProForm>
                        </ConfigProvider>
                    </div>
                    :
                    <div>
                        Bạn chưa đăng nhập hệ thống. Vui lòng đăng nhập để có thể ứng tuyển công việc này.
                    </div>
                }
                <Divider />
            </Modal>
        </>
    )
}
export default ApplyModal;
