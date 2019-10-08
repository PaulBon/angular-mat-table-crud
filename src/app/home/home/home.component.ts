import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, debounceTime, tap, distinctUntilChanged } from 'rxjs/operators';
import { WikiService } from '../wiki-service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    wikiService: WikiService | null;
    filteredResults: Observable<string[]>;
    formGroup: FormGroup;
    termFormControl: FormControl = new FormControl();
    isProcessing = false;

    /**
     * The constructor for the home component.
     *
     * @param fb a dependency injection (DI) for FormBuilder
     * @param http a dependency injection (DI) for HttpClient
     */
    constructor(private fb: FormBuilder, private http: HttpClient) { }

    /**
     * Called once to initialize the home component.
     */
    ngOnInit() {
        this.wikiService = new WikiService(this.http);

        this.formGroup = this.fb.group({
            termFormControl: this.termFormControl
        });

        this.filteredResults = this.formGroup.get('termFormControl').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                tap(() => { this.isProcessing = true; }),
                switchMap(term => this.wikiService.search(term)),
                tap(() => { this.isProcessing = false; })
            );
    }
}
