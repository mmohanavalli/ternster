import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from '../../model/global.service';
import { UserService } from '../../model/user.service';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormGroupDirective, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ternster-accounts-dialog',
  templateUrl: './ternster-accounts-dialog.component.html',
  styleUrls: ['./ternster-accounts-dialog.component.css']
})
export class TernsterAccountsDialog implements OnInit {

  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;

  public message: any = '';
  public accounts_form: FormGroup;
  public isLoading: boolean = true;

  constructor(public dialogRef: MatDialogRef<TernsterAccountsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _form: FormBuilder,
    public _globalService: GlobalService,
    public _userService: UserService,
    private _http: HttpClient,
    private toastr: ToastrService
  ) {
    this.accounts_form = this._form.group({
      account_no: ['', Validators.compose([Validators.required, Validators.minLength(10)])],
      retype_account_no: ['', Validators.compose([Validators.required, Validators.minLength(10)])],
      ifsc_code: [null, Validators.compose([Validators.required, Validators.minLength(5)])],
      account_holder_name: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      bank_name: [0, Validators.compose([Validators.required, Validators.minLength(5)])],
      bank_address: [null, Validators.compose([Validators.required, Validators.minLength(10)])],
    });
  }

  ngOnInit() {
    this.accounts_form.setValue({
      account_no: this.accounts_form.value.account_no,
      retype_account_no: this.accounts_form.value.retype_account_no,
      ifsc_code: this.accounts_form.value.ifsc_code,
      account_holder_name: this.accounts_form.value.account_holder_name,
      bank_name: this.accounts_form.value.bank_name,
      bank_address: this.accounts_form.value.bank_address,
    });
  }


  public onSubmitAccounts() {
    console.log("this.courier_form", this.accounts_form.value);
    if (this.accounts_form.valid) {
      let formData = this.accounts_form.value;
      if (formData.account_no != formData.retype_account_no) {
        this.toastr.warning('Retype account number does not match');
      } else {
        this.isLoading = true;
        var post_data = {
          account_no: formData.account_no,
          retype_account_no: formData.retype_account_no,
          ifsc_code: formData.ifsc_code,
          account_holder_name: formData.account_holder_name,
          bank_name: formData.bank_name,
          bank_address: formData.bank_address,
        }

        
        var api_url = this._globalService.apiHost + '/CreateBankAccountDetails';
        this._http.post(api_url, post_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
          .subscribe(res => {
            console.log("res",res)
            let msg = 'success';
            if (res['status'] == 200) {
              this.dialogRef.close(msg);
            }else{
              msg = 'error';
              this.toastr.warning('Please enter correct data');
              // this.dialogRef.close(msg);
            }
          });
      }
    }
    else {
      this.isLoading = false;
    }
  }

}
