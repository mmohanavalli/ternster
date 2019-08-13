import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TripactionComponent } from './tripaction.component';

export const routes = [
  { 
  	path: '', 
  	component: TripactionComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [TripactionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,
  ]
})
export class TripactionModule { }