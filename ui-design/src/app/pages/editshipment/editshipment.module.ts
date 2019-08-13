import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditshipmentComponent } from './editshipment.component';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';

export const routes = [
  { 
  	path: '', 
  	component: EditshipmentComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [EditshipmentComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,
  ]
})

export class EditshipmentModule { }
