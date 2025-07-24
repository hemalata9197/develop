import { Component, OnInit } from '@angular/core';
import { MasterComponent } from '../../../Shared/Masters/master.component';
import { CommonModule } from '@angular/common';
import { MasterService } from '../../Services/master.service';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ExportService } from '../../../Shared/Export/export.service';

@Component({
  selector: 'app-master-wrapper',
  standalone: true,
  imports: [MasterComponent, CommonModule, FormsModule],
  templateUrl: './master-wrapper.component.html',
  styleUrl: './master-wrapper.component.css'
})
export class MasterWrapperComponent implements OnInit {
  title = '';
  unitId = 1;
  currentSource = 'FacilityMaster-Area';
  tableFields: any[] = [];
  formFields: any[] = [];
  masterFields: any[] = [];
  masterData: any[] = [];
  ExportMasterData: any[] = [];
  editIndex: number | null = null;
  currentEditData: any = null;
  empId: number = 0;
  pageIndex = 0;
  pageSize = 10;
  totalCount = 0;
  filterModel: { [key: string]: any } = {};
  filterableFields: any[] = [];
  originalMasterData: any[] = [];
  isAdding = false;
  isFormPanelOpen = true;
  formTitle = "";
  constructor( private MasterService: MasterService,private ExportService:ExportService) { }

  ngOnInit(): void {
    const empIdString = sessionStorage.getItem('employeeId');
    this.empId = empIdString ? parseInt(empIdString, 10) : 0;
    this.selectMaster('FacilityMaster-Area');
  }
  handleAddNew(): void {
    this.editIndex = null;
    this.currentEditData = null;
    this.isFormPanelOpen = true;
  }
  applyFilter(): void {
    this.pageIndex = 1;
    let filteredData = [...this.originalMasterData];

    this.filterableFields.forEach(field => {
      const value = this.filterModel[field.name];
      if (value !== null && value !== undefined && value !== '') {
        filteredData = filteredData.filter(item => {
          const itemValue = item[field.name];
          // Use strict equality for numbers, fallback to includes for strings
          if (typeof itemValue === 'number' || typeof value === 'number') {
            return itemValue === value || itemValue === +value;
          } else {
            return itemValue?.toString().toLowerCase().includes(value.toString().toLowerCase());
          }
        });
      }
    });

    // this.ExportMasterData = filteredData;

    this.totalCount = filteredData.length;
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.masterData = filteredData.slice(start, end);
  }

  resetFilters(): void {
    Object.keys(this.filterModel).forEach(k => this.filterModel[k] = '');
    this.pageIndex = 1;
    this.applyFilter();
    this.fetchData();
  }
  selectMaster(source: string): void {
    this.currentSource = source;
    this.title = this.getTitleFromSource(this.currentSource);
    this.buildFields(source);
    this.fetchData();
    this.currentEditData = null;
    this.editIndex = null;

    this.isFormPanelOpen = false;
    this.currentEditData = null;
    this.editIndex = null;
  }
  toggleStatus(item: any): void {
    const confirmChange = confirm(`Are you sure you want to ${item.isActive ? 'deactivate' : 'activate'} ${item.label}?`);
    if (confirmChange) {
      const newStatus = !item.isActive;
      const data = {
        source: this.currentSource,
        id: item.id,
        isActive: newStatus,
        modifiedBy: this.empId

      };

      this.MasterService.updateStatus(data).subscribe(() => {
        item.isActive = newStatus;
        console.log('Status updated');
      });
    }
  }
  fetchData(): void {
    const params = {
      page: this.pageIndex,
      size: this.pageSize,
    };
    this.MasterService.getAllMasterFields(this.currentSource, this.unitId, params)
      .subscribe(res => {
        this.masterData = res.data || [];
        this.originalMasterData = res.data || [];
         this.ExportMasterData= res.data || [];
        this.totalCount = res.totalCount || this.masterData.length;
      });
  }

