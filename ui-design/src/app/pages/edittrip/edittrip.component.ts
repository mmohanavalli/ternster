import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, FormGroupDirective } from '@angular/forms';
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import * as moment from 'moment/min/moment.min.js';
import { Router } from '@angular/router';
import async from 'async';
import { ToastrService } from 'ngx-toastr';
import { longStackSupport } from 'q';
import { MatCheckboxChange } from '@angular/material';
import { JwtHelperService } from '@auth0/angular-jwt';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-edittrip',
  templateUrl: './edittrip.component.html',
  styleUrls: ['./edittrip.component.css']
})
export class EdittripComponent implements OnInit {
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;

  public form: FormGroup;

  public planned: boolean = false;
  public unplanned: boolean = true;
  public isLoading: boolean = false;
  public isMainLoading: boolean = true;
  public AssDisabled: boolean = true;
  public err_date: boolean = false;

  public perks: any;
  public tripId: any;
  public perk_formdata: any;
  public tripService: any;
  public tripServiceId: any;
  public tripServiceWithType: any;
  value = 0;

  max = 100000;
  min = 0;
  thumbLabel = true;
  budgetMinVal = '';
  currency_symbol = "$";
  currency_code = "USD";
  public per_kg = ' ';
  courier_BudgetMinVal = 0;
  assistance_BudgetMinVal = 0;
  courier_weight = 0;
  weightUnit = "kg";
  gateway_selected = "gateway";


  public is_courier_service = true;
  public is_assistance_service = false;
  public is_companion_service = false;

  public current_date: any = new Date();
  public fromDate: any = '';
  public toDate: any = '';

  selectedDuration = '';
  public mode_lists: any = [];
  public currency: any = [];

  trip_type = 'courier';
  public user_data: any = '';
  public cover_picture: any = '/assets/images/header-bg.webp';

  public durations = [{ value: '7', name: '1 Week', },
  //  { value: '15', name: '15 Days' },
  { value: '30', name: '30 Days' }, 
  // { value: '60', name: '60 Days' }
]

  public departureFilteredOptions = [];
  public destinationFilteredOptions = [];
  public othermodes: boolean = false; 
  public courier_edit: boolean = true;
  public assistance_edit: boolean = true;
  public companion_edit: boolean = true;

  public service_trips = {};

  public service_type: any = '';
  public service_weight: any = '';
  public service_weight_unit: any = '';
  public service_assistance_BudgetMinVal: any = '';
  public service_courier_BudgetMinVal: any = '';
  public service_currency_code: any = '';
  public service_currency_symbol: any = '';
  public service_perks: any = '';
  public base_currency_enable: boolean = false;
  public base_currency: FormControl = new FormControl("");
  public base_currency_code: string = "";
  public base_currency_symbol: string = "";
  public base_currency_id: any;
  public base_currency_minimum_amount_withdraw: number = 0;

  public jwtHelper: JwtHelperService = new JwtHelperService();
  public token_object: any = '';

