import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { User } from '../../models/models';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-search',
  imports: [FormsModule, HeaderComponent, FooterComponent, TitleCasePipe],
  templateUrl: './search.html',
})
export class SearchComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  providers = signal<User[]>([]);
  loading = signal(true);
  error = signal('');

  searchCategory = signal('');
  searchArea = signal('');
  searchMinRating = signal(0);
  searchMaxPrice = signal(0);

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

  readonly areas = [
    { value: '', label: 'All Areas' },
    { value: 'Angeles City Center', label: 'Angeles City Center' },
    { value: 'Balibago', label: 'Balibago' },
    { value: 'Nepo Mall Area', label: 'Nepo Mall Area' },
    { value: 'Marquee Mall Area', label: 'Marquee Mall Area' },
    { value: 'Clark', label: 'Clark' },
  ];

  readonly ratings = [
    { value: 0, label: 'Any Rating' },
    { value: 3, label: '3★ and above' },
    { value: 4, label: '4★ and above' },
    { value: 4.5, label: '4.5★ and above' },
  ];

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const cat = params.get('category') || '';
      const area = params.get('area') || '';
      this.searchCategory.set(cat);
      this.searchArea.set(area);
      this.loadProviders();
    });
  }

  loadProviders(): void {
    this.loading.set(true);
    this.error.set('');
    const params: any = {};
    if (this.searchCategory()) params.category = this.searchCategory();
    if (this.searchArea()) params.serviceArea = this.searchArea();
    if (this.searchMinRating() > 0) params.minRating = this.searchMinRating();
    if (this.searchMaxPrice() > 0) params.maxPrice = this.searchMaxPrice();

    this.apiService.getProviders(params).subscribe({
      next: (p) => { this.providers.set(p); this.loading.set(false); },
      error: () => { this.error.set('Failed to load providers.'); this.loading.set(false); },
    });
  }

  applyFilters(): void { this.loadProviders(); }

  clearFilters(): void {
    this.searchCategory.set('');
    this.searchArea.set('');
    this.searchMinRating.set(0);
    this.searchMaxPrice.set(0);
    this.loadProviders();
  }

bookProvider(providerId: string): void {
  if (!this.authService.isAuthenticated()) {
    this.router.navigate(['/provider', providerId]);
    return;
  }
  this.router.navigate(['/booking', providerId]);
}

viewProfile(providerId: string): void {
  this.router.navigate(['/provider', providerId]);
}

  getStars(rating: number): string[] {
    return Array(5).fill('').map((_, i) => i < Math.round(rating) ? '★' : '☆');
  }

  getCategoryColor(cat: string): string {
    const map: Record<string, string> = {
      plumbing: '#4EA8DE', electrical: '#F08C00', cleaning: '#2D9B6F',
      carpentry: '#1B3A6B', painting: '#F08C00', hvac: '#4EA8DE',
    };
    return map[cat] || '#1B3A6B';
  }
}