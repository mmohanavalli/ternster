import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TernsterAccountsDialogComponent } from './ternster-accounts-dialog.component';

describe('TernsterAccountsDialogComponent', () => {
  let component: TernsterAccountsDialogComponent;
  let fixture: ComponentFixture<TernsterAccountsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TernsterAccountsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TernsterAccountsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
