import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module'
import { VerifyReceiverOtpDialog } from './verify-receiver-otp-dialog.component';

@NgModule({
  declarations: [VerifyReceiverOtpDialog],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    SharedModule
  ],
  entryComponents: [VerifyReceiverOtpDialog]
})
export class VerifyReceiverOtpDialogModule { }

