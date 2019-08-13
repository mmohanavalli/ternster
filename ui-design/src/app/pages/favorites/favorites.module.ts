import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FavoritesComponent } from './favorites.component';
import { SharedModule } from '../../shared/shared.module'

export const routes = [
  { 
  	path: '', 
  	component: FavoritesComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [ FavoritesComponent ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule
  ]
})
export class FavoritesModule { }
