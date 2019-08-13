import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AbstractControl, FormGroup, FormBuilder, Validators, FormControl, FormGroupDirective } from '@angular/forms';
import { GlobalService } from '../../model/global.service';
import { UserService } from '../../model/user.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { JwtHelperService } from '@auth0/angular-jwt';

// import { FacebookLoginProvider, GoogleLoginProvider, AuthService } from "angularx-social-login";
import {
  AuthService,
  FacebookLoginProvider,
  GoogleLoginProvider
} from 'angular5-social-login';
import Swal from 'sweetalert2'
import * as CryptoJS from 'crypto-js';

function passwordConfirming(c: AbstractControl): any {
  if (!c.parent || !c) return;
  const pwd = c.parent.get('password');
  const cpwd = c.parent.get('confirmpassword');
  if (!pwd || !cpwd) return;
  if (pwd.value !== cpwd.value) {
    return { invalidpassword: true };
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;
  @ViewChild('target') target: ElementRef;


  public isMainLogin: boolean = true;
  public isLoading: boolean = false;
  public isSignuppage: boolean = false;
  public _registerForm: FormGroup;
  public _loginForm: FormGroup;
  public _forgotForm: FormGroup;
  public invalidpassword: boolean = false;
  public isLoggedIn: boolean = false;

  title = 'EncryptionDecryptionSample';
  public encEmail: string;
  public encPassword: string;
  public encText: string;
  public decPassword: string;
  public encryptEmail: string;
  public encryptPassword: string;

  public jwtHelper: JwtHelperService = new JwtHelperService();
  public token_object: any = '';

  constructor(public _formBuilder: FormBuilder,
    public router: Router,
    private _http: HttpClient,
    private _globalService: GlobalService,
    private _userService: UserService,
    private socialAuthService: AuthService,
    public dialog: MatDialog,
    private toastr: ToastrService) {
    this._registerForm = this._formBuilder.group({
      name: [null, Validators.compose([Validators.required])],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(6)])],
      confirmpassword: [null, Validators.compose([Validators.required, passwordConfirming, Validators.minLength(6)])],
    });
   
    this._loginForm = this._formBuilder.group({
      useremail: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required])],
    });

    this._forgotForm = this._formBuilder.group({
      // email: ['', Validators.compose([Validators.required, Validators.email])],
      email: [null]
    })
  }

  ngOnInit() {
    window.scroll(0, 0);
    
    if (this._userService.isLoggedIn()) {
      this.isLoggedIn = true;

      this.token_object = this.jwtHelper.decodeToken(this._userService.getToken());
      if(this.token_object) {
        var page_param = { user_id: this.token_object.id, url: null };
        this._globalService.socket.emit('page_identification', page_param);
      }
    }

    this._globalService.socket.on('scroll_alert', (data) => {
      console.log('Home page scroll to element');
      this.scrollToElement(data.cnd);
    })



    this._registerForm.valueChanges.subscribe(field => {
      if (field.confirmpassword !== '' && field.password !== '') {
        if (field.password !== field.confirmpassword) {
          this.invalidpassword = false;
        }
        // else {
        //   this.invalidpassword = false;
        // }
      }
      else {
        this.invalidpassword = false;
      }
    });

    this.isMainLogin = false;

  }

  public login(loginField) {
    if (loginField.valid) {
      var api_url = this._globalService.apiHost + '/UserLogin';
      var post_data = {
        email: loginField.value.useremail,
        password: loginField.value.password
      }
      this.isLoading = true;
      this._http.post(api_url, post_data)
        .subscribe(res => {
          if (res['status'] == 'ok') {
            let ternsterAccounts = res['ternsterAccounts']; 
            var user_data = res['user'];
            this.isLoggedIn = true;
            localStorage.setItem('frontend-token', 'JWT ' + res['token']);
            this.toastr.success('Login successfully!');
            this._globalService.socket.emit('login_submit');
            var end_trip_id = undefined;
            console.log("end_trip_id res", res);
            console.log("end_trip_id", res['trip']);
            if (res['trip'][0] != undefined && res['trip'][0] != null) {
              end_trip_id = res['trip'][0].id;
            }
            localStorage.setItem('service_type', res['service_type']);

            // if (ternsterAccounts) {
            //   if ((ternsterAccounts.account_holder_name == "" || ternsterAccounts.account_holder_name == null)
            //     && (ternsterAccounts.account_no == "" || ternsterAccounts.account_no == null)
            //     && (ternsterAccounts.bank_address == "" || ternsterAccounts.bank_address == null)
            //     && (ternsterAccounts.bank_name == "" || ternsterAccounts.bank_name == null)
            //     && (ternsterAccounts.ifsc_code == "" || ternsterAccounts.ifsc_code == null)) {
            //       localStorage.setItem('accountdetails', 'no-data');
            //   }
            // }
            if(user_data.Profile.initial_login == 1) {
              this.router.navigate(['/accounts/profile']);
            }
            else {
              if (end_trip_id != undefined && end_trip_id != null) {
                localStorage.setItem('end_trip_id', res['trip'][0].id);
                this.router.navigate(['/tripaction']);
              }
              else {
                this.router.navigate(['/findatrips']);
              }
            }
            
            this.isLoading = false;
          }
          else if (res['status'] == 'error') {
            this.isLoading = false;
            this.toastr.error(res['msg']);
          }
        })
    }
  }

  onSubmitRegisterForm(formData) {

    if (this._registerForm.value.confirmpassword !== '') {
      if (this._registerForm.value.password !== this._registerForm.value.confirmpassword) {
        this.invalidpassword = true;
      } else {
        this.invalidpassword = false;
      }
    }
    else {
      this.invalidpassword = false;
    }

    if (formData.valid) {
      var api_url = this._globalService.apiHost + '/UserRegister';

      var post_data = {
        name: formData.value.name,
        email: formData.value.email,
        password: formData.value.password
      }

      this.isLoading = true;

      this._http.post(api_url, post_data)
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.isLoading = false;
            Swal.fire({
              title: 'Thank you for registering with Ternster.',
              html: 'To finish setting up your account,<br> You can access the email verification link sent to your registered email id',
              allowOutsideClick: false
            });
            this.formDirective.resetForm();
          }
          else {
            this.isLoading = false;
            this.toastr.error(res['msg']);

          }
        })
    }
  }

  public socialSignIn(socialPlatform: string) {
    let socialPlatformProvider;
    if (socialPlatform == 'google') {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }
    else if (socialPlatform == 'facebook') {
      socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    }

    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        console.log('userdata social login', userData);
        
        if (userData) {

          var userEmail = '';

          if(!userData.email) {
            console.log('no email', userData.email);
            let dialogRef = this.dialog.open(FBEmailDialog, {
              width: '400px'
            });
        
            dialogRef.afterClosed().subscribe(result => {
              if(result) {
                console.log('result', result);
                userEmail = result;
              }
            });
          }
          else {
            console.log('email exists', userData.email);
            userEmail = userData.email;
          }

          console.log('userEmail', userEmail);

          if(userEmail) {
            let data = {
              name: userData.name,
              firstName: '',
              lastName: '',
              provider: userData.provider,
              provider_id: userData.id,
              email: userData.email
            }
  
            this.isLoading = true;
            var api_url = this._globalService.apiHost + '/socialLogin';
  
            this._http.post(api_url, data)
            .subscribe(res => {
              if (res['status'] == 'ok') {
                let ternsterAccounts = res['ternsterAccounts']; 
                var user_data = res['user'];
                this.isLoggedIn = true;
                localStorage.setItem('frontend-token', 'JWT ' + res['token']);
                this.toastr.success('Login successfully!');
                this._globalService.socket.emit('login_submit');
                var end_trip_id = undefined;
                console.log("end_trip_id res", res);
                console.log("end_trip_id", res['trip']);
                if (res['trip'][0] != undefined && res['trip'][0] != null) {
                  end_trip_id = res['trip'][0].id;
                }
                localStorage.setItem('service_type', res['service_type']);
    
                // if (ternsterAccounts) {
                //   if ((ternsterAccounts.account_holder_name == "" || ternsterAccounts.account_holder_name == null)
                //     && (ternsterAccounts.account_no == "" || ternsterAccounts.account_no == null)
                //     && (ternsterAccounts.bank_address == "" || ternsterAccounts.bank_address == null)
                //     && (ternsterAccounts.bank_name == "" || ternsterAccounts.bank_name == null)
                //     && (ternsterAccounts.ifsc_code == "" || ternsterAccounts.ifsc_code == null)) {
                //       localStorage.setItem('accountdetails', 'no-data');
                //   }
                // }
                if(user_data.Profile.initial_login == 1) {
                  this.router.navigate(['/accounts/profile']);
                }
                else {
                  if (end_trip_id != undefined && end_trip_id != null) {
                    localStorage.setItem('end_trip_id', res['trip'][0].id);
                    this.router.navigate(['/tripaction']);
                  }
                  else {
                    this.router.navigate(['/findatrips']);
                  }
                }
                
                this.isLoading = false;
              }
              else if (res['status'] == 'error') {
                this.isLoading = false;
                this.toastr.error(res['msg']);
              }
            })
          }
        }
      }
    );
  }

  signOut(): void {
    this.socialAuthService.signOut();
  }

  public openAddressDialog() {
    let dialogRef = this.dialog.open(ForgotPasswordDialog, {
      width: '400px',
      data: {
        forgotFormData: this._forgotForm,
      }
    });

    dialogRef.afterClosed().subscribe(formdata => {
      this._forgotForm.reset();
    });


  }

  scrollToElement(cnd): void {
    console.log('SCROLL TO ELEMENT');
    this.isSignuppage = cnd;
    this.invalidpassword = false;
    console.log('scroll to element');
    this.formDirective.resetForm();
    this.target.nativeElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }

}

