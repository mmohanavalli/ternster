import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindatripsComponent } from './findatrips.component';

describe('FindatripsComponent', () => {
  let component: FindatripsComponent;
  let fixture: ComponentFixture<FindatripsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindatripsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindatripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
