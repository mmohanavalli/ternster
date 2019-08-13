import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { MessagesComponent } from './messages/messages.component';
import { WalletComponent } from './wallet/wallet.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';


export const routes = [
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
      path:'messages',
      component: MessagesComponent,
  },
  {
      path:'wallet',
      component: WalletComponent,
  },
  {
    path:'changepassword',
    component: ChangepasswordComponent,
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }
