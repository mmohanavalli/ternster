import { Component, OnInit, Inject, ElementRef, ViewChild, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import { RequestDialog } from '../../dialogs/request-dialog/request-dialog.component';
import { UnplannedRequestDialogComponent } from '../../dialogs/unplanned-request-dialog/unplanned-request-dialog.component';
import async from 'async';
import * as moment from 'moment/min/moment.min.js';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SharedService } from 'src/app/model/shared.service';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatPaginator, MatTableDataSource } from '@angular/material';
import { FormGroup, FormGroupDirective, FormBuilder, Validators, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TernsterAccountsDialog } from 'src/app/dialogs/ternster-accounts-dialog/ternster-accounts-dialog.component';
import { AddTernsterAccountDialog } from 'src/app/dialogs/profile/add-ternster-account/add-ternster-account';
import { MatiDialog } from 'src/app/dialogs/profile/matidialog/matidialog.component';

@Component({
  selector: 'app-findatrips',
  templateUrl: './findatrips.component.html',
  styleUrls: ['./findatrips.component.css']
})
export class FindatripsComponent implements OnInit {

  public planned: boolean = false;
  public isLoading: boolean = true;
  public isMainLoading: boolean = true;
  public trip_type = 'courier';
  public allTrips: any = [];
  public languages: any = [];
  public jwtHelper: JwtHelperService = new JwtHelperService();
  public token_object: any = '';
  public p: any = '';

  public search_param_data: any = {};
  public selectedMode: any = '6';
  public mode_lists: any = [];
  public departure: any = '';
  public destination: any = '';
  public fromDate: any = '';
  public toDate: any = '';
  public isAnywhereEnabled: boolean = false;
  public isAnywhereShow: boolean = true;
  public resetFilterShow: boolean = true;
  public selectedDuration: any = '0';
  public selectedLanguage: any = '';
  public selectedType: any = '';
  public userId: number;
  public confirm_trip = false;
  public isIdVerified = false;
  public anyTime = true;
  public isSocialVerified = false;
  public localtrip :any;
  public is_new: boolean = false;
  public findTrips: boolean = false;
  public MatiURL = '';
  public is_kyc_verified: boolean = false;


  public durations = [{ value: '7', name: '1 Week', },
  //  { value: '15', name: '15 Days' }, 
   { value: '30', name: '30 Days' }, 
  //  { value: '60', name: '60 Days' }
  ]

  public requestStatus = 'Send Request';
  public tripId: number;
  public tripCount: number;
  public isVerified = false;
  public iskycVerified = false;
  public issocialVerified = false;
  public showTrips = false;

  public current_date: any = new Date();
  public country: any = [];
  public country_name: any = [];
  public states_name: any = [];

  public accountInfo = '';

  public trip_from_date: boolean = false;
  public othermodes: boolean = false;

  public page = 1;
  public departureFilteredOptions = [];
  public destinationFilteredOptions = [];
  public Match_weight :any;

  public page_limit: any = 6;
  public page_offset: any = 0;

  public total_trip_count: any = [];
  public prev_page_index: any = 0;
  public trip_index: any = -1;
  
