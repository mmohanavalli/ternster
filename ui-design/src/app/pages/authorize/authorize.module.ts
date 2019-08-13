import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthorizeComponent, AuthorizeDialog, VerifiedDialog } from './authorize.component';
import { SharedModule } from '../../shared/shared.module'

export const routes = [
  { 
  	path: '', 
  	component: AuthorizeComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [ AuthorizeComponent, AuthorizeDialog, VerifiedDialog ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule
  ],
  entryComponents: [ AuthorizeDialog, VerifiedDialog ]
})
export class AuthorizeModule { }
