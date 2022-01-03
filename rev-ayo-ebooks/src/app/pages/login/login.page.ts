import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TransitionService } from 'src/app/services/transition/transition.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'ebook-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {

    public userEmail: string = "";
    public notFound: boolean = false;
    public failure: boolean = false;

    constructor(
        private transition: TransitionService,
        private user: UserService) {
        }

    ngOnInit(): void {
    }

    public register() {
        this.transition.fade('welcome/register');
    }

    public login(email: any | string) {
        this.userEmail = email;
        this.notFound = false;
        this.failure = false;
        console.log("login email:", email)
        this.user.loginUser(email)
        .then(id => {
            console.log("Sign in successful. Id:", id);
            this.transition.fade('books/store');
        })
        .catch(err => {
            console.error(`'${email}' sign in failed:`, err);
            if (err.error && err.error.status == 404) {
                this.notFound = true;
            } else {
                this.failure = true;
            }
        });
    }

}
