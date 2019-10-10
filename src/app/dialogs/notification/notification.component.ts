import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css']
})
export class NotificationComponent {

    constructor(
        public dialogRef: MatDialogRef<NotificationComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    /**
     * Called when the user clicks the Ok button. Closes the dialog.
     */
    onOkClick(): void {
        this.dialogRef.close();
    }

}
