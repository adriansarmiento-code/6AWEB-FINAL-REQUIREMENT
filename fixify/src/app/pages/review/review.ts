import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { Booking } from '../../models/models';

@Component({
  selector: 'app-review',
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './review.html',
})
export class ReviewComponent implements OnInit {
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  booking = signal<Booking | null>(null);
  loading = signal(true);
  error = signal('');

  rating = signal(0);
  hoveredRating = signal(0);
  comment = signal('');
  submitting = signal(false);
  submitted = signal(false);

  readonly labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

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

  setRating(r: number): void { this.rating.set(r); }
  setHover(r: number): void { this.hoveredRating.set(r); }
  clearHover(): void { this.hoveredRating.set(0); }

  getProviderName(): string {
    const p = this.booking()?.provider;
    if (typeof p === 'object' && p !== null) return (p as any).name || 'Provider';
    return 'Provider';
  }

  onSubmit(): void {
    if (this.rating() === 0) { this.error.set('Please select a star rating.'); return; }
    if (!this.comment().trim()) { this.error.set('Please write a comment.'); return; }

    this.submitting.set(true);
    this.error.set('');

this.apiService.createReview({
  bookingId: this.booking()!._id,
  rating: this.rating(),
  comment: this.comment(),
}).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || 'Failed to submit review.');
      },
    });
  }
}