import { TestBed } from '@angular/core/testing';

import { FireDrillService } from './fire-drill.service';

describe('FireDrillService', () => {
  let service: FireDrillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FireDrillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
