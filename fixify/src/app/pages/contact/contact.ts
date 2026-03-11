import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-contact',
  imports: [RouterLink, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './contact.html',
})
export class ContactComponent {
  name = signal('');
  email = signal('');
  subject = signal('');
  message = signal('');
  submitted = signal(false);

  readonly subjects = [
    'General Inquiry',
    'Booking Issue',
    'Payment Problem',
    'Provider Complaint',
    'Technical Support',
    'Partnership',
    'Other',
  ];

  readonly info = [
    { icon: '📍', label: 'Location', value: 'Holy Angel University, Angeles City, Pampanga' },
    { icon: '📧', label: 'Email', value: 'fixify@hau.edu.ph' },
    { icon: '🕐', label: 'Support Hours', value: 'Mon–Fri, 8:00 AM – 5:00 PM' },
  ];

  onSubmit(): void {
    if (!this.name() || !this.email() || !this.message()) return;
    // Simulate submission
    this.submitted.set(true);
  }

  reset(): void {
    this.name.set('');
    this.email.set('');
    this.subject.set('');
    this.message.set('');
    this.submitted.set(false);
  }
}