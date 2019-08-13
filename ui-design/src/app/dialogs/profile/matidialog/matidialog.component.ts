import { Component, Inject, Pipe, PipeTransform } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from "@angular/platform-browser";
  
@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-matidialog',
  templateUrl: './matidialog.component.html',
})
export class MatiDialog{

  constructor(public dialogRef: MatDialogRef<MatiDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  public continueReq() {
    this.dialogRef.close(this.data);
  }

}
