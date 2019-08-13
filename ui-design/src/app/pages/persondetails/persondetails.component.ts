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
import { ToastrService } from 'ngx-toastr';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
declare var $: any;

@Component({
  selector: 'app-persondetails',
  templateUrl: './persondetails.component.html',
  styleUrls: ['./persondetails.component.css']
})
export class PersondetailsComponent implements OnInit {

  order: string = 'count';
  reverse: boolean = true;

  public show_dialog: boolean = false;
  public show_dialog1: boolean = false;
  selectedEmoji: any;
  selectedReplyEmoji: any;
  public emoji: any = [];
  public openPopup: Function;
  public comment_msg: any = '';
  public reply_comment_msg: any = '';

  public setting_user = 'Registered';

  public userTripsData: any = [];
  public userData: any = [];
  public user_data: any = '';
  public cover_picture: any = '/assets/images/header-bg.webp';
  public jwtHelper: JwtHelperService = new JwtHelperService();
  public requestStatus = 'Send Request';
  public fav_trip_id: any = '';
  public fav_user_id: any = '';
  public fav_type: any = '';
  public comments_lists: any = [];
  public comment_form: FormGroup;
  public reply_comment_form: FormGroup;
  public token_object: any = '';
  public user_invites: any = '';
  public isVerified = false;
  public iskycVerified = false;
  public favData: any = [];
  public showReviews = true;

  public ratings: any = 0;
  public reduced_ratings: any = 0;

  public shipment_data_lists: any = [];

  public favactive: boolean = false;
  public favdeactive: boolean = true;
  public facebook: boolean = false;
  public instagram: boolean = false;
  public twitter: boolean = false;
  public is_kyc_verified: boolean = false;
  public is_message: boolean = false;
  public userId: any = '';


  constructor(
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    private _formBuilder: FormBuilder,
    public router: Router,
    private toastr: ToastrService,
    public _sharedService: SharedService) {
    this.comment_form = this._formBuilder.group({
      // comment_msg: ['', Validators.compose([Validators.required])]
      comment_msg: '',
      selectedEmoji: ''
    });

    this.reply_comment_form = this._formBuilder.group({
      // reply_comment_msg: ['', Validators.compose([Validators.required])]
      reply_comment_msg: ''
    });
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.token_object = this.jwtHelper.decodeToken(localStorage.getItem('frontend-token'));
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit('page_identification', page_param);
    this.userId = this.token_object.id;
    let persondata = JSON.parse(localStorage.getItem('persondetails'));
    // this._sharedService.gotoPersonDetailsPage.subscribe(persondata => {
    //   if (persondata) {

        console.log("persondata", persondata);
        this.fav_trip_id = persondata.trip_id;
        this.fav_user_id = persondata.user_id;
        this.fav_type = persondata.type ? persondata.type : '';
        this.requestStatus = persondata.request_status
      // } else {
      //   this.router.navigate(['/findatrips']);
      // }
    // });

    if(this.requestStatus == 'paid' || this.requestStatus == 'delivered'){
        this.is_message = true;
    }

    this.getRatings();
    this.getFavUser(this.fav_user_id);

    if (this.userId && this.fav_user_id) {
      this.favactive = true;
      this.favdeactive = false;
    } else {
      this.favactive = false;
      this.favdeactive = true;
    }

    // let person = this.sharedService.gotoPersonDetailsPage;
    // if(person){
    //   this.fav_trip_id = person.trip_id;
    //   this.fav_user_id = person.user_id;
    //   this.fav_type = person.type;
    // } else {
    //   let persondata = JSON.parse(localStorage.getItem('persondetails'));  
    //   this.fav_trip_id = persondata.trip_id;
    //   this.fav_user_id = persondata.user_id;
    //   this.fav_type = persondata.type;
    // }

    this.token_object = this.jwtHelper.decodeToken(localStorage.getItem('frontend-token'));

    this.getLoggedInUserDetails();
    this.getUserDetailsByTripsLimit();
    this.listAllComments();
    this.getAllUserInvitesCountByTrips();

    // if (this.fav_type != '') {
    //   this.getRequestorData();
    // }

    if (this.fav_type == 'favourite') {
      this.showReviews = false;
    }
    this.getUserDetailsByTrips();
  }



