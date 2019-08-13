import { Component, OnInit, ElementRef, ViewChild,Pipe,PipeTransform, ViewChildren, Renderer2, ChangeDetectionStrategy, EventEmitter, QueryList } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, FormGroupDirective } from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SharedService } from 'src/app/model/shared.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import { PagesComponent } from '../../pages.component';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  @ViewChild('langInput') langInput: ElementRef;
  @ViewChild('content') content: ElementRef;
  @ViewChildren('messageContainer') msgContainer: QueryList<any>;
  title = 'app';

  public isLoading: boolean = true;
  public isDualLoading: boolean = false;
  public isMainLoading: boolean = true;
  
  public jwtHelper: JwtHelperService = new JwtHelperService();
  public userLists: any = [];
  public countries: any = [];
  public states: any = [];
  public cities: any = [];

  public profile: boolean = false;
  public settings: boolean = true;
  public wallet: boolean = false;
  public messages: boolean = false;
  public change_pwd: boolean = false;

  public query = '';
  public selectedProfileId: any = '';
  public token_object: any = '';

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  public header_first_name: any = '';
  public header_last_name: any = '';
  public header_country: any = '';

  public profile_picture: any = '/assets/images/top-profile-icon.webp';
  public cover_picture: any = '/assets/images/header-bg.webp';
  

  public settingsData: any = [];
  public settings_form: FormGroup;
  public _changePwd: FormGroup;
  public pwd_mismatch: boolean = false; 

  public profile_to_everyone: boolean = false;
  public profile_only_connected: boolean = false;
  public donot_show_profile_picture: boolean = false;
  public on_new_request: boolean = false;
  public on_new_messages: boolean = true;
  public on_new_comments: boolean = true;

  public profile_settings = [
    {
      id: 1,
      name: 'To Everyone',
      value: 'to_everyone',
    },
    {
      id: 2,
      name: 'Only To Connections',
      value: 'only_to_connections',
    },
    {
      id: 3,
      name: 'Do not Show Profile Picture',
      value: 'profile_image_show',
    }
  ]
    public MatiURL: string = "";


  constructor(public router: Router,
    public route: ActivatedRoute,
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    public formBuilder: FormBuilder,
    private el: ElementRef,    
    public sharedService: SharedService,
    public pagesComponent: PagesComponent,
    private toastr: ToastrService) {
    this.settings_form = this.formBuilder.group({
      'profile_to_everyone': [false, Validators.compose([Validators.required])],
      'profile_only_connected': [false, Validators.compose([Validators.required])],
      'donot_show_profile_picture': [false],
      'on_new_request': [false],
      'on_new_messages': [false, Validators.compose([Validators.required])],
      'on_new_comments': [false, Validators.compose([Validators.required])],
    });
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.isLoading = true;
    this.token_object = this.jwtHelper.decodeToken(this._userService.getToken());
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit('page_identification', page_param);

    var api_url = this._globalService.apiHost + '/GetAllUsers';

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.userLists = res['users'];
        }
      }); 
      this.getUserSettings();  
   
    this.isMainLoading = false;
    this.isLoading = false;
  }


  ngAfterViewInit() {
    this.scrollToBottom(); // For messsages already present
    this.msgContainer.changes.subscribe((list: QueryList<ElementRef>) => {
      this.scrollToBottom(); // For messages added later
    });
  }

  scrollToBottom = () => {
    try {
      this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
    } catch (err) { }
  }

  // Settings  

  getUserSettings() {
    this.isLoading = true;
    let api_url = this._globalService.apiHost + '/GetUserSettingsData';
    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.isLoading = false;
          this.settingsData = res['settings'];
          this.profile_to_everyone = this.settingsData.to_everyone
          this.profile_only_connected = this.settingsData.only_to_connections
          this.donot_show_profile_picture = this.settingsData.profile_image_show
          if (this.profile_to_everyone) {
            this.selectedProfileId = 1;
          } else if (this.profile_only_connected) {
            this.selectedProfileId = 2;
          } else {
            this.selectedProfileId = 3;
          }
          this.on_new_request = this.settingsData.on_new_requests
          this.on_new_messages = this.settingsData.on_new_messages
          this.on_new_comments = this.settingsData.on_new_comments
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      })
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

  public updateSettings(event, list) {



    if (list) {
      this.profile_to_everyone = false;
      this.profile_only_connected = false;
      this.donot_show_profile_picture = false;
      if (event.checked) {
        this.selectedProfileId = list.id;
        if (list.id == 1) {
          this.profile_to_everyone = true;
        } else if (list.id == 2) {
          this.profile_only_connected = true;
        } else if (list.id == 3) {
          this.donot_show_profile_picture = true;
        }

        this.isLoading = true;
        let userData = {
          profile_to_everyone: this.profile_to_everyone,
          profile_only_connected: this.profile_only_connected,
          donot_show_profile_picture: this.donot_show_profile_picture,
          on_new_request: this.on_new_request,
          on_new_messages: this.on_new_messages,
          on_new_comments: this.on_new_comments,
        }
        console.log("Settings", userData);
        var api_url = this._globalService.apiHost + '/UpdateUserSettingsData';

        this._http.post(api_url, userData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
          .subscribe(res => {
            if (res['status'] == 'ok') {
              this.isLoading = false;
              this.pagesComponent.getNotificationLists();
              this.pagesComponent.getMessageNotificationLists();
              this.toastr.success(res['msg']);
            } else {
              this.isLoading = false;
            }
          });
      } else {
        this.selectedProfileId = list.id;
        if (list.id == 1) {
          this.profile_to_everyone = true;
        } else if (list.id == 2) {
          this.profile_only_connected = true;
        } else if (list.id == 3) {
          this.donot_show_profile_picture = true;
        }
        this.getUserSettings();
        this.toastr.error('Please choose any other for profile changes');
      }
    } else {
      this.isLoading = true;
      let userData = {
        profile_to_everyone: this.profile_to_everyone,
        profile_only_connected: this.profile_only_connected,
        donot_show_profile_picture: this.donot_show_profile_picture,
        on_new_request: this.on_new_request,
        on_new_messages: this.on_new_messages,
        on_new_comments: this.on_new_comments,
      }
      console.log("Settings", userData);
      var api_url = this._globalService.apiHost + '/UpdateUserSettingsData';

      this._http.post(api_url, userData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.isLoading = false;
            this.pagesComponent.getNotificationLists();
            this.pagesComponent.getMessageNotificationLists();
            this.toastr.success(res['msg']);
          } else {
            this.isLoading = false;
          }
        });
    }
  }

  

}