import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { FormControl, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { merge, Observable, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { Student } from '../student';
import { StudentsHttpClient } from '../students-http-client';
import { TableFilter } from '../../table-filters/table-filter';
import { TableFilterTextComponent } from '../../table-filters/table-filter-text/table-filter-text.component';
import { NotificationComponent } from '../../dialogs/notification/notification.component';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-students-list',
    templateUrl: './students-list.component.html',
    styleUrls: ['./students-list.component.css']
})
export class StudentsListComponent implements AfterViewInit {

    /**
     * The columns to display in the student list table.
     */
    columnsToDisplay: string[] = ['select', 'expandRow', 'studentSchoolId', 'firstName', 'lastName', 'studentEmail', 'editDelete'];
    studentsHttpClient: StudentsHttpClient | null;
    students: Student[] = [];
    totalStudents = 0;
    defaultPageSize = 5;
    pageSizeOptions: number[] = [5, 10, 15, 20, 25];
    showFirstLastButtons = true;
    expandedStudents: Set<number> = new Set<number>();
    isProcessing = true;
    tableFilters: Map<string, TableFilter> = new Map<string, TableFilter>();
    editStudentId = -1;
    isAdding = false;
    selection = new SelectionModel<Student>(true, []);

    // Since the school id form control has an async validator, we'll set updateOn to 'blur' so the async validator will only be called
    // when the user exits the input field instead of every time the input field value changes.
    studentSchoolIdFormControl = new FormControl('', { updateOn: 'blur', validators: [Validators.required],
        asyncValidators: [this.studentSchoolIdValidator()] });
    firstNameFormControl = new FormControl('', [Validators.required]);
    lastNameFormControl = new FormControl('', [Validators.required]);
    studentEmailFormControl = new FormControl('', [Validators.required, Validators.email]);

    /**
     * An injected reference to the paginator component for the student list table.
     */
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

    /**
     * An injected reference to the sort component for the student list table.
     */
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    /**
     * The constructor for the student list component.
     *
     * @param dialog a dependency injection (DI) for MatDialog
     */
    constructor(private dialog: MatDialog) { }

    /**
     * Called after Angular has fully initialized the component's view. Inits code to handle sorting and paging events.
     */
    ngAfterViewInit() {
        this.studentsHttpClient = new StudentsHttpClient();

        // Merge the MatSort and MatPaginator observables into a single observable
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                startWith({}),    // emit an initial value so the table will be populated
                switchMap(() => { // switches the MatSort or MatPaginator observable to a StudentsList observable
                    this.isProcessing = true;
                    return this.studentsHttpClient.getStudents(this.sort.active, this.sort.direction, this.paginator.pageIndex,
                        this.paginator.pageSize, this.tableFilters);
                }),
                map(studentsList => { // the function to apply to the StudentsList observable

                    // Collapse all detail rows whenever the user sorts or changes pages
                    this.expandedStudents.clear();

                    this.isProcessing = false;
                    this.totalStudents = studentsList.totalStudents;
                    return studentsList.students;
                }),
            ).subscribe(students => { this.students = students; });
    }

    /**
     * Returns true if the number of selected students matches the total number of students.
     */
    isAllSelected(): boolean {
        const numSelectedStudents = this.selection.selected.length;
        return numSelectedStudents === this.totalStudents;
    }

    /**
     * Selects all rows if they are not all selected; otherwise clears all selection.
     */
    masterToggle() {
        if (this.isAllSelected()) {
            // All are selected so user wants to unselect them all.
            this.selection.clear();
        } else if (this.totalStudents <= this.paginator.pageSize) {
            // None or some are selected so user wants to select them all.
            // There's only 1 page of students so we just need to select the ones on the page.
            this.students.forEach(row => this.selection.select(row));
        } else {
            // None or some are selected so user wants to select them all.
            // There are multiple pages so we need to retrieve them all so we can select them all.
            this.isProcessing = true;
            this.studentsHttpClient.getStudents(this.sort.active, this.sort.direction, 0, Number.MAX_VALUE, this.tableFilters)
                .pipe(
                    map(studentsList => { // the function to apply to the StudentDetailList observable
                        this.isProcessing = false;
                        return studentsList.students;
                    }),
                ).subscribe(students => { students.forEach(row => this.selection.select(row)); });
        }
    }

    /**
     * Returns true if the student's detail row is expanded.
     *
     * @param studentId the studentId to check
     */
    isStudentExpanded(studentId: number): boolean {
        return this.expandedStudents.has(studentId);
    }

    /**
     * Adds the student to the set of expanded students.
     *
     * @param studentId the studentId to add to the set of expanded students
     */
    expandStudent(studentId: number): void {
        this.expandedStudents.add(studentId);
    }

    /**
     * Removes the student from the set of expanded students.
     *
     * @param studentId the studentId to remove from the set of expanded students
     */
    collapseStudent(studentId: number): void {
        this.expandedStudents.delete(studentId);
    }

    /**
     * Returns the class to apply to the table row based on whether or not it is expanded.
     *
     * @param studentId the studentId
     */
    getStudentDetailClass(studentId: number): string {
        if (this.isStudentExpanded(studentId)) {
            return 'detail-row-expanded';
        }

        return 'detail-row-collapsed';
    }

    /**
     * Returns true if a filter is applied to this column.
     *
     * @param column the column to check
     */
    isColumnFiltered(column: string): boolean {
        return this.tableFilters.has(column);
    }

    /**
     * Returns the class to apply to the table column header based on whether or not it is filtered.
     *
     * @param column the column
     */
    getColumnFilterClass(column: string): string {
        if (this.isColumnFiltered(column)) {
            return 'column-filtered';
        }

        return 'column-not-filtered';
    }

    /**
     * Called when the filter icon is clicked for a column. Opens the filter dialong for the column.
     *
     * @param parentElement the td element for the column
     * @param column the column
     */
    openTextFilterDialog(parentElement: any, column: string) {

        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;
        dialogConfig.restoreFocus = false;

        // Get location of parent element so we can position the filter dialog right below it
        const parentRect = parentElement.getBoundingClientRect();
        dialogConfig.position = { left: `${parentRect.left}px`, top: `${parentRect.bottom}px` };

        // If the field is already filtered then initialize the filter dialog to the filtered operator and value.
        // Otherwise, initialize it to default operator and blank value.
        let filter: TableFilter;
        if (this.isColumnFiltered(column)) {
            filter = this.tableFilters.get(column);
        } else {
            filter = new TableFilter();
            filter.field = column;
            filter.operator = 'Is equal to';
            filter.value = '';
        }
        dialogConfig.data = { field: `${column}`, operator: `${filter.operator}`, value: `${filter.value}` };

        const dialogRef = this.dialog.open(TableFilterTextComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(result => {
            if (result.value.length === 0) {
                this.tableFilters.delete(result.field);
            } else {
                this.tableFilters.set(result.field, { field: `${result.field}`, operator: `${result.operator}`, value: `${result.value}` });
            }

            // Reload the students passing in a post load function that collapses all detail rows
            const postLoadFunction = (): void => { this.expandedStudents.clear(); };
            this.reloadStudents(postLoadFunction);
        });
    }

    /**
     * Called to reload the students after events like filtering, add student, delete student, etc.
     *
     * @param postLoadFunction the function to call after the students are reloaded
     */
    reloadStudents(postLoadFunction: () => void): void {
        this.isProcessing = true;
        this.studentsHttpClient.getStudents(this.sort.active, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize,
            this.tableFilters)
            .pipe(
                map(studentsList => { // the function to apply to the StudentDetailList observable
                    this.isProcessing = false;
                    this.totalStudents = studentsList.totalStudents;
                    return studentsList.students;
                }),
            ).subscribe(students => {
                this.students = students;
                postLoadFunction();
            });
    }

    /**
     * Returns true if the student is currently being edited.
     *
     * @param studentId the studentId
     */
    isEditingStudent(studentId: number): boolean {
        return this.editStudentId === studentId;
    }

    /**
     * Called when the edit icon is clicked for the student. Places the student in edit mode.
     *
     * @param studentId the studentId
     */
    onEditClick(studentId: number): void {
        this.isAdding = false; // exit add mode (if necessary)

        // Set the id of the student that is being edited
        this.editStudentId = studentId;

        // Get the student that is being edited
        const student: Student = this.students.find(s => s.studentId === studentId);

        // For some reason, updating a row that's expanded messes up the detail row display
        // so we'll collapse rows that we're editing
        this.collapseStudent(studentId);

        this.studentSchoolIdFormControl.setValue(student.studentSchoolId);
        this.firstNameFormControl.setValue(student.firstName);
        this.lastNameFormControl.setValue(student.lastName);
        this.studentEmailFormControl.setValue(student.studentEmail);
    }

    /**
     * Called when the delete selected students icon is clicked. Deletes the students and refreshes the table.
     */
    onDeleteSelectedClick(): void {

        // If no students are selected, display a message and return
        if (this.selection.selected.length === 0) {
            const dialogConfigInfo = new MatDialogConfig();
            dialogConfigInfo.disableClose = true;
            dialogConfigInfo.restoreFocus = false;
            dialogConfigInfo.data = { title: 'Info', message: 'No students are selected.' };

            const dialogRefInfo = this.dialog.open(NotificationComponent, dialogConfigInfo);
            return;
        }

        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.restoreFocus = false;
        dialogConfig.data = { title: 'Delete', message: 'Are you sure you want to delete the selected students?' };

        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(confirmedDelete => {
            if (confirmedDelete) {
                this.isProcessing = true;
                const studentIds: number[] = new Array(this.selection.selected.length);
                this.selection.selected.forEach(s => studentIds.push(s.studentId));
                this.studentsHttpClient.deleteStudents(studentIds)
                    .subscribe(rsp => {
                        this.isProcessing = false;
                        if (rsp.success) {
                            // Reload the students passing in a post load function that sets editStudentId = -1
                            // so if a row is in edit mode then it will exit it and also have it clear all selected
                            // students since they've been deleted.
                            const postLoadFunction = (): void => { this.editStudentId = -1; this.selection.clear(); };
                            this.reloadStudents(postLoadFunction);
                        } else {
                            const dialogConfigError = new MatDialogConfig();
                            dialogConfigError.disableClose = true;
                            dialogConfigError.data = { title: 'Error', message: `${rsp.error}` };

                            const dialogRefError = this.dialog.open(NotificationComponent, dialogConfigError);
                        }
                    });
            }
        });
    }

    /**
     * Called when the delete student icon is clicked for a student. Deletes the student and refreshes the table.
     *
     * @param studentId the studentId
     */
    onDeleteClick(studentId: number): void {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.data = { title: 'Delete', message: 'Are you sure you want to delete this student?' };

        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(confirmedDelete => {
            if (confirmedDelete) {
                this.isProcessing = true;
                this.studentsHttpClient.deleteStudent(studentId)
                    .subscribe(rsp => {
                        this.isProcessing = false;
                        if (rsp.success) {
                            // Reload the students passing in a post load function that sets editStudentId = -1
                            // so the row will exit edit mode
                            const postLoadFunction = (): void => { this.editStudentId = -1; };
                            this.reloadStudents(postLoadFunction);
                        } else {
                            const dialogConfigError = new MatDialogConfig();
                            dialogConfigError.disableClose = true;
                            dialogConfigError.data = { title: 'Error', message: `${rsp.error}` };

                            const dialogRefError = this.dialog.open(NotificationComponent, dialogConfigError);
                        }
                    });
            }
        });
    }

    /**
     * Returns true if update is disabled due to one or more form controls having an invalid value.
     */
    isUpdateDisabled(): boolean {
        // If any of the form controls are invalid, return true so the Update icon will be disabled
        if (this.studentSchoolIdFormControl.invalid || this.firstNameFormControl.invalid ||
            this.lastNameFormControl.invalid || this.studentEmailFormControl.invalid) {
            return true;
        }

        return false;
    }

    /**
     * Called when the update student icon is clicked for a student. Updates the student and refreshes the table.
     *
     * @param studentId the studentId
     */
    onUpdateClick(studentId: number): void {
        // Update the student
        const student: Student = {
            studentId: this.editStudentId,
            studentSchoolId: `${this.studentSchoolIdFormControl.value}`,
            firstName: `${this.firstNameFormControl.value}`,
            lastName: `${this.lastNameFormControl.value}`,
            studentEmail: `${this.studentEmailFormControl.value}`
        };

        this.isProcessing = true;
        this.studentsHttpClient.updateStudent(student)
            .subscribe(rsp => {
                this.isProcessing = false;
                if (rsp.success) {
                    // Reload the students passing in a post load function that sets editStudentId = -1
                    // so the row will exit edit mode
                    const postLoadFunction = (): void => { this.editStudentId = -1; };
                    this.reloadStudents(postLoadFunction);
                } else {
                    const dialogConfig = new MatDialogConfig();
                    dialogConfig.disableClose = true;
                    dialogConfig.data = { title: 'Error', message: `${rsp.error}` };

                    const dialogRef = this.dialog.open(NotificationComponent, dialogConfig);
                }
            });
    }

    /**
     * Called when cancel icon is clicked while a student is being edited. Cancels edit mode.
     *
     * @param studentId the studentId
     */
    onCancelEditClick(studentId: number): void {
        // Set editStudentId = -1 so the row will exit edit mode
        this.editStudentId = -1;
    }

    /**
     * Called when cancel icon is clicked while a student is being added. Cancels add mode.
     *
     * @param studentId the studentId
     */
    onCancelAddClick(studentId: number): void {
        // Set isAdding = -1 false the add header row will be hidden
        this.isAdding = false;
    }

    /**
     * Called when add student icon is clicked. Enters add mode.
     */
    onAddStudentClick(): void {
        this.isAdding = true;
        this.editStudentId = -1; // exit edit mode (if necessary)

        this.studentSchoolIdFormControl.setValue('');
        this.firstNameFormControl.setValue('');
        this.lastNameFormControl.setValue('');
        this.studentEmailFormControl.setValue('');
    }

    /**
     * Returns true if add is disabled due to one or more form controls having an invalid value.
     */
    isAddDisabled(): boolean {
        // If any of the form controls are invalid, return true so the Add button will be disabled
        if (this.studentSchoolIdFormControl.invalid || this.firstNameFormControl.invalid ||
            this.lastNameFormControl.invalid || this.studentEmailFormControl.invalid) {
            return true;
        }

        return false;
    }

    /**
     * Called when the add student icon is clicked for a student. Adds the student and refreshes the table.
     *
     * @param studentId the studentId
     */
    onAddClick(studentId: number): void {
        // Add the student
        const student: Student = {
            studentId: -1,
            studentSchoolId: `${this.studentSchoolIdFormControl.value}`,
            firstName: `${this.firstNameFormControl.value}`,
            lastName: `${this.lastNameFormControl.value}`,
            studentEmail: `${this.studentEmailFormControl.value}`
        };

        this.isProcessing = true;
        this.studentsHttpClient.addStudent(student)
            .subscribe(rsp => {
                this.isProcessing = false;
                if (rsp.success) {
                    // Reload the students passing in a post load function that sets isAdding = false
                    // so the add header row will be hidden
                    const postLoadFunction = (): void => { this.isAdding = false; };
                    this.reloadStudents(postLoadFunction);
                } else {
                    const dialogConfig = new MatDialogConfig();
                    dialogConfig.disableClose = true;
                    dialogConfig.data = { title: 'Error', message: `${rsp.error}` };

                    const dialogRef = this.dialog.open(NotificationComponent, dialogConfig);
                }
            });
    }

    /**
     * Returns the class for the add header row based on whether or not the table is in add mode.
     */
    getAddHeaderRowClass(): string {
        if (this.isAdding) {
            return 'adding';
        }

        return 'not-adding';
    }

    /**
     * Called when adding and editing a student to verify the entered student school id is not already assigned to another student.
     */
    studentSchoolIdValidator(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {

            // Make a REST API call to validate the school id. This is needed to make sure the school id
            // isn't already assigned to another student.
            this.isProcessing = true;
            return this.studentsHttpClient.validateStudentSchoolId(this.editStudentId, control.value)
                .pipe(
                    switchMap(rsp => { // switches the Response observable to a ValidationErrors observable
                        this.isProcessing = false;
                        if (rsp.success) {
                            return of(null);
                        } else {
                            return of({ invalidSchoolId: { errorMsg: rsp.error } });
                        }
                    })
                );
        };
    }

    /**
     * If the form control has an error, returns the error message.
     *
     * @param formControl the form control
     */
    getErrorMessage(formControl: FormControl): string {
        if (formControl.hasError('required')) {
            return 'You must enter a value';
        }

        if (formControl.hasError('email')) {
            return 'Not a valid email';
        }

        if (formControl.hasError('invalidSchoolId')) {
            return formControl.getError('invalidSchoolId').errorMsg;
        }

        return '';
    }
}
