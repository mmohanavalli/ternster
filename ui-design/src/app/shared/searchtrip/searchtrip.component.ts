import { Component, OnInit, Inject, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import async from 'async';
import * as moment from 'moment/min/moment.min.js';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import { SharedService } from 'src/app/model/shared.service';


@Component({
  selector: 'app-searchtrip',
  templateUrl: './searchtrip.component.html',
  styleUrls: ['./searchtrip.component.css']
})
export class SearchtripComponent implements OnInit {

  @Output() changeDepartureLocationEmit: EventEmitter<any> = new EventEmitter();
  @Output() changeDestinationLocationEmit: EventEmitter<any> = new EventEmitter();
  @Output() radioChangeEmit: EventEmitter<any> = new EventEmitter();
  @Output() changeAnyWhereEmit: EventEmitter<any> = new EventEmitter();
  @Output() durationChangeEmit: EventEmitter<any> = new EventEmitter();
  @Output() customChangeEmit: EventEmitter<any> = new EventEmitter();
  @Output() dateChangeEventEmit: EventEmitter<any> = new EventEmitter();
  @Output() resetFiltersEmit: EventEmitter<any> = new EventEmitter();

  @Input() public departureFilteredOptions: any;
  @Input() public destinationFilteredOptions: any;
  @Input() public departure: any;
  @Input() public destination: any;
  @Input() public trip_from_date: boolean;
  @Input() public isAnywhereEnabled: boolean = false;
  @Input() public isAnywhereShow: boolean;
  @Input() public resetFilterShow: boolean;
  @Input() public selectedDuration: any;
  @Input() public selectedMode: any;
  @Input() public planned: boolean;
  @Input() public othermodes: boolean = false;

  @Input() public fromDate: any = '';
  @Input() public toDate: any = '';

  // public planned: boolean = false;
  public isLoading: boolean = true;
  public isMainLoading: boolean = true;
  public languages: any = [];
  public token_object: any = '';
  public p: any = '';

  public search_param_data: any = {};
  // public selectedMode: any = 6;
  public mode_lists: any = [];
  // public departure: any = '';
  // public destination: any = '';
  // public fromDate: any = '';
  // public toDate: any = '';
  // public selectedDuration: any = '0';
  public selectedLanguage: any = '';
  public selectedType: any = '';
  public userId: number;
  public confirm_trip = false;
  public isIdVerified = false;
  public anyTime = true;
  public isSocialVerified = false;

  public durations = [{ value: '7', name: '1 Week', },
  // { value: '15', name: '15 Days' },
  { value: '30', name: '30 Days' },
    //  { value: '60', name: '60 Days' }
  ]

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

  public page = 1;
  // public othermodes: boolean = false;

  constructor(public router: Router, private route: ActivatedRoute,
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    public sharedService: SharedService,
    private toastr: ToastrService,
  ) {
  }

  ngOnInit() {
    window.scroll(0, 0);
    var api_url = this._globalService.apiHost + '/GetModesOfTravels';

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
    console.log('tripData', tripData);
    console.log('isAnywhereEnabled', this.isAnywhereEnabled);
    if (tripData) {
      this.search_param_data = tripData.trip_search_param_data;
      this.selectedDuration = this.search_param_data.selectedDuration;
      this.selectedMode = this.search_param_data.mode;
      this.planned = this.search_param_data.planned;
      this.isAnywhereEnabled = this.search_param_data.isAnywhere;
      this.trip_from_date = this.search_param_data.trip_from_date;
      this.othermodes = this.search_param_data.othermodes;

    } else {

      this.search_param_data = {
        mode: 6,
        departure: '',
        destination: '',
        isAnywhere: true,
        othermodes: false,
        start: start,
        end: end,
        // selectedDuration: '60',
        selectedDuration: '',
        type: '',
        language: '',
        confirmed_types: false,
        id_verified: false,
        social_verified: false,
        any_time: false
      }

    }
  }
  public showother(cnd) {
    this.othermodes = cnd;
  }

  changePange(event) {
    this.p = event;
  }

  getLoggedInUserDetails() {
    this.isVerified = this.token_object.isVerified;
    this.iskycVerified = this.token_object.is_kyc_verified;
    this.issocialVerified = this.token_object.is_social_verified
  }

  public onPageChanged(event) {
    this.page = event;
  }

  triggerchangeDepartureLocationEmit(evt) {   
    this.changeDepartureLocationEmit.emit(evt);
  }

  triggerchangeDestinationLocationEmit(evt) {
    this.changeDestinationLocationEmit.emit(evt);
  }

  triggerCustomChange(evt) {
    this.customChangeEmit.emit(evt);
  }

  triggerRadioChange(evt) {
    this.radioChangeEmit.emit(evt);
  }

  triggerChangeAnyWhere(evt) {
    this.departure = '';
    this.destination = '';
    this.changeAnyWhereEmit.emit(evt);
  }

  triggerDurationChange(evt) {
    this.durationChangeEmit.emit(evt);
  }

  triggerDateChangeEvent(type, evt) {
    this.dateChangeEventEmit.emit({ type, evt });
  }

  triggerResetFilter(evt) {
    this.selectedMode = '';
    this.selectedDuration = '0';
    this.departure = '';
    this.destination = '';
    this.resetFiltersEmit.emit(evt);
  }
}