  constructor(public router: Router, private route: ActivatedRoute,
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    public dialog: MatDialog,
    public sharedService: SharedService,
    private toastr: ToastrService,
    public _form: FormBuilder, ) {
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.token_object = this.jwtHelper.decodeToken(this._userService.getToken());
    var page_param = { user_id: this.token_object.id, url: 'findatrips' };
    this._globalService.socket.emit('page_identification', page_param);
    this.getUsersLanguages();
    this.getUserProfileData();
    // this.getUserAccountData();
    var api_url = this._globalService.apiHost + '/GetModesOfTravels';
    localStorage.removeItem('trip_service_log');
    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.mode_lists = res['modes'];
        }
      })

    var start = moment().format('YYYY-MM-DD');
    // var end = moment().add(60, 'days').format('YYYY-MM-DD');
    var end = 'YYYY-MM-DD';
    
    let tripData = this.sharedService.gotoFindTripPageWithTripData;
    if (tripData) {
      this.search_param_data = tripData.trip_search_param_data;
      this.selectedDuration = this.search_param_data.selectedDuration;
      this.selectedMode = this.search_param_data.mode;
      this.planned = this.search_param_data.planned;
      this.isAnywhereEnabled = this.search_param_data.isAnywhere;
      this.anyTime=this.search_param_data.anyTime;
      this.isIdVerified=this.search_param_data.isIdVerified;      
      this.isSocialVerified=this.search_param_data.isSocialVerified;
      this.fromDate=this.search_param_data.start;
      this.toDate=this.search_param_data.end;
      this.trip_from_date=this.search_param_data.trip_from_date;

    } else {
      this.search_param_data = {
        mode: 6,
        departure: '',
        destination: '',
        isAnywhere: false,
        start: start,
        end: end,
        // selectedDuration: '60',
        selectedDuration: '',
        type: '',
        language: '',
        confirmed_types: false,
        id_verified: false,
        social_verified: false,
        any_time: true
      }
    }
    this.page_offset = 0;
    this.total_trip_count = [];
    this.getAllTrips();
    this.getLoggedInUserDetails();
    // this.isMainLoading = false;
  }

  public onPaginateChange(event) {
    var diff = event.pageIndex - this.prev_page_index;
    if(diff >= 0) {
      this.page_offset = this.page_offset + this.page_limit;
    }
    else {
      this.page_offset = this.page_offset - this.page_limit;
    }

    this.prev_page_index = event.pageIndex;
    
    this.getAllTrips();
  }

  public openTernsterAccountData(frompath?:string) {
    const dialogRef = this.dialog.open(AddTernsterAccountDialog, {
      width: '600px',
      disableClose: true,     
      data: {
        stage:"initial",
        account_no: "",
        ifsc_code: "",
        account_holder_name: "",
        bank_name: "",
        bank_address: ""
      }
    });
    dialogRef.afterClosed().subscribe(msg => {
      if(msg=='success'){
        this.accountInfo = 'data';
        this.toastr.success('Accounts Updated Successfuly');
        if(frompath=='sendrequest')
        {
          this.sendRequest(this.localtrip);
        }
      }else{
        this.toastr.warning('Please enter correct data');
      }
      this.page_offset = 0;
      this.total_trip_count = [];
      this.getAllTrips();      
    });
  }

  openKYCDialog(frompath?:string) {
    Swal.fire({
      title: "Please verify KYC",
      text: "Do you want to verify your KYC ?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    }).then(result => {
      if (result.value) {
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
            if(frompath=='sendrequest')
        {
          this.sendRequest(this.localtrip);
        }
          }

        });
      }
    });


  }

  public getUserAccountData() {
    var api_url = this._globalService.apiHost + '/GetUserAccountData';

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          var ternsterAccounts = res['data'];
          if (ternsterAccounts) {
            this.accountInfo = 'data';
          }
          else {
            this.accountInfo = 'no-data';
          }
        } else {
          this.isLoading = false;
        }
      });
  }
  
  getUserProfileData() {
    this._http
      .get(this._globalService.apiHost + "/GetUserProfileData", {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(response => {
        if (response["status"] == "ok") {
          console.log("response.User.email", response["data"].User.email);
          this.MatiURL = 'https://signup.getmati.com/?merchantToken=5cf4eae09e4e8a001c61c128&metadata={"email":"' + response["data"].User.email + '"}'
          this.is_kyc_verified = response["data"].User.is_kyc_verified;         
        }
      });
  }

  getUsersLanguages() {
    this.isMainLoading = true;
    var api_url = this._globalService.apiHost + '/GetAllUsersLanguages';
    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        this.isMainLoading = false;
        if (res['status'] == 'ok') {
          this.isLoading = false;
          this.languages = res['languages'];
        } else {
          this.isLoading = false;
        }
      })
  }

  changePange(event) {
    this.p = event;
  }

  getLoggedInUserDetails() {
    this.isVerified = this.token_object.isVerified;
    this.iskycVerified = this.token_object.is_kyc_verified;
    this.issocialVerified = this.token_object.is_social_verified
  }

  getAllTrips() {
    this.isLoading = true;
    //this.allTrips = [];
    const decoded = this.jwtHelper.decodeToken(localStorage.getItem('frontend-token'));
    this.userId = decoded.id;

    var api_url = this._globalService.apiHost + '/GetAllTripsBySearch';
    var param_data = this.search_param_data; 
    param_data.offset = this.page_offset;  
    this._http.post(api_url, param_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          var lists = res['trips'];
          var currency_list = res["currency_result"][0];
          this.total_trip_count = res['result_count'];

          this.isLoading = false;
          var root = this;
          let tripLists = [];
          async.forEach(lists, function (list) {

            let srcMode = '../../../assets/images/' + list.image;
            let userImage = '';

            root.requestStatus = 'Send Request';
            if (list.from_user_id == root.userId) {
              if (list.status != null) {
                root.requestStatus = list.status;
              }
            }

            if (list.profile_picture) {
              if (list.to_everyone) {
                userImage = root._globalService.imageURL + '/static/profile_images/' + list.profile_picture;
              } else if (list.only_to_connections) {
                // if (root.requestStatus == 'accepted' || root.requestStatus == 'paid') {
                if(list.can_show_profile) {
                  userImage = root._globalService.imageURL + '/static/profile_images/' + list.profile_picture;
                }
              } else if (!list.profile_image_show) {
                userImage = root._globalService.imageURL + '/static/profile_images/' + list.profile_picture;
              }
            }
            
            root.is_new = root._globalService.checkIsNewTrip(list.created_at);

            let start_month = moment(list.from_date).format('MMMM');
            let start_date = moment(list.from_date).format('DD');

            let end_month = moment(list.to_date).format('MMMM');
            let end_date = moment(list.to_date).format('DD');
            let end_year = moment(list.to_date).format('YYYY');

            let start_suffixval = root._globalService.ordinal_suffix_of(parseInt(start_date));
            let end_suffixval = root._globalService.ordinal_suffix_of(parseInt(end_date));


            var courierrate=0;
            var assistancerate=0;
            var basesymbol=currency_list.symbol;
            var triprate=Math.round(list.courier_budget*100)/100;
            var Assistancetriprate=Math.round(list.assistance_budget*100)/100;

            var tripdefaultrate=Math.round(list.currency_rate*100)/100;
            var baserate= Math.round(currency_list.currency_rate*100)/100;            

            courierrate=((triprate/tripdefaultrate)*baserate);
            assistancerate=((Assistancetriprate/tripdefaultrate)*baserate);

            courierrate=Math.round(courierrate*100)/100;
            assistancerate=Math.round(assistancerate*100)/100;

            var userName;
            if(root.requestStatus == 'paid' || root.requestStatus == 'delivered' || list.can_show_msg == true){
              userName = list.name;
            }
            else{
              // userName = list.name.substring(0, 2) + '...';
              //userName = root._globalService.shortname(list.name);
            }
 
            tripLists.push({
              id: list.trip_id,
              trip_name: list.trip_name,
              departure: list.departure,
              destination: list.destination,
              description: list.description,
              service_log_id: list.service_log_id,
              mode: srcMode,
              trip_status:list.trip_status,
              start_month: start_month,
              start_date: start_date,
              end_month: end_month,
              end_date: end_date,
              end_year: end_year,
              start_suffixval: start_suffixval,
              end_suffixval: end_suffixval,
              from_date: list.from_date,
              to_date: list.to_date,
              user_id: list.user_id,
              username: list.name,
              // username: userName,
              isVerified: list.isVerified,
              isKycVerified: list.is_kyc_verified,
              languages: list.languages,
              profile_image: userImage,
              is_new: root.is_new,
              requestStatus: root.requestStatus,
              type: list.type,
              // courier_budget: list.courier_budget,
              // assistance_budget: list.assistance_budget,
              courier_budget: courierrate,
              assistance_budget:assistancerate,
              weight_unit: list.weight_unit,
              weight: list.weight,
              balance_weight: list.balance_weight,
              // currency_symbol: list.currency_symbol,
              currency_symbol:basesymbol,
              trip_plan: list.trip_plan,
              unplanned_days: parseInt(list.unplanned_days),
              can_show_msg:list.can_show_msg,
              index: parseInt(root.trip_index) + 1
            })
            root.trip_index = parseInt(root.trip_index) +1;
          });


          this.allTrips = tripLists;
          console.log('alltrips', this.allTrips);
          if(this.allTrips.length > 0){
            this.findTrips = true;
          }
          else{
            this.findTrips = false;
          }
        } else {
          this.isLoading = false;
        }

      })
  }

  radioChange($event) {
    this.search_param_data.mode = $event.value;  
    this.page_offset = 0;  
    this.total_trip_count = [];
    this.getAllTrips();
  }

  customChange($event) {  
    this.anyTime = false
    this.search_param_data.any_time = false;
    this.search_param_data.selectedDuration='custom';
    this.search_param_data.planned=true;

    this.planned = true;
    var start = moment().format('YYYY-MM-DD');
    var end = moment().add(1, 'days').format('YYYY-MM-DD')    

    this.search_param_data.start = start;
    this.search_param_data.end = end;
    //this.getAllTrips();
  }

  durationChange($event) {
    console.log("radioChange", $event.value);
    this.planned = false;
    this.search_param_data.planned=false;
    // var start = moment(new Date()).add(1,'days').format('YYYY-MM-DD');
    // var end = moment(new Date()).add(1,'days').add($event.value, 'days').format('YYYY-MM-DD');
    var start = moment().format('YYYY-MM-DD');
    var end = moment().add($event.value, 'days').format('YYYY-MM-DD')    

    this.search_param_data.start = start;
    this.search_param_data.end = end;
    // let startDate = moment(start, "YYYY-MM-DD");
    // let endDate = moment(end, "YYYY-MM-DD");

    //Difference in number of days
    // this.selectedDuration = moment.duration(endDate.diff(startDate)).asDays().toString();
    this.selectedDuration = $event.value;
    this.anyTime = false;
    this.search_param_data.any_time = false;
    this.search_param_data.selectedDuration = this.selectedDuration;
    this.page_offset = 0;
    this.total_trip_count = [];
    this.getAllTrips();
  }

  changeInput(type, value) {
    this.isAnywhereEnabled = false;
    this.page_offset = 0;
    this.total_trip_count = [];
    if (type == 'departure') {
      this.search_param_data.departure = value;
      this.getAllTrips();
    }
    else if (type == 'destination') {
      this.search_param_data.destination = value;
      this.getAllTrips();
    }

    // if (value == '') {
    //   this.isAnywhereEnabled = true;
    // }
  }

  changeAnyWhere(event) {
    this.search_param_data.isAnywhere = event.checked;
    this.isAnywhereEnabled = event.checked;
    if (this.isAnywhereEnabled) {
      this.search_param_data.departure = '';
      this.search_param_data.destination = '';
      // this.departure = '';
      // this.destination = '';
    }
    this.page_offset = 0;
    this.total_trip_count = [];
    this.getAllTrips();
  }

  onLanguageChange($evt) {
    this.search_param_data.language = $evt;
    this.page_offset = 0;
    this.total_trip_count = [];
    this.getAllTrips();
  }

  clickType(type) {
    this.search_param_data.type = type;
    this.selectedType = type;
    this.total_trip_count = [];
    this.page_offset = 0;
    this.total_trip_count = [];
    this.getAllTrips();
  }

  dateChangeEvent( $evt) {   
    this.anyTime = false;
    if ($evt.type == 'from') {
      this.trip_from_date = true;
      this.search_param_data.trip_from_date = true;

      var startDate = moment($evt.evt.value).format('YYYY-MM-DD');
      var endDate = moment(this.search_param_data.end).format('YYYY-MM-DD HH:mm:ss');
      var diff = moment(endDate).diff(startDate, 'days');
      this.search_param_data.start = startDate;
      this.search_param_data.any_time = false;
      this.page_offset = 0;
      this.total_trip_count = [];
      // this.search_param_data.end = diff <= 0 ? '' : this.search_param_data.end;
      this.getAllTrips();
    }
    else if ($evt.type == 'to') {
      // this.trip_from_date= false;
      var endDate = moment($evt.evt.value).format('YYYY-MM-DD');
      var startDate = moment(this.search_param_data.start).format('YYYY-MM-DD HH:mm:ss');
      var diff = moment(endDate).diff(startDate, 'days');
      this.search_param_data.end = endDate;
      this.search_param_data.any_time = false;
      this.page_offset = 0;
      this.total_trip_count = [];
      // this.search_param_data.start = diff <= 0 ? '' : this.search_param_data.start;
      this.getAllTrips();
    }
  }

  confirmTripChange(evt) {
    this.search_param_data.confirmed_types = evt.checked;
    this.page_offset = 0;
    this.total_trip_count = [];
    this.getAllTrips();

  }

  idVerifyChange(evt) {
    this.search_param_data.id_verified = evt.checked;
    this.page_offset = 0;
    this.total_trip_count = [];
    this.getAllTrips();
  }

  isSocialVerify(evt) {
    this.search_param_data.social_verified = evt.checked;
    this.page_offset = 0;
    this.total_trip_count = [];
    this.getAllTrips();
  }

  isanyTime(evt) {
    this.search_param_data.any_time = evt.checked;
    if (evt.checked) {
      this.search_param_data.end = 'YYYY-MM-DD';
      this.selectedDuration = '';
      this.search_param_data.selectedDuration='';
    }
    if (!evt.checked) {
      this.search_param_data.end = moment().add(this.search_param_data.selectedDuration, 'days').format('YYYY-MM-DD');
      this.selectedDuration = '30';
      this.search_param_data.selectedDuration = '30';
    }
    this.page_offset = 0;
    this.total_trip_count = [];
    this.getAllTrips();
  }

  public postingRequest(trip) {
    if (trip.trip_plan == 'planned') {
      if (trip.type == 'courier' || trip.type == 'assistance') {
        this.Match_weight=trip.balance_weight;
        const dialogRef = this.dialog.open(RequestDialog, {
          width: '600px',
          disableClose: true,
          data: {
            type: trip.type,
            user_id: this.token_object.id,
            trip: trip
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // console.log("result_result", result);
            if(trip.type == 'courier' && parseInt(this.Match_weight)>=parseInt(result.package_weight) ||trip.type == 'assistance')
            {
              this.isLoading = true;
              var request_ids = [];
              // var request_weight = [];
              var request_weight = 0;
              var request_members = 0;
              // async.forEach(result, function (res) {
              //   request_ids.push(res.id);
              //   // request_weight.push(res.weight);
              //   request_weight = request_weight +res.weight;
              //   request_members = request_members +res.members;
              // })
              // console.log("result_result", request_members);

            this.requestStatus = 'Pending';
            this.tripId = trip.id;
            let requestData = {};
            if (trip.type == 'courier') {
              requestData = {
                to_user_id: trip.user_id,
                trip_id: trip.id,
                status: 'pending',
                // request_id: request_ids.toString(),             
                // request_courier_weight:request_weight.toString()
                request_id: result.id,
                request_type: trip.type,
                request_courier_weight: result.package_weight,
                service_log_id: trip.service_log_id,
              }
            }
              else if (trip.type == 'assistance') {
                requestData = {
                  to_user_id: trip.user_id,
                  from_user_id: this.token_object.id,
                  trip_id: trip.id,
                  status: 'pending',
                  request_id: result.id,
                  request_type: trip.type,
                  request_members: result.members,
                  service_log_id: trip.service_log_id
                }
              }
              // console.log("requestData", requestData);
          
              var api_url = this._globalService.apiHost + '/InvitesToTrip';
              this._http.post(api_url, requestData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
                .subscribe(res => {
                  if (res['status'] == 'ok') {
                    this.isLoading = false;
                    this.page_offset = 0;
                    this.total_trip_count = [];
                    this.getAllTrips();
                    this.toastr.success(res['msg']);
                    this._globalService.socket.emit('send_request', requestData);
                  }
                },
                  error => {
                    this.isLoading = false;
                    const err = error.error.msg;
                  });
              }
              else
              {
                // this.toastr.error('Sorry! Your weight is not enough for this user.please give same weight..');
                Swal.fire({
                  title: 'Sorry!',
                  text: 'Your weight is not enough for this user.',
                  type: 'error',
                  cancelButtonText: 'Ok'
                }).then((result) => {
      
                })
              }
        
        }
        });
      }
      else {
        const dialogRef = this.dialog.open(CompanionMessageDialog, {
          width: '600px',
          disableClose: true,
        });

        dialogRef.afterClosed().subscribe(msg => {
          if(msg != "close"){
          Swal.fire({
            title: 'Are you sure?',
            text: 'You want to send the request for this trip?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
          }).then((result) => {
            if (result.value) {
              this.isLoading = true;
              this.requestStatus = 'Pending';
              this.tripId = trip.id;
              let requestData = {
                to_user_id: trip.user_id,
                from_user_id: this.token_object.id,
                trip_id: trip.id,
                status: 'pending',
                request_id: '',
                request_type: trip.type,
                message: msg != '' ? msg : null,
                service_log_id: trip.service_log_id
              }

              var api_url = this._globalService.apiHost + '/InvitesToTrip';
              this._http.post(api_url, requestData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
                .subscribe(res => {
                  if (res['status'] == 'ok') {
                    this.isLoading = false;
                    this.page_offset = 0;
                    this.total_trip_count = [];
                    this.getAllTrips();
                    this.toastr.success(res['msg']);
                    this._globalService.socket.emit('send_request', requestData);
                  }
                },
                  error => {
                    const err = error.error.msg;
                  });
            }
          });
        }
        });
      }
    }
    else if (trip.trip_plan == 'unplanned') {
      if (trip.type == 'courier' || trip.type == 'assistance') {
        this.Match_weight=trip.balance_weight;
        const dialogRef = this.dialog.open(UnplannedAssisCourier, {
          width: '600px',
          disableClose: true,
          data: {
            type: trip.type,
            user_id: this.token_object.id,
            trip: trip
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            if (trip.type == 'courier' || trip.type == 'assistance') {
              const dialogRef = this.dialog.open(UnplannedRequestDialogComponent, {
                width: '600px',
                disableClose: true,
                data: {
                  type: trip.type,
                  user_id: this.token_object.id,
                  trip: trip,
                  req_date: result,
                }
              });
              dialogRef.afterClosed().subscribe(result => {
                // console.log("courier_result", result);
                if (result) {
                  if(trip.type == 'courier' && parseInt(this.Match_weight) >= parseInt(result.package_weight) ||trip.type == 'assistance')
                  {
                  this.isLoading = true;
                  // var request_ids = [];
                  // var request_weight = 0;
                  // var request_members = 0;
                  // async.forEach(result, function (res) {
                  //   request_ids.push(res.id);
                  //   request_weight = request_weight + res.weight;
                  //   request_members = request_members +res.members;
                  // })
                  this.requestStatus = 'Pending';
                  // this.tripId = trip.id;

                  this.requestStatus = 'Pending';
                  this.tripId = trip.id;
                  let requestData = {};
                  if (trip.type == 'courier') {
                    requestData = {
                      to_user_id: trip.user_id,
                      trip_id: trip.id,
                      status: 'pending',
                      // request_id: request_ids.toString(),             
                      // request_courier_weight:request_weight.toString()
                      request_id: result.id,
                      request_type: trip.type,
                      request_courier_weight: result.package_weight,
                      from_date: moment(result.from_date).format('DD-MMM-YYYY'),
                      to_date: moment(result.to_date).format('DD-MMM-YYYY'),
                    }
                  }
                  else if (trip.type == 'assistance') {
                    requestData = {
                      to_user_id: trip.user_id,
                      from_user_id: this.token_object.id,
                      trip_id: trip.id,
                      status: 'pending',
                      request_id: result.id,
                      request_type: trip.type,
                      request_members: result.members,
                      from_date: moment(result.from_date).format('DD-MMM-YYYY'),
                      to_date: moment(result.to_date).format('DD-MMM-YYYY'),
                    }
                  }

                  var api_url = this._globalService.apiHost + '/InvitesUnplannedToTrip';
                  this._http.post(api_url, requestData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
                    .subscribe(res => {
                      if (res['status'] == 'ok') {
                        this.isLoading = false;
                        this.page_offset = 0;
                        this.total_trip_count = [];
                        this.getAllTrips();
                        this.toastr.success(res['msg']);
                        this._globalService.socket.emit('send_request', requestData);
                      }
                    },
                      error => {
                        this.isLoading = false;
                        const err = error.error.msg;
                      });                    
                  }
                  else
                  {
                    // this.toastr.error('Sorry! Your weight is not enough for this user.please give same weight..');
                    Swal.fire({
                      title: 'Sorry!',
                      text: 'You weight is not enough for this user.',
                      type: 'error',
                      cancelButtonText: 'Ok'
                    }).then((result) => {
          
                    })
                  }
                }
                
              });
              
            }
          }
        });

      }
      else {
        const dialogRef = this.dialog.open(UnplannedCompanion, {
          width: '600px',
          disableClose: true,
          data: trip,
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.isLoading = true;
            this.requestStatus = 'Pending';
            this.tripId = trip.id;
            let requestData = {
              to_user_id: trip.user_id,
              from_user_id: this.token_object.id,
              trip_id: trip.id,
              status: 'pending',
              request_id: result.id,
              request_type: trip.type,
            }

            var api_url = this._globalService.apiHost + '/InvitesUnplannedToTrip';
            this._http.post(api_url, requestData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
              .subscribe(res => {
                if (res['status'] == 'ok') {
                  this.isLoading = false;
                  this.page_offset = 0;
                  this.total_trip_count = [];
                  this.getAllTrips();
                  this.toastr.success(res['msg']);
                  this._globalService.socket.emit('send_request', requestData);
                }
              },
                error => {
                  const err = error.error.msg;
                });
          }
        });
      }
    }
  }
  sendRequest(trip) {
    // if (this.accountInfo != 'no-data') {
      if(this.is_kyc_verified){
      var url = this._globalService.apiHost + '/GetTripStatus?tripId=' + trip.id;
      this._http.get(url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            if(trip.type != 'courier'){
            if (res['result']) {
              var data_res = res['result'];
              const dialogRef = this.dialog.open(ConfirmRequestDialog, {
                width: '600px',
                disableClose: true,
                data: {
                  name: data_res.User.name,
                  count: data_res.Invites.length,
                  type: trip.type
                }
              });

              dialogRef.afterClosed().subscribe(result => {
                if (result) {
                  this.postingRequest(trip);
                }
              });
            }
            else {
              this.postingRequest(trip);
            }
          }
            else {
              this.postingRequest(trip);
            }
          }
        });
    } else {
     this.localtrip=trip;
      // this.openTernsterAccountData('sendrequest');
      this.openKYCDialog('sendrequest');
    }


  }

  gotoTripDetails(trip, indexval: number, location) {
    // if (this.accountInfo != 'no-data') {
      if(this.is_kyc_verified){
      // this.search_param_data.isAnywhere=true;
      let tripSearchData = { trip_id: trip.id, user_id: trip.user_id, indexval: trip.index + 1, search_param_data: this.search_param_data, location: location,departure:trip.departure,destination:trip.destination };
      localStorage.setItem('trip_search_data', JSON.stringify(tripSearchData));
      this.sharedService.tripSearchData = tripSearchData;
      // this.sharedService.gotoTripDetailsPageWithTripData = { trip_id: trip_id, indexval: indexval + 1, search_param_data: this.search_param_data };
      this.router.navigate(['/tripdetails']);
    } else {
      this.openKYCDialog('sendrequest');
      // this.openTernsterAccountData();
    }
   
  }

  viewProfile(trip) {
    // if (this.accountInfo != 'no-data') {
      if(this.is_kyc_verified){
      var api_url = this._globalService.apiHost + '/ViewProfileByStatus?from_user_id=' + this.token_object.id + '&to_user_id=' + trip.user_id + '&trip_id=' + trip.id + '&service_log_id=' + trip.service_log_id;

      this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            let invites = res['invites'];
            // if(invites.length > 0 && trip.requestStatus!='rejected'){
            if (invites && trip.requestStatus != 'rejected') {
              let personData = { trip_id: trip.id, user_id: trip.user_id, request_status: invites.status }
              localStorage.setItem('persondetails', JSON.stringify(personData));
              this.router.navigate(['/persondetails']);
            } else {
              let invitestatus = this.requestStatus
              if (invites != null) {
                invitestatus = invites.status;
              }
              let personData = { user_id: trip.user_id, request_status: invitestatus }
              localStorage.setItem('persondetails', JSON.stringify(personData));
              this.router.navigate(['/basicprofile']);
            }
          }
        })

    } else {
      // this.openTernsterAccountData();
      this.openKYCDialog();
    }
  }

  resetFilter(evt) {
    var start = moment().format('YYYY-MM-DD');
    var end = moment().add(60, 'days').format('YYYY-MM-DD')
    // this.departure = '';
    // this.destination = '';
    this.fromDate = '';
    this.toDate = '';
    this.selectedType = '';
    this.isAnywhereEnabled = true;
    this. selectedMode='';
    // this.selectedMode = '';
    // this.selectedDuration = '0';
    console.log(start);
    this.selectedLanguage = "";
    this.confirm_trip = false;
    this.isIdVerified = false;
    this.isSocialVerified = false;
    this.anyTime = true;
    this.planned=false;
    this.search_param_data = {
      mode: '',
      departure: '',
      destination: '',
      isAnywhere: true,
      start: start,
      end: end,
      selectedDuration: '',
      type: '',
      language: '',
      confirmed_types: false,
      id_verified: false,
      social_verified: false,
      any_time: true
    }
    this.trip_from_date = false;
    this.page_offset = 0;
    this.total_trip_count = [];
    this.getAllTrips();
  }

  public onPageChanged(event) {
    this.page = event;
  }

  public changeDepartureLocation(evt) {
    if (evt == '') {
      this.departureFilteredOptions = [];
      this.search_param_data.departure = evt;
      this.page_offset = 0;
      this.total_trip_count = [];
      this.getAllTrips();
    }
    else {
      let api_url = this._globalService.apiHost + '/getCitiesList/' + evt;
      this._http.get(api_url)
        .subscribe(res => {
            this.departureFilteredOptions = res['response'];
        });
          this.isAnywhereEnabled = false;       
          this.search_param_data.departure = evt;
          this.page_offset = 0;
          this.total_trip_count = [];
          this.getAllTrips();
        
    }

  }
  public changeDestinationLocation(evt) {
    if (evt == '') {
      this.destinationFilteredOptions = [];
      this.search_param_data.destination = evt;
      this.page_offset = 0;
      this.total_trip_count = [];
      this.getAllTrips();
    }
    else {
      let api_url = this._globalService.apiHost + '/getCitiesList/' + evt;
      this._http.get(api_url)
        .subscribe(res => {
            this.destinationFilteredOptions = res['response'];
        });
        this.isAnywhereEnabled = false;       
        this.search_param_data.destination = evt;
        this.page_offset = 0;
        this.total_trip_count = [];
        this.getAllTrips();
    }
  }
}


