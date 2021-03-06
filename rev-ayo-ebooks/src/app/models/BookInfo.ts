import { RegionIsNGN, StoreRegion } from "./Region";

export interface BookStore {
    books: BookInfo[];
    byID: Map<string, BookInfo>;
    groups: BookstoreGroup[];
}

export interface BookstoreGroup {
    title: string;
    books: BookInfo[];
}

export interface BookInfo {
    ISBN: string;
    title: string;
    displayName: string;
    author: string;
    aboutBook: string;
    cover: string;
    description: string;
    pdfPath?: string;
    price: string;
    productID: string;
    viewGroup?: string;
}

export interface BookInfoBe {
    BookId: string;
    Title: string;
    DisplayName: string;
    AboutBook: string;
    Author: string;
    Description: string;
    ImageSource: string;
    FileSource: string;
    PriceNaira: string;
    PriceWorld: string;
    ProductId: string;
    ViewGroup?: string;
}

export function ParseBookDb(b: BookInfoBe, storeRegion: StoreRegion): BookInfo {   

    const price = RegionIsNGN(storeRegion) ? `${b.PriceNaira}` : `${b.PriceWorld}`;
    const book: BookInfo = {
        ISBN: b.BookId,
        title: b.Title,
        displayName: b.DisplayName,
        author: b.Author, 
        aboutBook: b.AboutBook || "",   
        description: b.Description || "",    
        cover: b.ImageSource,
        price: price,
        productID: b.ProductId,
        viewGroup: b.ViewGroup
    }

    return book;
}

export function emptyStore(): BookStore {
    return {books: [], byID: new Map<string, BookInfo>(), groups: []};
}