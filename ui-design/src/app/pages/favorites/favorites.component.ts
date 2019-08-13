import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from 'src/app/model/global.service';
import { UserService } from 'src/app/model/user.service';
import async from 'async';
import * as moment from 'moment/min/moment.min.js';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SharedService } from 'src/app/model/shared.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  public favtrips: boolean = true;
  public favperson: boolean = false;
  public favactive: boolean = true;
  public favdeactive: boolean = false;
  public isLoading: boolean = true;
  public isMainLoading: boolean = true;
  public favoriteTripLists: boolean = false;

  public favoritesTripLists: any = [];  
  public favoriteTripUsersLists: any = [];

  public trip_type = 'favtrips';
  public user_data: any = '';
  public cover_picture: any = '/assets/images/header-bg.webp';
  public token_object: any = '';
  public jwtHelper: JwtHelperService = new JwtHelperService();


  constructor(
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    public router: Router,
    private toastr: ToastrService,
    public _sharedService: SharedService) { }

  ngOnInit() {
    window.scroll(0,0);
    this.getFavoritesTrips();
    this.token_object = this.jwtHelper.decodeToken(localStorage.getItem('frontend-token'));
    var page_param = { user_id: this.token_object.id, url: 'favorites' };
    this._globalService.socket.emit('page_identification', page_param);
    this.isMainLoading = false;
  }

  public onSelect(selected_one) {
    this.trip_type = selected_one;
    this.favperson = selected_one == 'favperson' ? true : false;
    this.favtrips = selected_one == 'favtrips' ? true : false;
    if(this.favperson){
      this.getFavoritesTripsByUser();
    }else{
      this.getFavoritesTrips();
    }
  }

  public onSelectFavStatus(selectedone) {
    this.favactive = selectedone == 'favactive' ? true : false;
    this.favdeactive = selectedone == 'favdeactive' ? true : false;
  }  

  getFavoritesTrips() {
    this.isLoading = true;
    let api_url = this._globalService.apiHost + '/GetFavoritesTrips';

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          let trips = res['trips'];
          console.log("trips", trips);
          this.isLoading = false;
          var root = this;
          let tripLists = [];
          async.forEach(trips, function (list) {

            let start_month = moment(list.Trip.from_date).format('MMMM');
            let start_date = moment(list.Trip.from_date).format('DD');

            let end_month = moment(list.Trip.to_date).format('MMMM');
            let end_date = moment(list.Trip.to_date).format('DD');

            let start_suffixval = root._globalService.ordinal_suffix_of(parseInt(start_date));
            let end_suffixval = root._globalService.ordinal_suffix_of(parseInt(end_date));

            tripLists.push({
              id: list.Trip.id,
              fav_id: list.id,
              person_id: list.Trip.user_id,
              trip_name: list.Trip.trip_name,
              departure: list.Trip.departure,
              destination: list.Trip.destination,
              start_month: start_month,
              start_date: start_date,
              end_month: end_month,
              end_date: end_date,
              start_suffixval: start_suffixval,
              end_suffixval: end_suffixval,
              user_id: list.user_id,
              type: list.Trip.type,
            })
          });

          this.favoritesTripLists = tripLists;
          if(this.favoritesTripLists.length > 0){
            this.favoriteTripLists = true;
          }else{
            this.favoriteTripLists = false;
          }
        }else{
          this.isLoading = false;
        }
      })
  }

  getFavoritesTripsByUser() {
    // console.log("favperson");
    this.isLoading = true;
    let api_url = this._globalService.apiHost + '/GetFavoritesTripsByUser';

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
    .subscribe(res => {
      if (res['status'] == 'ok') {
        // console.log("favperson", res);
        let trips = res['tripusers'];
        this.isLoading = false;
        var root = this;
        let tripLists = [];
        async.forEach(trips, function (list) {
          // let requestStatus = 'Send Request'
          let requestStatus = 'accepted'
          let userImage = '';

          // console.log("favperson list", list);

          // if(list.Trip.Invite!=null){
          //   requestStatus = list.Trip.Invite.status;
          // }  

          if (list.Profile.profile_picture) {
            if (list.Setting.to_everyone) {
              userImage = root._globalService.imageURL + '/static/profile_images/' + list.Profile.profile_picture;
            } else if (list.Setting.only_to_connections) {
              // if (requestStatus == 'accepted') {
                userImage = root._globalService.imageURL + '/static/profile_images/' + list.Profile.profile_picture;
              // }
            } else if (!list.Setting.profile_image_show) {
              userImage = root._globalService.imageURL + '/static/profile_images/' + list.Profile.profile_picture;
            }
          }
          tripLists.push({
            // id: list.Trip.id,
            fav_id: list.fav_user_id,
            user_id:list.user_id,
            person_id:list.id,
            // type: list.Trip.type,
            // trip_name: list.Trip.trip_name,
            username: list.Profile.first_name,
            profile_image: userImage,
            status:requestStatus
          })
        });

        this.favoriteTripUsersLists = tripLists;
        

         // if (list.Trip.User.Profile.profile_picture) {
          //   if (list.Trip.User.Setting.to_everyone) {
          //     userImage = root._globalService.imageURL + '/static/profile_images/' + list.Trip.User.Profile.profile_picture;
          //   } else if (list.Trip.User.Setting.only_to_connections) {
          //     if (requestStatus == 'accepted') {
          //       userImage = root._globalService.imageURL + '/static/profile_images/' + list.Trip.User.Profile.profile_picture;
          //     }
          //   } else if (!list.Trip.User.Setting.profile_image_show) {
          //     userImage = root._globalService.imageURL + '/static/profile_images/' + list.Trip.User.Profile.profile_picture;
          //   }
          // }

           // tripLists.push({
          //   id: list.Trip.id,
          //   fav_id: list.id,
          //   person_id:list.Trip.user_id,
          //   type: list.Trip.type,
          //   trip_name: list.Trip.trip_name,
          //   username: list.Trip.User.Profile.first_name,
          //   profile_image: userImage,
          //   status:requestStatus

          // })

      }else{
        this.isLoading = false;
      }
    });
  }  
  
  // viewProfile(favData){
  //   console.log("favData", favData);
  // var api_url = this._globalService.apiHost + '/ViewProfileByStatus?from_user_id=' +this.token_object.id +'&to_user_id='+favData.person_id;

  //   this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
  //   .subscribe(res => {
  //     if (res['status'] == 'ok') {
  //       let invites = res['invites'];
  //       if(invites!=0 && favData.status!='rejected'){
  //         let personData = { trip_id: favData.id, user_id: favData.person_id, type: 'favourite'  }
  //           localStorage.setItem('persondetails', JSON.stringify(personData));
  //           this.router.navigate(['/persondetails']);
  //       }else{
  //         let personData = { user_id: favData.person_id }
  //         localStorage.setItem('persondetails', JSON.stringify(personData));
  //         this.router.navigate(['/basicprofile']);
  //       }
  //     }
  //   }) 
  // }  

  viewProfile(favData){
    // console.log("favData", favData);
    let personData = { trip_id: favData.id, user_id: favData.fav_id, type: 'favourite', request_status: favData.status }
    localStorage.setItem('persondetails', JSON.stringify(personData));
    // this._sharedService.gotoPersonDetailsPage = personData;
    this.router.navigate(['/persondetails']);        
  }  

  removeTripFromFavorites(trip_id: number) {
    this.isLoading = true;
    let api_url = this._globalService.apiHost + '/RemoveTripFromFavorites?trip_id=' + trip_id;

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.isLoading = false;
          this.getFavoritesTrips();
          // this.getFavoritesTripsByUser();
          this.toastr.success('Trip removed from favorites !');
        }else{
          this.isLoading = false;
        }
      })
  }  

  // removeUserFromFavorites(trip) {
  //     Swal.fire({
  //       title: 'Are you sure want to remove favourites list ?',
  //       text: 'All favourite trips belongs to this user will also removed from your favourites list',
  //       type: 'warning',
  //       showCancelButton: true,
  //       confirmButtonText: 'Yes',
  //       cancelButtonText: 'No'
  //     }).then((result) => {
  //       if (result.value) {
  //         this.isLoading = true;
  //         let api_url = this._globalService.apiHost + '/RemoveUserFromFavorites?trip_user_id=' + trip.person_id;
      
  //         this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
  //           .subscribe(res => {
  //             if (res['status'] == 'ok') {
  //               this.isLoading = false;
  //               this.getFavoritesTrips();
  //               // this.getFavoritesTripsByUser();
  //               this.toastr.success('Traveler removed from favorites !');
  //             }else{
  //               this.isLoading = false;
  //             }
  //           })
  //       }
  //     });
    
  // }

  removeUserFromFavorites(trip) {
    console.log("trip_user", trip)
    Swal.fire({
      title: 'Are you sure want to remove favourites list ?',
      // text: 'All favourite trips belongs to this user will also removed from your favourites list',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.isLoading = true;
        let api_url = this._globalService.apiHost + '/removeFromFavoriteUser?favUserId=' + trip.fav_id;
    
        this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
          .subscribe(res => {
            if (res['status'] == 'ok') {
              this.isLoading = false;
              this.getFavoritesTrips();
              this.getFavoritesTripsByUser();
              this.toastr.success('Traveler removed from favorites !');
            }else{
              this.isLoading = false;
            }
          })
      }
    });    
}

  gotoTripDetails(trip) {
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
      anyTime:true
    };
    let tripSearchData =
    { trip_id: trip.id, user_id: trip.user_id, search_param_data: search_param_data}
    localStorage.setItem('trip_search_data', JSON.stringify({ trip_id: trip.id, user_id: trip.user_id, search_param_data: search_param_data,  }))
    this._sharedService.tripSearchData = tripSearchData;
    this.router.navigate(['/tripdetails']); 
  }  
}
