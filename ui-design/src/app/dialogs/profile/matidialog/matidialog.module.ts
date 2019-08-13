import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatiDialog, SafePipe } from './matidialog.component';

@NgModule({
  declarations: [MatiDialog, SafePipe],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    SharedModule
  ],
  entryComponents: [ MatiDialog ]
})
export class MatidialogModule { }