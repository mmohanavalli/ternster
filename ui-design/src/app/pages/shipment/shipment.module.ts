import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShipmentComponent } from './shipment.component';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';

export const routes = [
  { 
  	path: '', 
  	component: ShipmentComponent, 
  	pathMatch: 'full' 
  }
];


@NgModule({
  declarations: [ShipmentComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,
  ]
})
export class ShipmentModule { }
