import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewshipmentComponent } from './viewshipment.component';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';

export const routes = [
  { 
  	path: '', 
  	component: ViewshipmentComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [ ViewshipmentComponent ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,
    NgxPaginationModule
  ]
})
export class ViewshipmentModule { }
