import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../authentication/core/auth/auth.service';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit {
  user: any;
  sidebarOpen = true;
  darkMode = false;

  navItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/app/classes', label: 'Classes', icon: 'school' },
    { path: '/app/subjects', label: 'Subjects', icon: 'book' },
    { path: '/app/students', label: 'Students', icon: 'people' },
    { path: '/app/grading', label: 'Grading', icon: 'grade' },
    { path: '/app/performance', label: 'Performance', icon: 'bar_chart' },
    { path: '/app/reports', label: 'Reports', icon: 'assessment' },
  ];

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.themeService.darkMode$.subscribe((isDark: boolean) => (this.darkMode = isDark));
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
  }
}
