import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { ICompany } from "@/types/backend";
import { Descriptions, Card, Button, Spin, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ModalCompany from "@/components/admin/company/modal.company";
import { callFetchCompanyById } from "@/config/api";

const RecruiterCompanyPage = () => {
    const user = useAppSelector(state => state.account.user);
    const [company, setCompany] = useState<ICompany | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [openModal, setOpenModal] = useState(false);
    const [dataInit, setDataInit] = useState<ICompany | null>(null);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                if (user?.company_id) {
                    const res = await callFetchCompanyById(user.company_id);
                    if (res && res.data) {
                        setCompany(res.data);
                    }
                }
            } catch (error) {
                message.error("Không thể tải thông tin công ty.");
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [user]);

    if (loading) return <Spin spinning={true}>Đang tải dữ liệu...</Spin>;

    if (!company) return <div>Bạn chưa có công ty nào được liên kết.</div>;

    return (
        <>
            <Card
                title="Thông tin công ty của bạn"
                extra={
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            setOpenModal(true);
                            setDataInit(company);
                        }}
                    >
                        Chỉnh sửa
                    </Button>
                }
            >
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Tên công ty">{company.name}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{company.address}</Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {dayjs(company.createdAt).format('DD-MM-YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cập nhật gần nhất">
                        {dayjs(company.updatedAt).format('DD-MM-YYYY HH:mm')}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <ModalCompany
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={() => { }}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </>
    );
};

export default RecruiterCompanyPage;
