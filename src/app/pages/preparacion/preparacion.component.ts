import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HandwashStateService } from '../../core/services/handwash-state.service';

@Component({
  selector: 'app-preparacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fade-in text-slate-100">
      
      <!-- ENCABEZADO DE PREPARACIÓN CLÍNICA -->
      <div class="relative bg-gradient-to-r from-[#08151D] via-[#0E2428] to-[#081E1C] rounded-3xl p-6 sm:p-10 border border-[#00B39F]/30 shadow-2xl overflow-hidden mb-10">
        <!-- Glows ambientales -->
        <div class="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#00B39F]/15 blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#50E7FF]/15 blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
          <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#00B39F]/20 border border-[#00B39F]/40 text-[#50E7FF] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <svg class="w-4 h-4 text-[#00B39F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Fase 1 • Protocolo de Bioseguridad Hospitalaria</span>
          </div>

          <h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3 drop-shadow-md">
            Preparación Previa al Lavado de Manos
          </h1>

          <p class="text-sm sm:text-base md:text-lg text-[#C5D7E8] max-w-2xl leading-relaxed mb-6">
            Condiciones asépticas obligatorias según el protocolo clínico. Antes de encender la cámara y realizar los 6 pasos biomecánicos de la OMS, debes preparar físicamente tus manos y antebrazos.
          </p>

          <div class="inline-flex flex-wrap items-center gap-3 px-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-xs sm:text-sm text-slate-300">
            <span class="w-2.5 h-2.5 rounded-full bg-[#50E7FF] animate-pulse"></span>
            <span>Estudiante en formación:</span>
            <strong class="text-white">{{ nombreEstudiante() }}</strong>
            <span class="text-slate-500">•</span>
            <span class="font-mono text-[#50E7FF]">{{ codigoEstudiante() }}</span>
          </div>
        </div>
      </div>

      <!-- 3 TARJETAS VISUALES DE INDICACIONES CLÍNICAS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <!-- TARJETA 1: RETIRO DE JOYAS Y ACCESORIOS -->
        <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-xl border border-white/80 text-slate-800 flex flex-col justify-between hover:shadow-2xl transition duration-300 relative group overflow-hidden">
          <div class="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full pointer-events-none"></div>

          <div>
            <!-- Ícono visual claro: Joyas tachadas / reloj prohibido -->
            <div class="w-16 h-16 rounded-2xl bg-red-100/80 border-2 border-red-200 flex items-center justify-center text-red-600 mb-5 relative shadow-inner">
              <svg class="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <!-- Círculo reloj/anillo con diagonal de prohibición -->
                <circle cx="12" cy="12" r="9" stroke-width="2" stroke-dasharray="2 2" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v5l3 2" />
              </svg>
              <span class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black shadow-md">✕</span>
            </div>

            <div class="inline-block px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold uppercase mb-2">
              Prohibido en Área Clínica
            </div>

            <h3 class="text-lg sm:text-xl font-black text-slate-900 mb-2.5">
              1. Retiro de Joyas y Accesorios
            </h3>

            <p class="text-xs text-slate-600 leading-relaxed mb-4">
              Las joyas, anillos, pulseras y relojes actúan como un potente <strong>reservorio microbiano</strong>, atrapan detritos orgánicos y humedad debajo de ellos, e impiden la fricción mecánica uniforme sobre la epidermis.
            </p>
          </div>

          <div class="bg-red-50/80 rounded-2xl p-3 border border-red-200/80 text-[11px] text-red-800 font-semibold">
            ✓ Retirar anillos de cualquier material, pulseras de tela o metal, y relojes de pulsera.
          </div>
        </div>

        <!-- TARJETA 2: DESPEJE DE ANTEBRAZOS -->
        <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-xl border border-white/80 text-slate-800 flex flex-col justify-between hover:shadow-2xl transition duration-300 relative group overflow-hidden">
          <div class="absolute top-0 right-0 w-24 h-24 bg-[#E6FBF7] rounded-bl-full pointer-events-none"></div>

          <div>
            <!-- Ícono visual claro: Manga doblada sobre el codo -->
            <div class="w-16 h-16 rounded-2xl bg-[#CFFBF0] border-2 border-[#00B39F]/30 flex items-center justify-center text-[#008072] mb-5 relative shadow-inner">
              <svg class="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <!-- Brazo y manga recogida -->
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14h4a2 2 0 002-2V8a2 2 0 00-2-2h-4a2 2 0 00-2 2v4a2 2 0 002 2z" />
              </svg>
              <span class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#00B39F] text-white flex items-center justify-center text-xs font-black shadow-md">↑</span>
            </div>

            <div class="inline-block px-2.5 py-0.5 rounded-full bg-[#00B39F]/10 text-[#008072] text-[10px] font-extrabold uppercase mb-2">
              Prevención de Fómites
            </div>

            <h3 class="text-lg sm:text-xl font-black text-slate-900 mb-2.5">
              2. Despeje de Antebrazos
            </h3>

            <p class="text-xs text-slate-600 leading-relaxed mb-4">
              Las mangas largas no deben rozar ni salpicar el área de lavado para evitar <strong>contaminación cruzada textil</strong>. Las telas húmedas favorecen la proliferación y transporte bacteriano entre pacientes.
            </p>
          </div>

          <div class="bg-[#E6FBF7] rounded-2xl p-3 border border-[#00B39F]/20 text-[11px] text-[#008072] font-semibold">
            ✓ Remangar la bata o filipina uniformemente al menos 10 cm por encima del pliegue del codo.
          </div>
        </div>

        <!-- TARJETA 3: CONDICIÓN DE UÑAS Y PIEL -->
        <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-xl border border-white/80 text-slate-800 flex flex-col justify-between hover:shadow-2xl transition duration-300 relative group overflow-hidden">
          <div class="absolute top-0 right-0 w-24 h-24 bg-[#EAF7FF] rounded-bl-full pointer-events-none"></div>

          <div>
            <!-- Ícono visual claro: Manos limpias y uñas cortas -->
            <div class="w-16 h-16 rounded-2xl bg-[#DDF4FF] border-2 border-[#50E7FF]/40 flex items-center justify-center text-[#085C82] mb-5 relative shadow-inner">
              <svg class="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
              <span class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#085C82] text-white flex items-center justify-center text-xs font-black shadow-md">✓</span>
            </div>

            <div class="inline-block px-2.5 py-0.5 rounded-full bg-[#50E7FF]/20 text-[#085C82] text-[10px] font-extrabold uppercase mb-2">
              Biocarga Subungueal
            </div>

            <h3 class="text-lg sm:text-xl font-black text-slate-900 mb-2.5">
              3. Condición de Uñas y Piel
            </h3>

            <p class="text-xs text-slate-600 leading-relaxed mb-4">
              El <strong>área subungueal concentra la mayor densidad microbiana</strong> de la mano. Las uñas largas (&gt;0.5 cm), los esmaltes agrietados y las uñas artificiales albergan colonias bacterianas resistentes a los antisépticos.
            </p>
          </div>

          <div class="bg-[#EAF7FF] rounded-2xl p-3 border border-[#50E7FF]/30 text-[11px] text-[#085C82] font-semibold">
            ✓ Uñas cortas, limpias, sin esmaltes fracturados ni postizos; piel sin lesiones abiertas.
          </div>
        </div>

      </div>

      <!-- BLOQUE DE CHECKLIST INTERACTIVO OBLIGATORIO -->
      <div class="bg-gradient-to-b from-[#0E1F27] to-[#08151D] rounded-3xl p-6 sm:p-10 border border-[#00B39F]/40 shadow-2xl relative overflow-hidden mb-8">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-[#00B39F]/20 border border-[#00B39F]/40 flex items-center justify-center text-[#50E7FF] shrink-0">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <span class="text-xs font-bold text-[#50E7FF] uppercase tracking-wider block">Validación Obligatoria</span>
              <h2 class="text-xl sm:text-2xl font-black text-white">
                Lista de Verificación de Asepsia Previa
              </h2>
            </div>
          </div>

          <!-- Indicador de Progreso del Checklist -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-black transition-all"
               [ngClass]="checklistCompleto() ? 'bg-[#00B39F]/20 text-[#50E7FF] border-[#00B39F]/40 shadow-md' : 'bg-black/30 text-amber-300 border-amber-500/30'">
            @if (checklistCompleto()) {
              <span class="w-2 h-2 rounded-full bg-[#00B39F] animate-ping"></span>
              <span>✓ 3 de 3 requisitos verificados</span>
            } @else {
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Requisitos completados: {{ totalMarcados() }} de 3</span>
            }
          </div>
        </div>

        <!-- 3 Casillas de Verificación Interactivas -->
        <div class="space-y-4 mb-8">

          <!-- Checkbox 1 -->
          <label
            (click)="toggleJoyas()"
            class="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none"
            [ngClass]="sinJoyas() ? 'bg-[#00B39F]/15 border-[#00B39F]/60 text-white shadow-sm' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'"
          >
            <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                 [ngClass]="sinJoyas() ? 'bg-[#00B39F] border-[#00B39F] text-white shadow-xs' : 'border-slate-400 bg-transparent'">
              @if (sinJoyas()) {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              }
            </div>
            <div>
              <span class="text-sm sm:text-base font-bold block" [ngClass]="sinJoyas() ? 'text-white' : 'text-slate-200'">
                He retirado anillos, reloj y pulseras.
              </span>
              <span class="text-xs text-slate-400 block mt-0.5">
                Ambas manos y muñecas están totalmente libres de metales, bisutería o accesorios textiles.
              </span>
            </div>
          </label>

          <!-- Checkbox 2 -->
          <label
            (click)="toggleMangas()"
            class="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none"
            [ngClass]="mangasArriba() ? 'bg-[#00B39F]/15 border-[#00B39F]/60 text-white shadow-sm' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'"
          >
            <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                 [ngClass]="mangasArriba() ? 'bg-[#00B39F] border-[#00B39F] text-white shadow-xs' : 'border-slate-400 bg-transparent'">
              @if (mangasArriba()) {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              }
            </div>
            <div>
              <span class="text-sm sm:text-base font-bold block" [ngClass]="mangasArriba() ? 'text-white' : 'text-slate-200'">
                He subido mis mangas por encima de los codos.
              </span>
              <span class="text-xs text-slate-400 block mt-0.5">
                Los antebrazos están completamente despejados al menos 10 cm por encima del pliegue de flexión.
              </span>
            </div>
          </label>

          <!-- Checkbox 3 -->
          <label
            (click)="toggleManosListas()"
            class="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none"
            [ngClass]="manosListas() ? 'bg-[#00B39F]/15 border-[#00B39F]/60 text-white shadow-sm' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'"
          >
            <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                 [ngClass]="manosListas() ? 'bg-[#00B39F] border-[#00B39F] text-white shadow-xs' : 'border-slate-400 bg-transparent'">
              @if (manosListas()) {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              }
            </div>
            <div>
              <span class="text-sm sm:text-base font-bold block" [ngClass]="manosListas() ? 'text-white' : 'text-slate-200'">
                Mis manos están libres de objetos y listas para iniciar.
              </span>
              <span class="text-xs text-slate-400 block mt-0.5">
                Uñas en condición adecuada y dispensador o área de práctica localizada frente a la cámara.
              </span>
            </div>
          </label>

        </div>

        <!-- BOTÓN DE AVANCE A PRÁCTICA ASISTIDA -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div class="text-xs text-slate-400 text-center sm:text-left">
            @if (!checklistCompleto()) {
              <span class="text-amber-300 font-semibold">⚠ Marca las 3 casillas anteriores para habilitar la práctica.</span>
            } @else {
              <span class="text-emerald-300 font-semibold">✓ Protocolo de preparación verificado. Puedes continuar.</span>
            }
          </div>

          <!-- Botón de avance: Deshabilitado hasta completar los 3 requisitos -->
          <button
            type="button"
            (click)="continuarAPractica()"
            [disabled]="!checklistCompleto()"
            class="w-full sm:w-auto px-10 py-4 rounded-full font-extrabold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-3 shadow-lg group"
            [ngClass]="checklistCompleto()
              ? 'bg-[#00B39F] hover:bg-[#008072] text-white shadow-[0_4px_24px_rgba(0,179,159,0.4)] hover:shadow-[0_6px_30px_rgba(0,179,159,0.6)] hover:scale-105 active:scale-95 cursor-pointer'
              : 'bg-slate-800 text-slate-500 border border-slate-700/60 opacity-60 cursor-not-allowed select-none shadow-none'"
          >
            @if (checklistCompleto()) {
              <span>Continuar a Práctica Asistida</span>
              <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            } @else {
              <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Continuar a Práctica Asistida</span>
            }
          </button>
        </div>

      </div>

    </div>
  `,
})
export class PreparacionComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly stateService = inject(HandwashStateService);

  readonly sinJoyas = signal<boolean>(false);
  readonly mangasArriba = signal<boolean>(false);
  readonly manosListas = signal<boolean>(false);

  readonly checklistCompleto = computed<boolean>(() => {
    return this.sinJoyas() && this.mangasArriba() && this.manosListas();
  });

  readonly totalMarcados = computed<number>(() => {
    let count = 0;
    if (this.sinJoyas()) count++;
    if (this.mangasArriba()) count++;
    if (this.manosListas()) count++;
    return count;
  });

  readonly nombreEstudiante = computed(() => {
    return (
      this.stateService.student()?.fullName ||
      this.authService.usuarioActual()?.nombre ||
      'Estudiante de Enfermería'
    );
  });

  readonly codigoEstudiante = computed(() => {
    return (
      this.stateService.student()?.studentCode ||
      this.authService.usuarioActual()?.codigoEstudiantil ||
      'UCC-ENF'
    );
  });

  toggleJoyas(): void {
    this.sinJoyas.update((v) => !v);
  }

  toggleMangas(): void {
    this.mangasArriba.update((v) => !v);
  }

  toggleManosListas(): void {
    this.manosListas.update((v) => !v);
  }

  continuarAPractica(): void {
    if (!this.checklistCompleto()) return;
    this.router.navigate(['/practica']);
  }
}
