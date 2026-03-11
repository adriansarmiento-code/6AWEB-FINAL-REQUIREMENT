import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
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

  providerCounts = signal<Record<string, number | undefined>>({});
  loadingCounts = signal(true);

  readonly categories = [
    {
      id: 'plumbing',
      label: 'Plumbing',
      icon: '🔧',
      color: '#4EA8DE',
      desc: 'Leak repairs, pipe installations, drain cleaning, water heater service, and emergency plumbing.',
      features: ['Leak Detection', 'Pipe Repair', 'Drain Cleaning', 'Water Heater', 'Emergency Service'],
    },
    {
      id: 'electrical',
      label: 'Electrical',
      icon: '⚡',
      color: '#F08C00',
      desc: 'Wiring, outlets, circuit breakers, lighting installation, and electrical fault diagnosis.',
      features: ['Wiring', 'Outlets & Switches', 'Circuit Breakers', 'Lighting', 'Fault Diagnosis'],
    },
    {
      id: 'cleaning',
      label: 'Cleaning',
      icon: '🧹',
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