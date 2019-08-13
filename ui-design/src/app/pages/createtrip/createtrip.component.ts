import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, FormGroupDirective } from '@angular/forms';
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import * as moment from 'moment/min/moment.min.js';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MatCheckboxChange, MatDialog } from '@angular/material';
import { TernsterAccountsDialog } from 'src/app/dialogs/ternster-accounts-dialog/ternster-accounts-dialog.component';
import { AddTernsterAccountDialog } from 'src/app/dialogs/profile/add-ternster-account/add-ternster-account';
import Swal from "sweetalert2";
import { MatiDialog } from 'src/app/dialogs/profile/matidialog/matidialog.component';


@Component({
  selector: "app-createtrip",
  templateUrl: "./createtrip.component.html",
  styleUrls: ["./createtrip.component.css"]
})
export class CreatetripComponent implements OnInit {
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;

  public form: FormGroup;

  public token_object: any = "";
  public jwtHelper: JwtHelperService = new JwtHelperService();

  public planned: boolean = false;
  public unplanned: boolean = true;
  public isLoading: boolean = false;
  public isMainLoading: boolean = true;
  public perks: any;
  public perk_formdata: any;
  public per_kg = "Charge of Per Kg";
  currency_name_code = "Us Doller - USD";
  value = 0;
  showTicks = true;
  autoTicks = true;
  max = 100000;
  min = 0;
  thumbLabel = true;
  courier_BudgetMinVal = 0;
  assistance_BudgetMinVal = 0;
  courier_weight = 0;
  currencyVal = "$";
  selected = "USD";
  gateway_selected = "gateway";
  weightUnit = "kg";
  accountInfo = "";
  currencySelected;
  public MatiURL = '';
  public is_kyc_verified: boolean = false;

  public current_date: any = new Date();

  public currency: any = [];

  public mode_lists: any = [];

  public is_courier_service = true;
  public is_assistance_service = false;
  public is_companion_service = false;

  public user_data: any = "";
  public cover_picture: any = "/assets/images/header-bg.webp";

  public departureFilteredOptions = [];
  public destinationFilteredOptions = [];
  public othermodes: boolean = false;
  public AssDisabled: boolean = true;

  public next_date: any = new Date(
    new Date().setDate(new Date().getDate() + 1)
  );

  public plans = [
    {
      value: "7",
      name: "1 Week"
    },
    // {
    //   value: '15',
    //   name: '15 Days',
    // },
    {
      value: "30",
      name: "30 Days"
    }
    // {
    //   value: '60',
    //   name: '60 Days',
    // }
  ];
  public base_currency_enable: boolean = false;
  public base_currency: FormControl = new FormControl("");
  public base_currency_code: string = "";
  public base_currency_symbol: string = "";
  public base_currency_id: any;

  public base_currency_minimum_amount_withdraw: number = 0;

