import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsertripsComponent } from './usertrips.component';

describe('UsertripsComponent', () => {
  let component: UsertripsComponent;
  let fixture: ComponentFixture<UsertripsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsertripsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsertripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
