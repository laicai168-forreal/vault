import minigtLogo from '../assets/images/minigt_logo.png'
import innoLogo from '../assets/images/inno_logo.png'
import tarmacLogo from '../assets/images/tarmac_works_logo.avif'
import hotwheelsLogo from '../assets/images/hot_wheels_logo.png'

export enum BrandEnum {
    MINIGT = "minigt",
    HOTWHEELS = "hotwheels",
    INNO = "inno",
    TARMAC = 'tarmac',
    POPRACE = "poprace"
}

export enum BrandDisplayNameEnum {
    MINIGT = "Mini GT",
    HOTWHEELS = "Hot Wheels",
    INNO = "Inno",
    TARMAC = 'Tarmac Works',
    POPRACE = 'Pop Race'
}

export interface IBrand {
    displayName: BrandDisplayNameEnum,
}

export class Brand {
    key: BrandEnum;
    name: BrandDisplayNameEnum;
    image: string;

    constructor(key: BrandEnum, name: BrandDisplayNameEnum, image: string) {
        this.key = key;
        this.name = name;
        this.image = image;
    }
}

export const BrandMap: Record<string, Brand> = {
    MINIGT: new Brand(BrandEnum.MINIGT, BrandDisplayNameEnum.MINIGT, minigtLogo),
    HOTWHEELS: new Brand(BrandEnum.HOTWHEELS, BrandDisplayNameEnum.HOTWHEELS, hotwheelsLogo),
    INNO: new Brand(BrandEnum.INNO, BrandDisplayNameEnum.INNO, innoLogo),
    TARMAC: new Brand(BrandEnum.TARMAC, BrandDisplayNameEnum.TARMAC, tarmacLogo),
    POPRACE: new Brand(BrandEnum.TARMAC, BrandDisplayNameEnum.TARMAC, tarmacLogo),
};

export const BRANDS = {
    MINIGT: "minigt",
    HOTWHEELS: "hotwheels",
    INNO: "inno",
    TARMAC: 'tarmac',
}

export const BRAND_LOGO: Record<typeof BRANDS[keyof typeof BRANDS], string> = {
    [BRANDS.MINIGT]: minigtLogo,
    [BRANDS.HOTWHEELS]: hotwheelsLogo,
    [BRANDS.INNO]: innoLogo,
    [BRANDS.TARMAC]: tarmacLogo,
}

export const BRAND_NAME: Record<typeof BRANDS[keyof typeof BRANDS], string> = {
    [BRANDS.MINIGT]: 'Mini GT',
    [BRANDS.HOTWHEELS]: 'Hot Wheels',
    [BRANDS.INNO]: 'Inno64',
    [BRANDS.TARMAC]: 'Tarmacworks',
}

export const BrandKeyMap = {
    MINIGT: BrandEnum.MINIGT,
    HOTWHEELS: BrandEnum.HOTWHEELS,
    INNO: BrandEnum.INNO,
    TARMAC: BrandEnum.TARMAC,
}

export const BrandReverseMap: Record<BrandDisplayNameEnum, BrandEnum> = Object.fromEntries(
    Object.entries(BrandMap).map(([key, value]) => [value, key as BrandEnum])
) as Record<BrandDisplayNameEnum, BrandEnum>;

