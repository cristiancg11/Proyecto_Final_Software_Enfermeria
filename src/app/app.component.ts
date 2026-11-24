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
  readonly studentCode = computed(
    () =>
      this.student()?.studentCode ||
      this.authService.usuarioActual()?.codigoEstudiantil ||
      '2026-ENF-UCC'
  );
  readonly avatarUsuario = this.authService.avatarUsuario;
  readonly esDocente = this.authService.esDocente;
  readonly isLoggedIn = computed(
    () =>
      this.authService.estaAutenticado() &&
      (!!this.authService.usuarioActual()?.nombre ||
        (!!this.student() && !!this.student()?.fullName))
  );

  readonly simulacionHabilitada = computed(() => {
    return this.esDocente() || this.stateService.haCompletadoPracticaGuiada();
  });
  readonly alertaBloqueoSimulacion = signal<boolean>(false);

  abrirSimulacionIa(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.simulacionHabilitada()) {
      this.alertaBloqueoSimulacion.set(true);
      return;
    }
    this.router.navigate(['/evaluacion-practica']);
  }
  readonly rutaActual = signal<string>(this.router.url);

  // Modo Simulador Móvil en Pantallas Grandes (Desktop)
  readonly vistaSimuladorMovil = signal<boolean>(false);
  toggleVistaSimulador(): void {
    this.vistaSimuladorMovil.update((v) => !v);
  }

  // Menú Flotante / Drawer de Pasos 1 al 7 para Dispositivos Móviles
  readonly menuPasosMovilAbierto = signal<boolean>(false);
  toggleMenuPasosMovil(): void {
    this.menuPasosMovilAbierto.update((v) => !v);
  }
  cerrarMenuPasosMovil(): void {
    this.menuPasosMovilAbierto.set(false);
  }

  readonly infoPasoActual = computed(() => {
    const ruta = this.rutaActual() || this.router.url || '';
    if (ruta.includes('/dashboard')) return { numero: 0, nombre: '📊 Dashboard' };
    if (ruta.includes('/introduccion')) return { numero: 1, nombre: '1. Introducción' };
    if (ruta.includes('/preparacion')) return { numero: 2, nombre: '2. Preparación' };
    if (ruta.includes('/diagnostico')) return { numero: 2, nombre: '2B. Pre-Test OMS' };
    if (ruta.includes('/practica')) return { numero: 3, nombre: '3. Práctica OMS' };
    if (ruta.includes('/evaluacion-practica')) return { numero: 4, nombre: '4. Ev. Práctica' };
    if (ruta.includes('/evaluacion-teorica')) return { numero: 5, nombre: '5. Post-Test OMS' };
    if (ruta.includes('/encuesta')) return { numero: 6, nombre: '6. Encuesta' };
    if (ruta.includes('/resultado')) return { numero: 7, nombre: '7. Resultados' };
    // Modo desafío retirado según requerimiento docente
    if (ruta.includes('/perfil')) return { numero: 10, nombre: '👤 Mi Perfil' };
    if (ruta.includes('/admin')) return { numero: 99, nombre: '👑 Panel Docente' };
    return { numero: 0, nombre: 'Dashboard' };
  });

  esImagenUrl(str: string | null | undefined): boolean {
    if (!str) return false;
    return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:image/');
  }

  esRutaLogin(): boolean {
    const ruta = (this.rutaActual() || this.router.url || '').trim();
    return (
      !ruta ||
      ruta === '/' ||
      ruta === '/bienvenida' ||
      ruta === '/login' ||
      ruta.startsWith('/bienvenida') ||
      ruta.startsWith('/login')
    );
  }

  esRutaPractica(): boolean {
    const ruta = this.rutaActual() || this.router.url;
    return ruta.startsWith('/practica');
  }

  pasoDesbloqueado(paso: number): boolean {
    if (this.esDocente()) {
      return true;
    }
    return this.stateService.isStepUnlocked(paso);
  }

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.rutaActual.set(event.urlAfterRedirects || this.router.url);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.stateService.resetAll();
    this.router.navigate(['/bienvenida']);
  }
}
