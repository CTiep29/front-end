import { useState, useEffect } from 'react';
import { CodeOutlined, ContactsOutlined, FireOutlined, HomeOutlined, LogoutOutlined, MenuFoldOutlined, RiseOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Drawer, Dropdown, MenuProps, Space, message } from 'antd';
import { Menu, ConfigProvider } from 'antd';
import styles from '@/styles/client.module.scss';
import { isMobile } from 'react-device-detect';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { callLogout } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import ManageAccount from './modal/manage.account';
import logo from '../../assets/logo.png'

const Header = (props: any) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

    const [current, setCurrent] = useState('home');
    const location = useLocation();

    const [openMangeAccount, setOpenManageAccount] = useState<boolean>(false);

    useEffect(() => {
        setCurrent(location.pathname);
    }, [location])

    const items: MenuProps['items'] = [
        {
            label: <Link to={'/'}>Trang Chủ</Link>,
            key: '/',
            icon: <HomeOutlined />,
        },
        {
            label: <Link to={'/job'}>Việc Làm IT</Link>,
            key: '/job',
            icon: <CodeOutlined />,
        },
        {
            label: <Link to={'/company'}>Top Công ty IT</Link>,
            key: '/company',
            icon: <RiseOutlined />,
        }
    ];



    const onClick: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
    };

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    const itemsDropdown = [
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => setOpenManageAccount(true)}
            >Quản lý tài khoản</label>,
            key: 'manage-account',
            icon: <ContactsOutlined />
        },
        ...(user.role?.permissions?.length ? [{
            label: <Link
                to={"/admin"}
            >Trang Quản Trị</Link>,
            key: 'admin',
            icon: <FireOutlined />
        },] : []),

        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
            icon: <LogoutOutlined />
        },
    ];

    const itemsMobiles = [...items, ...itemsDropdown];

    return (
        <>
            <div className={styles["header-section"]}>
                <div className={styles["container"]}>
                    {!isMobile ?
                        <div style={{ display: "flex", gap: 30 }}>
                            <div className={styles['brand']} >
                                <img
                                    src={logo}
                                    alt="Logo"
                                    onClick={() => navigate('/')}
                                    style={{ cursor: 'pointer', height: 45, paddingTop: 7 }}
                                />

                            </div>
                            <div className={styles['top-menu']}>
                                <ConfigProvider
                                    theme={{
                                        token: {
                                            colorPrimary: '#fff',
                                            colorBgContainer: '#3399FF',
                                            colorText: '#fff',
                                        },
                                    }}
                                >

                                    <Menu
                                        // onClick={onClick}
                                        selectedKeys={[current]}
                                        mode="horizontal"
                                        items={items}
                                        style={{ minWidth: '500px' }}

                                    />
                                </ConfigProvider>
                                <div className={styles['extra']}>
                                    {isAuthenticated === false ? (
                                        <div style={{ display: 'flex', gap: 20 }}>
                                            <Link to="/register-recruiter" className={styles["btn-register-hr"]}>Nhà Tuyển Dụng</Link>
                                            <Link to="/login">Đăng Nhập</Link>
                                        </div>
                                    )
                                        :
                                        <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                            <Space style={{ cursor: "pointer" }}>
                                                <span>Welcome {user?.name}</span>
                                                {/* <Avatar> {user?.name?.substring(0, 2)?.toUpperCase()} </Avatar> */}
                                                <Avatar style={{ backgroundColor: '#fde3cf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <UserOutlined style={{ fontSize: 50, paddingLeft: 12, color: '#3399FF' }} />
                                                </Avatar>
                                            </Space>
                                        </Dropdown>
                                    }

                                </div>

                            </div>
                        </div>
                        :
                        <div className={styles['header-mobile']}>
                            <span>Your APP</span>
                            <MenuFoldOutlined onClick={() => setOpenMobileMenu(true)} />
                        </div>
                    }
                </div>
            </div>
            <Drawer title="Chức năng"
                placement="right"
                onClose={() => setOpenMobileMenu(false)}
                open={openMobileMenu}
            >
                <Menu
                    onClick={onClick}
                    selectedKeys={[current]}
                    mode="vertical"
                    items={itemsMobiles}
                />
            </Drawer>
            <ManageAccount
                open={openMangeAccount}
                onClose={setOpenManageAccount}
            />
        </>
    )
};

export default Header;