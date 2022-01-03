import { Component, OnInit } from '@angular/core';
import { TransitionService } from 'src/app/services/transition/transition.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'ebook-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss']
})
export class WelcomePage implements OnInit {

    constructor(
        private user: UserService,
        private transition: TransitionService
        ) {    
            this.checkLogin(); 
    }

    ngOnInit(): void {          
        console.info("Welcome page initialised");
        this.checkLogin();
    }

    private checkLogin() {
        this.user.isLoggedIn().subscribe({
            next: (loggedIn) => {
                if(loggedIn) {
                    this.transition.slide('/books/store');
                }
            },
            error: (err) => console.error("Error trying to read login ID", err)
        });
    }
}
