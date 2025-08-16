import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolygonSelectComponent } from './polygon-select.component';

describe('PolygonSelectComponent', () => {
  let component: PolygonSelectComponent;
  let fixture: ComponentFixture<PolygonSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolygonSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolygonSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