@Component({
  selector: 'fbEmail-dialog',
  templateUrl: 'fbEmail-dialog.html',
  styleUrls: ['./home.component.css'],
})

export class FBEmailDialog {

  public emailIdForm: FormGroup;
  isemail = false;
  isemailValid = false;

  constructor(public dialogRef: MatDialogRef<ForgotPasswordDialog>,
    private _formBuilder: FormBuilder,
  ) {
    this.emailIdForm = this._formBuilder.group({
      email: [null, Validators.compose([Validators.required, Validators.email])]
    })
  }

  submitEmail() {
    var emailForm = this.emailIdForm.value;
    if(!emailForm.email) {
      this.isemail = true;
    }
    else {
      this.isemail = false;
    }
    this.dialogRef.close(emailForm.email);
  }
}

@Component({
  selector: 'forgotPassword-dialog',
  templateUrl: 'forgotPassword-dialog.html',
  styleUrls: ['./home.component.css'],
})

export class ForgotPasswordDialog {

  public isLoading: boolean = false;
  isemail = false;
  isemailValid = false;

  constructor(public dialogRef: MatDialogRef<ForgotPasswordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _http: HttpClient,
    private _globalService: GlobalService,
    private toastr: ToastrService) {
  }

  submitForm() {
    let formData = this.data.forgotFormData.value;
    if (formData.email) {
      this.isemail = false;
      if (formData.email) {
        this.isLoading = true;
        var api_url = this._globalService.apiHost + '/ForgotPassword';

        var post_data = {
          email: formData.email
        }

        this._http.post(api_url, post_data)
          .subscribe(res => {
            if (res['status'] == 'ok') {
              this.isLoading = false;
              this.toastr.success(res['msg']);
              this.dialogRef.close();
            }
            else {
              this.isLoading = false;
              // this.isemailValid =  true;
              this.toastr.error(res['msg']);
            }
          })
      }
    } else {
      this.isemail = true;
    }
  }
}