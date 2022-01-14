import { Component, OnInit, ViewChild, ViewChildren, NgZone, OnDestroy } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { TransitionService } from 'src/app/services/transition/transition.service';
import { BookInfo } from "src/app/models/BookInfo";
import { UserService } from 'src/app/services/user/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from 'src/app/models/User';

@Component({
  selector: 'ebook-personal-books',
  templateUrl: './personal-books.page.html',
  styleUrls: ['./personal-books.page.scss']
})
export class PersonalBooksPage implements OnInit, OnDestroy {
    @ViewChild(MatTabGroup) group!: any;
    @ViewChildren(MatTab) tabs!: any;

    public myBooks!: BookInfo[];
    public wishlist!: BookInfo[];

    public tab_num: number = 0;
    public selectedIndex: number = 0;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private transition: TransitionService,
        private user: UserService,
        private zone: NgZone) {}

    ngOnInit(): void {
        this.init();
    }
    
    ngOnDestroy(): void {   
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
    
    private init(): void {        
        this.user.user
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (u: User) => {
                console.log("COLLECTION USER UPDATED: ", u);
                if(!u.collection) return;

                const purchased = u.collection.purchased;
                const wishlist = u.collection.wishlist;
                this.zone.run(() => {                            
                    this.myBooks = purchased;
                    this.wishlist = wishlist;
                });
            },
            error: (err) => console.error(`failed to subscribe to user`, err)
        });
    }

    ionViewDidEnter() {  
        this.user.fetchCollection()
        .catch(err => console.error("Error fetching collection", err))
    }

    public openShop() {
        this.transition.fade(`books/store`);
    }

    public openSearch() {
        this.transition.fade('/searchpage', {duration: 400, slowdownfactor: -1, iosdelay: 50});
    }

    public doRefresh(event: any) {
        console.debug("refreshing collection page");
        this.user.fetchCollection(true)
        .then(_ => {
            event.target.complete();
            console.debug("done refreshing collection page");
        })
        .catch(err => {
            event.target.complete();
            console.error("An error occured while refreshing collection page", err);
        });
    }
}