  toggle() {
    this.show_dialog = !this.show_dialog;
  }

  showEmoji() {
    this.show_dialog1 = !this.show_dialog1;
  }

  addEmoji($event) {
    this.selectedEmoji = $event.emoji.native;
    this.comment_msg = this.comment_msg + '' + this.selectedEmoji;
    // console.log("comment_msg>>>>",this.comment_msg, this.selectedEmoji);
    // console.log("$this.emoji", this.emoji);
  }

  addEmoji1($event) {
    this.selectedReplyEmoji = $event.emoji.native;
    this.reply_comment_msg = this.reply_comment_msg + '' + this.selectedReplyEmoji;
  }


  getLoggedInUserDetails() {
    var token_object = this.jwtHelper.decodeToken(this._userService.getToken());
    this.isVerified = token_object.isVerified;
    this.iskycVerified = token_object.is_kyc_verified;
  }

  gotoUserTrips(user_id: number, trip_id: number) {
    localStorage.setItem('user-trip', JSON.stringify({ trip_id: trip_id, user_id: user_id }))
    // this.sharedService.gotoUserTripsPage = {trip_id:trip_id,user_id:user_id};
    this.router.navigate(['/usertrips']);
  }

  public listAllComments() {
    var api_url = this._globalService.apiHost + '/ListAllComments?tripId=' + this.fav_trip_id;

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          var lists = res['comments'];
          var root = this;
          this.comments_lists = [];

          async.forEach(lists, function (list) {

            let userImage = './assets/images/profile.webp';

            if (list.User.Profile.profile_picture) {
              userImage = root._globalService.imageURL + '/static/profile_images/' + list.User.Profile.profile_picture;
            }

            var reply_msgs = [];

            async.forEach(list.reply_datas, function (rdata) {

              let replyUserImage = './assets/images/profile.webp';

              if (list.User.Profile.profile_picture) {
                replyUserImage = root._globalService.imageURL + '/static/profile_images/' + rdata.User.Profile.profile_picture;
              }

              reply_msgs.push({
                id: rdata.id,
                trip_id: rdata.trip_id,
                user_id: rdata.user_id,
                message: rdata.message,
                user_name: rdata.User.name,
                profile: replyUserImage,
                is_liked: list.is_liked,
                time: moment(new Date(rdata.created_at)).fromNow()
              })
            })

            root.comments_lists.push({
              id: list.id,
              trip_id: list.trip_id,
              user_id: list.user_id,
              message: list.message,
              user_name: list.User.name,
              profile: userImage,
              reply_msgs: reply_msgs,
              is_liked: list.is_liked,
              time: moment(new Date(list.created_at)).fromNow()
            });
          });
        }
      });
  }  

  getUserDetailsByTrips() {
    if (this.fav_user_id) {
      let api_url = this._globalService.apiHost + '/GetUserDetailsByTrips?user_id=' + this.fav_user_id;

      this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.favData = res['trips'].Trips;
            // console.log("res", res);
            var social_links = res['trips'].Profile
            if (social_links.facebook_id != null && social_links.facebook_id != '' && this.requestStatus == 'paid') {
              this.facebook = true;
            }
            if (social_links.instagram_id != null && social_links.instagram_id != '' && this.requestStatus == 'paid') {
              this.instagram = true;
            }
            if (social_links.twitter_id != null && social_links.twitter_id != '' && this.requestStatus == 'paid') {
              this.twitter = true;
            }
          }
        });
    }
  }

  getUserDetailsByTripsLimit() {
    if (this.fav_user_id) {
      let api_url = this._globalService.apiHost + '/GetUserDetailsByTripsLimit?user_id=' + this.fav_user_id;

      this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            var list = res['trips'];
            console.log("userdata", list)

            this.reduced_ratings = list.reduced_ratings;

            var root = this;
            let tripLists = [];

            let services = list.Profile.purpose_of_trip;
            if (services && services.charAt(0) == ',') {
              services = list.Profile.purpose_of_trip.slice(1);
            }

            let profile_image = "/assets/images/profile.webp";
            if (list.Profile.profile_picture != null) {
              if (list.Setting.to_everyone) {
                profile_image = root._globalService.imageURL + '/static/profile_images/' + list.Profile.profile_picture;
              } else if (list.Setting.only_to_connections) {
                // if (list.request_status == 'accepted' || list.request_status == 'paid') {
                if (this.requestStatus == 'accepted' || this.requestStatus == 'paid') {
                  profile_image = root._globalService.imageURL + '/static/profile_images/' + list.Profile.profile_picture;
                }
              } else if (!list.Setting.profile_image_show) {
                profile_image = root._globalService.imageURL + '/static/profile_images/' + list.Profile.profile_picture;
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
              profile: profile_image,
            }

            console.log("trips for basic profile", trips);

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
                type: list.type,
                user_id: list.user_id
              })
            });

            this.userData = trips;
            this.userTripsData = tripLists;

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


  // sendFeedback(formData) {
  //   if (formData.value.comment_msg != '') {
  //     if (formData.valid) {

  //       var api_url = this._globalService.apiHost + '/PostFeedback';

  //       var comment_data = {
  //         message: formData.value.comment_msg,
  //         trip_id: this.fav_trip_id
  //       }

  //       this._http.post(api_url, comment_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
  //         .subscribe(res => {
  //           if (res['status'] == 'ok') {
  //             this.comment_form.reset();
  //             this.listAllComments();
  //           }
  //         });
  //     }
  //   }
  // }

  sendFeedback(comment_msg) {
    if (comment_msg != '') {
      // if (formData.valid) {

      var api_url = this._globalService.apiHost + '/PostFeedback';

      var comment_data = {
        message: comment_msg,
        trip_id: this.fav_trip_id
      }

      this._http.post(api_url, comment_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.comment_msg = '';
            this.listAllComments();
          }
        });
      // }
    }
  }

  // sendReplyComment(formData, list) {
  //   if (formData.value.reply_comment_msg != '') {
  //     if (formData.valid) {
  //       var api_url = this._globalService.apiHost + '/PostReplyComments';

  //       var comment_data = {
  //         message: formData.value.reply_comment_msg,
  //         trip_id: this.fav_trip_id,
  //         reply_msg_id: list.id
  //       }

  //       this._http.post(api_url, comment_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
  //         .subscribe(res => {
  //           if (res['status'] == 'ok') {
  //             this.reply_comment_form.reset();
  //             $(document).ready(function () {
  //               $('.reply-list').css('display', 'none');
  //             });
  //             this.listAllComments();
  //           }
  //         });
  //     }
  //   }
  // }

  sendReplyComment(reply_comment_msg, list) {
    if (reply_comment_msg != '') {
      // if (formData.valid) {
      var api_url = this._globalService.apiHost + '/PostReplyComments';

      var comment_data = {
        message: reply_comment_msg,
        trip_id: this.fav_trip_id,
        reply_msg_id: list.id
      }

      this._http.post(api_url, comment_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.reply_comment_msg = '';
            $(document).ready(function () {
              $('.reply-list').css('display', 'none');
            });
            this.listAllComments();
          }
        });
      // }
    }
  }


  replyComment(list) {
    $(document).ready(function () {
      // $('.reply-list').css('display', 'none');
      $('#reply-list-' + list.id).css('display', 'block');
    });
  }

  clickLike(id: number, is_like: number) {
    var api_url = this._globalService.apiHost + '/LikeReviewComments?id=' + id + '&is_like=' + is_like;

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.listAllComments();
        }
      });
  }

  gotoTripDetails(trip) {
    // localStorage.setItem('trip_id', trip_id);
    let search_param_data = {
      mode: '',
      departure: "",
      destination: "",
      isAnywhere: true,
      planned: false,
      selectedDuration: "0",
      type: "",
      language: "",
      confirmed_types: false,
      id_verified: false,
      social_verified: false,
      any_time: true,
      anyTime: true
    };
    let tripSearchData = {
      trip_id: trip.trip_id, user_id: trip.user_id, location: 'persondetails', trip_type: trip.type,
      search_param_data: search_param_data,
    }
    // localStorage.setItem('trip_search_data', JSON.stringify({ trip_id: trip.trip_id, user_id: trip.user_id, location: 'persondetails', trip_type: trip.type,
    // search_param_data: search_param_data, }))
    this._sharedService.tripSearchData = tripSearchData;
    // this.sharedService.gotoTripDetailsPageWithTripData = { trip_id: trip_id };
    this.router.navigate(['/tripdetails']);
  }

  public getAllUserInvitesCountByTrips() {
    var api_url = this._globalService.apiHost + '/GetAllUserInvitesCountByTrips?user_id=' + this.fav_user_id;

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          var user_invites = res['trips'];
          var root = this;
          let userInvites = [];

          async.forEach(user_invites, function (list) {

            let start_month = moment(list['Trip.from_date']).format('MMMM');
            let start_date = moment(list['Trip.from_date']).format('DD');

            let end_month = moment(list['Trip.to_date']).format('MMMM');
            let end_date = moment(list['Trip.to_date']).format('DD');

            let start_suffixval = root._globalService.ordinal_suffix_of(parseInt(start_date));
            let end_suffixval = root._globalService.ordinal_suffix_of(parseInt(end_date));

            userInvites.push({
              trip_id: list.trip_id,
              trip_name: list['Trip.trip_name'],
              departure: list['Trip.departure'],
              destination: list['Trip.destination'],
              description: list['Trip.description'],
              start_month: start_month,
              start_date: start_date,
              end_month: end_month,
              end_date: end_date,
              start_suffixval: start_suffixval,
              end_suffixval: end_suffixval,
              count: list.count,
              user_id: list['Trip.user_id'],
            })
          });

          this.user_invites = userInvites;
        }
      });
  }

  getRatings() {
    if (this.fav_user_id) {
      let api_url = this._globalService.apiHost + '/getRatings?user_id=' + this.fav_user_id;

      this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            var root = this;
            var user = res['userData'];
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
              root.ratings = (parseFloat(root.ratings) - parseFloat(user.reduced_ratings)).toFixed(1);
            }
            else {
              root.ratings = 0;
            }
          }
        });
    }
  }

  getFavUser(fav_user_id) {
    let api_url = this._globalService.apiHost + '/GetFavUser?fav_user_id=' + fav_user_id;
    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          // console.log("get fav", res['fav_user']); 
          var isfavUser = res['fav_user'];
          if (isfavUser == null) {
            this.favactive = true;
            this.favdeactive = false;
          }
          else {
            this.favactive = false;
            this.favdeactive = true;
          }
        }
      });
  }

  addToFavoriteUser(fav_user_id: number) {
    console.log("fav_user_id", fav_user_id);
    let api_url = this._globalService.apiHost + '/AddToFavoriteUser?favUserId=' + fav_user_id;
    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        console.log('response for addto fav', res);
        if (res['status'] == 'ok') {
          var lists = res['msg'];
          this.getFavUser(fav_user_id);
          this.toastr.success('Traveller added to favorites !');
        }
      });
  }

  removeFromFavoriteUser(fav_user_id: number) {
    console.log("remove fav", fav_user_id);

    let api_url = this._globalService.apiHost + '/RemoveFromFavoriteUser?favUserId=' + fav_user_id;

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.getFavUser(fav_user_id);
          this.toastr.success('Traveler removed from favorites !');
        }
      })
  }

  public onSelect(selected_one, fav_user_id: number) {
    console.log("selected_one", selected_one);
    this.favactive = selected_one == 'favactive' ? true : false;
    this.favdeactive = selected_one == 'favdeactive' ? true : false;
    if (selected_one == 'favactive') {
      console.log("selected_one", selected_one)
      this.addToFavoriteUser(fav_user_id);
    } else {
      this.removeFromFavoriteUser(fav_user_id)
    }
  }

}
