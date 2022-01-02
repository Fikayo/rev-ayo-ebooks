import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'ebook-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomePage implements OnInit {

    constructor(
        private user: UserService,
        private router: Router) {    
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
                    this.router.navigate(['/books/store']);
                }
            },
            error: (err) => console.error("Error trying to read login ID", err)
        });
    }

}
