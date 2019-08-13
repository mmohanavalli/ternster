import { Component, OnInit, ElementRef, Inject, ViewChild, Pipe, PipeTransform, ViewChildren, Renderer2, ChangeDetectionStrategy, EventEmitter, QueryList } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent, MatAutocompleteSelectedEvent, MatDialog } from '@angular/material';
import async from 'async';
import * as moment from 'moment/min/moment.min.js';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SharedService } from 'src/app/model/shared.service';
declare var $: any;
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
// import csc from 'country-state-city'
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import { PagesComponent } from '../../pages.component';
import { CropImageDialog } from 'src/app/dialogs/profile/cropimageDialog';
import { CropCoverImageDialog } from 'src/app/dialogs/profile/cropCoverImageDialog';
import { of } from 'rxjs';
import { MatiDialog } from 'src/app/dialogs/profile/matidialog/matidialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild('langInput') langInput: ElementRef;
  @ViewChild('content') content: ElementRef;
  @ViewChildren('messageContainer') msgContainer: QueryList<any>;
  title = 'app';

  public isLoading: boolean = true;
  public isDualLoading: boolean = false;
  public isMainLoading: boolean = true;
  public profile: boolean = true;
  public settings: boolean = false;
  public wallet: boolean = false;
  public messages: boolean = false;
  public change_pwd: boolean = false;
  public purposeLists: any = ['Courier', 'Assistant'];

  // public purposeLists: any = ['Courier', 'Assistant', 'Companion'];
  public jwtHelper: JwtHelperService = new JwtHelperService();
  public userLists: any = [];
  public countries: any = [];
  public states: any = [];
  public cities: any = [];

  public ftsearch: boolean = false;
  public query = '';

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  public languages: any = [];
  public langMyControl = new FormControl();
  public selectedLanguages: string[] = [];
  public langFilteredOptions: Observable<string[]>;

  public header_first_name: any = '';
  public header_last_name: any = '';
  public header_country: any = '';

  public profile_picture: any = '/assets/images/top-profile-icon.webp';
  public cover_picture: any = '/assets/images/header-bg.webp';
  public first_name: any = '';
  public last_name: any = '';
  public dob: any = '';
  public gender: any = '';
  public country: any = '';
  public state: any = '';
  public town: any = '';
  public email: any = '';
  public mobile: any = '';
  public kyc: any = '';
  public kycstatus: any = '';
  public interest: any = '';
  public purposeOfTrips: any = [];
  public aboutMe: any = '';
  public facebookLink: any = '';
  public twitterLink: any = '';
  public instagramLink: any = '';
  public age = "";
  // public account_no: any = '';
  // public retype_account_no: any = '';
  // public ifsc_code: any = '';
  // public account_holder_name: any = '';
  // public bank_name: any = '';
  // public bank_address: any = '';  
  public token_object: any = '';

  public maxDate: any = new Date(new Date().setFullYear(new Date().getFullYear() - 18));
  public coun_filter: any = '';
  public state_filter: any = '';
  public city_filter: any = '';
  public is_kyc_verified: boolean = false;
  myCountryControl: FormControl = new FormControl();
  myStateControl: FormControl = new FormControl();
  myCityControl: FormControl = new FormControl();
  filteredOptions: Observable<string[]>;
  statefilteredOptions: Observable<string[]>;
  cityfilteredOptions: Observable<string[]>;
  public selectedTripChat: any = ''

  public MatiURL: string = "";

  public facebook: boolean = false;
  public instagram: boolean = false;
  public twitter: boolean = false;


  constructor(public router: Router,
    public route: ActivatedRoute,
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    public formBuilder: FormBuilder,
    private el: ElementRef,
    public sharedService: SharedService,
    public pagesComponent: PagesComponent,
    public dialog: MatDialog,
    private toastr: ToastrService) {

    // this._http.get(this._globalService.apiHost+'/countries')    
    // .subscribe(response => {

    //    this.countries = response['response'];
    //    this.filteredOptions = response['response'];
    // }); 
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.isLoading = true;

    // this._http.get(this._globalService.apiHost+'/countries').subscribe(response =>{
    //   this.countries = response['response'];
    //   this.filteredOptions = new Observable(observer =>{
    //      observer.next(response['response'].map(x=>x.name))
    //   })       
    // })
    this._http.get(this._globalService.apiHost + '/countries')
      .subscribe(response => {
        this.countries = response['response'];
      });
    this.token_object = this.jwtHelper.decodeToken(this._userService.getToken());
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit('page_identification', page_param);
    var list_lang = this._globalService.languages;
    var root = this;
    async.forEach(list_lang, function (list) {
      root.languages.push(list.name);
    });
    this.langFilteredOptions = this.langMyControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    // if(this.countries.length > 1){
    this.filteredOptions = this.myCountryControl.valueChanges.pipe(
      startWith(''),
      map(value => {

        return this._countryFilter(value)
      })
    );
    // }

    var api_url = this._globalService.apiHost + '/GetAllUsers';

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.userLists = res['users'];
        }
      });

    this.getUserProfileData();
    this.isMainLoading = false;
    this.isLoading = false;
  }


  ngAfterViewInit() {
    this.scrollToBottom(); // For messsages already present
    this.msgContainer.changes.subscribe((list: QueryList<ElementRef>) => {
      this.scrollToBottom(); // For messages added later
    });
  }

  private _countryFilter(value: string): string[] {

    if (value) {
      const filterValue = value.toLowerCase();
      return this.countries.map(x => x.name).filter(option =>
        option.toLowerCase().includes(filterValue));
    }
  }

  private _stateFilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.states.map(x => x.name).filter(option =>
      option.toLowerCase().includes(filterValue));
  }

  private _cityFilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.cities.map(x => x.name).filter(option =>
      option.toLowerCase().includes(filterValue));
  }

  selectedOption(event: MatAutocompleteSelectedEvent) {
    this.country = event;
    this.coun_filter = this.countries.find(coun => coun.name === event);
    this.myStateControl.reset();
    this.myCityControl.reset();

    // this.states = csc.getStatesOfCountry(this.coun_filter.id);
    this._http.get(this._globalService.apiHost + '/state_of_countries/' + this.coun_filter.id)
      .subscribe(response => {
        this.states = response['response'];
      });
    this.statefilteredOptions = this.myStateControl.valueChanges.pipe(
      startWith(''),
      map(value => this._stateFilter(value))
    );
  }
  selectedStateOption(event: MatAutocompleteSelectedEvent) {

    this.state = event;
    this.state_filter = this.states.find(state => state.name === event);
    this.myCityControl.reset();

    // this.cities = csc.getCitiesOfState(this.state_filter.id)
    this._http.get(this._globalService.apiHost + '/cities_of_state/' + this.state_filter.id)
      .subscribe(response => {
        this.cities = response['response'];
      });
    this.cityfilteredOptions = this.myCityControl.valueChanges.pipe(
      startWith(''),
      map(value => this._cityFilter(value))
    );
  }
  selectedCityOption(event: MatAutocompleteSelectedEvent) {
    this.town = event;
    this.city_filter = this.cities.find(town => town.name === event);

  }

  scrollToBottom = () => {
    try {
      this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
    } catch (err) { }
  }

  public getUserProfileData() {
    this.isLoading = true;
    var api_url = this._globalService.apiHost + '/GetUserProfileData';

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          var res_data = res['data'];

          var social_links = res['data'];
          if (social_links.facebook_id != null && social_links.facebook_id != '') {
            this.facebook = true;
          }
          if (social_links.instagram_id != null && social_links.instagram_id != '') {
            this.instagram = true;
          }
          if (social_links.twitter_id != null && social_links.twitter_id != '') {
            this.twitter = true;
          }

          this.isLoading = false;
          if (res_data.profile_picture != null) {
            this.profile_picture = this._globalService.imageURL + '/static/profile_images/' + res_data.profile_picture;
          }

          if (res_data.cover_picture != null) {
            this.cover_picture = this._globalService.imageURL + '/static/cover_photos/' + res_data.cover_picture;
          }
          let dateofbirth = moment(res_data.dob).format('YYYY-MM-DD HH:mm:ss');

          this.header_first_name = res_data.first_name;
          this.header_last_name = res_data.last_name;
          this.header_country = res_data.country;

          this.first_name = res_data.first_name;
          this.last_name = res_data.last_name;
          this.dob = dateofbirth != null ? new Date(dateofbirth) : '';
          this.gender = res_data.gender;
          this.country = res_data.country;
          this.myCountryControl.setValue(res_data.country);
          this.state = res_data.state;
          this.myStateControl.setValue(res_data.state);
          this.town = res_data.home_town;
          this.myCityControl.setValue(res_data.home_town);
          this.email = res_data.email;
          this.MatiURL = 'https://signup.getmati.com/?merchantToken=5cf4eae09e4e8a001c61c128&metadata={"email":"' + res_data.email + '"}'
          this.mobile = res_data.contact;
          this.kyc = res_data.kyc_link;
          this.kycstatus = res_data.kyc_status;
          this.interest = res_data.interest;
          this.is_kyc_verified = res_data.User.is_kyc_verified;
          this.purposeOfTrips = res_data.purpose_of_trip ? res_data.purpose_of_trip.split(',') : ['courier'];
          this.aboutMe = res_data.about_me;
          this.facebookLink = res_data.facebook_id;
          this.twitterLink = res_data.twitter_id;
          this.instagramLink = res_data.instagram_id;
          this.selectedLanguages = res_data.languages ? res_data.languages.split(',') : [];
          this.age = (res_data.dob != null ? moment().diff(new Date(res_data.dob), 'years') + ' years old' : '');
        } else {
          this.isLoading = false;
        }
      });
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our language
    if (value != '') {
      if (this.selectedLanguages.indexOf(value) < 0 && this.languages.indexOf(value) >= 0 && (value || '').trim()) {
        this.selectedLanguages.push(value.trim());
      }
      else {
        this.toastr.error('The language is already exists');
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.langMyControl.setValue(null);
  }

  remove(lang: string): void {
    const index = this.selectedLanguages.indexOf(lang);

    if (index >= 0) {
      this.selectedLanguages.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent) {

    if (this.selectedLanguages.indexOf(event.option.viewValue) < 0 && this.languages.indexOf(event.option.viewValue) >= 0) {
      this.selectedLanguages.push(event.option.viewValue);
    }
    else {
      this.toastr.error('The language is already exists');

    }

    this.langInput.nativeElement.value = '';
    this.langMyControl.setValue(null);
  }

  public _filter(value: string): string[] {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.languages.filter(lang => lang.toLowerCase().indexOf(filterValue) === 0);
    }
  }

  public changeDOB() {
    this.age = moment().diff(new Date(this.dob), 'years') + ' years old';
  }

  OnChange(event) {
    if (event.checked) {
      this.purposeOfTrips.push(event.source.value.toLowerCase());
    }
    else {
      var index = (this.purposeOfTrips).findIndex(x =>
        x == event.source.value
      );

      this.purposeOfTrips.splice(index, 1);
    }
  }

  public updateProfile() {
    this.isDualLoading = true;
    let dob = moment(this.dob).format('YYYY-MM-DD HH:mm:ss');
    if (dob == "Invalid date") {
      dob = '';
    }
    var post_data = {
      first_name: this.first_name,
      last_name: this.last_name,
      dob: dob,
      gender: this.gender,
      country: this.country,
      state: this.state,
      town: this.town,
      email: this.email,
      mobile: this.mobile,
      kyc: this.kyc,
      language: this.selectedLanguages.toString(),
      interest: this.interest,
      purposeOfTrip: this.purposeOfTrips.toString(),
      aboutMe: this.aboutMe,
      facebookLink: this.facebookLink,
      twitterLink: this.twitterLink,
      instagramLink: this.instagramLink,
      // account_no: this.account_no,
      // ifsc_code: this.ifsc_code,
      // account_holder_name: this.account_holder_name,
      // bank_name: this.bank_name,
      // bank_address: this.bank_address,
    }

    console.log("post_data", post_data);

    var api_url = this._globalService.apiHost + '/UpdateUserProfileData';

    this._http.post(api_url, post_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.isDualLoading = false;
          this.getUserProfileData();
          this.toastr.success("Profile Updated Successfuly");
        }
      });


  }

  public onValueChange(evt) {
    this.dob = evt.value;
  }

  public cropImage() {
    const dialogRef = this.dialog.open(CropImageDialog, {
      width: '800px',
      disableClose: true,
      data: 'profileImage'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        let formData = new FormData();
        formData.append('photo', result);
        var apiUrl = this._globalService.apiHost + '/DocumentUpload';
        this._http.post(apiUrl, formData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
          .subscribe(res => {
            if (res['status'] == 'ok') {
              this.isLoading = false;
              this.profile_picture = this._globalService.imageURL + '/static/profile_images/' + res['filename'];
              let old_profile_picture = res["oldProfilePicture"];

              var apiUrl = this._globalService.apiHost + '/ChangeLogo';
              this._http.post(apiUrl, { "logo": res['filename'], "oldProfilePicture": old_profile_picture }, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
                .subscribe(res => {
                  if (res['status'] == 'ok') {
                    this.pagesComponent.getUserProfileData();
                    this.toastr.success('Profile picture changed successfully.');
                  }
                });
            } else {
              this.isLoading = false;
            }
          });
      }
    });
  }



  public cropCoverImage() {
    const dialogRef = this.dialog.open(CropCoverImageDialog, {
      width: '800px',
      disableClose: true,
      data: 'coverImage'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let formData = new FormData();
        formData.append('coverphoto', result);
        var apiUrl = this._globalService.apiHost + '/CoverPictureUpload';
        this._http.post(apiUrl, formData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
          .subscribe(res => {
            if (res['status'] == 'ok') {
              this.isLoading = false;
              this.cover_picture = this._globalService.imageURL + '/static/cover_photos/' + res['filename'];
              var apiUrl = this._globalService.apiHost + '/UpdateCoverPhoto';
              this._http.post(apiUrl, { "picture": res['filename'], "oldCoverPicture": res['oldCoverPicture'] }, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
                .subscribe(res => {
                  if (res['status'] == 'ok') {

                    // this.router.navigateByUrl('/dashboard', { skipLocationChange: true }).then(() =>
                    //   this.router.navigate(["/profile"], {
                    //     queryParams: { type: 'profile' },
                    //     skipLocationChange: true
                    //   })
                    // );
                    this.getUserProfileData();
                    this.toastr.success('Cover photo changed successfully.');
                  }
                });
            } else {
              this.isLoading = false;
            }
          });

      }
    });
  }
  OpenDialog() {
    const dialogRef = this.dialog.open(MatiDialog, {
      width: '1000',
      height: '650',
      disableClose: true,
      data: {
        url: this.MatiURL,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getUserProfileData();
      }
    });


  }
}



