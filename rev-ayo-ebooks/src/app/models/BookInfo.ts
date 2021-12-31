
export interface BookInfo {
    ISBN: string;
    title: string;
    displayName: string;
    author?: string;
    cover?: string;
    description?: string;
    pdfPath?: string;
    price?: string;
    productID: string;
    [key: string]: any;
}
