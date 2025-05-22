import { Result, Spin } from "antd";
import { useAppSelector } from "@/redux/hooks";
import CompanyPage from './company.admin';
import RecruiterCompanyPage from "./company.recruiter";
import { useEffect, useState } from "react";

const CompanyRouterPage = () => {
    const user = useAppSelector(state => state.account.user);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra xem có cần reload không
        const shouldReload = localStorage.getItem('shouldReload');
        const redirectPath = localStorage.getItem('redirectPath');

        if (shouldReload === 'true' && redirectPath === '/admin') {
            // Xóa các flag sau khi đã xử lý
            localStorage.removeItem('shouldReload');
            localStorage.removeItem('redirectPath');
        }

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <Spin spinning={true}>Đang tải dữ liệu...</Spin>;
    }

    if (!user || !user.role?.id) {
        return (
            <Result
                status="403"
                title="403 - Forbidden"
                subTitle="Bạn không có quyền truy cập trang này."
            />
        );
    }

    switch (Number(user.role.id)) {
        case 1:
            return <CompanyPage key={user.id} />;
        case 2:
            return <RecruiterCompanyPage key={user.id} />;
        default:
    return (
        <Result
            status="403"
            title="403 - Forbidden"
            subTitle="Bạn không có quyền truy cập trang này."
        />
    );
    }
};

export default CompanyRouterPage;