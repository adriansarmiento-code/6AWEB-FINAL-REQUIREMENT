import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { User } from '../../models/models';

@Component({
  selector: 'app-search',
  imports: [FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './search.html',
})
export class SearchComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  providers = signal<User[]>([]);
  loading = signal(false);
  error = signal('');
  showLoginModal = signal(false);

  // Filters
  category = signal('');
  serviceArea = signal('');
  minRating = signal(0);
  verifiedOnly = signal(false);
  sortBy = signal('rating');

  readonly serviceAreas = [
    'Angeles City Center',
    'Balibago',
    'Nepo Mall Area',
    'Marquee Mall Area',
    'Clark',
  ];

  readonly categories = [
    { value: '', label: 'All Categories' },
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
    this.route.queryParamMap.subscribe((params) => {
      const cat = params.get('category');
      if (cat) this.category.set(cat);
      this.loadProviders();
    });
  }

  loadProviders(): void {
    this.loading.set(true);
    this.error.set('');

    const params: any = { sort: this.sortBy() };
    if (this.category()) params.category = this.category();
    if (this.serviceArea()) params.serviceArea = this.serviceArea();
    if (this.minRating() > 0) params.minRating = this.minRating();
    if (this.verifiedOnly()) params.verified = true;

    this.apiService.getProviders(params).subscribe({
      next: (providers) => {
        this.providers.set(providers);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load providers. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onFilterChange(): void {
    this.loadProviders();
  }

  clearFilters(): void {
    this.category.set('');
    this.serviceArea.set('');
    this.minRating.set(0);
    this.verifiedOnly.set(false);
    this.sortBy.set('rating');
    this.loadProviders();
  }

  viewProvider(id: string): void {
    this.router.navigate(['/provider', id]);
  }

  bookProvider(providerId: string): void {
    if (!this.authService.isAuthenticated()) {
      this.showLoginModal.set(true);
      return;
    }
    this.router.navigate(['/booking', providerId]);
  }

  messageProvider(providerId: string): void {
    if (!this.authService.isAuthenticated()) {
      this.showLoginModal.set(true);
      return;
    }
    this.router.navigate(['/messages', providerId]);
  }

  closeLoginModal(): void {
    this.showLoginModal.set(false);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  getStars(rating: number): string[] {
    return Array(5).fill('').map((_, i) => i < Math.round(rating) ? '★' : '☆');
  }

  getCategoryLabel(value: string): string {
    return this.categories.find((c) => c.value === value)?.label || value;
  }
}