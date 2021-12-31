import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'ebook-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    public userEmail: string = "";
    public notFound: boolean = false;
    public failure: boolean = false;

    constructor(
        private router: Router,
        private user: UserService) {
        }

    ngOnInit(): void {
    }

    public register() {
        this.router.navigate(['welcome/register']);
    }

    public login(email: string) {
        this.userEmail = email;
        this.notFound = false;
        this.failure = false;
        console.log("login email:", email)
        this.user.loginUser(email)
        .then(id => {
            console.log("Sign in successful. Id:", id);
            this.router.navigate(['books/store']);
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
