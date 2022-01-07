export interface BookStore {
    books: BookInfo[];
    byID: Map<string, BookInfo>;
}


export interface BookInfo {
    ISBN: string;
    title: string;
    displayName: string;
    author: string;
    cover: string;
    description: string;
    pdfPath?: string;
    price: string;
    productID: string;
}

export interface BookInfoBe {
    BookId: string;
    Title: string;
    DisplayName: string;
    Author: string;
    Description: string;
    ImageSource: string;
    FileSource: string;
    PriceNaira: string;
    PriceWorld: string;
    ProductId: string;
}

export function ParseBookDb(b: BookInfoBe, userRegion: string): BookInfo {   
    
    // const price = userRegion == "nigeria" ? `₦${b.PriceNaira}` : `$${b.PriceWorld}`;
    const price = userRegion == "nigeria" ? `${b.PriceNaira}` : `${b.PriceWorld}`;
    const book: BookInfo = {
        ISBN: b.BookId,
        title: b.Title,
        displayName: b.DisplayName,
        author: b.Author,    
        description: b.Description,    
        cover: b.ImageSource,
        price: price,
        productID: b.ProductId
    }

    return book;
}

export function emptyStore(): BookStore {
    return {books: [], byID: new Map<string, BookInfo>()};
}