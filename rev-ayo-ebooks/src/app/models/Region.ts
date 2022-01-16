export enum StoreRegion {
    UNKNOWN = "unkown",
    WORLD = "world",
    NIGERIA = "nigeria",
}

export function CurrencyToRegion(currency: string): StoreRegion {
    switch(currency) {
        case 'NGN':
            return StoreRegion.NIGERIA;
        default:
            return StoreRegion.WORLD;
    }
}

export function RegionIsNGN(region: StoreRegion): boolean {
    return region == StoreRegion.NIGERIA;
}