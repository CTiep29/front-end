import { callFetchJob } from '@/config/api';
import { convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { EnvironmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from '@/styles/client.module.scss';
import { sfIn } from "spring-filter-query-builder";

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

interface IProps {
    showPagination?: boolean;
    isHomePage?: boolean;
}

const JobCard = (props: IProps) => {
    const { showPagination = false, isHomePage = false } = props;
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    console.log('JobCard props:', { showPagination, isHomePage });
    console.log('Current location:', location.pathname);

    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=startDate,desc");

    useEffect(() => {
        fetchJob();
    }, [current, pageSize, filter, sortQuery, location]);

    const fetchJob = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;

        console.log('Before fetch - isHomePage:', isHomePage);
        console.log('Before fetch - current query:', query);

        if (isHomePage) {
            query = `page=1&size=6&sort=startDate,desc`;
            setSortQuery("sort=startDate,desc");
            console.log('Homepage query updated:', query);
        }

        let finalFilter = filter ? filter : "active=true";
        query += `&filter=${encodeURIComponent(finalFilter)}`;

        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        console.log('Final query:', query);

        const queryLocation = searchParams.get("location");
        const querySkills = searchParams.get("skills")
        if (queryLocation || querySkills) {
            let q = "";
            if (queryLocation) {
                q = `location ~ '${queryLocation}'`;
            }

            if (querySkills) {
                q = queryLocation ?
                    q + " and " + `${sfIn("skills", querySkills.split(","))}`
                    : `${sfIn("skills", querySkills.split(","))}`;
            }

            query += `&filter=${encodeURIComponent(q)}`;
        }

        const res = await callFetchJob(query);
        if (res && res.data) {
            console.log('API Response:', res.data);
            setDisplayJob(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false);
    }

    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item.id}`)
    }

    return (
        <div className={styles["card-job-section"]}>
            <div className={styles["job-content"]}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[0, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <span className={styles["title"]}>
                                    {isHomePage ? "Công Việc Mới Nhất" : "Danh Sách Việc Làm"}
                                </span>
                                {!isHomePage && !showPagination &&
                                    <Link to="/job" className={styles.viewAllLink}>Xem tất cả</Link>
                                }
                            </div>
                        </Col>

                        {displayJob?.map(item => {
                            return (
                                <Col span={24} key={item.id}>
                                    <Card
                                        className={styles.jobCard}
                                        hoverable
                                        onClick={() => handleViewDetailJob(item)}
                                    >
                                        <div className={styles["card-job-content"]}>
                                            <div className={styles["card-job-left"]}>
                                                <img
                                                    alt={item.company?.name}
                                                    src={item?.company?.logo?.startsWith("http") ? item?.company?.logo : `${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.company?.logo}`}
                                                />
                                            </div>
                                            <div className={styles["card-job-right"]}>
                                                <div className={styles["job-header"]}>
                                                    <div className={styles["job-title"]}>{item.name}</div>
                                                    <div className={styles["job-location"]}>
                                                        <EnvironmentOutlined className={styles.locationIcon} />
                                                        <span>{item.location}</span>
                                                    </div>
                                                    <div className={styles["job-salary"]}>
                                                        <ThunderboltOutlined className={styles.salaryIcon} />
                                                        <span>{(item.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</span>
                                                    </div>
                                                </div>
                                                <div className={styles["job-footer"]}>
                                                    <div className={styles["job-updatedAt"]}>
                                                        {item.startDate ? dayjs(item.startDate).locale('en').fromNow() : dayjs(item.startDate).locale('en').fromNow()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            )
                        })}

                        {(!displayJob || displayJob && displayJob.length === 0)
                            && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        }
                    </Row>
                    {showPagination && !isHomePage && (
                        <div className={styles.paginationContainer}>
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                            />
                        </div>
                    )}
                </Spin>
            </div>
        </div>
    )
}

export default JobCard;