  constructor(public formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _userService: UserService,
    private _http: HttpClient,
    public router: Router,
    private toastr: ToastrService) {

    this.form = this.formBuilder.group({
      'trip_name': [null],
      'mode': '6',
      'departure': [null, Validators.compose([Validators.required])],
      'destination': [null, Validators.compose([Validators.required])],
      'trip_plan': 'unplanned',
      'unplanned_days': '29',
      // 'from_date': [null, Validators.compose([Validators.required])],
      // 'to_date': [null, Validators.compose([Validators.required])],
      'from_date': [null],
      'to_date': [null],
      'is_courier': true,
      'is_assistance': false,
      //'is_companion': false,
      // 'type': 'courier',
      'currency_code': ["USD"],
      'currency_symbol': ["$"],
      'courier_budget': [0, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+[0-9]*$/)])],
      'assistance_budget': [0, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+[0-9]*$/)])],
      'weight_unit': ['kg'],
      'weight': [0, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+[0-9]*$/)])],
      'total_charge': [0],
     // 'payment_mode': ["Online"],
      'description': [null],
      'perks': [null, Validators.compose([Validators.required])],
    });

  }


  ngOnInit() {
    this.token_object = this.jwtHelper.decodeToken(this._userService.getToken());
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit('page_identification', page_param);
    window.scroll(0, 0);
    this.getAllPerks();
    let tripService = JSON.parse(localStorage.getItem('trip_service_log'));
    this.tripService = tripService.service_log_id;
    this.tripServiceWithType = tripService.serviceTripType;
    let trip_service_data = this.tripService.split(',')
    // console.log("this.tripService",this.tripService);
    // console.log("this.tripService", tripService);

    let trip_ids = [];
    for (let i = 0; i < trip_service_data.length; i++) {
      trip_ids.push({
        trip_id: trip_service_data[i],
      })
    }
    this.getTripServiceById(this.tripService);

    this.currency = this._globalService.currency;
    var api_url = this._globalService.apiHost + '/GetModesOfTravels';

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.mode_lists = res['modes'];
        }
      });

    this.isMainLoading = false;
    this.getUserProfileData();

  }

  public showother(cnd) {
    this.othermodes = cnd;
  }

  getAllPerks() {
    let api_url = this._globalService.apiHost + '/GetAllPerks';
    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.perks = res['perks'];
          this.perk_formdata = this.perks.map(control => new FormControl(false));

          this.form = this.formBuilder.group({
            'trip_name': [null],
            'mode': '6',
            'departure': [null, Validators.compose([Validators.required])],
            'destination': [null, Validators.compose([Validators.required])],
            'trip_plan': 'unplanned',
            'unplanned_days': '30',
            // 'from_date': [null, Validators.compose([Validators.required])],
            // 'to_date': [null, Validators.compose([Validators.required])],
            'from_date': [null],
            'to_date': [null],
            'is_courier': true,
            'is_assistance': false,
            //'is_companion': false,
            // 'type': 'courier',
            'currency_code': ["USD"],
            'currency_symbol': ["$"],
            'courier_budget': [0, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+[0-9]*$/)])],
            'assistance_budget': [0, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+[0-9]*$/)])],
            'weight_unit': ['kg'],
            'weight': [0, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+[0-9]*$/)])],
            'total_charge': [0],
            //'payment_mode': ["Online"],
            'description': [null],
            'perks': new FormArray(this.perk_formdata),
          });

          this.setPlan(this.form.value.unplanned_days);
          this.form
          .get("departure")
          .valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged()
          )
          .subscribe(value => {
            console.log("value", value);
            if (value == "") {
              this.departureFilteredOptions = [];
            } else {
              let api_url =
                this._globalService.apiHost + "/getCitiesList/" + value;
              this._http.get(api_url).subscribe(res => {
                // if (res["status"] == "ok") {
                this.departureFilteredOptions = res["response"];
                console.log(
                  "checking the response ...",
                  this.departureFilteredOptions
                );
                // }
              });
            }
          });
        this.form
          .get("destination")
          .valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged()
          )
          .subscribe(value => {
            if (value == "") {
              this.destinationFilteredOptions = [];
            } else {
              let api_url =
                this._globalService.apiHost + "/getCitiesList/" + value;
              this._http.get(api_url).subscribe(res => {
                // if (res["status"] == "ok") {
                this.destinationFilteredOptions = res["response"];
                console.log(
                  "checking the response ...",
                  this.departureFilteredOptions
                );
                // }
              });
            }
          });
      
        }
        
      })
  }

  getTripServiceById(trip_ids) {
    var api_url = this._globalService.apiHost + '/getTripEditById?tripIds=' + this.tripService.split(',');
    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          console.log("service_tripids", res['trips']);
          var list = res['trips'];
          this.isLoading = false;
          var trip_serv_ids;
          this.is_courier_service = false;
          this.is_assistance_service = false;
          this.is_companion_service = false;
          for (let i = 0; i < list.length; i++) {
            let list_type = list[0].type;
            console.log("service_tripids", list[i]['Invites'].length);
            
            if (list[i].type == 'courier') {
              if(list[i]['Invites'].length > 0){
                this.courier_edit = false;
              }
            }
            if (list[i].type == 'assistance') {
              if(list[i]['Invites'].length > 0){
                this.assistance_edit = false;
              }
            }
            if (list[i].type == 'companion') {
              if(list[i]['Invites'].length > 0){
                this.companion_edit = false;
              }
            }
            
            if (list[i].type == 'courier' && list[i].status == 'active') {
              this.courier_BudgetMinVal = list[i].courier_budget;
              this.currency_code = list[i].currency_code;
              this.currency_symbol = list[i].currency_symbol;
              this.service_weight = list[i].weight;
              this.service_weight_unit = list[i].weight_unit;
              this.is_courier_service = true;
            }
            if (list[i].type == 'assistance' && list[i].status == 'active') {
              this.assistance_BudgetMinVal = list[i].assistance_budget;
              this.is_assistance_service = true;
            }
            if (list[i].type == 'companion' && list[i].status == 'active') {
              this.service_perks = this.getPerksData(list[i].perks_id);
              this.is_companion_service = true;
            }

            // if (list[1].type) {
            //   this.trip_type = list_type + "," + list[1].type;
            // }
            // else if (list[1].type && list[2].type) {
            //   this.trip_type = list_type + "," + list[1].type + "," + list[2].type;
            // } else {
            //   this.trip_type = list_type;
            // }

            this.tripServiceId = list[i].service_log_id;
          }
          // console.log("this.courier_BudgetMinVal",this.courier_BudgetMinVal, this.assistance_BudgetMinVal);

          this.fromDate = moment(list[0].from_date).format('YYYY-MM-DD HH:mm:ss');
          this.toDate = moment(list[0].to_date).format('YYYY-MM-DD HH:mm:ss');

          let startDate = moment(list[0].from_date);
          let endDate = moment(list[0].to_date);

          //Difference in number of days
          this.selectedDuration = moment.duration(endDate.diff(startDate)).asDays().toString();

          if (list[0].trip_plan == 'planned') {
            this.planned = true;
            this.unplanned = false;
          } else {
            this.planned = false;
            this.unplanned = true;
            if (this.selectedDuration == '7' || this.selectedDuration == '15'
              || this.selectedDuration == '30' || this.selectedDuration == '60') {
            } else {
              this.selectedDuration = 'custom'
            }
          }
          if (list[0].mode == '3' || list[0].mode == '5' || list[0].mode == '6') {
            this.othermodes = false;
          }
          else {
            this.othermodes = true;
          }
          let tripname = list[0].trip_name;
          let mode = list[0].mode.toString();
          let departure = list[0].departure;
          let destination = list[0].destination;
          let trip_plan = list[0].trip_plan;
          // let type = list[0].type;
       //   let payment_mode = list[0].payment_mode;
          let description = list[0].description;
          let unplanned_days = list[0].unplanned_days;

          this.form.setValue({
            'trip_name': tripname,
            // 'mode': parseInt(list.mode),
            'mode': mode,
            'departure': departure,
            'destination': destination,
            'trip_plan': trip_plan,
            // 'unplanned_days': this.selectedDuration,
            'unplanned_days': unplanned_days,
            'from_date': startDate.toISOString(),
            'to_date': endDate.toISOString(),
            'is_courier': this.is_courier_service,
            'is_assistance': this.is_assistance_service,
           // 'is_companion': this.is_companion_service,
            // 'type': this.trip_type,
            'currency_code': this.currency_code,
            'currency_symbol': this.currency_symbol,
            'courier_budget': this.courier_BudgetMinVal,
            'assistance_budget': this.assistance_BudgetMinVal,
            'weight': this.service_weight ? this.service_weight : 0,
            'weight_unit': this.service_weight_unit ? this.service_weight_unit : 'Kg',
            'total_charge': 0,
            // 'payment_mode': payment_mode,
          //  'payment_mode': 'Online',
            'description': description,
            'perks': this.service_perks,
          })
        }
      });
  }

  getPerksData(perkid) {
    var perks_arr = '';
    let arrval = [];
    if (perkid) {
      perks_arr = perkid.split(",").map(function (item) {
        return parseInt(item.trim());
      });

      if (this.perks) {
        for (let i = 0; i < this.perks.length; i++) {
          if (this.perks[i].id == perks_arr[i]) {
            arrval.push(true);
          } else {
            arrval.push(false);
          }
        }
      }
    }
    return arrval;
  }

  public changeDepartureLocation(evt) {
    if (evt == '') {
      this.departureFilteredOptions = [];
    }
    else {
      let api_url = this._globalService.apiHost + '/GetLocationLists?name=' + evt;
      this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == "ok") {
            this.departureFilteredOptions = res['location_lists'];
          }
        });
    }

  }

  public changeDestinationLocation(evt) {
    if (evt == '') {
      this.destinationFilteredOptions = [];
    }
    else {
      let api_url = this._globalService.apiHost + '/GetLocationLists?name=' + evt;
      this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == "ok") {
            this.destinationFilteredOptions = res['location_lists'];
          }
        });
    }
  }

  // editTrip() {
  //   console.log("edit_this.form.value", this.form.value);
  //   if (this.form.valid) {      
  //     let tripFormVal = this.form.value;
  //     let perk_id = [];
  //     let start = '';
  //     let end = '';
  //     let tripData = {};

  //     if (tripFormVal.trip_plan == 'unplanned' && tripFormVal.unplanned_days != 'custom') {
  //       start = moment().format('YYYY-MM-DD HH:mm:ss');
  //       end = moment().format('YYYY-MM-DD HH:mm:ss');

  //       if (tripFormVal.perks) {
  //         for (let i = 0; i < this.perks.length; i++) {
  //           if (tripFormVal.perks[i]) {
  //             perk_id.push(this.perks[i].id);
  //           } else {
  //             perk_id.push(0);
  //           }
  //         }
  //       }

  //       var date_time = moment().format('YYYY-MM-DD HH:mm:ss');
  //       var resultHours = moment(end).diff(start, 'days');
  //       var start_date = moment(start).diff(start, 'days');
  //       var from_Date = moment(tripFormVal.from_date).format('YYYY-MM-DD HH:mm:ss');

  //       let tripData = {
  //         id: this.tripId,
  //         service_log_id:this.tripService,
  //         trip_name: tripFormVal.trip_name,
  //         mode: tripFormVal.mode,
  //         departure: tripFormVal.departure,
  //         destination: tripFormVal.destination,
  //         trip_plan: tripFormVal.trip_plan,
  //         unplanned_days: tripFormVal.unplanned_days,
  //         from_date: start,
  //         to_date: end,
  //         type: tripFormVal.type,
  //         currency_code: tripFormVal.currency_code,
  //         currency_symbol: this.currency_symbol,
  //         courier_budget: tripFormVal.courier_budget,
  //         assistance_budget: tripFormVal.assistance_budget,
  //         weight_unit: tripFormVal.weight_unit,
  //         weight: parseInt(tripFormVal.weight),
  //         total_charge: tripFormVal.total_charge,
  //         payment_mode:tripFormVal.payment_mode,
  //         description: tripFormVal.description,
  //         perks: perk_id,

  //       }
  //       this.isLoading = true;

  //       var api_url = this._globalService.apiHost + '/UpdateTrip';
  //       this._http.post(api_url, tripData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
  //         .subscribe(res => {
  //           if (res['status'] == 'ok') {
  //             this.isLoading = false;
  //             // this.getTripById(this.tripId)
  //             this.toastr.success('Trip updated successfully!');
  //             // this.sharedService.gotoMyTripsPage = { trip_id: 11, type: res['trip'].type };
  //             // this.router.navigate(['/dashboard']);
  //           }
  //         },
  //           error => {
  //             this.isLoading = false;
  //             const err = error.error.msg;
  //           });
  //     } else {

  //       let trip_pan = '';
  //       if (tripFormVal.trip_plan == 'planned' || tripFormVal.unplanned_days == 'custom') {
  //          trip_pan = tripFormVal.trip_plan ;
  //         if(tripFormVal.unplanned_days == 'custom'){
  //           trip_pan = 'planned';
  //         }
  //         start = moment(tripFormVal.from_date).format('YYYY-MM-DD HH:mm:ss');
  //         end = moment(tripFormVal.to_date).format('YYYY-MM-DD HH:mm:ss');
  //       }

  //       for (let i = 0; i < this.perks.length; i++) {
  //         if (tripFormVal.perks[i]) {
  //           perk_id.push(this.perks[i].id);
  //         } else {
  //           perk_id.push(0);
  //         }
  //       }        

  //       var date_time = moment().format('YYYY-MM-DD HH:mm:ss');
  //       var resultHours = moment(end).diff(start, 'days');
  //       var start_date = moment(start).diff(start, 'days');
  //       var from_Date = moment(tripFormVal.from_date).format('YYYY-MM-DD HH:mm:ss');

  //       if (resultHours >= 1 && start_date >= 0) {
  //         if (start >= this.fromDate || start >= date_time) {
  //           let tripData = {
  //             id: this.tripId,
  //             trip_name: tripFormVal.trip_name,
  //             mode: tripFormVal.mode,
  //             departure: tripFormVal.departure,
  //             destination: tripFormVal.destination,
  //             trip_plan: tripFormVal.trip_plan,
  //             unplanned_days: '0',
  //             from_date: start,
  //             to_date: end,
  //             type: tripFormVal.type,
  //             currency_code: tripFormVal.currency_code,
  //             currency_symbol: this.currency_symbol,
  //             courier_budget: tripFormVal.courier_budget,
  //             assistance_budget: tripFormVal.assistance_budget,
  //             weight_unit: tripFormVal.weight_unit,
  //             weight: parseInt(tripFormVal.weight),
  //             payment_mode:tripFormVal.payment_mode,
  //             total_charge: tripFormVal.total_charge,
  //             description: tripFormVal.description,
  //             perks: perk_id,

  //           }
  //           this.isLoading = true;

  //           var api_url = this._globalService.apiHost + '/UpdateTrip';
  //           this._http.post(api_url, tripData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
  //             .subscribe(res => {
  //               if (res['status'] == 'ok') {
  //                 this.isLoading = false;
  //                 // this.getTripById(this.tripId)
  //                 this.toastr.success('Trip updated successfully!');
  //                 // this.sharedService.gotoMyTripsPage = { trip_id: 11, type: res['trip'].type };
  //                 // this.router.navigate(['/dashboard']);
  //               }
  //             },
  //               error => {
  //                 this.isLoading = false;
  //                 const err = error.error.msg;
  //               });
  //         }
  //         else {
  //           this.isLoading = false;
  //           this.toastr.error('Choose proper date!')
  //         }
  //       }
  //       else {
  //         this.isLoading = false;
  //         this.toastr.error('Choose proper date!')
  //       }
  //     }
  //   }
  // }

  editTrip() {
    // console.log("this.form.value", this.form.value);
    if (this.form.valid) {

      let courier=true;
      let assistance=true;
      if(this.form.value.is_courier==true && this.form.value.courier_budget<=0)
      {
         courier=false;
      }
      if( this.form.value.is_assistance==true && this.form.value.assistance_budget<=0)
      {
         assistance=false;
      }
      if (courier==true && assistance==true){
        
      let tripFormVal = this.form.value;
      let perk_id = [];
      let start = '';
      let end = '';
      let tripData = {};
      if (tripFormVal.is_courier && tripFormVal.weight == 0) { this.toastr.warning('Please enter the courier weight'); }
      else {
      var api_url = this._globalService.apiHost + '/GetTripsByServiceLogId?serviceLogId=' + this.tripServiceId;
        this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            var trip_lists = res['trips'];
            let is_courier_exists = false;
            let is_assistance_exists = false;
            let is_companion_exists = false;

            async.forEach(res['trips'], function(trip){
              if(trip.is_courier) {
                is_courier_exists = true;
              }
              else if(trip.is_assistance) {
                is_assistance_exists = true;
              }
              else if(trip.is_companion) {
                is_companion_exists = true;
              }
            });

            if(tripFormVal.is_courier && !is_courier_exists) {
              this.tripServiceWithType.push({
                id: '',
                trip_type: 'courier',
                action: 'create'
              })
            }

            if(!tripFormVal.is_courier && is_courier_exists) {
              let obj = this.tripServiceWithType.find(o => o.trip_type === 'courier');
              obj.action = 'delete';
            }

            if(tripFormVal.is_assistance && !is_assistance_exists) {
              this.tripServiceWithType.push({
                id: '',
                trip_type: 'assistance',
                action: 'create'
              })
            }

            if(!tripFormVal.is_assistance && is_assistance_exists) {
              let obj = this.tripServiceWithType.find(o => o.trip_type === 'assistance');
              obj.action = 'delete';
            }
    
            if(tripFormVal.is_companion && !is_companion_exists) {
              this.tripServiceWithType.push({
                id: '',
                trip_type: 'companion',
                action: 'create'
              })
            }

            if(!tripFormVal.is_companion && is_companion_exists) {
              let obj = this.tripServiceWithType.find(o => o.trip_type === 'companion');
              obj.action = 'delete';
            }

            if (tripFormVal.trip_plan == 'unplanned' && tripFormVal.unplanned_days != 'custom') {
              start = moment().format('YYYY-MM-DD HH:mm:ss');
              end = moment().format('YYYY-MM-DD HH:mm:ss');
      
              if (tripFormVal.perks) {
                for (let i = 0; i < this.perks.length; i++) {
                  if (tripFormVal.perks[i]) {
                    perk_id.push(this.perks[i].id);
                  } else {
                    perk_id.push(0);
                  }
                }
              }
      
              // var date_time = moment().format('YYYY-MM-DD HH:mm:ss');
              // var resultHours = moment(end).diff(start, 'days');
              // var start_date = moment(start).diff(start, 'days');
              // var from_Date = moment(tripFormVal.from_date).format('YYYY-MM-DD HH:mm:ss');

              var start_date = moment(tripFormVal.from_date).format('YYYY-MM-DD HH:mm:ss');
              var end_Date = moment(tripFormVal.to_date).format('YYYY-MM-DD HH:mm:ss');

              tripData = {
                id: this.tripService,
                trip_id_with_type: this.tripServiceWithType,
                service_log_id: this.tripServiceId,
                trip_name: tripFormVal.trip_name,
                mode: tripFormVal.mode,
                departure: tripFormVal.departure,
                destination: tripFormVal.destination,
                trip_plan: tripFormVal.trip_plan,
                unplanned_days: tripFormVal.unplanned_days,
                from_date: start_date,
                to_date: end_Date,
                is_courier: tripFormVal.is_courier,
                is_assistance: tripFormVal.is_assistance,
                is_companion: tripFormVal.is_companion,
                type: tripFormVal.type,
                currency_code: this.base_currency_code,
                currency_symbol: this.base_currency_symbol,
                base_currency_id: this.base_currency_id,
                courier_budget: tripFormVal.courier_budget,
                assistance_budget: tripFormVal.assistance_budget,
                weight_unit: tripFormVal.weight_unit,
                // weight: parseInt(tripFormVal.weight),
                weight: tripFormVal.weight,
              //  total_charge: tripFormVal.total_charge,
                payment_mode:this.gateway_selected,
                description: tripFormVal.description,
                perks: perk_id,      
              }
            // }
            // else{
            //   this.err_date = true;
            //   this.toastr.error('Choose Proper date!');
            // }
              this.isLoading = true;
      
              var api_url = this._globalService.apiHost + '/UpdateServiceTrip';
              this._http.post(api_url, tripData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
              .subscribe(res => {
                if (res['status'] == 'ok') {
                  this.isLoading = false;
                  // this.getTripById(this.tripId)
                  this.toastr.success('Trip updated successfully!');
                  localStorage.removeItem('trip_service_log');
                  var trip_ids;
                  var api_url = this._globalService.apiHost + '/GetServiceByTripId?serviceId=' + this.tripServiceId;
                  this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
                    .subscribe(result => {
                      if (result['status'] == 'ok') {
                        trip_ids = result['serviceTrip'].trip_ids.split(',')
                        let trip_service = { service_log_id: result['serviceTrip'].trip_ids, serviceTripType: result['serviceTripType'] };
                        localStorage.setItem('trip_service_log', JSON.stringify(trip_service));
                        this.getTripServiceById(this.tripServiceId);
                        this.router.navigate(['/dashboard']);
                      } else {
                        this.isLoading = false;
                      }
                    });
                }
              },
              error => {
                this.isLoading = false;
                const err = error.error.msg;
              });
            } else {
      
              let trip_pan = '';
              if (tripFormVal.trip_plan == 'planned' || tripFormVal.unplanned_days == 'custom') {
                trip_pan = tripFormVal.trip_plan;
                if (tripFormVal.unplanned_days == 'custom') {
                  trip_pan = 'planned';
                }
                start = moment(tripFormVal.from_date).format('YYYY-MM-DD HH:mm:ss');
                end = moment(tripFormVal.to_date).format('YYYY-MM-DD HH:mm:ss');
              }
      
              for (let i = 0; i < this.perks.length; i++) {
                if (tripFormVal.perks[i]) {
                  perk_id.push(this.perks[i].id);
                } else {
                  perk_id.push(0);
                }
              }
      
              var date_time = moment().format('YYYY-MM-DD HH:mm:ss');
              var resultHours = moment(end).diff(start, 'days');
              var start_date = moment(start).diff(start, 'days');
              var from_Date = moment(tripFormVal.from_date).format('YYYY-MM-DD HH:mm:ss');
      
              // if (resultHours >= 1 && start_date >= 0) {
              if (start_date >= 0) {
                // if(tripFormVal.from_date == this.fromDate || tripFormVal.from_date >= this.current_date ){   
                if (start >= this.fromDate || start >= date_time) {
                    tripData = {
                    id: this.tripService,
                    trip_id_with_type: this.tripServiceWithType,
                    service_log_id: this.tripServiceId,
                    trip_name: tripFormVal.trip_name,
                    mode: tripFormVal.mode,
                    departure: tripFormVal.departure,
                    destination: tripFormVal.destination,
                    trip_plan: tripFormVal.trip_plan,
                    unplanned_days: '0',
                    from_date: start,
                    to_date: end,
                    is_courier: tripFormVal.is_courier,
                    is_assistance: tripFormVal.is_assistance,
                    is_companion: tripFormVal.is_companion,
                    type: tripFormVal.type,
                    currency_code: this.base_currency_code,
                    currency_symbol: this.base_currency_symbol,
                    base_currency_id: this.base_currency_id,
                    courier_budget: tripFormVal.courier_budget,
                    assistance_budget: tripFormVal.assistance_budget,
                    weight_unit: tripFormVal.weight_unit,
                    weight: parseInt(tripFormVal.weight),
                    payment_mode: this.gateway_selected,
                   // total_charge: tripFormVal.total_charge,
                    description: tripFormVal.description,
                    perks: perk_id,
      
                  }
                  this.isLoading = true;
      
                  var api_url = this._globalService.apiHost + '/UpdateServiceTrip';
                  this._http.post(api_url, tripData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
                    .subscribe(res => {
                      if (res['status'] == 'ok') {
                        this.isLoading = false;
                        // this.getTripById(this.tripId)
                        this.toastr.success('Trip updated successfully!');
                        localStorage.removeItem('trip_service_log');
                        var trip_ids;
                        var api_url = this._globalService.apiHost + '/GetServiceByTripId?serviceId=' + this.tripServiceId;
                        this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
                          .subscribe(result => {
                            if (result['status'] == 'ok') {
                              trip_ids = result['serviceTrip'].trip_ids.split(',')
                              let trip_service = { service_log_id: result['serviceTrip'].trip_ids, serviceTripType: result['serviceTripType'] };
                              localStorage.setItem('trip_service_log', JSON.stringify(trip_service));
                              this.getTripServiceById(this.tripServiceId);
                              this.router.navigate(['/dashboard']);
                            } else {
                              this.isLoading = false;
                            }
                          });
                      }
                    },
                      error => {
                        this.isLoading = false;
                        const err = error.error.msg;
                      });
                }
                else {
                  this.isLoading = false;
                  this.err_date = true;
                  this.toastr.error('Choose proper date!')
                }
              }
              else {
                this.isLoading = false;
                this.err_date = true;
                this.toastr.error('Choose proper date!')
              }
            }
          }
        });

      }
    }
      else{
        this.toastr.warning('Please enter the amount..');
      }
    }
  }



  getControls() {
    return (<FormArray>this.form.get('perks')).controls;
  }

  public setPlan(days) {
    var start = moment(new Date()).add(1,'days').format('YYYY-MM-DD HH:mm:ss');
    var end = moment(new Date()).add(1,'days').add(days, 'days').format('YYYY-MM-DD HH:mm:ss');
    this.form.setValue({
      'trip_name': this.form.value.trip_name,
      'mode': this.form.value.mode,
      'departure': this.form.value.departure,
      'destination': this.form.value.destination,
      'trip_plan': this.form.value.trip_plan,
      'unplanned_days': this.form.value.unplanned_days,
      'from_date': new Date(start),
      'to_date': new Date(end),
      'is_courier': this.form.value.is_courier,
      'is_assistance': this.form.value.is_assistance,
     // 'is_companion': this.form.value.is_companion,
      // 'type': this.form.value.type,
      'currency_code': this.form.value.currency_code,
      'currency_symbol': this.form.value.currency_symbol,
      'courier_budget': this.form.value.courier_budget,
      'assistance_budget': this.form.value.assistance_budget,
      'weight_unit': this.weightUnit,
      'weight': this.form.value.weight,
      // 'payment_mode': this.form.value.payment_mode,
     // 'payment_mode': 'Online',
      'total_charge': 0,
      'description': this.form.value.description,
      'perks': this.form.value.perks,
    })
  }

  selectCurrency(event) {
    // this.currency_symbol = event;
    let find_currency_data = this.currency.find(item => item.code === event);
    // console.log("find_currency_data", find_currency_data);
    this.currency_symbol = find_currency_data.symbol;
  }

  public onSelect(selected_one) {
    this.planned = selected_one == 'planned' ? true : false;
    this.unplanned = selected_one == 'unplanned' ? true : false;

    if (this.unplanned) {
      if (this.form.value.unplanned_days == 'custom') {
        this.planned = true;
      } else {
        this.setPlan(this.form.value.unplanned_days);
      }
    }
  }

  selectPlanOption() {
    this.planned = (this.form.value.unplanned_days == 'custom') ? true : false;
    // this.planned = this.setPlan(this.form.value.unplanned_days);
    // this.unplanned = this.setPlan(this.form.value.unplanned_days);
    if (!this.planned) {
      this.setPlan(this.form.value.unplanned_days);
    }
  }

  changeCourierEvent(event: MatCheckboxChange) {
    this.is_courier_service = event.checked;
    if (!this.is_courier_service) {
      this.courier_BudgetMinVal = 0;
      this.courier_weight = 0;
    }
  }

  changeAssistanceEvent(event: MatCheckboxChange) {
    this.is_assistance_service = event.checked;
    this.AssDisabled = false;
    if (!this.is_assistance_service) {
      this.assistance_BudgetMinVal = 0;
      this.AssDisabled = true;
    }
  }

  changeCompanionEvent(event: MatCheckboxChange) {
    this.is_companion_service = event.checked;
  }
  selectCourierWarn() {
    if (!this.is_courier_service) {
      this.toastr.warning('Please select courier');
    }
  }

  selectAssistanceWarn() {
    if (!this.is_assistance_service) {
      this.toastr.warning('Please select assistance');
    }
  }

  selectCompanionWarn() {
    if (!this.is_companion_service) {
      this.toastr.warning('Please select companion');
    }
  }

  selectWeightUnit(event) {
    this.weightUnit = event.value;
  }


  getBudget(event) {
    this.budgetMinVal = event.value;
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
          let currency = response["data"].User.currency;
          this.base_currency.patchValue(currency.id);
          this.base_currency_id=currency.id;          
          this.base_currency_code = currency.code.toUpperCase();
          this.base_currency_symbol = currency.symbol.toUpperCase();
          this.base_currency_minimum_amount_withdraw = currency.minimum_amount;          
        }
      });
  }
}

