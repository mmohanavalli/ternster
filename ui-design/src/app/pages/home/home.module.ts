import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { HomeComponent, ForgotPasswordDialog, FBEmailDialog } from "./home.component";
import {
  MatFormFieldModule,
  MatDialogModule,
  MatInputModule,
  MatButtonModule
} from "@angular/material";

export const routes = [
  {
    path: "",
    component: HomeComponent,
    pathMatch: "full"
  }
];

@NgModule({
  declarations: [HomeComponent, ForgotPasswordDialog, FBEmailDialog],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  entryComponents: [ForgotPasswordDialog, FBEmailDialog]
})
export class HomeModule {}
