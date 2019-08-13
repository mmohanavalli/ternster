import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicprofileComponent } from './basicprofile.component';

describe('BasicprofileComponent', () => {
  let component: BasicprofileComponent;
  let fixture: ComponentFixture<BasicprofileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasicprofileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
