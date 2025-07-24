import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../Services/task.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { MasterService } from '../../Services/master.service';
import moment from 'moment';
@Component({
  selector: 'app-task-management',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxDaterangepickerMd],
  templateUrl: './task-management.component.html',
  styleUrl: './task-management.component.css'
})
export class TaskManagementComponent implements OnInit {
  TaskSatusForm!: FormGroup;
  ApprovalForm!: FormGroup;
  filterForm!: FormGroup;
  //@ViewChild(DaterangepickerDirective)
  @ViewChild('picker') pickerDirective!: DaterangepickerDirective;
  // pickerDirective!: DaterangepickerDirective;
  pagedData: any[] = [];
  TaskStatusList: any[] = [];
  FilterTaskStatusList: any[] = [];
  ApprovalStatusList: any[] = [];
  AreaList: any[] = [];
  SectionList: any[] = [];
  FilteredSectionList: any[] = [];
  pageIndex = 1;
  pageSize = 10;
  totalCount = 0;

  minDate: string = '';
  showModal = false;
  showApproveModal = false;
  showHistoryModal=false;
  HistoryData: any[] = [];
  isApplyFilter = false;
  TargetDateExtendRequired: boolean = false;

  fireDrillId: number | null = null;
  selectedTaskId: number | null = null;
  selectedTask: any = null;
  taskCreatedForId: number | null = null;
  initialTargetDate: any = null;
    prepage: string = '';
  empId: number = 0;
   Unitid: number = 1
   role:string='';
  constructor(private fb: FormBuilder, private TaskService: TaskService, private router: Router,private masterservice:MasterService) { }
  ngOnInit(): void {
    const empIdString = sessionStorage.getItem('employeeId');
    this.empId = empIdString ? parseInt(empIdString, 10) : 0;
     const roleStored = sessionStorage.getItem('role');
     this.role = roleStored ? roleStored.toLowerCase() : '';
    this.TaskSatusForm = this.fb.group({
      taskStatusId: [0, [Validators.required, Validators.pattern('^(?!0$).*')]],
      remark: ['', Validators.required],
      targetDate: ['', Validators.required],
      uploadDocument: [null] 

    });
    this.ApprovalForm = this.fb.group({
      approvalStatusId: [0, [Validators.required, Validators.pattern('^(?!0$).*')]],
      closedRemark: ['', Validators.required],

    });
    const today = moment();
          const oneMonthAgo = moment().subtract(1, 'months'); 
            const fifteenDaysAgo = moment().subtract(15, 'days');
    this.filterForm = this.fb.group({
       selected: [{
        startDate: oneMonthAgo,
        endDate: today
      }],
      facility1id: [''],
      facility2id: [''],
      taskStatusId: [''],
      approvalStatusId: [''],
      refNo: ['']
    });
 const drill = history.state?.drill;
 const prepage = history.state?.prepage;
 this.prepage=prepage;
   if (drill) {
    if (drill.taskStatusId!==1) {
      this.OnMarkDone(drill);
    }
    else{
      this.OnApproveDone(drill);
    }
  }
    this.getAllTask();
    this.getFilterTaskstatusList();
    this.getFacility1();
    this.getFacility2();
    this.getApprovalstatusList();
    
    // const today = new Date();
    // this.minDate = today.toISOString().split('T')[0];
  }
  getFilterTaskstatusList() {
    const taskstatusFor = 'Filter';
    this.TaskService.getTaskstatus(taskstatusFor).subscribe(res => {
      this.FilterTaskStatusList = res || [];

    });
  }
  getTaskstatusList() {
    const taskstatusFor = 'ChangeStstus';
    this.TaskService.getTaskstatus(taskstatusFor).subscribe(res => {
      this.TaskStatusList = res || [];

    });
  }
  getFacility1() {
    const Source = 'FacilityMaster-Area';
    this.Unitid=1;
    this.masterservice.getAreas(Source,this.Unitid).subscribe(res => {
      this.AreaList = res || [];

    });
  }
  onAreaChange(): void {
    const selectedAreaId = this.filterForm.get('facility1id')?.value;
    // this.FilteredSectionList = this.SectionList.filter(s => s.parentId === +selectedAreaId);
    if (!selectedAreaId) {
      // If no area selected (empty string or null), show all sections
      this.FilteredSectionList = [...this.SectionList];
    } else {
      // Otherwise, filter sections by parentId
      this.FilteredSectionList = this.SectionList.filter(
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
  getFacility2() {
    const Source = 'FacilityMaster-Section';
    this.masterservice.getSections(Source,this.Unitid).subscribe(res => {
      this.SectionList = res || [];
      this.FilteredSectionList = [...this.SectionList];

    });
  }
  getApprovalstatusList() {
    this.TaskService.getApprovalstatus().subscribe(res => {
      this.ApprovalStatusList = res || [];

    });
  }
  onTaskStatusChange(event: Event) {
    const SelectedtaskStatusId = (event.target as HTMLSelectElement).value;

    const targetDateControl = this.TaskSatusForm.get('targetDate');

    if (SelectedtaskStatusId === "3") {
      this.TargetDateExtendRequired = true;
      targetDateControl?.setValidators([Validators.required]);
    } else {
      this.TargetDateExtendRequired = false;
      targetDateControl?.clearValidators();
      if (this.initialTargetDate) {
        targetDateControl?.setValue(this.initialTargetDate);
      }
    }

    targetDateControl?.updateValueAndValidity(); // VERY important to trigger validation update
  }


  getAllTask() {
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

    // const dateRange = this.filterForm.value.selected;
    // console.log('Selected Date Range:', dateRange);
    // if (dateRange?.startDate && dateRange?.endDate) {
    //   const fromDate = dateRange.startDate.format('YYYY-MM-DD');
    //   const toDate = dateRange.endDate.format('YYYY-MM-DD');

    //   params = params.set('fromDate', fromDate).set('toDate', toDate);
    // }
    // const facility1id = this.filterForm.get('facility1id')?.value;
    // const facility2id = this.filterForm.get('facility2id')?.value;

    // if (facility1id) {
    //   params = params.set('AreaId', facility1id);
    // }

    // if (facility2id) {
    //   params = params.set('SectionId', facility2id);
    // }

    // const taskStatusId = this.filterForm.get('taskStatusId')?.value;
    // if (taskStatusId) {
    //   params = params.set('taskStatusId', taskStatusId);
    // }
    // const approvalStatusId = this.filterForm.get('approvalStatusId')?.value;
    // if (approvalStatusId) {
    //   params = params.set('approvalStatusId', approvalStatusId);
    // }
    // const refNo = this.filterForm.get('refNo')?.value;
    // if (refNo && refNo.trim() !== '') {
    //   params = params.set('refNo', refNo.trim());
    // }
    this.TaskService.getAllTask(params).subscribe(res => {
      this.pagedData = res.data || [];
      this.totalCount = res.totalCount || 0;

      // 💡 Handle edge case: if pageIndex is now out of range after filtering
      const maxPage = Math.ceil(this.totalCount / this.pageSize) || 1;
      if (this.pageIndex > maxPage) {
        this.pageIndex = 1;
        this.getAllTask();  // Reload valid page
      }
    });
  }
  nextPage() {
    if ((this.pageIndex * this.pageSize) < this.totalCount) {
      this.pageIndex++;
      this.getAllTask();
    }
  }

  prevPage() {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.getAllTask();
    }
  }
  get maxPage(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  onSearch() {
    this.pageIndex = 1;
    this.getAllTask();
  }
  openfilter(): void {
    this.isApplyFilter = !this.isApplyFilter;
  }

  onSubmit() {
    if (this.TaskSatusForm.valid) {
      const formData = this.TaskSatusForm.value;


      let targetDateToSend = formData.targetDate;

      // If status is not Inprogress and no date selected, use drill target date
      if (formData.taskStatusId !== "3" && !targetDateToSend && this.selectedTask?.targetDate) {
        // Convert '25-Jun-2025' to '2025-06-25'
        const parsedDate = new Date(this.selectedTask.targetDate);
        targetDateToSend = parsedDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      }

      const updatePayload = {
        taskId: this.selectedTaskId,
        taskCreatedForId: this.taskCreatedForId,
        modifiedBy: this.empId,
        taskStatusId: +formData.taskStatusId,
        remark: formData.remark,
        targetDate: targetDateToSend,
        fireDrillId:this.fireDrillId,
         uploadDocument: formData.uploadDocument
      };

 console.log("ForDocuments",updatePayload)

      this.TaskService.UpdateTaskSatus(updatePayload).subscribe({
        next: (res: any) => {
          alert(res.message || 'Task status updated successfully');
          this.closeModal();
          if(this.prepage=="dashboard")
          {
             this.router.navigate(['./dashboard']);
          }
          else{ this.getAllTask();
          this.ResetModal();
          }
         
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Update failed. Try again.');
          this.ResetModal();
        }
      });
    }
    else {
      alert(' Please fill in all required fields before updating status.');
    }
  }
  onApprove() {
    if (this.ApprovalForm.valid) {
      const formData = this.ApprovalForm.value;
      const updatePayload = {
         taskId: this.selectedTaskId,
        taskCreatedForId: this.taskCreatedForId,
        closedby: this.empId,
        approvalStatusId: +formData.approvalStatusId,
        closedRemark: formData.closedRemark,
        fireDrillId:this.fireDrillId

      };

      this.TaskService.UpdateTaskApproval(updatePayload).subscribe({
        next: (res: any) => {
          alert(res.message || 'Task approval submitted successfully');
          this.closeApproveModal();
          this.getAllTask();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Failed to submit approval. Please try again.');
        }
      });
    }
    else {
      alert(' Please fill in all required fields before submitting approval.');
    }
  }
  OnMarkDone(drill: any) {
    this.getTaskstatusList();
    this.fireDrillId=drill.fireDrillId;
    this.selectedTaskId = drill.taskId;
    this.selectedTask = drill;
    this.taskCreatedForId = drill.taskCreatedForId;
    this.initialTargetDate = drill.targetDate?.slice(0, 10) || ''
    if (drill.taskStatusId === 3) {
      this.TargetDateExtendRequired = true;
    }
    else {
      this.TargetDateExtendRequired = false;
    }
    this.TaskSatusForm.patchValue({
      remark: drill.remarks || '',
      targetDate: drill.targetDate?.slice(0, 10) || '',
      taskStatusId: drill.taskStatusId || ''

    });
    if (drill.documentPath && drill.fileName) {
  this.TaskSatusForm.patchValue({
    uploadDocument: {
      fileName: drill.fileName,
      documentPath: drill.documentPath
    }
  });
}


    if (drill.taskStatusId === 1) {
      this.TaskSatusForm.disable();
    } else {
      this.TaskSatusForm.enable();
    }
    this.showModal = true;
  }
  OnApproveDone(drill: any) {
    this.getApprovalstatusList();
    this.taskCreatedForId = drill.taskCreatedForId;
    this.fireDrillId=drill.fireDrillId;
    this.selectedTaskId = drill.taskId;

    this.ApprovalForm.patchValue({
      closedRemark: drill.closedRemark || '',
      approvalStatusId: drill.approvalStatusId || ''

    });
    if (drill.approvalStatusId === 1) {
      this.ApprovalForm.disable();
    } else {
      this.ApprovalForm.enable();
    }
    this.showApproveModal = true;
  }
  OnHistoryClick(drill: any)
  {
    this.showHistoryModal=true;
    this.selectedTaskId = drill.taskId;

     if (this.selectedTaskId !== null) {
  this.TaskService.getTaskHistory(this.selectedTaskId).subscribe(res => {
    //this.HistoryData = res.data || [];
   
  this.HistoryData = res|| [];
  console.log("Task history response",  this.HistoryData);
  });
}
  }
  
  closeApproveModal() {
    this.showApproveModal = false;
    this.ApprovalForm.reset();
  }
  closeModal() {
    this.showModal = false;
    this.TaskSatusForm.reset();
  }
   closeHistoryModal() {
    this.showHistoryModal = false;    
  }
  ResetModal() {
    this.TaskSatusForm.reset();
  }
  ResetApprovalModal() {
    this.ApprovalForm.reset();
  }

  onView(drill: any) {
    //this.router.navigate(['/submit-emergency', drill.fireDrillId]);

    this.router.navigate(
      ['/submit-emergency', drill.fireDrillId],
      {
        queryParams: {
          mode: 'view',
          entryStatus: 'complete',
          status: 'complete',
          isReview: 'true',
          isReleased: 'true',
          prepage: 'Task'

        }
      }
    );
  }
  openDatepicker(): void {
    this.pickerDirective.open();
  }
  canApprove(drill: any): boolean {
     const isAdmin = this.role === 'admin' || this.role === 'superadmin';
  const isRespUserHOD = drill.respUserHOD === this.empId;

  return (
    drill.taskStatus === 'Complete' &&
    drill.approvalStatusId !== 1 &&
    (isRespUserHOD )
  );
}

onDragOver(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
}
onDragLeave(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
}
onFileDrop(event: DragEvent,  fieldName: string): void {
  event.preventDefault();
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    this.handleFile(files[0], fieldName);
  }
}
onFileChange(event: Event,  fieldName: string): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    this.handleFile(file, fieldName);
  }
}

handleFile(file: File, fieldName: string): void {
  // Create a temporary object to represent the selected file

    const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result as string;
    const fileData = {
      fileName: file.name,
      base64: base64,
      documentPath: base64 // or use base64 as preview path
    };

    console.log('Setting file to control:', fileData);
console.log('Control before setValue:', this.TaskSatusForm.get(fieldName)?.value);
this.TaskSatusForm.get(fieldName)?.setValue(fileData);
console.log('Control after setValue:', this.TaskSatusForm.get(fieldName)?.value);
    // this.TaskSatusForm.get(fieldName)?.setValue(fileData);

  };

  reader.readAsDataURL(file);
  // const fileData = {
  //   fileName: file.name,
  //   file: file,
  //   documentPath: '' // Set this later after uploading to server
  // };
  //  this.TaskSatusForm.get(fieldName)?.setValue(fileData);
}
isImageFile(fileName: string): boolean {
  return /\.(png|jpg|jpeg)$/i.test(fileName);
}

// ✅ Helper: Detect video file
isVideoFile(fileName: string): boolean {
  return /\.(mp4|webm|ogg|mov)$/i.test(fileName);
}

}
