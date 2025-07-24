import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, FormArray, AbstractControl } from '@angular/forms';

import { FireDrillService } from '../../Services/fire-drill.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
//import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

interface ObservationPayload {
  formData: any;
  entryStatus: string;
  submittedBy: number;
  unitId: number;
  reviewBy?: number;
  reviewOn?: Date;
  reviewRemarks?: string;
  isReview?: boolean;
  releasedBy?: number;
  releasedOn?: Date;
  isReleased?: boolean;
  isreview?: string;
}
interface DropdownOption {
  id: number;
  label: string;
  parentId?: number;
}
@Component({
  selector: 'app-submit-emergency',
  imports: [CommonModule, ReactiveFormsModule ],//NgMultiSelectDropDownModule
  templateUrl: './submit-emergency.component.html',
  styleUrl: './submit-emergency.component.css'
})
export class SubmitEmergencyComponent implements OnInit {
  today: string = '';
  currentTime: string = '';
  observationForm!: FormGroup;
  sections: any[] = [];
  fullSectionOptions: DropdownOption[] = [];
  areaId: number | null = null;
  fireDrillId!: number;
  entryStatus: string = '';
  mode: string = '';
  status: string = '';
  isReview: boolean = false;
  isReleased: boolean = false;
  RefNo: string = '';
  empId: number = 0;
  prepage: string = '';
  isDragOver = false;
  sectionOpenStates: boolean[] = [];

  constructor(private fb: FormBuilder, private FireDrillService: FireDrillService, private router: Router, private ActivatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    const empIdString = sessionStorage.getItem('employeeId');
    this.empId = empIdString ? parseInt(empIdString, 10) : 0;
    // let fireDrillId = 0;
    this.sectionOpenStates = this.sections.map(() => true);
    this.fireDrillId = +this.ActivatedRoute.snapshot.paramMap.get('fireDrillId')!;
    // const paramId = this.ActivatedRoute.snapshot.paramMap.get('fireDrillId');
    const status = this.ActivatedRoute.snapshot.queryParamMap.get('status');
    const mode = this.ActivatedRoute.snapshot.queryParamMap.get('mode');
    this.ActivatedRoute.queryParams.subscribe(params => {
      this.mode = params['mode'] || 'create';
      this.status = params['status'] || '';
      this.entryStatus = params['entryStatus'] || '';
      this.RefNo = params['RefNo'] || 'Auto';
      this.isReview = params['isReview'] === 'true';
      this.isReleased = params['isReleased'] === 'true';
      this.prepage = params['prepage'] || '';

    });

    if (mode === 'view') {

    }
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
    this.currentTime = now.toTimeString().slice(0, 5);

    this.observationForm = this.fb.group({});

    this.FireDrillService.getFormFields().subscribe((sections: any[]) => {
      this.sections = sections;
      this.buildForm(this.sections);
      this.updateSectionAccess(); // Build the empty form
      this.extractFullSectionOptions();

      if (this.fireDrillId && this.fireDrillId > 0) {
        this.getFireDrillById();
      }
    });
  }
  toggleSection(index: number): void {
    this.sectionOpenStates[index] = this.sectionOpenStates[index];
  }

