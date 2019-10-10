import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    /**
     * Called when the user clicks the No button. Closes the dialog and returns false to the calling code.
     */
    onNoClick(): void {
        this.dialogRef.close(false);
    }

    /**
     * Called when the user clicks the Yes button. Closes the dialog and returns true to the calling code.
     */
    onYesClick(): void {
        this.dialogRef.close(true);
    }

}
