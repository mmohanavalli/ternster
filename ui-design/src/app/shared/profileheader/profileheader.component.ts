import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from 'src/app/model/user.service';
import { GlobalService } from 'src/app/model/global.service';

@Component({
  selector: 'app-profileheader',
  templateUrl: './profileheader.component.html',
  styleUrls: ['./profileheader.component.css']
})
export class ProfileheaderComponent implements OnInit {

  public isLoading: boolean = true;
  public user_data: any = '';
  public cover_picture: any = '/assets/images/header-bg.webp';

  public facebook: boolean = false;
  public instagram: boolean = false;
  public twitter: boolean = false;
  
  constructor(
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
  ) { }

  ngOnInit() {
    this.getUserProfileData();
  }

  public getUserProfileData() {
    var api_url = this._globalService.apiHost + '/GetUserProfileData';

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.isLoading = false;
          var user_data = res['data'];
          console.log("user_data", user_data);

          var social_links = res['data'];
            if(social_links.facebook_id != null && social_links.facebook_id != ''){
              this.facebook = true;
            }
            if(social_links.instagram_id != null && social_links.instagram_id !=''){
              this.instagram = true;
            }
            if(social_links.twitter_id != null && social_links.twitter_id !=''){
              this.twitter = true;
            }

          this.user_data = user_data;
          if (user_data.cover_picture != null) {
            this.cover_picture = this._globalService.imageURL + '/static/cover_photos/' + user_data.cover_picture;
            // console.log("this.cover_picture",this.cover_picture)
          }
        }
      });
  }

}