  getFireDrillById() {
    this.FireDrillService.getFireDrillById(this.fireDrillId).subscribe((res: any) => {
      const savedFormData = typeof res.formData === 'string'
        ? JSON.parse(res.formData)
        : res.formData;


      if (savedFormData) {
        this.patchFormWithSavedData(savedFormData);
      }
    });
  }
  patchFormWithSavedData(savedFormData: any): void {
    Object.keys(savedFormData).forEach(sectionKey => {
      const savedSectionArray = savedFormData[sectionKey];
      const formArray = this.observationForm.get(sectionKey) as FormArray;

      if (formArray && Array.isArray(savedSectionArray)) {
        formArray.clear();

        const sectionIndex = parseInt(sectionKey.split('_')[1], 10);
        const fields = this.sections[sectionIndex].fields;

        savedSectionArray.forEach((item: any) => {
          const group = this.fb.group({});

          fields.forEach((field: any) => {
            let defaultValue: any = '';

            switch (field.name) {
              case 'Filled By':
                defaultValue = item['Filled By'] || '';
                break;

              case 'Filled On':
                defaultValue = item['Filled On'] || '';
                break;

              case 'Reference No':
                defaultValue = item['Reference No'] || '';
                break;

              default:
                defaultValue = item[field.name] || '';
                break;
            }
            if (field.type === 'file') {
              const fileName = item[field.name];
              const basePath = 'https://localhost:7295'
              const rawPath = item['documentPath'] || `Attachments/FireDrill/${this.fireDrillId}/${fileName}`;
              const fullPath = rawPath.startsWith('https') ? rawPath : `${basePath}/${rawPath}`;

              const fileValue = {
                fileName: fileName || '',
                base64: '',
                //documentPath: `${basePath}/Attachments/FireDrill/${this.fireDrillId}/${fileName}`
                documentPath: fullPath
              };


              group.addControl(field.name, new FormControl(fileValue));
            } else {
              group.addControl(field.name, new FormControl(item[field.name] || ''));
            }
          });

          formArray.push(group);
        });
      }
    });
  }

 

  // Extract dropdown options for area/section
  extractFullSectionOptions(): void {
    const sectionField = this.sections
      .flatMap(s => s.fields)
      .find(f => f.name === 'section');

    if (sectionField) {
      this.fullSectionOptions = [...sectionField.options];
    }
  }
  buildForm(sections: any[]): void {
    sections.forEach((section, index) => {
      if (section.isRepeatable) {
        const fieldGroups = this.fb.array([this.createFieldGroup(section.fields)]);
        this.observationForm.addControl(`section_${index}`, fieldGroups);
      } else {
        const singleGroup = this.createFieldGroup(section.fields);
        this.observationForm.addControl(`section_${index}`, this.fb.array([singleGroup]));
      }

    });
  }
  isSectionRepeatable(section: any): boolean {
    return section.isRepeatable === true;
  }
   getDropdownSettings(field: any): any {
  const settings = {
    id: 'id',
    label: 'label',
    enableCheckAll: true,
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    allowSearchFilter: true,
    itemsShowLimit: 3,
    closeDropDownOnSelection: false
  };
  console.log('Dropdown settings for field:', field, settings);
  return settings;
}

  updateSectionAccess(): void {
    this.sections.forEach((section, index) => {
      const sectionControl = this.observationForm.get(`section_${index}`);
      if (section.id === 8) {
        if (this.status !== 'review') {
          sectionControl?.disable();
        } else {
          sectionControl?.enable();
        }
      }
    });
  }
  getMinDate(field: any): string | null {
    if (field.dateConstraint === 'noFuture') {
      return null; // No min date
    } else if (field.dateConstraint === 'noPast') {
      const today = new Date();
      return this.formatDate(today); // Only allow today and future
    }
    return null;
  }

  getMaxDate(field: any): string | null {
    if (field.dateConstraint === 'noFuture') {
      const today = new Date();
      return this.formatDate(today); // Only allow today and past
    } else if (field.dateConstraint === 'noPast') {
      return null; // No max date
    }
    return null;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  }

  createFieldGroup(fields: any[]): FormGroup {
    const group: { [key: string]: FormControl } = {};

    fields.forEach(field => {
      const validators = [];
      for (const rule of field.validations || []) {
        if (rule.rule === 'required') validators.push(Validators.required);
        if (rule.rule === 'minLength') validators.push(Validators.minLength(+rule.value));
        if (rule.rule === 'maxLength') validators.push(Validators.maxLength(+rule.value));
        if (rule.rule === 'pattern') validators.push(Validators.pattern(rule.value));
      }
      let defaultValue = '';

      // Set default values for special fields
      switch (field.name) {
        case 'Filled By':
          defaultValue = localStorage.getItem('employee_name') || 'Auto User';
          break;

        case 'Filled On':
          const today = new Date();
          const day = String(today.getDate()).padStart(2, '0');
          const month = today.toLocaleString('en-US', { month: 'short' });
          const year = today.getFullYear();
          defaultValue = `${day}.${month}.${year}`;
          break;

        case 'Reference No':
          defaultValue = this.RefNo || 'Auto';
          break;
      }


      if (field.type === 'multiselect') {
        // For multiselect, initialize with empty array or predefined default
        group[field.name] = new FormControl([], validators);
      } else {
        // Default handling for other field types
        group[field.name] = new FormControl(defaultValue, validators);
      }
    });

    return this.fb.group(group);
  }
  isRequiredField(field: any): boolean {
    return (field.validations || []).some(
      (val: any) => val.rule === 'required' && val.value === 'true'
    );
  }
  getSectionFieldGroups(sectionIndex: number): FormArray {
    return this.observationForm.get(`section_${sectionIndex}`) as FormArray;
  }

