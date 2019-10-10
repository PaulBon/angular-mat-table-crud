import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { TableFilterTextComponent } from './table-filter-text/table-filter-text.component';

@NgModule({
    imports: [
        CommonModule,
        MatSelectModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
        ReactiveFormsModule
    ],
    declarations: [
        TableFilterTextComponent
    ],
    exports: [ // components that are accessible to other modules that import this module
        TableFilterTextComponent
    ],
    entryComponents: [ // components that are not referenced in a template
        TableFilterTextComponent
    ]
})
export class TableFiltersModule { }
