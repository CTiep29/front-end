import { Button, Divider, Form, Input, message, notification } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callRegisterRecruiter } from 'config/api';
import styles from 'styles/auth.module.scss';

interface IRecruiter {
    name: string;
    email: string;
    password: string;
    companyName: string;
    companyAddress: string;
}

const RecruiterRegisterPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);

    const onFinish = async (values: IRecruiter) => {
        const { name, email, password, companyName, companyAddress } = values;
        setIsSubmit(true);
        const res = await callRegisterRecruiter(name, email, password, companyName, companyAddress);
        setIsSubmit(false);

        if (res?.data?.id) {
            message.success("Đăng ký nhà tuyển dụng thành công!");
            navigate('/login');
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description: Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 5
            });
        }
    };

    return (
        <div className={styles["register-page"]}>
            <main className={styles.main}>
                <div className={styles.container}>
                    <section className={styles.wrapper}>
                        <div className={styles.heading}>
                            <h2 className={`${styles.text} ${styles["text-large"]}`}>
                                Đăng Ký Tài Khoản
                            </h2>
                            <Divider />
                        </div>
                        <Form<IRecruiter>
                            name="recruiter-register"
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Họ tên"
                                name="name"
                                rules={[{ required: true, message: 'Họ tên không được để trống!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Email"
                                name="email"
                                rules={[{ required: true, message: 'Email không được để trống!' }]}
                            >
                                <Input type="email" />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Mật khẩu"
                                name="password"
                                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Tên công ty"
                                name="companyName"
                                rules={[{ required: true, message: 'Tên công ty không được để trống!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Địa chỉ công ty"
                                name="companyAddress"
                                rules={[{ required: true, message: 'Địa chỉ công ty không được để trống!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={isSubmit}>
                                    Đăng ký
                                </Button>
                            </Form.Item>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default RecruiterRegisterPage;
