import { Divider } from 'antd';
import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';
import ImageSlider from '@/components/client/slide.client';

const HomePage = () => {
    return (
        <>
            <div style={{ marginTop: 5 }}>
                <ImageSlider />
            </div>
            <div className={`${styles["container"]} ${styles["home-section"]}`}>
                <div className="search-content" style={{ marginTop: 20 }}>
                    <SearchClient />
                </div>
                <Divider />
                <CompanyCard />
                <div style={{ margin: 50 }}></div>
                <Divider />
                <JobCard />
            </div>
        </>
    )
}

export default HomePage;