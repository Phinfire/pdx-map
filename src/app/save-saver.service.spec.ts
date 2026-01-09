import { TestBed } from '@angular/core/testing';

import { SaveSaverService } from './save-saver.service';

describe('SaveSaverService', () => {
  let service: SaveSaverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaveSaverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});