  constructor(
    public formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _userService: UserService,
    private _http: HttpClient,
    public router: Router,
    public dialog: MatDialog,
    private toastr: ToastrService
  ) {
    this.form = this.formBuilder.group({
      // 'trip_name': [null, Validators.compose([Validators.required, Validators.minLength(3)])],
      trip_name: [null],
      mode: "6",
      departure: [null, Validators.compose([Validators.required])],
      destination: [null, Validators.compose([Validators.required])],
      trip_plan: "unplanned",
      unplanned_days: "30",
      from_date: [null, Validators.compose([Validators.required])],
      to_date: [null, Validators.compose([Validators.required])],
      // 'type': 'courier',
      'is_courier': true,
      'is_assistance': false,
      //  'is_companion': false,
      'currency_code': null,
      'currency_symbol': null,
      'currency_name_code': this.currency_name_code,
      'courier_budget': [0, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+[0-9]*$/)])],
      'weight_unit': ['kg'],
      'weight': [0, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+[0-9]*$/)])],
      'total_charge': [0],
      'assistance_budget': [0, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+[0-9]*$/)])],
      //  'payment_mode': ["Online"],
      description: [null],
      perks: [null, Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.token_object = this.jwtHelper.decodeToken(
      this._userService.getToken()
    );
    var page_param = { user_id: this.token_object.id, url: "createtrip" };
    this._globalService.socket.emit("page_identification", page_param);
    this.getAllPerks();
    this.currency = this._globalService.currency;
    this.isMainLoading = false;

    var api_url = this._globalService.apiHost + "/GetModesOfTravels";
    this._http
      .get(api_url, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(res => {
        if (res["status"] == "ok") {
          this.mode_lists = res["modes"];
        }
      });

    // this.getUserAccountData();
    this.getUserProfileData();
  }

  public getUserAccountData() {
    var api_url = this._globalService.apiHost + "/GetUserAccountData";

    this._http
      .get(api_url, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(res => {
        if (res["status"] == "ok") {
          var ternsterAccounts = res["data"];
          if (ternsterAccounts) {
            console.log("inside ifff");
            this.accountInfo = "data";
          } else {
            this.accountInfo = "no-data";
            // this.openTernsterAccountData();
          }
        } else {
          this.isLoading = false;
        }
      });
  }

  openKYCDialog() {
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
            this.createTrip();
          }

        });
      }
    });


  }

  public showother(cnd) {
    this.othermodes = cnd;
  }

  public changeDepartureLocation(evt) {
    if (evt == "") {
      this.departureFilteredOptions = [];
    } else {
      let api_url = this._globalService.apiHost + "/getCitiesList/" + evt;
      this._http.get(api_url).subscribe(res => {
        // if (res["status"] == "ok") {
        this.departureFilteredOptions = res["response"];
        console.log("checking the response ...", this.departureFilteredOptions);
        // }
      });
    }
  }

  public changeDestinationLocation(evt) {
    if (evt == "") {
      this.destinationFilteredOptions = [];
    } else {
      let api_url = this._globalService.apiHost + "/getCitiesList/" + evt;
      this._http.get(api_url).subscribe(res => {
        // if (res["status"] == "ok") {
        this.destinationFilteredOptions = res["response"];
        // }
      });
    }
  }

  getAllPerks() {
    let api_url = this._globalService.apiHost + "/GetAllPerks";
    this._http
      .get(api_url, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(res => {
        if (res["status"] == "ok") {
          this.perks = res["perks"];
          this.perk_formdata = this.perks.map(
            control => new FormControl(false)
          );

          this.form = this.formBuilder.group({
            trip_name: [null],
            mode: "6",
            departure: [null, Validators.compose([Validators.required])],
            destination: [null, Validators.compose([Validators.required])],
            trip_plan: "unplanned",
            unplanned_days: "30",
            from_date: [null, Validators.compose([Validators.required])],
            to_date: [null, Validators.compose([Validators.required])],
            // 'type': 'courier',
            'is_courier': true,
            'is_assistance': false,
            // 'is_companion': false,
            'courier_budget': [0, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+[0-9]*$/)])],
            'weight_unit': ['kg'],
            'weight': [0, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+[0-9]*$/)])],
            'total_charge': [0],
            'assistance_budget': [0, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+[0-9]*$/)])],
            //'payment_mode': ["Online"],
            description: [null],
            perks: new FormArray(this.perk_formdata),
            currency_code: ["USD"],
            currency_symbol: ["$"],
            currency_name_code: this.currency_name_code
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
      });
  }

  getControls() {
    return (<FormArray>this.form.get("perks")).controls;
  }

  public setPlan(days) {
    var start = moment(new Date())
      .add(1, "days")
      .format("YYYY-MM-DD HH:mm:ss");
    var end = moment(new Date())
      .add(1, "days")
      .add(days, "days")
      .format("YYYY-MM-DD HH:mm:ss");

    this.form.setValue({
      trip_name: this.form.value.trip_name,
      mode: this.form.value.mode,
      departure: this.form.value.departure,
      destination: this.form.value.destination,
      trip_plan: this.form.value.trip_plan,
      unplanned_days: this.form.value.unplanned_days,
      from_date: new Date(start),
      to_date: new Date(end),
      // 'type': this.form.value.type,
      'is_courier': this.form.value.is_courier,
      'is_assistance': this.form.value.is_assistance,
      // 'is_companion': this.form.value.is_companion,
      'courier_budget': this.form.value.courier_budget,
      'weight_unit': this.form.value.weight_unit,
      'weight': this.form.value.weight,
      'total_charge': this.form.value.total_charge,
      'assistance_budget': this.form.value.assistance_budget,
      //'payment_mode': 'Online',
      description: this.form.value.description,
      perks: this.form.value.perks,
      currency_code: this.form.value.currency_code,
      currency_symbol: this.form.value.currency_symbol,
      currency_name_code: this.currency_name_code
    });
  }

  public onSelect(selected_one) {
    this.planned = selected_one == "planned" ? true : false;
    this.unplanned = selected_one == "unplanned" ? true : false;
    if (this.unplanned) {
      if (this.form.value.unplanned_days == "custom") {
        this.planned = true;
      } else {
        this.setPlan(this.form.value.unplanned_days);
      }
    }
  }

  selectPlanOption() {
    this.planned = this.form.value.unplanned_days == "custom" ? true : false;
    // this.planned = this.setPlan(this.form.value.unplanned_days);
    // this.unplanned = this.setPlan(this.form.value.unplanned_days);
    if (!this.planned) {
      this.setPlan(this.form.value.unplanned_days);
    }
  }

  public openTernsterAccountData() {
    // const dialogRef = this.dialog.open(TernsterAccountsDialog, {
    //   width: '600px',
    //   disableClose: true,
    // });
    const dialogRef = this.dialog.open(AddTernsterAccountDialog, {
      width: "600px",
      disableClose: true,
      data: {
        stage: "initial",
        account_no: "",
        ifsc_code: "",
        account_holder_name: "",
        bank_name: "",
        bank_address: ""
      }
    });
    dialogRef.afterClosed().subscribe(msg => {
      console.log(msg);
      if (msg == "success") {
        this.accountInfo = "data";
        this.createTrip();
        this.toastr.success("Accounts Updated Successfuly");
      } else {
        this.toastr.warning("Please enter correct data");
      }
    });
  }

  createTrip() {
    console.log("this.form", this.form)
    // if (this.accountInfo != 'no-data') {
    if (this.is_kyc_verified) {
      if (this.form.valid) {
        let courier = true;
        let assistance = true;
        // if (this.form.value.is_courier == true && this.form.value.courier_budget <= 0 && this.form.value.payment_mode == 'Online') {
        if (
          this.form.value.is_courier == true &&
          this.form.value.courier_budget <= 0
        ) {
          courier = false;
        }
        if (
          this.form.value.is_assistance == true &&
          this.form.value.assistance_budget <= 0
        ) {
          assistance = false;
        }
        if (courier == true && assistance == true) {
          let tripFormVal = this.form.value;
          let perk_id = [];
          let start = "";
          let end = "";
          let tripData = {};
          if (
            tripFormVal.trip_plan == "unplanned" &&
            tripFormVal.unplanned_days != "custom"
          ) {
            if (tripFormVal.is_courier && tripFormVal.weight == 0) {
              this.toastr.warning("Please enter the courier weight");
            } else {
              start = moment().format("YYYY-MM-DD HH:mm:ss");
              // end = moment().format('YYYY-MM-DD HH:mm:ss');
              end = moment()
                .add(tripFormVal.unplanned_days, "days")
                .format("YYYY-MM-DD HH:mm:ss");

              for (let i = 0; i < this.perks.length; i++) {
                if (tripFormVal.perks[i]) {
                  perk_id.push(this.perks[i].id);
                } else {
                  perk_id.push(0);
                }
              }
              // currency_code: tripFormVal.currency_code,
              // currency_symbol: this.currencyVal,
              tripData = {
                trip_name: tripFormVal.trip_name,
                mode: tripFormVal.mode,
                departure: tripFormVal.departure,
                destination: tripFormVal.destination,
                trip_plan: tripFormVal.trip_plan,
                unplanned_days: tripFormVal.unplanned_days,
                from_date: start,
                to_date: end,
                // type: tripFormVal.type,
                is_courier: tripFormVal.is_courier,
                is_assistance: tripFormVal.is_assistance,
                is_companion: tripFormVal.is_companion,
                currency_code: this.base_currency_code,
                currency_symbol: this.base_currency_symbol,
                base_currency_id: this.base_currency_id,
                // currency_symbol: tripFormVal.currency_symbol,
                courier_budget: tripFormVal.courier_budget.toString(),
                weight_unit: this.weightUnit,
                weight: tripFormVal.weight,
                assistance_budget: tripFormVal.assistance_budget.toString(),
                payment_mode: this.gateway_selected,
                description: tripFormVal.description,
                perks: perk_id
              };
              this.isLoading = true;

              var api_url = this._globalService.apiHost + "/CreateTrip";
              this._http
                .post(api_url, tripData, {
                  headers: new HttpHeaders({
                    Authorization: this._userService.getToken()
                  })
                })
                .subscribe(
                  res => {
                    if (res["status"] == "ok") {
                      this.isLoading = false;
                      this.formDirective.resetForm();
                      this.toastr.success("Trip created successfully!");
                      localStorage.setItem(
                        "create-trip",
                        JSON.stringify({ type: res["type"] })
                      );
                      this.router.navigate(["/dashboard"]);
                    }
                  },
                  error => {
                    this.isLoading = false;
                    const err = error.error.msg;
                  }
                );
            }
          } else {
            let trip_pan = "";
            if (
              tripFormVal.trip_plan == "planned" ||
              tripFormVal.unplanned_days == "custom"
            ) {
              if (tripFormVal.is_courier && tripFormVal.weight == 0) {
                this.toastr.warning("Please enter the courier weight");
              } else {
                trip_pan = tripFormVal.trip_plan;
                if (tripFormVal.unplanned_days == "custom") {
                  trip_pan = "planned";
                }
                start = moment(tripFormVal.from_date).format(
                  "YYYY-MM-DD HH:mm:ss"
                );
                end = moment(tripFormVal.to_date).format("YYYY-MM-DD HH:mm:ss");

                for (let i = 0; i < this.perks.length; i++) {
                  if (tripFormVal.perks[i]) {
                    perk_id.push(this.perks[i].id);
                  } else {
                    perk_id.push(0);
                  }
                }

                var date_time = moment().format("YYYY-MM-DD HH:mm:ss");
                // var resultHours = moment(end).diff(start, 'days');
                var start_date = moment(start).diff(new Date(), "days");

                // if (resultHours >= 1 && start_date >= 0) {
                if (start_date >= 0) {
                  tripData = {
                    trip_name: tripFormVal.trip_name,
                    mode: tripFormVal.mode,
                    departure: tripFormVal.departure,
                    destination: tripFormVal.destination,
                    trip_plan: trip_pan,
                    unplanned_days: "0",
                    from_date: start,
                    to_date: end,
                    // type: tripFormVal.type,
                    is_courier: tripFormVal.is_courier,
                    is_assistance: tripFormVal.is_assistance,
                    is_companion: tripFormVal.is_companion,
                    currency_code: this.base_currency_code,
                    currency_symbol: this.base_currency_symbol,
                    base_currency_id: this.base_currency_id,
                    // currency_symbol: tripFormVal.currency_symbol,
                    courier_budget: tripFormVal.courier_budget.toString(),
                    weight_unit: this.weightUnit,
                    weight: tripFormVal.weight,
                    assistance_budget: tripFormVal.assistance_budget.toString(),
                    // payment_mode: tripFormVal.payment_mode,
                    payment_mode: this.gateway_selected,

                    description: tripFormVal.description,
                    perks: perk_id
                  };
                  this.isLoading = true;

                  var api_url = this._globalService.apiHost + "/CreateTrip";
                  this._http
                    .post(api_url, tripData, {
                      headers: new HttpHeaders({
                        Authorization: this._userService.getToken()
                      })
                    })
                    .subscribe(
                      res => {
                        if (res["status"] == "ok") {
                          this.isLoading = false;
                          this.formDirective.resetForm();
                          this.toastr.success("Trip created successfully!");
                          localStorage.setItem(
                            "create-trip",
                            JSON.stringify({ type: res["type"] })
                          );
                          this.router.navigate(["/dashboard"]);
                        }
                      },
                      error => {
                        this.isLoading = false;
                        const err = error.error.msg;
                      }
                    );
                } else {
                  this.isLoading = false;
                  this.toastr.error("Choose proper date!");
                }
              }
            }
          }
        } else {
          this.toastr.warning("Please enter the amount..");
        }
      } else {
        this.toastr.warning("Please fill the required fields correctly");
      }

    }
    else {
      // this.openTernsterAccountData();
      this.openKYCDialog();
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

  selectCurrency(event) {
    let find_currency_data = this.currency.find(
      item => item.code === event.value
    );
    this.currencyVal = find_currency_data.symbol;
    this.currency_name_code =
      find_currency_data.name + "-" + find_currency_data.code;
  }
  selectWeightUnit(event) {
    this.weightUnit = event.value;
  }

  selectCourierWarn() {
    if (!this.is_courier_service) {
      this.toastr.warning("Please select courier");
    }
  }

  selectAssistanceWarn() {
    if (!this.is_assistance_service) {
      this.toastr.warning("Please select assistance");
    }
  }

  selectCompanionWarn() {
    if (!this.is_companion_service) {
      this.toastr.warning("Please select companion");
    }
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
          console.log("response.User.email", response["data"].User.email);
          this.MatiURL = 'https://signup.getmati.com/?merchantToken=5cf4eae09e4e8a001c61c128&metadata={"email":"' + response["data"].User.email + '"}'
          this.is_kyc_verified = response["data"].User.is_kyc_verified;
          this.base_currency.patchValue(currency.id);
          this.base_currency_id = currency.id;
          this.base_currency_code = currency.code.toUpperCase();
          this.base_currency_symbol = currency.symbol.toUpperCase();
          this.base_currency_minimum_amount_withdraw = currency.minimum_amount;
        }
      });
  }
}
