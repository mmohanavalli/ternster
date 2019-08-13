import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FindatripsComponent, ConfirmRequestDialog, CompanionMessageDialog, UnplannedCompanion, UnplannedAssisCourier } from './findatrips.component';
import { RequestDialogModule } from '../../dialogs/request-dialog/request-dialog.module';
import { UnplannedRequestDialogModule } from '../../dialogs/unplanned-request-dialog/unplanned-request-dialog.module';
import { SharedModule } from '../../shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { AddTernsterAccountModule } from 'src/app/dialogs/profile/add-ternster-account/add-ternster-account.module';
import { MatidialogModule } from 'src/app/dialogs/profile/matidialog/matidialog.module';

export const routes = [
  { 
  	path: '', 
  	component: FindatripsComponent, 
  	pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [ FindatripsComponent, ConfirmRequestDialog, CompanionMessageDialog,
     UnplannedCompanion, UnplannedAssisCourier,  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,
    RequestDialogModule,
    AddTernsterAccountModule,
    UnplannedRequestDialogModule,
    NgxPaginationModule,
    MatidialogModule
  ],
  entryComponents: [ ConfirmRequestDialog, CompanionMessageDialog, UnplannedCompanion,
     UnplannedAssisCourier]
})
export class FindatripsModule { }
