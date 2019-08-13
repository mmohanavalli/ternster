import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from '../../model/global.service';
import { UserService } from '../../model/user.service';
import async from 'async';
import * as moment from 'moment/min/moment.min.js';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormGroupDirective, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-unplanned--request-dialog',
  templateUrl: './unplanned-request-dialog.component.html',
  styleUrls: ['./unplanned-request-dialog.component.css']
})
export class UnplannedRequestDialogComponent implements OnInit {
  public form: FormGroup;
  public courier_request_lists: any = [];
  public assistance_request_lists: any = [];

  public selected_id: any = 0;
  public assistance_selected_count: any = 0;

  public isCourierPackagesEnabled: boolean = false;
  public isWarningEnabled: boolean = false;
  public isAssistancePackagesEnabled: boolean = false;

  // public courier_form: FormGroup;
  public assistant_form: FormGroup;
  public isImageLoading: boolean = false;
  public isImageErrorEnabled: any = false;

  public countries: any = [];
  public image_urls: any = [];
  public image_files: any = [];
  public isLoading: boolean = true;
  public panelOpenedState: boolean = true;
  public current_date: any = new Date();

  public unplanned_req_from_date: any = '';
  public unplanned_req_to_date: any = '';

  public request_weight = 0;

  constructor(public reqdialogRef: MatDialogRef<UnplannedRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _http: HttpClient,
    public router: Router,
    public _globalService: GlobalService,
    public _userService: UserService,
    public _form: FormBuilder,
    private toastr: ToastrService,
    public dialog: MatDialog) {
    this.assistant_form = this._form.group({
      // departure: ['', Validators.compose([Validators.required])],
      // destination: ['', Validators.compose([Validators.required])],
      from_date: ['', Validators.compose([Validators.required])],
      to_date: ['', Validators.compose([Validators.required])],
      members: ['', Validators.compose([Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])],
      description: ['', Validators.compose([Validators.required])],
      requested: ['', Validators.compose([Validators.required])],
    })
  }

  ngOnInit() {
    this.getRequestorData();
    console.log("data", this.data);
    this.unplanned_req_from_date = moment(this.data.req_date.from_date).format("MMM Do YYYY");
    this.unplanned_req_to_date = moment(this.data.req_date.to_date).format("MMM Do YYYY");
  }

