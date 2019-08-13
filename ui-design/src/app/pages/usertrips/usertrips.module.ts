import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module'
import { UsertripsComponent } from './usertrips.component';
import { NgxPaginationModule } from 'ngx-pagination';

export const routes = [
  { 
  	path: '', 
  	component: UsertripsComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [ UsertripsComponent ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,
    NgxPaginationModule
  ]
})
export class UsertripsModule { }
