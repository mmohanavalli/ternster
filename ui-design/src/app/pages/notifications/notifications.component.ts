import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import async from 'async';
import * as moment from 'moment/min/moment.min.js';
import { Router } from '@angular/router';
import { PagesComponent } from '../pages.component';
import { SharedService } from 'src/app/model/shared.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  public profile_picture: any = '/assets/images/top-profile-icon.webp';
  public token_object: any = '';
  public jwtHelper: JwtHelperService = new JwtHelperService();

  public notification_limit: any = 5;  
  public read_messages: any = [];
  public unread_messages: any = [];
  public Notificationshow: boolean = true;

  public settingsData: any = [];  

  constructor(
    public router: Router,
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    public pagesComponent: PagesComponent,
    public _sharedService : SharedService) { }

  ngOnInit() {
    this.token_object = this.jwtHelper.decodeToken(this._userService.getToken());
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit('page_identification', page_param);
    this.getNotificationLists();
  }


  public getNotificationLists() {
    if (this.token_object != null) {
      let api_url = this._globalService.apiHost + '/GetUserSettingsData';
      this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          var root = this;
          root.settingsData = res['settings'];

          if (root.settingsData.on_new_requests) {
            var api_notify_url = this._globalService.apiHost + '/GetNotificationLists';

            this._http.get(api_notify_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
            .subscribe(res => {
              if (res['status'] == 'ok') {
                let reqData = res['reqdata']
                console.log("res['reqdata']", res['reqdata']);
              
                async.forEach(reqData, function (list) {
                  var profile_image = "/assets/images/profile.webp";
                  if (list.User.Profile.profile_picture != null) {
                    if (list.User.Setting.to_everyone) {
                      profile_image = root._globalService.imageURL + '/static/profile_images/' + list.User.Profile.profile_picture;
                    } else if (list.User.Setting.only_to_connections) {
                      // if (list.request_status == 'accepted' || list.request_status == 'paid') {
                      if(list.can_show_profile) {
                        profile_image = root._globalService.imageURL + '/static/profile_images/' + list.User.Profile.profile_picture;
                      }
                    } else if (!list.User.Setting.profile_image_show) {
                      profile_image = root._globalService.imageURL + '/static/profile_images/' + list.User.Profile.profile_picture;
                    }  
                  }

                  if (list.view_status == 'unread') {
                    root.unread_messages.push({
                      user_name: list.User.name,
                      user_id: list.User.id,
                      id: list.id,
                      trip_id: list.trip_id,
                      trip_name: list.Trip.trip_name,
                      from_user_id: list.from_user_id,
                      to_user_id: list.to_user_id,
                      time: moment(new Date(list.created_at)).fromNow(),
                      request_status: list.request_status,
                      view_status: list.view_status,
                      profile: profile_image,
                      type: list.request_type,
                      departure: list.Trip.departure,
                      destination: list.Trip.destination,
                      weight : list.request_courier_weight,
                      weight_unit:list.Trip.weight_unit,
                      members:list.request_members,
                      is_comments: list.is_comment,
                      is_reply_comment: list.is_reply_comment,
                      is_liked_comment: list.is_liked_comment,
                      is_from_cancelled_trip: list.is_from_cancelled_trip,
                      can_show_msg:list.can_show_msg
                    })
                  }
                  else if (list.view_status == 'read') {
                    root.read_messages.push({
                      user_name: list.User.name,
                      user_id: list.User.id,
                      id: list.id,
                      trip_id: list.trip_id,
                      trip_name: list.Trip.trip_name,
                      from_user_id: list.from_user_id,
                      to_user_id: list.to_user_id,
                      time: moment(new Date(list.created_at)).fromNow(),
                      request_status: list.request_status,
                      view_status: list.view_status,
                      profile: profile_image,
                      type: list.request_type,
                      departure: list.Trip.departure,
                      destination: list.Trip.destination,
                      weight : list.request_courier_weight,
                      weight_unit:list.Trip.weight_unit,
                      members:list.request_members,
                      is_comments: list.is_comment,
                      is_reply_comment: list.is_reply_comment,
                      is_liked_comment: list.is_liked_comment,
                      is_from_cancelled_trip: list.is_from_cancelled_trip,
                      can_show_msg:list.can_show_msg
                    })
                  }
                
                });
                if(root.read_messages.length == 0 && root.unread_messages.length == 0){
                  root.Notificationshow = false;
                }
                else{
                  root. Notificationshow = true;
                }
               
              }
            });
          }
        }
      });
    }
  }

  public openNotification(notification_id) {
      var api_url = this._globalService.apiHost + '/UpdateNotification';
      var param_data = {
        id: notification_id,
        view_status: 'read',
      }

      this._http.post(api_url, param_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {  
          this.pagesComponent.getNotificationLists();      
        }
      });
    
  }

  gotoTripDetails(list, viewStatus) {
    if(viewStatus == 'unread'){
      this.openNotification(list.id);
    }    
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
      trip_id: list.trip_id,
      notification_id: list.id,  
      location: 'notification', 
      search_param_data: search_param_data,  }
    // if(this.router.url == '/tripdetails') {
    //   window.location.reload();
    // }
    localStorage.setItem('trip_search_data',JSON.stringify(tripSearchData));
    this._sharedService.tripSearchData = tripSearchData;
    this.router.navigate(['/tripdetails']);
  }

  gotoPersonDetails(list) {
    let personData = { trip_id: list.trip_id, user_id: list.user_id, type: list.type };
    // if(this.router.url == '/persondetails') {
    //   window.location.reload();
    // }
    localStorage.setItem('persondetails', JSON.stringify(personData));
    this.router.navigate(['/persondetails']);

    // let tripSearchData = { notification_id: list.id,  location: 'notification' }
    // localStorage.setItem('trip_search_data',JSON.stringify(tripSearchData));
    // this._router.navigate(['/tripdetails']);

  }
}
