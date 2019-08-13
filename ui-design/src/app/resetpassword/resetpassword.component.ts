import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient, HttpClientModule, HttpEvent, HttpHeaders, HttpEventType } from '@angular/common/http';
import { GlobalService } from '../model/global.service';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

function passwordConfirming(c: AbstractControl): any {
  if(!c.parent || !c) return;
  const pwd = c.parent.get('password');
  const cpwd= c.parent.get('confirmpassword');
  if(!pwd || !cpwd) return ;
  if (pwd.value !== cpwd.value) {
    return { invalidpassword: true };
  }
}


@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent implements OnInit {
  public token_url: any = '';
  public form: FormGroup;
  public invalidpassword: boolean = false;

  constructor(
    public formBuilder: FormBuilder,
    private _router: Router,
    private _http: HttpClient,
    private _globalService: GlobalService,
    private toastr: ToastrService
  ) { 
      this.form = this.formBuilder.group({
        password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
        confirmpassword: ['', Validators.compose([Validators.required, passwordConfirming, Validators.minLength(6)])], 
      });    
  }

  ngOnInit() {
    window.scroll(0,0);
    var url = this._router.url;
    var splitted_url = url.split('/');
    this.token_url = splitted_url[splitted_url.length - 1];
    // console.log("Token URL",this.token_url);
    var api_url = this._globalService.apiHost + '/ResetVerification?token=' + this.token_url;

    this._http.get(api_url)
    .subscribe(res => {
      if(res['status'] == 'ok') {
        
      }
      else {
        Swal.fire({
          title: 'Sorry!',
          text:'Token has been Expired!',
          cancelButtonText: 'Ok',
          allowOutsideClick: false
        }).then((result) => {
          if(result) {
            this._router.navigate(['/home']);
          }
        })
      }
    });

    this.form.valueChanges.subscribe(field => {
      if(field.confirmpassword !== ''){
        if (field.password !== field.confirmpassword) {
          this.invalidpassword = true;       
        } else {
          this.invalidpassword = false;
        }
      }   
      else{
        this.invalidpassword = false;
      }
    });

  }

  resetPassword() {
    // console.log('this.form', this.form);
    if(this.form.valid){
      let passwordVal = this.form.value;   
      var api_url = this._globalService.apiHost + '/ResetPassword';

      var post_data = {
        password: passwordVal.password,
        id:this.token_url
      }

      this._http.post(api_url, post_data)
      .subscribe(res => {
        if(res['status'] == 'ok') {
          this.toastr.success('Password Changed Successfully');
          this._router.navigate(['/home']);
        }
        else {
          this.toastr.error(res['msg'])
        }
      })
    }
  }
}