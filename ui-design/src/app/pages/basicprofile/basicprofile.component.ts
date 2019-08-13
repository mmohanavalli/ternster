import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import async from 'async';
import * as moment from 'moment/min/moment.min.js';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SharedService } from 'src/app/model/shared.service';
declare var $: any;

@Component({
  selector: 'app-basicprofile',
  templateUrl: './basicprofile.component.html',
  styleUrls: ['./basicprofile.component.css']
})
export class BasicprofileComponent implements OnInit {

  order: string = 'count';
  reverse: boolean = true;

  public setting_user = 'Registered';

  public userData: any = [];
  public user_data: any = '';
  public cover_picture: any = '/assets/images/header-bg.webp';
  public jwtHelper: JwtHelperService = new JwtHelperService();
  public requestStatus = 'Send Request';
  public fav_user_id: any = '';
  public ratings: any = 0;
  public reduced_ratings: any = 0;

  public facebook: boolean = false;
  public instagram: boolean = false;
  public twitter: boolean = false;
  public is_kyc_verified: boolean = false;

  public token_object: any = '';

  constructor(
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    public router: Router,
    public _sharedService: SharedService) { }

  ngOnInit() {
    this.token_object = this.jwtHelper.decodeToken(this._userService.getToken());
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit('page_identification', page_param);
    window.scroll(0, 0);
    let persondata = JSON.parse(localStorage.getItem('persondetails'));  
    // this._sharedService.gotoPersonDetailsPage.subscribe(persondata => {
    //   if (persondata) {
        this.fav_user_id = persondata.user_id;
        this.requestStatus = persondata.request_status
    //   }
    // });
    this.getUserDetailsById();
    this.getRatings();
  }

  getUserDetailsById() {
    if (this.fav_user_id) {
      let api_url = this._globalService.apiHost + '/GetUserById?user_id=' + this.fav_user_id;

      this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            var list = res['user'];
            console.log("list for basic profile", list);

            this.reduced_ratings = list.reduced_ratings;

            let services = list.Profile.purpose_of_trip;
            if (services && services.charAt(0) == ',') {
              services = list.Profile.purpose_of_trip.slice(1);
            }

            var social_links = res['user'].Profile
            if (social_links.facebook_id != null && social_links.facebook_id != '') {
              this.facebook = true;
            }
            if (social_links.instagram_id != null && social_links.instagram_id != '') {
              this.instagram = true;
            }
            if (social_links.twitter_id != null && social_links.twitter_id != '') {
              this.twitter = true;
            }

            let profile_image = "/assets/images/profile.webp";
            if (list.Profile.profile_picture != null) {
              if (list.Setting.to_everyone) {
                profile_image = this._globalService.imageURL + '/static/profile_images/' + list.Profile.profile_picture;
              } else if (list.Setting.only_to_connections) {
                // if (list.request_status == 'accepted' || list.request_status == 'paid') {
                if (this.requestStatus == 'accepted' || this.requestStatus == 'paid') {
                  profile_image = this._globalService.imageURL + '/static/profile_images/' + list.Profile.profile_picture;
                }
              } else if (!list.Setting.profile_image_show) {
                profile_image = this._globalService.imageURL + '/static/profile_images/' + list.Profile.profile_picture;
              }
            }

            this.cover_picture = this._globalService.imageURL + '/static/cover_photos/' + list.Profile.cover_picture;



            let trips = {
              user_id: list.id,
              username: list.Profile.first_name,
              first_name: list.Profile.first_name,
              last_name: list.Profile.last_name,
              home_town: list.Profile.home_town,
              age: (list.Profile.dob != null ? moment().diff(new Date(list.Profile.dob), 'years') : '0'),
              gender: list.Profile.gender,
              languages: list.Profile.languages,
              services: services,
              interest: list.Profile.interest,
              about_me: list.Profile.about_me,
              country: list.Profile.country,
              iskycVerified: list.is_kyc_verified,
              isSocialVerified: list.is_social_verified,
              profile: profile_image
            }
            this.userData = trips;
            if (this.userData.iskycVerified == 1)
              this.is_kyc_verified = true;
            else
              this.is_kyc_verified = false;
          }
        })
    } else {
      console.log("there is no data");
    }
  }

  getRatings() {
    if (this.fav_user_id) {
      let api_url = this._globalService.apiHost + '/getRatings?user_id=' + this.fav_user_id;

      this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            console.log("res", res);
            var root = this;
            var star1 = res['star1'].length;
            var star2 = res['star2'].length;
            var star3 = res['star3'].length;
            var star4 = res['star4'].length;
            var star5 = res['star5'].length;
            var overall_rating = (1 * star1) + (2 * star2) + (3 * star3) + (4 * star4) + (5 * star5);
            var total_rating = star1 + star2 + star3 + star4 + star5;
            var rating_count = 0;
            root.ratings = overall_rating / total_rating;
            root.ratings = root.ratings - root.reduced_ratings;
            if (root.ratings > 0) {
              root.ratings = parseFloat(root.ratings).toFixed(1);
            }
            else {
              root.ratings = 0;
            }
          }
        });
    }
  }
}