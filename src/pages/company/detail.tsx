import { useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ICompany, IJob } from "@/types/backend";
import { callFetchCompanyById, callFetchJobByCompanyId } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton, Tag } from "antd";
import { DollarOutlined, EnvironmentOutlined } from "@ant-design/icons";
import dayjs from "dayjs"; // THÊM thư viện format date nếu cần

const ClientCompanyDetailPage = (props: any) => {
    const [companyDetail, setCompanyDetail] = useState<ICompany | null>(null);
    const [jobList, setJobList] = useState<IJob[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
                }

                const query = `page=1&pageSize=2&sort=startDate,desc`;
                const resJobs = await callFetchJobByCompanyId(id, query);
                if (resJobs?.data?.result) {
                    setJobList(resJobs.data.result);
                }

                setIsLoading(false);
            }
        }
        init();
    }, [id]);

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

                                <div className={styles["location"]}>
                                    <EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{companyDetail.address}
                                </div>

                                <Divider />
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
                                    <h3>Việc làm mới nhất</h3>
                                    {jobList.length > 0 ? (
                                        jobList.map((job) => (
                                            <div key={job.id} className={styles["job-card"]}>
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
                                                            {item.name}
                                                        </Tag>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div>Chưa có việc làm.</div>
                                    )}
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
