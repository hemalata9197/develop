import { Component, OnInit } from '@angular/core';
// import { IncidentReportComponent } from '../incident-report/incident-report.component';
import { FireDrillSummaryReportComponent } from '../../../EMS/Components/reports/Reports/fire-drill-summary-report.component';
import { DynamicReportComponent } from '../dynamic-report/dynamic-report.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
interface Report {
  title: string;
  columns: { key: string; label: string }[];
  data: any[];
}
@Component({
  selector: 'app-report-container',
   standalone: true,
  imports:  [CommonModule, HttpClientModule, DynamicReportComponent,FormsModule,FireDrillSummaryReportComponent],
  templateUrl: './report-container.component.html',
  styleUrl: './report-container.component.css'
})
export class ReportContainerComponent implements OnInit{
    selectedReport = 'incident';
    report: Report = {
    title: '',
    columns: [],
    data: []
    
  };

ngOnInit() {
  this.selectedReport = 'incident';
  this.loadReport();
}


 loadReport() {
    this.report = { title: '', columns: [], data: [] };
  }
 setReport(event: Report) {
    this.report = event;
  }
  }
