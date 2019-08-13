import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import { ToastrService } from 'ngx-toastr';
import { identifierModuleUrl } from '@angular/compiler';
import async from 'async';

@Component({
  selector: 'app-verify-receiver-otp-dialog',
  templateUrl: './verify-receiver-otp-dialog.component.html',
  styleUrls: ['./verify-receiver-otp-dialog.component.css']
})
export class VerifyReceiverOtpDialog implements OnInit {
	public _otpform: FormGroup;

  public req_user_id = '';
  public req_id = '';
  public from_user_id = '';
  public to_user_id = '';
  public trip_id = '';
  public receiver_otp :any;
  public package_weight: any;
  public type: any;

  constructor(public dialogRef: MatDialogRef<VerifyReceiverOtpDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _http: HttpClient,
    private _globalService: GlobalService,
    private _userService: UserService,
    private toastr: ToastrService) 
  {
    console.log("verify data",data);
   var root = this;
   this.from_user_id = this.data.from_user_id;
   this.to_user_id = this.data.to_user_id;
   this.trip_id = this.data.trip_id;
   this.type = this.data.type;
    async.forEach(this.data.request_data, function (list) {
      root.req_id =list.id;
      root.req_user_id = list.user_id;  
      root.receiver_otp = list.receiver_otp;
      root.package_weight = list.package_weight;   
    });

  	this._otpform = this._formBuilder.group({
  		receiver_otp: ['', Validators.compose([Validators.required, Validators.maxLength(4)])],
  	})
  }

  ngOnInit() {
  
  }


  verifyReceiverOTP() {
    if(this._otpform.value.receiver_otp == this.receiver_otp){   
    var paramData ={
      id:this.req_id,
      receiver_otp:this._otpform.value.receiver_otp,
      req_user_id:this.req_user_id,
      from_user_id:this.from_user_id,
      to_user_id:this.to_user_id,
      trip_id:this.trip_id,
      type: this.type,
      package_weight: this.package_weight
    }
    var api_url = this._globalService.apiHost + '/VerifyPackageOTP'
    this._http.post(api_url,paramData,{ headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
    .subscribe(res => {
      if(res['status'] == 'ok') {
        this.toastr.success('OTP verified');       
        this.dialogRef.close('verified');
      }
      else {
        this.toastr.error('Entered OTP code is wrong!')
      }
    });
  }else{
    this.toastr.error('Please enter valid OTP');
  }
  }  
}
