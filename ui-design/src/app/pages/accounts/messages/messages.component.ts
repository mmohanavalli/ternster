import { Component, OnInit, ElementRef, Inject, ViewChild, Pipe, PipeTransform, ViewChildren, Renderer2, ChangeDetectionStrategy, EventEmitter, QueryList, ɵConsole } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, FormGroupDirective } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent, MatAutocompleteSelectedEvent } from '@angular/material';
import async from 'async';
import * as moment from 'moment/min/moment.min.js';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SharedService } from 'src/app/model/shared.service';
declare var $: any;
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer } from "@angular/platform-browser";
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import { PagesComponent } from '../../pages.component';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  @ViewChild('langInput') langInput: ElementRef;
  @ViewChild('content') content: ElementRef;
  @ViewChildren('messageContainer') msgContainer: QueryList<any>;
  title = 'app';

  public isLoading: boolean = true;
  public isDualLoading: boolean = false;
  public isMainLoading: boolean = true;
  public jwtHelper: JwtHelperService = new JwtHelperService();
  public userLists: any = [];
  public countries: any = [];
  public states: any = [];
  public cities: any = [];

  public ftsearch: boolean = false;
  public query = '';

  public profile: boolean = false;
  public settings: boolean = false;
  public wallet: boolean = false;
  public messages: boolean = true;
  public change_pwd: boolean = false;
  public showContactsAvailable = false;
  public is_delete = false;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  public languages: any = [];
  public langMyControl = new FormControl();
  public selectedLanguages: string[] = [];
  public langFilteredOptions: Observable<string[]>;

  public header_first_name: any = '';
  public header_last_name: any = '';
  public header_country: any = '';

  public profile_picture: any = '/assets/images/top-profile-icon.webp';
  public cover_picture: any = '/assets/images/header-bg.webp';

  public chat_lists: any = [];
  public token_object: any = '';
  public selectedChat: any = '';
  public chat_content_name: any = '';
  public chat_user_name: any = '';
  public chat_service_type: any = '';
  public chat_content_lists: any = [];
  public isSelectedAvailableChat: boolean = false;
  public autoFocus: boolean = false;
  public inputMessage: any = '';
  public chat_unread_messages: any = [];
  public chat_read_messages: any = [];
  public isInputMessageEnabled: boolean = false;
  public from_user_data: any = []

  public maxDate: any = new Date(new Date().setFullYear(new Date().getFullYear() - 18));
  public coun_filter: any = '';
  public state_filter: any = '';
  public city_filter: any = '';
  public is_kyc_verified: boolean = false;
  public selectedProfileId: any = '';
  myCountryControl: FormControl = new FormControl();
  myStateControl: FormControl = new FormControl();
  myCityControl: FormControl = new FormControl();
  filteredOptions: Observable<string[]>;
  statefilteredOptions: Observable<string[]>;
  cityfilteredOptions: Observable<string[]>;
  public selectedTripChat: any = '';
  public MatiURL: string = "";

  selectedEmoji: any;
  public emoji: any = [];
  public show_dialog: boolean = false;

  constructor(public router: Router,
    public route: ActivatedRoute,
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    public formBuilder: FormBuilder,
    private el: ElementRef,
    public sharedService: SharedService,
    public pagesComponent: PagesComponent,
    private toastr: ToastrService) {

  }

  ngOnInit() {
    window.scroll(0, 0);
    this.isLoading = true;
    this.token_object = this.jwtHelper.decodeToken(this._userService.getToken());
    var list_lang = this._globalService.languages;
    var root = this;
    async.forEach(list_lang, function (list) {
      root.languages.push(list.name);
    });

    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit('page_identification', page_param);

    this._globalService.socket.on('on_navigate_to_chat', (data) => {
      var msg_data = '';
      async.forEach(this.chat_lists, function(list) {
        if(list.from_user_id == data.from_user_id && list.to_user_id == data.to_user_id) {
          msg_data = list;
        }
      });
      console.log('data of message', msg_data);
      if(msg_data != '') {
        this.selectChat(msg_data);
      }
    })

    this._globalService.socket.on('send_msg', (data) => {      
      if (data.to_user_id == this.token_object.id) {
        console.log('received data', data);
        // this.getAllMessageLists(data);
        // this.getAllAcceptedTrips();
        console.log('chatlists this', this.chat_lists);
        // async.forEach(this.chat_lists, function(list) {
        if(this.selectedChat && this.selectedChat.from_user_id == data.to_user_id && this.selectedChat.to_user_id == data.from_user_id) {
          this.getAllMessageLists(data);
          async.forEach(this.chat_lists, function(clist) {
            if(clist.from_user_id == root.selectedChat.from_user_id && clist.to_user_id == root.selectedChat.to_user_id) {
              clist.last_msg = data.message;
            }
          });
          this.updateMessageStatus(data, 'to');
        }
        else {
          for(var i = 0; i < this.chat_lists.length; i++) {
            if(this.chat_lists[i].from_user_id == data.to_user_id && this.chat_lists[i].to_user_id == data.from_user_id) {
              var current_obj = this.chat_lists[i];
              this.chat_lists.splice(i, 1);
              current_obj.msg_count = current_obj.msg_count + 1;
              current_obj.last_msg = data.message;
              this.chat_lists.unshift(current_obj);
            }
          }
        }
        console.log('selected', this.selectedChat);

        // if (data.from_user_id == this.selectedChat.from_user_id && data.to_user_id == this.selectedChat.to_user_id) {
        //   this.updateMessageStatus(data, 'to');
        // }
      }
    })

    var api_url = this._globalService.apiHost + '/GetAllUsers';

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.userLists = res['users'];
        }
      });

    this.getAllAcceptedTrips();
    this.isMainLoading = false;
    this.isLoading = false;
  }


  ngAfterViewInit() {
    this.scrollToBottom(); // For messsages already present
    this.msgContainer.changes.subscribe((list: QueryList<ElementRef>) => {
      this.scrollToBottom(); // For messages added later
    });
  }

  scrollToBottom = () => {
    try {
      this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
    } catch (err) { }
  }

  public getUserDataByUserId(userId) {
    var user_data = {};
    async.forEach(this.userLists, function (list) {
      if (list.id == userId) {
        user_data = list;
      }
    });
    return user_data;
  }

  public getUserDataByUserIdForProfile(userId) {
    var user_data = {};
    async.forEach(this.userLists, function (list) {
      if (list.id == userId) {
        user_data = list;
      }
    });
    return user_data;
  }

  public getSelectedValue(list) {
    console.log("this.selectedChat", this.selectedChat);
    // if (this.selectedChat && this.selectedChat.trip_id == list.Trip.id && (list.to_user_id == this.selectedChat.to_user_id || list.from_user_id == this.selectedChat.to_user_id)) {
    //   return 'active';
    // }
    if (this.selectedChat && (list.to_user_id == this.selectedChat.to_user_id || list.from_user_id == this.selectedChat.to_user_id)) {
      return 'active';
    }
    else {
      return '';
    }
  }

  public getLastMessage(user_id, lists) {
    var msg = '';
    var root = this;
    async.forEach(lists, function(list) {
      if((list.from_user_id == root.token_object.id && list.to_user_id == user_id) || (list.from_user_id == user_id && list.to_user_id == root.token_object.id)) {
        msg = list.last_message;
      }
    })
    return msg;
  }

  public getAllAcceptedTrips() {
    // this.isLoading = true;
    this.chat_lists = [];
    this.showContactsAvailable = false;

    /* TO GET ALL ACCEPTED TRIPS WITH LAST MESSAGES TO DISPLAY IN LEFT SIDE CHAT MENU */
    var api_url = this._globalService.apiHost + '/GetAllAcceptedTrips';

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          // this.isLoading = false;
          // var lists = res['trips'];
          var lists = res['message'];
          var user_data = res['data'];
          // this.isLoading = false;

          console.log("All UserMessage list", lists);
          var root = this;

          /* TO GET UNREAD MESSAGES COUNT FROM MESSAGE TABLE BY USER */
          var api_url = this._globalService.apiHost + '/listAllMessagesByUser';

          this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
            .subscribe(res => {
              if (res['status'] == 'ok') {
                var msg_lists = res['result'];
                async.forEach(lists, function (list) {
                  console.log("Message list", list);
                  if(list != root.token_object.id){
                  // var from_user_id = '';
                  // var to_user_id = '';
                  var msg_count = 0;

                  // if (root.token_object.id == list.from_user_id) {
                  //   from_user_id = list.from_user_id;
                  //   to_user_id = list.to_user_id;
                  // }
                  // else {
                  //   from_user_id = list.to_user_id;
                  //   to_user_id = list.from_user_id;
                  // }

                  // // if (root.selectedChat && root.selectedChat.trip_id != list.Trip.id) {
                  async.forEach(msg_lists, function (mlist) {
                    if (mlist.user_id == list) {
                      msg_count = msg_count + 1;
                    }
                  })
                  // }
            
                  root.from_user_data = root.getUserDataByUserIdForProfile(list);
                  let profile_picture = '/assets/images/top-profile-icon.webp';
                  if (root.from_user_data.Profile.profile_picture) {
                    if (root.from_user_data.Setting && !root.from_user_data.Setting.profile_image_show) {
                      profile_picture = root._globalService.imageURL + '/static/profile_images/' + root.from_user_data.Profile.profile_picture;
                    }
                  }
                  root.chat_lists.push({
                    // departure: list.Trip.departure,
                    // destination: list.Trip.destination,
                    // trip_id: list.Trip.id,
                    // trip_name: list.Trip.trip_name,
                    // trip_type: list.Trip.type,
                    from_user_id: root.token_object.id,
                    from_user: root.getUserDataByUserId(root.token_object.id),
                    profile_picture: profile_picture,
                    to_user_id: list,
                    to_user: root.getUserDataByUserId(list),
                    selected: root.getSelectedValue(list),
                    last_msg: root.getLastMessage(list, user_data),
                    // last_msg: list.last_message,
                    msg_count: msg_count
                  })
                 }
                });
                async.forEach(root.chat_lists, function(clist) {
                  clist.user_name = clist.to_user.name;
                })
                console.log('chat_lists', root.chat_lists);
                if(this.chat_lists.length == 0){
                  this.showContactsAvailable = true;
                }
              }
            });
        } else {
          // this.isLoading = false;
        }
      })
  }

  public getUserProfileData() {
    this.isLoading = true;
    var api_url = this._globalService.apiHost + '/GetUserProfileData';

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          var res_data = res['data'];
          this.isLoading = false;
          if (res_data.profile_picture != null) {
            this.profile_picture = this._globalService.imageURL + '/static/profile_images/' + res_data.profile_picture;
          }

          if (res_data.cover_picture != null) {
            this.cover_picture = this._globalService.imageURL + '/static/cover_photos/' + res_data.cover_picture;
          }

          this.header_first_name = res_data.first_name;
          this.header_last_name = res_data.last_name;
          this.header_country = res_data.country;
        } else {
          this.isLoading = false;
        }
      });
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our language
    if (value != '') {
      if (this.selectedLanguages.indexOf(value) < 0 && this.languages.indexOf(value) >= 0 && (value || '').trim()) {
        this.selectedLanguages.push(value.trim());
      }
      else {
        this.toastr.error('The language is already exists');
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.langMyControl.setValue(null);
  }

  remove(lang: string): void {
    const index = this.selectedLanguages.indexOf(lang);

    if (index >= 0) {
      this.selectedLanguages.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent) {
    // console.log('selected', event);
    if (this.selectedLanguages.indexOf(event.option.viewValue) < 0 && this.languages.indexOf(event.option.viewValue) >= 0) {
      this.selectedLanguages.push(event.option.viewValue);
    }
    else {
      this.toastr.error('The language is already exists');

    }

    this.langInput.nativeElement.value = '';
    this.langMyControl.setValue(null);
  }


  /* TO GET ALL MESSAGES BY TRIP ID WHICH IS GOING TO DISPLAY IN RIGHT SIDE */
  public getAllMessageLists(msgUser) {
    // this.isLoading = true;
    // var api_url = this._globalService.apiHost + '/GetAllMessagesByTripId?trip_id=' + trip.trip_id + '&from_user_id=' + trip.from_user_id + '&to_user_id=' + trip.to_user_id; listMessagesByChat
    var api_url = this._globalService.apiHost + '/listMessagesByChat?user_id=' + msgUser.from_user_id+'&from_user_id=' + msgUser.from_user_id + '&to_user_id=' + msgUser.to_user_id;
    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          // console.log("res['message']", res);
          if(res['message'].length > 0){
            
            var api_url = this._globalService.apiHost + '/GetAllMessagesByTripId?from_user_id=' + msgUser.from_user_id + '&to_user_id=' + msgUser.to_user_id;

            this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
              .subscribe(res => {
                if (res['status'] == 'ok') {
                  // console.log("All message res", res);
                  // this.isLoading = false;
                  var msg_lists = res['msgs'];
                  var root = this;
                  this.chat_content_lists = [];
        
                  async.forEach(msg_lists, function (msg) {
                    root.chat_content_lists.push({
                      id: msg.id,
                      from_user_id: msg.from_user_id,
                      to_user_id: msg.to_user_id,
                      trip_id: msg.trip_id,
                      user_name: msg.user_name,
                      message: msg.message,
                      location: (msg.from_user_id == root.token_object.id ? 'sent' : 'received'),
                      time: moment(new Date(msg.created_at)).fromNow()
                    })
                  });
                } else {
                  // this.isLoading = false;
                }
              });
          }
          else {
            this.chat_content_lists = [];
          }
        }
      });
  }

  public onKeydown($event) {
    if ($event.key == "Enter") {
      if($event.shiftKey)//jump new line
      {
        // $('#message_input').val($('#message_input').val() + "\n");// use the right id here
        // return true;
      }
      else {
        this.sendMessage();
      } 
    }
  }

  public sendMessage() {
    if (this.inputMessage != '') {
      var api_url = this._globalService.apiHost + '/sendMessage';

      // this.inputMessage = this.inputMessage.replace('\n', '<br>');

      var post_data = {
        from_user_id: this.token_object.id,
        from_user_name: this.token_object.name,
        message: this.inputMessage,
        to_user_id: this.selectedChat.to_user_id,
        // trip_id: this.selectedChat.trip_id
      }

      // console.log("Messgae post_data",post_data);

      this._http.post(api_url, post_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.inputMessage = '';
            this.autoFocus = true;
            this.isSelectedAvailableChat = true;
            this.isInputMessageEnabled = true;
            this.getAllMessageLists(post_data);
            // this.getAllAcceptedTrips();
            this.updateMessageStatus(post_data, 'from');
            var root = this;
            // this.getAllMessageLists(this.selectedChat);
            async.forEach(this.chat_lists, function(clist) {
              if(clist.from_user_id == root.selectedChat.from_user_id && clist.to_user_id == root.selectedChat.to_user_id) {
                clist.last_msg = post_data.message
              }
            })
            console.log('chstlist', this.chat_lists);
            this._globalService.socket.emit('msg_transfer', post_data);
          }
        });
    }
  }

  // public updateMessageStatus(trip, type) {
  //   // this.isLoading = true;
  //   var api_url = this._globalService.apiHost + '/UpdateMessageChatViewStatus?trip_id=' + trip.trip_id + '&from_user_id=' + trip.from_user_id + '&to_user_id=' + trip.to_user_id + '&type=' + type;

  //   this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
  //     .subscribe(res => {
  //       if (res['status'] == 'ok') {
  //         // this.isLoading = false;
  //       } else {
  //         // this.isLoading = false;
  //       }
  //     });
  // }

  public updateMessageStatus(msgUser, type) {
    // this.isLoading = true;
    var api_url = this._globalService.apiHost + '/UpdateMessageChatViewStatus?from_user_id=' + msgUser.from_user_id + '&to_user_id=' + msgUser.to_user_id + '&type=' + type;

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          // this.isLoading = false;
        } else {
          // this.isLoading = false;
        }
      });
  }

  // gotoTripDetails(trip) {
  //   localStorage.setItem('trip_search_data', JSON.stringify({ trip_id: trip.trip_id, user_id: trip.to_user_id }))
  //   this.router.navigate(['/tripdetails']);
  // }

  viewProfile(favData){
    console.log("favData", favData);
    let personData = { user_id: favData.to_user_id, request_status: 'accepted' }
    localStorage.setItem('persondetails', JSON.stringify(personData));
    this.router.navigate(['/persondetails']);   
  } 

  public selectChat(msgUser) {
    console.log('msguser', msgUser);
    this.isSelectedAvailableChat = true;
    this.isInputMessageEnabled = true;
    this.selectedChat = msgUser;
    this.autoFocus = true;
    // this.chat_content_name = trip.trip_name;
    // this.chat_content_name = trip.departure + " to " + trip.destination;
    // this.chat_service_type = trip.trip_type;
    this.chat_user_name = msgUser.to_user.name;
    this.getAllMessageLists(msgUser);


    var root = this;
    this.updateMessageStatus(msgUser, 'to');
    this.selectedChat.msg_count = 0;
    // if (msgUser.msg_count > 0) {
    //   this.getAllAcceptedTrips();
    // }

    async.forEach(this.chat_lists, function (list) {
      // if (list.trip_id == trip.trip_id && list.to_user_id == trip.to_user_id) {
      if (list.to_user_id == msgUser.to_user_id) {
        list.selected = 'active';
      }
      else {
        list.selected = '';
      }
    });
    this.pagesComponent.clearMessageNotification();
    $('#rightPanel').css({ 'width': '100%', 'opacity': '1' });

  }

  public closechatms() {
    $('#rightPanel').css({ 'width': '0%', 'opacity': '0' });
  }

  deleteChat(msgUser) {
    console.log("msgUser", msgUser)
    this.isLoading = true;
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete the chat?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        // var api_url = this._globalService.apiHost + '/DeleteChat';
        var api_url = this._globalService.apiHost + '/DeleteMessageChat';

        var post_data = {
          from_user_id: msgUser.from_user_id,
          to_user_id: msgUser.to_user_id,
          // trip_id: trip.trip_id,
          is_delete:'true',
        }

        this._http.post(api_url, post_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
          .subscribe(res => {
            if (res['status'] == 'ok') {
              console.log("delete res", res)
              this.isLoading = false;
              this.inputMessage = '';
              // this.is_delete = true;
              // this.getAllAcceptedTrips();
              this.getAllMessageLists(post_data);
              this.chat_content_lists = [];
              Swal.fire(
                'Chat Deleted!',
              )
            }
            else {
              this.isLoading = false;
            }
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelled',
        )
      }
    })
  }

  addEmoji($event) {    
    // this.selectedEmoji = $event.emoji.native;
    // this.emoji.push({
    //   selectedEmoji : this.selectedEmoji
    // })
    // console.log("$this.emoji", this.emoji);
    this.selectedEmoji = $event.emoji.native;
    this.inputMessage=this.inputMessage+'' +this.selectedEmoji;
  }
  toggle() {
    console.log("$this.emoji", this.show_dialog);
    this.show_dialog = !this.show_dialog;
  }

}
