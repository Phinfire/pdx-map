import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignLinesComponent } from './campaign-lines.component';

describe('CampaignLinesComponent', () => {
  let component: CampaignLinesComponent;
  let fixture: ComponentFixture<CampaignLinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignLinesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignLinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