@Component({
  selector: 'confirm-request-dialog',
  templateUrl: '../../dialogs/request-dialog/confirm-request-dialog.html'
})
export class ConfirmRequestDialog {

  constructor(public dialogRef: MatDialogRef<ConfirmRequestDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  public continueReq() {
    this.dialogRef.close(this.data);
  }

}

@Component({
  selector: 'companion-message-dialog',
  templateUrl: '../../dialogs/request-dialog/companion-message-dialog.html'
})
export class CompanionMessageDialog {
  public message: any = '';

  constructor(public dialogRef: MatDialogRef<CompanionMessageDialog>) { }

  public submitMsg() {
    this.dialogRef.close(this.message);
  }

  public close() {
    this.dialogRef.close("close");
  }

}

@Component({
  selector: 'unplanned-companion-request-dialog',
  templateUrl: './unplanned-companion-request-dialog.html'
})
export class UnplannedCompanion {
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;

  public isLoading: boolean = true;
  public unplanned_days_form: FormGroup;
  public unplanned_days: any = '30';
  public fromDate: any = new Date(new Date().setDate(new Date().getDate() + 1));
  public toDate: any = '';
  public selectDate: any = '';
  public message: any = '';
  

  constructor(public dialogRef: MatDialogRef<UnplannedCompanion>,
    @Inject(MAT_DIALOG_DATA) public data: any, public _form: FormBuilder,
    public _globalService: GlobalService,
    public _userService: UserService,
    private _http: HttpClient,
    private el: ElementRef,
    private toastr: ToastrService) {
    dialogRef.disableClose = true;
    this.unplanned_days = this.data.unplanned_days;
    this.unplanned_days_form = this._form.group({
      from_date: ['', Validators.compose([Validators.required])],
      to_date: ['', Validators.compose([Validators.required])],
      message: '',
    })
  }

