import { Component, inject, signal, computed, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Booking, Review, User, ProviderService } from '../../models/models';

type ProviderTab = 'bookings' | 'earnings' | 'reviews' | 'services' | 'settings';

@Component({
  selector: 'app-provider-dashboard',
  imports: [FormsModule, RouterLink],
  templateUrl: './provider-dashboard.html',
})
export class ProviderDashboardComponent implements OnInit {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  private router = inject(Router);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  activeTab = signal<ProviderTab>('bookings');
  bookingFilter = signal<string>('all');

  bookings = signal<Booking[]>([]);
  reviews = signal<Review[]>([]);
  loadingBookings = signal(true);
  loadingReviews = signal(true);

  uploadingImage = signal(false);

  // Settings
  settingsName = signal('');
  settingsPhone = signal('');
  settingsBio = signal('');
  settingsHourlyRate = signal(0);
  settingsServiceArea = signal('');
  settingsSkills = signal('');
  savingSettings = signal(false);
  settingsSuccess = signal('');
  settingsError = signal('');

  // Services
  services = signal<ProviderService[]>([]);
  showAddServiceModal = signal(false);
  editingServiceIndex = signal<number | null>(null);
  serviceFormName = signal('');
  serviceFormPrice = signal(0);
  serviceFormDesc = signal('');
  savingService = signal(false);

  // Reviews
  replyingToReview = signal<string | null>(null);
  replyText = signal('');
  submittingReply = signal(false);

  readonly serviceAreas = [
    'Angeles City Center', 'Balibago', 'Nepo Mall Area',
    'Marquee Mall Area', 'Clark',
  ];

  readonly tabs: { id: ProviderTab; label: string; icon: string }[] = [
    { id: 'bookings', label: 'Jobs', icon: '📋' },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'services', label: 'Services', icon: '🔧' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  ngOnInit(): void {
    this.loadBookings();
    this.loadReviews();
    const user = this.authService.user();
    if (user) {
      this.settingsName.set(user.name);
      this.settingsPhone.set(user.phone);
      this.settingsBio.set(user.providerInfo?.bio || '');
      this.settingsHourlyRate.set(user.providerInfo?.hourlyRate || 0);
      this.settingsServiceArea.set(user.providerInfo?.serviceArea || 'Angeles City Center');
      this.settingsSkills.set((user.providerInfo?.skills || []).join(', '));
      this.services.set(user.providerInfo?.services || []);
    }
  }

  loadBookings(): void {
    this.loadingBookings.set(true);
    const params: any = { role: 'provider' };
    if (this.bookingFilter() !== 'all') params.status = this.bookingFilter();
    this.apiService.getBookings(params).subscribe({
      next: (b) => { this.bookings.set(b); this.loadingBookings.set(false); },
      error: () => this.loadingBookings.set(false),
    });
  }

  loadReviews(): void {
    const userId = this.authService.user()?._id;
    if (!userId) return;
    this.loadingReviews.set(true);
    this.apiService.getProviderReviews(userId).subscribe({
      next: (r) => { this.reviews.set(r); this.loadingReviews.set(false); },
      error: () => this.loadingReviews.set(false),
    });
  }

  onFilterChange(value: string): void {
    this.bookingFilter.set(value);
    this.loadBookings();
  }

  filteredBookings = computed(() => {
    const f = this.bookingFilter();
    if (f === 'all') return this.bookings();
    return this.bookings().filter((b) => b.status === f);
  });

  completedBookings = computed(() =>
    this.bookings().filter((b) => b.status === 'completed')
  );

  stats = computed(() => {
    const b = this.bookings();
    const completed = b.filter((x) => x.status === 'completed');
    return {
      totalBookings: b.length,
      completedJobs: completed.length,
      totalEarnings: completed.reduce((sum, x) => sum + x.service.price, 0),
      rating: this.authService.user()?.providerInfo?.rating ?? 0,
    };
  });

  monthlyEarnings = computed(() => {
    const now = new Date();
    return this.completedBookings()
      .filter((b) => {
        const d = new Date(b.scheduledDate!);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, b) => sum + b.service.price, 0);
  });

  pendingPayout = computed(() =>
    this.bookings()
      .filter((b) => b.paymentStatus === 'held-in-escrow')
      .reduce((sum, b) => sum + b.service.price, 0)
  );

  // Photo upload
  triggerImageInput(): void { this.imageInput.nativeElement.click(); }

  handleImageUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB.'); return; }
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }

