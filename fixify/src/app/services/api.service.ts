import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { AuthService } from './auth.service';
import {
  User,
  AuthResponse,
  RegisterPayload,
  LoginPayload,
  UpdateProfilePayload,
  UploadImageResponse,
  ProvidersResponse,
  BookingsResponse,
  ReviewsResponse,
  MessagesResponse,
  ConversationsResponse,
  NotificationsResponse,
  UnreadCountResponse,
  AdminStats,
  AdminUsersResponse,
  AdminProvidersResponse,
  AdminBookingsResponse,
  AdminReviewsResponse,
  AdminActivityResponse,
  Booking,
  Review,
  Message,
  Notification,
  Conversation,
  CreateBookingPayload,
  UpdateBookingPayload,
  CreateReviewPayload,
  CancelBookingResponse,
  ActivityItem,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE_URL = 'http://localhost:5000/api';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.token();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  // ============================================================
  // AUTH
  // ============================================================

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/auth/register`, payload);
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/auth/login`, payload);
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.BASE_URL}/auth/me`, {
      headers: this.getHeaders(),
    });
  }

  updateProfile(payload: UpdateProfilePayload): Observable<User> {
    return this.http.put<User>(`${this.BASE_URL}/auth/me`, payload, {
      headers: this.getHeaders(),
    });
  }

  uploadProfileImage(base64Image: string): Observable<UploadImageResponse> {
    return this.http.post<UploadImageResponse>(
      `${this.BASE_URL}/auth/upload-image`,
      { image: base64Image },
      { headers: this.getHeaders() }
    );
  }

  // ============================================================
  // PROVIDERS
  // ============================================================
  

  getProviders(params?: {
    category?: string;
    minRating?: number;
    verified?: boolean;
    serviceArea?: string;
    sort?: string;
  }): Observable<User[]> {
    let httpParams = new HttpParams();
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.minRating != null) httpParams = httpParams.set('minRating', params.minRating.toString());
    if (params?.verified != null) httpParams = httpParams.set('verified', params.verified.toString());
    if (params?.serviceArea) httpParams = httpParams.set('serviceArea', params.serviceArea);
    if (params?.sort) httpParams = httpParams.set('sort', params.sort);

    return this.http
      .get<ProvidersResponse>(`${this.BASE_URL}/providers`, { params: httpParams })
      .pipe(map((res) => res.providers));
  }

  getProviderById(id: string): Observable<User> {
    return this.http.get<User>(`${this.BASE_URL}/providers/${id}`);
  }

  updateProvider(id: string, payload: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.BASE_URL}/providers/${id}`, payload, {
      headers: this.getHeaders(),
    });
  }

  // ============================================================
  // BOOKINGS
  // ============================================================

  createBooking(payload: CreateBookingPayload): Observable<Booking> {
    return this.http.post<Booking>(`${this.BASE_URL}/bookings`, payload, {
      headers: this.getHeaders(),
    });
  }

  getBookings(params?: { status?: string; role?: string }): Observable<Booking[]> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.role) httpParams = httpParams.set('role', params.role);

    return this.http
      .get<BookingsResponse>(`${this.BASE_URL}/bookings`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
      .pipe(map((res) => res.bookings));
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.BASE_URL}/bookings/${id}`, {
      headers: this.getHeaders(),
    });
  }

  updateBooking(id: string, payload: UpdateBookingPayload): Observable<Booking> {
    return this.http.put<Booking>(`${this.BASE_URL}/bookings/${id}`, payload, {
      headers: this.getHeaders(),
    });
  }

  cancelBooking(id: string): Observable<CancelBookingResponse> {
    return this.http.delete<CancelBookingResponse>(
      `${this.BASE_URL}/bookings/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // ============================================================
  // REVIEWS
  // ============================================================

  respondToReview(reviewId: string, response: string): Observable<Review> {
  return this.http.put<Review>(
    `${this.BASE_URL}/reviews/${reviewId}/response`,
    { response },
    { headers: this.getHeaders() }
  );
}

  createReview(payload: CreateReviewPayload): Observable<Review> {
    return this.http.post<Review>(`${this.BASE_URL}/reviews`, payload, {
      headers: this.getHeaders(),
    });
  }

  getProviderReviews(providerId: string): Observable<Review[]> {
    return this.http
      .get<ReviewsResponse>(`${this.BASE_URL}/reviews/provider/${providerId}`)
      .pipe(map((res) => res.reviews));
  }

  addReviewResponse(reviewId: string, response: string): Observable<Review> {
    return this.http.put<Review>(
      `${this.BASE_URL}/reviews/${reviewId}/response`,
      { response },
      { headers: this.getHeaders() }
    );
  }

  getAllReviews(params?: { status?: string }): Observable<Review[]> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);

    return this.http
      .get<ReviewsResponse>(`${this.BASE_URL}/reviews`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
      .pipe(map((res) => res.reviews));
  }

  updateReviewStatus(reviewId: string, status: string): Observable<Review> {
    return this.http.put<Review>(
      `${this.BASE_URL}/reviews/${reviewId}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  // ============================================================
  // MESSAGES
  // ============================================================

  getConversations(): Observable<Conversation[]> {
    return this.http
      .get<ConversationsResponse>(`${this.BASE_URL}/messages/conversations`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.conversations));
  }

  getMessages(otherUserId: string): Observable<Message[]> {
    return this.http
      .get<MessagesResponse>(`${this.BASE_URL}/messages/${otherUserId}`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.messages));
  }

  sendMessage(otherUserId: string, message: string): Observable<Message> {
    return this.http
      .post<{ message: Message }>(
        `${this.BASE_URL}/messages/${otherUserId}`,
        { message },
        { headers: this.getHeaders() }
      )
      .pipe(map((res) => res.message));
  }

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  getNotifications(params?: { limit?: number; unreadOnly?: boolean }): Observable<NotificationsResponse> {
    let httpParams = new HttpParams();
    if (params?.limit != null) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.unreadOnly != null) httpParams = httpParams.set('unreadOnly', params.unreadOnly.toString());

    return this.http.get<NotificationsResponse>(`${this.BASE_URL}/notifications`, {
      headers: this.getHeaders(),
      params: httpParams,
    });
  }

  getUnreadCount(): Observable<number> {
    return this.http
      .get<UnreadCountResponse>(`${this.BASE_URL}/notifications/unread-count`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.unreadCount));
  }

  markNotificationAsRead(id: string): Observable<Notification> {
    return this.http.put<Notification>(
      `${this.BASE_URL}/notifications/${id}/read`,
      {},
      { headers: this.getHeaders() }
    );
  }

  markAllNotificationsAsRead(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.BASE_URL}/notifications/read-all`,
      {},
      { headers: this.getHeaders() }
    );
  }

  deleteNotification(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.BASE_URL}/notifications/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // ============================================================
  // ADMIN
  // ============================================================

