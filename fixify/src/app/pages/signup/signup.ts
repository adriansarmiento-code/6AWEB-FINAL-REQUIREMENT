import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, FormsModule],
  templateUrl: './signup.html',
})
export class SignupComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  role = signal<'customer' | 'provider'>('customer');
  name = signal('');
  email = signal('');
  phone = signal('');
  password = signal('');
  confirmPassword = signal('');
  category = signal<string>('plumbing');
  yearsExperience = signal<number>(0);
  loading = signal(false);
  error = signal('');

  readonly categories = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'painting', label: 'Painting' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'appliance-repair', label: 'Appliance Repair' },
    { value: 'other', label: 'Other' },
  ];

  ngOnInit(): void {
    const type = this.route.snapshot.queryParamMap.get('type');
    if (type === 'provider') this.role.set('provider');
  }

  setRole(role: 'customer' | 'provider'): void {
    this.role.set(role);
    this.error.set('');
  }

  onSubmit(): void {
    if (!this.name() || !this.email() || !this.phone() || !this.password() || !this.confirmPassword()) {
      this.error.set('Please fill in all fields.');
      return;
    }
    if (this.password().length < 8) {
      this.error.set('Password must be at least 8 characters.');
      return;
    }
    if (this.password() !== this.confirmPassword()) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const payload: any = {
      name: this.name(),
      email: this.email(),
      phone: this.phone(),
      password: this.password(),
      role: this.role(),
    };

    if (this.role() === 'provider') {
      payload.providerInfo = {
        category: this.category(),
        yearsExperience: this.yearsExperience(),
      };
    }

    this.apiService.register(payload).subscribe({
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
        if (res.role === 'provider') {
          this.router.navigate(['/provider-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
      },
    });
  }
}