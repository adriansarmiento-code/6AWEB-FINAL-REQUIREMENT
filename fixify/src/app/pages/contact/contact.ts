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
  submitting = signal(false);
  submitted = signal(false);

  readonly subjects = [
    'General Inquiry',
    'Booking Issue',
    'Provider Complaint',
    'Payment Problem',
    'Account Help',
    'Partnership / Join as Provider',
    'Other',
  ];

  readonly contactInfo = [
    {
      icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
      title: 'Address',
      lines: ['Holy Angel University', 'Angeles City, Pampanga', 'Philippines'],
    },
    {
      icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
      title: 'Email',
      lines: ['support@fixify.ph', 'hello@fixify.ph'],
    },
    {
      icon: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z',
      title: 'Phone',
      lines: ['+63 (045) 888-8888', 'Mon–Fri, 8AM–6PM'],
    },
    {
      icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Hours',
      lines: ['Monday – Friday', '8:00 AM – 6:00 PM', 'Saturday 9AM – 3PM'],
    },
  ];

  onSubmit(): void {
    if (!this.name() || !this.email() || !this.subject() || !this.message()) return;
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      this.submitted.set(true);
    }, 1500);
  }

  reset(): void {
    this.name.set('');
    this.email.set('');
    this.subject.set('');
    this.message.set('');
    this.submitted.set(false);
  }
}