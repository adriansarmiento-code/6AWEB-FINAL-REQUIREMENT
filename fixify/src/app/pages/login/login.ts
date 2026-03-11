import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginComponent {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');

  onSubmit(): void {
    if (!this.email() || !this.password()) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.apiService.login({ email: this.email(), password: this.password() }).subscribe({
      next: (res) => {
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
        const redirect = new URLSearchParams(window.location.search).get('redirect');
        if (res.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (redirect) {
          this.router.navigateByUrl(redirect);
        } else if (res.role === 'provider') {
          this.router.navigate(['/provider-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Invalid email or password.');
      },
    });
  }
}