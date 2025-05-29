import { callFetchCompany, fetchCompanyStats } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ICompany, ICompanyStats } from '@/types/backend';
import { Card, Col, Empty, Pagination, Row, Spin, Tag } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import { ArrowRightOutlined, EnvironmentOutlined, RiseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface IProps {
    showPagination?: boolean;
    isHomePage?: boolean;
}

const CompanyCard = (props: IProps) => {
    const { showPagination = false } = props;
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const sliderRef = useRef<Slider>(null);
    const [displayCompany, setDisplayCompany] = useState<ICompany[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [companyStats, setCompanyStats] = useState<{ [key: string]: ICompanyStats }>({});
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [clickedCard, setClickedCard] = useState<string | null>(null);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(isHomePage ? 4 : 8);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();

    useEffect(() => {
        console.log('useEffect triggered with:', { current, pageSize, filter, sortQuery, isHomePage });
        fetchCompany();
    }, [current, pageSize, filter, sortQuery, isHomePage]);

    const fetchCompany = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;

        console.log('Before fetch - isHomePage:', isHomePage);
        console.log('Before fetch - current query:', query);

        if (isHomePage) {
            query = `page=1&size=8&sort=updatedAt,desc`;
            setSortQuery("sort=updatedAt,desc");
            console.log('Homepage query updated:', query);
        }

        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        console.log('Final query:', query);

        const res = await callFetchCompany(query);
        if (res && res.data) {
            console.log('API Response:', res.data);
            setDisplayCompany(res.data.result);
            setTotal(res.data.meta.total);

            // Fetch stats for each company
            const stats: { [key: string]: ICompanyStats } = {};
            for (const company of res.data.result) {
                if (company.id) {
                    try {
                        const statsRes = await fetchCompanyStats(company.id);
                        if (statsRes && statsRes.data) {
                            stats[company.id] = statsRes.data;
                        }
                    } catch (error) {
                        console.error(`Error fetching stats for company ${company.id}:`, error);
                    }
                }
            }
            setCompanyStats(stats);
        }
        setIsLoading(false)
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

    const handleViewDetailJob = (item: ICompany) => {
        if (item.name && item.id) {
            setClickedCard(item.id);
            setTimeout(() => {
                const slug = convertSlug(item.name || '');
                navigate(`/company/${slug}?id=${item.id}`);
            }, 200);
        }
    }

    const renderCompanyCard = (item: ICompany, isCarousel = false) => {
        const stats = item.id ? companyStats[item.id] : null;
        const isHovered = item.id ? hoveredCard === item.id : false;
        const isClicked = item.id ? clickedCard === item.id : false;
        const card = (
            <Card
                onClick={() => handleViewDetailJob(item)}
                onMouseEnter={() => setHoveredCard(item.id || null)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                    width: isCarousel ? 260 : '100%',
                    margin: isCarousel ? '0 auto' : undefined,
                    height: '420px',
                    boxShadow: isHovered
                        ? '0 4px 12px rgba(0,0,0,0.15)'
                        : '0 2px 8px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'translateY(-5px)' : 'none',
                    marginTop: isHovered ? '5px' : '0',
                    cursor: 'pointer',
                    border: isHovered ? '2px solid #1890ff' : '2px solid transparent',
                    outline: isClicked ? '2px solid #1890ff' : 'none',
                    outlineOffset: '2px',
                }}
                hoverable
                cover={
                    <div className={styles["card-customize"]} style={{
                        padding: '20px',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '160px',
                        transition: 'all 0.3s ease',
                        transform: isHovered ? 'scale(1.02)' : 'none',
                        borderBottom: isHovered ? '2px solid #1890ff' : 'none',
                    }}>
                        <img
                            style={{
                                width: '100%',
                                height: '120px',
                                objectFit: 'contain',
                                padding: '10px',
                                transition: 'all 0.3s ease',
                                filter: isHovered ? 'brightness(1.1)' : 'none',
                                transform: isHovered ? 'scale(1.05)' : 'none',
                            }}
                            alt={item.name}
                            src={item.logo?.startsWith("http") ? item.logo : `${import.meta.env.VITE_BACKEND_URL}/storage/company/${item.logo}`}
                        />
                    </div>
                }
            >
                <div style={{
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'calc(100% - 160px)',
                }}>
                    <h2 style={{
                        textAlign: 'center',
                        marginBottom: '6px',
                        fontSize: '24px',
                        fontWeight: '600',
                        height: '44px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        transition: 'all 0.3s ease',
                        color: isHovered ? '#1890ff' : '#333',
                    }}>
                        {item.name}
                    </h2>
                    <div style={{
                        marginBottom: '8px',
                        textAlign: 'center',
                        fontWeight: '500',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        color: isHovered ? '#1890ff' : '#666',
                    }}>
                        {item.name}
                    </div>
                    {item.address && (
                        <div style={{
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            color: '#666',
                            height: '40px',
                        }}>
                            <EnvironmentOutlined style={{
                                fontSize: '16px',
                                marginTop: '2px',
                                color: '#1890ff',
                                transition: 'all 0.3s ease',
                                transform: isHovered ? 'scale(1.1)' : 'none',
                            }} />
                            <span style={{
                                fontSize: '14px',
                                lineHeight: '1.5',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                transition: 'all 0.3s ease',
                                color: isHovered ? '#1890ff' : '#666',
                            }}>
                                {item.address}
                            </span>
                        </div>
                    )}
                    {stats && (
                        <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '12px',
                            right: '12px',
                            padding: '8px',
                            backgroundColor: isHovered ? '#e6f7ff' : '#f0f7ff',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: isHovered
                                ? '0 4px 8px rgba(24,144,255,0.15)'
                                : '0 2px 4px rgba(0,0,0,0.05)',
                            transition: 'all 0.3s ease',
                            transform: isHovered ? 'translateY(-2px)' : 'none',
                            border: isHovered ? '1px solid #1890ff' : 'none',
                        }}>
                            <ArrowRightOutlined style={{
                                fontSize: '18px',
                                color: '#1890ff',
                                transition: 'all 0.3s ease',
                                transform: isHovered ? 'translateX(3px)' : 'none',
                            }} />
                            <span style={{
                                fontSize: '15px',
                                fontWeight: '500',
                                color: '#1890ff',
                            }}>
                                {stats.activeJobs} công việc đang tuyển
                            </span>
                        </div>
                    )}
                </div>
            </Card>
        );
        if (isCarousel) return card;
        return (
            <Col span={24} md={isHomePage ? 6 : 6} key={item.id || Math.random()}>
                {card}
            </Col>
        );
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
        dotsClass: "slick-dots slick-thumb",
        customPaging: function (i: number) {
            return (
                <div style={{
                    width: '30px',
                    height: '4px',
                    backgroundColor: i === (sliderRef.current?.state as any)?.currentSlide ? '#1890ff' : '#d9d9d9',
                    margin: '0 4px',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease'
                }} />
            );
        },
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            }
        ]
    };

    const next = () => {
        sliderRef.current?.slickNext();
    };

    const previous = () => {
        sliderRef.current?.slickPrev();
    };
    const getTitle = () => {
        if (isHomePage) return "Nhà Tuyển Dụng Hàng Đầu";
        return `Tất cả nhà tuyển dụng (${total} công ty)`;
    };
    return (
        <div className={`${styles["company-section"]}`}>
            <div className={styles["company-content"]}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <div>
                                    <span className={styles["title"]}>
                                        {getTitle()}
                                    </span>
                                </div>
                                {!showPagination &&
                                    <Link to="company" className={styles.viewAllLink}>Xem tất cả</Link>
                                }
                            </div>
                        </Col>

                        {isHomePage ? (
                            <Col span={24}>
                                <div style={{ position: 'relative' }}>
                                    <Slider ref={sliderRef} {...settings}>
                                        {displayCompany?.map(item => (
                                            <div key={item.id || Math.random()} style={{ padding: '0 10px' }}>
                                                {renderCompanyCard(item, true)}
                                            </div>
                                        ))}
                                    </Slider>
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '-40px',
                                        transform: 'translateY(-50%)',
                                        zIndex: 1,
                                        cursor: 'pointer'
                                    }}>
                                        <LeftOutlined
                                            onClick={previous}
                                            style={{
                                                fontSize: '24px',
                                                color: '#1890ff',
                                                backgroundColor: 'white',
                                                padding: '10px',
                                                borderRadius: '50%',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                            }}
                                        />
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: '-40px',
                                        transform: 'translateY(-50%)',
                                        zIndex: 1,
                                        cursor: 'pointer'
                                    }}>
                                        <RightOutlined
                                            onClick={next}
                                            style={{
                                                fontSize: '24px',
                                                color: '#1890ff',
                                                backgroundColor: 'white',
                                                padding: '10px',
                                                borderRadius: '50%',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                            }}
                                        />
                                    </div>
                                </div>
                            </Col>
                        ) : (
                            displayCompany?.map(item => renderCompanyCard(item))
                        )}

                        {(!displayCompany || displayCompany && displayCompany.length === 0)
                            && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        }
                    </Row>
                    {showPagination && !isHomePage && <>
                        <div style={{ marginTop: 30 }}></div>
                        <Row style={{ display: "flex", justifyContent: "center" }}>
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                            />
                        </Row>
                    </>}
                </Spin>
            </div>
        </div>
    )
}

export default CompanyCard;