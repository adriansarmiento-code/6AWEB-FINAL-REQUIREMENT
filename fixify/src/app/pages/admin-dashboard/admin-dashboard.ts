import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { User, Booking, Review, AdminStats } from '../../models/models';

type AdminTab = 'overview' | 'users' | 'providers' | 'bookings' | 'reviews';

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboardComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  activeTab = signal<AdminTab>('overview');

  stats = signal<AdminStats | null>(null);
  users = signal<User[]>([]);
  providers = signal<User[]>([]);
  bookings = signal<Booking[]>([]);
  reviews = signal<Review[]>([]);

  loadingStats = signal(true);
  loadingUsers = signal(true);
  loadingProviders = signal(true);
  loadingBookings = signal(true);
  loadingReviews = signal(true);

  userSearch = signal('');
  providerSearch = signal('');
  bookingFilter = signal('all');

  readonly tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'providers', label: 'Providers', icon: '🔧' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
  ];

  ngOnInit(): void {
    this.loadStats();
    this.loadUsers();
    this.loadProviders();
    this.loadBookings();
    this.loadReviews();
  }

  loadStats(): void {
    this.loadingStats.set(true);
    this.apiService.getAdminStats().subscribe({
      next: (s) => { this.stats.set(s); this.loadingStats.set(false); },
      error: () => this.loadingStats.set(false),
    });
  }

  loadUsers(): void {
    this.loadingUsers.set(true);
    this.apiService.getUsers().subscribe({
      next: (u) => { this.users.set(u); this.loadingUsers.set(false); },
      error: () => this.loadingUsers.set(false),
    });
  }

  loadProviders(): void {
    this.loadingProviders.set(true);
    this.apiService.getProviders({}).subscribe({
      next: (p) => { this.providers.set(p); this.loadingProviders.set(false); },
      error: () => this.loadingProviders.set(false),
    });
  }

  loadBookings(): void {
    this.loadingBookings.set(true);
    this.apiService.getBookings({ role: 'admin' }).subscribe({
      next: (b) => { this.bookings.set(b); this.loadingBookings.set(false); },
      error: () => this.loadingBookings.set(false),
    });
  }

  loadReviews(): void {
    this.loadingReviews.set(true);
    this.apiService.getAdminReviews().subscribe({
      next: (r) => { this.reviews.set(r); this.loadingReviews.set(false); },
      error: () => this.loadingReviews.set(false),
    });
  }

  filteredUsers = computed(() => {
    const q = this.userSearch().toLowerCase();
    if (!q) return this.users();
    return this.users().filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  filteredProviders = computed(() => {
    const q = this.providerSearch().toLowerCase();
    if (!q) return this.providers();
    return this.providers().filter(
      (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    );
  });

  filteredBookings = computed(() => {
    const f = this.bookingFilter();
    if (f === 'all') return this.bookings();
    return this.bookings().filter((b) => b.status === f);
  });

  verifyProvider(id: string): void {
    this.apiService.verifyProvider(id).subscribe({
      next: () => this.loadProviders(),
      error: () => alert('Failed to verify provider.'),
    });
  }

  suspendUser(id: string): void {
    if (!confirm('Suspend this user?')) return;
    this.apiService.suspendUser(id).subscribe({
      next: () => this.loadUsers(),
      error: () => alert('Failed to suspend user.'),
    });
  }

  removeReview(id: string): void {
    if (!confirm('Remove this review?')) return;
    this.apiService.removeReview(id).subscribe({
      next: () => this.loadReviews(),
      error: () => alert('Failed to remove review.'),
    });
  }

  getProviderName(booking: Booking): string {
    const p = booking.provider;
    if (typeof p === 'object' && p !== null) return (p as User).name;
    return 'Provider';
  }

  getCustomerName(booking: Booking): string {
    const c = booking.customer;
    if (typeof c === 'object' && c !== null) return (c as User).name;
    return 'Customer';
  }

  getReviewerName(review: Review): string {
    const c = review.customer;
    if (typeof c === 'object' && c !== null) return (c as User).name;
    return 'Customer';
  }

  getReviewProviderName(review: Review): string {
    const p = review.provider;
    if (typeof p === 'object' && p !== null) return (p as User).name;
    return 'Provider';
  }

  getStars(rating: number): string[] {
    return Array(5).fill('').map((_, i) => i < Math.round(rating) ? '★' : '☆');
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      pending: '#F08C00', confirmed: '#1B3A6B',
      'in-progress': '#4EA8DE', completed: '#2D9B6F', cancelled: '#ef4444',
    };
    return map[status] || '#3D4A5C';
  }

  getStatusBg(status: string): string {
    const map: Record<string, string> = {
      pending: 'rgba(240,140,0,0.1)', confirmed: 'rgba(27,58,107,0.1)',
      'in-progress': 'rgba(78,168,222,0.1)', completed: 'rgba(45,155,111,0.1)',
      cancelled: 'rgba(239,68,68,0.1)',
    };
    return map[status] || 'rgba(61,74,92,0.1)';
  }

  formatDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}