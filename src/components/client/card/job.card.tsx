import { callFetchJob, callFetchAllSkill } from '@/config/api';
import { convertSlug, getLocationName, LOCATION_LIST } from '@/config/utils';
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
import updateLocale from 'dayjs/plugin/updateLocale';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Cấu hình locale tiếng Việt
dayjs.updateLocale('vi', {
    relativeTime: {
        future: '%s tới',
        past: '%s trước',
        s: 'vài giây',
        m: '1 phút',
        mm: '%d phút',
        h: '1 giờ',
        hh: '%d giờ',
        d: '1 ngày',
        dd: '%d ngày',
        M: '1 tháng',
        MM: '%d tháng',
        y: '1 năm',
        yy: '%d năm'
    }
});

dayjs.locale('vi');

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
    const [skillNames, setSkillNames] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchJob();
        fetchSkills();
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


        const queryLocation = searchParams.get("location");
        const querySkills = searchParams.get("skills");
        const querySearch = searchParams.get("search");

        if (queryLocation || querySkills || querySearch) {
            let q = "";
            if (queryLocation) {
                q = `location ~ '${queryLocation}'`;
            }

            if (querySkills) {
                q = q ? q + " and " + `${sfIn("skills", querySkills.split(","))}` : `${sfIn("skills", querySkills.split(","))}`;
            }

            if (querySearch) {
                const searchCondition = `(name ~ '${querySearch}' or company.name ~ '${querySearch}')`;
                q = q ? q + " and " + searchCondition : searchCondition;
            }

            query += `&filter=${encodeURIComponent(q)}`;
        }

        const res = await callFetchJob(query);
        if (res && res.data) {
            setDisplayJob(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false);
    }

    const fetchSkills = async () => {
        const res = await callFetchAllSkill(`page=1&size=100&sort=createdAt,desc`);
        if (res && res.data) {
            const skillMap = res.data.result.reduce((acc: Record<string, string>, skill: any) => {
                acc[skill.id] = skill.name;
                return acc;
            }, {});
            setSkillNames(skillMap);
        }
    };

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

    const getLocationLabel = (locationValue: string) => {
        const location = LOCATION_LIST.find(loc => loc.value === locationValue);
        return location ? location.label : locationValue;
    };

    const getTitle = () => {
        if (isHomePage) return "Công Việc Mới Nhất";

        const queryLocation = searchParams.get("location");
        const querySkills = searchParams.get("skills");
        const querySearch = searchParams.get("search");

        // Trường hợp không có tìm kiếm
        if (!queryLocation && !querySkills && !querySearch) {
            return `${total} việc làm IT tại Việt Nam`;
        }

        let title = `${total} việc làm`;

        // Xử lý tìm kiếm theo tên công ty/công việc
        if (querySearch) {
            title += ` ${querySearch}`;
        }

        // Xử lý tìm kiếm theo kỹ năng
        if (querySkills) {
            const skillIds = querySkills.split(",");
            const skillNamesList = skillIds.map(id => skillNames[id] || id);
            if (skillNamesList.length === 1) {
                title += ` ${skillNamesList[0]}`;
            } else {
                title += ` ${skillNamesList.join(", ")}`;
            }
        }

        // Xử lý địa điểm
        if (queryLocation) {
            title += ` tại ${getLocationLabel(queryLocation)}`;
        } else {
            title += " tại Việt Nam";
        }

        return title;
    };

    return (
        <div className={styles["card-job-section"]}>
            <div className={styles["job-content"]}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[0, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <div>
                                <span className={styles["title"]}>
                                        {getTitle()}
                                </span>
                                </div>
                                {isHomePage && !showPagination &&
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
                                                        {item.startDate ? getTimeAgo(item.startDate) : getTimeAgo(item.startDate)}
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