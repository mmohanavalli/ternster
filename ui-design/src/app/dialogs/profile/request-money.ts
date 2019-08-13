import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';


@Component({
    selector: 'request-money',
    templateUrl: './request-money.html'
  })
  export class RequestMoneyDialog {
    public message: any = '';
    
    public accounts_form: FormGroup;
    public isLoading: boolean = true;
  
    constructor(public dialogRef: MatDialogRef<RequestMoneyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _form: FormBuilder,
      public _globalService: GlobalService,
      public _userService: UserService,
      private _http: HttpClient,
      private toastr: ToastrService) {
        this.accounts_form = this._form.group({
          account_no: [this.data.account_no, Validators.compose([Validators.required])],
          retype_account_no: ['', Validators.compose([Validators.required])],
          ifsc_code: [this.data.ifsc_code, Validators.compose([Validators.required])],
          account_holder_name: [this.data.account_holder_name, Validators.compose([Validators.required])],
          bank_name: [this.data.bank_name, Validators.compose([Validators.required])],
          bank_address: [this.data.bank_address, Validators.compose([Validators.required])],
        });
     }
   
  
  
     ngOninit() {
       console.log("sasas"+this.data);
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
  
          var api_url = this._globalService.apiHost + '/updateUserBankDetails';
          this._http.post(api_url, post_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
            .subscribe(res => {
              if (res['status'] == 'ok') {
                let msg = "Accounts Updated Successfuly"
                this.dialogRef.close(msg);
              }
            });
        }
      }
      else {
        this.isLoading = false;
      }
    }
    
  }  