  ngOnInit() {    
    this.unplanned_days_form.setValue({
      from_date: [''],
      to_date: [''],
      message: '',
    });
  }

  public onSubmitUnplanned() {
    if (this.unplanned_days_form.valid) {
      // this.dialogRef.close(this.unplanned_days_form.value);
      let formData = this.unplanned_days_form;
      this.isLoading = true;

      var param_data = {
        assigned_trip_id: this.data.id,
        from_date: moment(formData.value.from_date).format('YYYY-MM-DD HH:mm:ss'),
        to_date: moment(formData.value.to_date).format('YYYY-MM-DD HH:mm:ss'),
        description: formData.value.message
      }
      var api_url = this._globalService.apiHost + '/CreateCompanionRequest';
      this._http.post(api_url, param_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.isLoading = false;
            this.formDirective.resetForm();
            this.dialogRef.close(res['result']);
            // this.dialogRef.close('companion');
            // this.toastr.success('Successfully created request for companion');
          } else {
            this.isLoading = false;
          }
        });
    } else {
      this.isLoading = false;
    }
  }

  addEvent(event: MatDatepickerInputEvent<Date>) {
    this.selectDate = moment(event.value).add(this.unplanned_days, 'days');
    this.toDate = new Date(this.selectDate);
  }

}

