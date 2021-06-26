import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit {

    public displayName!: string;
    public displayEmail!: string;

    constructor(
        public router: Router,
        public dialogRef: MatDialogRef<SettingsDialogComponent>) { }

    ngOnInit(): void {

        this.displayName = "Fikayo Odunayo";
        this.displayEmail = "odunayofikayo@gmail.com";
    }

    public closeDialog() {
        this.dialogRef.close();
    }

    public openSettings() {
        this.closeDialog();
        this.router.navigate(['/settings'])
    }
}
