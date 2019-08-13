import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import { RequestDialog } from '../../dialogs/request-dialog/request-dialog.component';
import async from 'async';
import { map } from 'rxjs/operators';
import * as moment from 'moment/min/moment.min.js';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { SharedService } from 'src/app/model/shared.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormGroupDirective, FormBuilder, Validators, FormControl } from '@angular/forms';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { StarRatingComponent } from 'ng-starrating';
import { Location } from '@angular/common';

@Component({
  selector: 'app-tripaction',
  templateUrl: './tripaction.component.html',
  styleUrls: ['./tripaction.component.css']
})
export class TripactionComponent implements OnInit {
  public trip_id: any = '';
  public service_type: any = '';
  public favactive: boolean = false;
  public allTrips: any = [];
  public isLoading: boolean = true;
  public isMainLoading: boolean = true;
  public showPagination: boolean = true;
  public favdeactive: boolean = true;
  public trip_location: any = '';
  public selectedPaymentDuration: any = '';
  public requestStatus = 'Send Request';
  public departure: any = '';
  public destination: any = '';
  public isAnywhereEnabled: boolean = false;
  public selectedDuration: any = '60';
  public selectedMode: any = 6;
  public durations = [{ value: '7', name: '1 Week', }, 
  // { value: '15', name: '15 Days' }, 
  { value: '30', name: '30 Days' },
  //  { value: '60', name: '60 Days' }
  ]
  public _hours: any = '';
  public _minutes: any = '';
  public _seconds: any = '';
  public _diff: any = '';
  public isValidPayment: boolean = true;
  public userId: number;
  public currentRate: number;
  public end_trip_id: any;
  public end_trip_date: boolean = false;
  public completed_trip: any = [];

  public jwtHelper: JwtHelperService = new JwtHelperService();
  public token_object: any = '';

  public Feedbackdescription: any = '';

  constructor(public dialog: MatDialog,
    public router: Router,
    private _formBuilder: FormBuilder,
    private _http: HttpClient,
    private _globalService: GlobalService,
    private _userService: UserService,
    private _activatedRoute: ActivatedRoute, private _router: Router, private toastr: ToastrService,
    private location: Location) { }

  ngOnInit() {
    this.isMainLoading = false;
    this.isLoading = false;
    window.scroll(0, 0);

    this.token_object = this.jwtHelper.decodeToken(localStorage.getItem('frontend-token'));
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit('page_identification', page_param);
    this.userId = this.token_object.id;

    this.trip_id = localStorage.getItem('end_trip_id');
    this.service_type = localStorage.getItem('service_type');

    if (this.trip_id != '' && this.trip_id != undefined && this.trip_id != null) {
      this.getTripById();
    }
    else {
      this.router.navigate(['/home']);
    }
    // this.getCompletedTrips();

    console.log("this.trip_id", this.trip_id, "this.service_type", this.service_type);

  }