  getRequestorData() {
    var api_url = this._globalService.apiHost + '/GetRequestorData?type=' + this.data.type + '&user_id=' + this.data.user_id + '&is_trip_base=' + false;
    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          var lists = res['result'];
          var root = this;
          this.courier_request_lists = [];
          this.assistance_request_lists = [];

          console.log('trrip', this.data.trip);

          let dataTrip = this.data.trip;
          let unplannedDateTrip = this.data.req_date;

          // let req_start_date = moment(this.data.trip.from_date).format('YYYY-MM-DD');
          // let req_to_date = moment(this.data.trip.to_date).format('YYYY-MM-DD');
          let req_start_date = moment(unplannedDateTrip.from_date).format('YYYY-MM-DD');
          let req_to_date = moment(unplannedDateTrip.to_date).format('YYYY-MM-DD');
          // let req_start_date = new Date(req_start);
          // let req_to_date = new Date(req_to);

          console.log("Dates", req_start_date, req_to_date)

          if (this.data.type == 'courier') {
            console.log("Courier lists", lists);
            async.forEach(lists, function (list) {

              // let trip_from_date = moment(dataTrip.from_date).format('YYYY-MM-DD');
              // let trip_to_date = moment(dataTrip.to_date).format('YYYY-MM-DD');

              // let start_month = moment(dataTrip.from_date).format('MMMM');
              // let start_date = moment(dataTrip.from_date).format('DD');

              // let end_month = moment(dataTrip.to_date).format('MMMM');
              // let end_date = moment(dataTrip.to_date).format('DD');
              // let end_year = moment(dataTrip.to_date).format('YYYY');

              let trip_from_date = moment(unplannedDateTrip.from_date).format('YYYY-MM-DD');
              let trip_to_date = moment(unplannedDateTrip.to_date).format('YYYY-MM-DD');

              let start_month = moment(unplannedDateTrip.from_date).format('MMMM');
              let start_date = moment(unplannedDateTrip.from_date).format('DD');

              let end_month = moment(unplannedDateTrip.to_date).format('MMMM');
              let end_date = moment(unplannedDateTrip.to_date).format('DD');
              let end_year = moment(unplannedDateTrip.to_date).format('YYYY');

              let start_suffixval = root._globalService.ordinal_suffix_of(parseInt(start_date));
              let end_suffixval = root._globalService.ordinal_suffix_of(parseInt(end_date));
              if (dataTrip.weight_unit == list.weight_unit && list.package_status == 'created') {
                root.courier_request_lists.push({
                  id: list.id,
                  package_name: list.package_name,
                  package_description: list.package_description,
                  package_weight: list.package_weight,
                  weight_unit: list.weight_unit,
                  package_images: list.package_images,
                  checked: false,
                  start_month: start_month,
                  start_date: start_date,
                  end_month: end_month,
                  end_date: end_date,
                  end_year: end_year,
                  start_suffixval: start_suffixval,
                  end_suffixval: end_suffixval,
                  from_date_old: list.from_date,
                  to_date_old: list.to_date,
                  type: root.data.type,
                  from_date: unplannedDateTrip.from_date,
                  to_date: unplannedDateTrip.to_date,
                })
              }

            });
          }
          else {
            console.log("Assistance lists", lists);
            async.forEach(lists, function (list) {
              // let trip_from_date = moment(dataTrip.from_date).format('YYYY-MM-DD');
              // let trip_to_date = moment(dataTrip.to_date).format('YYYY-MM-DD');

              // let start_month = moment(dataTrip.from_date).format('MMMM');
              // let start_date = moment(dataTrip.from_date).format('DD');

              // let end_month = moment(dataTrip.to_date).format('MMMM');
              // let end_date = moment(dataTrip.to_date).format('DD');
              // let end_year = moment(dataTrip.to_date).format('YYYY');

              let trip_from_date = moment(unplannedDateTrip.from_date).format('YYYY-MM-DD');
              let trip_to_date = moment(unplannedDateTrip.to_date).format('YYYY-MM-DD');

              let start_month = moment(unplannedDateTrip.from_date).format('MMMM');
              let start_date = moment(unplannedDateTrip.from_date).format('DD');

              let end_month = moment(unplannedDateTrip.to_date).format('MMMM');
              let end_date = moment(unplannedDateTrip.to_date).format('DD');
              let end_year = moment(unplannedDateTrip.to_date).format('YYYY');

              let start_suffixval = root._globalService.ordinal_suffix_of(parseInt(start_date));
              let end_suffixval = root._globalService.ordinal_suffix_of(parseInt(end_date));

              root.assistance_request_lists.push({
                id: list.id,
                start_month: start_month,
                start_date: start_date,
                end_month: end_month,
                end_date: end_date,
                end_year: end_year,
                start_suffixval: start_suffixval,
                end_suffixval: end_suffixval,
                from_date_old: list.from_date,
                to_date_old: list.to_date,
                members: list.members,
                description: list.description,
                requested: list.requested,
                checked: false,
                type: root.data.request_type,
                from_date: unplannedDateTrip.from_date,
                to_date: unplannedDateTrip.to_date,
              })

            });
          }
        }
      },
        error => {
          const err = error.error.msg;
        });
  }

  checkValidation(list, data) {
    var from = moment(list.from_date).diff(data.trip.from_date, 'days');
    var to = moment(data.trip.to_date).diff(list.to_date, 'days');
    // if(list.departure.toLowerCase() == data.trip.departure.toLowerCase() && list.destination.toLowerCase() == data.trip.destination.toLowerCase() && from >= 0 && (to <= 0 || to >= 0)) {
    if (from >= 0 && (to <= 0 || to >= 0)) {
      // return "The selected trip is not matched with your requirements";
      return true;
    }
    else {
      return false;
    }
  }

  selectRequests(data) {
    console.log("req_data", data, "this.selected_id", this.selected_id);;
    var root = this;
    if (data.type == 'courier') {
      if (this.selected_id) {
        var selected_request_lists = {};
        var isRequestSend = false;
        async.forEach(this.courier_request_lists, function (list) {
          console.log("req_list", list);
          if (root.selected_id == list.id) {
            isRequestSend = true;
            selected_request_lists = list;
          }
          console.log("selected_request_lists", selected_request_lists);
        });
        if (isRequestSend) {
          this.reqdialogRef.close(selected_request_lists);
          console.log("selected_request_lists", selected_request_lists);
        }

      }
      else {
        this.toastr.error('Please do create a request or select any one from the list');
      }
    }
    else {
      if (this.selected_id) {
        var selected_request_lists = {};
        var isRequestSend = false;
        async.forEach(this.assistance_request_lists, function (list) {
          console.log("req_list", list);
          if (root.selected_id == list.id) {
            isRequestSend = true;
            selected_request_lists = list;
            console.log("selected_request_lists", selected_request_lists);
          }
        });
        if (isRequestSend) {
          this.reqdialogRef.close(selected_request_lists);
          console.log("selected_request_lists", selected_request_lists);
        }

      }
      else {
        this.toastr.error('Please do create a request or select any one from the list');
      }
    }
  }

  checkRequestLists($event) {
    console.log("$event", $event);
    if ($event.value) {
      this.selected_id = $event.value;
    }
    else {
      this.selected_id = 0;
    }
  }

  createNewRequest(data) {

    console.log("All ----  data", data);
    if (data.type == 'courier') {
      const dialogRef = this.dialog.open(CourierRequestDialog, {
        width: '1000px',
        //height: '700px',
        disableClose: true,
        // data: this.courier_form
        data: data
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != undefined && result != '') {
          // this.dialogRef.close(selected_request_lists);
          this.reqdialogRef.close(result);
        }
      });

    } else if (data.type == 'assistance') {

      this.assistant_form.setValue({
        // departure: new FormControl(data.trip.departure),
        // destination: new FormControl(data.trip.destination),
        // departure: data.trip.departure,
        // destination: data.trip.destination,
        // from_date: new Date(data.trip.from_date),
        // to_date: new Date(data.trip.to_date),
        from_date: new Date(data.req_date.from_date),
        to_date: new Date(data.req_date.to_date),
        members: this.assistant_form.value.members,
        description: this.assistant_form.value.description,
        requested: this.assistant_form.value.requested,
      });
      console.log('this.courier_form', this.assistant_form.value);

      const dialogRef = this.dialog.open(AssistanceRequestDialog, {
        width: '600px',
        disableClose: true,
        data: this.assistant_form
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != undefined && result != '') {
          // this.getRequestorData();
          this.reqdialogRef.close(result)
        }
      });
    }
  }

  viewRequest(reqType) {
    // console.log("requestType", requestType)
    let requestType = { type: reqType };
    localStorage.setItem('viewrequest', JSON.stringify(requestType));
    this.router.navigate(['/viewrequest']);
    this.reqdialogRef.close();
  }
}

