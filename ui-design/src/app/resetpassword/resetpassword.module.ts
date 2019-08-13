
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { ResetpasswordComponent } from './resetpassword.component';


export const routes = [
  { 
  	path: '', 
  	component: ResetpasswordComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [ResetpasswordComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule
  ]
})
export class ResetpasswordModule { }