import {
  Component,
  OnInit,
  Inject,
  ElementRef,
  ViewChild
} from "@angular/core";
import { Observable, interval } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GlobalService } from "src/app/model/global.service";
import { UserService } from "src/app/model/user.service";
import { RequestDialog } from "../../dialogs/request-dialog/request-dialog.component";
import { UnplannedRequestDialogComponent } from "../../dialogs/unplanned-request-dialog/unplanned-request-dialog.component";
import async from "async";
import { map } from "rxjs/operators";
import * as moment from "moment/min/moment.min.js";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material";
import { SharedService } from "src/app/model/shared.service";
import { JwtHelperService } from "@auth0/angular-jwt";
import { ToastrService } from "ngx-toastr";
import {
  FormGroup,
  FormGroupDirective,
  FormBuilder,
  Validators,
  FormControl
} from "@angular/forms";
import { EmojiModule } from "@ctrl/ngx-emoji-mart/ngx-emoji";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import Swal from "sweetalert2";
import { PagesComponent } from "../pages.component";
import * as _ from "lodash";
import { VerifyReceiverOtpDialog } from "src/app/dialogs/verify-receiver-otp-dialog/verify-receiver-otp-dialog.component";
import { rootRenderNodes } from "@angular/core/src/view";
declare var $: any;

@Component({
  selector: "app-tripdetails",
  templateUrl: "./tripdetails.component.html",
  styleUrls: ["./tripdetails.component.css"]
})
export class TripdetailsComponent implements OnInit {
  public favactive: boolean = false;
  public favdeactive: boolean = true;
  public planned: boolean = false;
  public isLoading: boolean = true;
  public isMainLoading: boolean = true;
  public showPagination: boolean = true;
  public pageFromNotification: boolean = false;
  public is_ternster: boolean = false;
  public is_requestor: boolean = false;
  public isCancelledBtnEnabled: boolean = false;
  public showCloseButtonEnabled: boolean = false;
  public showCloseButton: boolean = false;
  public showIsDeliverButton: boolean = false;

  public is_new: boolean = false;

  public perks: any = [];
  public shipment_data_lists: any = [];
  public page = 1;
  public userId: number;
  public jwtHelper: JwtHelperService = new JwtHelperService();

  public allTrips: any = [];
  public token_object: any = "";

  public trip_id: any = "";
  public user_id: any = "";
  public trip_type: any = "";
  public indexval: any = "";
  public search_param: any = {};
  public trip_location: any = "";
  public request_package_id: any;
  public notification_id: any = "";
  public anyTime = true;
  public reply_profile_picture: any = "./assets/images/profile.webp";
  public fromDate: any = "";
  public toDate: any = "";
  public search_param_data: any = {};
  public selectedMode: any = 6;
  public mode_lists: any = [];
  public departure: any = "";
  public destination: any = "";
  public isAnywhereEnabled: boolean = false;
  public isAnywhereShow: boolean = false;
  public resetFilterShow: boolean = false;
  public selectedDuration: any = "60";
  public selectedLanguage: any = "";
  public selectedType: any = "";
  public confirm_trip = false;
  public isPayment = false;

  public requestStatus = "Send Request";
  public isButtonsEnabled: boolean = true;

  public comments_lists: any = [];
  public like_comments: any = [];
  public comment_form: FormGroup;
  public reply_comment_form: FormGroup;
  public showComments: boolean = false;
  public isFromMyTrip: boolean = false;

  public alert_text: any = "You want to accept this request?";
  public alert_type: any = "success";

  public current_profile_picture: any = "";
  public like_comment_lists: any = [];

  handler: any;

  public durations = [
    { value: "7", name: "1 Week" },
    // { value: "15", name: "15 Days" },
    { value: "30", name: "30 Days" }
    // { value: "60", name: "60 Days" }
  ];
  public _hours: any = "";
  public _minutes: any = "";
  public _seconds: any = "";
  public _diff: any = "";
  public selectedPaymentDuration: any = "";
  public selectedTrip: any = [];
  public isValidPayment: boolean = true;

  public show_dialog: boolean = false;
  public show_dialog1: boolean = false;
  selectedEmoji: any;
  selectedReplyEmoji: any;
  public emoji: any = [];
  public openPopup: Function;
  public comment_msg: any = "";
  public reply_comment_msg: any = "";

  public tripId: number;
  public unplanned_req_from_date: any = "";
  public unplanned_req_to_date: any = "";
  public unplanned_req_description: any = "";
  public trip_from_date: boolean = false;
  public othermodes: boolean = false;

  public user_details: any;

  public isCancelTripBtnEnabled: boolean = false;

  public groupBy(
    dataToGroupOn,
    fieldNameToGroupOn,
    fieldNameForGroupName,
    fieldNameForChildren
  ) {
    var result = _.chain(dataToGroupOn)
      .groupBy(fieldNameToGroupOn)
      .toPairs()
      .map(function (currentItem) {
        return _.zipObject(
          [fieldNameForGroupName, fieldNameForChildren],
          currentItem
        );
      })
      .value();
    return result;
  }

  constructor(
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    private route: ActivatedRoute,
    public router: Router,
    public dialog: MatDialog,
    private sharedService: SharedService,
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    public pagesComponent: PagesComponent
  ) {
    this.comment_form = this._formBuilder.group({
      // comment_msg: ['', Validators.compose([Validators.required])]
      comment_msg: "",
      selectedEmoji: ""
    });

    this.reply_comment_form = this._formBuilder.group({
      // reply_comment_msg: ['', Validators.compose([Validators.required])]
      reply_comment_msg: ""
    });
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.token_object = this.jwtHelper.decodeToken(
      localStorage.getItem("frontend-token")
    );
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit("page_identification", page_param);
    this.userId = this.token_object.id;
    this.getAllPerks();
    this.getUserProfileData();

    var start = moment().format("YYYY-MM-DD");
    var end = moment()
      .add(60, "days")
      .format("YYYY-MM-DD");

    this.search_param_data = {
      mode: "",
      departure: "",
      destination: "",
      isAnywhere: true,
      start: start,
      end: end,
      planned: false,
      selectedDuration: "0",
      type: "",
      language: "",
      confirmed_types: false,
      id_verified: false,
      social_verified: false,
      any_time: true,
      anyTime: true,
      othermodes: false
    };

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

    var api_url = this._globalService.apiHost + "/GetUserById?user_id=" + this.token_object.id;
    this._http
      .get(api_url, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(res => {
        if (res["status"] == "ok") {
          var user = res["user"];
          this.current_profile_picture =
            this._globalService.imageURL +
            "/static/profile_images/" +
            user.Profile.profile_picture;
        }
      });

    this.sharedService._tripSearchData.subscribe(tripSearchData => {
      if (tripSearchData) {
        console.log("checking the trip search data ...", tripSearchData);
        this.setTripData(tripSearchData);
      } else {
        let tripSearchData = JSON.parse(localStorage.getItem("trip_search_data"));
        this.setTripData(tripSearchData);

      }
    });   

    var root = this;

      $(document).mouseup(function (e){
        var container = $(".emojimart");  
        var emojiButton = $('.emoji');
        if (!container.is(e.target) && container.has(e.target).length === 0 && 
        !emojiButton.is(e.target) && emojiButton.has(e.target).length === 0){      
          container.hide();
          root.show_dialog = false;
        }
        
      }); 
    
  }

  setTripData(tripSearchData) {
    this.trip_id = tripSearchData.trip_id;
    this.trip_type = tripSearchData.trip_type;
    // this.user_id = tripSearchData.user_id;
    this.indexval = tripSearchData.indexval ? tripSearchData.indexval : "";
    this.search_param = tripSearchData.search_param_data
      ? tripSearchData.search_param_data
      : "";
    this.trip_location = tripSearchData.location;
    this.request_package_id = tripSearchData.request_id;
    this.selectedMode = tripSearchData.search_param_data.mode;
    this.isAnywhereEnabled = tripSearchData.search_param_data.isAnywhere;
    this.selectedDuration = tripSearchData.selectedDuration;
    // if(this.token_object.id != this.user_id) {
    //   this.isButtonsEnabled = true;
    // }
    this.search_param_data = tripSearchData.search_param_data;
    this.search_param_data.mode = tripSearchData.search_param_data.mode;
    this.search_param_data.selectedDuration =
      tripSearchData.search_param_data.selectedDuration;
    this.search_param_data.anyTime = tripSearchData.search_param_data.anyTime;
    this.search_param_data.any_time =
      tripSearchData.search_param_data.any_time;
    this.fromDate = tripSearchData.search_param_data.start;
    this.toDate = tripSearchData.search_param_data.end;
    this.planned = tripSearchData.search_param_data.planned;

    this.departure = tripSearchData.departure;
    this.destination = tripSearchData.destination;
    this.trip_from_date = tripSearchData.search_param_data.trip_from_date;

    if (
      this.trip_location == "myTrip" ||
      this.trip_location == "incomingTrip"
    ) {
      this.isButtonsEnabled = false;
      this.showCloseButtonEnabled = true;
    }

    if (this.trip_location == "notification") {
      this.notification_id = tripSearchData.notification_id;
      this.showCloseButtonEnabled = false;
    }
    this.page = this.indexval;
    this.isMainLoading = false;

    this.initialProcess();
  }


  toggle() {    
    this.show_dialog = !this.show_dialog;
    console.log("show_dialog", this.show_dialog);
  }

  showEmoji() {
    this.show_dialog1 = !this.show_dialog1;
  }

  addEmoji($event) {
    this.selectedEmoji = $event.emoji.native;
    this.comment_msg = this.comment_msg + "" + this.selectedEmoji;
  }

  addEmoji1($event) {
    this.selectedReplyEmoji = $event.emoji.native;
    this.reply_comment_msg =
      this.reply_comment_msg + "" + this.selectedReplyEmoji;
  }

  //   setPopupAction(fn: any) {
  //     this.openPopup = fn;
  // }

  public setTimer() {
    if (this.selectedPaymentDuration) {
      interval(1000)
        .pipe(
          map(x => {
            var now = moment(new Date()).format("DD/MM/YYYY HH:mm:ss");
            var then = this.selectedPaymentDuration;

            this._diff = moment(then, "DD/MM/YYYY HH:mm:ss").diff(
              moment(now, "DD/MM/YYYY HH:mm:ss")
            );
          })
        )
        .subscribe(x => {
          this._hours = Math.floor((this._diff / (1000 * 60 * 60)) % 48);
          this._minutes = Math.floor((this._diff / 1000 / 60) % 60);
          this._seconds = Math.floor((this._diff / 1000) % 60);
          if (this._hours <= 0 && this._minutes <= 0 && this._seconds <= 0) {
            this.isValidPayment = false;
          }
        });
    }
  }

  public getIsDisConnected(tripId, fromUserId, touserId, userId, trip_unplanned_days, created_from_date, created_to_date) {
    let requestData = {
      user_id: userId,
      from_user_id: fromUserId,
      to_user_id: touserId,
      trip_id: tripId,
      trip_unplanned_days: trip_unplanned_days,
      created_from_date: created_from_date,
      created_to_date: created_to_date,
    };
    var api_url = this._globalService.apiHost + "/GetIsDisConnected";
    this._http
      .post(api_url, requestData, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(
        res => {
          if (res["status"] == "ok") {
            // this.requestStatus = 'Send Request';
          }
        },
        error => {
          const err = error.error.msg;
        }
      );
  }

  public initialProcess() {
    let likes_api_url =
      this._globalService.apiHost +
      "/GetLikedTripComments?tripId=" +
      this.trip_id;
    this._http
      .get(likes_api_url, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(res => {
        if (res["status"] == "ok") {
          this.like_comment_lists = res["like_comment"];
          if (this.indexval && this.search_param) {
            this.getTripList();
            this.isFromMyTrip = false;
            this.pageFromNotification = false;
          } else {
            this.listAllComments();
            this.isFromMyTrip = true;
            if (this.trip_location == "notification") {
              this.getTripByNotification();
              this.pageFromNotification = true;
            } else {
              this.getTripById();
              // if (this.trip_type != 'companion') {
              // this.getAllRequestorDataByTrip();
              // }
            }
          }
        }
      });
  }

  public onSelect(selected_one, trip_id: number) {
    this.favactive = selected_one == "favactive" ? true : false;
    this.favdeactive = selected_one == "favdeactive" ? true : false;
    if (selected_one == "favactive") {
      this.addToFavorites(trip_id);
    } else {
      this.removeFromFavorites(trip_id);
    }
  }

  public onPageChanged(event) {
    this.page = event;
    var root = this;
    async.forEach(this.selectedTrip, function (trip) {
      if (trip.index == event) {
        // root.selectedPaymentDuration = trip.selectedPaymentDuration;
        // root.departure = trip.departure;
        // root.destination = trip.destination;
        // root.setTimer();

        root.getTripList();
        
        // root.trip_id = trip.trip_id;
        // root.listAllComments();
        // root.getTripById();
      }
    });
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
        }
      });
  }

