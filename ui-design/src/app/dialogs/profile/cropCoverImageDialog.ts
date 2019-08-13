import { Component, OnInit, ElementRef, Inject, ViewChild,Pipe,PipeTransform, ViewChildren, Renderer2, ChangeDetectionStrategy, EventEmitter, QueryList } from '@angular/core';
import { ImageCropperComponent } from 'src/app/shared/image-cropper/component/image-cropper.component';
import { MatDialogRef } from '@angular/material';
import { ImageCroppedEvent } from 'src/app/shared/image-cropper/interfaces';

@Component({
    selector: 'cropcoverimageDialog',
    templateUrl: './cropCoverImageDialog.html'
  })
  
  export class CropCoverImageDialog {
    imageChangedEvent: any = '';
    croppedImage: any = '';
    showCropper = false;
    noImage: boolean = true;
    isCropDone: boolean = false;
    event: any = '';
    isCropBtnEnabled: boolean = false;
  
    @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;
  
    constructor(public dialogRef: MatDialogRef<CropCoverImageDialog>, ) { }
  
    fileChangeEvent(event: any): void {
      this.noImage = false;
      this.imageChangedEvent = event;
      this.isCropBtnEnabled = true;
    }
    imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64;
      this.event = event;
    }
    backToTrip() {
      this.croppedImage = '';
      this.isCropDone = false;
    }
    imageLoaded() {
      this.showCropper = true;
    }
    cropperReady() {
    }
    loadImageFailed() {
    }
    rotateLeft() {
      this.imageCropper.rotateLeft();
    }
    rotateRight() {
      this.imageCropper.rotateRight();
    }
    flipHorizontal() {
      this.imageCropper.flipHorizontal();
    }
    flipVertical() {
      this.imageCropper.flipVertical();
    }
    crop() {
      this.isCropDone = true;
    }
    clearImage() {
      this.imageChangedEvent = '';
      this.croppedImage = '';
      this.showCropper = false;
      this.noImage = true;
      this.isCropDone = false;
      this.event = '';
      this.isCropBtnEnabled = false;
    }
    uploadImage() {
      // var blob = this.dataURItoBlob(this.croppedImage);
      this.dialogRef.close(this.event.file);
    }
  }