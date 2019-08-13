import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  HostListener
} from "@angular/core";
import { Router } from "@angular/router";
import { GlobalService } from "../model/global.service";
import { UserService } from "../model/user.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { JwtHelperService } from "@auth0/angular-jwt";
import async from "async";
import * as moment from "moment/min/moment.min.js";
import * as _ from "lodash";
import { SharedService } from "../model/shared.service";
// import { chain } from "lodash/chain";
// import { zipObject } from "lodash/zipObject";

declare var $: any;

@Component({
  selector: "app-pages",
  templateUrl: "./pages.component.html",
  styleUrls: ["./pages.component.css"]
})
export class PagesComponent implements OnInit {
  @ViewChild("header-tag") header: ElementRef;

  public profile_picture: any = "/assets/images/top-profile-icon.webp";
  public token_object: any = "";
  public jwtHelper: JwtHelperService = new JwtHelperService();
  public isLoggedIn: boolean = false;

  public visibleovelay: boolean = false;
  public dashboard_header_tab: boolean = false;
  public create_header_tab: boolean = false;
  public find_header_tab: boolean = false;
  public fav_header_tab: boolean = false;

  public read_messages: any = [];
  public unread_messages: any = [];
  public notification_message_count: any = 0;
  public notification_limit: any = 5;

  public read_message_notification_lists: any = [];
  public unread_message_notification_lists: any = [];
  public read_message_display_lists: any = [];
  public unread_message_display_lists: any = [];
  public settingsData: any = [];
  public message_notification_count: any = 0;
  public message_notification_limit: any = 5;

  constructor(
    public _router: Router,
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    public _sharedService: SharedService
  ) { }

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

  ngOnInit() {
    window.scroll(0, 0);
    console.log("initial console page component");
    if (this._router.url == "/dashboard") {
      this.dashboard_header_tab = true;
    } else if (this._router.url == "/createtrip") {
      this.create_header_tab = true;
    } else if (this._router.url == "/findatrips") {
      this.find_header_tab = true;
    } else if (this._router.url == "/favorites") {
      this.fav_header_tab = true;
    }

    if (this._userService.isLoggedIn()) {
      console.log("Page Component Console : IsLoggedIn()");
      this.isLoggedIn = true;
      this.token_object = this.jwtHelper.decodeToken(
        this._userService.getToken()
      );
      this.getUserProfileData();
      this.getNotificationLists();
      this.getMessageNotificationLists();
    }

    this._globalService.socket.on("login_alert", () => {
      console.log("Page Component Console : Login alert");
      this.isLoggedIn = true;
      this.token_object = this.jwtHelper.decodeToken(
        this._userService.getToken()
      );
      this.getUserProfileData();
      this.getNotificationLists();
      this.getMessageNotificationLists();
    });

    this._globalService.socket.on("page_identify", data => {
      if (data.user_id == this.token_object.id) {
        data.url = data.url != undefined ? data.url : null;
        this.gotoMainPages(data.url, false);
      }
    });

    this.token_object = this.jwtHelper.decodeToken(
      this._userService.getToken()
    );

    this._globalService.socket.on("alert_notification", data => {
      if (data.to_user_id == this.token_object.id) {
        this.getNotificationLists();
      }
    });

    this._globalService.socket.on("alert_notification_comment", data => {
      console.log("comment alsert", data);
      if (data.trip_user_id == this.token_object.id) {
        this.getNotificationLists();
      }
    });

    this._globalService.socket.on("cancel_trip_alert", data => {
      console.log("cancel_trip_alert", data);
      if (data.to_user_id == this.token_object.id) {
        this.getNotificationLists();
      }
    });

    // this._globalService.socket.on('scroll_top_alert', () => {
    //   this.scrollToTop();
    // })

    this._globalService.socket.on("send_msg", data => {
      if (
        data.to_user_id == this.token_object.id &&
        this._router.url != "/profile"
      ) {
        this.getMessageNotificationLists();
      }
    });
  }

