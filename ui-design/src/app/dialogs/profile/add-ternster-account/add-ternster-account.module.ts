import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddTernsterAccountDialog } from './add-ternster-account';

@NgModule({
  declarations: [AddTernsterAccountDialog],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    SharedModule
  ],
  entryComponents: [ AddTernsterAccountDialog ]

})
export class AddTernsterAccountModule { }
