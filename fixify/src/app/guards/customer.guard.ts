import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const customerGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isCustomer()) {
    return true;
  }

  if (authService.isAuthenticated() && authService.isProvider()) {
    router.navigate(['/provider-dashboard']);
    return false;
  }

  router.navigate(['/login']);
  return false;
};