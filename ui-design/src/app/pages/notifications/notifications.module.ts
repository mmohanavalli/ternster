import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NotificationsComponent } from './notifications.component';
import { SharedModule } from '../../shared/shared.module';

export const routes = [
  { 
  	path: '', 
  	component: NotificationsComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [ NotificationsComponent ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,
  ]
})
export class NotificationsModule { }