getAdminStats(): Observable<AdminStats> {
  return forkJoin({
    stats: this.http.get<any>(`${this.BASE_URL}/admin/stats`, { headers: this.getHeaders() }),
    activity: this.http.get<{ activities: ActivityItem[] }>(`${this.BASE_URL}/admin/activity`, { headers: this.getHeaders() }),
  }).pipe(
    map(({ stats, activity }) => ({
      ...stats,
      totalReviews: stats.totalReviews ?? 0,
      recentActivity: activity.activities,
    }))
  );
}
getUsers(): Observable<User[]> {
  return this.http
    .get<{ users: User[] }>(`${this.BASE_URL}/admin/users`, { headers: this.getHeaders() })
    .pipe(map((r) => r.users));
}

  getAdminActivity(): Observable<ActivityItem[]> {
    return this.http
      .get<AdminActivityResponse>(`${this.BASE_URL}/admin/activity`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.activities));
  }

  getAdminUsers(params?: { search?: string; filter?: string }): Observable<User[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.filter) httpParams = httpParams.set('filter', params.filter);

    return this.http
      .get<AdminUsersResponse>(`${this.BASE_URL}/admin/users`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
      .pipe(map((res) => res.users));
  }

  getAdminProviders(params?: { search?: string; filter?: string }): Observable<User[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.filter) httpParams = httpParams.set('filter', params.filter);

    return this.http
      .get<AdminProvidersResponse>(`${this.BASE_URL}/admin/providers`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
      .pipe(map((res) => res.providers));
  }

  verifyProvider(id: string): Observable<{ message: string; provider: User }> {
    return this.http.put<{ message: string; provider: User }>(
      `${this.BASE_URL}/admin/providers/${id}/verify`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getAdminBookings(params?: { search?: string; filter?: string }): Observable<Booking[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.filter) httpParams = httpParams.set('filter', params.filter);

    return this.http
      .get<AdminBookingsResponse>(`${this.BASE_URL}/admin/bookings`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
      .pipe(map((res) => res.bookings));
  }

getAdminReviews(): Observable<Review[]> {
  return this.http
    .get<{ reviews: Review[] }>(`${this.BASE_URL}/admin/reviews`, { headers: this.getHeaders() })
    .pipe(map((r) => r.reviews));
}

suspendUser(id: string): Observable<any> {
  return this.http.put(`${this.BASE_URL}/admin/users/${id}/suspend`, {}, { headers: this.getHeaders() });
}

removeReview(id: string): Observable<any> {
  return this.http.put(`${this.BASE_URL}/admin/reviews/${id}/status`, { status: 'removed' }, { headers: this.getHeaders() });
}
  adminUpdateReviewStatus(reviewId: string, status: string): Observable<Review> {
    return this.http
      .put<{ review: Review }>(
        `${this.BASE_URL}/admin/reviews/${reviewId}/status`,
        { status },
        { headers: this.getHeaders() }
      )
      .pipe(map((res) => res.review));
  }
  
}

