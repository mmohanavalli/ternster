import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeedbackComponent } from './feedback.component';
import { RatingModule } from 'ng-starrating';
export const routes = [
  { 
  	path: '', 
  	component: FeedbackComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [FeedbackComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule ,
    RatingModule
  ],
})
export class FeedbackModule { }