@Component({
  selector: 'unplanned-assis-cou-request-dialog',
  templateUrl: './unplanned-assis-cou-request-dialog.html'
})
export class UnplannedAssisCourier {
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;

  public assis_cour_form: FormGroup;
  public current_date = new Date();
  public isLoading: boolean = true;
  public unplanned_days: any = '30';
  public fromDate: any = new Date(new Date().setDate(new Date().getDate() + 1));
  public toDate: any = '';
  public selectDate: any = '';

  constructor(public dialogRef: MatDialogRef<UnplannedAssisCourier>,
    @Inject(MAT_DIALOG_DATA) public data: any, public _form: FormBuilder) {
    dialogRef.disableClose = true;
    this.unplanned_days = this.data.trip.unplanned_days;

    this.assis_cour_form = this._form.group({
      from_date: ['', Validators.compose([Validators.required])],
      to_date: ['', Validators.compose([Validators.required])],
      trip_type: this.data.trip.type
    })
  }
  ngOnInit() {
    this.assis_cour_form.setValue({
      from_date: [''],
      to_date: [''],
      trip_type: this.data.trip.type
    })
  }
  public onSubmitAssisCour() {
    if (this.assis_cour_form.valid) {
      let formData = this.assis_cour_form;
      this.dialogRef.close(this.assis_cour_form.value);
    }
  }
  addEvent(event: MatDatepickerInputEvent<Date>) {
    this.selectDate = moment(event.value).add(this.unplanned_days, 'days');
    this.toDate = new Date(this.selectDate);
  }
  public closePopup() {
    this.dialogRef.close();
  }
}