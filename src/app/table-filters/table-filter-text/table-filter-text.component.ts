import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TableFilter } from '../table-filter';

@Component({
    selector: 'app-table-filter-text',
    templateUrl: './table-filter-text.component.html',
    styleUrls: ['./table-filter-text.component.css']
})
export class TableFilterTextComponent {

    /**
     * The operators to display in the filter dropdown.
     */
    operators: string[] = ['Is equal to', 'Is not equal to', 'Starts with', 'Contains', 'Does not contain', 'Ends with'];

    constructor(
        public dialogRef: MatDialogRef<TableFilterTextComponent>,
        @Inject(MAT_DIALOG_DATA) public data: TableFilter) { }

    /**
     * Called when the Clear button is clicked in the filter dialog.
     */
    onClearClick(): void {
        // Clear the filter value
        this.data.value = '';

        // Close the dialog and return the table filter data to the dialog opener
        this.dialogRef.close(this.data);
    }
}
