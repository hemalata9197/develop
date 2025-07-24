import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FireDrillService } from '../../Services/fire-drill.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import moment from 'moment';
import { MasterService } from '../../Services/master.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-list-emergency',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxDaterangepickerMd],
  templateUrl: './list-emergency.component.html',
  styleUrl: './list-emergency.component.css'
})
export class ListEmergencyComponent implements OnInit {
  filterForm!: FormGroup;
  fireDrills: any[] = [];
  pagedData: any[] = [];
  pageIndex = 1;
  pageSize = 10;
  totalCount = 0;
  AreaList: any[] = [];
  sectionList: any[] = [];
  FilteredSectionList: any[] = [];
  scenarioList: any[] = [];
  isApplyFilter = false;
  empId: number = 0;
  role:string='';
  @ViewChild('picker') pickerDirective!: DaterangepickerDirective;

  constructor(private snackBar: MatSnackBar,private fb: FormBuilder, private FireDrillService: FireDrillService, private router: Router,private masterservice:MasterService) { }

  ngOnInit(): void {
    const empIdString = sessionStorage.getItem('employeeId');
    this.empId = empIdString ? parseInt(empIdString, 10) : 0;
     const roleStored = sessionStorage.getItem('role');
     this.role = roleStored ? roleStored.toLowerCase() : '';
    this.initForm();
    this.loadDropdowns();
    this.getFireDrills();
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
    this.masterservice.getAreas('FacilityMaster-Area',Unitid).subscribe(data => this.AreaList = data);
    this.masterservice.getSections('FacilityMaster-Section',Unitid).subscribe(data => {
      this.sectionList = data;
      this.FilteredSectionList = [...data]; // initially show all
    });
    this.masterservice.getScenarios('ScenarioMaster',Unitid).subscribe(data => this.scenarioList = data);
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

  getFireDrills() {
    const formValue = this.filterForm.value;

    let params = new HttpParams()
      .set('pageIndex', (this.pageIndex - 1).toString()) // 0-based index
      .set('pageSize', this.pageSize.toString())
      .set('loginUserId', this.empId)
      .set('role', this.role);
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
    console.log("params", params)
    this.FireDrillService.getFireDrills(params).subscribe(res => {
      this.pagedData = res.data || [];
      this.totalCount = res.totalCount || 0;
      console.log("totalCount", this.totalCount)

      // 💡 Handle edge case: if pageIndex is now out of range after filtering
      const maxPage = Math.ceil(this.totalCount / this.pageSize) || 1;
      console.log("MaxPage", maxPage)
      if (this.pageIndex > maxPage) {
        this.pageIndex = 1;
        this.getFireDrills();  // Reload valid page
      }
    });
  }

  nextPage() {
    if ((this.pageIndex * this.pageSize) < this.totalCount) {
      this.pageIndex++;
      this.getFireDrills();
    }
  }

  prevPage() {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.getFireDrills();
    }
  }
  get maxPage(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  onSearch() {
    this.pageIndex = 1;
    this.getFireDrills();
  }
  onViewEdit(drill: any) {
    if (drill.entryStatus === 'complete') {
      this.router.navigate(
        ['/submit-emergency', drill.fireDrillId],
        {
          queryParams: {
            mode: 'view',
            RefNo: drill.refNo,
            entryStatus: drill.entryStatus,
            status: 'complete',
            isReview: drill.isReview,
            isReleased: drill.isReleased


          }
        }
      );
    }
    else {
      this.router.navigate(
        ['/submit-emergency', drill.fireDrillId],
        {
          queryParams: {
            mode: 'edit',
            RefNo: drill.refNo,
            entryStatus: drill.entryStatus,
            status: 'submit',

          }
        }
      );
    }

  }
  onReview(drill: any) {
    //this.router.navigateByUrl(`/submit-emergency/${drill.fireDrillId}`);
    this.router.navigate(
      ['/submit-emergency', drill.fireDrillId],
      {
        queryParams: {
          mode: 'edit',
          RefNo: drill.refNo,
          entryStatus: drill.entryStatus,
          status: 'review',

        }
      }
    );
  }
  onRelease(drill: any) {
    //this.router.navigateByUrl(`/submit-emergency/${drill.fireDrillId}`);
    this.router.navigate(
      ['/submit-emergency', drill.fireDrillId],
      {
        queryParams: {
          mode: 'edit',
          RefNo: drill.refNo,
          entryStatus: drill.entryStatus,
          status: 'released',

        }
      }
    );
  }
  onDelete(drill: any): void {
  const confirmChange = confirm(
    `Are you sure you want to delete the Fire Drill entry with Reference No: "${drill.refNo}"?`
  );

  if (confirmChange) {   

     this.FireDrillService.DeleteFireDrill(drill.fireDrillId,this.empId).subscribe({
           next: (res: any) => {
          //   alert('Deleted successfully!');
              alert(res.message || "deleted successfully.");
                this.getFireDrills();
         
          },
          error: (err) => {
        alert("Something went wrong. Please try again.");
      }
        });
  }
}
  openDatepicker(): void {
    this.pickerDirective.open();
  }
  canShowRow(drill: any): boolean {
  const isAdmin = this.role === 'admin' || this.role === 'superadmin';
  const isAreaHod = drill.areaHOD === this.empId;
  const inValueIds = drill.valueIds?.split(',').map((id: string) => +id.trim()).includes(this.empId);

  return isAdmin || isAreaHod || inValueIds;
}
canReview(drill: any): boolean {
  const isAreaHod = drill.areaHOD === this.empId;

  return (
    drill.entryStatus === 'complete' &&
    !drill.isReview &&
    isAreaHod
  );
}
canRelease(drill: any): boolean {
  const inValueIds = drill.valueIds?.split(',').map((id: string) => +id.trim()).includes(this.empId);

  return (
    drill.entryStatus === 'complete' &&
    drill.isReview &&
    !drill.isReleased &&
    inValueIds
  );
}
//   canReview(drill: any): boolean {
//   if (drill.entryStatus !== 'complete' || drill.isReview) {
//     return false;
//   }

//   if (!drill.valueIds) return false;

//   const allowedIds = drill.valueIds.split(',').map((id: string) => +id.trim());
//   return allowedIds.includes(this.empId);
// }
// canRelease(drill: any): boolean {
//   if (
//     drill.entryStatus !== 'complete' ||
//     !drill.isReview ||
//     drill.isReleased
//   ) {
//     return false;
//   }

//   if (!drill.valueIds) return false;

//   const allowedIds = drill.valueIds.split(',').map((id: string) => +id.trim());
//   return allowedIds.includes(this.empId);
// }

}

