import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { BasicprofileComponent } from './basicprofile.component';


export const routes = [
  { 
  	path: '', 
  	component: BasicprofileComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [BasicprofileComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,    
  ]
})
export class BasicprofileModule { }
