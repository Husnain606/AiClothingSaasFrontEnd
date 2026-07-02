import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  socialLinks = [
    { icon: 'bi-facebook', url: '#', label: 'Facebook' },
    { icon: 'bi-twitter', url: '#', label: 'Twitter' },
    { icon: 'bi-instagram', url: '#', label: 'Instagram' },
    { icon: 'bi-linkedin', url: '#', label: 'LinkedIn' },
  ];

  footerLinks = [
    {
      title: 'About',
      links: [
        { label: 'About Us', url: '#' },
        { label: 'Careers', url: '#' },
        { label: 'Blog', url: '#' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', url: '#' },
        { label: 'FAQ', url: '#' },
        { label: 'Shipping Info', url: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', url: '#' },
        { label: 'Terms of Service', url: '#' },
        { label: 'Cookie Policy', url: '#' },
      ],
    },
  ];
}