  handleFormSubmit(data: any): void {
    data.UnitId = 1;

    if (this.editIndex !== null && this.masterData[this.editIndex]?.id) {
      data.modifiedBy = this.empId;
      const id = this.masterData[this.editIndex].id;

      this.MasterService.update(this.currentSource, id, data).subscribe({
        next: (res: any) => {
          alert(res.message);

        },
        error: () => {
          alert('An error occurred while updating.');
        },
        complete: () => {
          this.fetchData();
          this.editIndex = null;
          this.currentEditData = null;
          this.isAdding = false;
          this.isFormPanelOpen = false;
        }

      });

    } else {
      data.CreatedBy = this.empId;

      console.log("Inserted DATA:", data)

      this.MasterService.create(this.currentSource, data).subscribe({
        next: (res: any) => {
          alert(res.message);
          this.fetchData();
          this.resetFormState();
        },
        error: () => {
          alert('An error occurred while saving.');
          this.fetchData();
          this.resetFormState();
        }
      });
    }
    this.isFormPanelOpen = false;
  }
  resetFormState() {
    this.editIndex = null;
    this.currentEditData = null;
    this.isAdding = false;
    this.isFormPanelOpen = false;
  }
  handleCancelEdit(): void {
    this.editIndex = null;
    this.currentEditData = null;
    //this.isFormPanelOpen = false;
  }
  Close() {
    this.isFormPanelOpen = false;
  }

  handleEdit(index: number): void {
    this.isFormPanelOpen = true;
    this.editIndex = index;
    this.currentEditData = { ...this.masterData[index] };
  }

  handleDelete(index: number): void {
    const id = this.masterData[index].id;
    this.MasterService.delete(this.currentSource, id).subscribe(() => {
      this.fetchData();
    });
  }

  async buildFields(source: string): Promise<void> {
    const allFields = this.getFieldsForSource(source);

    this.formFields = allFields.filter(f => f.displayInForm !== false);
    this.tableFields = allFields.filter(f => f.displayInTable !== false);

    for (const field of this.formFields) {
      if (field.type === 'dropdown' && field.optionsSource) {
        try {
          const options = await firstValueFrom(
            this.MasterService.getDropdownOption(field.optionsSource, this.unitId)
          );
          field.options = options ?? [];
        } catch (error) {
          console.error(`Failed to load options for ${field.optionsSource}:`, error);
          field.options = [];
        }
      }
    }

    this.masterFields = allFields;

    this.filterableFields = allFields.filter(f => f.filterable);
    this.filterModel = {};
    this.filterableFields.forEach(f => this.filterModel[f.name] = '');
  }

