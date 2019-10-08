import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material';
import { NotificationComponent } from './notification/notification.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule
    ],
    declarations: [
        NotificationComponent,
        ConfirmDialogComponent
    ],
    exports: [ // components that are accessible to other modules that import this module
        NotificationComponent,
        ConfirmDialogComponent
    ],
    entryComponents: [ // components that are not referenced in a template
        NotificationComponent,
        ConfirmDialogComponent
    ]
})
export class DialogsModule { }
