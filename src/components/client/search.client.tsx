import { Button, Col, Form, Row, Select, notification, Input, Typography } from 'antd';
import { DownOutlined, EnvironmentOutlined, MonitorOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { LOCATION_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { callFetchAllSkill } from '@/config/api';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from '@/styles/client.module.scss';

const SearchClient = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchParams] = useSearchParams();
    const { Text } = Typography;

    const optionsLocations = LOCATION_LIST;
    const [form] = Form.useForm();
    const [optionsSkills, setOptionsSkills] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        if (location.search) {
            const queryLocation = searchParams.get("location");
            const querySkills = searchParams.get("skills");
            const querySearch = searchParams.get("search");
            if (queryLocation) {
                form.setFieldValue("location", queryLocation);
            }
            if (querySkills) {
                form.setFieldValue("skills", querySkills.split(","));
            }
            if (querySearch) {
                form.setFieldValue("search", querySearch);
                setIsExpanded(true);
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
        if (values?.search) {
            params.search = values.search;
        }

        if (!params["location"] && !params.skills && !params.search) {
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

    const renderSearchInfo = () => {
        const queryLocation = searchParams.get("location");
        const querySkills = searchParams.get("skills");
        const querySearch = searchParams.get("search");

        if (!queryLocation && !querySkills && !querySearch) return null;

        const searchTerms = [];
        if (querySearch) {
            searchTerms.push(`"${querySearch}"`);
        }
        if (queryLocation) {
            searchTerms.push(`địa điểm "${queryLocation}"`);
        }
        if (querySkills) {
            const skills = querySkills.split(",");
            searchTerms.push(`kỹ năng "${skills.join(", ")}"`);
        }

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
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </ProForm.Item>
                    </Col>

                    <Col xs={24} md={4}>
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

                    <Col xs={24} md={4}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Button 
                                type="primary" 
                                onClick={() => form.submit()} 
                                block 
                                size="large"
                                className={styles.searchButton}
                            >
                                Tìm Việc
                            </Button>
                            {location.pathname === '/job' && (
                                <Button 
                                    type="link" 
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    style={{ color: '#1677ff', padding: '0 8px' }}
                                >
                                    {isExpanded ? (
                                        <>
                                            Thu gọn <UpOutlined style={{ marginLeft: '1px'}} />
                                        </>
                                    ) : (
                                        <>
                                            Mở rộng <DownOutlined style={{ marginLeft: '1px' }} />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </Col>

                    {isExpanded && (
                        <Col span={24}>
                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                <ProForm.Item name="search">
                                    <Input
                                        placeholder="Tìm kiếm theo tên công việc hoặc tên công ty..."
                                        size="large"
                                        style={{ 
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                </ProForm.Item>
                            </div>
                        </Col>
                    )}

                    {renderSearchInfo()}
                </Row>
            </ProForm>
        </div>
    );
};

export default SearchClient;
