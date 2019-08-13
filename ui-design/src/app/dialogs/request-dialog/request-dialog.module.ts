import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RequestDialog, CourierRequestDialog, AssistanceRequestDialog } from './request-dialog.component';
import { SharedModule } from '../../shared/shared.module'

@NgModule({
  declarations: [ RequestDialog, CourierRequestDialog, AssistanceRequestDialog ],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    SharedModule
  ],
  entryComponents: [ RequestDialog, CourierRequestDialog, AssistanceRequestDialog ]
})
export class RequestDialogModule { }
