import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../Core/Auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet,Router } from '@angular/router';

import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  imports: [CommonModule,RouterOutlet,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService,private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.auth.login(username, password).subscribe({
         next: () => this.router.navigate(['/dashboard']),
        error: err => this.error = 'Login failed'
      });
    }
  }
}

