import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { IJob } from "@/types/backend";
import { callFetchJobById } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton, Tag } from "antd";
import { DollarOutlined, EnvironmentOutlined, HistoryOutlined, HourglassOutlined } from "@ant-design/icons";
import { getLocationName } from "@/config/utils";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ApplyModal from "@/components/client/modal/apply.modal";
dayjs.extend(relativeTime)

// Hàm helper để chuyển đổi thời gian sang tiếng Việt
const getTimeAgo = (date: string | Date) => {
    const now = dayjs();
    const past = dayjs(date);
    const diff = now.diff(past, 'second');

    if (diff < 60) {
        return 'vài giây trước';
    } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes} phút trước`;
    } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours} giờ trước`;
    } else if (diff < 2592000) {
        const days = Math.floor(diff / 86400);
        return `${days} ngày trước`;
    } else if (diff < 31536000) {
        const months = Math.floor(diff / 2592000);
        return `${months} tháng trước`;
    } else {
        const years = Math.floor(diff / 31536000);
        return `${years} năm trước`;
    }
};

const ClientJobDetailPage = (props: any) => {
    const [jobDetail, setJobDetail] = useState<IJob | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const navigate = useNavigate();

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                const res = await callFetchJobById(id);
                if (res?.data) {
                    setJobDetail(res.data)
                }
                setIsLoading(false)
            }
        }
        init();
    }, [id]);

    const handleCompanyClick = (companyId: string | undefined) => {
        if (companyId) {
            navigate(`/company/detail?id=${companyId}`);
        }
    };

    return (
        <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
            {isLoading ?
                <Skeleton />
                :
                <Row gutter={[20, 20]}>
                    {jobDetail && jobDetail.id &&
                        <>
                            <Col span={24} md={16}>
                                <div className={styles["header"]}>
                                    {jobDetail.name}
                                </div>
                                <div>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className={styles["btn-apply"]}
                                    >Ứng tuyển ngay</button>
                                </div>
                                <Divider />
                                <div className={styles["skills"]}>
                                    <span style={{ marginRight: '10px', fontSize: '16px'}}>Kỹ năng:</span>
                                    {jobDetail?.skills?.map((item: any, index) => {
                                        return (
                                            <Tag key={`${index}-key`} color="gold" >
                                                {item.name}
                                            </Tag>
                                        )
                                    })}
                                </div>
                                <div className={styles["salary"]}>
                                    <DollarOutlined />
                                    <span>&nbsp;{(jobDetail.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</span>
                                </div>
                                <div className={styles["location"]}>
                                    <EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{jobDetail.location}
                                </div>
                                <div className={styles["startDate"]}>
                                    <HistoryOutlined /> {jobDetail.startDate ? getTimeAgo(jobDetail.startDate) : getTimeAgo(jobDetail.startDate)}
                                </div>
                                <div className={styles["endDate"]}>
                                    <HourglassOutlined /> Hạn nộp hồ sơ đến: {jobDetail.endDate ? dayjs(jobDetail.endDate).format('DD/MM/YYYY') : "Không có"}
                                </div>
                                <Divider />
                                {parse(jobDetail.description)}
                            </Col>

                            <Col span={24} md={8}>
                                <div className={styles["company"]}>
                                    <div className={styles["company-header"]}>
                                        <h3>Công ty</h3>
                                    </div>
                                    <div className={styles["company-content"]}>
                                        <div className={styles["company-logo"]}>
                                            <img
                                                width={"100%"}
                                                alt={jobDetail.company?.name}
                                                src={jobDetail.company?.logo?.startsWith("http") ? jobDetail.company?.logo : `${import.meta.env.VITE_BACKEND_URL}/storage/company/${jobDetail.company?.logo}`}
                                            />
                                        </div>
                                        <div className={styles["company-info"]}>
                                            <h4 
                                                className={styles["company-name"]}
                                                onClick={() => handleCompanyClick(jobDetail.company?.id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {jobDetail.company?.name}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </>
                    }
                </Row>
            }
            <ApplyModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                jobDetail={jobDetail}
            />
        </div>
    )
}
export default ClientJobDetailPage;