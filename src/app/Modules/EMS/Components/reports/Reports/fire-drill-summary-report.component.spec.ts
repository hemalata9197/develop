import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FireDrillSummaryReportComponent } from './fire-drill-summary-report.component';

describe('FireDrillSummaryReportComponent', () => {
  let component: FireDrillSummaryReportComponent;
  let fixture: ComponentFixture<FireDrillSummaryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FireDrillSummaryReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FireDrillSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
