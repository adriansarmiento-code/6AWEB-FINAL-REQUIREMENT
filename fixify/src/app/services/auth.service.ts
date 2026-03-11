import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'fixify_user';
  private readonly TOKEN_KEY = 'fixify_token';

  // Signals for reactive state
  private _user = signal<User | null>(this.loadUser());
  private _token = signal<string | null>(this.loadToken());

  // Public computed reads
  readonly user = computed(() => this._user());
  readonly token = computed(() => this._token());
  readonly isAuthenticated = computed(() => !!this._token() && !!this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly isProvider = computed(() => this._user()?.role === 'provider');
  readonly isCustomer = computed(() => this._user()?.role === 'customer');

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private loadToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setAuth(user: User, token: string): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_KEY, token);
    this._user.set(user);
    this._token.set(token);
  }

  updateUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this._user.set(null);
    this._token.set(null);
  }
}