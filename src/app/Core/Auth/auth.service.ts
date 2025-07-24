// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { switchMap } from 'rxjs/operators';
// import { environment } from '../../Environment/environment';
// import { jwtDecode } from 'jwt-decode';
// export interface UserInfo {
//   token: string;
//   username: string;
//   roles: string[];
//   menu?: MenuItem[];
//   employeeName: string;
// }
// interface JwtPayload {
//   nameid: string;
//   name: string;
//   sub: string;
//   role?: string | string[];
//   employeeId?: string;
// }

// export interface MenuItem {
//   title: string;
//   route: string | null;
//   icon?: string;
//   roles: string[];
//   children?: MenuItem[];
//   expanded?: boolean;
// }

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private baseUrl = environment.apiUrl;
//   private tokenKey = 'auth_token';
//   public currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
//   public currentUser$ = this.currentUserSubject.asObservable();

//   // constructor(private http: HttpClient, private router: Router) {
//   //   const token = this.getToken();
//   //   if (token) {
//   //     //this.currentUserSubject.next(token);
//   //      // this.loadUserInfo(token);
//   //   }
//   // }
//   constructor(private http: HttpClient, private router: Router) {
//     const token = this.getToken();
//     const username = localStorage.getItem('auth_username'); // store this on login too
//     if (token && username) {
//       this.loadUserInfo(token, username);
//     }
//   }

//   login(username: string, password: string): Observable<any> {
//     return this.http.post<{ result: UserInfo }>(`${this.baseUrl}/auth/login`, { username, password })
//       .pipe(
//         map(response => {
//           const userInfo = response.result;
//           localStorage.setItem(this.tokenKey, userInfo.token);
//           localStorage.setItem('auth_username', userInfo.username);
//           localStorage.setItem('employee_name', userInfo.employeeName);
//           try {
//             const decoded = jwtDecode<JwtPayload>(userInfo.token);
//             if (decoded.employeeId) {
//               sessionStorage.setItem('employeeId', decoded.employeeId);
//             }
//             if (decoded.role) {
//               const role = Array.isArray(decoded.role) ? decoded.role.join(',') : decoded.role;
//               sessionStorage.setItem('role', role);
             
//             }
//           } catch (err) {
//             console.error('JWT decode error:', err);
//           }

//           this.currentUserSubject.next(userInfo);
//           this.loadUserInfo(userInfo.token, userInfo.username);


//           return userInfo;
//         })
//       );
//   }
//   //   private loadUserInfo(token: string): void {
//   //   this.http.get<any>(`${this.baseUrl}/auth/me`, {
//   //     headers: { Authorization: `Bearer ${token}` }
//   //   }).subscribe(user => {

//   //     const mapMenuTree = (menus: any[]): MenuItem[] =>
//   //       menus.map(m => ({
//   //         title: m.name,
//   //         route: m.route,
//   //         roles: user.roles,
//   //         children: m.children && m.children.length > 0 ? mapMenuTree(m.children) : []
//   //       }));

//   //     const mappedUser: UserInfo = {
//   //       token: token,
//   //       username: user.username,
//   //       roles: user.roles,
//   //       menu: mapMenuTree(user.menu),
//   //       employeeName:user.employeeName
//   //     };

//   //     this.currentUserSubject.next(mappedUser);
//   //     console.log("Mapped user info:", mappedUser);
//   //   });
//   // }
//   private loadUserInfo(token: string, username: string): void {

//     this.http.get<UserInfo>(`${this.baseUrl}/User/me?username=${username}`, {

//     }).subscribe({
//       next: user => {
//         const mapMenuTree = (menus: any[]): MenuItem[] =>
//           menus.map(m => ({
//             title: m.name,
//             route: m.route,
//             roles: user.roles,
//             children: m.children && m.children.length > 0 ? mapMenuTree(m.children) : []
//           }));

//         const mappedUser: UserInfo = {
//           token: token,
//           username: user.username,
//           roles: user.roles,
//           menu: mapMenuTree(user.menu ?? []),
//           employeeName: user.employeeName
//         };

//         this.currentUserSubject.next(mappedUser);
//         // localStorage.setItem('employee_name', user.employeeName);

//       },
//       error: err => {
//         console.error('Failed to load user info', err);
//         this.logout(); // Auto logout if token is invalid
//       }
//     });
//   }
//   logout(): void {
//     localStorage.removeItem(this.tokenKey);
//     this.currentUserSubject.next(null);
//     this.router.navigate(['/login']);
//   }

//   getToken(): string | null {
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem(this.tokenKey);
//     }
//     return null;
//   }

//   isAuthenticated(): boolean {
//     return !!this.getToken();
//   }

//   getMenu(): MenuItem[] {
//     return this.currentUserSubject.value?.menu || [];
//   }


// } 
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../Environment/environment';
import { jwtDecode } from 'jwt-decode';

export interface UserInfo {
  token: string;
  username: string;
  roles: string[];
  menu?: MenuItem[];
  employeeName: string;
}

interface JwtPayload {
  nameid: string;
  name: string;
  sub: string;
  role?: string | string[];
  employeeId?: string;
}

export interface MenuItem {
  title: string;
  route: string | null;
  icon?: string;
  roles: string[];
  children?: MenuItem[];
  expanded?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private isBrowser: boolean;
  public currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const token = this.getToken();
      const username = localStorage.getItem('auth_username');
      if (token && username) {
        this.loadUserInfo(token, username);
      }
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<{ result: UserInfo }>(`${this.baseUrl}/auth/login`, { username, password })
      .pipe(
        map(response => {
          const userInfo = response.result;

          if (this.isBrowser) {
            localStorage.setItem(this.tokenKey, userInfo.token);
            localStorage.setItem('auth_username', userInfo.username);
            localStorage.setItem('employee_name', userInfo.employeeName);

            try {
              const decoded = jwtDecode<JwtPayload>(userInfo.token);
              if (decoded.employeeId) {
                sessionStorage.setItem('employeeId', decoded.employeeId);
              }
              if (decoded.role) {
                const role = Array.isArray(decoded.role) ? decoded.role.join(',') : decoded.role;
                sessionStorage.setItem('role', role);
              }
            } catch (err) {
              console.error('JWT decode error:', err);
            }
          }

          this.currentUserSubject.next(userInfo);
          this.loadUserInfo(userInfo.token, userInfo.username);
          return userInfo;
        })
      );
  }

  private loadUserInfo(token: string, username: string): void {
    this.http.get<UserInfo>(`${this.baseUrl}/User/me?username=${username}`)
      .subscribe({
        next: user => {
          const mapMenuTree = (menus: any[]): MenuItem[] =>
            menus.map(m => ({
              title: m.name,
              route: m.route,
              roles: user.roles,
              children: m.children && m.children.length > 0 ? mapMenuTree(m.children) : []
            }));

          const mappedUser: UserInfo = {
            token: token,
            username: user.username,
            roles: user.roles,
            menu: mapMenuTree(user.menu ?? []),
            employeeName: user.employeeName
          };

          this.currentUserSubject.next(mappedUser);
        },
        error: err => {
          console.error('Failed to load user info', err);
          this.logout();
        }
      });
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getMenu(): MenuItem[] {
    return this.currentUserSubject.value?.menu || [];
  }
}
