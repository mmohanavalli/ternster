import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TernsterAccountsDialog } from './ternster-accounts-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [TernsterAccountsDialog],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    SharedModule
  ],
  entryComponents: [ TernsterAccountsDialog ]

})
export class TernsterAccountsDialogModule { }
