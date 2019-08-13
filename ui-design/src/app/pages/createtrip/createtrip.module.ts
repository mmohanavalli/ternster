import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CreatetripComponent } from './createtrip.component';
import { SharedModule } from '../../shared/shared.module'
import { AddTernsterAccountModule } from 'src/app/dialogs/profile/add-ternster-account/add-ternster-account.module';
import { MatiDialog } from 'src/app/dialogs/profile/matidialog/matidialog.component';
import { MatidialogModule } from 'src/app/dialogs/profile/matidialog/matidialog.module';

export const routes = [
  { 
  	path: '', 
  	component: CreatetripComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [ CreatetripComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    AddTernsterAccountModule  ,
    SharedModule,
    MatidialogModule
  ],
  entryComponents: []
})
export class CreatetripModule { }