@Component({
  selector: 'courier-request-dialog',
  templateUrl: './courier-request-dialog.html',
  styleUrls: ['./unplanned-request-dialog.component.css']
})
export class CourierRequestDialog {
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;

  public current_date = new Date();
  public isLoading: boolean = false;
  public isPackageImageLoading: boolean = false;
  public isImageLoading: boolean = false;
  public isImageErrorEnabled: any = false;
  public isItemImageErrorEnabled: any = false;
  public courier_form: FormGroup;

  public image_urls: any = [];
  public item_image_urls: any = [];
  // public image_files: any = [];
  // public item_image_files: any = [];
  public packageUnitDisabled: boolean = true;
  public package_weight_unit = 'Weight (Kg)';
  public weightUnit = 'kg';
  myFormValueChanges$;
  public item_image_val: any = [{
    id: 0,
    imagePath: '',
  }];

  public item_image_loader: any = [{
    id: 0,
    load: false,
  }];
  public image_files: any = '';
  public item_image_files: any = [];
  public itemSource: any = [];
  public index = 0;
  public ternster_balance_weight: any;

  constructor(public dialogRef: MatDialogRef<CourierRequestDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any, public _form: FormBuilder,
    public _globalService: GlobalService,
    public _userService: UserService,
    private _http: HttpClient,
    private el: ElementRef,
    private toastr: ToastrService) {
    dialogRef.disableClose = true;
    console.log('dataaaaaa Courier', this.data);
    this.ternster_balance_weight = this.data.trip.balance_weight;

    this.package_weight_unit = 'Weight (' + this.data.trip.weight_unit + ')';
    this.weightUnit = this.data.trip.weight_unit;

    this.courier_form = this._form.group({
      from_date: ['', Validators.compose([Validators.required])],
      to_date: ['', Validators.compose([Validators.required])],
      package_name: [null, Validators.compose([Validators.required])],
      package_description: [null, Validators.compose([Validators.required])],
      package_weight: [0, Validators.compose([Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])],
      weight_unit: ['kg'],
      size: [null, Validators.compose([Validators.required])],
      items: this._form.array([
        // load first row at start
        this.getItems()
      ]),
      receiver_name: [null, Validators.compose([Validators.required])],
      receiver_contact_no: [null, Validators.compose([Validators.required, Validators.pattern(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)])],
      receiver_email_id: [null, Validators.compose([Validators.required, Validators.email])],
    });
  }

