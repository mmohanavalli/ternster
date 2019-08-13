import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsComponent } from './terms.component';
import { RouterModule } from '@angular/router';

export const routes = [
  {
    path: "",
    component: TermsComponent,
    pathMatch: "full"
  }
];

@NgModule({
  declarations: [TermsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class TermsModule { }
