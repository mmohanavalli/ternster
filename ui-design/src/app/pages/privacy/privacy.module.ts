import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrivacyComponent } from './privacy.component';
import { SharedModule } from 'src/app/shared/shared.module';

export const routes = [
  { 
  	path: '', 
  	component: PrivacyComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [PrivacyComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,
     ]
})
export class PrivacyModule { }

