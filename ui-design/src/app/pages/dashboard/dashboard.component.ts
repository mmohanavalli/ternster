import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import async from 'async';
import * as moment from 'moment/min/moment.min.js';
import Swal from 'sweetalert2';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MatDialog } from '@angular/material';
import { VerifyReceiverOtpDialog } from 'src/app/dialogs/verify-receiver-otp-dialog/verify-receiver-otp-dialog.component';
import { SharedService } from 'src/app/model/shared.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public courier: boolean = true;
  public assistance: boolean = false;
  public companion: boolean = false;

  public isLoading: boolean = true;
  public isMainLoading: boolean = true;

  public incoming: boolean = true;
  public sendrequest: boolean = false;
  public mytrips: boolean = false;

  public noIncomingTrips: boolean = false;
  public noSendRequestTrips: boolean = false;
  public noMyTrips: boolean = false;

  public showIsDeliverButton: boolean = false;

  public trip_type = 'courier';
  public req_type = 'incoming';

  public myTrips: any = [];
  public requestSentTrips: any = [];
  public incomingTrips: any = [];
  tripDelete: any = [];
  alert_text: any = 'Do you want to accept this request?';
  alert_type: any = 'success';
  public jwtHelper: JwtHelperService = new JwtHelperService();
  public user_data: any = '';
  public cover_picture: any = '/assets/images/header-bg.webp';
  public profile_image: any = '/assets/images/top-profile-icon.webp';
  public p: any = '';
  public courier_req_id = [];

  public trip_ids: any = [];

  public token_object: any = '';

  constructor(public router: Router,
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public _sharedService : SharedService ) { }

  ngOnInit() {
    var myData = JSON.parse(localStorage.getItem('create-trip'));
    var myEditData = JSON.parse(localStorage.getItem('trip_service_log'));

    if (myData) {
      this.req_type = 'mytrips';
      this.trip_type = myData ? myData.type : '';
      this.mytrips = true;
      this.incoming = false;
      this.sendrequest = false;
      localStorage.removeItem('create-trip');
    }
    else if (myEditData) {
      this.req_type = 'mytrips';
      this.trip_type = myEditData ? myEditData.serviceTripType[0].trip_type : '';
      this.mytrips = true;
      this.incoming = false;
      this.sendrequest = false;
      localStorage.removeItem('trip_service_log');
    }

    this.token_object = this.jwtHelper.decodeToken(this._userService.getToken());
    var page_param = { user_id: this.token_object.id, url: 'dashboard' };
    this._globalService.socket.emit('page_identification', page_param);
    window.scroll(0, 0);
    this.getAllIncomingRequestByTrips();
    this.getAllInvitesByTrips();
    this.getMyTrips();
    this.isMainLoading = false;
  }

  public onSelect(selected_one: string) {
    this.isLoading = true;
    this.trip_type = selected_one;
    this.courier = selected_one == 'courier' ? true : false;
    this.assistance = selected_one == 'assistance' ? true : false;
    this.companion = selected_one == 'companion' ? true : false;
    this.getAllIncomingRequestByTrips();
    this.getAllInvitesByTrips();
    this.getMyTrips();
  }

  public onVerticalTabSelect(selected_one: string) {
    this.req_type = selected_one;
    this.incoming = selected_one == 'incoming' ? true : false;
    this.sendrequest = selected_one == 'sendrequest' ? true : false;
    this.mytrips = selected_one == 'mytrips' ? true : false;
    if (this.incoming) {
      this.getAllIncomingRequestByTrips();
    } else if (this.sendrequest) {
      this.getAllInvitesByTrips();
    } else {
      this.getMyTrips();
    }

  }

  getMyTrips() {
    var api_url = this._globalService.apiHost + '/GetMyTrips?type=' + this.trip_type;

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          var lists = res['mytrips'];

          this.isLoading = false;
          var root = this;
          let tripLists = [];
          async.forEach(lists, function (list) {

            // if (list.Invites && list.Invites.length > 0) {
            //   root.trip_edit = false;
            // }

            if (list.Invites && list.Invites.length > 0) {
              var invite_status = list.Invites[0].status;
            }


            let start_month = moment(list.from_date).format('MMMM');
            let start_date = moment(list.from_date).format('DD');

            let end_month = moment(list.to_date).format('MMMM');
            let end_date = moment(list.to_date).format('DD');

            let start_suffixval = root._globalService.ordinal_suffix_of(parseInt(start_date));
            let end_suffixval = root._globalService.ordinal_suffix_of(parseInt(end_date));

            tripLists.push({
              id: list.id,
              trip_name: list.trip_name,
              departure: list.departure,
              destination: list.destination,
              trip_plan: list.trip_plan,
              type:list.type,
              unplanned_days: parseInt(list.unplanned_days),
              start_month: start_month,
              start_date: start_date,
              end_month: end_month,
              end_date: end_date,
              start_suffixval: start_suffixval,
              end_suffixval: end_suffixval,
              user_id: list.user_id,
              request_id:list.Invites,
              invites_status: invite_status,
              service_log_id: list.service_log_id,
              trip_status: list.trip_status,
            })
          });

          this.myTrips = tripLists;
          if (this.myTrips.length == 0) {
            this.noMyTrips = true;
          } else {
            this.noMyTrips = false;
          }
        } else {
          this.isLoading = false;
        }
      })
  }

  getRequestData(ids, requestdata) {
    // var req_ids = ids.split(',');
    var req_ids = ids;
    var req_datas = [];
    async.forEach(requestdata, function (data) {
      async.forEach(req_ids, function (id) {
        if (id == data.id) {
          req_datas.push(data);
        }
      })
    });
    return req_datas;
  }

  getAllIncomingRequestByTrips() {
    this.incomingTrips = [];

    let api_url = this._globalService.apiHost + '/GetAllIncomingRequestByTrips?type=' + this.trip_type;

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          let trips = res['trips'];
// console.log("GetAllIncomingRequestByTrips", trips)
          var root = this;
          let tripLists = [];
          async.forEach(trips, function (trip) {
            let start_month = moment(trip.data[0].Trip.from_date).format('MMMM');
            let start_date = moment(trip.data[0].Trip.from_date).format('DD');

            let end_month = moment(trip.data[0].Trip.to_date).format('MMMM');
            let end_date = moment(trip.data[0].Trip.to_date).format('DD');

            var deliver_date = moment(new Date()).diff(trip.data[0].Trip.from_date, 'days');
            root.showIsDeliverButton = false;
            if (deliver_date > 0) {
              root.showIsDeliverButton = true;
            }

            let start_suffixval = root._globalService.ordinal_suffix_of(parseInt(start_date));
            let end_suffixval = root._globalService.ordinal_suffix_of(parseInt(end_date));

            var array_lists = [];
            var comp_request_data = [];

            async.forEach(trip.data, function (list) {
              let status = 'Accept';
              if (list.status == 'pending') {
                status = 'Accept';
              } else if (list.status == 'accepted') {
                status = 'Accepted';
              } else if (list.status == 'rejected') {
                status = 'Rejected';
              }
              else if (list.status == 'paid') {
                status = 'Paid';
              }
              else if (list.status == 'delivered') {
                status = 'Delivered';
              }
              else if (list.status == 'withdraw') {
                status = 'Withdraw';
              }

              var request_data = [];
              if (list.request_type == 'courier') {
                // console.log("res['courierdata']",res['courierdata']);
                // console.log("res['courierdata']",list.request_id);
                request_data = root.getRequestData(list.request_id, res['courierdata']);
              }
              else if (list.request_type == 'assistance') {
                request_data = root.getRequestData(list.request_id, res['assistantdata']);
              }
              else if (list.request_type == 'companion' && trip.data[0].Trip.trip_plan != 'planned') {
                request_data = root.getRequestData(list.request_id, res['companiondata']);
              }
              let profile_image = '/assets/images/top-profile-icon.webp'
              // if (list.User.Profile) {
              //   if (list.User.Profile.profile_picture)
              //     profile_image = root._globalService.imageURL + '/static/profile_images/' + list.User.Profile.profile_picture;
              // }
              // console.log("request_data",request_data);

              let req_from_date ;
              let req_to_date ;
              let req_package_weight ;
              let req_package_status ;
              let req_members ;
              if(request_data.length!=0){
                req_from_date = request_data[0].from_date,
                req_to_date = request_data[0].to_date,
                req_package_weight = request_data[0].package_weight,
                req_package_status = request_data[0].package_status,
                req_members = request_data[0].members
              }


              if (list.User.Profile) {
                if (list.User.Profile.profile_picture) {
                  if (list.User.Setting.to_everyone) {
                    profile_image = root._globalService.imageURL + "/static/profile_images/" + list.User.Profile.profile_picture;
                  } else if (list.User.Setting.only_to_connections) {
                    // if (list.status == 'accepted' || list.status == 'paid' || list.status == 'delivered') {
                    if (list.can_show_profile) {
                      profile_image = root._globalService.imageURL + "/static/profile_images/" + list.User.Profile.profile_picture;
                    }
                  } else if (!list.User.Setting.profile_image_show) {
                    profile_image = root._globalService.imageURL + "/static/profile_images/" + list.User.Profile.profile_picture;
                  }
                }
              }


              if (list.Trip.type == 'courier') {
                array_lists.push({
                  user_name: list.User.name,
                  status: status,
                  user_id: list.user_id,
                  from_user_id: list.from_user_id,
                  to_user_id: list.to_user_id,
                  trip_id: list.trip_id,
                  request_data: request_data,
                  weight: req_package_weight,
                  type: list.Trip.type,
                  profile_image: profile_image,
                  currency_symbol: list.Trip.currency_symbol,
                  courier_budget: list.Trip.courier_budget,
                  total_charge: (list.Trip.courier_budget * req_package_weight),
                  from_date: req_from_date,
                  to_date: req_to_date,
                  package_status: req_package_status,
                  can_show_profile : list.can_show_profile,
                  can_show_msg : list.can_show_msg
                });
              } else if (list.Trip.type == 'assistance') {
                array_lists.push({
                  user_name: list.User.name,
                  status: status,
                  user_id: list.user_id,
                  from_user_id: list.from_user_id,
                  to_user_id: list.to_user_id,
                  trip_id: list.trip_id,
                  request_data: request_data,
                  members: req_members,
                  type: list.Trip.type,
                  profile_image: profile_image,
                  currency_symbol: list.Trip.currency_symbol,
                  assistance_budget: list.Trip.assistance_budget,
                  from_date: req_from_date,
                  to_date: req_to_date,
                  can_show_profile : list.can_show_profile,
                  can_show_msg : list.can_show_msg
                });
              } else if (list.request_type == 'companion' && trip.data[0].Trip.trip_plan != 'planned') {
                array_lists.push({
                  user_name: list.User.name,
                  status: status,
                  user_id: list.user_id,
                  from_user_id: list.from_user_id,
                  to_user_id: list.to_user_id,
                  trip_id: list.trip_id,
                  request_data: request_data,
                  type: list.Trip.type,
                  profile_image: profile_image,
                  from_date: req_from_date,
                  to_date: req_to_date,
                  can_show_profile : list.can_show_profile,
                  can_show_msg : list.can_show_msg
                });
              }
              else {
                array_lists.push({
                  user_name: list.User.name,
                  status: status,
                  user_id: list.user_id,
                  from_user_id: list.from_user_id,
                  to_user_id: list.to_user_id,
                  trip_id: list.trip_id,
                  request_data: request_data,
                  type: list.Trip.type,
                  profile_image: profile_image,
                  can_show_profile : list.can_show_profile,
                  can_show_msg : list.can_show_msg
                });
              }
            });

            async.forEach(array_lists, function (list) {
              if (list.type == 'companion') {
                if (list.request_data.length > 0) {
                  comp_request_data.push({
                    comp_description: list.request_data[0].description,
                  })
                }
              }
            });

            tripLists.push({
              id: trip.id,
              trip_name: trip.data[0].Trip.trip_name,
              // type:trip.data[0].Trip.type,
              departure: trip.data[0].Trip.departure,
              destination: trip.data[0].Trip.destination,
              trip_plan: trip.data[0].Trip.trip_plan,
              unplanned_days: parseInt(trip.data[0].Trip.unplanned_days),
              // currency_symbol: trip.data[0].currency_symbol,
              // assistance_budget: trip.data[0].assistance_budget,
              // courier_budget: trip.data[0].courier_budget,
              start_month: start_month,
              start_date: start_date,
              end_month: end_month,
              end_date: end_date,
              start_suffixval: start_suffixval,
              end_suffixval: end_suffixval,
              incomingUserLists: array_lists,
              comp_request_data: comp_request_data,
              payment_mode: trip.data[0].Trip.payment_mode,
              type: trip.data[0].request_type,
              weight: trip.data[0].Trip.weight,
              balance_weight: trip.data[0].Trip.balance_weight,
              weight_unit: trip.data[0].Trip.weight_unit, 
              trip_status: trip.data[0].Trip.trip_status,      
            });
          })
          // console.log("tripLists", tripLists);
          this.incomingTrips = tripLists;
          if (this.incomingTrips.length == 0) {
            this.noIncomingTrips = true;
          } else {
            this.noIncomingTrips = false;
          }
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      })
  }

  getAllInvitesByTrips() {
    let api_url = this._globalService.apiHost + '/GetAllInvitesByTrips?type=' + this.trip_type;

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          let trips = res['trips'];
          var root = this;
          let tripLists = [];

          console.log("getAllInvitesByTrips trips", trips)

          async.forEach(trips, function (list) {

            let start_month = moment(list.Trip.from_date).format('MMMM');
            let start_date = moment(list.Trip.from_date).format('DD');

            let end_month = moment(list.Trip.to_date).format('MMMM');
            let end_date = moment(list.Trip.to_date).format('DD');

            let start_suffixval = root._globalService.ordinal_suffix_of(parseInt(start_date));
            let end_suffixval = root._globalService.ordinal_suffix_of(parseInt(end_date));

            tripLists.push({
              id: list.Trip.id,
              to_user_id: list.Trip.user_id,
              trip_name: list.Trip.trip_name,
              type: list.Trip.type,
              departure: list.Trip.departure,
              destination: list.Trip.destination,
              trip_plan: list.Trip.trip_plan,
              unplanned_days: parseInt(list.Trip.unplanned_days),
              start_month: start_month,
              start_date: start_date,
              end_month: end_month,
              end_date: end_date,
              start_suffixval: start_suffixval,
              end_suffixval: end_suffixval,
              user_name: list.Trip.User.name,
              from_user_id: list.user_id,
              status: list.status,
              request_id: list.request_id
            })
          });

          this.requestSentTrips = tripLists;
          if (this.requestSentTrips.length == 0) {
            this.noSendRequestTrips = true;
          } else {
            this.noSendRequestTrips = false;
          }
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      })
  }

  updateStatusRequest(userdata, trip, status) {
    var root = this;
    root.alert_text = 'Do you want to accept this request?';
    root.alert_type = 'success';

    if (trip.trip_plan == 'planned') {
      if (trip.type == 'courier') {
        var trip_weight = parseFloat(trip.balance_weight);
        var requested_weight = 0;
        let request_ids = [];
        let package_status = '';
        async.forEach(userdata.request_data, function (data) {
          requested_weight = parseFloat(requested_weight.toString()) + parseFloat(data.package_weight.toString());
          request_ids.push(data.id);
          package_status = data.package_status;
        })

        if (package_status == 'created') {
          if (trip_weight < requested_weight && status != 'rejected') {
            Swal.fire({
              title: 'Sorry!',
              text: 'Your weight is not enough for this user.',
              type: 'error',
              cancelButtonText: 'Ok'
            }).then((result) => {

            })
          }
          else if (trip_weight >= requested_weight || status == 'rejected') {
            if (status == 'rejected') {
              root.alert_text = 'Do you want to decline this request?';
              root.alert_type = 'warning';
            }
            Swal.fire({
              title: 'Are you sure?',
              text: root.alert_text,
              type: root.alert_type,
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No'
            }).then((result) => {
              if (result.value) {
                this.isLoading = true;
                var balanced_weight = parseFloat(trip_weight.toString()) - parseFloat(requested_weight.toString());
                let package_status = 'created'
                if (trip.payment_mode == 'offline') {
                  package_status = 'assigned';
                }
                let requestData = {
                  user_id: userdata.user_id,
                  from_user_id: userdata.from_user_id,
                  to_user_id: userdata.to_user_id,
                  trip_id: userdata.trip_id,
                  status: status,
                  balanced_weight: balanced_weight,
                  type: trip.type,
                  request_id: request_ids.toString(),
                  request_type: trip.type,
                  request_courier_weight: requested_weight,
                  payment_mode: trip.payment_mode,
                  package_status: package_status
                }

                var api_url = this._globalService.apiHost + '/UpdateTripInviteStatus';
                this._http.post(api_url, requestData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
                  .subscribe(res => {
                    if (res['status'] == 'ok') {
                      this.isLoading = true;
                      if(root.alert_type == 'warning')
                    this.toastr.error("Trip is Declined");
                    else if(root.alert_type == 'success')
                    this.toastr.success("Trip is Connected");
                      this.getAllIncomingRequestByTrips();
                      var data = { to_user_id: userdata.from_user_id, from_user_id: this.token_object.id, }
                      this._globalService.socket.emit('send_request', data);
                    }
                  },
                    error => {
                      const err = error.error.msg;
                    });
              }
            })
          }
        } else {
          Swal.fire({
            title: 'Sorry!',
            text: 'This package is already paid to some one.',
            type: 'error',
            cancelButtonText: 'Ok'
          }).then((result) => {

          });
        }
      }
      else {
        let request_members = 0;
        let request_ids = [];
        let package_status = '';
        async.forEach(userdata.request_data, function (data) {
          request_members = request_members + data.members;
          request_ids.push(data.id);
          package_status = data.package_status;
        })

        if (status == 'rejected') {
          root.alert_text = 'Do you want to decline this request?';
          root.alert_type = 'warning'
        }
        if(package_status == "created" && trip.type !='companion'){
        Swal.fire({
          title: 'Are you sure?',
          text: root.alert_text,
          type: root.alert_type,
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        }).then((result) => {
          if (result.value) {
            this.isLoading = true;
            let requestData = {
              user_id: userdata.user_id,
              from_user_id: userdata.from_user_id,
              to_user_id: userdata.to_user_id,
              trip_id: userdata.trip_id,
              status: status,
              type: trip.type,
              request_id: request_ids.toString(),
              request_type: trip.type,
              request_members: request_members,
              payment_mode: trip.payment_mode
            }

            var api_url = this._globalService.apiHost + '/UpdateTripInviteStatus';
            this._http.post(api_url, requestData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
              .subscribe(res => {
                if (res['status'] == 'ok') {
                  this.isLoading = true;
                  if(root.alert_type == 'warning')
                    this.toastr.error("Trip is Declined");
                    else if(root.alert_type == 'success')
                    this.toastr.success("Trip is Connected");
                  this.getAllIncomingRequestByTrips();
                  var data = { to_user_id: userdata.from_user_id, from_user_id: this.token_object.id, }
                  this._globalService.socket.emit('send_request', data);
                }
              },
                error => {
                  const err = error.error.msg;
                });
          }
        })
      }else {
        Swal.fire({
          title: 'Sorry!',
          text: 'This request is already paid to some one.',
          type: 'error',
          cancelButtonText: 'Ok'
        }).then((result) => {

        });
      }
      }
    }
    else {
      if (trip.type == 'courier') {
        // var trip_weight = parseFloat(trip.balance_weight);
        // var requested_weight = 0;
        // let request_ids = [];
        // async.forEach(userdata.request_data, function(data) {
        //   requested_weight = parseFloat(requested_weight.toString()) + parseFloat(data.weight.toString());
        //   request_ids.push(data.id);
        // })

        var trip_weight = parseFloat(trip.balance_weight);
        var requested_weight = parseFloat(userdata.weight);
        let package_status = userdata.package_status;

        if (package_status == 'created') {
          if (trip_weight < requested_weight && status != 'rejected') {
            Swal.fire({
              title: 'Sorry!',
              text: 'Your weight is not enough for this user.',
              type: 'error',
              cancelButtonText: 'Ok'
            }).then((result) => {

            })
          }
          else if (trip_weight >= requested_weight || status == 'rejected') {
            if (status == 'rejected') {
              root.alert_text = 'Do you want to decline this request?';
              root.alert_type = 'warning';
            }
            Swal.fire({
              title: 'Are you sure?',
              text: root.alert_text,
              type: root.alert_type,
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No'
            }).then((result) => {
              if (result.value) {
                this.isLoading = true;
                var balanced_weight = parseFloat(trip_weight.toString()) - parseFloat(requested_weight.toString());
                let package_status = 'created'
                if (trip.payment_mode == 'offline') {
                  package_status = 'assigned';
                }
                let requestData = {
                  user_id: userdata.user_id,
                  from_user_id: userdata.from_user_id,
                  to_user_id: userdata.to_user_id,
                  trip_id: userdata.trip_id,
                  status: status,
                  balanced_weight: balanced_weight,
                  type: trip.type,
                  // request_id: trip.request_id.toString(),
                  request_id: userdata.request_data[0].id,
                  request_type: trip.type,
                  request_courier_weight: requested_weight,
                  trip_plan: trip.trip_plan,
                  from_date: moment(userdata.from_date).format('DD-MMM-YYYY'),
                  to_date: moment(userdata.to_date).format('DD-MMM-YYYY'),
                  package_status: package_status
                }

                var api_url = this._globalService.apiHost + '/updateUnplannedTripInviteStatus';
                this._http.post(api_url, requestData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
                  .subscribe(res => {
                    if (res['status'] == 'ok') {
                      this.isLoading = true;
                      this.getAllIncomingRequestByTrips();
                      var data = { to_user_id: userdata.from_user_id, from_user_id: this.token_object.id, }
                      if(root.alert_type == 'warning')
                      this.toastr.error("Trip is Declined");
                      else if(root.alert_type == 'success')
                      this.toastr.success("Trip is Connected");
                      this._globalService.socket.emit('send_request', data);
                    }
                  },
                    error => {
                      const err = error.error.msg;
                    });
              }
            })
          }
        } else {
          Swal.fire({
            title: 'Sorry!',
            text: 'This package is already paid to some one.',
            type: 'error',
            cancelButtonText: 'Ok'
          }).then((result) => {

          });
        }
      }
      else {
        let request_members = 0;
        let request_ids = [];
        let requestData;
        async.forEach(userdata.request_data, function (data) {
          request_members = request_members + data.members;
          request_ids.push(data.id);
        })

        if (status == 'rejected') {
          root.alert_text = 'Do you want to decline this request?';
          root.alert_type = 'warning'
        }
        Swal.fire({
          title: 'Are you sure?',
          text: root.alert_text,
          type: root.alert_type,
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        }).then((result) => {
          if (result.value) {
            this.isLoading = true;
            if (trip.type == 'assistance') {
              requestData = {
                user_id: userdata.user_id,
                from_user_id: userdata.from_user_id,
                to_user_id: userdata.to_user_id,
                trip_id: userdata.trip_id,
                status: status,
                type: trip.type,
                request_id: request_ids.toString(),
                request_type: trip.type,
                request_members: request_members,
                from_date: moment(userdata.from_date).format('DD-MMM-YYYY'),
                to_date: moment(userdata.to_date).format('DD-MMM-YYYY'),
                trip_plan: trip.trip_plan,
              }
            }
            else if (trip.type == 'companion') {
              requestData = {
                user_id: userdata.user_id,
                from_user_id: userdata.from_user_id,
                to_user_id: userdata.to_user_id,
                trip_id: userdata.trip_id,
                status: status,
                type: trip.type,
                request_id: request_ids.toString(),
                request_type: trip.type,
                from_date: moment(userdata.from_date).format('DD-MMM-YYYY'),
                to_date: moment(userdata.to_date).format('DD-MMM-YYYY'),
                trip_plan: trip.trip_plan,
              }
            }

            var api_url = this._globalService.apiHost + '/updateUnplannedTripInviteStatus';
            this._http.post(api_url, requestData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
              .subscribe(res => {
                if (res['status'] == 'ok') {
                  this.isLoading = true;
                  this.getAllIncomingRequestByTrips();
                  var data = { to_user_id: userdata.from_user_id, from_user_id: this.token_object.id, }
                  if(root.alert_type == 'warning')
                  this.toastr.error("Trip is Declined");
                  else if(root.alert_type == 'success')
                  this.toastr.success("Trip is Connected");
                  this._globalService.socket.emit('send_request', data);
                }
              },
                error => {
                  const err = error.error.msg;
                });
          }
        })
      }
    }
  } 

  checkDelivered(user) {
    const dialogRef = this.dialog.open(VerifyReceiverOtpDialog, {
      width: '600px',
      disableClose: true,
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'verified') {
        var data = { to_user_id: user.from_user_id, from_user_id: this.token_object.id, }
        this._globalService.socket.emit('send_request', data);
        if (this.router.url == "/dashboard") {
          this.getAllIncomingRequestByTrips();
        } else {
          this.router.navigate(['/dashboard']);
          this.getAllIncomingRequestByTrips();
        }
      }
    })
  }

  editTrip(serviceLogId) {
    localStorage.removeItem('trip_service_log');
    var trip_ids;
    var api_url = this._globalService.apiHost + '/GetServiceByTripId?serviceId=' + serviceLogId;
    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(result => {

        if (result['status'] == 'ok') {
          trip_ids = result['serviceTrip'].trip_ids.split(',')
          let trip_service = { service_log_id: result['serviceTrip'].trip_ids, serviceTripType: result['serviceTripType'] };
          localStorage.setItem('trip_service_log', JSON.stringify(trip_service));
          this.router.navigate(['/edittrip']);
        } else {
          this.isLoading = false;
        }
      });

  }

  deleteTrip(tripId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete the trip?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        this.isLoading = true;
        var api_url = this._globalService.apiHost + '/DeleteTrip?tripId=' + tripId;

        this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
          .subscribe(res => {
            if (res['status'] == 'ok') {
              this.isLoading = false;
              this.tripDelete = res['trips'];
              Swal.fire(
                'Trip Deleted!',
              )
              this.getMyTrips();
            }
          })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelled',
        )
      }
    })
  }

  gotoTripDetails(trip, location) {
    console.log("gotoTripDetails", trip);

    let request_id;
    let request_ids = [];
    let tripSearchData = {};
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
      anyTime: true
    };
    if (location == 'incomingTrip') {
      async.forEach(trip.incomingUserLists, function (data) {
        if (data.request_data.length) {
          request_ids.push(parseInt(data.request_data[0].id));
        }
      })
      tripSearchData = {
        trip_id: trip.id,
        location: location,
        trip_type: trip.type,
        request_id: request_ids,
        search_param_data: search_param_data,
        can_show_msg : trip.incomingUserLists[0]
      }

    } else if(location == 'myTrip'){
      request_id = parseInt(trip.request_id);
      async.forEach(trip.request_id, function (data) {
        if (data) {
          request_ids.push(parseInt(data.request_id));
        }
      })
      tripSearchData = {
        trip_id: trip.id,
        location: location,
        trip_type: trip.type,
        request_id: request_ids,
        search_param_data: search_param_data,
      } 
    }else{
        request_id = parseInt(trip.request_id);
        tripSearchData = {
          trip_id: trip.id,
          location: location,
          trip_type: trip.type,
          request_id: request_id,
          search_param_data: search_param_data,
        }
    }
    // localStorage.setItem('trip_search_data', JSON.stringify(tripSearchData));
    this._sharedService.tripSearchData = tripSearchData
    this.router.navigate(['/tripdetails']);
  }

  // gotoPersonDetails(user, trip) {
  //   let personData = { trip_id: trip.id, user_id: user.from_user_id, type: user.type };
  //   localStorage.setItem('persondetails', JSON.stringify(personData));
  //   this.router.navigate(['/persondetails']);  
  // } 


  viewProfile(user, trip_id, tabname) {
    console.log("basicprofile", user);
    let from_user_id;
    let to_user_id;
    if (tabname == 'incomingTrip') {
      from_user_id = user.from_user_id;
      to_user_id = user.to_user_id;

      if (user.status == 'Accept') {
        status = 'pending';
      } else if (user.status == 'Accepted') {
        status = 'accepted';
      } else if (user.status == 'Paid') {
        status = 'paid';
      }
      if(user.can_show_profile == true){
        let personData = { trip_id: trip_id, user_id: from_user_id, type: user.type, request_status: status, can_show_msg:user.can_show_msg }
        localStorage.setItem('persondetails', JSON.stringify(personData));
        // this._sharedService.gotoPersonDetailsPage = personData;
        this.router.navigate(['/persondetails']);
      }
      else if (user.status == 'Accept' || user.status == 'Rejected') {
        let personData = { trip_id: trip_id, user_id: from_user_id, type: user.type, request_status: user.status,can_show_msg:user.can_show_msg }
        localStorage.setItem('persondetails', JSON.stringify(personData));
        this.router.navigate(['/basicprofile']);
      }
      else if (status == 'accepted' || status == 'paid') {
        let personData = { trip_id: trip_id, user_id: from_user_id, type: user.type, request_status: status, can_show_msg:user.can_show_msg }
        localStorage.setItem('persondetails', JSON.stringify(personData));
        this.router.navigate(['/persondetails']);
      }

      // let personData = { trip_id: trip_id, user_id: from_user_id, type: user.type }
      // localStorage.setItem('persondetails', JSON.stringify(personData));
      // this.router.navigate(['/basicprofile']);

    } else {
      from_user_id = user.to_user_id;
      to_user_id = user.from_user_id;


      var api_url = this._globalService.apiHost + '/ViewProfileByStatus?from_user_id=' + from_user_id + '&to_user_id=' + to_user_id;

      this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            let invites = res['invites'];
            if (invites != 0 && user.status != 'Rejected') {
              let personData = { trip_id: trip_id, user_id: from_user_id, type: user.type }
              localStorage.setItem('persondetails', JSON.stringify(personData));
              this.router.navigate(['/persondetails']);
            } else {
              let personData = { user_id: from_user_id }
              localStorage.setItem('persondetails', JSON.stringify(personData));
              this.router.navigate(['/basicprofile']);
            }

            // if (trip.requestStatus == 'accepted') {
            //   let personData = { trip_id: trip.id, user_id: user.from_user_id, type: user.type }
            //   localStorage.setItem('persondetails', JSON.stringify(personData));
            //   // this.sharedService.gotoPersonDetailsPage = {trip_id:trip.id,user_id:trip.user_id};
            //   this.router.navigate(['/persondetails']);
            // }
            // else if (trip.requestStatus != 'accepted') {
            //   let personData = { user_id: trip.user_id }
            //   localStorage.setItem('persondetails', JSON.stringify(personData));
            //   // this.sharedService.gotoPersonDetailsPage = {user_id:trip.user_id};
            //   this.router.navigate(['/basicprofile']);
            // }

          }
        })
    }





  }

  gotoBasicProfile(user_id: number) {
    let personData = { user_id: user_id }
    localStorage.setItem('persondetails', JSON.stringify(personData));
    this.router.navigate(['/basicprofile']);
  }
  changePange(event) {
    this.p = event;
  }

  sendFeedback(trip, location) {
    this.isLoading = true;
    var param = {
      id: trip.id,
      user_id: trip.user_id
    }
    var api_url = this._globalService.apiHost + '/sendFeedback';

    this._http.post(api_url, param, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.isLoading = false;
          this.toastr.success('Feedback form sent successfully!');
        }
        else if (res['status'] == 'error') {
          this.isLoading = false;
          this.toastr.error(res['msg']);

        }
      },
        error => {
          const err = error.error.msg;
        });
  }
}