  ngOnInit() {
    this.courier_form.setValue({
      from_date: new Date(this.data.req_date.from_date),
      to_date: new Date(this.data.req_date.to_date),
      package_name: this.courier_form.value.package_name,
      package_description: this.courier_form.value.package_description,
      package_weight: this.courier_form.value.package_weight,
      weight_unit: this.weightUnit,
      size: this.courier_form.value.size,
      items: new FormArray([
        this.getItems()
      ]),
      receiver_name: this.courier_form.value.receiver_name,
      receiver_contact_no: this.courier_form.value.receiver_contact_no,
      receiver_email_id: this.courier_form.value.receiver_email_id,
    });
    // console.log('this.courier_form', this.courier_form.value);
    this.myFormValueChanges$ = this.courier_form.controls['items'].valueChanges;
  }

  private getItems() {
    return this._form.group({
      item_name: [null, Validators.compose([Validators.required])],
      item_weight: [0, Validators.compose([Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])],
      item_value: [0, Validators.compose([Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])],
      itemphoto: [],
      item_images: [null]
    });
  }

  public onSelectFile(event) {
    let inputEl: HTMLInputElement = this.el.nativeElement.querySelector('#photo');

    var file_name = inputEl.files[0].name;

    var extn = file_name.split(".").pop();
    var fileFormats = ['jpg', 'png', 'gif', 'jpeg'];
    console.log("File Format", extn, fileFormats);

    //get the total amount of files attached to the file input.
    let fileCount: number = inputEl.files.length;

    //create a new fromdata instance
    let formData = new FormData();

    //check if the filecount is greater than zero, to be sure a file was selected.
    if (fileCount > 0) { // a file was selected
      formData.append('photo', inputEl.files.item(0));

      this.isPackageImageLoading = true;
      var apiUrl = this._globalService.apiHost + '/PackageImageUpload';
      this._http.post(apiUrl, formData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.isPackageImageLoading = false;
            this.isImageErrorEnabled = false;
            this.image_files = (res['filename']);
            // this.image_urls.push(this.api_host + '/static/item_images/' + res['filename']);
            this.image_urls = {
              imagePath: this._globalService.imageURL + '/static/item_images/' + res['filename'],
              imageName: res['filename'],
            }
          } else {
            this.isPackageImageLoading = false;
          }
        });
    } else {
      this.isPackageImageLoading = false;
    }
  }

  // public onSelectItemFile(event) {
  //   let inputEl: HTMLInputElement = this.el.nativeElement.querySelector('#itemphoto');

  //   var file_name = inputEl.files[0].name;

  //   var extn = file_name.split(".").pop();
  //   var fileFormats = ['jpg', 'png', 'gif', 'jpeg'];

  //   //get the total amount of files attached to the file input.
  //   let fileCount: number = inputEl.files.length;

  //   //create a new fromdata instance
  //   let formData = new FormData();

  //   //check if the filecount is greater than zero, to be sure a file was selected.
  //   if (fileCount > 0) { // a file was selected
  //     formData.append('itemphoto', inputEl.files.item(0));

  //     this.isImageLoading = true;
  //     var apiUrl = this._globalService.apiHost + '/ItemImageUpload';
  //     this._http.post(apiUrl, formData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
  //       .subscribe(res => {
  //         if (res['status'] == 'ok') {
  //           this.isImageLoading = false;
  //           this.item_image_files.push(res['filename']);
  //           // this.image_urls.push(this.api_host + '/static/item_images/' + res['filename']);
  //           this.item_image_urls.push({
  //             imagePath: this._globalService.imageURL + '/static/item_images/' + res['filename'],
  //             imageName: res['filename'],
  //           })
  //         } else {
  //           this.isImageLoading = false;
  //         }
  //       });
  //   } else {
  //     this.isImageLoading = false;
  //   }

  // }

  public onSelectItemFile(event, index) {
    let inputEl: HTMLInputElement = this.el.nativeElement.querySelector('#itemphoto_' + index);

    var file_name = inputEl.files[0].name;

    var extn = file_name.split(".").pop();
    var fileFormats = ['jpg', 'png', 'gif', 'jpeg'];

    //get the total amount of files attached to the file input.
    let fileCount: number = inputEl.files.length;

    //create a new fromdata instance
    let formData = new FormData();

    //check if the filecount is greater than zero, to be sure a file was selected.
    if (fileCount > 0) { // a file was selected
      formData.append('itemphoto', inputEl.files.item(0));
      console.log("formData", formData);
      this.item_image_loader[index].load = true;
      var apiUrl = this._globalService.apiHost + '/ItemImageUpload';
      this._http.post(apiUrl, formData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.item_image_loader[index].load = false;
            this.isItemImageErrorEnabled = false;
            console.log("res['filename']", res['filename']);

            this.item_image_files.push(res['filename']);
            // this.image_urls.push(this.api_host + '/static/item_images/' + res['filename']);
            this.item_image_urls = {
              imagePath: this._globalService.imageURL + '/static/item_images/' + res['filename'],
              imageName: res['filename'],
            }
            const faControl =
              (<FormArray>this.courier_form.controls['items']).at(index);
            faControl['controls'].item_images.setValue(this.item_image_urls.imageName);
            // if(index == this.index){
            this.item_image_val[index].imagePath = this.item_image_urls.imagePath
            // }
            // this.item_image_val.push({
            //   id: index,
            //   imagePath: this.item_image_urls.imagePath,
            // })
            formData.delete('itemphoto')
            console.log("this.courier", this.courier_form.controls['items'].value);
            console.log("this.courier", faControl.value);
          } else {
            this.item_image_loader[index].load = false;
          }
        });
    } else {
      this.item_image_loader[index].load = false;
    }

  }

  delete(img, index: number) {
    var api_url = this._globalService.apiHost + '/itemDeleteImage?image=' + img;
    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.image_urls.splice(index, 1);
        }
      });
  }

  deleteItemImage(img, index: number) {
    var api_url = this._globalService.apiHost + '/itemDeleteImage?image=' + img;
    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.item_image_urls.splice(index, 1);
        }
      });
  }


  public onSubmitCourier() {
    if (this.courier_form.valid) {
      let formData = this.courier_form.value;
      if (parseInt(formData.package_weight) <= this.ternster_balance_weight) {
        // if (this.image_files.length > 0) {
        if (this.image_files.length > 0 && this.item_image_files.length > 0) {
          this.isImageErrorEnabled = false;
          this.isItemImageErrorEnabled = false
          let itemname = [];
          let itemweight = [];
          let itemvalue = [];
          if (formData.items.length == this.item_image_files.length) {
            this.isLoading = true;
            async.forEach(formData.items, function (list) {
              itemname.push(list.item_name);
              itemweight.push(list.item_weight);
              itemvalue.push(list.item_value);
            })

            var param_data = {
              // courier_req_id: this.courier_req_id,       
              from_date: moment(formData.from_date).format('YYYY-MM-DD HH:mm:ss'),
              to_date: moment(formData.to_date).format('YYYY-MM-DD HH:mm:ss'),
              package_name: formData.package_name,
              package_description: formData.package_description,
              package_weight: formData.package_weight,
              size: formData.size,
              package_images: this.image_files.toString(),
              weight_unit: formData.weight_unit,
              item_name: itemname.toString(),
              item_weight: itemweight.toString(),
              item_value: itemvalue.toString(),
              item_images: this.item_image_files.toString(),
              receiver_name: formData.receiver_name,
              receiver_contact_no: formData.receiver_contact_no,
              receiver_email_id: formData.receiver_email_id,
            }
            var api_url = this._globalService.apiHost + '/CreateCourierRequest';
            this._http.post(api_url, param_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
              .subscribe(res => {
                if (res['status'] == 'ok') {
                  this.isLoading = false;
                  // this.formDirective.resetForm();
                  this.image_urls = [];
                  this.image_files = [];
                  this.dialogRef.close(res['result']);
                  this.toastr.success('Successfully created request for courier');
                }
              });
          } else {
            this.toastr.warning('Please attach the item images');
          }
        }
        else {
          this.isLoading = false;
          this.toastr.error('Please attach the images');
          this.isImageErrorEnabled = true;
          this.isItemImageErrorEnabled = true
          return;
        }
      } else {
        this.isLoading = false;
        this.toastr.warning("The ternster can able to carry only or below " + this.ternster_balance_weight + ' ' + this.data.trip.weight_unit)
      }
    } else {
      this.isLoading = false;
    }
  }

  // addItem() {
  //   const control = <FormArray>this.courier_form.controls['items'];
  //   control.push(this.getItems());
  // }

  addItem() {
    this.index = this.index + 1;
    const control = <FormArray>this.courier_form.controls['items'];
    control.push(this.getItems());
    this.item_image_val.push({
      id: this.index,
      imagePath: '',
    })
    this.item_image_loader.push({
      id: this.index,
      load: false,
    })
    return false;
  }

  getControls() {
    return (<FormArray>this.courier_form.get('items')).controls;
  }

  /**
   * Remove unit row from form on click delete button
   */
  removeItem(i: number) {
    const control = <FormArray>this.courier_form.controls['items'];
    control.removeAt(i);
  }
}

