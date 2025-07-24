import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl,ReactiveFormsModule,Validators,FormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MasterService } from '../../Services/master.service';


@Component({
  selector: 'app-role-privileges',
  imports: [ReactiveFormsModule,CommonModule,FormsModule ],
  templateUrl: './role-privileges.component.html',
  styleUrl: './role-privileges.component.css'
})
export class RolePrivilegesComponent implements OnInit {
  form!: FormGroup;
  roles: any[] = [];
  menus: any[] = [];
  selectedRoleId: number | null = null;
  unitId: number = 1;
 empId: number = 0;
 selectAllChecked: boolean = false;
 menusGrouped: { parent: any, children: any[] }[] = [];
  constructor(private fb: FormBuilder, private masterService: MasterService) {}

  ngOnInit(): void {
     const empIdString = sessionStorage.getItem('employeeId');
    this.empId = empIdString ? parseInt(empIdString, 10) : 0;
    this.form = this.fb.group({
      role: ['', Validators.required],
      permissions: this.fb.group({})
    });

    this.loadRoles();
    this.loadMenus();
  }

  loadRoles(): void {
    this.masterService.getDropdownOption('Roles', this.unitId).subscribe(res => {
      this.roles = res;
    });
  }
  toggleSelectAll(): void {
  const permissionsGroup = this.form.get('permissions') as FormGroup;
  this.selectAllChecked=!this.selectAllChecked
  const checked = this.selectAllChecked;

  Object.keys(permissionsGroup.controls).forEach(key => {
    permissionsGroup.get(key)?.setValue(checked);
  });
}
loadMenus(): void {
  this.masterService.getMenus().subscribe(res => {
    this.menus = res;

    // Group by parent-child relationship
    const parentMenus = res.filter(m => m.parentId === null);
    this.menusGrouped = parentMenus.map(parent => ({
      parent,
      children: res.filter(m => m.parentId === parent.id)
    }));

    // Add controls for all
    const permissionsGroup = this.form.get('permissions') as FormGroup;
    res.forEach(menu => {
      permissionsGroup.addControl(menu.id.toString(), new FormControl(false));
    });
  });
}
  // loadMenus(): void {
  //   this.masterService.getMenus().subscribe(res => {
  //     this.menus = res;
  //     const permissionsGroup = this.form.get('permissions') as FormGroup;
  //     this.menus.forEach(menu => {
  //       permissionsGroup.addControl(menu.id.toString(), new FormControl(false));
  //     });
  //   });
  // }

  onRoleChange(): void {
    const roleId = this.form.get('role')?.value;
    this.selectedRoleId = +roleId;

    this.masterService.getRoleMenuIds(this.selectedRoleId).subscribe(menuIds => {
      const perms = this.form.get('permissions') as FormGroup;
      Object.keys(perms.controls).forEach(menuId => {
        perms.get(menuId)?.setValue(menuIds.includes(+menuId));
      });
    });
  }

  getPermissionControl(menuId: number): FormControl {
    return this.form.get('permissions.' + menuId.toString()) as FormControl;
  }

  submit(): void {
  if (this.form.invalid) {
    // Mark all fields as touched to show validation errors
    this.form.markAllAsTouched();

    alert('Please select a role and at least one menu.');
    return;
  }

  const roleId = this.form.value.role;
  const permissions = this.form.value.permissions;
  const selectedMenuIds = Object.keys(permissions)
    .filter(key => permissions[key])
    .map(id => +id);

  // Extra check: no menu selected
  if (selectedMenuIds.length === 0) {
    alert('Please select at least one menu.');
    return;
  }

  const payload = {
    roleId: roleId,
    menuIds: selectedMenuIds,
    unitId:this.unitId,
    submittedBy: this.empId 

  };

  this.masterService.saveRoleMenuPermissions(payload).subscribe(() => {
    alert('Permissions saved successfully!');
  });
   this.loadRoles();
    this.loadMenus();
}
}