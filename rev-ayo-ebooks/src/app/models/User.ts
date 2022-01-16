import { BookInfo } from "./BookInfo";


export interface User {
    userID: string;
    collection?: UserCollection;
}

export interface UserCollection {
    purchased: BookInfo[];
    wishlist: BookInfo[];
}

export function emptyUser(): User {
    return {userID: ''};
}

export function emptyCollection(): UserCollection {
    return {purchased: [], wishlist: []};
}