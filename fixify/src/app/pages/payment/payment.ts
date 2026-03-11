import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { Booking } from '../../models/models';

@Component({
  selector: 'app-payment',
  imports: [FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './payment.html',
})
export class PaymentComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  booking = signal<Booking | null>(null);
  loading = signal(true);
  submitting = signal(false);
  error = signal('');

  selectedMethod = signal<string>('card');

  readonly paymentMethods = [
    { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
    { id: 'ewallet', label: 'E-Wallet (GCash / Maya)', icon: '📱' },
    { id: 'banking', label: 'Online Banking', icon: '🏦' },
  ];

  ngOnInit(): void {
    const bookingId = this.route.snapshot.paramMap.get('bookingId');
    if (bookingId) {
      this.loadBooking(bookingId);
    }
  }

  private loadBooking(id: string): void {
    this.loading.set(true);
    this.apiService.getBookingById(id).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Booking not found.');
        this.loading.set(false);
      },
    });
  }

  getProviderName(): string {
    const provider = this.booking()?.provider;
    if (typeof provider === 'object' && provider !== null) {
      return (provider as any).name;
    }
    return 'Provider';
  }

  onSubmit(): void {
    this.submitting.set(true);
    this.error.set('');

    // Simulate 2-second payment processing
    setTimeout(() => {
      this.apiService.updateBooking(this.booking()!._id, {
        paymentStatus: 'held-in-escrow',
      }).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.submitting.set(false);
          this.error.set('Payment failed. Please try again.');
        },
      });
    }, 2000);
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}