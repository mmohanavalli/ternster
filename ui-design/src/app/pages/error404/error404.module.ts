import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Error404Component } from './error404.component';
import { RouterModule } from '@angular/router';

export const routes = [
  {
    path: "",
    component: Error404Component,
    pathMatch: "full"
  }
];

@NgModule({
  declarations: [ Error404Component ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class Error404Module { }
