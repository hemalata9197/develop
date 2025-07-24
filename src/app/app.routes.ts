import { Routes } from '@angular/router';
import { AuthGuard } from './Core/Auth/auth.guard';
import { LoginComponent } from './Loginpages/login/login.component';
import { LayoutComponent } from './Loginpages/layout/layout.component';
import { DashboardComponent } from './Modules/EMS/Components/dashboard/dashboard.component';
import { SubmitEmergencyComponent } from './Modules/EMS/Components/submit-emergency/submit-emergency.component';
import { ListEmergencyComponent } from './Modules/EMS/Components/list-emergency/list-emergency.component';
import { TaskManagementComponent } from './Modules/EMS/Components/task-management/task-management.component';
import { MasterComponent } from './Modules/Shared/Masters/master.component';
import { MasterWrapperComponent } from './Modules/EMS/Components/master/master-wrapper.component';
import { FireDrillSummaryReportComponent } from './Modules/EMS/Components/reports/Reports/fire-drill-summary-report.component';
import { RolePrivilegesComponent } from './Modules/EMS/Components/role-privileges/role-privileges.component';
import { FormBuilderComponent } from './Modules/EMS/Components/master/form-builder/form-builder.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
   {
    path: '',
    component: LayoutComponent,
    // canActivate: [AuthGuard],
    // data: { roles: [] },
    children: [
      {path: 'dashboard',  component:DashboardComponent,            
        // canActivate: [AuthGuard],
        // data: { roles: ['Admin', 'Observer'] 
      },   
       { path: 'submit-emergency', component: SubmitEmergencyComponent },   
       { path: 'submit-emergency/:fireDrillId', component: SubmitEmergencyComponent },
       { path: 'list_emergency', component: ListEmergencyComponent },    
       {path:'action_plan',component:TaskManagementComponent},  
       {path:'master',component:MasterWrapperComponent}, 
       {path: 'reports', component: FireDrillSummaryReportComponent},
       {path:'role-privileges', component:RolePrivilegesComponent},
       {path:'form-builder',component:FormBuilderComponent}
      
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