  addSectionFieldGroup(sectionIndex: number): void {
    const section = this.sections[sectionIndex];
    this.getSectionFieldGroups(sectionIndex).push(this.createFieldGroup(section.fields));
  }

  removeSectionFieldGroup(sectionIndex: number, groupIndex: number): void {
    this.getSectionFieldGroups(sectionIndex).removeAt(groupIndex);
  }
  onSubmit(): void {
    if (this.observationForm.valid) {

      const payload = {
        formData: this.observationForm.value,
        entryStatus: 'complete',
        submittedBy: this.empId,
        unitId: 1,
        status: this.status
      };

      console.log("this.observationForm.value", this.observationForm.value)


      if (this.mode === 'edit') {
        this.FireDrillService.updateForm(payload, this.fireDrillId).subscribe({
          next: (response: any) => {
            alert(response.message); // Shows: "Saved successfully"

            this.router.navigateByUrl('/list_emergency');
            this.observationForm.reset();
          },
          error: (error) => {
            console.error('Submission failed:', error);
            alert('Submission failed.');
          }
        });

      }
      else {

        this.FireDrillService.submitForm(payload).subscribe({
          next: (response: any) => {
            alert(response.message);

            this.router.navigateByUrl('/list_emergency');
            this.observationForm.reset();
          },
          error: (error) => {
            console.error('Submission failed:', error);
            alert('Submission failed.');
          }
        });

      }

    } else {
      this.observationForm.markAllAsTouched();
      alert('Form is invalid. Please fill the required fields.');
    }
  }
  onDraftSave(): void {
    const section0Array = this.observationForm.get('section_0') as FormArray;

    if (!section0Array || section0Array.length === 0) {
      alert('Section 0 is missing or empty.');
      return;
    }

    let section0Valid = true;

    for (const group of section0Array.controls) {
      group.markAllAsTouched(); // ensure validation UI is triggered
      if (group.invalid) {
        section0Valid = false;
      }
    }

    if (section0Valid) {
      const payload = {
        formData: this.observationForm.value,
        entryStatus: 'inprogress', // Marked as draft
        submittedBy: this.empId,
        unitId: 1
      };
      if (this.mode === 'edit') {
        this.FireDrillService.updateForm(payload, this.fireDrillId).subscribe({
          next: (response: any) => {
            alert('Draft saved successfully!');
            this.router.navigateByUrl('/list_emergency');
            this.observationForm.reset();
          },
          error: (error) => {
            alert('Draft save failed.');
          }
        });
      }
      else {
        this.FireDrillService.submitForm(payload).subscribe({
          next: (response: any) => {
            alert('Draft saved successfully!');
            this.router.navigateByUrl('/list_emergency');
            this.observationForm.reset();
          },
          error: (error) => {
            alert('Draft save failed.');
          }
        });

      }

    } else {
      alert('Please complete required fields in Observed At.');
    }
  }

