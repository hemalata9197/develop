import { Component, OnInit } from '@angular/core';
import { AuthService, MenuItem } from '../../Core/Auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-sidebar',
   standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
  
})
export class SidebarComponent  implements OnInit {
  menu: MenuItem[] = [];
  isSidebarOpen = true;

  constructor(private auth: AuthService) {}  

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      this.menu = user?.menu || [];
      
    });
  }
   toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

}