  // TODO: Cross browsing
  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }

  public closenav() {
    $("#navbarSupportedContent").removeClass("show");
    $(".mobmenuoverlap").removeClass("viewoverlay");
    $(".navbar-toggler").addClass("collapsed");
    $(".navbar-toggler").attr("aria-expanded", "false");
  }

  public getMessageNotificationLists() {
    if (this.token_object != null) {
      let api_url = this._globalService.apiHost + "/GetUserSettingsData";
      this._http
        .get(api_url, {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(res => {
          if (res["status"] == "ok") {
            this.settingsData = res["settings"];

            if (this.settingsData.on_new_messages) {
              var api_message_url =
                this._globalService.apiHost + "/GetMessageNotificationLists";
              this._http
                .get(api_message_url, {
                  headers: new HttpHeaders({
                    Authorization: this._userService.getToken()
                  })
                })
                .subscribe(res => {
                  if (res["status"] == "ok") {
                    var root = this;
                    this.unread_message_notification_lists = [];
                    this.read_message_notification_lists = [];
                    this.unread_message_display_lists = [];
                    this.read_message_display_lists = [];
                    var unread_msg_lists = [];
                    var read_msg_lists = [];

                    var lists = [];
                    if (
                      res["msgs"].length > 5 &&
                      this.message_notification_limit == 5
                    ) {
                      for (var i = 0; i < 5; i++) {
                        lists.push(res["msgs"][i]);
                      }
                    } else {
                      lists = res["msgs"];
                    }

                    async.forEach(lists, function (msg) {
                      var profile_image = "/assets/images/profile.webp";
                      if (msg.User.Profile.profile_picture != null) {
                        if (!msg.User.Setting.profile_image_show) {
                          profile_image =
                            root._globalService.imageURL +
                            "/static/profile_images/" +
                            msg.User.Profile.profile_picture;
                        }
                      }

                      if (msg.view_status == "unread") {
                        root.unread_message_notification_lists.push({
                          id: msg.id,
                          from_user_id: msg.from_user_id,
                          to_user_id: msg.to_user_id,
                          trip_id: msg.trip_id,
                          message: msg.message,
                          user_name: msg.user_name,
                          view_status: msg.view_status,
                          time: moment(new Date(msg.created_at)).fromNow(),
                          profile: profile_image
                        });
                      } else {
                        root.read_message_notification_lists.push({
                          id: msg.id,
                          from_user_id: msg.from_user_id,
                          to_user_id: msg.to_user_id,
                          trip_id: msg.trip_id,
                          message: msg.message,
                          user_name: msg.user_name,
                          view_status: msg.view_status,
                          time: moment(new Date(msg.created_at)).fromNow(),
                          profile: profile_image
                        });
                      }
                    });

                    if (this.unread_message_notification_lists.length > 0) {
                      unread_msg_lists = this.groupBy(
                        this.unread_message_notification_lists,
                        "from_user_id",
                        "user_id",
                        "data"
                      );
                    }

                    if (this.read_message_notification_lists.length > 0) {
                      read_msg_lists = this.groupBy(
                        this.read_message_notification_lists,
                        "from_user_id",
                        "user_id",
                        "data"
                      );
                    }
                    async.forEach(unread_msg_lists, function (list) {
                      root.unread_message_display_lists.push({
                        id: list.data[0].id,
                        from_user_id: list.data[0].from_user_id,
                        to_user_id: list.data[0].to_user_id,
                        trip_id: list.data[0].trip_id,
                        message: list.data[0].message,
                        user_name: list.data[0].user_name,
                        view_status: list.data[0].view_status,
                        time: list.data[0].time,
                        profile: list.data[0].profile,
                        count: list.data.length
                      });
                    });

                    async.forEach(read_msg_lists, function (list) {
                      root.read_message_display_lists.push({
                        id: list.data[0].id,
                        from_user_id: list.data[0].from_user_id,
                        to_user_id: list.data[0].to_user_id,
                        trip_id: list.data[0].trip_id,
                        message: list.data[0].message,
                        user_name: list.data[0].user_name,
                        view_status: list.data[0].view_status,
                        time: list.data[0].time,
                        profile: list.data[0].profile,
                        count: list.data.length
                      });
                    });

                    this.message_notification_count = res["msgs"].length;
                  }
                });
            }
          }
        });
    }
  }

  public getNotificationLists() {
    if (this.token_object != null) {
      let api_url = this._globalService.apiHost + "/GetUserSettingsData";
      this._http
        .get(api_url, {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(res => {
          if (res["status"] == "ok") {
            var root = this;
            root.settingsData = res["settings"];

            if (root.settingsData.on_new_requests) {
              var api_notify_url =
                this._globalService.apiHost + "/GetNotificationLists";

              this._http
                .get(api_notify_url, {
                  headers: new HttpHeaders({
                    Authorization: this._userService.getToken()
                  })
                })
                .subscribe(res => {
                  if (res["status"] == "ok") {
                    let reqData = res["reqdata"];
                    var lists = [];
                    if (reqData.length > 5 && this.notification_limit == 5) {
                      for (var i = 0; i < 5; i++) {
                        lists.push(reqData[i]);
                      }
                    } else {
                      lists = reqData;
                    }

                    this.unread_messages = [];
                    this.read_messages = [];

                    // console.log("Notification list",lists);

                    async.forEach(lists, function (list) {
                      var profile_image = "/assets/images/profile.webp";
                      if (list.User.Profile.profile_picture != null) {
                        if (list.User.Setting.to_everyone) {
                          profile_image =
                            root._globalService.imageURL +
                            "/static/profile_images/" +
                            list.User.Profile.profile_picture;
                        } else if (list.User.Setting.only_to_connections) {
                          // if (
                          //   list.request_status == "accepted" ||
                          //   list.request_status == "paid"
                          // ) {
                          if (list.can_show_profile) {
                            profile_image =
                              root._globalService.imageURL +
                              "/static/profile_images/" +
                              list.User.Profile.profile_picture;
                          }
                        } else if (!list.User.Setting.profile_image_show) {
                          profile_image =
                            root._globalService.imageURL +
                            "/static/profile_images/" +
                            list.User.Profile.profile_picture;
                        }
                      }

                      if (list.view_status == "unread") {
                        root.unread_messages.push({
                          user_name: list.User.name,
                          user_id: list.User.id,
                          id: list.id,
                          trip_id: list.trip_id,
                          trip_name: list.Trip ? list.Trip.trip_name : "",
                          from_user_id: list.from_user_id,
                          to_user_id: list.to_user_id,
                          time: moment(new Date(list.created_at)).fromNow(),
                          request_status: list.request_status,
                          package_status: list.package_status,
                          view_status: list.view_status,
                          profile: profile_image,
                          type: list.request_type,
                          departure: list.Trip ? list.Trip.departure : "",
                          destination: list.Trip ? list.Trip.destination : "",
                          weight: list.request_courier_weight,
                          weight_unit: list.Trip ? list.Trip.weight_unit : "",
                          members: list.request_members,
                          is_comments: list.is_comment,
                          is_reply_comment: list.is_reply_comment,
                          is_liked_comment: list.is_liked_comment,
                          is_from_cancelled_trip: list.is_from_cancelled_trip,
                          can_show_msg:list.can_show_msg
                        });
                      } else if (list.view_status == "read") {
                        root.read_messages.push({
                          user_name: list.User.name,
                          user_id: list.User.id,
                          id: list.id,
                          trip_id: list.trip_id,
                          trip_name: list.Trip ? list.Trip.trip_name : "",
                          from_user_id: list.from_user_id,
                          to_user_id: list.to_user_id,
                          time: moment(new Date(list.created_at)).fromNow(),
                          request_status: list.request_status,
                          package_status: list.package_status,
                          view_status: list.view_status,
                          profile: profile_image,
                          type: list.request_type,
                          departure: list.Trip ? list.Trip.departure : "",
                          destination: list.Trip ? list.Trip.destination : "",
                          weight: list.request_courier_weight,
                          weight_unit: list.Trip ? list.Trip.weight_unit : "",
                          members: list.request_members,
                          is_comments: list.is_comment,
                          is_reply_comment: list.is_reply_comment,
                          is_liked_comment: list.is_liked_comment,
                          is_from_cancelled_trip: list.is_from_cancelled_trip,
                          can_show_msg:list.can_show_msg
                        });
                      }
                    });
                    this.notification_message_count = reqData.length;
                  }
                });
            }
          }
        });
    }
  }

  public seeAllMessageNotification() {
    this.message_notification_limit = 0;
    this.getMessageNotificationLists();
  }

  public seeAllNotification() {
    this.notification_limit = 0;
    this.getNotificationLists();
  }

  public openMessageNotification() {
    if (this.unread_message_notification_lists.length > 0) {
      var unread_msg_ids = [];
      async.forEach(this.unread_message_notification_lists, function (msg) {
        unread_msg_ids.push(msg.id);
      });
      // async.forEach(this.unread_message_display_lists, function (msg) {
      //   unread_msg_ids.push(msg.id);
      // });

      var api_url = this._globalService.apiHost + "/UpdateMessageNotification";
      var param_data = {
        notification_ids: unread_msg_ids,
        view_status: "read"
      };

      this._http
        .post(api_url, param_data, {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(res => {
          if (res["status"] == "ok") {
            var root = this;
            setTimeout(function () {
              // async.forEach(root.unread_message_notification_lists, function (umsg) {
              //   root.read_message_notification_lists.unshift(umsg);
              // })

              async.forEach(root.unread_message_display_lists, function (umsg) {
                root.read_message_display_lists.unshift(umsg);
              });
              root.unread_message_notification_lists = [];
              root.unread_message_display_lists = [];
            }, 3000);
          }
        });
    }
  }

  public openNotification(id) {
    // this.getNotificationLists();
    var api_url = this._globalService.apiHost + "/UpdateNotification";
    var param_data = {
      id: id,
      view_status: "read"
    };

    this._http
      .post(api_url, param_data, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(res => {
        if (res["status"] == "ok") {
          // var root = this;
          // setTimeout(function () {
          //   async.forEach(root.unread_messages, function (umsg) {
          //     root.read_messages.push(umsg);
          //   })
          //   root.unread_messages = [];
          // }, 3000);
        }
      });
  }

  // public openNotification() {
  //   // this.getNotificationLists();
  //   if (this.unread_messages.length > 0) {
  //     var unread_msg_ids = [];
  //     async.forEach(this.unread_messages, function (msg) {
  //       unread_msg_ids.push(msg.id);
  //     });

  //     var api_url = this._globalService.apiHost + '/UpdateNotification';
  //     var param_data = {
  //       notification_ids: unread_msg_ids,
  //       view_status: 'read',
  //     }

  //     this._http.post(api_url, param_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
  //     .subscribe(res => {
  //       if (res['status'] == 'ok') {
  //         var root = this;
  //         setTimeout(function () {
  //           async.forEach(root.unread_messages, function (umsg) {
  //             root.read_messages.push(umsg);
  //           })
  //           root.unread_messages = [];
  //         }, 3000);
  //       }
  //     });
  //   }
  // }

  public getUserProfileData() {
    console.log("Inside of user profile data");
    if (this.token_object != null) {
      var api_url = this._globalService.apiHost + "/GetUserProfileData";

      this._http
        .get(api_url, {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(res => {
          if (res["status"] == "ok") {
            var res_data = res["data"];
            if (res_data.profile_picture) {
              this.profile_picture =
                this._globalService.imageURL +
                "/static/profile_images/" +
                res_data.profile_picture;
            }
          }
        });
    }
  }

  scrollToElement(cnd): void {
    var data = { cnd: cnd };
    console.log("page component scroll");
    this._globalService.socket.emit("scroll_element", data);
  }

  scrollToTop() {
    this.header.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  }

  public logout() {
    localStorage.removeItem("token");
    this._userService.logout();
    this.isLoggedIn = false;
  }

  public updateStatusRequest(list, status) {
    let requestData = {
      user_id: list.user_id,
      from_user_id: list.from_user_id,
      to_user_id: list.to_user_id,
      trip_id: list.trip_id,
      status: status
    };

    var api_url = this._globalService.apiHost + "/UpdateTripInviteStatus";
    this._http
      .post(api_url, requestData, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(
        res => {
          if (res["status"] == "ok") {
            this.getNotificationLists();
            var data = { to_user_id: list.from_user_id };
            this._globalService.socket.emit("send_request", data);
          }
        },
        error => {
          const err = error.error.msg;
        }
      );
  }

  gotoTripDetails(list, is_comments, viewStatus) {
    // let personData = { trip_id: list.trip_id, user_id: list.user_id, type: list.type };
    // if(this._router.url == '/persondetails') {
    //   window.location.reload();
    // }
    // localStorage.setItem('persondetails', JSON.stringify(personData));
    // this._router.navigate(['/persondetails']);
    if(viewStatus == 'unread'){
      this.openNotification(list.id);
    }
    let search_param_data = {
      mode: "",
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

    let tripSearchData = {
      trip_id: list.trip_id,
      notification_id: list.id,
      trip_type: list.type,
      location: "notification",
      search_param_data: search_param_data
    };
    // if (this._router.url == "/tripdetails") {
    //   window.location.reload();
    // }
    console.log("unread msgs", this.unread_messages);
    for (var i = 0; i < this.unread_messages.length; i++) {
      if (list.id == this.unread_messages[i].id) {
        this.read_messages.unshift(this.unread_messages[i]);
        this.unread_messages.splice(i, 1);
      }
    }
    localStorage.setItem("trip_search_data", JSON.stringify(tripSearchData));
    this._sharedService.tripSearchData = tripSearchData;
    this._router.navigate(["/tripdetails"]);
  }

  gotoMainPages(pagename, isFromHeader) {
    if (pagename == "dashboard") {
      this.dashboard_header_tab = true;
      this.create_header_tab = false;
      this.find_header_tab = false;
      this.fav_header_tab = false;
    } else if (pagename == "createtrip") {
      this.dashboard_header_tab = false;
      this.create_header_tab = true;
      this.find_header_tab = false;
      this.fav_header_tab = false;
    } else if (pagename == "findatrips") {
      this.dashboard_header_tab = false;
      this.create_header_tab = false;
      this.find_header_tab = true;
      this.fav_header_tab = false;
    } else if (this._router.url == "/favorites") {
      this.dashboard_header_tab = false;
      this.create_header_tab = false;
      this.find_header_tab = false;
      this.fav_header_tab = true;
    } else {
      this.dashboard_header_tab = false;
      this.create_header_tab = false;
      this.find_header_tab = false;
      this.fav_header_tab = false;
    }

    // if (this._router.url == "/" + pagename) {
    //   window.location.reload();
    // }
    if (pagename != null && isFromHeader) {
      this._router.navigate(["/" + pagename]);
    }
  }

  gotoPersonDetails(list) {
    let personData = {
      trip_id: list.trip_id,
      user_id: list.user_id,
      type: list.type
    };
    if (this._router.url == "/persondetails") {
      window.location.reload();
    }
    localStorage.setItem("persondetails", JSON.stringify(personData));
    this._router.navigate(["/persondetails"]);

    // let tripSearchData = { notification_id: list.id,  location: 'notification' }
    // localStorage.setItem('trip_search_data',JSON.stringify(tripSearchData));
    // this._router.navigate(['/tripdetails']);
  }

  clearMessageNotification() {
    this.read_message_notification_lists = [];
    this.unread_message_notification_lists = [];
    this.read_message_display_lists = [];
    this.unread_message_display_lists = [];
    this.message_notification_count = 0;
  }

  gotoMessage(list) {
    // if (this._router.url == "/accounts/messages") {
    //   window.location.reload();
    // }
    this._router.navigate(["/accounts/messages"]);
  }

  gotoProfile(profile) {
    // if (this._router.url == "/accounts/profile") {
    //   window.location.reload();
    // }
    this._router.navigate(["/accounts/profile"]);
  }

  refreshNotification() {
    this.getNotificationLists();
  }

  topFunction() {
    window.scroll(0, 0);
    // this.header.nativeElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    // this._globalService.socket.emit('scroll_top');
  }
}
