import { Component, OnInit, ViewChild, AfterViewInit, ViewChildren } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { BookTitle } from 'src/app/services/bookstore/bookstore.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'ebook-personal-books',
  templateUrl: './personal-books.component.html',
  styleUrls: ['./personal-books.component.scss']
})
export class PersonalBooksComponent implements OnInit, AfterViewInit {
    @ViewChild(MatTabGroup) group!: any;
    @ViewChildren(MatTab) tabs!: any;

    public myBooks: BookTitle[] = [];
    public wishlist: BookTitle[] = [];

    public tab_num: number = 0;
    public selectedIndex: number = 0;

    constructor(private user: UserService) { }

    ngOnInit(): void {
        this.user.fetchMyBooks().subscribe({
            next: (b) => this.myBooks = b,
            error: () => console.error("Failed to fetch my books!")
        });

        this.user.fetchWishlist().subscribe({
            next: (b) => this.wishlist = b,
            error: () => console.error("Failed to fetch wishlist!")
        });
    }


    // selectChange(): void{
    //     console.log("Selected INDEX: " + this.selectedIndex);
    // }

    SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };

    // // Action triggered when user swipes
    // swipe(selectedIndex: number, action = this.SWIPE_ACTION.RIGHT) {
    //     console.log("swipe");
    //     console.log("number",selectedIndex);
    //     console.log("action",action);
    //     // Out of range
    //     if (this.selectedIndex < 0 || this.selectedIndex > 1 ) return;

    //     // Swipe left, next tab
    //     if (action === this.SWIPE_ACTION.LEFT) {
    //     const isLast = this.selectedIndex === 1;
    //     this.selectedIndex = isLast ? 0 : this.selectedIndex + 1;
    //     console.log("Swipe right - INDEX: " + this.selectedIndex);
    //     }

    //     // Swipe right, previous tab
    //     if (action === this.SWIPE_ACTION.RIGHT) {
    //     const isFirst = this.selectedIndex === 0;
    //     this.selectedIndex = isFirst ? 1 : this.selectedIndex - 1;
    //     console.log("Swipe left - INDEX: " + this.selectedIndex);
    //     }
    // }

    ngAfterViewInit(){
        this.tab_num = this.tabs.length
        console.log(this.group)
      }

    public swipe(eType: string){
        console.log(eType);
        if(eType === this.SWIPE_ACTION.LEFT && this.selectedIndex > 0){
          console.log("movin left")
          this.selectedIndex--;
        }
        else if(eType === this.SWIPE_ACTION.RIGHT && this.selectedIndex < this.tab_num){
          console.log("movin right")
          this.selectedIndex++;
        }
        console.log(this.selectedIndex)
      }

}
