import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ICompany, IJob, ICompanyStats, ISkill } from "@/types/backend";
import { callFetchCompanyById, callFetchJobByCompanyId, fetchCompanyStats } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton, Tag, Typography } from "antd";
import { DollarOutlined, EnvironmentOutlined, ShareAltOutlined } from "@ant-design/icons";
import dayjs from "dayjs"; // THÊM thư viện format date nếu cần

const { Title, Text } = Typography;

const ClientCompanyDetailPage = (props: any) => {
    const [companyDetail, setCompanyDetail] = useState<ICompany | null>(null);
    const [jobList, setJobList] = useState<IJob[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [totalJobs, setTotalJobs] = useState<number>(0);
    const [companyStats, setCompanyStats] = useState<{ [key: string]: ICompanyStats }>({});
    const [skillNames, setSkillNames] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id");

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true);
                const resCompany = await callFetchCompanyById(id);
                if (resCompany?.data) {
                    setCompanyDetail(resCompany.data);
                    // Fetch company stats
                    const statsRes = await fetchCompanyStats(id);
                    if (statsRes?.data) {
                        setCompanyStats(prev => ({
                            ...prev,
                            [id]: statsRes.data as ICompanyStats
                        }));
                    }
                }

                const query = `page=1&pageSize=10&sort=startDate,desc&isActive=true`;
                const resJobs = await callFetchJobByCompanyId(id, query);
                if (resJobs?.data?.result) {
                    setJobList(resJobs.data.result);
                    setTotalJobs(resJobs.data.meta.total);
                }

                setIsLoading(false);
            }
        }
        init();
    }, [id]);

    const handleJobClick = (jobId: string | undefined) => {
        if (jobId) {
            navigate(`/job/detail?id=${jobId}`);
        }
    };

    return (
        <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
            {isLoading ? (
                <Skeleton />
            ) : (
                <Row gutter={[20, 20]}>
                    {companyDetail && companyDetail.id && (
                        <>
                            <Col span={24} md={16}>
                                <div className={styles["header"]}>
                                    {companyDetail.name}
                                </div>

                                <div style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    padding: '16px',
                                    marginTop: '16px'
                                }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                                            <EnvironmentOutlined style={{ color: '#58aaab', marginRight: '8px' }} />
                                            Địa chỉ công ty
                                        </Text>
                                        <Text>{companyDetail.address}</Text>
                                    </div>
                                    <Row gutter={[24, 24]}>
                                        <Col span={24}>
                                            <div style={{
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                position: 'relative',
                                                height: '300px'
                                            }}>
                                                {companyDetail?.url ? (
                                                    <iframe
                                                        src={companyDetail.url}
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
                                        </Col>
                                    </Row>
                                </div>
                                <Divider />
                                <div style={{ marginBottom: '16px' }}>
                                        <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                                            <ShareAltOutlined style={{ color: '#58aaab', marginRight: '8px' }} />
                                            Mô tả tổng quan
                                        </Text>
                                    </div>
                                {parse(companyDetail?.description ?? "")}
                            </Col>

                            <Col span={24} md={8}>
                                <div className={styles["company"]}>
                                    <div>
                                        <img
                                            width={200}
                                            alt="example"
                                            src={companyDetail.logo?.startsWith("http") ? companyDetail.logo : `${import.meta.env.VITE_BACKEND_URL}/storage/company/${companyDetail.logo}`}
                                        />
                                    </div>
                                    <div>
                                        {companyDetail?.name}
                                    </div>
                                </div>

                                <div className={styles["job-list"]}>
                                    <h3>{companyStats[companyDetail.id]?.activeJobs || 0} công việc tuyển dụng</h3>
                                    <div style={{ 
                                        maxHeight: '600px', 
                                        overflowY: 'auto',
                                        padding: '0 8px',
                                        marginTop: '16px'
                                    }}>
                                        {jobList.filter(job => job.active).length > 0 ? (
                                            jobList.filter(job => job.active).map((job) => (
                                                <div 
                                                    key={job.id} 
                                                    className={styles["job-card"]} 
                                                    style={{ 
                                                        marginBottom: '16px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onClick={() => handleJobClick(job.id)}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                                    }}
                                                >
                                                    <div className={styles["job-start-date"]}>
                                                        {job.startDate ? dayjs(job.startDate).locale('en').fromNow() : dayjs(job.startDate).locale('en').fromNow()}
                                                    </div>
                                                    <div className={styles["job-title"]}>
                                                        {job.name}
                                                    </div>
                                                    <div className={styles["job-salary"]}>
                                                        <DollarOutlined />
                                                        <span>&nbsp;{(job.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</span>
                                                    </div>
                                                    <div className={styles["job-location"]}>
                                                        <EnvironmentOutlined /> {job.location ?? "Địa chỉ không có"}
                                                    </div>
                                                    <div className={styles["skills"]}>
                                                        {job.skills?.map((item, index) => (
                                                            <Tag key={`${index}-key`} color="gold">
                                                                {typeof item === 'string' ? item : (item as ISkill).name}
                                                            </Tag>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div>Chưa có việc làm.</div>
                                        )}
                                    </div>
                                </div>
                            </Col>
                        </>
                    )}
                </Row>
            )}
        </div>
    )
}
export default ClientCompanyDetailPage;
