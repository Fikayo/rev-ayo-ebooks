import { Component, OnInit } from '@angular/core';
import { TransitionService } from 'src/app/services/transition/transition.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'ebook-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {

    public userEmail: string = "";
    public exists: boolean = false;
    public failure: boolean = false;
    public emptyEmail: boolean = false;
    public emptyRegion: boolean = false;

    constructor(
        private transition: TransitionService,
        private user: UserService) {
        }

    ngOnInit(): void {
    }

    public login() {
        this.transition.fade('/login');
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
            this.transition.fade('books/store');
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
