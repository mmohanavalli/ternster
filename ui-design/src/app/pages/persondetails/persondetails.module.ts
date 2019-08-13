import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { PersondetailsComponent } from "./persondetails.component";
import { SharedModule } from "../../shared/shared.module";
import { OrderModule } from "ngx-order-pipe";
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { EmojiModule } from "@ctrl/ngx-emoji-mart/ngx-emoji";

export const routes = [
  {
    path: "",
    component: PersondetailsComponent,
    pathMatch: "full"
  }
];

@NgModule({
  declarations: [PersondetailsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    OrderModule,
    PickerModule,
    EmojiModule
  ]
})
export class PersondetailsModule {}
