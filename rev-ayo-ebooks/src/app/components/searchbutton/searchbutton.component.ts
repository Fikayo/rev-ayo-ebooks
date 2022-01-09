import { Component, OnInit } from '@angular/core';
import { TransitionService } from 'src/app/services/transition/transition.service';

@Component({
  selector: 'ebook-searchbutton',
  templateUrl: './searchbutton.component.html',
  styleUrls: ['./searchbutton.component.scss']
})
export class SearchbuttonComponent implements OnInit {

    constructor(private transtion: TransitionService) { }

    ngOnInit(): void {
    }

    public openSearch() {
        this.transtion.fade('/searchpage', {duration: 200});
    }
}