    this.uploadingImage.set(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.apiService.uploadProfileImage(base64).subscribe({
        next: (res) => {
          this.authService.updateUser(res.user);
          this.uploadingImage.set(false);
        },
        error: () => { alert('Failed to upload image.'); this.uploadingImage.set(false); },
      });
    };
    reader.readAsDataURL(file);
    (event.target as HTMLInputElement).value = '';
  }

  // Bookings
  getCustomerName(b: Booking): string {
    const c = b.customer;
    return typeof c === 'object' && c !== null ? (c as User).name : 'Customer';
  }

  confirmBooking(id: string): void {
    this.apiService.updateBooking(id, { status: 'confirmed' }).subscribe({
      next: () => this.loadBookings(),
      error: () => alert('Failed to confirm booking.'),
    });
  }

  startJob(id: string): void {
    this.apiService.updateBooking(id, { status: 'in-progress', paymentStatus: 'held-in-escrow' }).subscribe({
      next: () => this.loadBookings(),
      error: () => alert('Failed to start job.'),
    });
  }

  openChat(booking: Booking): void {
    const c = booking.customer;
    if (typeof c === 'object' && c !== null) {
      this.router.navigate(['/provider-messages', (c as User)._id]);
    }
  }

  // Services
  openAddService(): void {
    this.editingServiceIndex.set(null);
    this.serviceFormName.set('');
    this.serviceFormPrice.set(0);
    this.serviceFormDesc.set('');
    this.showAddServiceModal.set(true);
  }

  openEditService(index: number): void {
    const s = this.services()[index];
    this.editingServiceIndex.set(index);
    this.serviceFormName.set(s.name);
    this.serviceFormPrice.set(s.price);
    this.serviceFormDesc.set(s.description || '');
    this.showAddServiceModal.set(true);
  }

  saveService(): void {
    if (!this.serviceFormName().trim() || this.serviceFormPrice() <= 0) return;
    const updated = [...this.services()];
    const entry: ProviderService = {
      name: this.serviceFormName().trim(),
      price: this.serviceFormPrice(),
      description: this.serviceFormDesc().trim(),
    };
    if (this.editingServiceIndex() !== null) {
      updated[this.editingServiceIndex()!] = entry;
    } else {
      updated.push(entry);
    }
    this.savingService.set(true);
    this.apiService.updateProvider(this.authService.user()!._id, { providerInfo: { services: updated } } as any).subscribe({
      next: (user: User) => {
        this.authService.updateUser(user);
        this.services.set(user.providerInfo?.services || []);
        this.showAddServiceModal.set(false);
        this.savingService.set(false);
      },
      error: () => { alert('Failed to save service.'); this.savingService.set(false); },
    });
  }

  deleteService(index: number): void {
    if (!confirm('Delete this service?')) return;
    const updated = this.services().filter((_, i) => i !== index);
    this.apiService.updateProvider(this.authService.user()!._id, { providerInfo: { services: updated } } as any).subscribe({
      next: (user: User) => { this.authService.updateUser(user); this.services.set(user.providerInfo?.services || []); },
      error: () => alert('Failed to delete service.'),
    });
  }

  // Reviews
  startReply(id: string): void { this.replyingToReview.set(id); this.replyText.set(''); }
  cancelReply(): void { this.replyingToReview.set(null); this.replyText.set(''); }

  submitReply(id: string): void {
    if (!this.replyText().trim()) return;
    this.submittingReply.set(true);
    this.apiService.respondToReview(id, this.replyText().trim()).subscribe({
      next: () => { this.submittingReply.set(false); this.replyingToReview.set(null); this.loadReviews(); },
      error: () => { this.submittingReply.set(false); alert('Failed to submit reply.'); },
    });
  }

  getReviewerName(r: Review): string {
    const c = r.customer;
    return typeof c === 'object' && c !== null ? (c as User).name : 'Customer';
  }

  getStars(rating: number): string[] {
    return Array(5).fill('').map((_, i) => i < Math.round(rating) ? '★' : '☆');
  }

  // Settings
  saveSettings(): void {
    if (!this.settingsName().trim()) { this.settingsError.set('Name is required.'); return; }
    this.savingSettings.set(true);
    this.settingsError.set('');
    this.settingsSuccess.set('');
    const skills = this.settingsSkills().split(',').map((s) => s.trim()).filter(Boolean);
    this.apiService.updateProfile({ name: this.settingsName(), phone: this.settingsPhone() }).subscribe({
      next: () => {
        this.apiService.updateProvider(this.authService.user()!._id, {
          providerInfo: {
            bio: this.settingsBio(),
            hourlyRate: this.settingsHourlyRate(),
            serviceArea: this.settingsServiceArea(),
            skills,
          },
        } as any).subscribe({
          next: (user: User) => {
            this.authService.updateUser(user);
            this.savingSettings.set(false);
            this.settingsSuccess.set('Profile updated successfully.');
            setTimeout(() => this.settingsSuccess.set(''), 3000);
          },
          error: () => { this.savingSettings.set(false); this.settingsError.set('Failed to update provider info.'); },
        });
      },
      error: () => { this.savingSettings.set(false); this.settingsError.set('Failed to update profile.'); },
    });
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