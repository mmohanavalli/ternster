import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactComponent } from './contact.component';
import { RouterModule } from '@angular/router';

export const routes = [
  {
    path: "",
    component: ContactComponent,
    pathMatch: "full"
  }
];

@NgModule({
  declarations: [ContactComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ContactModule { }
