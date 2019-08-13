import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { EdittripComponent } from './edittrip.component';

export const routes = [
  { 
  	path: '', 
  	component: EdittripComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [EdittripComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,
  ]
})
export class EdittripModule { }
