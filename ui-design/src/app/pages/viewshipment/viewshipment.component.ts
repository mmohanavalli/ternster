import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from '../../model/global.service';
import { UserService } from '../../model/user.service';
import async from 'async';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as moment from 'moment/min/moment.min.js';


@Component({
  selector: 'app-viewshipment',
  templateUrl: './viewshipment.component.html',
  styleUrls: ['./viewshipment.component.css']
})
export class ViewshipmentComponent implements OnInit {
  public isLoading: boolean = true;
  public courier_lists: any = [];
  public assistance_lists: any = [];
  public selectedType: any = 'courier';
  public token_object: any = '';
  public jwtHelper: JwtHelperService = new JwtHelperService();
  public image_urls: any = [];
  public p: any = '';

  listOfOptions = {
    "list": [
      {"name": "courier", ID: "D1", "checked": false},
      {"name": "assistance", ID: "D2", "checked": false},      
    ]
  };

  constructor(public router: Router,
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    private toastr: ToastrService) { }

  ngOnInit() {
    window.scroll(0,0);
    let selectedRequestType = JSON.parse(localStorage.getItem('viewrequest'));
    this.selectedType = selectedRequestType.type;

    this.token_object = this.jwtHelper.decodeToken(this._userService.getToken());
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit('page_identification', page_param);
    if(this.selectedType == 'courier'){
      this.getCourierRequest();
    }else{
      this.getAssistanceRequest();
    }
    
  }

  getCourierRequest() {
    this.isLoading = true;
    var api_url = this._globalService.apiHost + '/GetRequestorData?type=' + this.selectedType + '&user_id=' + this.token_object.id + '&is_trip_base=' + false;
    
    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.isLoading = false;
          let couriers = res['result'];
          // console.log("couriers,",couriers);
          var root = this;
          this.courier_lists = [];
          var image_urls = '';      
          var item_image_urls = '';  

          async.forEach(couriers, function (courier) {
            // if (courier.package_images) {
            //   image_urls = courier.package_images.split(",").map(function (item) {
            //     return root._globalService.imageURL + '/static/item_images/' + item;
            //   });
            // }

            var item_lists = [];
            var item_name = courier.item_name.split(',');
            var item_weight = courier.item_weight.split(',');
            var item_value = courier.item_value.split(',');
            var item_images = courier.item_images.split(',');

            for (let i = 0; i < item_name.length; i++) {
              item_lists.push({
                item_name: item_name[i],
                item_weight: item_weight[i],
                item_value: item_value[i],
                item_images: root._globalService.imageURL + '/static/item_images/' + item_images[i]
              })
            }

            root.courier_lists.push({
              courier_id: courier.id,
              assigned_trip_id: courier.assigned_trip_id,
              // departure: courier.departure,
              // destination: courier.destination,
              from_date: moment(courier.from_date).format('DD MMM YYYY'),
              to_date: moment(courier.to_date).format('DD MMM YYYY'),
              package_name: courier.package_name,
              package_description: courier.package_description,
              package_weight: courier.package_weight,
              weight_unit:courier.weight_unit,
              package_images:root._globalService.imageURL + '/static/item_images/' + courier.package_images,
              item_images:item_image_urls,
              size:courier.size,
              selectedType: 'courier',
              item_lists:item_lists,
              receiver_name:courier.receiver_name,
              receiver_contact_no:courier.receiver_contact_no,
              receiver_email_id:courier.receiver_email_id,
            })   
          })

          console.log("courier_lists,",this.courier_lists);

        } else {
          this.isLoading = false;
        }
      });
  }

  getAssistanceRequest() {
    this.isLoading = true;
    var api_url = this._globalService.apiHost + '/GetRequestorData?type=' + this.selectedType + '&user_id=' + this.token_object.id;

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.isLoading = false;
          let assistancelists = res['result'];
          console.log("assistancelists,", assistancelists);

          var root = this;
          this.assistance_lists = [];

          async.forEach(assistancelists, function (assistance) {
            root.assistance_lists.push({
              assistance_id: assistance.id,
              assigned_trip_id: assistance.assigned_trip_id,
              // departure: assistance.departure,
              // destination: assistance.destination,
              from_date: moment(assistance.from_date).format('DD MMM YYYY'),
              to_date: moment(assistance.to_date).format('DD MMM YYYY'),
              members: assistance.members,
              description: assistance.description,
              requested: assistance.requested,
              selectedType: 'assistance',
            })
          })
        } else {
          this.isLoading = false;
        }
      });
  }

  typeChange($event) {
    this.selectedType = $event.value;

    if (this.selectedType == 'courier') {
      this.getCourierRequest();
    } else if (this.selectedType == 'assistance') {
      this.getAssistanceRequest();
    }
  }

  editRequest(reqId, selectedType) {
    let ReqData = { reqId: reqId, selectedType: selectedType };
    localStorage.setItem('request_data', JSON.stringify(ReqData));
    this.router.navigate(['/updaterequest']);
  }

  deleteCourierRequest(courier) {
    if (!courier.assigned_trip_id) {

      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete this request?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.value) {
          this.isLoading = true;
          var api_url = this._globalService.apiHost + '/DeleteCourierRequest?id=' + courier.courier_id;

          this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
            .subscribe(res => {
              if (res['status'] == 'ok') {
                this.getCourierRequest()
                this.toastr.success('Courier Package Deleted');
                this.isLoading = false;
              } else {
                this.isLoading = false;
              }
            });
        }
      });
    } else {
      Swal.fire({
        title: 'Sorry!',
        text: 'This request is assigned for trip',
        type: 'error',
        cancelButtonText: 'Ok'
      }).then((result) => {

      })
    }
  }

  deleteAssistanceRequest(assistance) {

    if (!assistance.assigned_trip_id) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete this request?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.value) {

          this.isLoading = true;
          var api_url = this._globalService.apiHost + '/DeleteAssistanceRequest?id=' + assistance.assistance_id + '&user_id=' + this.token_object.id;

          this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
            .subscribe(res => {
              if (res['status'] == 'ok') {
                this.getAssistanceRequest();
                this.toastr.success('Assistance Package Deleted');
                this.isLoading = false;
              } else {
                this.isLoading = false;
              }
            });
        }
      });
    } else {
      Swal.fire({
        title: 'Sorry!',
        text: 'This request is assigned for trip',
        type: 'error',
        cancelButtonText: 'Ok'
      }).then((result) => {

      })
    }
  }
  changePange(event) {
    this.p = event;
  }
}
