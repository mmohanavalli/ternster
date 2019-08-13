import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewshipmentComponent } from './viewshipment.component';

describe('ViewshipmentComponent', () => {
  let component: ViewshipmentComponent;
  let fixture: ComponentFixture<ViewshipmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewshipmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewshipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
