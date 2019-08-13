import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyReceiverOtpDialog } from './verify-receiver-otp-dialog.component';

describe('VerifyReceiverOtpDialog', () => {
  let component: VerifyReceiverOtpDialog;
  let fixture: ComponentFixture<VerifyReceiverOtpDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyReceiverOtpDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyReceiverOtpDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
