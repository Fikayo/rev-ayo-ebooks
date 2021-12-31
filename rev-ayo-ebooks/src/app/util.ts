import { BookInfo } from "./models/BookInfo";

export function ParseBookDb(b: any): BookInfo {   
    let book = b as BookInfo;
    for(var key in b) {
        var newKey = `${key[0].toLowerCase()}${key.substr(1)}`
        book[newKey as any] = b[key];
    }
    book.ISBN = b.BookId;
    book.cover = b.ImageSource;
    book.price = `₦${b.PriceNaira}`;
    return book;
}