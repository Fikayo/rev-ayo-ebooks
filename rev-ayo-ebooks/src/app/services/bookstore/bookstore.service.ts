import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface BookTitle {
    id: number
    title: string;
    cover: string;
}  

@Injectable({
  providedIn: 'root'
})
export class BookstoreService {

    constructor(private http: HttpClient) { }

    public fetchTitles(): Observable<BookTitle[]> {
        const titlesSub = new Subject<BookTitle[]>();

        this.http.get("./assets/books/list.json", {responseType: "json"})
        .subscribe({
            next: (data: any) => {
                let titles = []
                for(let b of data["books"]) {
                    let title = b as BookTitle;
                    title.cover = `./assets/books/${b.title.toLowerCase()}/cover.jpg`;
                    titles.push(title);
                }

                titlesSub.next(titles);
            }
        });

        return titlesSub.asObservable();
    }

    public fetchBook(bookID: number): Observable<Blob> {
        const bookSub = new Subject<Blob>();
        let path = "./assets/books/how to be happy and stay happy/pdf.pdf"
        if (bookID == 2) {
            path =  "./assets/books/becoming a better you/pdf.pdf";
        }

        this.http.get(path, { responseType: 'blob' })
        .subscribe({
            next: (res) => bookSub.next(res),
            error: () => console.log(`failed to fetch book "${bookID}"`)
        });

        // this.http.get("./assets/books/list.json", {responseType: "json"})
        // .subscribe({
        //     next: (data: any) => {
        //         let path = "";
        //         for(let b of data["books"]) {
        //             if (b.id == bookID) {
        //                 path = `./asset/books/${b.title.toLowerCase()}/pdf.pdf`;
        //                 break;
        //             }
        //         }

        //         this.http.get(path, { responseType: 'blob' })
        //         .subscribe({
        //             next: (res) => bookSub.next(res),
        //             error: () => console.log(`failed to fetch book "${bookID}"`)
        //         });
        //     }
        // });


        return bookSub.asObservable();
    }
}
