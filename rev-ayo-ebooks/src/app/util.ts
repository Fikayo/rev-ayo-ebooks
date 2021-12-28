import { BookInfo } from "./models/BookInfo";

export function ParseBookDb(b: any): BookInfo {
    let book = b as BookInfo;
    for(var key in b) {
        var newKey = `${key[0].toLowerCase()}${key.substr(1)}`
        book[newKey as any] = b[key];
    }
    book.ISBN = b.BookId;
    book.cover = `./assets/books/${b.Title.toLowerCase()}/cover.jpg`;
    book.price = `₦${b.PriceNaira}`;
    console.log("parsed book", book);
    console.log("title:", book.title);
    return book;
}