import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditshipmentComponent } from './editshipment.component';

describe('EditshipmentComponent', () => {
  let component: EditshipmentComponent;
  let fixture: ComponentFixture<EditshipmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditshipmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditshipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
