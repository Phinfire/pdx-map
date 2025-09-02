import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MCSignupComponent } from './mcsignup.component';

describe('MCSignupComponent', () => {
  let component: MCSignupComponent;
  let fixture: ComponentFixture<MCSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MCSignupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MCSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
