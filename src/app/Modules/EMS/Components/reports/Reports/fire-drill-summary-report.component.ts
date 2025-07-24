import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ReportService } from '../../../Services/report.service';
import { ExportService } from '../../../../Shared/Export/export.service';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import moment from 'moment';
import { MasterService } from '../../../Services/master.service';
@Component({
  selector: 'app-fire-drill-summary-report',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxDaterangepickerMd],
  templateUrl: './fire-drill-summary-report.component.html',
  styleUrl: './fire-drill-summary-report.component.css'
})
export class FireDrillSummaryReportComponent implements OnInit {
  filterForm!: FormGroup;
  reportType = 'FireDrillSummary';
  unitId = 1; // <-- Set unitId dynamically or hardcode for test
  title = '';
  reportFields: any[] = [];
  reportData: any[] = [];
  exportData: any[] = [];
  pageIndex = 1;
  pageSize = 10;
  totalCount = 0;
  AreaList: any[] = [];
  sectionList: any[] = [];
  FilteredSectionList: any[] = [];
  scenarioList: any[] = [];
  isApplyFilter = false;
  empId: number = 0;
  visibleFilters: string[] = [];

  @ViewChild('picker') pickerDirective!: DaterangepickerDirective;

  constructor(private fb: FormBuilder, private reportService: ReportService, private exportService: ExportService, private masterservice: MasterService) { }

  ngOnInit(): void {
    const empIdString = sessionStorage.getItem('employeeId');
    this.empId = empIdString ? parseInt(empIdString, 10) : 0;
    this.initForm();
    this.loadDropdowns();
    this.selectReport(this.reportType);
  }
  initForm() {
    //  const today =  moment();
    const today = moment();
    const oneMonthAgo = moment().subtract(1, 'months');
    const fifteenDaysAgo = moment().subtract(15, 'days'); // 15 days before today
    this.filterForm = this.fb.group({
      selected: [{
        startDate: oneMonthAgo,
        endDate: today
      }],
      facility1Id: [''],
      facility2Id: [''],
      scenarioId: [''],
      unitId: [1],
      refNo: []
    });
  }
  openfilter(): void {
    this.isApplyFilter = !this.isApplyFilter;
  }

  loadDropdowns() {
    const Unitid = 1
    this.masterservice.getAreas('FacilityMaster-Area', Unitid).subscribe(data => this.AreaList = data);
    this.masterservice.getSections('FacilityMaster-Section', Unitid).subscribe(data => {
      this.sectionList = data;
      this.FilteredSectionList = [...data]; // initially show all
    });
    this.masterservice.getScenarios('ScenarioMaster', Unitid).subscribe(data => this.scenarioList = data);
  }

  onAreaChange(): void {
    const selectedAreaId = this.filterForm.get('facility1Id')?.value;
    // this.FilteredSectionList = this.SectionList.filter(s => s.parentId === +selectedAreaId);
    if (!selectedAreaId) {
      // If no area selected (empty string or null), show all sections
      this.FilteredSectionList = [...this.sectionList];
    } else {
      // Otherwise, filter sections by parentId
      this.FilteredSectionList = this.sectionList.filter(
        s => s.parentId === +selectedAreaId
      );
    }
    // Clear selected Section if it doesn't belong to selected Area
    const currentSectionId = this.filterForm.get('facility2id')?.value;
    const exists = this.FilteredSectionList.some(s => s.id === +currentSectionId);
    if (!exists) {
      this.filterForm.patchValue({ facility2id: '' });
    }
  }
  openDatepicker(): void {
    this.pickerDirective.open();
  }
  onSearch() {
    this.pageIndex = 1;
    this.selectReport(this.reportType);
  }
  selectReport(type: string, shouldReset: boolean = false) {
    this.pageIndex = 1;
    this.reportType = type;
    this.title = this.getTitle(type);
    this.visibleFilters = this.filterConfigMap[type] || []; 
    
  if (shouldReset) {
    this.resetFilters();
  }
  
    this.fetchFieldsAndData();
      
  }
  resetFilters() {
  this.filterForm.reset({
    selected: {
      startDate: moment().subtract(1, 'months'),
      endDate: moment()
    },
    facility1Ids: [],
    facility1Id: '',
    facility2Id: '',
    scenarioId: '',
    unitId: this.unitId,
    refNo: ''
  });

  // Also reset filtered section list if needed
  this.FilteredSectionList = [...this.sectionList];
}
  filterConfigMap: { [key: string]: string[] } =
    {
      FireDrillSummary: ['Area', 'Section', 'Scenario', 'RefNo'],
      RecommandationSummary: ['Area','RefNo'],
      ComplianceReport: ['Area']
    };

  async fetchFieldsAndData() {
    try {
      const fieldRes = await this.reportService.getFields(this.reportType, this.unitId).toPromise();
      this.reportFields = fieldRes.fields;
      this.fetchData();
    } catch (err) {
      console.error('Error loading fields:', err);
    }
  }

  fetchData() {
    const formValue = this.filterForm.value;

    let params = new HttpParams()
      .set('pageIndex', (this.pageIndex - 1).toString()) // 0-based index
      .set('pageSize', this.pageSize.toString())
      .set('reportType', this.reportType)
      .set('unitId', this.unitId);

    Object.keys(formValue).forEach(key => {
      const value = formValue[key];

      if (key === 'selected' && value?.startDate && value?.endDate) {
        const fromDate = value.startDate.format('YYYY-MM-DD');
        const toDate = value.endDate.format('YYYY-MM-DD');
        params = params.set('fromDate', fromDate).set('toDate', toDate);
      } else if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });
    this.reportService.getData(params).subscribe(res => {
      this.reportData = res.data || [];
      this.exportData = res.data || [];
      this.totalCount = res.totalCount;

      console.log("reportData",this.reportData)

    });
  }

  nextPage() {
    if ((this.pageIndex * this.pageSize) < this.totalCount) {
      this.pageIndex++;
      this.fetchData();
    }
  }

  prevPage() {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.fetchData();
    }
  }

  get maxPage(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  exportToExcel() {
    const formatted = this.exportData.map(row => {
      const result: any = {};
      this.reportFields.forEach(f => {
        result[f.label] = row[f.name];
      });
      return result;
    });
    this.exportService.exportToExcel(formatted, this.title);
  }

  exportToPDF() {
    const formatted = this.exportData.map(row => {
      const result: any = {};
      this.reportFields.forEach(f => {
        result[f.label] = row[f.name];
      });
      return result;
    });
    this.exportService.exportToPDF(formatted, this.title);
  }

  getTitle(type: string): string {
    switch (type) {
      case 'FireDrillSummary': return 'Fire Drill Summary Report';
      case 'RecommandationSummary': return 'Recommendation Summary Report';
      case 'ComplianceReport': return 'Recommendation Compliance Report';
      default: return 'Report';
    }
  }
}
