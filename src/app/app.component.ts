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
    () =>
      this.authService.estaAutenticado() &&
      (!!this.authService.usuarioActual()?.nombre ||
        (!!this.student() && !!this.student()?.fullName))
  );
  readonly rutaActual = signal<string>(this.router.url);

  // Estado del Chatbot Interactivo Global (Manitos Coach)
  readonly chatAbierto = signal<boolean>(false);
  readonly escribiendoChat = signal<boolean>(false);
  readonly vozChatActiva = signal<boolean>(true);
  readonly vozHablando = signal<boolean>(false);
  readonly mensajesChat = signal<
    { autor: 'bot' | 'usuario'; texto: string; hora: string }[]
  >([
    {
      autor: 'bot',
      texto:
        '¡Hola! Soy Manitos Coach 🩺. Estoy aquí para acompañarte en los 6 pasos OMS y prepararte para el Modo Reto Extremo.',
      hora: 'Ahora',
    },
  ]);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.rutaActual.set(event.urlAfterRedirects || this.router.url);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
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

  toggleVozGlobal(): void {
    const act = !this.vozChatActiva();
    this.vozChatActiva.set(act);
    if (!act && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.vozHablando.set(false);
    }
  }

  enviarPreguntaRapida(pregunta: string): void {
    this.mensajesChat.update((prev) => [
      ...prev,
      { autor: 'usuario', texto: pregunta, hora: 'Ahora' },
    ]);
    this.escribiendoChat.set(true);

    setTimeout(() => {
      this.escribiendoChat.set(false);
      let respuesta =
        'Recuerda mantener entre 3 y 8 segundos de fricción por paso para garantizar una asepsia hospitalaria óptima.';
      if (pregunta.includes('6 pasos')) {
        respuesta =
          'Los 6 pasos OMS son: 1) Palma con palma, 2) Palma sobre dorso, 3) Espacios interdigitales, 4) Dorso de los dedos en candado, 5) Rotación de pulgares y 6) Yemas y uñas en la palma opuesta.';
      } else if (pregunta.includes('Jabón')) {
        respuesta =
          'Usa agua y jabón (40-60s) cuando haya suciedad visible, sangre o exposición a esporas como Clostridioides difficile. En los demás escenarios clínicos usa base alcohólica al 60-80% (20-30s).';
      }

      this.mensajesChat.update((prev) => [
        ...prev,
        { autor: 'bot', texto: respuesta, hora: 'Ahora' },
      ]);
      this.hablarRespuestaChat(respuesta);
    }, 650);
  }

  private hablarRespuestaChat(texto: string): void {
    if (!this.vozChatActiva() || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'es-ES';
      u.rate = 1.04;
      u.onstart = () => this.vozHablando.set(true);
      u.onend = () => this.vozHablando.set(false);
      u.onerror = () => this.vozHablando.set(false);
      synth.speak(u);
    } catch {
      this.vozHablando.set(false);
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.stateService.resetAll();
    this.router.navigate(['/bienvenida']);
  }
}
