/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChartService } from './chart.service';

describe('Service: ChartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChartService]
    });
  });

  it('should ...', inject([ChartService], (service: ChartService) => {
    expect(service).toBeTruthy();
  }));
});
