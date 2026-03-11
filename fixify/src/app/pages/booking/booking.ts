import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { User, ProviderService } from '../../models/models';

@Component({
  selector: 'app-booking',
  imports: [FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './booking.html',
})
export class BookingComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  provider = signal<User | null>(null);
  loadingProvider = signal(true);
  errorProvider = signal('');
  submitting = signal(false);
  error = signal('');

  // Form fields
  selectedService = signal<ProviderService | null>(null);
  scheduledDate = signal('');
  scheduledTime = signal('');
  address = signal('');
  contactPhone = signal('');
  contactEmail = signal('');
  notes = signal('');

  readonly timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  ];

  readonly minDate = computed(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  platformFee = computed(() => {
    const service = this.selectedService();
    if (!service) return 0;
    return service.price * 0.10;
  });

  totalAmount = computed(() => {
    const service = this.selectedService();
    if (!service) return 0;
    return service.price + this.platformFee();
  });

  ngOnInit(): void {
    const providerId = this.route.snapshot.paramMap.get('providerId');
    if (providerId) {
      this.loadProvider(providerId);
    }

    // Pre-fill contact info from auth
    const user = this.authService.user();
    if (user) {
      this.contactPhone.set(user.phone || '');
      this.contactEmail.set(user.email || '');
    }
  }

  private loadProvider(id: string): void {
    this.loadingProvider.set(true);
    this.apiService.getProviderById(id).subscribe({
      next: (provider) => {
        this.provider.set(provider);
        this.loadingProvider.set(false);
        // Auto-select first service
        if (provider.providerInfo?.services?.length) {
          this.selectedService.set(provider.providerInfo.services[0]);
        }
      },
      error: () => {
        this.errorProvider.set('Provider not found.');
        this.loadingProvider.set(false);
      },
    });
  }

  selectService(service: ProviderService): void {
    this.selectedService.set(service);
  }

  onSubmit(): void {
    if (!this.selectedService()) {
      this.error.set('Please select a service.');
      return;
    }
    if (!this.scheduledDate()) {
      this.error.set('Please select a date.');
      return;
    }
    if (!this.scheduledTime()) {
      this.error.set('Please select a time.');
      return;
    }
    if (!this.address()) {
      this.error.set('Please enter your address.');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    const service = this.selectedService()!;

    this.apiService.createBooking({
      providerId: this.provider()!._id,
      service: {
        name: service.name,
        price: service.price,
        description: service.description,
      },
      scheduledDate: this.scheduledDate(),
      scheduledTime: this.scheduledTime(),
      address: this.address(),
      contactPhone: this.contactPhone(),
      contactEmail: this.contactEmail(),
      notes: this.notes(),
    }).subscribe({
      next: (booking) => {
        this.router.navigate(['/payment', booking._id]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || 'Failed to create booking. Please try again.');
      },
    });
  }
}