import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-about',
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './about.html',
})
export class AboutComponent {
  readonly team = [
    {
      name: 'Adrian P. Sarmiento',
      role: 'Project Manager & Full-Stack Developer',
      initials: 'AS',
      color: '#1E5C3A',
    },
    {
      name: 'Kurt Justine T. Sicat',
      role: 'Angular Frontend Developer',
      initials: 'KS',
      color: '#7AAE8E',
    },
    {
      name: 'Martin Conrad S. Villanueva',
      role: 'UI/UX Designer',
      initials: 'MV',
      color: '#C9A87C',
    },
    {
      name: 'Krisean G. Tienzo',
      role: 'Tech Writer & Backend Developer',
      initials: 'KT',
      color: '#1A2E20',
    },
    {
      name: 'Clarence Lane C. Parungao',
      role: 'UI/UX Designer',
      initials: 'CP',
      color: '#4EA8DE',
    },
  ];

  readonly values = [
    {
      icon: '🛡️',
      title: 'Trust & Safety',
      description:
        'Every provider on Fixify is manually reviewed and verified before being listed on our platform.',
    },
    {
      icon: '💎',
      title: 'Quality Service',
      description:
        'We hold providers to a high standard through our review and rating system powered by real customer feedback.',
    },
    {
      icon: '🤝',
      title: 'Fair for Everyone',
      description:
        'Our escrow payment system ensures customers only pay for completed work and providers get paid on time.',
    },
    {
      icon: '🌱',
      title: 'Community First',
      description:
        'Built for the people of Angeles City, Pampanga — connecting local talent with local households.',
    },
  ];
}