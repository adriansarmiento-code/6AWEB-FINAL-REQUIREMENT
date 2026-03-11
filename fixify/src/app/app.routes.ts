import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { customerGuard } from './guards/customer.guard';
import { providerGuard } from './guards/provider.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about').then((m) => m.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact').then((m) => m.ContactComponent),
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./pages/services/services').then((m) => m.ServicesComponent),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/search/search').then((m) => m.SearchComponent),
  },
  {
    path: 'provider/:id',
    loadComponent: () =>
      import('./pages/provider-profile/provider-profile').then((m) => m.ProviderProfileComponent),
  },

  // Auth routes
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup').then((m) => m.SignupComponent),
  },

  // Customer routes
  {
    path: 'booking/:providerId',
    loadComponent: () =>
      import('./pages/booking/booking').then((m) => m.BookingComponent),
    canActivate: [authGuard],
  },
  {
    path: 'payment/:bookingId',
    loadComponent: () =>
      import('./pages/payment/payment').then((m) => m.PaymentComponent),
    canActivate: [authGuard],
  },
  {
    path: 'review/:bookingId',
    loadComponent: () =>
      import('./pages/review/review').then((m) => m.ReviewComponent),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
    canActivate: [customerGuard],
  },
  {
    path: 'messages/:conversationId',
    loadComponent: () =>
      import('./pages/messages/messages').then((m) => m.MessagesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'messages',
    loadComponent: () =>
      import('./pages/messages/messages').then((m) => m.MessagesComponent),
    canActivate: [authGuard],
  },

  // Provider routes
  {
    path: 'provider-dashboard',
    loadComponent: () =>
      import('./pages/provider-dashboard/provider-dashboard').then((m) => m.ProviderDashboardComponent),
    canActivate: [providerGuard],
  },
{
  path: 'provider-messages',
  canActivate: [providerGuard],
  loadComponent: () =>
    import('./pages/provider-messages/provider-messages').then(
      (m) => m.ProviderMessagesComponent
    ),
},
{
  path: 'provider-messages/:customerId',
  canActivate: [providerGuard],
  loadComponent: () =>
    import('./pages/provider-messages/provider-messages').then(
      (m) => m.ProviderMessagesComponent
    ),
},

  // Admin routes
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./pages/admin-login/admin-login').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
    canActivate: [adminGuard],
  },

  // Fallback
  {
    path: '**',
    redirectTo: '',
  },
];