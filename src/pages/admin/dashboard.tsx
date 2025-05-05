import { Card, Col, Row, Statistic, message } from "antd";
import CountUp from 'react-countup';
import { useEffect, useState } from "react";
import { fetchDashboardStats } from "@/config/api";

const DashboardPage = () => {
    const [stats, setStats] = useState({ jobs: 0, users: 0, companies: 0 });
    const [loading, setLoading] = useState(true);

    const formatter = (value: number | string) => <CountUp end={Number(value)} separator="," />;

    useEffect(() => {
        fetchDashboardStats()
            .then(res => {
                setStats(res.data);
            })
            .catch(() => message.error("Lỗi khi tải dữ liệu thống kê"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Row gutter={[20, 20]}>
            <Col span={24} md={8}>
                <Card title="Tổng số công việc" bordered={false} loading={loading}>
                    <Statistic title="Jobs" value={stats.jobs} formatter={formatter} />
                </Card>
            </Col>
            <Col span={24} md={8}>
                <Card title="Tổng số người dùng" bordered={false} loading={loading}>
                    <Statistic title="Users" value={stats.users} formatter={formatter} />
                </Card>
            </Col>
            <Col span={24} md={8}>
                <Card title="Tổng số công ty" bordered={false} loading={loading}>
                    <Statistic title="Companies" value={stats.companies} formatter={formatter} />
                </Card>
            </Col>
        </Row>
    );
};

export default DashboardPage;
