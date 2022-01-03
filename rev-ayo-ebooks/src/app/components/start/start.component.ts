import { Component, OnInit } from '@angular/core';
import { TransitionService } from 'src/app/services/transition/transition.service';

@Component({
  selector: 'ebook-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

    constructor(private transition: TransitionService) { }

    ngOnInit(): void {
    }

    public register() {
        this.transition.slide('/welcome/register', {direction: 'left'});
    }

    public login() {
        this.transition.slide('/welcome/login', {direction: 'right'});
    }

}
