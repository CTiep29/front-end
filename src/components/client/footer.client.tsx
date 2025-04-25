const Footer = () => {
    return (
        <footer style={{
            backgroundColor: '#3399FF',
            color: '#fff',
            padding: '20px 10px',
            textAlign: 'center',
            marginTop: '40px'
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <h2 style={{ fontSize: 24, marginBottom: 10 }}>Job Hunter</h2>
                <p style={{ maxWidth: 600, margin: '0 auto', fontSize: 18 }}>
                    Kết nối nhà tuyển dụng với hàng ngàn lập trình viên tài năng.
                    Nền tảng tuyển dụng IT hiện đại và dễ sử dụng.
                </p>
                <div style={{ marginTop: 10, fontSize: 14, opacity: 0.8 }}>
                    © {new Date().getFullYear()} All rights reserved.
                </div>
            </div>
        </footer>
    )
}

const linkStyle: React.CSSProperties = {
    margin: '0 5px',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 500
};

export default Footer;
