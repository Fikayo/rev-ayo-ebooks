import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'ebook-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterPage implements OnInit {

    public userEmail: string = "";
    public exists: boolean = false;
    public failure: boolean = false;
    public emptyEmail: boolean = false;
    public emptyRegion: boolean = false;

    constructor(
        private router: Router,
        private user: UserService) {
        }

    ngOnInit(): void {
    }

    public login() {
        this.router.navigate(['welcome/login']);
    }

    public register(email: any | string, region: any | string) {
        this.userEmail = email;
        this.exists = false;
        this.failure = false;

        if(!email) {
            this.emptyEmail = true;
            return;
        }

        
        if(!region) {
            this.emptyRegion = true;
            return;
        }

        this.emptyEmail = false;
        this.emptyRegion = false;
        console.log("register email, region:", email, region)
        this.user.registerUser(email, region)
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
