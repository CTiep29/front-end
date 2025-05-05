import { IPermission } from '@/types/backend';
import { grey, green, blue, red, orange } from '@ant-design/colors';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';

export const SKILLS_LIST =
    [
        { label: "React.JS", value: "REACT.JS" },
        { label: "React Native", value: "REACT NATIVE" },
        { label: "Vue.JS", value: "VUE.JS" },
        { label: "Angular", value: "ANGULAR" },
        { label: "Nest.JS", value: "NEST.JS" },
        { label: "TypeScript", value: "TYPESCRIPT" },
        { label: "Java", value: "JAVA" },
        { label: "Java Spring", value: "JAVA SPRING" },
        { label: "Frontend", value: "FRONTEND" },
        { label: "Backend", value: "BACKEND" },
        { label: "Fullstack", value: "FULLSTACK" }
    ];

export const LOCATION_LIST = [
    { label: "Hà Nội", value: "Ha Noi" },
    { label: "Hồ Chí Minh", value: "Ho Chi Minh" },
    { label: "Đà Nẵng", value: "Da Nang" },
    { label: "An Giang", value: "An Giang" },
    { label: "Bà Rịa - Vũng Tàu", value: "Ba Ria - Vung Tau" },
    { label: "Bạc Liêu", value: "Bac Lieu" },
    { label: "Bắc Giang", value: "Bac Giang" },
    { label: "Bắc Kạn", value: "Bac Kan" },
    { label: "Bắc Ninh", value: "Bac Ninh" },
    { label: "Bến Tre", value: "Ben Tre" },
    { label: "Bình Dương", value: "Binh Duong" },
    { label: "Bình Định", value: "Binh Dinh" },
    { label: "Bình Phước", value: "Binh Phuoc" },
    { label: "Bình Thuận", value: "Binh Thuan" },
    { label: "Cà Mau", value: "Ca Mau" },
    { label: "Cao Bằng", value: "Cao Bang" },
    { label: "Cần Thơ", value: "Can Tho" },
    { label: "Đắk Lắk", value: "Dak Lak" },
    { label: "Đắk Nông", value: "Dak Nong" },
    { label: "Điện Biên", value: "Dien Bien" },
    { label: "Đồng Nai", value: "Dong Nai" },
    { label: "Đồng Tháp", value: "Dong Thap" },
    { label: "Gia Lai", value: "Gia Lai" },
    { label: "Hà Giang", value: "Ha Giang" },
    { label: "Hà Nam", value: "Ha Nam" },
    { label: "Hà Tĩnh", value: "Ha Tinh" },
    { label: "Hải Dương", value: "Hai Duong" },
    { label: "Hải Phòng", value: "Hai Phong" },
    { label: "Hậu Giang", value: "Hau Giang" },
    { label: "Hòa Bình", value: "Hoa Binh" },
    { label: "Hưng Yên", value: "Hung Yen" },
    { label: "Khánh Hòa", value: "Khanh Hoa" },
    { label: "Kiên Giang", value: "Kien Giang" },
    { label: "Kon Tum", value: "Kon Tum" },
    { label: "Lai Châu", value: "Lai Chau" },
    { label: "Lâm Đồng", value: "Lam Dong" },
    { label: "Lạng Sơn", value: "Lang Son" },
    { label: "Lào Cai", value: "Lao Cai" },
    { label: "Long An", value: "Long An" },
    { label: "Nam Định", value: "Nam Dinh" },
    { label: "Nghệ An", value: "Nghe An" },
    { label: "Ninh Bình", value: "Ninh Binh" },
    { label: "Ninh Thuận", value: "Ninh Thuan" },
    { label: "Phú Thọ", value: "Phu Tho" },
    { label: "Phú Yên", value: "Phu Yen" },
    { label: "Quảng Bình", value: "Quang Binh" },
    { label: "Quảng Nam", value: "Quang Nam" },
    { label: "Quảng Ngãi", value: "Quang Ngai" },
    { label: "Quảng Ninh", value: "Quang Ninh" },
    { label: "Quảng Trị", value: "Quang Tri" },
    { label: "Sóc Trăng", value: "Soc Trang" },
    { label: "Sơn La", value: "Son La" },
    { label: "Tây Ninh", value: "Tay Ninh" },
    { label: "Thái Bình", value: "Thai Binh" },
    { label: "Thái Nguyên", value: "Thai Nguyen" },
    { label: "Thanh Hóa", value: "Thanh Hoa" },
    { label: "Thừa Thiên Huế", value: "Thua Thien Hue" },
    { label: "Tiền Giang", value: "Tien Giang" },
    { label: "Trà Vinh", value: "Tra Vinh" },
    { label: "Tuyên Quang", value: "Tuyen Quang" },
    { label: "Vĩnh Long", value: "Vinh Long" },
    { label: "Vĩnh Phúc", value: "Vinh Phuc" },
    { label: "Yên Bái", value: "Yen Bai" }
];

export const nonAccentVietnamese = (str: string) => {
    str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
}


export const convertSlug = (str: string) => {
    str = nonAccentVietnamese(str);
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    const from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;";
    const to = "AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------";
    for (let i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

export const getLocationName = (value: string) => {
    const locationFilter = LOCATION_LIST.filter(item => item.value === value);
    if (locationFilter.length) return locationFilter[0].label;
    return 'unknown'
}

export function colorMethod(method: "POST" | "PUT" | "GET" | "DELETE" | string) {
    switch (method) {
        case "POST":
            return green[6]
        case "PUT":
            return orange[6]
        case "GET":
            return blue[6]
        case "DELETE":
            return red[6]
        default:
            return grey[10];
    }
}

export const groupByPermission = (data: any[]): { module: string; permissions: IPermission[] }[] => {
    const groupedData = groupBy(data, x => x.module);
    return map(groupedData, (value, key) => {
        return { module: key, permissions: value as IPermission[] };
    });
};
