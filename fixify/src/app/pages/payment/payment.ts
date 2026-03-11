import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { Booking } from '../../models/models';

type PaymentMethod = 'gcash' | 'maya' | 'card';

@Component({
  selector: 'app-payment',
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './payment.html',
})
export class PaymentComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  booking = signal<Booking | null>(null);
  loading = signal(true);
  error = signal('');

  selectedMethod = signal<PaymentMethod>('gcash');
  processing = signal(false);
  paid = signal(false);

readonly methods: { id: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { id: 'gcash', label: 'GCash', icon: '📱', desc: 'Pay via GCash mobile wallet' },
  { id: 'maya', label: 'Maya', icon: '💙', desc: 'Pay via Maya (PayMaya)' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard accepted' },
];

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('bookingId') || params.get('id') || '';
      if (id) this.loadBooking(id);
    });
  }

  loadBooking(id: string): void {
    this.loading.set(true);
    this.apiService.getBookingById(id).subscribe({
      next: (b) => { this.booking.set(b); this.loading.set(false); },
      error: () => { this.error.set('Booking not found.'); this.loading.set(false); },
    });
  }

  platformFee = () => Math.round((this.booking()?.service.price || 0) * 0.1);
  total = () => (this.booking()?.service.price || 0) + this.platformFee();

  onPay(): void {
    if (!this.booking()) return;
    this.processing.set(true);

    // Simulate payment processing
    setTimeout(() => {
this.apiService.updateBooking(this.booking()!._id, {
  paymentStatus: 'held-in-escrow',
}).subscribe({
        next: () => {
          this.processing.set(false);
          this.paid.set(true);
        },
        error: () => {
          this.processing.set(false);
          this.error.set('Payment failed. Please try again.');
        },
      });
    }, 2000);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  formatDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }
}