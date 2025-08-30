import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordFieldComponent } from './discord-field.component';

describe('DiscordFieldComponent', () => {
  let component: DiscordFieldComponent;
  let fixture: ComponentFixture<DiscordFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscordFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscordFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
