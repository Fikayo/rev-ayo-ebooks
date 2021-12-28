import { BookInfo } from "./BookInfo";


export interface UserCollection {
    purchased: BookInfo[];
    wishlist: BookInfo[];
}
