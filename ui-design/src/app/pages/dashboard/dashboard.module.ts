import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { VerifyReceiverOtpDialogModule } from 'src/app/dialogs/verify-receiver-otp-dialog/verify-receiver-otp-dialog.module';


export const routes = [
  { 
  	path: '', 
  	component: DashboardComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [ DashboardComponent ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,
    NgxPaginationModule,
    VerifyReceiverOtpDialogModule
  ],
})
export class DashboardModule { }
