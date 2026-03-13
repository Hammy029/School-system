import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth/auth.service';
import { Role } from '../../shared/models/roles.enum';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule, RouterLink],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage: string | null = null;
  showPassword = false;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.errorMessage = 'Please fill all fields correctly.';
      return;
    }

    this.errorMessage = null;
    this.loading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.loading = false;

        localStorage.setItem('userId', res.user._id);
        const role = Object.values(Role).includes(res.user.role) ? res.user.role : Role.User;
        localStorage.setItem('role', role);

        if (res.requirePasswordChange) {
          localStorage.setItem('requirePasswordChange', 'true');
          this.router.navigate(['/update-password']);
          return;
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}
