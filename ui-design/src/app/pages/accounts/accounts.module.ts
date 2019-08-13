import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountsRoutingModule } from './accounts-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AccountsComponent } from './accounts.component';
import { SettingsComponent } from './settings/settings.component';
import { WalletComponent } from './wallet/wallet.component';
import { MessagesComponent, SafePipe } from './messages/messages.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProfileComponent } from './profile/profile.component';
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { EmojiModule } from "@ctrl/ngx-emoji-mart/ngx-emoji";
import { PipeModule } from 'src/app/pipe/pipe.module';
import { CropImageDialog } from "../../dialogs/profile/cropimageDialog";
import { CropCoverImageDialog } from "../../dialogs/profile/cropCoverImageDialog";
import { EditTernsterAccountDialog } from "../../dialogs/profile/edit-ternster-account";
import { ImageCropperModule } from "../../shared/image-cropper/image-cropper.module";
import { RequestMoneyDialog } from 'src/app/dialogs/profile/request-money';
import { AddTernsterAccountModule } from 'src/app/dialogs/profile/add-ternster-account/add-ternster-account.module';
import { MatidialogModule } from 'src/app/dialogs/profile/matidialog/matidialog.module';

@NgModule({
  declarations: [AccountsComponent,  
    ProfileComponent,
    SettingsComponent,
    WalletComponent,
    MessagesComponent,
    ChangepasswordComponent,
    CropImageDialog,
    CropCoverImageDialog,
    EditTernsterAccountDialog,    
    RequestMoneyDialog,
    SafePipe
  ],
  imports: [  
    CommonModule,
    AccountsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    PickerModule,
    EmojiModule,
    PipeModule,
    ImageCropperModule,
    AddTernsterAccountModule,
    MatidialogModule
  ],
  entryComponents: [
    CropImageDialog,
    CropCoverImageDialog,
    EditTernsterAccountDialog,
    RequestMoneyDialog
  ]
})
export class AccountsModule { }
