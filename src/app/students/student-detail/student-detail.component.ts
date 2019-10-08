import { Component, Input, ViewChild, AfterViewInit, OnChanges, SimpleChange } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { StudentDetail } from '../student-detail';
import { StudentsHttpClient } from '../students-http-client';

@Component({
    selector: 'app-student-detail',
    templateUrl: './student-detail.component.html',
    styleUrls: ['./student-detail.component.css']
})
export class StudentDetailComponent implements AfterViewInit, OnChanges {

    /**
     * The studentId for this student detail component.
     */
    @Input() studentId: number;

    /**
     * Flag to indicate if this student detail row is expanded or collapsed.
     */
    @Input() isExpanded: boolean;

    /**
     * The columns to display in the student detail table.
     */
    columnsToDisplay: string[] = ['termCreatedDate', 'termDescription', 'applied', 'loansTotalAmount', 'attemptedHours', 'earnedHours',
        'completionRate', 'gpa', 'financialAidStatus', 'financialAidStatusProj', 'enrolledHours',
        'droppedHours', 'attemptedHoursProj', 'completionRateProj', 'gpaRequired', 'addlHoursRequired'];

    studentsHttpClient: StudentsHttpClient | null;
    studentDetails: StudentDetail[] = [];
    totalDetails = 0;
    defaultPageSize = 5;
    pageSizeOptions: number[] = [5, 10, 15, 20, 25];
    showFirstLastButtons = true;
    isLoadingResults = true;

    /**
     * An injected reference to the paginator component for the student detail table.
     */
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

    /**
     * An injected reference to the sort component for the student detail table.
     */
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    /**
     * The constructor for the student detail component.
     */
    constructor() { }

    /**
     * Called after Angular has fully initialized the component's view. Inits code to handle sorting and paging events.
     */
    ngAfterViewInit() {
        if (this.studentsHttpClient == null) {
            this.studentsHttpClient = new StudentsHttpClient();
        }

        // Merge the MatSort and MatPaginator observables into a single observable
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                switchMap(() => { // switches the MatSort or MatPaginator observable to a StudentDetailList observable
                    this.isLoadingResults = true;
                    return this.studentsHttpClient.getStudentDetail(this.studentId, this.sort.active, this.sort.direction,
                        this.paginator.pageIndex, this.paginator.pageSize);
                }),
                map(studentDetailList => { // the function to apply to the StudentDetailList observable
                    this.isLoadingResults = false;
                    this.totalDetails = studentDetailList.totalDetails;
                    return studentDetailList.details;
                }),
            ).subscribe(studentDetails => { this.studentDetails = studentDetails; });
    }

    /**
     * Called when a data-bound property changes. This code is handling changes to the isExpanded property.
     *
     * @param changes The changed properties.
     */
    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (this.studentsHttpClient == null) {
            this.studentsHttpClient = new StudentsHttpClient();
        }

        // When the student is expanded, retrieve the latest details for the student
        if (this.isExpanded) {
            this.isLoadingResults = true;
            this.studentsHttpClient.getStudentDetail(this.studentId, this.sort.active, this.sort.direction, this.paginator.pageIndex,
                this.paginator.pageSize)
                .pipe(
                    map(studentDetailList => { // the function to apply to the StudentDetailList observable
                        this.isLoadingResults = false;
                        this.totalDetails = studentDetailList.totalDetails;
                        return studentDetailList.details;
                    }),
                ).subscribe(studentDetails => { this.studentDetails = studentDetails; });
        }
    }
}
