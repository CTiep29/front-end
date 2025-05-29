export interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
}

export interface IModelPaginate<T> {
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: T[]
}

export interface IAccount {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        company_id?: string;
        age?: string;
        gender?: string;
        address?: string;
        avatar?: string;
        cv?: string;
        role: {
            id: string;
            name: string;
            permissions: {
                id: string;
                name: string;
                apiPath: string;
                method: string;
                module: string;
            }[]
        }
        active?: boolean;
    }
}

export interface IGetAccount extends Omit<IAccount, "access_token"> { }

export interface ICompany {
    id?: string;
    name?: string;
    address?: string;
    logo: string;
    description?: string;
    createdBy?: string;
    location?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
    active?: boolean;
    taxCode?: string;
    url?: string;
}

export interface ISkill {
    id?: string;
    name?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IUser {
    id?: string;
    name: string;
    email: string;
    password?: string;
    age: number;
    gender: string;
    address: string;
    avatar?: string;
    cv?: string;
    role?: {
        id: string;
        name: string;
    }
    company?: {
        id: string;
        name: string;
    }
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
    active?: boolean;
}

export interface IJob {
    id?: string;
    name: string;
    skills: string[];
    company?: {
        id: string;
        name?: string;
        logo?: string;
    }
    location: string;
    salary: number;
    quantity: number;
    level: string;
    description: string;
    startDate: Date;
    endDate: Date;
    active: boolean;
    jobType?: string;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IResume {
    id?: string;
    email: string;
    userId: string;
    url: string;
    status: string;
    active?: boolean;
    companyId: string | {
        id: string;
        name: string;
        logo: string;
    };
    jobId: string | {
        id: string;
        name: string;
    };
    history?: {
        status: string;
        updatedAt: Date;
        updatedBy: { id: string; email: string }
    }[]
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
    message?: string;
}

export interface IPermission {
    id?: string;
    name?: string;
    apiPath?: string;
    method?: string;
    module?: string;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;

}

export interface IRole {
    id?: string;
    name: string;
    description: string;
    active: boolean;
    permissions: IPermission[] | string[];

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISubscribers {
    id?: string;
    name?: string;
    email?: string;
    skills: string[];
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IDashboardStats {
    totalJobs: number;
    totalCompanies: number;
    totalUsers: number;
    activeJobsByCompany: Array<{
        companyName: string;
        activeJobs: number;
    }>;
}

export interface ITimeSeriesStats {
    newJobsByMonth: { month: string; count: number }[];
    newUsersByMonth: { month: string; count: number }[];
}

export interface ICompanyStats {
    totalJobs: number;
    activeJobs: number;
    resumeStats: {
        totalResumes: number;
        byStatus: Array<{
            status: string;
            count: number;
        }>;
        byJob: Array<{
            jobName: string;
            count: number;
        }>;
    };
}

export interface DashboardStats {
    totalJobs: number;
    totalCompanies: number;
    totalUsers: number;
    newJobsByMonth: { month: string; count: number }[];
    newUsersByMonth: { month: string; count: number }[];
    activeJobsByCompany: Array<{
        companyName: string;
        activeJobs: number;
    }>;
}

export interface CompanyStats {
    totalJobs: number;
    activeJobs: number;
    resumeStats: {
        totalResumes: number;
        byStatus: Array<{
            status: string;
            count: number;
        }>;
        byJob: Array<{
            jobName: string;
            count: number;
        }>;
    };
}