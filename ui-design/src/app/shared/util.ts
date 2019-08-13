import { FormGroup, FormControl } from "@angular/forms";

export class Util {
  constructor() {}

  public isFieldValid(form: FormGroup, field: string, error: string) {
    return form.controls[field].hasError(error);
  }

  public validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
}
