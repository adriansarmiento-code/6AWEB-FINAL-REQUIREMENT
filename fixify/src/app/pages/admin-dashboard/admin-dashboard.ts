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

  readonly tabs: { id: AdminTab; label: string }[] = [
    { id: 'overview',  label: 'Overview'   },
    { id: 'users',     label: 'Users'      },
    { id: 'providers', label: 'Providers'  },
    { id: 'bookings',  label: 'Bookings'   },
    { id: 'reviews',   label: 'Reviews'    },
  ];

  // Icon paths for overview stat cards
  readonly statIcons: Record<string, string> = {
    users:     'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    providers: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z',
    bookings:  'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
    reviews:   'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
    booking:   'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
    user:      'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
    review:    'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
  };

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
    this.apiService.getAdminBookings({
      filter: this.bookingFilter() === 'all' ? undefined : this.bookingFilter(),
    }).subscribe({
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