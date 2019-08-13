import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripactionComponent } from './tripaction.component';

describe('TripactionComponent', () => {
  let component: TripactionComponent;
  let fixture: ComponentFixture<TripactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
