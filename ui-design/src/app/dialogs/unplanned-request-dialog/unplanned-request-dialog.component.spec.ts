import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnplannedRequestDialogComponent } from './unplanned-request-dialog.component';

describe('UnplannedRequestDialogComponent', () => {
  let component: UnplannedRequestDialogComponent;
  let fixture: ComponentFixture<UnplannedRequestDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnplannedRequestDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnplannedRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
