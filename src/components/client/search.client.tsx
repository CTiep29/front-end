import { Button, Col, Form, Row, Select, notification } from 'antd';
import { EnvironmentOutlined, MonitorOutlined } from '@ant-design/icons';
import { LOCATION_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { callFetchAllSkill } from '@/config/api';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const SearchClient = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const optionsLocations = LOCATION_LIST;
    const [form] = Form.useForm();
    const [optionsSkills, setOptionsSkills] = useState<{ label: string; value: string }[]>([]);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (location.search) {
            const queryLocation = searchParams.get("location");
            const querySkills = searchParams.get("skills");
            if (queryLocation) {
                form.setFieldValue("location", queryLocation.split(","));
            }
            if (querySkills) {
                form.setFieldValue("skills", querySkills.split(","));
            }
        }
    }, [location.search]);

    useEffect(() => {
        fetchSkill();
    }, []);

    const fetchSkill = async () => {
        const res = await callFetchAllSkill(`page=1&size=100&sort=createdAt,desc`);
        if (res && res.data) {
            const arr = res.data.result?.map(item => ({
                label: item.name as string,
                value: item.id + "" as string
            })) ?? [];
            setOptionsSkills(arr);
        }
    };

    const onFinish = async (values: any) => {
        let query = "";
        if (values?.location?.length) {
            query = `location=${values.location.join(",")}`;
        }
        if (values?.skills?.length) {
            query += query ? `&skills=${values.skills.join(",")}` : `skills=${values.skills.join(",")}`;
        }

        if (!query) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: "Vui lòng chọn tiêu chí để tìm kiếm"
            });
            return;
        }
        navigate(`/job?${query}`);
    };

    return (
        <div style={{
            background: '#f0f6ff',
            padding: '50px 20px',
            borderRadius: 12,
            maxWidth: 1000,
            margin: '30px auto'
        }}>
            <ProForm
                form={form}
                onFinish={onFinish}
                submitter={{ render: () => <></> }}
            >
                <Row gutter={[20, 20]} justify="center">
                    <Col span={24}>
                        <h1 style={{
                            fontSize: 28,
                            fontWeight: 600,
                            textAlign: 'center',
                            marginBottom: 20,
                            color: '#2d5fa5'
                        }}>
                            🔍 Tìm Kiếm Việc Làm IT
                        </h1>
                    </Col>

                    <Col xs={24} md={16}>
                        <ProForm.Item name="skills">
                            <Select
                                mode="multiple"
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={<><MonitorOutlined /> Chọn kỹ năng...</>}
                                optionLabelProp="label"
                                options={optionsSkills}
                            />
                        </ProForm.Item>
                    </Col>

                    <Col xs={12} md={4}>
                        <ProForm.Item name="location">
                            <Select
                                mode="multiple"
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={<><EnvironmentOutlined /> Địa điểm...</>}
                                optionLabelProp="label"
                                options={optionsLocations}
                            />
                        </ProForm.Item>
                    </Col>

                    <Col xs={12} md={4}>
                        <Button type="primary" onClick={() => form.submit()} block size="middle">
                            Tìm Việc
                        </Button>
                    </Col>
                </Row>
            </ProForm>
        </div>
    );
};

export default SearchClient;
