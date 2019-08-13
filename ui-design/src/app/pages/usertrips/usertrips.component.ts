import { Component, OnInit, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import async from 'async';
import * as moment from 'moment/min/moment.min.js';
import { SharedService } from 'src/app/model/shared.service';

@Component({
  selector: 'app-usertrips',
  templateUrl: './usertrips.component.html',
  styleUrls: ['./usertrips.component.css']
})
export class UsertripsComponent implements OnInit {
  public jwtHelper: JwtHelperService = new JwtHelperService();
  // public config: any;
  public page = 1;

  public fav_trip_id: any = '';
  public fav_user_id: any = '';
  public token_object: any = '';
  public userTripsData: any = [];
  public userData: any = [];
  public user_data: any = '';
  public cover_picture: any = '/assets/images/header-bg.webp';

  constructor(
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    public router: Router,
    private _sharedService: SharedService ) {}

  ngOnInit() {
    window.scroll(0,0);
    this.token_object = this.jwtHelper.decodeToken(localStorage.getItem('frontend-token'));
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit('page_identification', page_param);
    // let person = this.sharedService.gotoPersonDetailsPage;
    // if(person){
    //   this.fav_trip_id = person.trip_id;
    //   this.fav_user_id = person.user_id;
    // }else{
    let persondata = JSON.parse(localStorage.getItem('persondetails'));  
    this.fav_trip_id = persondata.trip_id;
    this.fav_user_id = persondata.user_id;
    // }

    this.getUserDetailsByTrips();
    this.getUserProfileData();
  }

  public getUserProfileData(){
    var api_url = this._globalService.apiHost + '/GetUserProfileData';

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
    .subscribe(res => {
      if(res['status'] == 'ok'){
        var user_data = res['data'];
        this.user_data = user_data;
        if (user_data.cover_picture != null) {
          this.cover_picture = this._globalService.imageURL + '/static/cover_photos/' + user_data.cover_picture;
        }
      }
    });
  }

  getUserDetailsByTrips() {
    if (this.fav_user_id) {
      let api_url = this._globalService.apiHost + '/GetUserDetailsByTrips?user_id=' + this.fav_user_id;

      this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            var list = res['trips'];
            var root = this;
            let tripLists = [];

            let services = list.Profile.purpose_of_trip;
            if(services.charAt(0) == ',') {
              services = list.Profile.purpose_of_trip.slice(1);
            }

            let trips = {
              user_id: list.id,
              username: list.Profile.first_name,
              home_town: list.Profile.home_town,
              age: (list.Profile.dob != null ? moment().diff(new Date(list.Profile.dob), 'years') : '0'),
              gender: list.Profile.gender,
              languages: list.Profile.languages,
              services: services,
              interest: list.Profile.interest,
              about_me: list.Profile.about_me,
              country : list.Profile.country,
            }

            async.forEach(list.Trips, function (list) {

              let start_month = moment(list.from_date).format('MMMM');
              let start_date = moment(list.from_date).format('DD');

              let end_month = moment(list.to_date).format('MMMM');
              let end_date = moment(list.to_date).format('DD');

              let start_suffixval = root._globalService.ordinal_suffix_of(parseInt(start_date));
              let end_suffixval = root._globalService.ordinal_suffix_of(parseInt(end_date));

              tripLists.push({
                trip_id: list.id,
                trip_name: list.trip_name,
                departure: list.departure,
                destination: list.destination,
                description: list.description,
                start_month: start_month,
                start_date: start_date,
                end_month: end_month,
                end_date: end_date,
                start_suffixval: start_suffixval,
                end_suffixval: end_suffixval,
                type:list.type,
                user_id: list.user_id
              })
            });

            this.userData = trips;
            this.userTripsData = tripLists;

            // this.config = {
            //   itemsPerPage: 5,
            //   currentPage: 1,
            //   totalItems: this.userTripsData.length
            // };

          }
        })

    } else {
      console.log("there is no data");
    }
  }

  gotoTripDetails(trip) {
    let search_param_data = {
      mode: '',
      departure: "",
      destination: "",
      isAnywhere: false,      
      planned: false,
      selectedDuration: "0",
      type: "",
      language: "",
      confirmed_types: false,
      id_verified: false,
      social_verified: false,
      any_time: true,
      anyTime:true
    };
    let tripSearchData = {
      trip_id: trip.trip_id, user_id: trip.user_id,
      search_param_data: search_param_data,
    }
    localStorage.setItem('trip_search_data', JSON.stringify({ trip_id: trip.trip_id, user_id: trip.user_id,
      search_param_data: search_param_data,  }));
    this._sharedService.tripSearchData = tripSearchData;

    this.router.navigate(['/tripdetails']);
  }
    
  public onPageChanged(event) {
    this.page = event;
  }
}