  // Dropdown filter
  onDropdownChange(fieldName: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target?.value;

    if (fieldName === 'area') {
      const areaId = +selectedValue;
      const sectionField = this.sections
        .flatMap(section => section.fields)
        .find(f => f.name === 'section');

      if (sectionField) {
        sectionField.options = this.fullSectionOptions.filter(
          (opt: DropdownOption) => opt.parentId === areaId
        );
        this.observationForm.get('Section')?.setValue(null);
      }
    }
  }
  getLabelValue(fieldName: string): string {
    if (this.mode === 'create') {
      if (fieldName === 'Filled By') {
        return localStorage.getItem('employee_name') || 'Auto User';
      }

      if (fieldName === 'Filled On') {
        const today = new Date();
        const day = today.getDate().toString().padStart(2, '0');
        const month = today.toLocaleString('en-US', { month: 'short' });
        const year = today.getFullYear();
        return `${day}.${month}.${year}`;
      }

      if (fieldName === 'Reference No') {
        return this.RefNo || 'Auto';
      }
    }

    // For 'edit' or 'view' mode, values are already prefilled from backend using patchFormWithSavedData
    const section = this.observationForm.get('section_0') as FormArray;
    if (section && section.at(0)) {
      const value = section.at(0).get(fieldName)?.value;
      if (typeof value === 'string') {
        return value;
      }
      if (typeof value === 'object' && value?.fileName) {
        return value.fileName;
      }
    }

    return 'Auto';
  }
   extractFileName(path: string): string {
    return path?.split('/').pop() || 'UnknownFile';
  }
  downloadFile(filePath: string, fileName: string): void {
    const url = `/${filePath}`;

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank'; // Optional, for compatibility
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent, sectionIndex: number, groupIndex: number, fieldName: string): void {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0], sectionIndex, groupIndex, fieldName);
    }
  }

  onFileChange(event: Event, sectionIndex: number, groupIndex: number, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      this.processFile(input.files[0], sectionIndex, groupIndex, fieldName);
      input.value = ''; // Clear input for re-selection
    }
  }

  processFile(file: File, sectionIndex: number, groupIndex: number, fieldName: string): void {
    const formArray = this.getSectionFieldGroups(sectionIndex);
    const group = formArray.at(groupIndex) as FormGroup;

    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

    if (file.size > maxSize) {
      alert('File size should not exceed 10 MB.');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported file type.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const fileData = {
        fileName: file.name,
        base64: base64,
        documentPath: base64 // or use base64 as preview path
      };
      group.get(fieldName)?.setValue(fileData);
    };

    reader.readAsDataURL(file);
  }
  // ✅ Helper: Detect image file
  isImageFile(fileName: string): boolean {
    return /\.(png|jpg|jpeg)$/i.test(fileName);
  }

  // ✅ Helper: Detect video file
  isVideoFile(fileName: string): boolean {
    return /\.(mp4|webm|ogg|mov)$/i.test(fileName);
  }
  validateTime(fieldName: string, sectionIndex: number, groupIndex: number): void {
    const formArray = this.getSectionFieldGroups(sectionIndex);
    const group = formArray.at(groupIndex) as FormGroup;

    const timeControl = group.get(fieldName);
    const dateControl = group.get('Fire Drill Date');

    if (!dateControl || !timeControl) return;

    const selectedDate = dateControl.value; // "2025-06-29"
    const selectedTime = timeControl.value; // "04:59"

    if (!selectedDate || !selectedTime) return;

    // Combine date and time into a single Date object
    const combinedDateTime = new Date(`${selectedDate}T${selectedTime}`);

    const now = new Date();

    if (combinedDateTime > now) {
      alert('You cannot select a future time.');
      timeControl.setValue('');
    }
  }
  onBack() {
    if (this.prepage === 'Task') {
      this.router.navigateByUrl('/action_plan');
    }
    else if (this.prepage === "dashboard") {
      this.router.navigate(['./dashboard']);
    }
    else {
      this.router.navigateByUrl('/list_emergency');
    }


  }

  getButtonLabel(): string {
    if (this.mode === 'edit') {
      if (this.status === 'released') {
        return 'Released'
      }
      else if (this.status === 'review') {
        return 'Review'
      }
      else {
        return 'Submit'
      }

    }

    return 'Submit';
  }
  onActionClick() {
    const label = this.getButtonLabel();
    if (label === 'Submit') {
      this.onSubmit();
    } else if (label === 'Review') {
      this.onSubmit();
    } else if (label === 'Released') {
      this.onSubmit();

    }
  }
 
}
