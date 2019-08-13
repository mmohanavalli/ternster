import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from '../../model/global.service';
import { UserService } from '../../model/user.service';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, FormGroupDirective } from '@angular/forms';
import async from 'async';
import * as moment from 'moment/min/moment.min.js';
import { ToastrService } from 'ngx-toastr';
import { JwtHelperService } from '@auth0/angular-jwt';

declare var $: any;

@Component({
  selector: 'app-shipment',
  templateUrl: './shipment.component.html',
  styleUrls: ['./shipment.component.css']
})

export class ShipmentComponent implements OnInit {
  public isMainLoading: boolean = true;
  public isLoading: boolean = true;
  public isPackageImageLoading: boolean = false;

  public isImageLoading: boolean = false;
  public isImageErrorEnabled: any = false;
  public isItemImageErrorEnabled: any = false;

  public countries: any = [];
  public courier_form: FormGroup;
  public assistant_form: FormGroup;
  public selectedType: any = 'courier';
  public current_date: any = new Date();

  public image_urls: any = {};
  public item_image_urls: any = {};

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
  public itemSource:any = [];
  public index = 0;

  public item_event : number;
  public weightUnit = 'kg';
  public weightUnitPlaceholder = 'Weight (kg)';

  public token_object: any = '';
  public jwtHelper: JwtHelperService = new JwtHelperService();

  myFormValueChanges$;

  public next_date: any = new Date(new Date().setDate(new Date().getDate() + 1));

