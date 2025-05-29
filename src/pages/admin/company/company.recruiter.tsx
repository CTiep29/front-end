import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { ICompany } from "@/types/backend";
import { Descriptions, Card, Button, Spin, message, Row, Col, Typography, Divider, Tag, Image } from "antd";
import { EditOutlined, EnvironmentOutlined, GlobalOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ModalCompany from "@/components/admin/company/modal.company";
import { callFetchCompanyById, callUpdateCompany } from "@/config/api";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Title, Text } = Typography;

const RecruiterCompanyPage = () => {
    const user = useAppSelector(state => state.account.user);
    const [company, setCompany] = useState<ICompany | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [openModal, setOpenModal] = useState(false);
    const [dataInit, setDataInit] = useState<ICompany | null>(null);

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        if (user?.company_id) {
            setLoading(true);
            const res = await callFetchCompanyById(user.company_id);
            if (res && res.data) {
                setCompany(res.data);
            }
            setLoading(false);
        }
    };

    const handleUpdateCompany = async (data: ICompany) => {
        if (!data.id) return;
        const res = await callUpdateCompany(
            data.id,
            data.name || '',
            data.address || '',
            data.description || '',
            data.logo,
            data.taxCode || '',
            data.url || ''
        );
        if (res.data) {
            message.success("Cập nhật thông tin công ty thành công");
            fetchCompany();
        } else {
            message.error(res.message);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Thông tin công ty</h1>
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <Image
                            src={company?.logo}
                            alt={company?.name}
                            width={100}
                            height={100}
                            style={{
                                objectFit: 'cover',
                                borderRadius: '12px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                            }}
                            preview={true}
                        />
                        <div>
                            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>{company?.name}</Title>
                            <Tag
                                color={company?.active ? "success" : "error"}
                                style={{
                                    marginTop: '8px',
                                    padding: '4px 12px',
                                    fontSize: '14px'
                                }}
                            >
                                {company?.active ? "Đang hoạt động" : "Không hoạt động"}
                            </Tag>
                        </div>
                    </div>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="large"
                        onClick={() => {
                            setDataInit(company);
                            setOpenModal(true);
                        }}
                    >
                        Chỉnh sửa thông tin
                    </Button>
                }
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
                <Row gutter={[24, 24]}>
                    <Col span={24}>
                        <Card
                            type="inner"
                            title={
                                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                    Thông tin liên hệ
                                </span>
                            }
                            style={{ background: '#fafafa' }}
                        >
                            <Row gutter={[24, 24]}>
                                <Col span={12}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        background: 'white',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}>
                                        <EnvironmentOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                                        <div>
                                            <Text strong style={{ display: 'block', marginBottom: '4px' }}>Địa chỉ</Text>
                                            <Text>{company?.address || 'Chưa cập nhật'}</Text>
                                        </div>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        padding: '16px',
                                        background: 'white',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        height: '100%',
                                        minHeight: '400px'
                                    }}>
                                        <Text strong style={{ fontSize: '16px' }}>Vị trí</Text>
                                        <div style={{
                                            flex: 1,
                                            minHeight: '350px',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            position: 'relative'
                                        }}>
                                            {company?.url ? (
                                                <iframe
                                                    src={company.url}
                                                    width="100%"
                                                    height="100%"
                                                    style={{ 
                                                        border: 0,
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0
                                                    }}
                                                    allowFullScreen
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: '#f5f5f5',
                                                    color: '#999',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0
                                                }}>
                                                    Chưa có thông tin bản đồ
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Card
                            type="inner"
                            title={
                                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                    Mã số thuế
                                </span>
                            }
                            style={{ background: '#fafafa' }}
                        >
                            <Text style={{ fontSize: '16px' }}>{company?.taxCode || 'Chưa cập nhật'}</Text>
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Card
                            type="inner"
                            title={
                                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                    Mô tả công ty
                                </span>
                            }
                            style={{ background: '#fafafa' }}
                        >
                            <div style={{
                                padding: '16px',
                                background: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <ReactQuill
                                    value={company?.description}
                                    readOnly={true}
                                    theme="snow"
                                    modules={{ toolbar: false }}
                                />
                            </div>
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Card
                            type="inner"
                            title={
                                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                    Thông tin bổ sung
                                </span>
                            }
                            style={{ background: '#fafafa' }}
                        >
                            <Row gutter={[24, 24]}>
                                <Col span={12}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        background: 'white',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}>
                                        <ClockCircleOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                                        <div>
                                            <Text strong style={{ display: 'block', marginBottom: '4px' }}>Ngày tạo</Text>
                                            <Text>{dayjs(company?.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                                        </div>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        background: 'white',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}>
                                        <ClockCircleOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                                        <div>
                                            <Text strong style={{ display: 'block', marginBottom: '4px' }}>Cập nhật lần cuối</Text>
                                            <Text>{dayjs(company?.updatedAt).format('DD/MM/YYYY HH:mm')}</Text>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Card>

            <ModalCompany
                openModal={openModal}
                setOpenModal={setOpenModal}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={fetchCompany}
            />
        </div>
    );
};

export default RecruiterCompanyPage;