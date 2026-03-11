import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, HeaderComponent],
  templateUrl: './admin-login.html',
})
export class AdminLoginComponent {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');

  onSubmit(): void {
    if (!this.email() || !this.password()) {
      this.error.set('Please enter email and password.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.apiService.login({ email: this.email(), password: this.password() }).subscribe({
      next: (res) => {
        if (res.role !== 'admin') {
          this.loading.set(false);
          this.error.set('Access denied. Admin credentials required.');
          return;
        }
        this.authService.setAuth(
          {
            _id: res._id,
            name: res.name,
            email: res.email,
            phone: res.phone,
            role: res.role,
            profileImage: res.profileImage,
            providerInfo: res.providerInfo,
          },
          res.token
        );
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Login failed.');
      },
    });
  }
}