  constructor(public router: Router,
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    public _formBuilder: FormBuilder,
    private el: ElementRef,
    private toastr: ToastrService) {

    this.courier_form = this._formBuilder.group({
      // from_date: [null, Validators.compose([Validators.required])],
      // to_date: [null, Validators.compose([Validators.required])],
      from_date: [this.current_date, Validators.compose([Validators.required])],
      to_date: [this.next_date, Validators.compose([Validators.required])],
      package_name: [null, Validators.compose([Validators.required])],
      package_description: [null, Validators.compose([Validators.required])],
      package_weight: [0, Validators.compose([Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])],
      weight_unit:['kg'],
      size: [null, Validators.compose([Validators.required])],
      items:this._formBuilder.array([
        // load first row at start
        this.getItems()
     ]),
     receiver_name: [null, Validators.compose([Validators.required])],
     receiver_contact_no: [null, Validators.compose([Validators.required, Validators.pattern(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)])],
     receiver_email_id: [null, Validators.compose([Validators.required,Validators.email])],
     
    });

    this.assistant_form = this._formBuilder.group({
      assistance_id: [null],
      // from_date: [null, Validators.compose([Validators.required])],
      // to_date: [null, Validators.compose([Validators.required])],
      from_date: [this.current_date, Validators.compose([Validators.required])],
      to_date: [this.next_date, Validators.compose([Validators.required])],
      members: [0, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+[0-9]*$/)])],
      description: [null, Validators.compose([Validators.required])],
      requested: [null, Validators.compose([Validators.required])],
    })
  } 

  ngOnInit() {
    this.token_object = this.jwtHelper.decodeToken(this._userService.getToken());
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit('page_identification', page_param);
    window.scroll(0, 0);
    this.isLoading = true;
    this.isMainLoading = false;
    this.isLoading = false;
    this.myFormValueChanges$ = this.courier_form.controls['items'].valueChanges;
  }

  private getItems() {
    return this._formBuilder.group({
      item_name: [null, Validators.compose([Validators.required])],
      item_weight: [0, Validators.compose([Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])],
      item_value: [0, Validators.compose([Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])],      
      itemphoto:[],
      item_images:[null]
    });
  }

  public onSubmitCourier(formData, formDirective: FormGroupDirective) {
    console.log("formData", formData.value);
    if (formData.valid) {     
      if (this.image_files.length > 0 && this.item_image_files.length>0) {
        this.isImageErrorEnabled = false;
        this.isItemImageErrorEnabled = false;
        let itemname = [];
        let itemweight = [];
        let itemvalue = [];
        if(formData.value.items.length == this.item_image_files.length){
          this.isLoading = true;
        async.forEach(formData.value.items, function (list) {
          itemname.push(list.item_name);
          itemweight.push(list.item_weight);
          itemvalue.push(list.item_value);
        })

        var param_data = {
          // departure: formData.value.departure,
          // destination: formData.value.destination,
          from_date: moment(formData.value.from_date).format('YYYY-MM-DD HH:mm:ss'),
          to_date: moment(formData.value.to_date).format('YYYY-MM-DD HH:mm:ss'),
          package_name: formData.value.package_name,
          package_description: formData.value.package_description,
          package_weight: formData.value.package_weight,
          weight_unit:formData.value.weight_unit,
          size: formData.value.size,
          item_name: itemname.toString(),
          item_weight: itemweight.toString(),
          item_value: itemvalue.toString(),
          package_images: this.image_files.toString(),
          item_images: this.item_image_files.toString(),
          receiver_name:formData.value.receiver_name,
          receiver_contact_no:formData.value.receiver_contact_no,
          receiver_email_id:formData.value.receiver_email_id,
        }
        var api_url = this._globalService.apiHost + '/CreateCourierRequest';
        this._http.post(api_url, param_data, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
          .subscribe(res => {
            if (res['status'] == 'ok') {
              this.isLoading = false;
              formDirective.resetForm();
              this.image_urls = {};
              this.item_image_urls = {};
              this.image_files = '';
              this.item_image_files = [];
              this.toastr.success('Successfully created request for courier');
              let requestType = { type: 'courier' };
              localStorage.setItem('viewrequest', JSON.stringify(requestType));
              this.router.navigate(['/viewrequest']);
            }
          });
        }else{
            this.toastr.warning('Please attach the item images');
          }
      }
      else {
        this.isLoading = false;
        this.toastr.error('Please attach the images');
        this.isImageErrorEnabled = true;
        this.isItemImageErrorEnabled = true;
        return;
      }
    } else {
      this.isLoading = false;
    }
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
            this.toastr.success('Successfully created request for assistant');
            let requestType = { type: 'assistance' };
            localStorage.setItem('viewrequest', JSON.stringify(requestType));
            this.router.navigate(['/viewrequest']);
          } else {
            this.isLoading = false;
          }
        });
    } else {
      this.isLoading = false;
    }
  }

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

      this.isPackageImageLoading = true;
      var apiUrl = this._globalService.apiHost + '/PackageImageUpload';
      this._http.post(apiUrl, formData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.isPackageImageLoading = false;
            this.isImageErrorEnabled = false;
            this.isItemImageErrorEnabled = false;            
            this.image_files=res['filename'];
            // this.image_urls.push(this.api_host + '/static/item_images/' + res['filename']);
            this.image_urls={
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

  public onSelectItemFile(event,index) {
    let inputEl: HTMLInputElement = this.el.nativeElement.querySelector('#itemphoto_'+index);

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
      this.item_image_loader[index].load= true;
      var apiUrl = this._globalService.apiHost + '/ItemImageUpload';
      this._http.post(apiUrl, formData, { headers: new HttpHeaders({ 'Authorization': this._userService.getToken() }) })
        .subscribe(res => {
          if (res['status'] == 'ok') {
            this.item_image_loader[index].load= false;
            this.isItemImageErrorEnabled = false;
            // console.log("res['filename']",res['filename']);

            this.item_image_files.push(res['filename']);
            // this.image_urls.push(this.api_host + '/static/item_images/' + res['filename']);
            this.item_image_urls={
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
            // console.log("this.courier",this.courier_form.controls['items'].value);
            // console.log("this.courier",faControl.value);
          } else {
            this.item_image_loader[index].load= false;
          }
        });
    } else {
      this.item_image_loader[index].load= false;
    }

  }

  public typeChange($event) {
    this.isLoading = true;
    this.selectedType = $event.value;
    this.isLoading = false;
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

  gotoViewRequest() {
    let requestType = { type: 'courier' };
    localStorage.setItem('viewrequest', JSON.stringify(requestType));
    this.router.navigate(['/viewrequest']);
  } 
   /**
   * Add new unit row into form
   */
  addItem() {
    this.index = this.index+1;
    // console.log("array index",this.index );

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
  }

  /**
   * Remove unit row from form on click delete button
   */
  removeItem(i: number) {
    const control = <FormArray>this.courier_form.controls['items'];
    control.removeAt(i);
  }

  selectWeightUnit(event){
    // console.log("weight event", event);
    this.weightUnitPlaceholder = "Weight ("+event.value+")";
  }

}
