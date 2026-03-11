import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { User, ProviderService } from '../../models/models';

@Component({
  selector: 'app-booking',
  imports: [RouterLink, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './booking.html',
})
export class BookingComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  provider = signal<User | null>(null);
  loadingProvider = signal(true);

  providerId = signal('');
  selectedService = signal<ProviderService | null>(null);

  scheduledDate = signal('');
  scheduledTime = signal('');
  address = signal('');
  contactPhone = signal('');
  notes = signal('');

  submitting = signal(false);
  error = signal('');

  readonly timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  ];

  get minDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) this.contactPhone.set(user.phone || '');

    this.route.paramMap.subscribe((params) => {
      const id = params.get('providerId') || '';
      this.providerId.set(id);
      if (id) this.loadProvider(id);
    });

    // Pre-select service if passed via query params
    this.route.queryParamMap.subscribe((params) => {
      const name = params.get('serviceName');
      const price = Number(params.get('servicePrice'));
      if (name && price) {
        this.selectedService.set({ name, price, description: '' });
      }
    });
  }

  loadProvider(id: string): void {
    this.loadingProvider.set(true);
    this.apiService.getProvider(id).subscribe({
      next: (p) => { this.provider.set(p); this.loadingProvider.set(false); },
      error: () => this.loadingProvider.set(false),
    });
  }

  platformFee = () => Math.round((this.selectedService()?.price || 0) * 0.1);
  total = () => (this.selectedService()?.price || 0) + this.platformFee();

  onSubmit(): void {
    if (!this.selectedService()) { this.error.set('Please select a service.'); return; }
    if (!this.scheduledDate() || !this.scheduledTime() || !this.address() || !this.contactPhone()) {
      this.error.set('Please fill in all required fields.');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    this.apiService.createBooking({
      providerId: this.providerId(),
      service: {
        name: this.selectedService()!.name,
        price: this.selectedService()!.price,
      },
      scheduledDate: this.scheduledDate(),
      scheduledTime: this.scheduledTime(),
      address: this.address(),
      contactPhone: this.contactPhone(),
      notes: this.notes(),
    }).subscribe({
      next: (booking) => {
        this.router.navigate(['/payment', booking._id]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || 'Failed to create booking.');
      },
    });
  }
}