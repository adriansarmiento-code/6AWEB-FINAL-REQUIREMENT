import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-services',
  imports: [RouterLink, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './services.html',
})
export class ServicesComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  providerCounts = signal<Record<string, number | undefined>>({});
  loadingCounts = signal(true);

  readonly categories = [
    {
      id: 'plumbing',
      label: 'Plumbing',
      icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z',
      color: '#4EA8DE',
      desc: 'Leak repairs, pipe installations, drain cleaning, water heater service, and emergency plumbing.',
      features: ['Leak Detection', 'Pipe Repair', 'Drain Cleaning', 'Water Heater', 'Emergency Service'],
    },
    {
      id: 'electrical',
      label: 'Electrical',
      icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
      color: '#F08C00',
      desc: 'Wiring, outlets, circuit breakers, lighting installation, and electrical fault diagnosis.',
      features: ['Wiring', 'Outlets & Switches', 'Circuit Breakers', 'Lighting', 'Fault Diagnosis'],
    },
    {
      id: 'cleaning',
      label: 'Cleaning',
      icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z',
      color: '#2D9B6F',
      desc: 'Deep cleaning, regular maintenance, post-construction cleanup, and move-in/out cleaning.',
      features: ['Deep Cleaning', 'Regular Maintenance', 'Post-Construction', 'Move In/Out', 'Office Cleaning'],
    },
  ];

  ngOnInit(): void {
    this.categories.forEach((cat) => {
      this.apiService.getProviders({ category: cat.id }).subscribe({
        next: (providers) => {
          this.providerCounts.update((c) => ({ ...c, [cat.id]: providers.length }));
          if (Object.keys(this.providerCounts()).length === this.categories.length) {
            this.loadingCounts.set(false);
          }
        },
        error: () => this.loadingCounts.set(false),
      });
    });
  }

  browse(categoryId: string): void {
    this.router.navigate(['/search'], { queryParams: { category: categoryId } });
  }
}