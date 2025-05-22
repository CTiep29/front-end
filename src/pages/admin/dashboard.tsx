import { Card, Col, Row, Statistic, message, Tabs } from "antd";
import CountUp from 'react-countup';
import { useEffect, useState } from "react";
import { fetchDashboardStats, fetchTimeSeriesStats, fetchCompanyStats } from "@/config/api";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ArcElement,
    RadialLinearScale
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from "@/redux/hooks";
import { 
    RiseOutlined, 
    TeamOutlined, 
    BankOutlined, 
    FileTextOutlined,
    CheckCircleOutlined,
    UserOutlined
} from '@ant-design/icons';
import styles from '@/styles/admin.module.scss';
import { DashboardStats, CompanyStats } from '@/types/backend';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    RadialLinearScale
);

// Chart options
const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Thống kê theo thời gian'
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                precision: 0
            }
        },
        x: {
            grid: {
                display: false
            }
        }
    },
    animation: {
        duration: 0
    }
};

const DashboardPage = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalJobs: 0,
        totalCompanies: 0,
        totalUsers: 0,
        newJobsByMonth: [],
        newUsersByMonth: [],
        activeJobsByCompany: []
    });
    const [companyStats, setCompanyStats] = useState<CompanyStats>({
        totalJobs: 0,
        activeJobs: 0,
        resumeStats: {
            totalResumes: 0,
            byStatus: [],
            byJob: []
        }
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = useAppSelector(state => state.account.user);
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    const formatter = (value: number | string) => <CountUp end={Number(value)} separator="," />;

    useEffect(() => {
        // Kiểm tra xác thực và quyền truy cập
        if (!isAuthenticated) {
            message.error("Vui lòng đăng nhập để truy cập trang này");
            navigate('/login');
            return;
        }

        console.log("User data:", user); // Debug log

        // Kiểm tra xem user có phải là admin hay không dựa vào permissions
        const isAdmin = user?.role?.permissions?.some(permission =>
            permission.module === "PERMISSIONS" ||
            permission.module === "ROLES" ||
            permission.module === "USERS"
        );

        const isRecruiter = user?.role?.permissions?.some(permission =>
            permission.module === "JOBS" &&
            !user?.role?.permissions?.some(p => p.module === "PERMISSIONS")
        );

        console.log("Is Admin:", isAdmin); // Debug log
        console.log("Is Recruiter:", isRecruiter); // Debug log

        if (!isAdmin && !isRecruiter) {
            message.error("Bạn không có quyền truy cập trang này");
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch general stats
                const statsRes = await fetchDashboardStats();
                if (statsRes.data) {
                    const { totalJobs, totalCompanies, totalUsers, activeJobsByCompany } = statsRes.data;
                    setStats(prev => ({
                        ...prev,
                        totalJobs,
                        totalCompanies,
                        totalUsers,
                        activeJobsByCompany: activeJobsByCompany || []
                    }));
                }

                // Fetch time series data
                const timeSeriesRes = await fetchTimeSeriesStats();
                if (timeSeriesRes.data) {
                    const { newJobsByMonth, newUsersByMonth } = timeSeriesRes.data;
                    setStats(prev => ({
                        ...prev,
                        newJobsByMonth,
                        newUsersByMonth
                    }));
                }

                // Fetch company stats if needed
                if (isRecruiter && user?.company_id) {
                    const companyId = user.company_id;
                    console.log('Fetching company stats for companyId:', companyId); // Debug log
                    
                    const companyRes = await fetchCompanyStats(companyId);
                    console.log('Company Stats Response:', companyRes);
                    
                    if (companyRes.data) {
                        setCompanyStats({
                            totalJobs: companyRes.data.totalJobs || 0,
                            activeJobs: companyRes.data.activeJobs || 0,
                            resumeStats: {
                                totalResumes: companyRes.data.resumeStats?.totalResumes || 0,
                                byStatus: companyRes.data.resumeStats?.byStatus || [],
                                byJob: companyRes.data.resumeStats?.byJob || []
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                message.error("Lỗi khi tải dữ liệu thống kê");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, user, isAuthenticated]);

    const timeSeriesData = {
        labels: stats.newJobsByMonth.map(item => item.month),
        datasets: [
            {
                label: 'Việc làm mới',
                data: stats.newJobsByMonth.map(item => item.count),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1
            },
            {
                label: 'Người dùng mới',
                data: stats.newUsersByMonth.map(item => item.count),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.1
            }
        ]
    };

    const renderAdminDashboard = () => {
        // Chuẩn bị dữ liệu cho biểu đồ cột ngang
        const companyData = {
            labels: stats.activeJobsByCompany.slice(0, 10).map(item => item.companyName),
            datasets: [{
                label: 'Số việc làm đang tuyển',
                data: stats.activeJobsByCompany.slice(0, 10).map(item => item.activeJobs),
                backgroundColor: 'rgba(24, 144, 255, 0.8)',
                borderColor: 'rgb(24, 144, 255)',
                borderWidth: 2
            }]
        };

        const companyChartOptions = {
            indexAxis: 'y' as const,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top' as const,
                },
                title: {
                    display: true,
                    text: 'Top 10 công ty có nhiều việc làm đang tuyển nhất',
                    font: {
                        size: 16,
                        weight: 'bold' as const
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context: any) {
                            return `Số việc làm: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        };

        return (
            <div className={styles['dashboard-container']}>
                <Row gutter={[20, 20]}>
                    <Col span={24} md={8}>
                        <Card 
                            title="Tổng số công việc" 
                            bordered={false} 
                            loading={loading}
                            className={`${styles['stat-card']} ${styles['blue-gradient']}`}
                        >
                            <Statistic 
                                title={<span style={{ color: 'white' }}>Jobs</span>} 
                                value={stats.totalJobs} 
                                formatter={formatter}
                                valueStyle={{ color: 'white' }}
                                prefix={<RiseOutlined style={{ color: 'white' }} />}
                            />
                        </Card>
                    </Col>
                    <Col span={24} md={8}>
                        <Card 
                            title="Tổng số người dùng" 
                            bordered={false} 
                            loading={loading}
                            className={`${styles['stat-card']} ${styles['green-gradient']}`}
                        >
                            <Statistic 
                                title={<span style={{ color: 'white' }}>Users</span>} 
                                value={stats.totalUsers} 
                                formatter={formatter}
                                valueStyle={{ color: 'white' }}
                                prefix={<TeamOutlined style={{ color: 'white' }} />}
                            />
                        </Card>
                    </Col>
                    <Col span={24} md={8}>
                        <Card 
                            title="Tổng số công ty" 
                            bordered={false} 
                            loading={loading}
                            className={`${styles['stat-card']} ${styles['purple-gradient']}`}
                        >
                            <Statistic 
                                title={<span style={{ color: 'white' }}>Companies</span>} 
                                value={stats.totalCompanies} 
                                formatter={formatter}
                                valueStyle={{ color: 'white' }}
                                prefix={<BankOutlined style={{ color: 'white' }} />}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row style={{ marginTop: '20px' }}>
                    <Col span={24}>
                        <Card title="Xu hướng tăng trưởng" bordered={false} loading={loading} className={styles['chart-card']}>
                            <div className={styles['chart-container']}>
                                <Line options={chartOptions} data={timeSeriesData} />
                            </div>
                        </Card>
                    </Col>
                </Row>
                <Row style={{ marginTop: '20px' }}>
                    <Col span={24}>
                        <Card title="Thống kê việc làm theo công ty" bordered={false} loading={loading} className={styles['chart-card']}>
                            <div className={styles['chart-container']}>
                                <Bar options={companyChartOptions} data={companyData} />
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    const renderCompanyDashboard = () => {
        // Chuẩn bị dữ liệu cho biểu đồ tròn trạng thái
        const statusData = {
            labels: companyStats.resumeStats.byStatus.map(item => item.status),
            datasets: [{
                data: companyStats.resumeStats.byStatus.map(item => item.count),
                backgroundColor: [
                    'rgba(245, 34, 45, 0.8)',   // Đỏ đậm
                    'rgba(24, 144, 255, 0.8)',  // Xanh dương đậm
                    'rgba(250, 173, 20, 0.8)',  // Vàng đậm
                    'rgba(82, 196, 26, 0.8)',   // Xanh lá đậm
                    'rgba(114, 46, 209, 0.8)'   // Tím đậm
                ],
                borderColor: [
                    'rgb(245, 34, 45)',
                    'rgb(24, 144, 255)',
                    'rgb(250, 173, 20)',
                    'rgb(82, 196, 26)',
                    'rgb(114, 46, 209)'
                ],
                borderWidth: 2
            }]
        };

        // Chuẩn bị dữ liệu cho biểu đồ cột công việc
        const jobData = {
            labels: companyStats.resumeStats.byJob.map(item => item.jobName),
            datasets: [{
                label: 'Số lượng ứng viên',
                data: companyStats.resumeStats.byJob.map(item => item.count),
                backgroundColor: 'rgba(24, 144, 255, 0.8)',
                borderColor: 'rgb(24, 144, 255)',
                borderWidth: 2
            }]
        };

        return (
            <div className={styles['dashboard-container']}>
                <Row gutter={[20, 20]}>
                    <Col span={24} md={8}>
                        <Card 
                            title="Tổng số việc làm" 
                            bordered={false} 
                            loading={loading}
                            className={`${styles['stat-card']} ${styles['blue-gradient']}`}
                        >
                            <Statistic 
                                title={<span style={{ color: 'white' }}>Tổng số việc làm</span>} 
                                value={companyStats.totalJobs} 
                                formatter={formatter}
                                valueStyle={{ color: 'white' }}
                                prefix={<RiseOutlined style={{ color: 'white' }} />}
                            />
                        </Card>
                    </Col>
                    <Col span={24} md={8}>
                        <Card 
                            title="Việc làm đang hoạt động" 
                            bordered={false} 
                            loading={loading}
                            className={`${styles['stat-card']} ${styles['green-gradient']}`}
                        >
                            <Statistic 
                                title={<span style={{ color: 'white' }}>Việc làm đang hoạt động</span>} 
                                value={companyStats.activeJobs} 
                                formatter={formatter}
                                valueStyle={{ color: 'white' }}
                                prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
                            />
                        </Card>
                    </Col>
                    <Col span={24} md={8}>
                        <Card 
                            title="Tổng số hồ sơ" 
                            bordered={false} 
                            loading={loading}
                            className={`${styles['stat-card']} ${styles['purple-gradient']}`}
                        >
                            <Statistic 
                                title={<span style={{ color: 'white' }}>Tổng số hồ sơ</span>} 
                                value={companyStats.resumeStats.totalResumes} 
                                formatter={formatter}
                                valueStyle={{ color: 'white' }}
                                prefix={<FileTextOutlined style={{ color: 'white' }} />}
                            />
                        </Card>
                    </Col>
                    <Col span={24} md={12}>
                        <Card title="Phân bố trạng thái hồ sơ" bordered={false} loading={loading} className={styles['chart-card']}>
                            <div className={styles['chart-container']}>
                                <Pie
                                    data={statusData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'right' as const,
                                            },
                                            title: {
                                                display: true,
                                                text: 'Phân bố trạng thái hồ sơ',
                                                font: {
                                                    size: 16,
                                                    weight: 'bold'
                                                }
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        const label = context.label || '';
                                                        const value = context.raw as number;
                                                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                                        const percentage = Math.round((value / total) * 100);
                                                        return `${label}: ${value} (${percentage}%)`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </Card>
                    </Col>
                    <Col span={24} md={12}>
                        <Card title="Phân bố hồ sơ theo công việc" bordered={false} loading={loading} className={styles['chart-card']}>
                            <div className={styles['chart-container']}>
                                <Bar
                                    data={jobData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top' as const,
                                            },
                                            title: {
                                                display: true,
                                                text: 'Phân bố hồ sơ theo công việc',
                                                font: {
                                                    size: 16,
                                                    weight: 'bold'
                                                }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    precision: 0
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    if (!isAuthenticated || !user?.role?.permissions) {
        return null;
    }

    const isAdmin = user.role.permissions.some(permission =>
        permission.module === "PERMISSIONS" ||
        permission.module === "ROLES" ||
        permission.module === "USERS"
    );

    const isRecruiter = user.role.permissions.some(permission =>
        permission.module === "JOBS" &&
        !user.role.permissions?.some(p => p.module === "PERMISSIONS")
    );

    return (
        <div>
            {isAdmin ? (
                renderAdminDashboard()
            ) : isRecruiter ? (
                renderCompanyDashboard()
            ) : null}
        </div>
    );
};

export default DashboardPage;