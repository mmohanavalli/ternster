import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient, HttpClientModule, HttpEvent, HttpHeaders, HttpEventType } from '@angular/common/http';
import { FormGroup, FormGroupDirective, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { GlobalService } from '../../model/global.service';
import { UserService } from '../../model/user.service';
// import { FacebookLoginProvider, GoogleLoginProvider, AuthService } from "angularx-social-login";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.css']
})
export class AuthorizeComponent implements OnInit {
  public _AuthorizeForm: FormGroup;
	public token_url: any = '';
  phoneCode:any;
  constructor(public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _http: HttpClient,
    private _globalService: GlobalService,
    private _userService: UserService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    
    // private socialAuthService: AuthService,
    private toastr: ToastrService) 
  {
  	this._AuthorizeForm = this._formBuilder.group({
      mobile: ['', [ Validators.minLength(10), Validators.maxLength(20)]],
      phone_code: '',
  		otp: new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required, Validators.maxLength(4)]))
  	});
  }

  ngOnInit() {

  	var url = this._router.url;
    var splitted_url = url.split('/');
    this.token_url = splitted_url[splitted_url.length - 1];
    this.phoneCode=91;
    var api_url = this._globalService.apiHost + '/CheckVerification?token=' + this.token_url;    
    this._http.get(api_url)
    .subscribe(res => {
      if(res['status'] == 'ok') {
      	this.openAuthorizeDialog();
      }
      else {
      	this.openVerifiedDialog();
      }
    });
  }

  
  public openVerifiedDialog() {
  	const dialogRef = this.dialog.open(VerifiedDialog, {
      width: '500px',
      disableClose: true
    });
    // this.dialog.setCancelable(false);
    // this.dialog.setCanceledOnTouchOutside(false);
  }

  public openAuthorizeDialog() {
  	const dialogRef = this.dialog.open(AuthorizeDialog, {
      width: '600px',
	   height: '550px',
      data: this._AuthorizeForm
    });

  	dialogRef.afterClosed().subscribe(result => {
      if(result) {
      }
    });
  }  
}

@Component({
  selector: 'verifiedDialog',
  templateUrl: './verifiedDialog.html'
})
export class VerifiedDialog  {
	constructor(public dialogRef: MatDialogRef<VerifiedDialog>) { }
}

@Component({
  selector: 'authorizeDialog',
  templateUrl: './authorizeDialog.html'
})
export class AuthorizeDialog implements OnInit {
	public _mobForm: FormGroup;
	public _otpform: FormGroup;
	public token_url: any = '';
  public isResendOtpEnabled: boolean = false;
  public verificaton_info: boolean = false;
  public resOTP: any;
  public phone_code_list: any = [];
  phoneCode:any;
  public phonecodenumber: any;
  constructor(public dialogRef: MatDialogRef<AuthorizeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: FormGroup,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _http: HttpClient,
    private _globalService: GlobalService,
    private _userService: UserService,
    private toastr: ToastrService) 
  {
    dialogRef.disableClose = true;
  	this._mobForm = this._formBuilder.group({
      mobile: ['', [ Validators.minLength(5), Validators.maxLength(20)]],
      phone_code: ['', [ Validators.required]],
  	});
  	this._otpform = this._formBuilder.group({
  		otp: ['', Validators.compose([Validators.required, Validators.maxLength(4)])],
    })    
    
  }

  ngOnInit() {
  	var url = this._router.url;
    var splitted_url = url.split('/');
    this.token_url = splitted_url[splitted_url.length - 1];
    this.phoneCode=91;
    this.GetPhonecodelist();    
  }

  GetPhonecodelist() {
    this._http.get(this._globalService.apiHost + "/GetPhonecodelist")
      .subscribe(response => {      
        if (response["status"] == "ok") {
          this.phone_code_list = response["data"];          
        }
      });
  }
  selectphonecode(event) {
    this.phoneCode =event.value;
  }
  mobileSubmit(msgFormData, isResend) {
  	if(msgFormData.valid) {
      var api_url = this._globalService.apiHost + '/SendOTP?mobile=+'+ msgFormData.value.phone_code + msgFormData.value.mobile + '&token_url=' + this.token_url + '&isResend=' + isResend;

      this._http.get(api_url)
      .subscribe(res => {
        if(res['status'] == 'ok') {
        	this.data.controls['otp'].enable()
        	this.data.controls['mobile'].disable();
          this.isResendOtpEnabled = true;
          this.verificaton_info = true;
         
          // localStorage.setItem('UserToken-OTP', res['otp']);  
          this.resOTP =res['otp'];     

          // this.successSnackBar('SMS sent successfully!', 'X');
          this.toastr.success('OTP sent successfully!');
        }
        else if(res['status'] == 'error') {
          this.toastr.error(res['msg']);
        }
        else {
          // this.redSnackBar('Error occured in sending SMS! Please enter a valid mobile number', 'X');
          this.toastr.error('Error occured in sending SMS! Please enter a valid mobile number');
        }
      });
  	}
  }

  resendOtp(msgFormData, formDirective: FormGroupDirective) {
    formDirective.resetForm();
    this.mobileSubmit(msgFormData, true);
  }

  verifyMobile(vdata: any) {
    
    // var UVerifyOTP = localStorage.getItem('UserToken-OTP');
    var UVerifyOTP = this.resOTP;
    var api_url = this._globalService.apiHost + '/VerifyOTP?mobile=' + this._mobForm.value.mobile + '&otpcode=' + vdata.value.otp + '&token_url=' + this.token_url+ '&UVerifyOTP=' + UVerifyOTP;
    this._http.get(api_url)
    .subscribe(res => {
      if(res['status'] == 'ok') {
        // localStorage.setItem('frontend-token', 'JWT '+ res['token']);
        // this.toastr.success('OTP verified and Login successfully');
        this.toastr.success('OTP verified please login');
        this._router.navigate(['/home']);
        this.dialogRef.close();
        // this._globalService.socket.emit('login_submit');
      }
      else {
        this.toastr.error('Entered OTP code is wrong!')
      }
    });
  } 
 
}
