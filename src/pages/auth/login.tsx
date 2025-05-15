import { Button, Divider, Form, Input, message, notification } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { callLogin, callGoogleLogin } from 'config/api';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import styles from 'styles/auth.module.scss';
import { useAppSelector } from '@/redux/hooks';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { IBackendRes, IAccount } from '@/types/backend';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const dispatch = useDispatch();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const callback = params?.get("callback");

    useEffect(() => {
        if (isAuthenticated) {
            navigate(callback || '/');
        }
    }, [isAuthenticated, navigate, callback]);

    const onFinish = async (values: any) => {
        const { username, password } = values;
        setIsSubmit(true);
        try {
            const res = await callLogin(username, password);
            if (res?.data) {
                localStorage.setItem('access_token', res.data.access_token);
                dispatch(setUserLoginInfo(res.data.user));
                message.success('Đăng nhập tài khoản thành công!');
                if (res.data.user.role?.id && (Number(res.data.user.role.id) === 1 || Number(res.data.user.role.id) === 2)) {
                    navigate('/admin');
                } else {
                    navigate(callback || '/');
                }
            }
        } catch (error: any) {
            const messageError = error?.response?.data?.message || error?.message || "Đăng nhập thất bại";
            notification.error({
                message: "Có lỗi xảy ra",
                description: messageError,
                duration: 5
            });
        }
        finally {
            setIsSubmit(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            notification.error({
                message: 'Lỗi đăng nhập',
                description: 'Không nhận được thông tin từ Google',
            });
            return;
        }

        try {
            setIsGoogleLoading(true);
            console.log('Google credential:', credentialResponse.credential);
            
            const res = await callGoogleLogin(credentialResponse.credential);
            console.log('Google login response:', res);
            
            if (res?.data) {
                const { access_token, user } = res.data;
                if (access_token && user) {
                    localStorage.setItem('access_token', access_token);
                    dispatch(setUserLoginInfo(user));
                    message.success('Đăng nhập bằng Google thành công!');
                    
                    if (user.role?.id && (Number(user.role.id) === 1 || Number(user.role.id) === 2)) {
                        navigate('/admin');
                    } else {
                        navigate(callback || '/');
                    }
                } else {
                    notification.error({
                        message: "Có lỗi xảy ra",
                        description: 'Dữ liệu người dùng không hợp lệ',
                        duration: 5
                    });
                }
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: 'Không nhận được dữ liệu từ server',
                    duration: 5
                });
            }
        } catch (error: any) {
            console.error('Google login error:', error);
            let errorMessage = "Đăng nhập thất bại";
            
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            notification.error({
                message: "Có lỗi xảy ra",
                description: errorMessage,
                duration: 5
            });
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleGoogleError = () => {
        console.error('Google OAuth error occurred');
        notification.error({
            message: 'Có lỗi xảy ra',
            description: 'Đăng nhập bằng Google thất bại. Vui lòng thử lại sau.',
            duration: 5,
        });
    };

    return (
        <div className={styles["login-page"]}>
            <main className={styles.main}>
                <div className={styles.container}>
                    <section className={styles.wrapper}>
                        <div className={styles.heading}>
                            <h2 className={`${styles.text} ${styles["text-large"]}`}>Đăng Nhập</h2>
                            <Divider />
                        </div>
                        <Form
                            name="basic"
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Email"
                                name="username"
                                rules={[{ required: true, message: 'Email không được để trống!' }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item
                                labelCol={{ span: 24 }}
                                label="Mật khẩu"
                                name="password"
                                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}>
                                <Input.Password />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={isSubmit} block>
                                    Đăng nhập
                                </Button>
                            </Form.Item>

                            <Divider>Hoặc</Divider>

                            <Form.Item>
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    useOneTap={false}
                                    context="signin"
                                    auto_select={false}
                                    type="standard"
                                    theme="filled_blue"
                                    shape="rectangular"
                                    text="signin_with"
                                    logo_alignment="left"
                                    width="100%"
                                />
                            </Form.Item>

                            <p className="text text-normal">
                                Chưa có tài khoản?
                                <span>
                                    <Link to='/register'> Đăng Ký </Link>
                                </span>
                            </p>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
