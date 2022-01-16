import { TestBed } from '@angular/core/testing';

import { StoreRegionService } from './store-region.service';

describe('StoreRegionService', () => {
  let service: StoreRegionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreRegionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
