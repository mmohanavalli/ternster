import { Component, OnInit } from "@angular/core";
import { EditTernsterAccountDialog } from "src/app/dialogs/profile/edit-ternster-account";
import { RequestMoneyDialog } from "src/app/dialogs/profile/request-money";
import { MatDialog } from "@angular/material";
import { GlobalService } from "src/app/model/global.service";
import { UserService } from "src/app/model/user.service";
import { JwtHelperService } from "@auth0/angular-jwt";
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
  HttpParams
} from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { FormControl, FormGroup, FormBuilder } from "@angular/forms";
import Swal from "sweetalert2";
import { AddTernsterAccountDialog } from 'src/app/dialogs/profile/add-ternster-account/add-ternster-account';

@Component({
  selector: "app-wallet",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.css"]
})
export class WalletComponent implements OnInit {
  public isLoading = true;
  public editcurrency: boolean = false;

  public profile: boolean = false;
  public settings: boolean = false;
  public wallet: boolean = true;
  public messages: boolean = false;
  public change_pwd: boolean = false;

  public account_no: any = "";
  public retype_account_no: any = "";
  public ifsc_code: any = "";
  public account_holder_name: any = "";
  public bank_name: any = "";
  public bank_address: any = "";

  public jwtHelper: JwtHelperService = new JwtHelperService();
  public token_object: any = "";

  public base_currency: FormControl = new FormControl("");
  public base_currency_code: string = "";
  public base_currency_symbol: string = "";
  public base_currency_minimum_amount_withdraw: number = 0;

  public transcationForm: FormGroup;

  public available_balance: number = 0;
  public pending_balance: number = 0;

  public user_transaction_details: any = [];

  public currencyList: any = [];

  public bankAccountDetails: any = [];

  constructor(
    public dialog: MatDialog,
    private _http: HttpClient,
    public _globalService: GlobalService,
    public _userService: UserService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.transcationForm = this.fb.group({
      payment_status: "",
      from_date: "",
      to_date: "",
      currency_id: ""
    });
    this.getUserTransactions();
    this.transcationForm.patchValue({
      payment_status: "all"
    });
  }

  ngOnInit() {
    this.token_object = this.jwtHelper.decodeToken(
      this._userService.getToken()
    );
    var page_param = { user_id: this.token_object.id, url: null };
    this._globalService.socket.emit("page_identification", page_param);
    this.isLoading = false;
    this.getCurrencyList();
    this.getUserAccountDetails();
    this.getUserProfileData();
    this.getWalletDetails();
  }

  openAccountDetails(index, event) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(EditTernsterAccountDialog, {
      width: "600px",
      disableClose: true,
      data: {
        id: this.bankAccountDetails[index].id,
        account_no: this.bankAccountDetails[index].account_no,
        retype_account_no: this.bankAccountDetails[index].account_no,
        ifsc_code: this.bankAccountDetails[index].ifsc_code,
        account_holder_name: this.bankAccountDetails[index].account_holder_name,
        bank_name: this.bankAccountDetails[index].bank_name,
        bank_address: this.bankAccountDetails[index].bank_address
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getUserAccountDetails();
    });
  }

  addAccountDetails() {
    if (this.bankAccountDetails.length < 5) {
      const dialogRef = this.dialog.open(AddTernsterAccountDialog, {
        width: "600px",
        disableClose: true,
        data: {
          account_no: "",
          ifsc_code: "",
          account_holder_name: "",
          bank_name: "",
          bank_address: ""
        }
      });
      dialogRef.afterClosed().subscribe(response => {
        this.getUserAccountDetails();
      });
    } else {
      Swal.fire({
        title: "Account Create",
        text: "Maximum five accounts can be created.",
        type: "warning",
        allowOutsideClick: false
      }).then(result => {});
    }
  }

  public getUserAccountDetails() {
    var api_url = this._globalService.apiHost + "/GetBankAccountDetails";
    this._http
      .get(api_url, {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(res => {
        this.bankAccountDetails = res["response"];
      });
  }

  private setBaseCurrency() {
    this.base_currency.valueChanges.subscribe(currency => {
      let requestData = { base_currency: currency };
      this._http
        .post(this._globalService.apiHost + "/SetBaseCurrency", requestData, {
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(
          response => {
            console.log(
              "checking the set base  currency  response...",
              response
            );
            const checkCurrency = this.currencyList.filter(
              value => value.id == currency
            );
            this.base_currency_code = checkCurrency[0].code.toUpperCase();
            this.base_currency_symbol = checkCurrency[0].symbol.toUpperCase();
            this.base_currency_minimum_amount_withdraw =
              checkCurrency[0].minimum_amount;
            this.toastr.success(response["message"]);
            this.editcurrency = !this.editcurrency;
          },
          error => {
            error.error["message"] != "Internal Server Error"
              ? this.toastr.error(error.error["message"])
              : this.toastr.error("something went wrong please try again!");
          }
        );
    });
  }

  private getUserProfileData() {
    this._http
      .get(this._globalService.apiHost + "/GetUserProfileData", {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(response => {
        if (response["status"] == "ok") {
          let currency = response["data"].User.currency;
          this.base_currency.patchValue(currency.id);
          this.base_currency_code = currency.code.toUpperCase();
          this.base_currency_symbol = currency.symbol.toUpperCase();
          this.base_currency_minimum_amount_withdraw = currency.minimum_amount;
          this.setBaseCurrency();
        }
      });
  }

  private getWalletDetails() {
    this._http
      .get(this._globalService.apiHost + "/GetUserWalletDetails", {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(response => {
        this.available_balance = response["response"].available_balance;
        this.pending_balance = response["response"].pending_balance;
      });
  }

  private getCurrencyList() {
    this._http
      .get(this._globalService.apiHost + "/GetCurrencyList")
      .subscribe(response => {
        this.currencyList = response["response"];
      });
  }

  private sendPayoutRequest() {
    this._http
      .get(this._globalService.apiHost + "/SendPayoutRequest", {
        headers: new HttpHeaders({
          Authorization: this._userService.getToken()
        })
      })
      .subscribe(
        response => {
          this.toastr.success(response["message"]);
        },
        error => {
          this.toastr.error(error.error["message"]);
        }
      );
  }

  private getUserTransactions() {
    this.transcationForm.valueChanges.subscribe(data => {
      let params = new HttpParams();
      params = params.append("payment_status", data.payment_status);
      params = params.append("from_date", data.from_date);
      params = params.append("to_date", data.to_date);
      params = params.append("currency_id", data.currency_id);
      this._http
        .get(this._globalService.apiHost + "/GetUserTransations", {
          params: params,
          headers: new HttpHeaders({
            Authorization: this._userService.getToken()
          })
        })
        .subscribe(
          response => {
            this.user_transaction_details = response["response"];
          },
          error => {
            console.log("checking the  error working ....", error);
            this.user_transaction_details = [];
          }
        );
    });
  }

  private deleteBankAccoutDetails(index, event) {
    event.stopPropagation();
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete the bank account details?",
      type: "warning",
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    }).then(result => {
      console.log("checking the result...", result);
      if (result.value) {
        this._http
          .delete(
            this._globalService.apiHost +
              "/DeleteBankAccountDetails/" +
              this.bankAccountDetails[index].id,
            {
              headers: new HttpHeaders({
                Authorization: this._userService.getToken()
              })
            }
          )
          .subscribe(
            response => {
              this.toastr.success(response["message"]);
              this.getUserAccountDetails();
            },
            error => {
              this.toastr.error("something went wrong please try again!");
            }
          );
      }
    });
  }
}
