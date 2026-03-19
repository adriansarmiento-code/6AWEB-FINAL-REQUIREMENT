import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Notification } from '../../models/models';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.html',
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);
  showDropdown = signal(false);
  loading = signal(false);

  private pollInterval: any;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.fetchUnreadCount();
      this.pollInterval = setInterval(() => this.fetchUnreadCount(), 30000);
    }
  }

  ngOnDestroy(): void { clearInterval(this.pollInterval); }

  @HostListener('document:click')
  onDocumentClick(): void { this.showDropdown.set(false); }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    const next = !this.showDropdown();
    this.showDropdown.set(next);
    if (next) this.fetchNotifications();
  }

  fetchUnreadCount(): void {
    this.apiService.getUnreadCount().subscribe({
      next: (count) => this.unreadCount.set(count),
      error: () => {},
    });
  }

  fetchNotifications(): void {
    this.loading.set(true);
    this.apiService.getNotifications({ limit: 10 }).subscribe({
      next: (res) => {
        this.notifications.set(res.notifications);
        this.unreadCount.set(res.unreadCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  handleClick(event: Event, notif: Notification): void {
    event.stopPropagation();
    if (!notif.read) {
      this.apiService.markNotificationAsRead(notif._id).subscribe({
        next: () => this.fetchNotifications(),
        error: () => {},
      });
    }
    if (notif.link) {
      this.showDropdown.set(false);
      this.router.navigateByUrl(notif.link);
    }
  }

  markAllRead(event: Event): void {
    event.stopPropagation();
    this.apiService.markAllNotificationsAsRead().subscribe({
      next: () => this.fetchNotifications(),
      error: () => {},
    });
  }

  deleteNotif(event: Event, id: string): void {
    event.stopPropagation();
    this.apiService.deleteNotification(id).subscribe({
      next: () => this.fetchNotifications(),
      error: () => {},
    });
  }

  getIcon(type: string): string {
    const map: Record<string, string> = {
      booking: '📅', message: '💬', review: '⭐', payment: '💰', system: '🔔',
    };
    return map[type] || '🔔';
  }

  formatTime(d?: string): string {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    const days = Math.floor(mins / 1440);
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  }
}