  getTripById() {
    this.allTrips = [];
    this.isLoading = true;
    if (this.trip_id) {
      this.showPagination = false;
      let api_url = this._globalService.apiHost + '/GetTripById?tripId=' + this.trip_id;
      this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            var list = res['trips'];
            console.log("tripactiob", res)
            this.isLoading = false;
            var root = this;
            let srcMode = '../../../assets/images/' + list.Travel_Mode.image;
            let userImage = '';

            if (list.Invites[0] != null && list.Invites[0].from_user_id == root.userId) {
              if (list.Invites[0].status != null) {
                root.requestStatus = list.Invites[0].status;
              }
            }

            if (list.Favorites.length != 0) {
              root.favactive = true;
              root.favdeactive = false;
            } else {
              root.favactive = false;
              root.favdeactive = true;
            }

            if ((this.trip_location == 'myTrip' || this.trip_location == 'incomingTrip') && list.User.Profile.profile_picture) {
              if (list.User.Profile.profile_picture) {
                userImage = root._globalService.imageURL + '/static/profile_images/' + list.User.Profile.profile_picture;
              }
            } else {
              if (list.User.Profile.profile_picture) {
                if (list.User.Setting.to_everyone) {
                  userImage = root._globalService.imageURL + '/static/profile_images/' + list.User.Profile.profile_picture;
                } else if (list.User.Setting.only_to_connections) {
                  if (root.requestStatus == 'accepted' || root.requestStatus == 'paid') {
                    userImage = root._globalService.imageURL + '/static/profile_images/' + list.User.Profile.profile_picture;
                  }
                } else if (!list.User.Setting.profile_image_show) {
                  userImage = root._globalService.imageURL + '/static/profile_images/' + list.User.Profile.profile_picture;
                }
              }
            }

            if (list.Invites.length && list.Invites[0].updated_at && list.Invites[0].status == 'accepted' && list.user_id != this.userId) {
              var now = moment(new Date()).format('DD/MM/YYYY HH:mm:ss');
              var then = moment(list.Invites[0].updated_at).add(48, 'hours').format('DD/MM/YYYY HH:mm:ss');
              root.selectedPaymentDuration = then;
            }

            let start_month = moment(list.from_date).format('MMMM');
            let start_date = moment(list.from_date).format('DD');

            let end_month = moment(list.to_date).format('MMMM');
            let end_date = moment(list.to_date).format('DD');
            let end_year = moment(list.to_date).format('YYYY');

            let start_suffixval = root._globalService.ordinal_suffix_of(parseInt(start_date));
            let end_suffixval = root._globalService.ordinal_suffix_of(parseInt(end_date));

            var language_arr = '';
            if (list.User.Profile.languages) {
              language_arr = list.User.Profile.languages.split(",").map(function (item) {
                return item.trim();
              });
            }

            var perks_arr = list.perks_id.split(",").map(function (item) {
              return parseInt(item.trim());
            });

            let startDate = moment(list.from_date, "YYYY-MM-DD");
            let endDate = moment(list.to_date, "YYYY-MM-DD");

            if (endDate <= moment(new Date())) {
              this.end_trip_date = true
            }
            else {
              this.end_trip_date = false
            }

            var close_date = moment(new Date()).diff(endDate, 'days');

            //Difference in number of days
            this.selectedDuration = moment.duration(endDate.diff(startDate)).asDays().toString();
            this.selectedMode = list.mode;
            this.departure = list.departure;
            this.destination = list.destination;

            let trips = {
              id: list.id,
              trip_name: list.trip_name,
              perks_id: perks_arr,
              departure: list.departure,
              destination: list.destination,
              description: list.description,
              type: list.type,
              mode: srcMode,
              currency_symbol: list.currency_symbol,
              currency_code: list.currency_code,
              weight: list.weight,
              payment_mode: list.payment_mode,
              from_date: list.from_date,
              to_date: list.to_date,
              start_month: start_month,
              start_date: start_date,
              end_month: end_month,
              end_date: end_date,
              end_year: end_year,
              start_suffixval: start_suffixval,
              end_suffixval: end_suffixval,
              user_id: list.user_id,
              username: list.User.Profile.first_name,
              languages: language_arr,
              profile_image: userImage,
              requestStatus: root.requestStatus,
              favactive: root.favactive,
              favdeactive: root.favdeactive,
              request_id: list.request_id,
              request_type: list.request_type,
              trip_plan: list.trip_plan,
              unplanned_days: parseInt(list.unplanned_days),
              courier_budget: list.courier_budget,
              assistance_budget: list.assistance_budget,
              weight_unit: list.weight_unit,
              user_id_token: this.userId,
              close_date: close_date,
              from_user_id: list.Invites[0].from_user_id,
              to_user_id: list.Invites[0].to_user_id,
            }

            this.allTrips = trips;
            // console.log("this.allTrips", this.allTrips);
          }
        })
    } else {
      console.log("there is no destination");
    }
  }


  closeTrip(from_user_id, to_user_id) {
    console.log("from_user_id, to_user_id", from_user_id, to_user_id);
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to continue the connection?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (!result.value) {
        var api_url = this._globalService.apiHost + '/UpdateConnection';

        var param = {
          id: this.trip_id,
          from_user_id: from_user_id,
          to_user_id: to_user_id,
          service_type: this.service_type,
        }

        this._http.post(api_url, param, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
          .subscribe(res => {
            if (res['status'] == 'ok') {
              this.sendFeedback();
              this.toastr.success('Your connection is closed successfully!');
              this.router.navigate(['/findatrips']);
            }
          });
      }
      else {
        this.sendFeedback();
      }
    });
  }

  sendFeedback() {
    this.isLoading = true;
    this.isMainLoading = true;

    var param = {
      id: this.trip_id,
      service_type: this.service_type
    }
    var api_url = this._globalService.apiHost + '/sendFeedback';

    this._http.post(api_url, param, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.isLoading = false;
          this.isMainLoading = false;

          this.toastr.success('Trip closed and feedback form sent to your email successfully!');
          this.router.navigate(['/findatrips']);
        }
        else if (res['status'] == 'error') {
          this.isLoading = false;
          this.isMainLoading = false;

          this.toastr.error(res['msg']);

        }
      },
        error => {
          this.isLoading = false;
          this.isMainLoading = false;
          const err = error.error.msg;
        });
  }

  gotoContinue() {
    Swal.fire({
      title: 'Please close the trip with in 7 days , Otherwise the connection will be automatically closed !',
    }).then((result) => {
      if (result.value) {
        this.router.navigate(['/findatrips']);
      }
    });
  }

  tripActionContinue() {
    console.log("location", this.location.back());
    this.location.back(); // <-- go back to previous location on tripActionContinue
  }

  // getCompletedTrips() {
  //   this.completed_trip = [];
  //   var api_url = this._globalService.apiHost + '/GetCompletedTrips';
  //   this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
  //     .subscribe(res => {
  //       if (res['status'] == 'ok') {
  //         // console.log("Completed Trips", res);
  //         var root = this;
  //         var lists = res['trips'];
  //         async.forEach(lists, function (list) {
  //           root.completed_trip.push({
  //             id: list.id,
  //             from_date: list.from_date,
  //             to_date: list.to_date,
  //             trip_name: list.trip_name,
  //             status: list.trip_status,
  //             from_user_id: list.from_user_id,
  //             to_user_id: list.to_user_id
  //           })
  //         });
  //       }
  //     });
  //  }

  // closeCompletedTrips(completed_trip) {
  //   var api_url = this._globalService.apiHost + '/CloseCompletedTrips';
  //   let trip_id = [];
  //   let invites_data = [];
  //   async.forEach(completed_trip, function (list) {
  //     trip_id.push(list.id);
  //     invites_data.push({
  //       trip_id: list.id,
  //       from_user_id: list.from_user_id,
  //       to_user_id: list.to_user_id
  //     })
  //   })

  //   var param_data = {
  //     trip_id: trip_id,
  //     invites_data: invites_data
  //   }

  //   this._http.post(api_url, param_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
  //     .subscribe(res => {
  //       if (res['status'] == 'ok') {
  //         var root = this;
  //         var lists = res['close_conn_trip'];
  //         this.toastr.success('Trips are closed successfully!');
  //       }
  //     });
  //  }
}
