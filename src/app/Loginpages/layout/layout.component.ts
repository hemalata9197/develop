import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService, MenuItem } from '../../Core/Auth/auth.service';
import { Router } from  '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,       // ✅ Needed for NgClass, *ngFor, etc.
    RouterModule,
    RouterOutlet
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {

  menu: MenuItem[] = [];
  isSidebarOpen = true;
 employeeName: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
     const name = localStorage.getItem('employee_name');
  if (name) {
    this.employeeName = name;
  }
  this.auth.currentUser$.subscribe(user => {
    // Mark expandable parents with expanded: false
    this.menu = (user?.menu || []).map(item => {
      if (item.children?.length) {
        return { ...item, expanded: false };
      }
      return item;
    });
  });

  
}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
toggleSubMenu(item: MenuItem): void {
  item.expanded = !item.expanded;
}
  logout(): void {
    this.auth.logout();
  }
  HomeClick()
  {
    this.router.navigate(['./dashboard']);

  }
  HelpManual()
  {
    
  }
}
