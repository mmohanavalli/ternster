import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from '../../model/global.service';
import { UserService } from '../../model/user.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormGroupDirective } from '@angular/forms';
import async from 'async';
import * as moment from 'moment/min/moment.min.js';
import { ToastrService } from 'ngx-toastr';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-editshipment',
  templateUrl: './editshipment.component.html',
  styleUrls: ['./editshipment.component.css']
})
export class EditshipmentComponent implements OnInit {
  public isMainLoading: boolean = true;
  public isLoading: boolean = true;
  public isImageLoading: boolean = false;
  public isImageErrorEnabled: any = false;

  public countries: any = [];
  public courier_form_data: any = [];
  public courier_form: FormGroup;
  public assistant_form: FormGroup;
  public items_form: FormGroup;
  public current_date: any = new Date();

  public jwtHelper: JwtHelperService = new JwtHelperService();
  public token_object: any = '';

  public image_urls: any = '';
  public item_image_urls: any = [];
  public courier_id: any;
  public image_files: any = '';
  public flag: any = 0;

  // public item_image_val: any = [{
  //   id: 0,
  //   imagePath: '',
  // }];
  public item_image_val: any = [];

  myFormValueChanges

  public item_image_files: any = [];
  public itemSource: any = [];
  public index = 0;
  public ItemValues: any = [];
  public weightUnit = 'kg';
  public weightUnitPlaceholder = 'Weight (kg)';

  public item_name: any = [];
  public item_value: any = [];
  public item_weight: any = [];
  public item_images: any = [];

  public req_id: any = '';
  public req_type: any = '';

  public fromDate: any = '';
  public ass_fromDate: any = '';

  // public seedData : any = [];
  public itemData: any = [{
    item_name: this.item_name, item_weight: this.item_weight, item_value: this.item_value,
    item_images: this.item_image_val, item_photo: null
  }];

  constructor(public router: Router,
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    public _formBuilder: FormBuilder,
    private itemsForm: FormBuilder,
    private el: ElementRef,
    private toastr: ToastrService) {
    this.courier_form = this.itemsForm.group({
      // courier_id: [null],      
      // from_date: [null, Validators.compose([Validators.required])],
      // to_date: [null, Validators.compose([Validators.required])],
      package_name: [null, Validators.compose([Validators.required])],
      package_description: [null, Validators.compose([Validators.required])],
      package_weight: [0, Validators.compose([Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])],
      weight_unit: [null, Validators.compose([Validators.required])],
      size: [null, Validators.compose([Validators.required])],
      receiver_name: [null, Validators.compose([Validators.required])],
      receiver_contact_no: [null, Validators.compose([Validators.required, Validators.pattern(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)])],
      receiver_email_id: [null, Validators.compose([Validators.required,  Validators.email])],
      items: new FormArray([]),
    });

    this.assistant_form = this._formBuilder.group({
      assistance_id: [null],
      // departure: [null, Validators.compose([Validators.required])],
      // destination: [null, Validators.compose([Validators.required])],
      from_date: [null, Validators.compose([Validators.required])],
      to_date: [null, Validators.compose([Validators.required])],
      members: [null, Validators.compose([Validators.required])],
      description: [null, Validators.compose([Validators.required])],
      requested: [null, Validators.compose([Validators.required])],
    })
  }

  ngOnInit() {
    this.token_object = this.jwtHelper.decodeToken(this._userService.getToken());
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit('page_identification', page_param);
    // console.log("itemData", this.itemData);
    window.scroll(0, 0);
    this.countries = this._globalService.countries;
    this.isMainLoading = false;
    this.isLoading = false;
    let reqData = JSON.parse(localStorage.getItem('request_data'));
    this.req_id = reqData.reqId;
    this.req_type = reqData.selectedType;
    if (this.req_type == 'courier') {
      this.getCourierRequest(this.req_id);
    }
    if (this.req_type == 'assistance') {
      this.getAssistanceRequest(this.req_id);
    }
  }
  
  private getItems() {
    return this.itemsForm.group({
      item_name: [null, Validators.compose([Validators.required])],
      item_weight: [0, Validators.compose([Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])],
      item_value: [0, Validators.compose([Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])],
      itemphoto: [],
      item_images: [null]
    });
  }

