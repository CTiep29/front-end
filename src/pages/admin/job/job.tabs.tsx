import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import JobPage from './job';
import SkillPage from './skill';
import Access from '@/components/share/access';
import { ALL_PERMISSIONS } from '@/config/permissions';
import { useAppSelector } from '@/redux/hooks';
import JobRecruiterPage from './job.recruiter';

const JobTabs = () => {
    const { role } = useAppSelector(state => state.account.user);
    const onChange = (key: string) => {
        // console.log(key);
    };

    let items: TabsProps['items'] = [];

    if (Number(role?.id) === 2) {
        // Nếu là nhà tuyển dụng
        items = [
            {
                key: '1',
                label: 'Manage Jobs In Company',
                children: <JobRecruiterPage />,
            }
        ];
    } else {
        console.log("ROLE ID:", role?.id, "TYPE:", typeof role?.id);
        // Nếu là admin
        items = [
            {
                key: '1',
                label: 'Manage Jobs',
                children: <JobPage />,
            },
            {
                key: '2',
                label: 'Manage Skills',
                children: <SkillPage />,
            },
        ];
    }
    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.JOBS.GET_PAGINATE}
            >
                <Tabs
                    defaultActiveKey="1"
                    items={items}
                    onChange={onChange}
                />
            </Access>
        </div>
    );
}

export default JobTabs;