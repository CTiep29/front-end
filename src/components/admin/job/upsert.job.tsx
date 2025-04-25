import { Breadcrumb, Button, Col, ConfigProvider, Divider, Form, Result, Row, message, notification } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FooterToolbar, ProForm, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { LOCATION_LIST } from "@/config/utils";
import { useState, useEffect } from 'react';
import { callCreateJob, callFetchAllSkill, callFetchJobById, callUpdateJob, callFetchCompanyById, callFetchCompany, callFetchAccount } from "@/config/api";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CheckSquareOutlined } from "@ant-design/icons";
import enUS from 'antd/lib/locale/en_US';
import dayjs from 'dayjs';
import { IJob, ISkill } from "@/types/backend";
import { useAppSelector } from "@/redux/hooks";
import { ICompanySelect } from "../user/modal.user";

interface ISkillSelect {
    label: string;
    value: string;
    key?: string;
}

const ViewUpsertJob = (props: any) => {
    const [companies, setCompanies] = useState<ICompanySelect[]>([]);
    const [skills, setSkills] = useState<ISkillSelect[]>([]);
    const [companyLocation, setCompanyLocation] = useState<string | undefined>(undefined);

    const navigate = useNavigate();
    const [value, setValue] = useState<string>("");
    const [form] = Form.useForm();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const id = params?.get("id");

    const [dataUpdate, setDataUpdate] = useState<IJob | null>(null);
    const user = useAppSelector(state => state.account.user);
    console.log("🚀 [DEBUG] User thông tin:", user);
    if (Number(user?.role?.id) !== 2) {
        return (
            <Result
                status="403"
                title="403 - Không được phép truy cập"
                subTitle="Trang này chỉ dành cho nhà tuyển dụng."
                extra={<Button type="primary" onClick={() => navigate('/')}>Quay lại trang chủ</Button>}
            />
        );
    }

    useEffect(() => {
        const init = async () => {
            const temp = await fetchSkillList();
            setSkills(temp);
            console.log("📌 [CHECK USER] ", user);
            console.log("📌 [CHECK company_id from user]", user?.company_id);

            // Nếu chưa có company_id, gọi lại API /auth/account (tạm thời patch lỗi)
            if (!user?.company_id) {
                (async () => {
                    const res = await callFetchAccount(); // <- API call lại /auth/account
                    console.log("📌 [PATCHED user.account]", res);
                })()
            }
            // Tạo mới job bởi nhà tuyển dụng
            if (!id && user?.company_id) {
                const res = await callFetchCompanyById(user.company_id);
                console.log("✅ [DEBUG] Dữ liệu company khi tạo mới:", res);
                if (res && res.data) {
                    const company = res.data;
                    const companyValue = `${company.id}@#$${company.logo ?? ""}`;

                    setCompanies([{
                        label: company?.name ?? "",
                        value: `${company?.id}@#$${company?.logo ?? ""}`,
                        key: company?.id
                    }]);
                    setCompanyLocation(company.location);

                    form.setFieldsValue({
                        company: {
                            label: company.name,
                            value: companyValue,
                            key: company.id
                        },
                        companyLabel: company.name,
                        location: company.location,
                        active: true
                    });
                    console.log(form.getFieldsValue());

                }
            }

            // Cập nhật job (dành cho nhà tuyển dụng)
            if (id) {
                const res = await callFetchJobById(id);
                if (res && res.data) {
                    const job = res.data;
                    setDataUpdate(job);
                    setValue(job.description);

                    setCompanies([{
                        label: job.company?.name ?? "",
                        value: `${job.company?.id}@#$${job.company?.logo ?? ""}`,
                        key: job.company?.id
                    }]);

                    const tempSkills = job.skills?.map((item: ISkill) => ({
                        label: item.name ?? "",
                        value: item.id,
                        key: item.id
                    }));

                    form.setFieldsValue({
                        ...job,
                        company: {
                            label: job.company?.name,
                            value: `${job.company?.id}@#$${job.company?.logo ?? ""}`,
                            key: job.company?.id
                        },
                        companyLabel: job.company?.name,
                        skills: tempSkills
                    });


                    setCompanyLocation(job.location);
                }
            }
        };

        init();
        return () => form.resetFields();
    }, [id, user?.company_id, form]); // Thêm form vào dependency array để useEffect re-run khi form được tạo

    // Giữ nguyên các hàm fetchCompanyList, fetchSkillList, onFinish
    async function fetchCompanyList(name: string): Promise<ICompanySelect[]> {
        const res = await callFetchCompany(`page=1&size=100&name ~ '${name}'`);
        if (res && res.data) {
            return res.data.result.map(item => ({
                label: item.name ?? "",
                value: `${item.id}@#$${item.logo}`
            }));
        }
        return [];
    }

    async function fetchSkillList(): Promise<ISkillSelect[]> {
        const res = await callFetchAllSkill(`page=1&size=100`);
        if (res && res.data) {
            return res.data.result.map(item => ({
                label: item.name ?? "",
                value: `${item.id}`
            }));
        }
        return [];
    }

    const onFinish = async (values: any) => {
        let companyId = "";
        let companyLogo = "";
        let companyLabel = "";

        if (typeof values.company === "string") {
            const cp = values.company.split('@#$');
            companyId = cp?.[0] || "";
            companyLogo = cp?.[1] || "";

            const found = companies.find(c => c.value === values.company);
            companyLabel = found?.label || "";
        } else if (typeof values.company === "object") {
            const cp = values.company.value?.split('@#$');
            companyId = cp?.[0] || "";
            companyLogo = cp?.[1] || "";
            companyLabel = values.company.label;
        }
        const arrSkills = values?.skills?.map((item: any) => ({
            id: typeof item === 'object' ? item.value : +item
        }));

        const job = {
            name: values.name,
            skills: arrSkills,
            company: {
                id: companyId
            },
            location: values.location,
            salary: values.salary,
            quantity: values.quantity,
            level: values.level,
            description: value,
            startDate: dayjs(values.startDate, 'DD/MM/YYYY').toDate(),
            endDate: dayjs(values.endDate, 'DD/MM/YYYY').toDate(),
            active: values.active
        };

        const res = dataUpdate?.id
            ? await callUpdateJob(job, dataUpdate.id)
            : await callCreateJob(job);

        if (res?.data) {
            message.success(`${dataUpdate?.id ? 'Cập nhật' : 'Tạo mới'} job thành công`);
            navigate('/admin/job');
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }
    };

    return (
        <div className={styles["upsert-job-container"]}>
            <div className={styles["title"]}>
                <Breadcrumb
                    separator=">"
                    items={[
                        { title: <Link to="/admin/job">Manage Job</Link> },
                        { title: 'Upsert Job' }
                    ]}
                />
            </div>
            <div>
                <ConfigProvider locale={enUS}>
                    <ProForm
                        form={form}
                        onFinish={onFinish}
                        submitter={{
                            searchConfig: {
                                resetText: "Hủy",
                                submitText: dataUpdate?.id ? "Cập nhật Job" : "Tạo mới Job"
                            },
                            onReset: () => navigate('/admin/job'),
                            render: (_, dom) => <FooterToolbar>{dom}</FooterToolbar>,
                            submitButtonProps: {
                                icon: <CheckSquareOutlined />
                            }
                        }}
                    >
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={12}>
                                <ProFormText
                                    label="Tên Job"
                                    name="name"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập tên job"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="skills"
                                    label="Kỹ năng yêu cầu"
                                    options={skills}
                                    placeholder="Please select a skill"
                                    rules={[{ required: true, message: 'Vui lòng chọn kỹ năng!' }]}
                                    allowClear
                                    mode="multiple"
                                    fieldProps={{ suffixIcon: null }}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="location"
                                    label="Địa điểm"
                                    options={LOCATION_LIST.filter(item => item.value !== 'ALL')}
                                    placeholder="Please select a location"
                                    rules={[{ required: true, message: 'Vui lòng chọn địa điểm!' }]}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Mức lương"
                                    name="salary"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập mức lương"
                                    fieldProps={{
                                        addonAfter: " đ",
                                        formatter: value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                        parser: value => +(value || '').replace(/\$\s?|(,*)/g, '')
                                    }}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Số lượng"
                                    name="quantity"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập số lượng"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="level"
                                    label="Trình độ"
                                    valueEnum={{
                                        INTERN: 'INTERN',
                                        FRESHER: 'FRESHER',
                                        JUNIOR: 'JUNIOR',
                                        MIDDLE: 'MIDDLE',
                                        SENIOR: 'SENIOR',
                                    }}
                                    placeholder="Please select a level"
                                    rules={[{ required: true, message: 'Vui lòng chọn level!' }]}
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormText
                                    label="Thuộc Công Ty"
                                    name="companyLabel"
                                    initialValue={form.getFieldValue("companyLabel")}
                                    disabled
                                />
                            </Col>

                        </Row>

                        <Row gutter={[20, 20]}>
                            <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày bắt đầu"
                                    name="startDate"
                                    normalize={value => value && dayjs(value, 'DD/MM/YYYY')}
                                    fieldProps={{ format: 'DD/MM/YYYY' }}
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
                                    placeholder="dd/mm/yyyy"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày kết thúc"
                                    name="endDate"
                                    normalize={value => value && dayjs(value, 'DD/MM/YYYY')}
                                    fieldProps={{ format: 'DD/MM/YYYY' }}
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
                                    placeholder="dd/mm/yyyy"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSwitch
                                    label="Trạng thái"
                                    name="active"
                                    checkedChildren="ACTIVE"
                                    unCheckedChildren="INACTIVE"
                                    initialValue={true}
                                    fieldProps={{ defaultChecked: true }}
                                />
                            </Col>
                            <Col span={24}>
                                <ProForm.Item
                                    name="description"
                                    label="Miêu tả job"
                                    rules={[{ required: true, message: 'Vui lòng nhập miêu tả job!' }]}
                                >
                                    <ReactQuill theme="snow" value={value} onChange={setValue} />
                                </ProForm.Item>
                            </Col>
                        </Row>
                        <Divider />
                    </ProForm>
                </ConfigProvider>
            </div>
        </div>
    )
};

export default ViewUpsertJob;