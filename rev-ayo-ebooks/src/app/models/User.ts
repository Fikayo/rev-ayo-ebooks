import { empty } from "rxjs";
import { BookInfo } from "./BookInfo";


export interface User {
    userID: string;
    region: string;
    collection?: UserCollection;
}

export interface UserCollection {
    purchased: BookInfo[];
    wishlist: BookInfo[];
}

export function emptyUser(): User {
    return {userID: '', region: ''};
}

export function emptyCollection(): UserCollection {
    return {purchased: [], wishlist: []};
}