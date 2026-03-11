import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { User, Review, ProviderService } from '../../models/models';

@Component({
  selector: 'app-provider-profile',
  imports: [RouterLink, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './provider-profile.html',
})
export class ProviderProfileComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  provider = signal<User | null>(null);
  reviews = signal<Review[]>([]);
  loading = signal(true);
  error = signal('');

  showLoginModal = signal(false);
  showServiceModal = signal(false);
  selectedService = signal<ProviderService | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) this.loadProvider(id);
    });
  }

  loadProvider(id: string): void {
    this.loading.set(true);
    this.error.set('');
    this.apiService.getProvider(id).subscribe({
      next: (p: User) => {
        this.provider.set(p);
        this.loading.set(false);
        this.loadReviews(id);
      },
      error: () => {
        this.error.set('Provider not found.');
        this.loading.set(false);
      },
    });
  }

  loadReviews(id: string): void {
    this.apiService.getProviderReviews(id).subscribe({
      next: (r) => this.reviews.set(r),
      error: () => {},
    });
  }

  onBookNow(): void {
    if (!this.authService.isAuthenticated()) {
      this.showLoginModal.set(true);
      return;
    }
    this.showServiceModal.set(true);
  }

  onContactProvider(): void {
    if (!this.authService.isAuthenticated()) {
      this.showLoginModal.set(true);
      return;
    }
    this.router.navigate(['/messages'], {
      queryParams: { userId: this.provider()!._id }
    });
  }

  selectService(service: ProviderService): void {
    this.selectedService.set(service);
  }

  proceedToBooking(): void {
    const service = this.selectedService();
    if (!service) return;
    this.showServiceModal.set(false);
    this.router.navigate(['/booking', this.provider()!._id], {
      queryParams: {
        serviceName: service.name,
        servicePrice: service.price,
      },
    });
  }

  getStars(rating: number): string[] {
    return Array(5).fill('').map((_, i) => i < Math.round(rating) ? '★' : '☆');
  }

  getReviewerName(review: Review): string {
    const c = review.customer;
    if (typeof c === 'object' && c !== null) return (c as User).name;
    return 'Customer';
  }

  formatDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  getCategoryColor(cat: string): string {
    const map: Record<string, string> = {
      plumbing: '#4EA8DE', electrical: '#F08C00',
      cleaning: '#2D9B6F', carpentry: '#1B3A6B',
    };
    return map[cat] || '#1B3A6B';
  }
}