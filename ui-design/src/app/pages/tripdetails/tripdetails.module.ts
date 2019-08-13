import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TripdetailsComponent, ConfirmPaymentDialog, UnplannedCompanion, CompanionMessageDialog, UnplannedAssisCourier } from './tripdetails.component';
import { RequestDialogModule } from '../../dialogs/request-dialog/request-dialog.module';
import { UnplannedRequestDialogModule } from '../../dialogs/unplanned-request-dialog/unplanned-request-dialog.module';
import { SharedModule } from '../../shared/shared.module';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { VerifyReceiverOtpDialogModule } from 'src/app/dialogs/verify-receiver-otp-dialog/verify-receiver-otp-dialog.module';

export const routes = [
  { 
  	path: '', 
  	component: TripdetailsComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [ TripdetailsComponent, ConfirmPaymentDialog, UnplannedCompanion, UnplannedAssisCourier, CompanionMessageDialog
     ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,
    NgxPaginationModule,
    RequestDialogModule,   
    UnplannedRequestDialogModule,
    PickerModule, EmojiModule,
    VerifyReceiverOtpDialogModule
    // SearchtripModule
  ],
  entryComponents:[ConfirmPaymentDialog, UnplannedCompanion, UnplannedAssisCourier, CompanionMessageDialog]
})
export class TripdetailsModule { }
