import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UnplannedRequestDialogComponent, CourierRequestDialog, AssistanceRequestDialog } from './unplanned-request-dialog.component';
import { SharedModule } from '../../shared/shared.module'

@NgModule({
  declarations: [ UnplannedRequestDialogComponent, CourierRequestDialog, AssistanceRequestDialog ],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    SharedModule
  ],
  entryComponents: [ UnplannedRequestDialogComponent, CourierRequestDialog, AssistanceRequestDialog ]
})
export class UnplannedRequestDialogModule { }
