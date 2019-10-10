import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StudentsRoutingModule } from './students-routing.module';
import { DialogsModule } from '../dialogs/dialogs.module';
import { StudentsListComponent } from './students-list/students-list.component';
import { StudentsNotesComponent } from './students-notes/students-notes.component';
import { StudentDetailComponent } from './student-detail/student-detail.component';

@NgModule({
    declarations: [StudentsListComponent, StudentsNotesComponent, StudentDetailComponent],
    imports: [
        CommonModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatSortModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        FormsModule,
        MatSelectModule,
        MatTooltipModule,
        DialogsModule,
        StudentsRoutingModule
    ]
})
export class StudentsModule { }
