import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HandwashStateService } from '../../core/services/handwash-state.service';
import { AuthService } from '../../services/auth.service';
import { EncuestaService } from '../../services/encuesta.service';

interface RatingOption {
  value: number;
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#08151D] via-[#0E2428] to-[#081E1C] text-slate-100 relative overflow-hidden">
      <!-- Glows y Efectos Ambientales Asépticos -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00B39F]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#50E7FF]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

      <div class="max-w-4xl mx-auto relative z-10">

        <!-- 1. ENCABEZADO DE LA ENCUESTA -->
        <div class="bg-gradient-to-r from-[#0d1e26] via-[#10292f] to-[#0c2420] rounded-3xl p-6 sm:p-8 border border-[#00B39F]/30 shadow-2xl mb-8 relative overflow-hidden animate-fade-in">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-start sm:items-center gap-3.5">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00B39F] via-[#50E7FF] to-[#D9FF43] p-1 shadow-lg shrink-0">
                <div class="w-full h-full bg-[#080B10] rounded-[14px] flex items-center justify-center text-[#50E7FF]">
                  <svg class="w-7 h-7 text-[#50E7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>

              <div>
                <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00B39F]/20 text-[#50E7FF] text-xs font-bold mb-2 border border-[#00B39F]/30 shadow-xs">
                  <span class="w-2 h-2 rounded-full bg-[#50E7FF] animate-pulse"></span>
                  <span>Instrumento de Calidad Docente</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Evaluación de la Experiencia y Usabilidad
                </h1>
                <p class="text-xs sm:text-sm text-[#A5C2DE] mt-1">
                  Estudiante: <strong class="text-white">{{ studentName() }}</strong>
                  <span class="mx-2 text-slate-500">•</span>
                  Código: <span class="font-mono text-[#50E7FF]">{{ studentCode() }}</span>
                </p>
              </div>
            </div>

            <!-- Progreso de la encuesta -->
            <div class="bg-black/40 px-4 py-2.5 rounded-2xl border border-white/10 self-start md:self-auto flex items-center gap-3">
              <div class="text-right">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Progreso</span>
                <span class="text-xs sm:text-sm font-black text-[#50E7FF]">
                  {{ totalContestadas() }} de 4 respondidas
                </span>
              </div>
              <div class="w-10 h-10 rounded-xl bg-[#00B39F]/20 text-[#50E7FF] font-black text-xs flex items-center justify-center border border-[#00B39F]/40">
                {{ porcentajeCompletado() }}%
              </div>
            </div>
          </div>

          <p class="text-xs sm:text-sm text-[#C5D7E8] mt-4 pt-4 border-t border-white/10 leading-relaxed">
            Tu opinión es fundamental para el mejoramiento continuo del simulador y para la investigación docente de la Facultad de Enfermería. Califica con sinceridad tu experiencia antes de emitir tu certificado oficial.
          </p>
        </div>

        <!-- 2. FORMULARIO CON LAS 4 PREGUNTAS TIPO TARJETA -->
        <div class="space-y-6 mb-8">

          <!-- PREGUNTA 1: NAVEGACIÓN Y FACILIDAD DE USO -->
          <div class="bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-3xl p-6 sm:p-7 shadow-xl border border-white/15 animate-fade-in hover:border-[#00B39F]/40 transition duration-300">
            <div class="flex items-center gap-2 mb-2">
              <span class="w-6 h-6 rounded-lg bg-[#00B39F] text-[#080B10] font-black text-xs flex items-center justify-center">1</span>
              <span class="text-xs uppercase font-extrabold tracking-wider text-[#50E7FF]">Usabilidad & Navegación</span>
            </div>

            <h3 class="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
              ¿Qué tan fácil e intuitiva te resultó la navegación en la plataforma?
            </h3>
            <p class="text-xs text-slate-400 mb-5">
              Evalúa la claridad de los menús, las transiciones entre fases y la facilidad para interactuar con la plataforma.
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              @for (op of opcionesEscala; track op.value) {
                <button
                  type="button"
                  (click)="facilidadUso.set(op.value)"
                  class="p-3 sm:p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1 group"
                  [ngClass]="facilidadUso() === op.value
                    ? 'bg-gradient-to-tr from-[#00B39F] to-[#009988] text-white border-white/40 ring-4 ring-[#00B39F]/30 shadow-lg scale-102'
                    : 'bg-black/30 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'"
                >
                  <span class="text-xl sm:text-2xl transition-transform group-hover:scale-115">{{ op.emoji }}</span>
                  <span class="font-mono text-sm sm:text-base font-black">{{ op.value }}</span>
                  <span class="text-[10px] font-bold leading-tight line-clamp-1">{{ op.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- PREGUNTA 2: UTILIDAD DE VIDEOS Y CHECKLIST -->
          <div class="bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-3xl p-6 sm:p-7 shadow-xl border border-white/15 animate-fade-in hover:border-[#00B39F]/40 transition duration-300">
            <div class="flex items-center gap-2 mb-2">
              <span class="w-6 h-6 rounded-lg bg-[#50E7FF] text-[#080B10] font-black text-xs flex items-center justify-center">2</span>
              <span class="text-xs uppercase font-extrabold tracking-wider text-[#50E7FF]">Material Didáctico</span>
            </div>

            <h3 class="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
              ¿Los videos y el checklist de preparación te ayudaron a comprender la técnica correcta?
            </h3>
            <p class="text-xs text-slate-400 mb-5">
              Evalúa la calidad pedagógica de los videos de referencia, el checklist inicial y la explicación de los 6 pasos.
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              @for (op of opcionesEscala; track op.value) {
                <button
                  type="button"
                  (click)="utilidadGuia.set(op.value)"
                  class="p-3 sm:p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1 group"
                  [ngClass]="utilidadGuia() === op.value
                    ? 'bg-gradient-to-tr from-[#00B39F] to-[#009988] text-white border-white/40 ring-4 ring-[#00B39F]/30 shadow-lg scale-102'
                    : 'bg-black/30 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'"
                >
                  <span class="text-xl sm:text-2xl transition-transform group-hover:scale-115">{{ op.emoji }}</span>
                  <span class="font-mono text-sm sm:text-base font-black">{{ op.value }}</span>
                  <span class="text-[10px] font-bold leading-tight line-clamp-1">{{ op.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- PREGUNTA 3: DETECCIÓN POR CÁMARA Y MEDIAPIPE -->
          <div class="bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-3xl p-6 sm:p-7 shadow-xl border border-white/15 animate-fade-in hover:border-[#00B39F]/40 transition duration-300">
            <div class="flex items-center gap-2 mb-2">
              <span class="w-6 h-6 rounded-lg bg-[#D9FF43] text-[#080B10] font-black text-xs flex items-center justify-center">3</span>
              <span class="text-xs uppercase font-extrabold tracking-wider text-[#D9FF43]">Visión Artificial & Feedback</span>
            </div>

            <h3 class="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
              ¿La detección en vivo por cámara te brindó retroalimentación útil durante la práctica?
            </h3>
            <p class="text-xs text-slate-400 mb-5">
              Evalúa la precisión en el reconocimiento de manos, el cronómetro de fricción y las alertas biomecánicas en vivo.
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              @for (op of opcionesEscala; track op.value) {
                <button
                  type="button"
                  (click)="claridadFeed.set(op.value)"
                  class="p-3 sm:p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1 group"
                  [ngClass]="claridadFeed() === op.value
                    ? 'bg-gradient-to-tr from-[#00B39F] to-[#009988] text-white border-white/40 ring-4 ring-[#00B39F]/30 shadow-lg scale-102'
                    : 'bg-black/30 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'"
                >
                  <span class="text-xl sm:text-2xl transition-transform group-hover:scale-115">{{ op.emoji }}</span>
                  <span class="font-mono text-sm sm:text-base font-black">{{ op.value }}</span>
                  <span class="text-[10px] font-bold leading-tight line-clamp-1">{{ op.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- PREGUNTA 4: RECOMENDACIÓN PEDAGÓGICA -->
          <div class="bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-3xl p-6 sm:p-7 shadow-xl border border-white/15 animate-fade-in hover:border-[#00B39F]/40 transition duration-300">
            <div class="flex items-center gap-2 mb-2">
              <span class="w-6 h-6 rounded-lg bg-[#FF6A4D] text-white font-black text-xs flex items-center justify-center">4</span>
              <span class="text-xs uppercase font-extrabold tracking-wider text-[#FF6A4D]">Recomendación Académica</span>
            </div>

            <h3 class="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
              ¿Recomendarías esta plataforma para el entrenamiento en enfermería?
            </h3>
            <p class="text-xs text-slate-400 mb-5">
              Evalúa la pertinencia de la herramienta para futuros semestres, rotaciones clínicas y laboratorios de simulación.
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              @for (op of opcionesEscala; track op.value) {
                <button
                  type="button"
                  (click)="recomendacion.set(op.value)"
                  class="p-3 sm:p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1 group"
                  [ngClass]="recomendacion() === op.value
                    ? 'bg-gradient-to-tr from-[#00B39F] to-[#009988] text-white border-white/40 ring-4 ring-[#00B39F]/30 shadow-lg scale-102'
                    : 'bg-black/30 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'"
                >
                  <span class="text-xl sm:text-2xl transition-transform group-hover:scale-115">{{ op.emoji }}</span>
                  <span class="font-mono text-sm sm:text-base font-black">{{ op.value }}</span>
                  <span class="text-[10px] font-bold leading-tight line-clamp-1">{{ op.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- CAMPO DE COMENTARIOS Y SUGERENCIAS (OPCIONAL) -->
          <div class="bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-3xl p-6 sm:p-7 shadow-xl border border-white/15 animate-fade-in">
            <label for="comentarios" class="block text-sm font-extrabold text-white mb-2">
              Comentarios o sugerencias para mejorar la plataforma (opcional)
            </label>
            <p class="text-xs text-slate-400 mb-3">
              ¿Tienes sugerencias sobre la interfaz, los tiempos, los videos o nuevas funciones que te gustaría ver?
            </p>
            <textarea
              id="comentarios"
              rows="3"
              [(ngModel)]="comentariosTexto"
              placeholder="Escribe tus sugerencias aquí (ej. 'Me pareció muy útil el paso a paso', 'Sería genial agregar más casos clínicos')..."
              class="w-full px-4 py-3 rounded-2xl border border-white/15 bg-black/40 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00B39F] focus:ring-2 focus:ring-[#00B39F]/20 text-xs sm:text-sm transition resize-none"
            ></textarea>
          </div>

        </div>

        <!-- ERROR O ALERTA -->
        @if (errorEnvio()) {
          <div class="mb-6 p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-center justify-between animate-fade-in">
            <span>{{ errorEnvio() }}</span>
            <button (click)="errorEnvio.set('')" class="text-amber-400 hover:text-white font-bold text-base">&times;</button>
          </div>
        }

        <!-- 3. BOTÓN DE ENVÍO Y OBTENCIÓN DE CERTIFICADO -->
        <div class="bg-gradient-to-r from-[#0d1e26] via-[#10292f] to-[#0c2420] rounded-3xl p-6 border border-white/10 shadow-2xl text-center space-y-3">
          <button
            type="button"
            (click)="enviarEncuesta()"
            [disabled]="!formularioValido() || enviando()"
            class="w-full sm:w-auto px-10 py-4 rounded-full font-black text-base shadow-2xl transition-all duration-300 transform flex items-center justify-center gap-3 mx-auto cursor-pointer"
            [ngClass]="formularioValido() && !enviando()
              ? 'bg-[#00B39F] hover:bg-[#009988] text-white hover:scale-105 active:scale-95 shadow-[#00B39F]/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-white/5'"
          >
            @if (enviando()) {
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Guardando Respuestas y Generando Certificado...</span>
            } @else {
              <span>Enviar Encuesta y Obtener Certificado</span>
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            }
          </button>

          <p class="text-[11px] text-slate-400">
            @if (!formularioValido()) {
              <span>Por favor responde las 4 preguntas para desbloquear tu certificado final (faltan {{ 4 - totalContestadas() }}).</span>
            } @else {
              <span class="text-[#50E7FF] font-semibold">✓ Todas las preguntas han sido respondidas. Pulsa el botón para continuar a tus resultados oficiales.</span>
            }
          </p>
        </div>

      </div>
    </div>
  `,
})
export class EncuestaComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly stateService = inject(HandwashStateService);
  private readonly authService = inject(AuthService);
  private readonly encuestaService = inject(EncuestaService);

  readonly student = this.stateService.student;
  readonly studentName = computed(() => this.student()?.fullName || 'Estudiante');
  readonly studentCode = computed(() => this.student()?.studentCode || 'No registrado');

  readonly facilidadUso = signal<number | null>(null);
  readonly utilidadGuia = signal<number | null>(null);
  readonly claridadFeed = signal<number | null>(null);
  readonly recomendacion = signal<number | null>(null);
  comentariosTexto = '';

  readonly enviando = signal(false);
  readonly errorEnvio = signal('');

  readonly opcionesEscala: RatingOption[] = [
    { value: 1, label: 'Deficiente', emoji: '😕' },
    { value: 2, label: 'Regular', emoji: '😐' },
    { value: 3, label: 'Aceptable', emoji: '🙂' },
    { value: 4, label: 'Buena', emoji: '😊' },
    { value: 5, label: 'Excelente', emoji: '🤩' },
  ];

  readonly totalContestadas = computed(() => {
    let count = 0;
    if (this.facilidadUso() !== null) count++;
    if (this.utilidadGuia() !== null) count++;
    if (this.claridadFeed() !== null) count++;
    if (this.recomendacion() !== null) count++;
    return count;
  });

  readonly porcentajeCompletado = computed(() => {
    return Math.round((this.totalContestadas() / 4) * 100);
  });

  readonly formularioValido = computed(() => {
    return (
      this.facilidadUso() !== null &&
      this.utilidadGuia() !== null &&
      this.claridadFeed() !== null &&
      this.recomendacion() !== null
    );
  });

  ngOnInit(): void {
    if (!this.student()) {
      this.router.navigate(['/bienvenida']);
    }
  }

  enviarEncuesta(): void {
    if (!this.formularioValido()) {
      return;
    }

    this.enviando.set(true);
    this.errorEnvio.set('');

    const payload = {
      facilidadUso: this.facilidadUso()!,
      utilidadGuia: this.utilidadGuia()!,
      claridadFeed: this.claridadFeed()!,
      recomendacion: this.recomendacion()!,
      comentarios: this.comentariosTexto.trim() || null,
      codigoEstudiantil: this.student()?.studentCode || undefined,
    };

    this.encuestaService.enviarEncuesta(payload).subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigate(['/resultado']);
      },
      error: (err) => {
        console.warn('Aviso al persistir encuesta en servidor:', err);
        this.enviando.set(false);
        // Permitir continuar a resultados para no bloquear al estudiante
        this.router.navigate(['/resultado']);
      },
    });
  }
}