@Component({
  selector: 'assistance-request-dialog',
  templateUrl: './assistance-request-dialog.html',
  styleUrls: ['./unplanned-request-dialog.component.css']
})
export class AssistanceRequestDialog {
  public current_date = new Date();
  public isLoading: boolean = true;

  constructor(public dialogRef: MatDialogRef<AssistanceRequestDialog>,
    @Inject(MAT_DIALOG_DATA) public data: FormGroup,
    public _globalService: GlobalService,
    public _userService: UserService,
    private toastr: ToastrService,
    private _http: HttpClient) {
    dialogRef.disableClose = true;
    console.log('dataaaaaa Assistance', this.data);

  }


  public onSubmitAssistant(formData, formDirective: FormGroupDirective) {
    if (formData.valid) {
      this.isLoading = true;
      var api_url = this._globalService.apiHost + '/CreateAssistantRequest';

      var param_data = {
        // departure: formData.value.departure,
        // destination: formData.value.destination,
        from_date: moment(formData.value.from_date).format('YYYY-MM-DD HH:mm:ss'),
        to_date: moment(formData.value.to_date).format('YYYY-MM-DD HH:mm:ss'),
        members: formData.value.members,
        description: formData.value.description,
        requested: formData.value.requested
      }

      this._http.post(api_url, param_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.isLoading = false;
            formDirective.resetForm();
            this.dialogRef.close(res['result']);
            this.toastr.success('Successfully created request for assistant');
          } else {
            this.isLoading = false;
          }
        });
    } else {
      this.isLoading = false;
    }
  }
}