  getCommentLists(comment_list) {
    var lists = comment_list.comments;
    var root = this;
    this.comments_lists = [];

    async.forEach(lists, function (list) {
      let userImage = "./assets/images/profile.webp";

      if (list.User.Profile.profile_picture) {
        userImage =
          root._globalService.imageURL +
          "/static/profile_images/" +
          list.User.Profile.profile_picture;
      }

      var reply_msgs = [];

      async.forEach(list.reply_datas, function (rdata) {
        let replyUserImage = "./assets/images/profile.webp";

        if (rdata.User.Profile.profile_picture) {
          replyUserImage =
            root._globalService.imageURL +
            "/static/profile_images/" +
            rdata.User.Profile.profile_picture;
        }

        var reply_like_val = 0;

        async.forEach(root.like_comment_lists, function (clist) {
          if (clist.comment_id == rdata.id) {
            reply_like_val = clist.is_liked;
          }
        });

        reply_msgs.push({
          id: rdata.id,
          trip_id: rdata.trip_id,
          user_id: rdata.user_id,
          trip_user_id: comment_list.trip.user_id,
          message: rdata.comment,
          user_name: rdata.User.name,
          profile: replyUserImage,
          is_liked: reply_like_val,
          time: moment(new Date(rdata.created_at)).fromNow()
        });
      });

      // let is_liked = 0;
      // if (
      //   list.trip_id == root.trip_id &&
      //   list.user_id == root.token_object.id
      // ) {
      //   is_liked = list.is_liked;
      // } else if (
      //   list.trip_id == root.trip_id &&
      //   list.user_id != root.token_object.id
      // ) {
      //   is_liked = 0;
      // }

      var like_val = 0;

      async.forEach(root.like_comment_lists, function (clist) {
        if (clist.comment_id == list.id) {
          like_val = clist.is_liked;
        }
      });

      root.comments_lists.push({
        id: list.id,
        trip_id: list.trip_id,
        user_id: list.user_id,
        trip_user_id: comment_list.trip.user_id,
        message: list.comment,
        user_name: list.User.name,
        profile: userImage,
        reply_msgs: reply_msgs,
        is_liked: like_val,
        time: moment(new Date(list.created_at)).fromNow()
      });
    });
    return this.comments_lists;
  }

  getCommentLikes(data) {
    var like_val = 0;

    async.forEach(this.like_comment_lists, function (list) {
      if (list.comment_id == data.id) {
        like_val = list.is_liked;
      }
    });
    return like_val;
  }

