import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-about',
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './about.html',
})
export class AboutComponent {}