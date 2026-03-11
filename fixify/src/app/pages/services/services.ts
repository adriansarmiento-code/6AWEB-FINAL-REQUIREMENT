import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { FormsModule } from '@angular/forms';

interface ServiceCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  count: number;
  loading: boolean;
}

@Component({
  selector: 'app-services',
  imports: [RouterLink, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './services.html',
})
export class ServicesComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);

  categories = signal<ServiceCategory[]>([
    {
      id: 'plumbing',
      label: 'Plumbing',
      icon: '🔧',
      description: 'Leaks, pipe repairs, drain cleaning, fixture installation, and emergency plumbing services.',
      count: 0,
      loading: true,
    },
    {
      id: 'electrical',
      label: 'Electrical',
      icon: '⚡',
      description: 'Wiring repairs, outlet installation, light fixture setup, and electrical fault diagnosis.',
      count: 0,
      loading: true,
    },
    {
      id: 'cleaning',
      label: 'Cleaning',
      icon: '🧹',
      description: 'Deep cleaning, regular maintenance cleaning, and move-in/move-out cleaning services.',
      count: 0,
      loading: true,
    },
  ]);

  searchQuery = signal('');

  ngOnInit(): void {
    this.loadCounts();
  }

  private loadCounts(): void {
    this.categories().forEach((cat, index) => {
      this.apiService.getProviders({ category: cat.id }).subscribe({
        next: (providers) => {
          this.categories.update((cats) =>
            cats.map((c, i) =>
              i === index ? { ...c, count: providers.length, loading: false } : c
            )
          );
        },
        error: () => {
          this.categories.update((cats) =>
            cats.map((c, i) =>
              i === index ? { ...c, count: 0, loading: false } : c
            )
          );
        },
      });
    });
  }

  get filteredCategories(): ServiceCategory[] {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.categories();
    return this.categories().filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  goToSearch(categoryId: string): void {
    this.router.navigate(['/search'], { queryParams: { category: categoryId } });
  }
}