  //FindTrip to Tripdetails
  getTripList() {
    this.isLoading = true;
    if (this.search_param) {
      this.allTrips = [];
      this.showPagination = true;
      var api_url_trips = this._globalService.apiHost + "/GetAllTripsBySearch";
      var param_data = this.search_param;
      this.selectedMode = param_data.mode.toString();
      if (this.selectedMode == '3' || this.selectedMode == '5' || this.selectedMode == '6') {
        this.othermodes = false;
      }
      else {
        this.othermodes = true;
      }
      // this.departure = param_data.departure;
      // this.destination = param_data.destination;
      this.selectedDuration = param_data.selectedDuration;
      this.isAnywhereEnabled = param_data.isAnywhere;
      this._http
        .post(api_url_trips, param_data, {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(res => {
          if (res["status"] == "ok") {
            // var lists = res['trips'];
            var lists = res["result_lists"];
            var currency_list = res["currency_result"][0];
            this.isLoading = false;
            var root = this;
            let tripLists = [];
            root.selectedTrip = [];
            let i = 1;

            async.forEach(lists, function (list) {
              let srcMode = "../../../assets/images/" + list.trip.image;
              let userImage = "";
              let is_ternster = false;
              let is_requestor = false;

              if (list.trip.fav_user_id && list.trip.fav_trip_id) {
                root.favactive = true;
                root.favdeactive = false;
              } else {
                root.favactive = false;
                root.favdeactive = true;
              }

              var duration = "";
              var isCancelTheTrip = false;

              if (list.trip.user_id == root.token_object.id) {
                is_ternster = true;
              } else {
                is_requestor = true;
              }

              if (
                ((list.trip.type == "courier" ||
                  list.trip.type == "assistance") &&
                  list.trip.ivt_status == "paid") ||
                (list.trip.type == "companion" &&
                  list.trip.ivt_status == "accepted")
              ) {
                isCancelTheTrip = true;
              }

              if (
                list.trip.invite_updated_at &&
                list.trip.user_id != root.userId
              ) {
                var now = moment(new Date()).format("DD/MM/YYYY HH:mm:ss");
                var then = moment(list.trip.invite_updated_at)
                  .add(48, "hours")
                  .format("DD/MM/YYYY HH:mm:ss");

                var ms = moment(then, "DD/MM/YYYY HH:mm:ss").diff(
                  moment(now, "DD/MM/YYYY HH:mm:ss")
                );

                // console.log("then", then);
                // console.log("invite_updated_at",  moment(list.trip.invite_updated_at).format('DD/MM/YYYY HH:mm:ss'));

                // var d = moment.duration(ms);
                // var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
                // var splitted_val = s.split(':');
                // duration = splitted_val[0] + ' Hours ' + splitted_val[1] + ' Minutes ' + splitted_val[2] + ' Seconds ';
                // var math = Math.floor((ms / 1000) % 60);
                if (root.trip_id == list.trip.trip_id) {
                  root.selectedPaymentDuration = then;
                  root.setTimer();

                  var dup_unplan_days = list.trip.trip_unplanned_days - 1;
                  var unplanned_created_date = moment(list.trip.created_at).add(dup_unplan_days, "days").format("DD/MM/YYYY HH:mm:ss");
                  var unplanned_created_to_date = moment(list.trip.created_at).add(dup_unplan_days, "days").format("DD/MM/YYYY HH:mm:ss");
                  console.log("unplanned_created_to_date", list.trip.created_at, unplanned_created_to_date)

                  if (now == then && list.trip.type != "companion") {
                    // console.log("dsfsddsfsadf", now, then);
                    root.getIsDisConnected(
                      list.trip.trip_id,
                      list.trip.from_user_id,
                      list.trip.to_user_id,
                      root.userId,
                      parseInt(list.trip.trip_unplanned_days),
                      unplanned_created_date,
                      unplanned_created_to_date
                    );
                  }
                }
              }
              root.selectedTrip.push({
                trip_id: list.trip.trip_id,
                selectedPaymentDuration: root.selectedPaymentDuration,
                departure: list.trip.departure,
                destination: list.trip.destination,
                index: i++
              });

              root.is_new = root._globalService.checkIsNewTrip(
                list.trip.created_at
              );

              let start_month = moment(list.trip.from_date).format("MMMM");
              let start_date = moment(list.trip.from_date).format("DD");

              let end_month = moment(list.trip.to_date).format("MMMM");
              let end_date = moment(list.trip.to_date).format("DD");
              let end_year = moment(list.trip.to_date).format("YYYY");

              var close_date = moment(new Date()).diff(
                list.trip.to_date,
                "days"
              );
              root.showCloseButton = false;
              if (close_date >= 0 && close_date <= 7) {
                console.log("inside close_date", close_date);
                root.showCloseButton = true;
              }

              var deliver_date = moment(new Date()).diff(
                list.trip.from_date,
                "days"
              );
              root.showIsDeliverButton = false;
              if (deliver_date > 0) {
                root.showIsDeliverButton = true;
              }

              let start_suffixval = root._globalService.ordinal_suffix_of(
                parseInt(start_date)
              );
              let end_suffixval = root._globalService.ordinal_suffix_of(
                parseInt(end_date)
              );

              var language_arr = [];
              if (list.trip.languages) {                
                language_arr =root._globalService.getLanguages(list.trip.languages);
  
              }

              root.requestStatus = "Send Request";
              if (list.trip.ivt_from_user_id == root.userId) {
                if (list.trip.ivt_status != null) {
                  root.requestStatus = list.trip.ivt_status;
                }
              }

              root.requestStatus = "Send Request";
              if (list.trip.from_user_id == root.userId) {
                if (list.trip.status != null) {
                  root.requestStatus = list.trip.status;
                }
              }

              // if (list.trip.from_user_id == root.userId) {
              //   if (list.trip.status == 'disconnect') {
              //     root.requestStatus = 'Send Request';
              //   }
              // }

              if (list.trip.profile_picture) {
                if (list.trip.to_everyone) {
                  userImage =
                    root._globalService.imageURL +
                    "/static/profile_images/" +
                    list.trip.profile_picture;
                } else if (list.trip.only_to_connections) {
                  // if (root.requestStatus == 'accepted' || root.requestStatus == 'paid') {
                  if (list.trip.can_show_profile) {
                    userImage =
                      root._globalService.imageURL +
                      "/static/profile_images/" +
                      list.trip.profile_picture;
                  }
                } else if (!list.trip.profile_image_show) {
                  userImage =
                    root._globalService.imageURL +
                    "/static/profile_images/" +
                    list.trip.profile_picture;
                }
              }

              var perks_arr = "";
              if (list.trip.perks_id) {
                perks_arr = list.trip.perks_id.split(",").map(function (item) {
                  return parseInt(item.trim());
                });
              }

              var courierrate = 0;
              var assistancerate = 0;
              var basesymbol = currency_list.symbol;
              var currency_code = currency_list.code;

              var triprate = Math.round(list.trip.courier_budget * 100) / 100;
              var Assistancetriprate =
                Math.round(list.trip.assistance_budget * 100) / 100;

              var tripdefaultrate =
                Math.round(list.trip.currency_rate * 100) / 100;
              var baserate =
                Math.round(currency_list.currency_rate * 100) / 100;

              courierrate = (triprate / tripdefaultrate) * baserate;
              assistancerate =
                (Assistancetriprate / tripdefaultrate) * baserate;

              courierrate = Math.round(courierrate * 100) / 100;
              assistancerate = Math.round(assistancerate * 100) / 100;

              tripLists.push({
                id: list.trip.trip_id,
                perks_id: perks_arr,
                perks_any: list.trip.perks_id,
                trip_name: list.trip.trip_name,
                departure: list.trip.departure,
                destination: list.trip.destination,
                description: list.trip.description,
                type: list.trip.type,
                mode: srcMode,
                // currency_symbol: list.trip.currency_symbol,
                currency_symbol: basesymbol,
                // currency_code: list.trip.currency_code,
                currency_code: currency_code,

                weight: list.trip.weight,
                payment_mode: list.trip.payment_mode,
                from_date: list.trip.from_date,
                to_date: list.trip.to_date,
                start_month: start_month,
                start_date: start_date,
                end_month: end_month,
                end_date: end_date,
                end_year: end_year,
                start_suffixval: start_suffixval,
                end_suffixval: end_suffixval,
                user_id: list.trip.user_id,
                username: list.trip.first_name,
                trip_status: list.trip.trip_status,
                languages: list.trip.languages,
                language_arr: language_arr,
                profile_image: userImage,
                is_new: root.is_new,
                favactive: root.favactive,
                favdeactive: root.favdeactive,
                requestStatus: root.requestStatus,
                comments: root.getCommentLists(list),
                // likes: root.getCommentLikesLists(list),
                request_id: list.trip.request_id,
                request_type: list.trip.request_type,
                duration: duration,
                trip_plan: list.trip.trip_plan,
                unplanned_days: parseInt(list.trip.unplanned_days),
                // courier_budget: list.trip.courier_budget,
                // assistance_budget: list.trip.assistance_budget,
                courier_budget: courierrate,
                assistance_budget: assistancerate,
                balance_weight: list.trip.balance_weight,
                weight_unit: list.trip.weight_unit,
                from_user_id: list.trip.from_user_id,
                to_user_id: list.trip.to_user_id,
                isValidPayment: root.isValidPayment,
                isVerified: list.trip.isVerified,
                isKycVerified: list.trip.is_kyc_verified,
                isCancelTheTrip: isCancelTheTrip,
                is_ternster: is_ternster,
                is_requestor: is_requestor,
                can_show_msg:list.trip.can_show_msg
              });
            });

            this.allTrips = tripLists;
            console.log("tripDetails", this.allTrips);
          }
        });
    } else {
      this.isLoading = false;
    }
  }

  //Dashboard/Fav/PersonDetails/
  getTripById() {
    this.allTrips = [];
    this.isLoading = true;
    if (this.trip_id) {
      this.showPagination = false;
      let api_url =
        this._globalService.apiHost + "/GetTripById?tripId=" + this.trip_id;
      this._http
        .get(api_url, {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(res => {
          if (res["status"] == "ok") {
            var list = res["trips"];
            var currency_list = res["currency_result"][0];
            console.log("unplanned_list", list);
            this.isLoading = false;
            var root = this;
            let srcMode = "../../../assets/images/" + list.Travel_Mode.image;
            let userImage = "";

            var isCancelTheTrip = false;
            var is_ternster = false;
            var is_requestor = false;

            async.forEach(list.Invites, function (inv) {
              if (inv != null && inv.from_user_id == root.userId) {
                if (inv.status != null) {
                  root.requestStatus = inv.status;
                }
              }

              if (list.user_id == root.token_object.id) {
                is_ternster = true;
                root.is_ternster = true;
                isCancelTheTrip = true;
              } else {
                is_requestor = true;
                root.is_requestor = true;
                if (
                  ((inv.request_type == "courier" ||
                    inv.request_type == "assistance") &&
                    inv.status == "paid") ||
                  (inv.request_type == "companion" && inv.status == "accepted")
                ) {
                  isCancelTheTrip = true;
                }
              }
            });

            if (list.user_id == root.token_object.id) {
              is_ternster = true;
              root.is_ternster = true;
            } else {
              is_requestor = true;
              root.is_requestor = true;
            }

            if (list.Favorites.length != 0) {
              root.favactive = true;
              root.favdeactive = false;
            } else {
              root.favactive = false;
              root.favdeactive = true;
            }

            if (
              (this.trip_location == "myTrip" ||
                this.trip_location == "incomingTrip" ||
                this.trip_location == "persondetails") &&
              list.User.Profile.profile_picture
            ) {
              if (list.User.Profile.profile_picture) {
                userImage =
                  root._globalService.imageURL +
                  "/static/profile_images/" +
                  list.User.Profile.profile_picture;
              }
            } else {
              if (list.User.Profile.profile_picture) {
                if (list.User.Setting.to_everyone) {
                  userImage =
                    root._globalService.imageURL +
                    "/static/profile_images/" +
                    list.User.Profile.profile_picture;
                } else if (list.User.Setting.only_to_connections) {
                  if (
                    root.requestStatus == "accepted" ||
                    root.requestStatus == "paid" ||
                    root.requestStatus == "delivered" ||
                    root.requestStatus == "withdraw" ||
                    root.requestStatus == "cancelled"
                  ) {
                    userImage =
                      root._globalService.imageURL +
                      "/static/profile_images/" +
                      list.User.Profile.profile_picture;
                  }
                } else if (!list.User.Setting.profile_image_show) {
                  userImage =
                    root._globalService.imageURL +
                    "/static/profile_images/" +
                    list.User.Profile.profile_picture;
                }
              }
            }

            let request_id = list.request_id;
            let request_type = list.request_type;

            if (list.Invites.length) {
              request_id = list.Invites[0].request_id;
              request_type = list.Invites[0].request_type;

              if (
                list.Invites[0].updated_at &&
                list.Invites[0].status == "accepted" &&
                list.user_id != this.userId
              ) {
                this.isPayment = true;
                var now = moment(new Date()).format("DD/MM/YYYY HH:mm:ss");
                var then = moment(list.Invites[0].updated_at)
                  .add(48, "hours")
                  .format("DD/MM/YYYY HH:mm:ss");
                root.selectedPaymentDuration = then;
                root.setTimer();

                var dup_unplan_days = list.trip_unplanned_days - 1;
                var unplanned_created_date = moment(list.created_at).add(dup_unplan_days, "days").format("DD/MM/YYYY HH:mm:ss");
                var unplanned_created_to_date = moment(list.created_at).add(dup_unplan_days, "days").format("DD/MM/YYYY HH:mm:ss");
                console.log("unplanned_created_to_date", list.created_at, unplanned_created_to_date)

                if (now == then && list.trip.type != "companion") {
                  // console.log("dsfsddsfsadf", now, then);
                  root.getIsDisConnected(
                    list.id,
                    list.Invites[0].from_user_id,
                    list.Invites[0].to_user_id,
                    root.userId,
                    parseInt(list.trip_unplanned_days),
                    unplanned_created_date,
                    unplanned_created_to_date
                  );
                }
              }
            }

            let start_month = moment(list.from_date).format("MMMM");
            let start_date = moment(list.from_date).format("DD");

            let end_month = moment(list.to_date).format("MMMM");
            let end_date = moment(list.to_date).format("DD");
            let end_year = moment(list.to_date).format("YYYY");

            var close_date = moment(new Date()).diff(list.to_date, "days");
            root.showCloseButton = false;
            if (close_date >= 0 && close_date <= 7) {
              console.log("inside close_date", close_date);
              root.showCloseButton = true;
            }

            var deliver_date = moment(new Date()).diff(list.from_date, "days");
            root.showIsDeliverButton = false;
            if (deliver_date > 0) {
              root.showIsDeliverButton = true;
            }

            let start_suffixval = root._globalService.ordinal_suffix_of(
              parseInt(start_date)
            );
            let end_suffixval = root._globalService.ordinal_suffix_of(
              parseInt(end_date)
            );

            var language_arr = "";
            if (list.User.Profile.languages) {             
                language_arr =root._globalService.getLanguages(list.User.Profile.languages);
            }

            var perks_arr = list.perks_id.split(",").map(function (item) {
              return parseInt(item.trim());
            });

            let startDate = moment(list.from_date, "YYYY-MM-DD");
            let endDate = moment(list.to_date, "YYYY-MM-DD");

            //Difference in number of days
            this.selectedDuration = moment
              .duration(endDate.diff(startDate))
              .asDays()
              .toString();
            this.selectedMode = list.mode.toString();
            if (this.selectedMode == '3' || this.selectedMode == '5' || this.selectedMode == '6') {
              this.othermodes = false;
            }
            else {
              this.othermodes = true;
            }
            this.departure = list.departure;
            this.destination = list.destination;

            var courierrate = 0;
            var assistancerate = 0;

            if (!list.is_companion) {
              var basesymbol = currency_list.symbol;
              var currency_code = currency_list.code;

              var triprate = Math.round(list.courier_budget * 100) / 100;
              var Assistancetriprate =
                Math.round(list.assistance_budget * 100) / 100;              

              var baserate =
                Math.round(currency_list.currency_rate * 100) / 100;
                if(list.Currency){
                  var tripdefaultrate =
                  Math.round(list.Currency.currency_rate * 100) / 100;
  
                courierrate = (triprate / tripdefaultrate) * baserate;
                assistancerate =
                  (Assistancetriprate / tripdefaultrate) * baserate;
  
                courierrate = Math.round(courierrate * 100) / 100;
                assistancerate = Math.round(assistancerate * 100) / 100;
                }               
              
            }

            let trips = {
              id: list.id,
              trip_name: list.trip_name,
              perks_id: perks_arr,
              departure: list.departure,
              destination: list.destination,
              description: list.description,
              type: list.type,
              mode: srcMode,
              // currency_symbol: list.currency_symbol,
              // currency_code: list.currency_code,
              currency_symbol: basesymbol,
              currency_code: currency_code,
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
              isKycVerified: list.User.is_kyc_verified,
              languages: list.User.Profile.languages,
              language_arr: language_arr,
              profile_image: userImage,
              requestStatus: root.requestStatus,
              favactive: root.favactive,
              favdeactive: root.favdeactive,
              request_id: request_id,
              request_type: request_type,
              trip_plan: list.trip_plan,
              unplanned_days: parseInt(list.unplanned_days),
              // courier_budget: list.courier_budget,
              // assistance_budget: list.assistance_budget,
              courier_budget: courierrate,
              assistance_budget: assistancerate,
              weight_unit: list.weight_unit,
              balance_weight: list.balance_weight,
              trip_status: list.trip_status,
              isCancelTheTrip: isCancelTheTrip,
              is_ternster: is_ternster,
              is_requestor: is_requestor,
              isValidPayment: root.isValidPayment
              // from_user_id:list.trip.from_user_id,
              // to_user_id:list.trip.to_user_id
            };

            this.allTrips.push(trips);
            // this.getAllRequestorDataByTrip();
          }
        });
    } else {
      // console.log("there is no destination");
    }
  }

  //From Notification
  getTripByNotification() {
    this.allTrips = [];
    this.shipment_data_lists = [];
    this.isLoading = true;
    if (this.notification_id) {
      let api_url =
        this._globalService.apiHost +
        "/GetTripByNotification?notification_id=" +
        this.notification_id;
      this._http
        .get(api_url, {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(res => {
          if (res["status"] == "ok") {
            var list;
            list = res["tripnotification"];
            var currency_list = res["currency_result"][0];
            console.log("tripnotification_unplanned_list", list);
            var reqlist = res["requestdata"];
            this.isLoading = false;
            var root = this;
            let srcMode =
              "../../../assets/images/" + list.Trip.Travel_Mode.image;
            let userImage = "/assets/images/profile.webp";

            // if (list.Invite != null && list.Invite.from_user_id == root.userId) {
            //   if (list.Invite.status != null) {
            //     root.requestStatus = list.Invite.status;
            //   }
            // }

            if (list.Trip.user_id == this.token_object.id) {
              this.is_ternster = true;
              this.is_requestor = false;
              this.isCancelledBtnEnabled = true;
            } else {
              this.is_requestor = true;
              this.is_ternster = false;
              if (
                ((list.request_type == "courier" ||
                  list.request_type == "assistance") &&
                  list.request_status == "paid") ||
                (list.request_type == "companion" &&
                  list.request_status == "accepted")
              ) {
                this.isCancelledBtnEnabled = true;
              } else {
                this.isCancelledBtnEnabled = false;
              }
            }

            this.isPayment = false;
            root.requestStatus = "pending";
            if (list.Trip.user_id == root.userId) {
              this.isPayment = false;
              if (list.request_status != null) {
                root.requestStatus = list.request_status;
              }
            } else {
              if (
                list.request_status == "accepted" ||
                list.request_status == "paid" ||
                list.request_status == "delivered"
              ) {
                this.isPayment = true;
                root.requestStatus = list.request_status;
              } else if (list.request_status == "rejected") {
                root.requestStatus = list.request_status;
              }
            }

            if (list.Trip.user_id == root.userId) {
              if (list.Trip.User.Profile.profile_picture) {
                userImage =
                  root._globalService.imageURL +
                  "/static/profile_images/" +
                  list.Trip.User.Profile.profile_picture;
              }
            } else {
              if (list.Trip.User.Profile.profile_picture) {
                if (list.Trip.User.Setting.to_everyone) {
                  userImage =
                    root._globalService.imageURL +
                    "/static/profile_images/" +
                    list.Trip.User.Profile.profile_picture;
                } else if (list.Trip.User.Setting.only_to_connections) {
                  if (
                    root.requestStatus == "accepted" ||
                    root.requestStatus == "paid" ||
                    root.requestStatus == "delivered"
                  ) {
                    userImage =
                      root._globalService.imageURL +
                      "/static/profile_images/" +
                      list.Trip.User.Profile.profile_picture;
                  }
                } else if (!list.Trip.User.Setting.profile_image_show) {
                  userImage =
                    root._globalService.imageURL +
                    "/static/profile_images/" +
                    list.Trip.User.Profile.profile_picture;
                }
              }
            }

            if (list.request_status == "accepted") {
              var now = moment(new Date()).format("DD/MM/YYYY HH:mm:ss");
              var then = moment(list.updated_at)
                .add(48, "hours")
                .format("DD/MM/YYYY HH:mm:ss");
              root.selectedPaymentDuration = then;
              root.setTimer();

              var dup_unplan_days = list.Trip.trip_unplanned_days - 1;
              var unplanned_created_date = moment(list.Trip.created_at).add(dup_unplan_days, "days").format("DD/MM/YYYY HH:mm:ss");
              var unplanned_created_to_date = moment(list.Trip.created_at).add(dup_unplan_days, "days").format("DD/MM/YYYY HH:mm:ss");
              console.log("unplanned_created_to_date", list.Trip.created_at, unplanned_created_to_date)

              if (now == then && list.trip.type != "companion") {
                console.log("dsfsddsfsadf", now, then);
                root.getIsDisConnected(
                  list.Trip.id,
                  list.from_user_id,
                  list.to_user_id,
                  root.userId,
                  parseInt(list.Trip.trip_unplanned_days),
                  unplanned_created_date,
                  unplanned_created_to_date
                );
              }
            }

            root.is_new = root._globalService.checkIsNewTrip(
              list.Trip.created_at
            );

            let start_month = moment(list.Trip.from_date).format("MMMM");
            let start_date = moment(list.Trip.from_date).format("DD");

            let end_month = moment(list.Trip.to_date).format("MMMM");
            let end_date = moment(list.Trip.to_date).format("DD");
            let end_year = moment(list.Trip.to_date).format("YYYY");

            var close_date = moment(new Date()).diff(list.Trip.to_date, "days");
            root.showCloseButton = false;
            if (close_date >= 0 && close_date <= 7) {
              root.showCloseButton = true;
            }

            var deliver_date = moment(new Date()).diff(
              list.Trip.from_date,
              "days"
            );
            root.showIsDeliverButton = false;
            if (deliver_date > 0) {
              root.showIsDeliverButton = true;
            }

            let start_suffixval = root._globalService.ordinal_suffix_of(
              parseInt(start_date)
            );
            let end_suffixval = root._globalService.ordinal_suffix_of(
              parseInt(end_date)
            );

            var language_arr = "";
            if (list.User.Profile.languages) {              
              language_arr =root._globalService.getLanguages(list.User.Profile.languages);
            }

            var perks_arr = list.Trip.perks_id.split(",").map(function (item) {
              return parseInt(item.trim());
            });

            let startDate = moment(list.Trip.from_date, "YYYY-MM-DD");
            let endDate = moment(list.Trip.to_date, "YYYY-MM-DD");

            //Difference in number of days
            this.selectedDuration = moment
              .duration(endDate.diff(startDate))
              .asDays()
              .toString();
            this.selectedMode = list.Trip.mode.toString();
            if (this.selectedMode == '3' || this.selectedMode == '5' || this.selectedMode == '6') {
              this.othermodes = false;
            }
            else {
              this.othermodes = true;
            }
            this.departure = list.Trip.departure;
            this.destination = list.Trip.destination;
            this.trip_type = list.Trip.type;
            let package_status = "";
            let package_weight = "";
            let receiver_otp = "";
            if (reqlist) {
              this.unplanned_req_from_date = reqlist.from_date;
              this.unplanned_req_to_date = reqlist.to_date;
              this.unplanned_req_description = reqlist.description;
              package_status = reqlist.package_status;
              package_weight = reqlist.package_weight;
              receiver_otp = reqlist.receiver_otp;
            }

            var courierrate = 0;
            var assistancerate = 0;

            if (!list.Trip.is_companion) {
              var basesymbol = currency_list.symbol;
              var currency_code = currency_list.code;

              var triprate = Math.round(list.Trip.courier_budget * 100) / 100;
              var Assistancetriprate =
                Math.round(list.Trip.assistance_budget * 100) / 100;
               
                var baserate =
                Math.round(currency_list.currency_rate * 100) / 100;
              
                if(list.Trip.Currency){
                  var tripdefaultrate =
                  Math.round(list.Trip.Currency.currency_rate * 100) / 100;
               
  
                courierrate = (triprate / tripdefaultrate) * baserate;
                assistancerate =
                  (Assistancetriprate / tripdefaultrate) * baserate;
  
                courierrate = Math.round(courierrate * 100) / 100;
                assistancerate = Math.round(assistancerate * 100) / 100;
                }
                
            }
            let trips = {
              id: list.id,
              trip_name: list.Trip.trip_name,
              perks_id: perks_arr,
              perks_any: list.Trip.perks_id,
              departure: list.Trip.departure,
              destination: list.Trip.destination,
              description: list.Trip.description,
              type: list.Trip.type,
              mode: srcMode,
              // currency_symbol: list.Trip.currency_symbol,
              // currency_code: list.Trip.currency_code,

              currency_symbol: basesymbol,
              currency_code: currency_code,
              // courier_budget: list.Trip.courier_budget,
              // assistance_budget: list.Trip.assistance_budget,
              courier_budget: courierrate,
              assistance_budget: assistancerate,
              weight: list.Trip.weight,
              weight_unit: list.Trip.weight_unit,
              balance_weight: list.Trip.balance_weight,
              payment_mode: list.Trip.payment_mode,
              from_date: list.Trip.from_date,
              to_date: list.Trip.to_date,
              trip_status: list.Trip.trip_status,
              start_month: start_month,
              start_date: start_date,
              end_month: end_month,
              end_date: end_date,
              end_year: end_year,
              start_suffixval: start_suffixval,
              end_suffixval: end_suffixval,
              is_new: root.is_new,
              user_id: list.Trip.user_id,
              username: list.Trip.User.Profile.first_name,
              isKycVerified: list.Trip.User.is_kyc_verified,
              languages: list.User.Profile.languages,
              language_arr: language_arr,
              profile_image: userImage,
              requestStatus: root.requestStatus,
              notification_request_status: list.request_status,
              request_id: list.request_id,
              request_type: list.request_type,
              ivt_from_user_id: list.from_user_id,
              ivt_to_user_id: list.to_user_id,
              ivt_trip_id: list.trip_id,
              request_courier_weight: list.request_courier_weight,
              package_status: package_status,
              package_weight: package_weight,
              receiver_otp: receiver_otp,
              request_members: list.request_members,
              trip_plan: list.Trip.trip_plan,
              unplanned_days: parseInt(list.Trip.unplanned_days),
              unplanned_req_from_date: this.unplanned_req_from_date,
              unplanned_req_to_date: this.unplanned_req_to_date,
              unplanned_req_description: this.unplanned_req_description,
              from_user_id: list.from_user_id,
              to_user_id: list.to_user_id
            };

            // Shipment Requirement
            root.shipment_data_lists = this._globalService.getShipmentData(
              reqlist,
              root.trip_type,
              root.trip_location,
              root.token_object,
              list,
              "tripByNotification"
            );

            this.allTrips.push(trips);
            // console.log("alltrips", this.allTrips);
          }
        });
    } else {
      console.log("there is no destination");
    }
  }

  cancelTrip(tripData, type) {
    let trip_id = tripData.id;
    if (this.trip_location == "notification") {
      trip_id = tripData.ivt_trip_id;
    }
    var api_url =
      this._globalService.apiHost +
      "/GetCancellationMessage/" +
      trip_id +
      "/" +
      type;
    this._http
      .get(api_url, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(
        res => {
          Swal.fire({
            title:
              type == "ternster"
                ? "Cancelling the Trip"
                : "Cancelling the Request",
            html: res["message"],
            type: "warning",
            allowOutsideClick: false,
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No"
          }).then(result => {
            if (result.value) {
              api_url = this._globalService.apiHost + "/CreateCancellationTrip";
              this._http
                .post(
                  api_url,
                  { trip_id: trip_id, type: type },
                  {
                    headers: new HttpHeaders({
                      Authorization: this._userService.getToken()
                    })
                  }
                )
                .subscribe(
                  res => {
                    if (res["status"] == 200) {
                      this.toastr.success(res["message"]);
                      var api_url =
                        this._globalService.apiHost +
                        "/GetInvitesByCancelled?trip_id=" +
                        trip_id +
                        "&type=" +
                        type;
                      this._http
                        .get(api_url, {
                          headers: new HttpHeaders({
                            Authorization: this._userService.getToken()
                          })
                        })
                        .subscribe(res => {
                          this.initialProcess();
                          if (res["status"] == "ok") {
                            if (res["requested_user"]) {
                              let requested_user = res["requested_user"];
                              var root = this;
                              async.forEach(requested_user, function (list) {
                                if (type == "ternster") {
                                  var data = { to_user_id: list.from_user_id };
                                  root._globalService.socket.emit(
                                    "cancel_trip",
                                    data
                                  );
                                } else {
                                  var data = { to_user_id: list.to_user_id };
                                  root._globalService.socket.emit(
                                    "cancel_trip",
                                    data
                                  );
                                }
                              });
                            }
                            var api_url =
                              this._globalService.apiHost +
                              "/GetUserById?user_id=" +
                              this.userId;
                            this._http
                              .get(api_url, {
                                headers: new HttpHeaders({
                                  Authorization: this._userService.getToken()
                                })
                              })
                              .subscribe(res => {
                                if (res["status"] == "ok") {
                                  if (res["user"]) {
                                    let user = res["user"];
                                    if (user.is_blocked == 1) {
                                      this.pagesComponent.logout();
                                    }
                                  }
                                }
                              });
                          }
                        });
                    }
                  },
                  error => {
                    error.error.status == 404
                      ? Swal.fire({
                        title:
                          type == "ternster"
                            ? "Cancelling the Trip"
                            : "Cancelling the Request",
                        html: error.error["message"],
                        type: "warning",
                        allowOutsideClick: false
                      }).then(result => { })
                      : this.toastr.error(
                        "something went wrong please try again!"
                      );
                  }
                );
            }
          });
        },
        error => {
          error.error.status == 404
            ? Swal.fire({
              title:
                type == "ternster"
                  ? "Cancelling the Trip"
                  : "Cancelling the Request",
              html: error.error["message"],
              type: "warning",
              allowOutsideClick: false
            }).then(result => { })
            : this.toastr.error("something went wrong please try again!");
        }
      );
  }

  checkDelivered(trip) {
    let request_data = [];
    let deliver_data = {};
    request_data.push({
      id: trip.request_id,
      user_id: trip.ivt_from_user_id,
      receiver_otp: trip.receiver_otp,
      package_weight: trip.request_id
    });
    deliver_data = {
      from_user_id: trip.from_user_id,
      to_user_id: trip.to_user_id,
      trip_id: trip.ivt_trip_id,
      type: trip.type,
      request_data: request_data
    };
    const dialogRef = this.dialog.open(VerifyReceiverOtpDialog, {
      width: "600px",
      disableClose: true,
      data: deliver_data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == "verified") {
        var data = {
          to_user_id: trip.from_user_id,
          from_user_id: this.token_object.id
        };
        this._globalService.socket.emit("send_request", data);
        if (this.router.url == "/tripdetails") {
          window.location.reload();
          this.getTripByNotification();
        } else {
          this.router.navigate(["/tripdetails"]);
          this.getTripByNotification();
        }
      }
    });
  }

  getAllRequestorDataByTrip() {
    this.shipment_data_lists = [];
    let user_type = "ternster";
    if (this.is_requestor) {
      user_type = "requester";
    }
    var api_url =
      this._globalService.apiHost +
      "/GetAllRequestorDataByTrip?&type=" +
      this.trip_type +
      "&trip_id=" +
      this.trip_id +
      "&request_id=" +
      this.request_package_id +
      "&user_type=" +
      user_type +
      "&user_id=" +
      this.userId;
    this._http
      .get(api_url, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(res => {
        if (res["status"] == "ok") {
          var lists = res["result"];
          let list = [];
          var root = this;
          this.shipment_data_lists = this._globalService.getShipmentData(
            lists,
            root.trip_type,
            root.trip_location,
            root.token_object,
            list,
            "tripById"
          );
        }
      });
  }

  radioChange($event) {
    this.search_param_data.mode = ($event.value.toString());

    if (this.search_param_data.mode == '3' || this.search_param_data.mode == '5' || this.search_param_data.mode == '6') {
      this.othermodes = false;
    }
    else {
      this.othermodes = true;
    }
    this.search_param_data.othermodes = this.othermodes;
    console.log("this.search_param_data.mode",this.search_param_data.mode);
    this.sharedService.gotoFindTripPageWithTripData = {
      trip_search_param_data: this.search_param_data
    };
    this.router.navigate(["/findatrips"]);
  }

  customChange($event) {
    this.anyTime = false;
    this.search_param_data.any_time = false;
    this.search_param_data.selectedDuration = "custom";
    this.planned = true;
  }

  durationChange($event) {
    this.planned = false;
    // var start = moment().format('YYYY-MM-DD');
    // var end = moment().add($event.value, 'days').format('YYYY-MM-DD');
    // this.search_param_data.start = start;
    // this.search_param_data.end = end;

    // let startDate = moment(start, "YYYY-MM-DD");
    // let endDate = moment(end, "YYYY-MM-DD");

    // //Difference in number of days
    // this.selectedDuration = moment.duration(endDate.diff(startDate)).asDays().toString();
    var start = moment().format("YYYY-MM-DD");
    var end = moment()
      .add($event.value, "days")
      .format("YYYY-MM-DD");

    this.search_param_data.start = start;
    this.search_param_data.end = end;

    this.selectedDuration = $event.value;
    this.search_param_data.anyTime = false;
    this.search_param_data.any_time = false;
    this.search_param_data.selectedDuration = this.selectedDuration;
    this.sharedService.gotoFindTripPageWithTripData = {
      trip_search_param_data: this.search_param_data
    };
    this.router.navigate(["/findatrips"]);
  }

  changeAnyWhere(event) {
    this.search_param_data.isAnywhere = event.checked;
    this.sharedService.gotoFindTripPageWithTripData = {
      trip_search_param_data: this.search_param_data
    };
    this.router.navigate(["/findatrips"]);
  }

  dateChangeEvent($evt) {
    this.search_param_data.planned = true;
    this.trip_from_date = true;
    this.search_param_data.trip_from_date = true;
    this.anyTime = false;
    if ($evt.type == "from") {
      var startDate = moment($evt.evt.value).format("YYYY-MM-DD");
      var endDate = moment(this.search_param_data.end).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      var diff = moment(endDate).diff(startDate, "days");
      this.search_param_data.start = startDate;
      // this.search_param_data.end = endDate;

      this.search_param_data.any_time = false;
    } else if ($evt.type == "to") {
      var endDate = moment($evt.evt.value).format("YYYY-MM-DD");
      var startDate = moment(this.search_param_data.start).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      var diff = moment(endDate).diff(startDate, "days");
      this.search_param_data.end = endDate;
      this.search_param_data.any_time = false;
    }
    this.sharedService.gotoFindTripPageWithTripData = {
      trip_search_param_data: this.search_param_data
    };
    this.router.navigate(["/findatrips"]);
  }

  addToFavorites(trip_id: number) {
    var api_url =
      this._globalService.apiHost + "/AddToFavorites?tripId=" + trip_id;

    this._http
      .get(api_url, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(res => {
        if (res["status"] == "ok") {
          var lists = res["msg"];
          var item = this.allTrips.find(x => x.id == trip_id);
          if (item) {
            this.favactive = true;
            this.favdeactive = false;
            item.favactive = this.favactive;
            item.favdeactive = this.favdeactive;
          }
          // this.getFavorites(trip_id);

          // if (this.trip_location == "findTrip") {
          //   this.getTripList();
          // } else {
          //   this.getTripById();
          // }
          this.toastr.success("Trip added to favorites !");
        }
      });
  }

  removeFromFavorites(trip_id: number) {
    let api_url =
      this._globalService.apiHost +
      "/RemoveTripFromFavorites?trip_id=" +
      trip_id;

    this._http
      .get(api_url, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(res => {
        if (res["status"] == "ok") {
          var item = this.allTrips.find(x => x.id == trip_id);
          if (item) {
            this.favactive = false;
            this.favdeactive = true;
            item.favactive = this.favactive;
            item.favdeactive = this.favdeactive;
          }
          // if (this.trip_location == "findTrip") {
          //   this.getTripList();
          // } else {
          //   this.getTripById();
          // }
          this.toastr.success("Traveler removed from favorites !");
        }
      });
  }

  resetFilter(evt) {
    var start = moment().format("YYYY-MM-DD");
    var end = moment()
      .add(60, "days")
      .format("YYYY-MM-DD");
    // this.departure = '';
    // this.destination = '';

    this.selectedType = "";
    this.isAnywhereEnabled = true;
    // this.selectedMode = '';
    // this.selectedDuration = '0';
    this.selectedLanguage = "";
    this.confirm_trip = false;

    this.anyTime = true;
    this.search_param_data = {
      mode: "",
      departure: "",
      destination: "",
      isAnywhere: true,
      start: start,
      end: end,
      selectedDuration: "",
      type: "",
      language: "",
      confirmed_types: false,
      id_verified: false,
      social_verified: false,
      any_time: true,
      anyTime: true,
      isIdVerified: false,
      isSocialVerified: false,
      fromDate: "",
      toDate: "",
      trip_from_date: false
    };
    this.trip_from_date = false;
    this.sharedService.gotoFindTripPageWithTripData = {
      trip_search_param_data: this.search_param_data
    };
    this.router.navigate(["/findatrips"]);
  }

  public changeDepartureLocation(evt) {
    this.search_param_data.departure = evt;
    this.router.navigate(["/findatrips"]);
  }
  public changeDestinationLocation(evt) {
    this.search_param_data.destination = evt;
    this.router.navigate(["/findatrips"]);
  }
  sendRequest(trip) {
    // if(this.userProfile){
    if (trip.trip_plan == "planned") {
      if (trip.type == "courier" || trip.type == "assistance") {
        const dialogRef = this.dialog.open(RequestDialog, {
          width: "600px",
          disableClose: true,
          data: {
            type: trip.type,
            user_id: this.token_object.id,
            trip: trip
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.isLoading = true;
            // var request_ids = [];
            // var request_weight = 0;
            // var request_members = 0;
            // async.forEach(result, function (res) {
            //   request_ids.push(res.id);
            //   request_weight = request_weight + res.weight;
            //   request_members = request_members + res.members;
            // })
            this.requestStatus = "Pending";
            // this.tripId = trip.id;

            let requestData = {};

            // requestData={
            //   to_user_id: trip.user_id,
            //   trip_id: trip.id,
            //   status: 'pending',
            //   request_id: result.id,
            //   request_type: trip.type,
            //   // request_courier_weight:trip.weight
            //   request_courier_weight: result.package_weight,
            //   request_members: result.package_weight
            // }

            if (trip.type == "courier") {
              requestData = {
                to_user_id: trip.user_id,
                trip_id: trip.id,
                status: "pending",
                // request_id: request_ids.toString(),
                // request_courier_weight:request_weight.toString()
                request_id: result.id,
                request_type: trip.type,
                request_courier_weight: result.package_weight,
                service_log_id: trip.service_log_id,
                receiver_email: result.receiver_email_id
              };
            } else if (trip.type == "assistance") {
              requestData = {
                to_user_id: trip.user_id,
                from_user_id: this.token_object.id,
                trip_id: trip.id,
                status: "pending",
                request_id: result.id,
                request_type: trip.type,
                request_members: result.members,
                service_log_id: trip.service_log_id
              };
            }

            var api_url = this._globalService.apiHost + "/InvitesToTrip";
            this._http
              .post(api_url, requestData, {
                headers: new HttpHeaders({
                  Authorization: this._userService.getToken()
                })
              })
              .subscribe(
                res => {
                  if (res["status"] == "ok") {
                    this.isLoading = false;
                    if (this.trip_location == "findTrip") {
                      this.getTripList();
                    } else {
                      this.getTripById();
                    }
                    this.toastr.success(res["msg"]);
                    this._globalService.socket.emit(
                      "send_request",
                      requestData
                    );
                  }
                },
                error => {
                  this.isLoading = false;
                  const err = error.error.msg;
                }
              );
          }
        });
      } else {
        const dialogRef = this.dialog.open(CompanionMessageDialog, {
          width: "600px",
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(msg => {
          if (msg != "close") {
            Swal.fire({
              title: "Are you sure?",
              text: "You want to send the request for this trip?",
              showCancelButton: true,
              confirmButtonText: "Yes",
              cancelButtonText: "No"
            }).then(result => {
              if (result.value) {
                this.isLoading = true;
                this.requestStatus = "Pending";
                let requestData = {
                  to_user_id: trip.user_id,
                  from_user_id: this.token_object.id,
                  trip_id: trip.id,
                  status: "pending",
                  request_id: "",
                  request_type: trip.type
                };

                var api_url = this._globalService.apiHost + "/InvitesToTrip";
                this._http
                  .post(api_url, requestData, {
                    headers: new HttpHeaders({
                      Authorization: this._userService.getToken()
                    })
                  })
                  .subscribe(
                    res => {
                      if (res["status"] == "ok") {
                        this.isLoading = false;
                        if (this.trip_location == "findTrip") {
                          this.getTripList();
                        } else {
                          this.getTripById();
                        }
                        this.toastr.success(res["msg"]);
                        this._globalService.socket.emit(
                          "send_request",
                          requestData
                        );
                      }
                    },
                    error => {
                      this.isLoading = false;
                      const err = error.error.msg;
                    }
                  );
              }
            });
          }
        });
      }
    } else if (trip.trip_plan == "unplanned") {
      if (trip.type == "companion") {
        const dialogRef = this.dialog.open(UnplannedCompanion, {
          width: "600px",
          //height: '650px',
          disableClose: true,
          data: trip
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.isLoading = true;
            this.requestStatus = "Pending";
            this.tripId = trip.id;
            let requestData = {
              to_user_id: trip.user_id,
              from_user_id: this.token_object.id,
              trip_id: trip.id,
              status: "pending",
              request_id: result.id,
              request_type: trip.type
            };

            var api_url =
              this._globalService.apiHost + "/InvitesUnplannedToTrip";
            this._http
              .post(api_url, requestData, {
                headers: new HttpHeaders({
                  Authorization: this._userService.getToken()
                })
              })
              .subscribe(
                res => {
                  if (res["status"] == "ok") {
                    this.isLoading = false;
                    if (this.trip_location == "findTrip") {
                      this.getTripList();
                    } else {
                      this.getTripById();
                    }
                    this.toastr.success(res["msg"]);
                    this._globalService.socket.emit(
                      "send_request",
                      requestData
                    );
                  }
                },
                error => {
                  const err = error.error.msg;
                }
              );
          }
        });
      }
      if (trip.type == "courier" || trip.type == "assistance") {
        const dialogRef = this.dialog.open(UnplannedAssisCourier, {
          width: "600px",
          disableClose: true,
          data: {
            type: trip.type,
            user_id: this.token_object.id,
            trip: trip
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            if (trip.type == "courier" || trip.type == "assistance") {
              const dialogRef = this.dialog.open(
                UnplannedRequestDialogComponent,
                {
                  width: "600px",
                  disableClose: true,
                  data: {
                    type: trip.type,
                    user_id: this.token_object.id,
                    trip: trip,
                    req_date: result
                  }
                }
              );
              dialogRef.afterClosed().subscribe(result => {
                if (result) {
                  this.isLoading = true;
                  // var request_ids = [];
                  // var request_weight = 0;
                  // var request_members = 0;
                  // async.forEach(result, function (res) {
                  //   request_ids.push(res.id);
                  //   request_weight = request_weight + res.weight;
                  //   request_members = request_members +res.members;
                  // })
                  this.requestStatus = "Pending";
                  // this.tripId = trip.id;

                  this.requestStatus = "Pending";
                  this.tripId = trip.id;
                  let requestData = {};
                  if (trip.type == "courier") {
                    requestData = {
                      to_user_id: trip.user_id,
                      from_user_id: this.token_object.id,
                      trip_id: trip.id,
                      status: "pending",
                      // request_id: request_ids.toString(),
                      // request_courier_weight:request_weight.toString()
                      request_id: result.id,
                      request_type: trip.type,
                      request_courier_weight: result.package_weight,
                      from_date: moment(result.from_date).format("DD-MMM-YYYY"),
                      to_date: moment(result.to_date).format("DD-MMM-YYYY")
                    };
                  } else if (trip.type == "assistance") {
                    requestData = {
                      to_user_id: trip.user_id,
                      from_user_id: this.token_object.id,
                      trip_id: trip.id,
                      status: "pending",
                      request_id: result.id,
                      request_type: trip.type,
                      request_members: result.members,
                      from_date: moment(result.from_date).format("DD-MMM-YYYY"),
                      to_date: moment(result.to_date).format("DD-MMM-YYYY")
                    };
                  }
                  var api_url =
                    this._globalService.apiHost + "/InvitesUnplannedToTrip";
                  this._http
                    .post(api_url, requestData, {
                      headers: new HttpHeaders({
                        Authorization: this._userService.getToken()
                      })
                    })
                    .subscribe(
                      res => {
                        if (res["status"] == "ok") {
                          this.isLoading = false;
                          if (this.trip_location == "findTrip") {
                            this.getTripList();
                          } else {
                            this.getTripById();
                          }
                          this.toastr.success(res["msg"]);
                          this._globalService.socket.emit(
                            "send_request",
                            requestData
                          );
                        }
                      },
                      error => {
                        this.isLoading = false;
                        const err = error.error.msg;
                      }
                    );
                }
              });
            }
          }
        });
      }
      // }
      // else{
      //   this.toastr.error('Please complete your profile');
      // }
      // this.isLoading = true;
      // this.requestStatus = 'Pending';

      // let requestData = {
      //   to_user_id: trip.user_id,
      //   trip_id: trip.id,
      //   status: 'pending',
      // }

      // var api_url = this._globalService.apiHost + '/InvitesToTrip';
      // this._http.post(api_url, requestData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      //   .subscribe(res => {
      //     if (res['status'] == 'ok') {
      //       this.isLoading = false;
      //       this.getTripById();
      //       this.toastr.success(res['msg']);
      //       this._globalService.socket.emit('send_request', requestData);
      //     }
      //   },
      //     error => {
      //       const err = error.error.msg;
      //     });
    }
  }

  public openConfirmPayment(tripData, location) {
    let trip_id = tripData.id;
    if (location == "notificationpage") {
      trip_id = tripData.ivt_trip_id;
    }
    if (tripData.type == "courier") {
      var req_ids = tripData.request_id.split(",");
      var req_type = tripData.request_type;
      var apiUrl =
        this._globalService.apiHost +
        "/GetAllRequestorDataById?reqids=" +
        req_ids +
        "&reqtype=" +
        req_type;
      this._http
        .get(apiUrl, {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(res => {
          if (res["status"] == "ok") {
            var dataValue = {};

            var weight = 0;
            async.forEach(res["result"], function (data) {
              weight = weight + parseFloat(data.package_weight);
            });
            var courier_commission =
              res["admin_settings"][0].courier_commission;
            let commission =
              (parseFloat(tripData.courier_budget) / 100) *
              parseInt(courier_commission);
            commission = (Math.round(commission * 100) / 100) * weight;
            let totalPayment =
              parseFloat(tripData.courier_budget) * weight + commission;

            dataValue = {
              budget: tripData.courier_budget,
              weight: weight,
              // totalPayment: parseFloat(tripData.budget) * weight,
              totalPayment: totalPayment,
              commission: commission,
              currency_code: tripData.currency_code,
              type: tripData.type,
              trip_id: trip_id,
              currency_symbol: tripData.currency_symbol,
              trip_user_id: tripData.user_id,
              request_id: tripData.request_id,
              request_type: tripData.request_type
            };

            const dialogRef = this.dialog.open(ConfirmPaymentDialog, {
              width: "600px",
              disableClose: true,
              data: dataValue
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                this.checkHandler(result);
              }
            });
          }
        });
    } else {
      var req_ids = tripData.request_id.split(",");
      var req_type = tripData.request_type;
      var apiUrl =
        this._globalService.apiHost +
        "/GetAllRequestorDataById?reqids=" +
        req_ids +
        "&reqtype=" +
        req_type;
      this._http
        .get(apiUrl, {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(res => {
          if (res["status"] == "ok") {
            var assistance_commission =
              res["admin_settings"][0].assistance_commission;
            let commission =
              (parseFloat(tripData.assistance_budget) / 100) *
              parseInt(assistance_commission);
            commission = Math.round(commission * 100) / 100;
            let totalPayment =
              parseFloat(tripData.assistance_budget) + commission;

            var data = {
              budget: tripData.assistance_budget,
              commission: commission,
              totalPayment: totalPayment,
              currency_code: tripData.currency_code,
              type: tripData.type,
              trip_id: trip_id,
              currency_symbol: tripData.currency_symbol,
              trip_user_id: tripData.user_id,
              request_id: tripData.request_id,
              request_type: tripData.request_type,
              request_members: tripData.request_members
            };
            // this.checkHandler(data);
            const dialogRef = this.dialog.open(ConfirmPaymentDialog, {
              width: "600px",
              disableClose: true,
              data: data
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                this.checkHandler(result);
              }
            });
          }
        });
    }
  }

  public checkHandler(tripData) {
    var price = tripData.totalPayment;
    var currency_code = tripData.currency_code;
    this.handler = (<any>window).StripeCheckout.configure({
      key: "pk_test_Grslug7niERKURDBYGAImpqv00YTjikinb", //environment.stripeKey,
      image: "https://i.ibb.co/mc5zY5n/favicon.png",
      email: this.user_details.User.email,
      locale: "auto",
      token: token => {
        var apiUrl = this._globalService.apiHost + "/CreateStripePayment";
        if (tripData.request_type == "courier") {
          apiUrl =
            this._globalService.apiHost + "/CreateStripePaymentForCourier";
        }
        const data = {
          token: token,
          trip_id: tripData.trip_id,
          trip_user_id: tripData.trip_user_id,
          request_id: tripData.request_id,
          request_type: tripData.request_type,
          budget: tripData.budget,
          total_weight: tripData.weight,
          ternster_commission: tripData.commission,
          total_payment: tripData.totalPayment,
          currency_code: tripData.currency_code,
          currency_symbol: tripData.currency_symbol,
          request_members: tripData.request_members
        };

        this._http
          .post(apiUrl, data, {
            headers: new HttpHeaders({
              Authorization: this._userService.getToken()
            })
          })
          .subscribe(res => {
            if (res["status"] == "ok") {
              this.toastr.success("Payment has been done successfully");
              var data = { to_user_id: tripData.trip_user_id };
              this._globalService.socket.emit("send_request", data);
              this.pagesComponent.getNotificationLists();
              this.initialProcess();
            } else if (res["status"] == "error") {
              this.toastr.error(res["error"]);
            }
          });
      }
    });

    this.handler.open({
      name: "Ternster",
      // excerpt: 'Deposit Funds to Account',
      amount: price * 100,
      currency: currency_code
    });
  }

  public listAllComments() {
    // let api_url_like = this._globalService.apiHost + "/GetLikedTripComments?tripId=" + this.trip_id;
    // this._http.get(api_url_like, { headers: new HttpHeaders({ Authorization: this._userService.getToken() }) })
    //   .subscribe(res => {
    //     if (res["status"] == "ok") {
    //       var like_c_list = res['like_comment'];
    //       var root = this;
    //       async.forEach(like_c_list, function (likes) {
    //         let is_liked = 0;
    //         if(likes.trip_id == root.trip_id && likes.user_id == root.token_object.id){
    //           is_liked = likes.is_liked;
    //         }
    //         root.like_comments.push({
    //           comment_id: likes.comment_id,
    //           user_id : likes.user_id,
    //           is_liked: is_liked,
    //         });
    //       });
    var api_url =
      this._globalService.apiHost +
      "/ListAllTripComments?tripId=" +
      this.trip_id;

    this._http
      .get(api_url, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(res => {
        if (res["status"] == "ok") {
          var lists = res["comments"];
          this.comments_lists = [];

          // for(var i=0; i<this.like_comments.length;i++){
          // async.forEach(lists, function (list) {
          var root = this;

          let likes_api_url =
            this._globalService.apiHost +
            "/GetLikedTripComments?tripId=" +
            this.trip_id;
          this._http
            .get(likes_api_url, {
              headers: new HttpHeaders({
                Authorization: this._userService.getToken()
              })
            })
            .subscribe(res => {
              if (res["status"] == "ok") {
                this.like_comment_lists = res["like_comment"];

                async.forEach(lists, function (list) {
                  // for(var j=0; j<lists.length;j++){
                  //   let list = lists[j];
                  let userImage = "./assets/images/profile.webp";

                  if (list.User.Profile.profile_picture) {
                    userImage =
                      root._globalService.imageURL +
                      "/static/profile_images/" +
                      list.User.Profile.profile_picture;
                  }

                  var reply_msgs = [];
                  async.forEach(list.reply_datas, function (rdata) {
                    let replyUserImage = "./assets/images/profile.webp";

                    if (rdata.User.Profile.profile_picture) {
                      replyUserImage =
                        root._globalService.imageURL +
                        "/static/profile_images/" +
                        rdata.User.Profile.profile_picture;
                    }

                    reply_msgs.push({
                      id: rdata.id,
                      trip_id: rdata.trip_id,
                      user_id: rdata.user_id,
                      message: rdata.comment,
                      user_name: rdata.User.name,
                      profile: replyUserImage,
                      is_liked: root.getCommentLikes(rdata),
                      time: moment(new Date(rdata.created_at)).fromNow()
                    });
                  });
                  // var liked = 0;

                  // if(root.token_object.id == root.like_comments[i].user_id && list.id == root.like_comments[i].comment_id){
                  //   liked = root.like_comments[i].is_liked;
                  //   // console.log("like_user", root.like_comments[i]);
                  //   // console.log("comment_user", list);
                  // }


                  root.comments_lists.push({
                    id: list.id,
                    // comment_id: root.like_comments[i].comment_id,
                    trip_id: list.trip_id,
                    user_id: list.user_id,
                    // comment_user_id: root.like_comments[i].user_id,
                    message: list.comment,
                    user_name: list.User.name,
                    profile: userImage,
                    reply_msgs: reply_msgs,
                    is_liked: root.getCommentLikes(list),
                    // is_liked: liked,
                    trip_user_id: list.Trips.user_id,
                    // liked:root.like_comments[i].is_liked,
                    time: moment(new Date(list.created_at)).fromNow()
                  });
                });
                // }

                async.forEach(this.allTrips, function (trip) {
                  if (trip.id == root.trip_id) {
                    trip.comments = root.comments_lists;
                  }
                });
              }
            });
        }
      });
    //   }
    // });
  }

  public onKeydown(e, comment_form, tripsData, type) {
    // $("#comment_area").on('keydown', function(e){//textarea keydown events
    if (e.key == "Enter") {
      if (e.shiftKey) {
        //jump new line
        // $('#comment_area').val($('#comment_area').val() + "\n");// use the right id here
        // return true;
      } // do sth,like send message or else
      else {
        if (type == "send") {
          this.sendComment(comment_form, tripsData);
          e.preventDefault(); //cancell the deafult events
        } else {
          this.sendReplyComment(comment_form, tripsData);
          e.preventDefault(); //cancell the deafult events
        }
      }
    }
    // })
  }

  public sendComment(comment_msg, tripData) {   
    if (comment_msg != "") {
      let comments = comment_msg;
      let trip_id = tripData.id;
      // if (this.trip_location != "findTrip" ) {
      //   comments = comment_msg.value.comment_msg;
      // }
      if (this.trip_location == "notification") {
        trip_id = tripData.ivt_trip_id;
      }
      // if (comment_msg.valid) {
      var api_url = this._globalService.apiHost + "/PostTripComments";

      var comment_data = {
        message: comments,
        trip_id: trip_id,
        trip_user_id: tripData.user_id,
        from_user_id: this.token_object.id
      };

      this._http
        .post(api_url, comment_data, {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(res => {
          if (res["status"] == "ok") {
            this._globalService.socket.emit(
              "alert_comment_notification",
              comment_data
            );
            this.comment_msg = "";
            if (
              this.trip_location == "myTrip" ||
              this.trip_location == "notification"
            ) {
              this.comment_form.reset();
            }
            this.listAllComments();
          }
        });
      // }
    }
  }

  sendReplyComment(reply_comment_msg, list) {
    if (reply_comment_msg != "") {
      // if (formData.valid) {
      var api_url = this._globalService.apiHost + "/PostTripReplyComments";

      let comments = reply_comment_msg;
      let trip_id = list.id;
      if (this.trip_location != "findTrip") {
        comments = reply_comment_msg.value.reply_comment_msg;
      }
      // if (this.trip_location == 'notification') {
      //   trip_id = list.ivt_trip_id;
      // }

      var comment_data = {
        message: comments,
        trip_id: list.trip_id,
        reply_msg_id: list.id,
        trip_user_id: list.trip_user_id,
        from_user_id: this.token_object.id
      };

      this._http
        .post(api_url, comment_data, {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(res => {
          if (res["status"] == "ok") {
            this.reply_comment_msg = "";
            $(document).ready(function () {
              $(".reply-list").css("display", "none");
            });
            this._globalService.socket.emit(
              "alert_comment_notification",
              comment_data
            );
            // if (this.isFromMyTrip) {
            this.listAllComments();
            this.reply_comment_form.reset();
            // } else {
            // this.getTripList();
            // }
          }
        });
      // }
    }
  }

  replyComment(list) {
    this.reply_profile_picture = this.current_profile_picture;
    $(document).ready(function () {
      // $('.reply-list').css('display', 'none');
      $("#reply-list-" + list.id).css("display", "block");
    });
  }

  // clickLike(id: number, is_like: number, trip) {
  //   console.log("id number", id, is_like, trip);
  //   var api_url =
  //     this._globalService.apiHost +
  //     "/LikeTripComments?id=" +
  //     id +
  //     "&is_like=" +
  //     is_like +
  //     "&trip_id=" +
  //     trip.trip_id +
  //     "&user_id=" +
  //     trip.trip_user_id;

  //   this._http
  //     .get(api_url, {
  //       headers: new HttpHeaders({
  //         Authorization: this._userService.getToken()
  //       })
  //     })
  //     .subscribe(res => {
  //       if (res["status"] == "ok") {
  //         // this._globalService.socket.emit("alert_comment_notification", trip);
  //         if (this.isFromMyTrip) {
  //           this.listAllComments();
  //         } else {
  //           this.getTripList();
  //         }
  //       }
  //     });
  // }

  // clickLike(id: number, is_like: number, trip) {
  //   console.log("id number", id, is_like, trip);

  //   var comment_data = {
  //     trip_id: trip.trip_id,
  //     comment_id: id,
  //     user_id: this.token_object.id,
  //     is_liked: is_like,
  //   };
  //   // console.log("comment_data", comment_data);
  //   var api_url = this._globalService.apiHost + "/LikeTripComments";

  //   this._http.post(api_url, comment_data, { headers: new HttpHeaders({ Authorization: this._userService.getToken() }) })
  //     .subscribe(res => {
  //       if (res["status"] == "ok") {
  //         if (this.isFromMyTrip) {
  //           this.listAllComments();
  //         } else {
  //           this.getTripList();
  //         }
  //       }
  //     });
  // }

  clickLike(id: number, is_like: number, trip) {
    var comment_id = id;
    var api_url =
      this._globalService.apiHost +
      "/LikeTripComments?comment_id=" +
      id +
      "&is_liked=" +
      is_like +
      "&trip_id=" +
      trip.trip_id +
      "&user_id=" +
      this.token_object.id;
    this._http
      .get(api_url, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(res => {
        if (res["status"] == "ok") {
          // this._globalService.socket.emit("alert_comment_notification", trip);
          var root = this;

          if (this.isFromMyTrip) {
            async.forEach(root.comments_lists, function (list) {
              if (list.id == comment_id) {
                if (list.is_liked == 1) {
                  list.is_liked = 0;
                } else {
                  list.is_liked = 1;
                }
              }
            });
          } else {
            async.forEach(this.allTrips, function (trip) {
              async.forEach(trip.comments, function (cmnt) {
                if (cmnt.id == comment_id) {
                  if (cmnt.is_liked == 1) {
                    cmnt.is_liked = 0;
                  } else {
                    cmnt.is_liked = 1;
                  }
                }
              });
            });
          }
        }
      });
  }

  clickLikeForReply(id: number, is_like: number, trip) {
    var comment_id = id;
    var api_url =
      this._globalService.apiHost +
      "/ReplyLikeTripComments?comment_id=" +
      id +
      "&is_liked=" +
      is_like +
      "&trip_id=" +
      trip.trip_id +
      "&user_id=" +
      this.token_object.id;

    this._http
      .get(api_url, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(res => {
        if (res["status"] == "ok") {
          var root = this;
          if (this.isFromMyTrip) {
            async.forEach(root.comments_lists, function (list) {
              if (list.id == comment_id) {
                if (list.is_liked == 1) {
                  list.is_liked = 0;
                } else {
                  list.is_liked = 1;
                }
              }
            });
          } else {
            async.forEach(this.allTrips, function (trip) {
              async.forEach(trip.comments, function (cmnt) {
                async.forEach(cmnt.reply_msgs, function (rmsg) {
                  if (rmsg.id == comment_id) {
                    if (rmsg.is_liked == 1) {
                      rmsg.is_liked = 0;
                    } else {
                      rmsg.is_liked = 1;
                    }
                  }
                });
              });
            });
          }
          // if (this.isFromMyTrip) {
          //   this.listAllComments();
          // } else {
          //   this.getTripList();
          // }
        }
      });
  }

  viewProfile(trip, location) {
    let to_user_id = trip.user_id;
    if (location == "notification") {
      to_user_id = trip.ivt_from_user_id;
    }
    var api_url =
      this._globalService.apiHost +
      "/ViewProfileByStatus?from_user_id=" +
      this.token_object.id +
      "&to_user_id=" +
      to_user_id;

    this._http
      .get(api_url, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(res => {
        if (res["status"] == "ok") {
          let invites = res["invites"];
          if (invites && trip.requestStatus != "rejected") {
            // if (invites != 0 && trip.requestStatus != 'rejected') {
            // let personData = { trip_id: trip.id, user_id: trip.user_id, request_status: invites.status }
            // let personData = { trip_id: trip.id, user_id: to_user_id, request_status: invites.status }
            let personData = {};
            if (location == "notification") {
              personData = {
                trip_id: trip.ivt_trip_id,
                user_id: to_user_id,
                request_status: invites.status,
                type: trip.type
              };
            } else {
              personData = {
                trip_id: trip.id,
                user_id: to_user_id,
                request_status: invites.status
              };
            }

            localStorage.setItem("persondetails", JSON.stringify(personData));
            this.router.navigate(["/persondetails"]);
          } else {
            let invitestatus = this.requestStatus;
            if (invites != null) {
              invitestatus = invites.status;
            }
            let personData = {
              trip_id: trip.id,
              user_id: to_user_id,
              request_status: invitestatus
            };

            if(trip.user_id == this.token_object.id) {
              this.router.navigate(["/accounts/profile"]);
            }
            else {
              localStorage.setItem("persondetails", JSON.stringify(personData));
              this.router.navigate(["/basicprofile"]);
            }
          }
        }
      });

    // if (trip.requestStatus == 'accepted') {
    //   let personData = { trip_id: trip.id, user_id: trip.user_id }
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

  updateStatusRequest(trip, status) {
    var root = this;
    root.alert_text = "You want to accept this request?";
    root.alert_type = "success";
    if (trip.trip_plan == "planned") {
      if (trip.type == "courier") {
        var trip_weight = parseFloat(trip.balance_weight);
        var requested_weight = parseFloat(trip.request_courier_weight);
        var package_status = trip.package_status;
        if (package_status == "created") {
          if (trip_weight < requested_weight && status != "rejected") {
            Swal.fire({
              title: "Sorry!",
              text: "You weight is not enough for this user.",
              type: "error",
              cancelButtonText: "Ok"
            }).then(result => { });
          } else if (trip_weight >= requested_weight || status == "rejected") {
            if (status == "rejected") {
              root.alert_text = "You want to decline this request?";
              root.alert_type = "warning";
            }
            Swal.fire({
              title: "Are you sure?",
              text: root.alert_text,
              type: root.alert_type,
              showCancelButton: true,
              confirmButtonText: "Yes",
              cancelButtonText: "No"
            }).then(result => {
              if (result.value) {
                this.isLoading = true;
                var balanced_weight =
                  parseFloat(trip_weight.toString()) -
                  parseFloat(requested_weight.toString());
                let package_status = "created";
                if (trip.payment_mode == "offline") {
                  package_status = "assigned";
                }
                let requestData = {
                  user_id: trip.ivt_from_user_id,
                  from_user_id: trip.ivt_from_user_id,
                  to_user_id: trip.ivt_to_user_id,
                  trip_id: trip.ivt_trip_id,
                  status: status,
                  balanced_weight: balanced_weight,
                  type: trip.type,
                  request_id: trip.request_id.toString(),
                  request_type: trip.request_type,
                  request_courier_weight: trip.request_courier_weight.toString(),
                  payment_mode: trip.payment_mode,
                  package_status: package_status
                };

                var api_url =
                  this._globalService.apiHost + "/UpdateTripInviteStatus";
                this._http
                  .post(api_url, requestData, {
                    headers: new HttpHeaders({
                      Authorization: this._userService.getToken()
                    })
                  })
                  .subscribe(
                    res => {
                      if (res["status"] == "ok") {
                        this.isLoading = true;
                        this.trip_id = trip.ivt_trip_id;
                        this.request_package_id = trip.request_id;
                        this.initialProcess();
                        var data = { to_user_id: trip.ivt_from_user_id };
                        if (root.alert_type == "warning")
                          this.toastr.error("Trip is Declined");
                        else if (root.alert_type == "success")
                          this.toastr.success("Trip is Connected");
                        this._globalService.socket.emit("send_request", data);
                      }
                    },
                    error => {
                      const err = error.error.msg;
                    }
                  );
              }
            });
          }
        } else {
          Swal.fire({
            title: "Sorry!",
            text: "This package is already paid to some one.",
            type: "error",
            cancelButtonText: "Ok"
          }).then(result => { });
        }
      } else {
        if (status == "rejected") {
          root.alert_text = "You want to decline this request?";
          root.alert_type = "warning";
        }
        var package_status = trip.package_status;
        if (package_status == "created" && trip.type != 'companion') {
          Swal.fire({
            title: "Are you sure?",
            text: root.alert_text,
            type: root.alert_type,
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No"
          }).then(result => {
            if (result.value) {
              this.isLoading = true;

              let requestData = {
                user_id: trip.ivt_from_user_id,
                from_user_id: trip.ivt_from_user_id,
                to_user_id: trip.ivt_to_user_id,
                trip_id: trip.ivt_trip_id,
                status: status,
                type: trip.type,
                request_id: trip.request_id.toString(),
                request_type: trip.request_type,
                request_members: trip.request_members
              };

              var api_url =
                this._globalService.apiHost + "/UpdateTripInviteStatus";
              this._http
                .post(api_url, requestData, {
                  headers: new HttpHeaders({
                    Authorization: this._userService.getToken()
                  })
                })
                .subscribe(
                  res => {
                    if (res["status"] == "ok") {
                      this.isLoading = true;
                      this.trip_id = trip.ivt_trip_id;
                      this.request_package_id = trip.request_id;
                      this.initialProcess();
                      var data = { to_user_id: trip.ivt_from_user_id };
                      if (root.alert_type == "warning")
                        this.toastr.error("Trip is Declined");
                      else if (root.alert_type == "success")
                        this.toastr.success("Trip is Connected");
                      this._globalService.socket.emit("send_request", data);
                    }
                  },
                  error => {
                    const err = error.error.msg;
                  }
                );
            }
          });
        } else {
          Swal.fire({
            title: "Sorry!",
            text: "This package is already paid to some one.",
            type: "error",
            cancelButtonText: "Ok"
          }).then(result => { });
        }
      }
    } else {
      if (trip.type == "courier") {
        var trip_weight = parseFloat(trip.balance_weight);
        var requested_weight = parseFloat(trip.request_courier_weight);

        if (trip_weight < requested_weight && status != "rejected") {
          Swal.fire({
            title: "Sorry!",
            text: "You weight is not enough for this user.",
            type: "error",
            cancelButtonText: "Ok"
          }).then(result => { });
        } else if (trip_weight >= requested_weight || status == "rejected") {
          if (status == "rejected") {
            root.alert_text = "You want to decline this request?";
            root.alert_type = "warning";
          }
          Swal.fire({
            title: "Are you sure?",
            text: root.alert_text,
            type: root.alert_type,
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No"
          }).then(result => {
            if (result.value) {
              this.isLoading = true;
              var balanced_weight =
                parseFloat(trip_weight.toString()) -
                parseFloat(requested_weight.toString());
              let package_status = "created";
              if (trip.payment_mode == "offline") {
                package_status = "assigned";
              }
              let requestData = {
                user_id: trip.ivt_from_user_id,
                from_user_id: trip.ivt_from_user_id,
                to_user_id: trip.ivt_to_user_id,
                trip_id: trip.ivt_trip_id,
                status: status,
                balanced_weight: balanced_weight,
                type: trip.type,
                // request_id: trip.request_id.toString(),
                request_id: trip.request_id,
                request_type: trip.request_type,
                request_courier_weight: trip.request_courier_weight.toString(),
                trip_plan: trip.trip_plan,
                from_date: moment(trip.unplanned_req_from_date).format(
                  "DD-MMM-YYYY"
                ),
                to_date: moment(trip.unplanned_req_to_date).format(
                  "DD-MMM-YYYY"
                ),
                payment_mode: trip.payment_mode,
                package_status: package_status
              };
              var api_url =
                this._globalService.apiHost +
                "/updateUnplannedTripInviteStatus";
              this._http
                .post(api_url, requestData, {
                  headers: new HttpHeaders({
                    Authorization: this._userService.getToken()
                  })
                })
                .subscribe(
                  res => {
                    if (res["status"] == "ok") {
                      this.isLoading = true;
                      this.trip_id = trip.ivt_trip_id;
                      this.request_package_id = trip.request_id;
                      this.initialProcess();
                      var data = { to_user_id: trip.ivt_from_user_id };
                      if (root.alert_type == "warning")
                        this.toastr.error("Trip is Declined");
                      else if (root.alert_type == "success")
                        this.toastr.success("Trip is Connected");
                      this._globalService.socket.emit("send_request", data);
                    }
                  },
                  error => {
                    const err = error.error.msg;
                  }
                );
            }
          });
        }
      } else {
        let requestData;
        if (status == "rejected") {
          root.alert_text = "You want to decline this request?";
          root.alert_type = "warning";
        }
        Swal.fire({
          title: "Are you sure?",
          text: root.alert_text,
          type: root.alert_type,
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No"
        }).then(result => {
          if (result.value) {
            this.isLoading = true;
            if (trip.type == "assistance") {
              requestData = {
                user_id: trip.ivt_from_user_id,
                from_user_id: trip.ivt_from_user_id,
                to_user_id: trip.ivt_to_user_id,
                trip_id: trip.ivt_trip_id,
                status: status,
                type: trip.type,
                request_id: trip.request_id.toString(),
                request_type: trip.request_type,
                request_members: trip.request_members,
                trip_plan: trip.trip_plan,
                from_date: moment(trip.unplanned_req_from_date).format(
                  "DD-MMM-YYYY"
                ),
                to_date: moment(trip.unplanned_req_to_date).format(
                  "DD-MMM-YYYY"
                )
              };
            }

            if (trip.type == "companion") {
              requestData = {
                user_id: trip.ivt_from_user_id,
                from_user_id: trip.ivt_from_user_id,
                to_user_id: trip.ivt_to_user_id,
                trip_id: trip.ivt_trip_id,
                status: status,
                type: trip.type,
                request_id: trip.request_id.toString(),
                request_type: trip.request_type,
                from_date: moment(trip.unplanned_req_from_date).format(
                  "DD-MMM-YYYY"
                ),
                to_date: moment(trip.unplanned_req_to_date).format(
                  "DD-MMM-YYYY"
                ),
                description: trip.unplanned_req_description,
                trip_plan: trip.trip_plan
              };
            }
            var api_url =
              this._globalService.apiHost + "/updateUnplannedTripInviteStatus";
            this._http
              .post(api_url, requestData, {
                headers: new HttpHeaders({
                  Authorization: this._userService.getToken()
                })
              })
              .subscribe(
                res => {
                  if (res["status"] == "ok") {
                    this.isLoading = true;
                    this.trip_id = trip.ivt_trip_id;
                    this.request_package_id = trip.request_id;
                    this.initialProcess();
                    var data = { to_user_id: trip.ivt_from_user_id };
                    if (root.alert_type == "warning")
                      this.toastr.error("Trip is Declined");
                    else if (root.alert_type == "success")
                      this.toastr.success("Trip is Connected");
                    this._globalService.socket.emit("send_request", data);
                  }
                },
                error => {
                  const err = error.error.msg;
                }
              );
          }
        });
      }
    }
  }

  sendMsg(tripData) {
    this.router.navigate(["/accounts/messages"]).then(() => {
      var root = this;
      setTimeout(function () {
        var param = {
          from_user_id: tripData.from_user_id,
          to_user_id: tripData.to_user_id
        };
        root._globalService.socket.emit("emit_navigate_to_chat", param);
      }, 3000);
    });
  }

  gotoTripAction(trip, reqdata, location) {
    let package_status = "assigned";
    let check_package_status = [];
    let trip_id = trip.id;
    if (this.trip_location == "notification") {
      trip_id = trip.ivt_trip_id;
    }
    // if (this.trip_location == "incomingTrip" || location == "myTrip") {
    //   async.forEach(reqdata, function(trip) {
    //     if (package_status == trip.package_status) {
    //       check_package_status.push(trip.package_status);
    //     }
    //   });
    // } else if (location == "tripById") {
    //   async.forEach(reqdata, function(trip) {
    //     if (package_status == trip.package_status) {
    //       check_package_status.push(trip.package_status);
    //     }
    //   });
    // }

    if (reqdata.length != 0) {
      async.forEach(reqdata, function (trip) {
        if (package_status == trip.package_status) {
          check_package_status.push(trip.package_status);
        }
      });
    }

    if (trip.user_id == this.userId) {
      if (check_package_status.includes("assigned")) {
        Swal.fire({
          title: "Sorry!",
          text: "Please deliver all requestor packages",
          type: "error",
          cancelButtonText: "Ok"
        }).then(result => { });
      } else {
        localStorage.setItem("end_trip_id", trip_id);
        this.router.navigate(["/tripaction"]);
      }
    } else {
      localStorage.setItem("end_trip_id", trip_id);
      this.router.navigate(["/tripaction"]);
    }
  }

  gotoTripActionNotification(trip) {
    if (trip.package_status == "delivered") {
      localStorage.setItem("end_trip_id", trip.ivt_trip_id);
      this.router.navigate(["/tripaction"]);
    }
  }

  private getUserProfileData() {
    this._http
      .get(this._globalService.apiHost + "/GetUserProfileData", {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(response => {
        if (response["status"] == "ok") {
          this.user_details = response["data"];
        }
      });
  }
}

@Component({
  selector: "companion-message-dialog",
  templateUrl: "../../dialogs/request-dialog/companion-message-dialog.html"
})
export class CompanionMessageDialog {
  public message: any = "";

  constructor(public dialogRef: MatDialogRef<CompanionMessageDialog>) { }

  public submitMsg() {
    this.dialogRef.close(this.message);
  }

  public close() {
    this.dialogRef.close("close");
  }
}

@Component({
  selector: "confirmPaymentDialog",
  templateUrl: "./confirmPaymentDialog.html"
})
export class ConfirmPaymentDialog implements OnInit {
  public amount: any = 0;
  public weight: any = 0;
  public payment: any = 0;
  public commission: any = 0;
  public type = "courier";

  constructor(
    public dialogRef: MatDialogRef<ConfirmPaymentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.type = this.data.type;
    if (this.type == "courier") {
      this.amount =
        this.data.currency_symbol + " " + this.data.budget.toLocaleString();
      this.weight = this.data.weight;
      // this.commission = Math.round((this.data.budget/100)*10);
      this.commission =
        this.data.currency_symbol + " " + this.data.commission * 100;
      this.payment =
        this.data.currency_symbol +
        " " +
        this.data.totalPayment.toLocaleString();
    } else {
      this.amount =
        this.data.currency_symbol + " " + this.data.budget.toLocaleString();
      // this.commission = this.data.currency_symbol + ' ' + Math.round(this.data.commission * 100) / 100;
      this.commission = this.data.currency_symbol + " " + this.data.commission;
      this.payment =
        this.data.currency_symbol +
        " " +
        this.data.totalPayment.toLocaleString();
    }
  }

  confirmPayment() {
    this.dialogRef.close(this.data);
  }
}

@Component({
  selector: "unplanned-companion-request-dialog",
  templateUrl: "./unplanned-companion-request-dialog.html"
})
export class UnplannedCompanion {
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;

  public isLoading: boolean = true;
  public unplanned_days_form: FormGroup;
  public unplanned_days: any = "30";
  public fromDate: any = new Date();
  public toDate: any = "";
  public selectDate: any = "";
  public message: any = "";

  constructor(
    public dialogRef: MatDialogRef<UnplannedCompanion>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _form: FormBuilder,
    public _globalService: GlobalService,
    public _userService: UserService,
    private _http: HttpClient,
    private el: ElementRef,
    private toastr: ToastrService
  ) {
    dialogRef.disableClose = true;
    // console.log('dataaaaaa', this.data);
    this.unplanned_days = this.data.unplanned_days;
    this.unplanned_days_form = this._form.group({
      from_date: ["", Validators.compose([Validators.required])],
      to_date: ["", Validators.compose([Validators.required])],
      message: [""]
    });
  }

  ngOnInit() {
    this.unplanned_days_form.setValue({
      from_date: [""],
      to_date: [""],
      message: [""]
    });
  }

  public onSubmitUnplanned() {
    if (this.unplanned_days_form.valid) {
      // this.dialogRef.close(this.unplanned_days_form.value);
      // console.log("unplanned_days_form", this.unplanned_days_form.value);
      let formData = this.unplanned_days_form;
      this.isLoading = true;

      var param_data = {
        assigned_trip_id: this.data.id,
        from_date: moment(formData.value.from_date).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        to_date: moment(formData.value.to_date).format("YYYY-MM-DD HH:mm:ss"),
        description: formData.value.message
      };
      // console.log("param_data", param_data);

      var api_url = this._globalService.apiHost + "/CreateCompanionRequest";
      this._http
        .post(api_url, param_data, {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(res => {
          if (res["status"] == "ok") {
            this.isLoading = false;
            this.formDirective.resetForm();
            this.dialogRef.close(res["result"]);
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
    this.selectDate = moment(event.value).add(this.unplanned_days, "days");
    this.toDate = new Date(this.selectDate);
  }
}

@Component({
  selector: "unplanned-assis-cou-request-dialog",
  templateUrl: "./unplanned-assis-cou-request-dialog.html"
})
export class UnplannedAssisCourier {
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;

  public assis_cour_form: FormGroup;
  public current_date = new Date();
  public isLoading: boolean = true;
  public unplanned_days: any = "30";
  public fromDate: any = new Date(new Date().setDate(new Date().getDate() + 1));
  public toDate: any = "";
  public selectDate: any = "";

  constructor(
    public dialogRef: MatDialogRef<UnplannedAssisCourier>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _form: FormBuilder
  ) {
    dialogRef.disableClose = true;
    this.unplanned_days = this.data.trip.unplanned_days;

    this.assis_cour_form = this._form.group({
      from_date: ["", Validators.compose([Validators.required])],
      to_date: ["", Validators.compose([Validators.required])],
      trip_type: this.data.trip.type
    });
  }
  ngOnInit() {
    this.assis_cour_form.setValue({
      from_date: [""],
      to_date: [""],
      trip_type: this.data.trip.type
    });
  }
  public onSubmitAssisCour() {
    if (this.assis_cour_form.valid) {
      let formData = this.assis_cour_form;
      this.dialogRef.close(this.assis_cour_form.value);
    }
  }
  addEvent(event: MatDatepickerInputEvent<Date>) {
    this.selectDate = moment(event.value).add(this.unplanned_days, "days");
    this.toDate = new Date(this.selectDate);
  }
  public closePopup() {
    this.dialogRef.close();
  }
}
