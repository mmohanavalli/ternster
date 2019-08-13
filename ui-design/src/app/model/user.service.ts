import { Injectable } from "@angular/core";
import { Http, Headers, Response } from "@angular/http";
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders
} from "@angular/common/http";
import { GlobalService } from "./global.service";
import "rxjs/add/operator/map";
import "rxjs/add/operator/do";
import "rxjs/add/operator/catch";
import { Observable } from "rxjs/Observable";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable()
export class UserService {
  private loggedIn = false;
  public redirectURL = "";
  public getApiData: any = "";
  public jwtHelper: JwtHelperService = new JwtHelperService();
  public userType = "";
  public typeUrl = "";
  public userTypesignup = "";
  public typeUrlsignup = "";

  constructor(
    private _globalService: GlobalService,
    private _router: Router,
    private _http: HttpClient
  ) {
    this.loggedIn = this.isLoggedIn();
  }

  public logout(): void {
    this._http
      .get(this._globalService.apiHost + "/Logout", {
        headers: new HttpHeaders({ Authorization: this.getToken() })
      })
      .subscribe(
        result => {
          //   console.log('Logout Result',result);
          //this._router.navigateByUrl('home');
          localStorage.removeItem('frontend-token');
          localStorage.removeItem('create-trip');
          localStorage.removeItem('trip_id');
          localStorage.removeItem('persondetails');
          localStorage.removeItem('trip_search_data');
          localStorage.removeItem('viewrequest');
          localStorage.removeItem('request_data'); 
          localStorage.removeItem('trip_service_log');
          localStorage.removeItem('end_trip_id');
          localStorage.removeItem('user_trip');     
          localStorage.removeItem('service_type');
      
          this.loggedIn = false;
          this._router.navigate(["/home"]);
        },
        error => {
          console.log(error);
        }
      );

    // this._http.get(this._globalService.apiHost + '/Logout', { headers: new HttpHeaders({ 'Authorization': this.getToken() }) })
    // .subscribe(result => {
    // //   console.log('Logout Result',result);
    //   //this._router.navigateByUrl('home');
    //   this._router.navigate(['/home']).then(() => {
    //     // location.reload();
    //   });
    // },
    // error => {
    //   console.log(error);
    // });
           
    // localStorage.removeItem('frontend-token');
    // localStorage.removeItem('create-trip');
    // localStorage.removeItem('trip_id');
    // localStorage.removeItem('persondetails');
    // localStorage.removeItem('trip_search_data');
    // localStorage.removeItem('viewrequest');
    // localStorage.removeItem('request_data'); 
    // localStorage.removeItem('trip_service_log');
    // localStorage.removeItem('end_trip_id');
    // localStorage.removeItem('user_trip');     
    // localStorage.removeItem('service_type');

    // this.loggedIn = false;
    // location.reload();
  }

  public getToken(): any {
    localStorage.removeItem("create-trip");
    return localStorage.getItem("frontend-token");
  }

  public settoken(token): any {
    return localStorage.setItem("frontend-token", "JWT " + token);
  }

  public isLoggedIn(): boolean {
    if (localStorage.getItem("frontend-token") != "undefined") {
      return !this.jwtHelper.isTokenExpired(
        localStorage.getItem("frontend-token")
      );
    }
    return false;
  }

  public getJWTValue(): any {
    if (this.isLoggedIn()) {
      let token = this.getToken();
      return this.jwtHelper.decodeToken(token);
    } else {
      return null;
    }
  }

  // private handleError(error: Response | any) {
  //   let errorMessage: any = {};
  //   // Connection error
  //   if (error.status == 0) {
  //     errorMessage = {
  //       success: false,
  //       status: 0,
  //       data: "Sorry, there was a connection error occurred. Please try again.",
  //     };
  //   }
  //   else if (error.status == 404) {
  //     errorMessage = {
  //       success: false,
  //       status: 404,
  //       data: error.statusText,
  //     };
  //   }
  //   else {
  //     errorMessage = error.json();
  //   }
  //   return Observable.throw(errorMessage);
  // }
}
