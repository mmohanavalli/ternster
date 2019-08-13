import { Component, OnInit, ElementRef, Inject, ViewChild,Pipe,PipeTransform, ViewChildren, Renderer2, ChangeDetectionStrategy, EventEmitter, QueryList } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, FormGroupDirective } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SharedService } from 'src/app/model/shared.service';
import { ToastrService } from 'ngx-toastr';
import csc from 'country-state-city'
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent implements OnInit {
 
  title = 'app';

  public isLoading: boolean = true;
  public isDualLoading: boolean = false;
  public isMainLoading: boolean = true; 
  public jwtHelper: JwtHelperService = new JwtHelperService();   

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  public token_object: any = ''; 

  public profile: boolean = false;
  public settings: boolean = false;
  public wallet: boolean = false;
  public messages: boolean = false;
  public change_pwd: boolean = true;
  

  public header_first_name: any = '';
  public header_last_name: any = '';
  public header_country: any = '';

  public profile_picture: any = '/assets/images/top-profile-icon.webp';
  public cover_picture: any = '/assets/images/header-bg.webp';  
  public _changePwd: FormGroup;
  public pwd_mismatch: boolean = false;


  constructor(public router: Router,
    public route: ActivatedRoute,
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    public formBuilder: FormBuilder,
    private el: ElementRef,    
    public sharedService: SharedService,
    private toastr: ToastrService) {    
    this._changePwd = this.formBuilder.group({
      old_password: ['', Validators.compose([Validators.required])],
      new_password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      confirm_password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    })
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.isLoading = true;
    this.token_object = this.jwtHelper.decodeToken(this._userService.getToken());
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit('page_identification', page_param);
    this.isMainLoading = false;
    this.isLoading = false;
  }


  changePassword(elementValues: any, formDirective: FormGroupDirective) {
    this.pwd_mismatch = false;
    if (this._changePwd.invalid) {
      this.pwd_mismatch = true;
      return false;
    }

    if (elementValues.value.new_password != elementValues.value.confirm_password) {
      this.pwd_mismatch = true;
    }

    if (!this.pwd_mismatch) {
      var apiUrl = this._globalService.apiHost + '/ChangePassword';
      this._http.post(apiUrl,
        {
          "old_password": elementValues.value.old_password,
          "password": elementValues.value.new_password
        },
        { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.toastr.success(res['msg']);
            formDirective.resetForm();
          }
          if (res['status'] == 'error' && res['error']) {
            this.toastr.error(res['error']);
          }
        });
    }
  }  
}