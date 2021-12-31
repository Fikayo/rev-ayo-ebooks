import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ebook-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit(): void {
    }

    public register() {
        this.router.navigate(['/welcome/register']);
    }

    public login() {
        this.router.navigate(['/welcome/login']);
    }

}
