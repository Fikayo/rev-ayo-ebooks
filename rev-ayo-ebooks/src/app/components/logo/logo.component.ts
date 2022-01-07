import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ebook-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {
    
    @Input() size: string = "large";

    constructor() { }

    ngOnInit(): void {
    }

}
