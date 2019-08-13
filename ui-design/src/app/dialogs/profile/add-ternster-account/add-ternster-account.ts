import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormGroupDirective,
  NgForm
} from "@angular/forms";
import { GlobalService } from "src/app/model/global.service";
import { UserService } from "src/app/model/user.service";
import { ToastrService } from "ngx-toastr";
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders
} from "@angular/common/http";
import { Util } from "src/app/shared/util";

@Component({
  selector: "add-ternster-account",
  templateUrl: "./add-ternster-account.html"
})
export class AddTernsterAccountDialog extends Util {
  public message: any = "";
  public location_status: any = "";

  public accounts_form: FormGroup;
  public isLoading: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<AddTernsterAccountDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _form: FormBuilder,
    public _globalService: GlobalService,
    public _userService: UserService,
    private _http: HttpClient,
    private toastr: ToastrService
  ) {
    super();
    this.location_status = this.data.stage;
    this.accounts_form = this._form.group(
      {
        account_no: [
          this.data.account_no,
          Validators.compose([
            Validators.required,
            Validators.pattern(new RegExp("[0-9]{9,18}"))
          ])
        ],
        retype_account_no: [""],
        ifsc_code: [
          this.data.ifsc_code,
          Validators.compose([
            Validators.required,
            Validators.pattern(new RegExp("^[A-Za-z]{4}[a-zA-Z0-9]{7}$"))
          ])
        ],
        account_holder_name: [
          this.data.account_holder_name,
          Validators.compose([Validators.required])
        ],
        bank_name: [
          this.data.bank_name,
          Validators.compose([Validators.required])
        ],
        bank_address: [
          this.data.bank_address,
          Validators.compose([Validators.required])
        ]
      },
      {
        validators: [
          this.checkAccountNumberMatch.bind(this),
          this.checkAccountNumberAlreadyExists.bind(this)
        ]
      }
    );
  }
  checkAccountNumberMatch(group: FormGroup) {
    let pass = group.controls.account_no.value;
    let confirmPass = group.controls.retype_account_no.value;

    return pass === confirmPass
      ? group.get("retype_account_no").setErrors(null)
      : group.get("retype_account_no").setErrors({ accountNumberMatch: true });
  }
  checkAccountNumberAlreadyExists(group: FormGroup) {
    this._http
      .get(
        this._globalService.apiHost +
        "/CheckAccountNumberAlreadyExists/" +
        group.controls.account_no.value,
        {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        }
      )
      .subscribe(res => {
        group.get("account_no").errors
          ? group.get("account_no").setErrors({
            ...group.get("account_no").errors,
            ...{
              checkAccountNumberAlreadyExists:
                res["response"].checkAccountNumberAlreadyExists
            }
          })
          : group.get("account_no").setErrors(
            res["response"].checkAccountNumberAlreadyExists
              ? {
                checkAccountNumberAlreadyExists:
                  res["response"].checkAccountNumberAlreadyExists
              }
              : null
          );
      });
  }

  ngOninit() {
    console.log("sasas" + this.data);
    this.accounts_form.setValue({
      account_no: this.accounts_form.value.account_no,
      retype_account_no: this.accounts_form.value.retype_account_no,
      ifsc_code: this.accounts_form.value.ifsc_code,
      account_holder_name: this.accounts_form.value.account_holder_name,
      bank_name: this.accounts_form.value.bank_name,
      bank_address: this.accounts_form.value.bank_address
    });
  }

  public onSubmitAccounts() {
    if (this.accounts_form.valid) {
      let formData = this.accounts_form.value;
      this.isLoading = true;
      var post_data = {
        account_no: formData.account_no,
        retype_account_no: formData.retype_account_no,
        ifsc_code: formData.ifsc_code,
        account_holder_name: formData.account_holder_name,
        bank_name: formData.bank_name,
        bank_address: formData.bank_address
      };
      var api_url = this._globalService.apiHost + "/CreateBankAccountDetails";
      this._http
        .post(api_url, post_data, {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(
          res => {
            let msg = 'success'
            this.toastr.success(res["message"]);
            this.dialogRef.close(msg);
          },
          error => {
            error.error["message"] != "Internal Server Error"
              ? this.toastr.error(error.error["message"])
              : this.toastr.error("something went wrong please try again!");
            if (this.location_status != "initial") {
              this.dialogRef.close();
            }

          }
        );
    } else {
      this.isLoading = false;
    }
  }
}
