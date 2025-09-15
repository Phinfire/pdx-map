import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlabMapViewComponent } from './slab-map-view.component';

describe('SlabMapViewComponent', () => {
  let component: SlabMapViewComponent;
  let fixture: ComponentFixture<SlabMapViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlabMapViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlabMapViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
