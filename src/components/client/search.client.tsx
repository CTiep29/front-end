import { Button, Col, Form, Row, Select, notification } from 'antd';
import { EnvironmentOutlined, MonitorOutlined } from '@ant-design/icons';
import { LOCATION_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { callFetchAllSkill } from '@/config/api';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from '@/styles/client.module.scss';

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
                form.setFieldValue("location", queryLocation);
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
    const encodeParams = (params: Record<string, string | string[]>) => {
        const query = new URLSearchParams();
        for (const key in params) {
            const value = params[key];
            if (Array.isArray(value)) {
                query.set(key, value.join(","));
            } else {
                query.set(key, value);
            }
        }
        return query.toString();
    };
    const onFinish = async (values: any) => {

        const params: Record<string, string | string[]> = {};

        if (values?.location?.length) {
            params["location"] = values.location;
        }
        if (values?.skills?.length) {
            params.skills = values.skills;
        }

        if (!params["location"] && !params.skills) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: "Vui lòng chọn tiêu chí để tìm kiếm"
            });
            return;
        }

        const query = encodeParams(params);
        console.log("Query string gửi đi:", query);
        navigate(`/job?${query}`);
    };

    return (
        <div className={styles.searchSection}>
            <ProForm
                form={form}
                onFinish={onFinish}
                submitter={{ render: () => <></> }}
            >
                <Row gutter={[20, 20]} justify="center">
                    <Col span={24}>
                        <h1 className={styles.searchTitle}>
                            Tìm Kiếm Việc Làm Ngành Công Nghệ Thông Tin
                        </h1>
                    </Col>

                    <Col xs={24} md={16}>
                        <ProForm.Item name="skills">
                            <Select
                                mode="multiple"
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={<>Chọn kỹ năng...</>}
                                optionLabelProp="label"
                                options={optionsSkills}
                                className={styles.searchSelect}
                            />
                        </ProForm.Item>
                    </Col>

                    <Col xs={12} md={4}>
                        <ProForm.Item name="location">
                            <Select
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={<><EnvironmentOutlined /> Địa điểm...</>}
                                optionLabelProp="label"
                                options={optionsLocations}
                                className={styles.searchSelect}
                            />
                        </ProForm.Item>
                    </Col>

                    <Col xs={12} md={4}>
                        <Button 
                            type="primary" 
                            onClick={() => form.submit()} 
                            block 
                            size="large"
                            className={styles.searchButton}
                        >
                            Tìm Việc
                        </Button>
                    </Col>
                </Row>
            </ProForm>
        </div>
    );
};

export default SearchClient;
