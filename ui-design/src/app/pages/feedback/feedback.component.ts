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
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormGroupDirective, FormBuilder, Validators, FormControl } from '@angular/forms';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { StarRatingComponent } from 'ng-starrating';


@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  public trip_id: any = '';
  public allTrips: any = [];
  public isLoading: boolean = true;
  public isMainLoading: boolean = true;
  public trip_location: any = '';
  public departure: any = '';
  public destination: any = '';  
  public _hours: any = '';
  public _minutes: any = '';
  public _seconds: any = '';
  public _diff: any = '';
  public userId: number;
  public currentRate: number;

  public Feedbackdescription: any = '';
  public isFeedbackdescription: boolean = false
  public isTokenVerified: boolean = false

  public token_url : any = '';
  public user_id : any = '';
  public jwtHelper: JwtHelperService = new JwtHelperService();
  public token_object: any = '';

  constructor(public dialog: MatDialog,
    private _http: HttpClient,
    private _globalService: GlobalService,
    private _userService: UserService,
    private _router: Router, private toastr: ToastrService) { }

  ngOnInit() {
    this.token_object = this.jwtHelper.decodeToken(localStorage.getItem('frontend-token'));
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit('page_identification', page_param);
    this.isMainLoading = false;
    this.isLoading = false;
    var url = this._router.url;
    var splitted_url = url.split('/');   
    this.trip_id = splitted_url[splitted_url.length - 2];
    this.user_id = splitted_url[splitted_url.length - 3];
    this.token_url = splitted_url[splitted_url.length - 1];

    // console.log("splitted_url", splitted_url);
    // console.log("url", url, this.trip_id, this.token_url, this.user_id);
    
    var api_url = this._globalService.apiHost + '/CheckFeedbackVerification?token=' + this.token_url;

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
    .subscribe(res => {
      if(res['status'] == 'ok') {
        this.toastr.error('Token Expired');
        this._router.navigate(['/home']);
      }
      else {
        this.isTokenVerified = true;
        this.getTripById();              
      }
    });

    window.scroll(0, 0);
    
  }
  onRate($event: { oldValue: number, newValue: number, starRating: StarRatingComponent }) {
    // alert(`Old Value:${$event.oldValue}, 
    //   New Value: ${$event.newValue}, 
    //   Checked Color: ${$event.starRating.checkedcolor}, 
    //   Unchecked Color: ${$event.starRating.uncheckedcolor}`);
    this.currentRate = $event.newValue;
  }
  getTripById() {
    this.allTrips = [];
    this.isLoading = true;
    if (this.trip_id) {
      let api_url = this._globalService.apiHost + '/GetTripById?tripId=' + this.trip_id;
      this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            var list = res['trips'];
            this.isLoading = false;
            var root = this;
            let srcMode = '../../../assets/images/' + list.Travel_Mode.image;
            let userImage = '';
            userImage = root._globalService.imageURL + '/static/profile_images/' + list.User.Profile.profile_picture;            

            let start_month = moment(list.from_date).format('MMMM');
            let start_date = moment(list.from_date).format('DD');

            let end_month = moment(list.to_date).format('MMMM');
            let end_date = moment(list.to_date).format('DD');
            let end_year = moment(list.to_date).format('YYYY');

            let start_suffixval = root._globalService.ordinal_suffix_of(parseInt(start_date));
            let end_suffixval = root._globalService.ordinal_suffix_of(parseInt(end_date));       
            this.userId = list.user_id;
           
            let trips = {
              id: list.id,
              trip_name: list.trip_name,
              departure: list.departure,
              destination: list.destination,
              description: list.description,
              type: list.type,
              mode: srcMode,  
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
              profile_image: userImage,
              trip_plan: list.trip_plan,
              unplanned_days: parseInt(list.unplanned_days),
            }

            this.allTrips = trips;
          }
        })
    } else {
      console.log("there is no trip");
    }
  }
 
  ratingStar(event) {
    var checkValue = document.querySelectorAll(".smileybox input");
    var checkStar = document.querySelectorAll(".smileybox label");
    var checkSmiley = document.querySelectorAll(".smileybox  i");
    var checkCount = 0;
    for (var i = 0; i < checkValue.length; i++) {
      if (checkValue[i] == event.target) {
        checkCount = i + 1;
      }
    }
    // for (var j = 0; j < checkCount; j++) {
    //     checkValue[j].checked = true;
    //     checkStar[j].className = "rated";
    //     checkSmiley[j].style.display = "none";
    // }

    // for (var k = checkCount; k < checkValue.length; k++) {
    //     checkValue[k].checked = false;
    //     checkStar[k].className = "check"
    //     checkSmiley[k].style.display = "none";
    // }
    // if (checkCount == 1) {
    //     document.querySelectorAll(".smileybox i")[0].style.display = "block";
    // }
    // if (checkCount == 2) {
    //     document.querySelectorAll(".smileybox i")[1].style.display = "block";
    // }
    // if (checkCount == 3) {
    //     document.querySelectorAll(".smileybox i")[2].style.display = "block";
    // }
    // if (checkCount == 4) {
    //     document.querySelectorAll(".smileybox i")[3].style.display = "block";
    // }
    // if (checkCount == 5) {
    //     document.querySelectorAll(".smileybox i")[4].style.display = "block";
    // }
    this.currentRate = checkCount;
    //  console.log(checkCount);
  }
  submit() {
    if (this.Feedbackdescription != "") {
      var post_data = {
        trip_id: this.trip_id,
        message: this.Feedbackdescription,
        rate: this.currentRate,
        user_id:this.userId
      }
      
      var api_url = this._globalService.apiHost + '/PostFeedback';

      this._http.post(api_url, post_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.toastr.success('Feedback submitted successfully!');
            this._router.navigate(['/home']);
          }
          else if (res['status'] == 'error') {
            this.toastr.error(res['msg']);
          }
          else if (res['status'] == 'error_p') {
            this.toastr.error(res['msg']);
          }
          else {
            this.toastr.error('Error occured in sending feedback!');
          }
        });

        let requestData = {
          token: this.token_url,
          user_id : this.user_id,
          trip_id : this.trip_id,
        }

        var token_update = this._globalService.apiHost + '/CheckUpdateCloseTripToken';
        this._http.post(token_update, requestData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
          .subscribe(res => {
            if (res['status'] == 'ok') {
              this.isLoading = true;
              this.isTokenVerified = true;
              this.getTripById();
            }
          },
            error => {
              const err = error.error.msg;
            }); 

    }
    else {
      this.isFeedbackdescription = true;

    }
  }
}
