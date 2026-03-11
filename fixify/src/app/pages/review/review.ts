import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { Booking, User } from '../../models/models';

@Component({
  selector: 'app-review',
  imports: [FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './review.html',
})
export class ReviewComponent implements OnInit {
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  booking = signal<Booking | null>(null);
  loading = signal(true);
  submitting = signal(false);
  error = signal('');
  success = signal(false);

  rating = signal(0);
  hoveredRating = signal(0);
  comment = signal('');

  readonly maxComment = 1000;

  remainingChars = computed(() => this.maxComment - this.comment().length);

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

        // Redirect if already reviewed or not completed
        if (booking.hasReview) {
          this.error.set('You have already reviewed this booking.');
        }
        if (booking.status !== 'completed') {
          this.error.set('You can only review completed bookings.');
        }
      },
      error: () => {
        this.error.set('Booking not found.');
        this.loading.set(false);
      },
    });
  }

  setRating(value: number): void {
    this.rating.set(value);
  }

  setHoveredRating(value: number): void {
    this.hoveredRating.set(value);
  }

  clearHoveredRating(): void {
    this.hoveredRating.set(0);
  }

  getStarState(index: number): 'filled' | 'hovered' | 'empty' {
    const display = this.hoveredRating() || this.rating();
    if (index <= display) return index <= this.rating() ? 'filled' : 'hovered';
    return 'empty';
  }

  getProviderName(): string {
    const provider = this.booking()?.provider;
    if (typeof provider === 'object' && provider !== null) {
      return (provider as User).name;
    }
    return 'Provider';
  }

  getRatingLabel(): string {
    const labels: Record<number, string> = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
    };
    return labels[this.hoveredRating() || this.rating()] || 'Select a rating';
  }

  onSubmit(): void {
    if (this.rating() === 0) {
      this.error.set('Please select a rating.');
      return;
    }
    if (!this.comment().trim()) {
      this.error.set('Please write a review comment.');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    this.apiService.createReview({
      bookingId: this.booking()!._id,
      rating: this.rating(),
      comment: this.comment().trim(),
    }).subscribe({
      next: () => {
        this.success.set(true);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || 'Failed to submit review. Please try again.');
      },
    });
  }
}