  getAssistanceRequest(reqId) {
    this.isLoading = true;
    var api_url = this._globalService.apiHost + '/getAssistanceReqById?reqId=' + reqId;

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.isLoading = false;
          let assistance = res['assistance'];

          this.ass_fromDate = assistance.from_date;

          this.assistant_form.setValue({
            'assistance_id': assistance.id,
            // 'departure': assistance.departure,
            // 'destination': assistance.destination,
            'from_date': assistance.from_date,
            'to_date': assistance.to_date,
            'members': assistance.members,
            'description': assistance.description,
            'requested': assistance.requested,
          })

        } else {
          this.isLoading = false;
        }
      });

  }

  getCourierRequest(reqId) {
    this.isLoading = true;
    var api_url = this._globalService.apiHost + '/getCourierReqById?reqId=' + reqId;

    this._http.get(api_url, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.isLoading = false;
          let courier = res['courier'];
          // console.log("courier", courier);
          this.courier_form_data = res['courier'];
          var root = this;

          this.fromDate = courier.from_date;
          this.courier_id = courier.id
          this.weightUnit = courier.weight_unit;
          this.weightUnitPlaceholder = "Weight (" + courier.weight_unit + ")";

          if (courier.item_name) {
            let item_name_lists = courier.item_name.split(',');
            async.forEach(item_name_lists, function (list) {
              root.item_name.push({
                itemName: list,
              })
            })
          }
          if (courier.item_weight) {
            let item_weight_lists = courier.item_weight.split(',');
            async.forEach(item_weight_lists, function (list) {
              root.item_weight.push({
                itemWeight: list,
              })
            })
          }
          if (courier.item_value) {
            let item_value_lists = courier.item_value.split(',');
            async.forEach(item_value_lists, function (list) {
              root.item_value.push({
                itemValue: list,
              })
            })
          }

          if (courier.item_images) {
            let item_img_lists = courier.item_images.split(',');
            async.forEach(item_img_lists, function (list) {
              root.item_image_val.push({
                imagePath: root._globalService.imageURL + '/static/item_images/' + list,
                imageName:list,
              })
            })
          }
          else{
            root.item_image_val.push({
              imagePath: '',
            })
          }

          let itemFormValues = this.itemData[0];
          for (var i = 0; i < itemFormValues.item_weight.length; i++) {
            this.ItemValues.push({
              item_name: itemFormValues.item_name[i].itemName,
              item_value: itemFormValues.item_value[i].itemValue,
              item_weight: itemFormValues.item_weight[i].itemWeight,
              itemphoto: null,
              item_images: itemFormValues.item_images[i].imageName,
            })
            if (i == itemFormValues.item_weight.length - 1) {
              this.flag = 1;
            }
          }

          // console.log("ItemValues", this.ItemValues);

          if (courier.package_images) {
            let img_lists = courier.package_images.split(',');
            async.forEach(img_lists, function (list) {
              root.image_urls = {
                imagePath: root._globalService.imageURL + '/static/item_images/' + list,
                imageName: list,
              }
            })
            root.image_files = root.image_urls.imageName;
          }

          // if(courier.item_images){
          //   let item_img_lists = courier.item_images.split(',');
          //   async.forEach(item_img_lists, function (list) {
          //     root.item_image_urls.push({
          //       imagePath: root._globalService.imageURL + '/static/item_images/' + list,
          //       imageName: list,
          //     })
          //   })
          // }
          if (this.flag == 1) {
            this.itemFormArray();
            this.set_formval()
          }

        } else {
          this.isLoading = false;
        }
      });
  }
  set_formval() {
    var courier = this.courier_form_data;
    this.courier_form.setValue({
      // 'courier_id': courier.id,          
      // 'from_date': courier.from_date,
      // 'to_date': courier.to_date,
      'package_name': courier.package_name,
      'package_description': courier.package_description,
      'package_weight': courier.package_weight,
      'weight_unit': this.weightUnit,
      'size': courier.size,
      'receiver_name':courier.receiver_name,
      'receiver_contact_no':courier.receiver_contact_no,
      'receiver_email_id':courier.receiver_email_id,
      'items': this.itemsForm.array([]),
      
    })
  }
  itemFormArray() {
    this.ItemValues.forEach(itemCour => {
      const formGroup = this.getItems();
      const courForm = <FormArray>this.courier_form.controls.items
      formGroup.patchValue(itemCour);
      // this.filtersFormArray.push(formGroup);
      courForm.push(formGroup);
    });
  }

  public updateAssistant(formData, formDirective: FormGroupDirective) {
    if (formData.valid) {
      this.isLoading = true;
      var api_url = this._globalService.apiHost + '/UpdateAssistantRequest';

      var start = moment(formData.value.from_date).format('YYYY-MM-DD HH:mm:ss');
      var date_time = moment().format('YYYY-MM-DD HH:mm:ss');

      if (start >= this.ass_fromDate || start >= date_time) {
        var param_data = {
          id: formData.value.assistance_id,
          // departure: formData.value.departure,
          // destination: formData.value.destination,
          from_date: start,
          to_date: moment(formData.value.to_date).format('YYYY-MM-DD HH:mm:ss'),
          members: formData.value.members,
          description: formData.value.description,
          requested: formData.value.requested
        }

        this._http.post(api_url, param_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
          .subscribe(res => {
            if (res['status'] == 'ok') {
              this.isLoading = false;
              // formDirective.resetForm();
              this.toastr.success('Successfully Updated');
            } else {
              this.isLoading = false;
            }
          });
      }
      else {
        this.isLoading = false;
        this.toastr.error('Choose proper date!')
      }
    } else {
      this.isLoading = false;
    }
  }

  public updateCourier(formData, formDirective: FormGroupDirective) {
    console.log("updateCourier formData", formData);
    // console.log("this.image_files",this.image_files.length );
    this.isLoading = true;

    if (formData.valid) {
      var api_url = this._globalService.apiHost + '/UpdateCourierRequest';

      var start = moment(formData.value.from_date).format('YYYY-MM-DD HH:mm:ss');
      var date_time = moment().format('YYYY-MM-DD HH:mm:ss');


      // if (start >= this.ass_fromDate || start >= date_time) {
        if (this.image_files.length > 0) {
        this.isImageErrorEnabled = false;
        let itemname = [];
        let itemweight = [];
        let itemvalue = [];
        let itemimages = [];
        async.forEach(formData.value.items, function (list) {
          itemname.push(list.item_name);
          itemweight.push(list.item_weight);
          itemvalue.push(list.item_value);
          itemimages.push(list.item_images);
        })

        let image_files = [];

        var param_data = {
          id: this.courier_form_data.id,         
          description: formData.value.package_description,
          from_date: start,
          to_date: moment(formData.value.to_date).format('YYYY-MM-DD HH:mm:ss'),
          package_name: formData.value.package_name,
          size: formData.value.size,
          package_weight: formData.value.package_weight,
          package_description: formData.value.package_description,
          weight_unit: formData.value.weight_unit,
          receiver_contact_no:formData.value.receiver_contact_no,
          receiver_email_id:formData.value.receiver_email_id,
          receiver_name:formData.value.receiver_name,
          package_images: this.image_files.toString(),
          item_name: itemname.toString(),
          item_weight: itemweight.toString(),
          item_value: itemvalue.toString(),
          item_images: itemimages.toString(),
        }
console.log("param_data", param_data);
        this._http.post(api_url, param_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
          .subscribe(res => {
            if (res['status'] == 'ok') {
              this.isLoading = false;
              // formDirective.resetForm();
              this.toastr.success('Successfully Updated');
              let requestType = { type: 'courier' };
              localStorage.setItem('viewrequest', JSON.stringify(requestType));
              this.router.navigate(['/viewrequest']);
            } else {
              this.isLoading = false;
            }
          });
      }
      else {
        this.isLoading = false;
      }
    } else {
      this.isLoading = false;
    }
  }

  // public onSelectFile(event) {
  //   let inputEl: HTMLInputElement = this.el.nativeElement.querySelector('#photo');

  //   var file_name = inputEl.files[0].name;

  //   var extn = file_name.split(".").pop();
  //   var fileFormats = ['jpg', 'png', 'gif', 'jpeg'];

  //   //get the total amount of files attached to the file input.
  //   let fileCount: number = inputEl.files.length;

  //   //create a new fromdata instance
  //   let formData = new FormData();

  //   //check if the filecount is greater than zero, to be sure a file was selected.
  //   if (fileCount > 0) { // a file was selected
  //     formData.append('photo', inputEl.files.item(0));

  //     this.isImageLoading = true;
  //     var apiUrl = this._globalService.apiHost + '/PackageImageUpload';
  //     this._http.post(apiUrl, formData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
  //       .subscribe(res => {
  //         if (res['status'] == 'ok') {
  //           this.isImageLoading = false;
  //           // this.image_urls.push(this.api_host + '/static/item_images/' + res['filename']);
  //           this.image_urls.push({
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

  public onSelectFile(event) {
    let inputEl: HTMLInputElement = this.el.nativeElement.querySelector('#photo');

    var file_name = inputEl.files[0].name;

    var extn = file_name.split(".").pop();
    var fileFormats = ['jpg', 'png', 'gif', 'jpeg'];

    //get the total amount of files attached to the file input.
    let fileCount: number = inputEl.files.length;

    //create a new fromdata instance
    let formData = new FormData();

    //check if the filecount is greater than zero, to be sure a file was selected.
    if (fileCount > 0) { // a file was selected
      formData.append('photo', inputEl.files.item(0));

      this.isImageLoading = true;
      var apiUrl = this._globalService.apiHost + '/PackageImageUpload';
      this._http.post(apiUrl, formData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.isImageLoading = false;
            this.image_files = res['filename'];
            // this.image_urls.push(this.api_host + '/static/item_images/' + res['filename']);
            this.image_urls = {
              imagePath: this._globalService.imageURL + '/static/item_images/' + res['filename'],
              imageName: res['filename'],
            }
          } else {
            this.isImageLoading = false;
          }
        });
    } else {
      this.isImageLoading = false;
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
      // console.log("formData", formData);
      this.isImageLoading = true;
      var apiUrl = this._globalService.apiHost + '/ItemImageUpload';
      this._http.post(apiUrl, formData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.isImageLoading = false;
            // console.log("res['filename']", res['filename']);
            this.item_image_files.push(res['filename']);
            // this.image_urls.push(this.api_host + '/static/item_images/' + res['filename']);
            this.item_image_urls = {
              imagePath: this._globalService.imageURL + '/static/item_images/' + res['filename'],
              imageName: res['filename'],
            }
            const faControl =
              (<FormArray>this.filtersFormArray).at(index);
            faControl['controls'].item_images.setValue(this.item_image_urls.imageName);
            // if (index == this.index) {
              this.item_image_val[index].imagePath = this.item_image_urls.imagePath
            // }
            // this.item_image_val.push({
            //   id: index,
            //   imagePath: this.item_image_urls.imagePath,
            // })
            formData.delete('itemphoto')
            // console.log("this.courier.filter", this.filtersFormArray.value);
            // console.log("this.courier.facontrol", faControl.value);
          } else {
            this.isImageLoading = false;
          }
        });
    } else {
      this.isImageLoading = false;
    }

  }

  delete(img, index: number) {
    let image_url = this.image_urls;
    let imagename = [];
    async.forEach(image_url, function (list) {
      imagename.push(
        list.imageName
      )
    })
    // Find and remove
    imagename = imagename.filter(e => e !== img); // will return ['A', 'C']

    let delImage = {
      id: this.courier_id,
      del_image: img,
      images: imagename.toString()
    }

    var api_url = this._globalService.apiHost + '/ItemEditAndDeletePackageImage';
    this._http.post(api_url, delImage, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.image_urls.splice(index, 1);
        }
      });
  }

  deleteItemImage(img, index: number) {
    let image_url = this.item_image_urls;
    let imagename = [];
    async.forEach(image_url, function (list) {
      imagename.push(
        list.imageName
      )
    })
    // Find and remove
    imagename = imagename.filter(e => e !== img); // will return ['A', 'C']

    let delImage = {
      id: this.courier_id,
      del_image: img,
      images: imagename.toString()
    }

    var api_url = this._globalService.apiHost + '/ItemEditAndDeleteItemImage';
    this._http.post(api_url, delImage, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
      .subscribe(res => {
        if (res['status'] == 'ok') {
          this.item_image_urls.splice(index, 1);
        }
      });
  }

  selectWeightUnit(event) {
    // console.log("weight event", event);
    this.weightUnitPlaceholder = "Weight (" + event.value + ")";
  }

  addItem() {
    // console.log("this.itemData[0].item_weight.length", this.itemData[0].item_weight.length);
    this.index = this.itemData[0].item_weight.length;
    const control = <FormArray>this.courier_form.controls['items'];
    control.push(this.getItems());
    this.item_image_val.push({
      id: this.index,
      imagePath: '',
    })
  }

  get filtersFormArray() {
    return (<FormArray>this.courier_form.get('items'));
  }
  removeItem(i: number) {
    const control = <FormArray>this.courier_form.controls['items'];
    control.removeAt(i);
  }

}