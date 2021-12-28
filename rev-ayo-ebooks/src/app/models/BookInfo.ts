
export interface BookInfo {
    ISBN: string;
    title: string;
    displayName: string;
    author?: string;
    cover?: string;
    description?: string;
    price?: string;
    productID: string;
    [key: string]: any;
}
