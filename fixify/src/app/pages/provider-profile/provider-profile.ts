import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { User, Review } from '../../models/models';

@Component({
  selector: 'app-provider-profile',
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './provider-profile.html',
})
export class ProviderProfileComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  provider = signal<User | null>(null);
  reviews = signal<Review[]>([]);
  loadingProvider = signal(true);
  loadingReviews = signal(true);
  errorProvider = signal('');
  showLoginModal = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProvider(id);
      this.loadReviews(id);
    }
  }

  private loadProvider(id: string): void {
    this.loadingProvider.set(true);
    this.apiService.getProviderById(id).subscribe({
      next: (provider) => {
        this.provider.set(provider);
        this.loadingProvider.set(false);
      },
      error: () => {
        this.errorProvider.set('Provider not found.');
        this.loadingProvider.set(false);
      },
    });
  }

  private loadReviews(id: string): void {
    this.loadingReviews.set(true);
    this.apiService.getProviderReviews(id).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.loadingReviews.set(false);
      },
      error: () => {
        this.loadingReviews.set(false);
      },
    });
  }

  bookProvider(): void {
    if (!this.authService.isAuthenticated()) {
      this.showLoginModal.set(true);
      return;
    }
    this.router.navigate(['/booking', this.provider()?._id]);
  }

  messageProvider(): void {
    if (!this.authService.isAuthenticated()) {
      this.showLoginModal.set(true);
      return;
    }
    if (this.authService.isProvider()) {
      this.router.navigate(['/provider-messages', this.provider()?._id]);
    } else {
      this.router.navigate(['/messages', this.provider()?._id]);
    }
  }

  closeLoginModal(): void {
    this.showLoginModal.set(false);
  }

  goToLogin(): void {
    const id = this.provider()?._id;
    this.router.navigate(['/login'], {
      queryParams: { redirect: `/booking/${id}` },
    });
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  getStars(rating: number): string[] {
    return Array(5).fill('').map((_, i) => i < Math.round(rating) ? '★' : '☆');
  }

  getReviewerName(review: Review): string {
    if (typeof review.customer === 'object' && review.customer !== null) {
      return (review.customer as User).name;
    }
    return 'Anonymous';
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getCategoryLabel(category?: string): string {
    const map: Record<string, string> = {
      plumbing: 'Plumbing',
      electrical: 'Electrical',
      cleaning: 'Cleaning',
      carpentry: 'Carpentry',
      painting: 'Painting',
      hvac: 'HVAC',
      landscaping: 'Landscaping',
      'appliance-repair': 'Appliance Repair',
      other: 'Other',
    };
    return map[category || ''] || category || '';
  }
}