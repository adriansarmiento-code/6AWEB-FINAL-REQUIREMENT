import { Component, inject, signal, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
})
export class HeaderComponent {
  private router = inject(Router);
  authService = inject(AuthService);

  mobileOpen = signal(false);
  scrolled = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 20);
  }

  @HostListener('window:keydown.escape')
  onEsc(): void {
    this.mobileOpen.set(false);
  }

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  goToDashboard(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    } else if (this.authService.isProvider()) {
      this.router.navigate(['/provider-dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
    this.mobileOpen.set(false);
  }

  goToMessages(): void {
    if (this.authService.isProvider()) {
      this.router.navigate(['/provider-messages']);
    } else {
      this.router.navigate(['/messages']);
    }
    this.mobileOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.mobileOpen.set(false);
  }
}