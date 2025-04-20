import { Result } from "antd";
import { useAppSelector } from "@/redux/hooks";
import CompanyPage from './company.admin';
import RecruiterCompanyPage from "./company.recruiter";

const CompanyRouterPage = () => {
    const user = useAppSelector(state => state.account.user);

    if (!user || !user.role?.id) {
        return (
            <Result
                status="403"
                title="403 - Forbidden"
                subTitle="Bạn không có quyền truy cập trang này."
            />
        );
    }

    if (Number(user.role.id) === 1) {
        return <CompanyPage />;
    }

    if (Number(user.role.id) === 2) {
        return <RecruiterCompanyPage />;
    }

    return (
        <Result
            status="403"
            title="403 - Forbidden"
            subTitle="Bạn không có quyền truy cập trang này."
        />
    );
};

export default CompanyRouterPage;