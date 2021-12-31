import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'ebook-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

    public userEmail: string = "";
    public exists: boolean = false;
    public failure: boolean = false;

    constructor(
        private router: Router,
        private user: UserService) {
        }

    ngOnInit(): void {
    }

    public login() {
        this.router.navigate(['welcome/login']);
    }

    public register(email: string) {
        this.userEmail = email;
        this.exists = false;
        this.failure = false;

        console.log("register email:", email)
        this.user.registerUser(email)
        .then(id => {
            console.log("Register successful. Id:", id);
            this.router.navigate(['books/store']);
        })
        .catch(err => {
            console.error(`'${email}' sign in failed:`, err);
            if (err.error && err.error.status == 409) {
                this.exists = true;
            } else {
                this.failure = true;
            }
        });
    }

}
