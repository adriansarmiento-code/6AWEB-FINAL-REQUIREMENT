import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './landing.html',
})
export class LandingComponent implements OnInit {
  private router = inject(Router);
  authService = inject(AuthService);
  private apiService = inject(ApiService);

  providerCounts = signal<Record<string, number>>({
    plumbing: 0,
    electrical: 0,
    cleaning: 0,
  });

  ngOnInit(): void {
    ['plumbing', 'electrical', 'cleaning'].forEach((cat) => {
      this.apiService.getProviders({ category: cat }).subscribe({
        next: (providers) => {
          this.providerCounts.update((c) => ({ ...c, [cat]: providers.length }));
        },
        error: () => {},
      });
    });
  }

  goToSearch(category: string): void {
    this.router.navigate(['/search'], { queryParams: { category } });
  }
}