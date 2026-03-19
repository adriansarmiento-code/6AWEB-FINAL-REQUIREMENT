import { Component, inject, signal, computed, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { Booking } from '../../models/models';

type DashboardTab = 'bookings' | 'payments' | 'settings';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  private router = inject(Router);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  activeTab = signal<DashboardTab>('bookings');

  bookings = signal<Booking[]>([]);
  loadingBookings = signal(true);

  uploadingImage = signal(false);

  // Settings
  settingsName = signal('');
  settingsPhone = signal('');
  savingSettings = signal(false);
  settingsSuccess = signal('');
  settingsError = signal('');

readonly tabs: { id: DashboardTab; label: string }[] = [
  { id: 'bookings', label: 'My Bookings' },
  { id: 'payments', label: 'Payments' },
  { id: 'settings', label: 'Settings' },
];

  ngOnInit(): void {
    this.loadBookings();
    const user = this.authService.user();
    if (user) {
      this.settingsName.set(user.name);
      this.settingsPhone.set(user.phone);
    }
  }

  loadBookings(): void {
    this.loadingBookings.set(true);
    this.apiService.getBookings({ role: 'customer' }).subscribe({
      next: (b) => { this.bookings.set(b); this.loadingBookings.set(false); },
      error: () => this.loadingBookings.set(false),
    });
  }

  completedBookings = computed(() =>
    this.bookings().filter((b) => b.status === 'completed')
  );

  pendingBookings = computed(() =>
    this.bookings().filter((b) => ['pending', 'confirmed', 'in-progress'].includes(b.status))
  );

  totalSpent = computed(() =>
    this.bookings()
      .filter((b) => b.paymentStatus === 'released')
      .reduce((sum, b) => sum + b.service.price, 0)
  );

  canReview(booking: Booking): boolean {
    return booking.status === 'completed' && !booking.reviewed;
  }

  confirmCompletion(booking: Booking): void {
    if (!confirm('Confirm this job is complete? Payment will be released to the provider.')) return;
    this.apiService.updateBooking(booking._id, {
      status: 'completed',
      paymentStatus: 'released',
    }).subscribe({
      next: () => this.loadBookings(),
      error: () => alert('Failed to confirm completion.'),
    });
  }

  goToReview(booking: Booking): void {
    this.router.navigate(['/review', booking._id]);
  }

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

  saveSettings(): void {
    if (!this.settingsName().trim()) { this.settingsError.set('Name is required.'); return; }
    this.savingSettings.set(true);
    this.settingsError.set('');
    this.settingsSuccess.set('');
    this.apiService.updateProfile({
      name: this.settingsName(),
      phone: this.settingsPhone(),
    }).subscribe({
      next: (user) => {
        this.authService.updateUser(user);
        this.savingSettings.set(false);
        this.settingsSuccess.set('Profile updated successfully.');
        setTimeout(() => this.settingsSuccess.set(''), 3000);
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
}