import { TestBed } from '@angular/core/testing';

import { PdxFileService } from './pdx-file.service';

describe('PdxFileService', () => {
  let service: PdxFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdxFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
