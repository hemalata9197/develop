import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements  CanActivate {
   constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const requiredRoles: string[] = route.data?.['roles'] ?? []; // <-- fix here

    return this.auth.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        if (requiredRoles.length === 0) {
          return true; // allow all authenticated users
        }

        if (!user.roles || !Array.isArray(user.roles)) {
          this.router.navigate(['/unauthorized']); // optional route
          return false;
        }

        const hasRole = user.roles.some(role => requiredRoles.includes(role));

        if (!hasRole) {
          this.router.navigate(['/unauthorized']); // optional
          return false;
        }

        return true;
      })
    );
  }
}