  getFieldsForSource(source: string): any[] {
    switch (source) {
      case 'FacilityMaster-Area':
        return [
          { label: 'Area Name', name: 'label', type: 'text', required: true, displayInTable: true, rowWidth: 6, filterable: true },
          {
            label: 'Area Head', name: 'facilityHeadId', type: 'dropdown', options: [],
            optionsSource: 'Users', required: true, displayInTable: false, rowWidth: 6
          },
          { label: 'Area Head', name: 'facilityHeadName', type: 'text', displayInTable: true, displayInForm: false }
        ];
      case 'FacilityMaster-Section':
        return [
          { label: 'Section Name', name: 'label', type: 'text', required: true, displayInTable: true, rowWidth: 6, filterable: true },
          {
            label: 'Area', name: 'parentId', type: 'dropdown', options: [],
            optionsSource: 'FacilityMaster-Area', required: true, displayInTable: false, rowWidth: 6
          },
          { label: 'Area', name: 'parentName', type: 'text', displayInTable: true, displayInForm: false },
          {
            label: 'Section Head', name: 'facilityHeadId', type: 'dropdown', options: [],
            optionsSource: 'Users', required: true, displayInTable: false, rowWidth: 6
          },
          { label: 'Section Head', name: 'facilityHeadName', type: 'text', displayInTable: true, displayInForm: false },

        ];
      case 'ScenarioMaster':
        return [
          { label: 'Scenario Name', name: 'label', type: 'text', required: true, displayInTable: true, rowWidth: 6, filterable: true },
          { label: 'Description', name: 'description', type: 'text', displayInTable: true, rowWidth: 6 }
        ];

      case 'Roles':
        return [
          { label: 'Role', name: 'label', type: 'text', required: true, displayInTable: true, rowWidth: 6, filterable: true },


        ];
      case 'Designation':
        return [
          { label: 'Designation', name: 'label', type: 'text', required: true, displayInTable: true, rowWidth: 6, filterable: true },


        ];
      case 'Employees':
        return [
          { label: 'Employee Code', name: 'employeeCode', type: 'text', required: true, displayInTable: true, rowWidth: 6, filterable: true },
          { label: 'Employee Name', name: 'label', type: 'text', required: true, displayInTable: true, rowWidth: 6 },
          { label: 'Contact No', name: 'mobileNumber', type: 'text', validators: ['pattern:^[0-9]{10}$'], displayInTable: false, rowWidth: 6 },
          { label: 'Email Id', name: 'email', type: 'email', required: true, validators: ['required', 'email'], displayInTable: false, rowWidth: 6 },
          {
            label: 'Area', name: 'areaId', type: 'dropdown', options: [],
            optionsSource: 'FacilityMaster-Area', required: true, displayInTable: false, displayInForm: true, rowWidth: 6, filterable: true
          },
          { label: 'Area', name: 'areaName', type: 'text', displayInTable: true, displayInForm: false },
          {
            label: 'Designation', name: 'desigId', type: 'dropdown', options: [],
            optionsSource: 'Designation', required: true, displayInTable: false, rowWidth: 6, filterable: true
          },
          { label: 'Designation', name: 'designationName', type: 'text', displayInTable: true, displayInForm: false },

          { label: 'Fill below details to create Login for new employee', type: 'section', displayInTable: false, rowWidth: 12 },
          {
            label: 'Role', name: 'roleId', type: 'dropdown', options: [],
            optionsSource: 'Roles', displayInTable: false, rowWidth: 6, required: false,
          },
          { label: 'Role', name: 'role', type: 'text', displayInTable: true, displayInForm: false },
          // { label: 'Login Name', name: 'loginName', type: 'text', displayInTable: true, rowWidth: 6 },
          // { label: 'Password', name: 'password', type: 'password', displayInTable: false, rowWidth: 6 },
          // { label: 'Confirm Password', name: 'password', type: 'password', displayInTable: false, rowWidth: 6 },

        ];

      default:
        return [];
    }
  }

  getTitleFromSource(source: string): string {
    switch (source) {
      case 'FacilityMaster-Area': return 'Area Master';
      case 'FacilityMaster-Section': return 'Section Master';
      case 'ScenarioMaster': return 'Scenario Master';
      case 'Roles': return 'Role Master';
      case 'Designation': return 'Designation';
      case 'Employees': return 'Employees Master';

      default: return 'Dynamic Master';
    }
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
  exportToExcel(): void {
 const visibleFields = this.tableFields
    .filter(field => field.displayInTable !== false)
    .map(field => field.name);

  // Format the data to only include those fields
  const formattedData = this.ExportMasterData.map(item => {
    const result: any = {};
    visibleFields.forEach(fieldName => {
      result[this.getLabelForField(fieldName)] = item[fieldName];
    });
    return result;
  });

  // Exclude internal fields like `id`, `isActive`, etc., as needed
  this.ExportService.exportToExcel(formattedData,  this.title, ['id']);
}
 exportToPDF(): void {
 const visibleFields = this.tableFields
    .filter(field => field.displayInTable !== false)
    .map(field => field.name);

  // Format the data to only include those fields
  const formattedData = this.ExportMasterData.map(item => {
    const result: any = {};
    visibleFields.forEach(fieldName => {
      result[this.getLabelForField(fieldName)] = item[fieldName];
    });
    return result;
  });

  // Exclude internal fields like `id`, `isActive`, etc., as needed
  this.ExportService.exportToPDF(formattedData,  this.title, ['id']);
}
getLabelForField(fieldName: string): string {
  const field = this.tableFields.find(f => f.name === fieldName);
  return field?.label || fieldName;
}
}