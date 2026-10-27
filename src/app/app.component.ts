import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HandwashStateService } from './core/services/handwash-state.service';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App {
  private readonly router = inject(Router);
  readonly stateService = inject(HandwashStateService);
  readonly authService = inject(AuthService);

  readonly student = this.stateService.student;
  readonly studentName = computed(
    () => this.student()?.fullName || this.authService.usuarioActual()?.nombre
  );
  readonly esDocente = this.authService.esDocente;
  readonly isLoggedIn = computed(
    () => this.authService.estaAutenticado() || (!!this.student() && !!this.student()?.fullName)
  );
  readonly rutaActual = signal<string>(this.router.url);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.rutaActual.set(event.urlAfterRedirects || this.router.url);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  esRutaLogin(): boolean {
    const ruta = this.rutaActual() || this.router.url;
    return (
      ruta === '/' ||
      ruta === '/bienvenida' ||
      ruta === '/login' ||
      ruta.startsWith('/bienvenida') ||
      ruta.startsWith('/login')
    );
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.stateService.resetAll();
    this.router.navigate(['/bienvenida']);
  }
}
