import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { HandwashStateService } from '../../core/services/handwash-state.service';

export interface StepTutorialGuide {
  id: number;
  stepNumber: number;
  title: string;
  actionName: string;
  shortDescription: string;
  clinicalKey: string;
  anatomicalFocus: string;
  videoUrl: string;
  iconType: 'palms' | 'dorsal' | 'interdigital' | 'fingers-locked' | 'thumbs' | 'nails';
  biomechanicalTip: string;
}

export const PASOS_GUIA_OMS: StepTutorialGuide[] = [
  {
    id: 1,
    stepNumber: 1,
    title: 'Palma con Palma',
    actionName: 'Fricción palmar bilateral y emulsión antiséptica',
    shortDescription:
      'Frotar con fuerza constante manteniendo el contacto total de ambas superficies palmares para generar una emulsión homogénea.',
    clinicalKey: 'Distribución y activación del surfactante en toda la superficie palmar.',
    anatomicalFocus: 'Palmas bilaterales y eminencias tenar e hipotenar.',
    videoUrl: 'assets/videos/paso1_palmas.mp4',
    iconType: 'palms',
    biomechanicalTip: 'Realiza movimientos circulares amplios abarcando desde la base de la muñeca hasta los dedos.',
  },
  {
    id: 2,
    stepNumber: 2,
    title: 'Dorso de las Manos',
    actionName: 'Fricción dorsal con entrelazado digital',
    shortDescription:
      'Frotar la palma derecha sobre el dorso de la mano izquierda entrelazando los dedos, y viceversa, cubriendo toda el área cutánea posterior.',
    clinicalKey: 'Cobertura del dorso de la mano, área frecuentemente olvidada en lavados apresurados.',
    anatomicalFocus: 'Superficie cutánea dorsal y articulaciones metacarpianas.',
    videoUrl: 'assets/videos/paso2_dorso.mp4',
    iconType: 'dorsal',
    biomechanicalTip: 'Desliza con presión firme desde los nudillos hasta la muñeca en ambas direcciones.',
  },
  {
    id: 3,
    stepNumber: 3,
    title: 'Espacios Interdigitales',
    actionName: 'Palma con palma con dedos fuertemente entrelazados',
    shortDescription:
      'Frotar las palmas de las manos entre sí con los dedos entrelazados, frotando los pliegues y surcos laterales.',
    clinicalKey: 'Remoción de colonias bacterianas alojadas entre los pliegues de los dedos.',
    anatomicalFocus: 'Pliegues interdigitales y caras laterales de los dedos.',
    videoUrl: 'assets/videos/paso3_interdigital.mp4',
    iconType: 'interdigital',
    biomechanicalTip: 'Asegura fricción recíproca profunda desde la base articular hasta las puntas de los dedos.',
  },
  {
    id: 4,
    stepNumber: 4,
    title: 'Dorso de los Dedos',
    actionName: 'Traba de nudillos contra la palma opuesta',
    shortDescription:
      'Frotar el dorso de los dedos flexionados contra la palma de la mano opuesta, manteniendo los dedos trabados en gancho firme.',
    clinicalKey: 'Desinfección de articulaciones interfalángicas proximales y nudillos prominentes.',
    anatomicalFocus: 'Nudillos, articulaciones interfalángicas y lechos dorsales.',
    videoUrl: 'assets/videos/paso4_dedos_trabados.mp4',
    iconType: 'fingers-locked',
    biomechanicalTip: 'Aplica movimiento lateral de vaivén para limpiar las rugosidades articulares.',
  },
  {
    id: 5,
    stepNumber: 5,
    title: 'Limpieza de Pulgares',
    actionName: 'Fricción rotacional envolvente del primer dedo',
    shortDescription:
      'Rodea el pulgar izquierdo con la palma de la mano derecha en un puño cerrado y frota con rotación completa; luego repite con el pulgar derecho.',
    clinicalKey: 'El pulgar es el dedo con mayor interacción y contacto con instrumental y pacientes.',
    anatomicalFocus: 'Primer dedo (pulgar), pliegue aductor y eminencia tenar.',
    videoUrl: 'assets/videos/paso5_pulgares.mp4',
    iconType: 'thumbs',
    biomechanicalTip: 'Abarca toda la circunferencia del dedo con rotación de 360 grados.',
  },
  {
    id: 6,
    stepNumber: 6,
    title: 'Yemas y Uñas',
    actionName: 'Fricción ungueal concéntrica en palma opuesta',
    shortDescription:
      'Frotar las yemas y uñas de los dedos agrupados en punta contra la palma contraria, efectuando rotaciones en espiral.',
    clinicalKey: 'La zona subungueal es el reservorio de mayor densidad de microorganismos patógenos.',
    anatomicalFocus: 'Bordes libres ungueales, lecho subungueal y pulpejos táctiles.',
    videoUrl: 'assets/videos/paso6_unas.mp4',
    iconType: 'nails',
    biomechanicalTip: 'Presiona con firmeza en círculos concéntricos para forzar la penetración del antiséptico.',
  },
];

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Contenedor Maestro con Degradado Aséptico Menta a Durazno -->
    <div class="min-h-screen py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#CFFBF0] via-[#E8FCF7] to-[#FFE9DE] text-[#0B2B29] relative overflow-hidden">
      <!-- Efectos y Resplandores Ambientales -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00B39F]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#FF6A4D]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/20 blur-3xl pointer-events-none"></div>

      <div class="max-w-4xl mx-auto relative z-10">
        @if (!student()) {
          <!-- Pantalla de Bloqueo / Identificación Requerida -->
          <div class="max-w-xl mx-auto my-12 bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/60 text-center animate-fade-in">
            <div class="w-20 h-20 rounded-3xl bg-[#FF6A4D]/15 text-[#FF6A4D] flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#FF6A4D]/30">
              <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span class="inline-block px-3.5 py-1 rounded-full bg-[#FF6A4D]/10 text-[#FF6A4D] font-bold text-xs uppercase tracking-wider mb-3">
              Identificación Requerida
            </span>
            <h2 class="font-heading text-3xl font-extrabold text-[#0B2B29] mb-3">
              Acceso a la Micro-Guía
            </h2>
            <p class="text-sm md:text-base text-slate-600 mb-8 leading-relaxed">
              Para ver el visualizador interactivo de los 6 pasos y calibrar el simulador, primero debes registrarte en la pantalla de bienvenida.
            </p>
            <button
              type="button"
              (click)="goToBienvenida()"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#00B39F] hover:bg-[#009988] text-white font-bold text-base shadow-xl hover:shadow-[#00B39F]/30 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <span>Ir al Registro</span>
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        } @else {
          <!-- Barra Superior de Contexto del Estudiante -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white/90 backdrop-blur-md px-6 py-3.5 rounded-3xl border border-white/60 shadow-lg text-xs font-bold text-slate-700">
            <div class="flex items-center gap-2.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#00B39F] animate-ping"></span>
              <span>Estudiante: <strong class="text-[#0B2B29] font-black">{{ student()?.fullName }}</strong></span>
            </div>
            <div class="flex items-center gap-2 text-[#008072]">
              <svg class="w-4 h-4 text-[#00B39F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Paso 3 de 5: Preparación y Estudio Biomecánico</span>
            </div>
          </div>

          <!-- TARJETA PRINCIPAL DEL VISUALIZADOR INTERACTIVO (GLASSMORPHISM) -->
          <div class="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/60 text-center relative overflow-hidden animate-fade-in">
            
            <!-- BARRAS DE PROGRESO SEGMENTADAS SUPERIORES (TIPO HISTORIAS DE INSTAGRAM) -->
            <div class="grid grid-cols-6 gap-2 sm:gap-2.5 mb-6">
              @for (step of pasosGuia; track step.id; let idx = $index) {
                <button
                  type="button"
                  (click)="selectPaso(idx)"
                  class="h-2 rounded-full overflow-hidden bg-slate-200/90 cursor-pointer group focus:outline-none transition-all"
                  [attr.aria-label]="'Ver Paso ' + step.id + ': ' + step.title"
                >
                  <div
                    class="h-full rounded-full transition-all duration-100"
                    [ngClass]="{
                      'bg-[#00B39F]': idx < pasoAnimadoActual(),
                      'bg-gradient-to-r from-[#00B39F] to-[#008072]': idx === pasoAnimadoActual(),
                      'bg-transparent': idx > pasoAnimadoActual()
                    }"
                    [style.width.%]="idx < pasoAnimadoActual() ? 100 : idx === pasoAnimadoActual() ? autoplayProgress() : 0"
                  ></div>
                </button>
              }
            </div>

            <!-- ENCABEZADO DINÁMICO DEL PASO -->
            <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00B39F]/15 border border-[#00B39F]/30 text-[#008072] text-xs font-black shadow-xs">
                <span class="w-2 h-2 rounded-full bg-[#00B39F] animate-pulse"></span>
                <span>Paso {{ currentStep().id }} de 6: {{ currentStep().title }}</span>
              </div>

              <!-- Control de Autoplay (5s por paso) -->
              <button
                type="button"
                (click)="toggleAutoplay()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer"
                [ngClass]="isAutoplay()
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'"
              >
                @if (isAutoplay()) {
                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <span>Pausar (5s)</span>
                } @else {
                  <svg class="w-3.5 h-3.5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                  </svg>
                  <span>Reproducir automático</span>
                }
              </button>
            </div>

            <!-- Título Elegante en Tipografía Fraunces -->
            <h1 class="font-heading text-2xl sm:text-3xl md:text-4xl text-[#0B2B29] font-black tracking-tight leading-tight mb-2">
              {{ currentStep().actionName }}
            </h1>

            <!-- Explicación Clínica Corta en 1 o 2 Líneas -->
            <p class="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto mb-6">
              {{ currentStep().shortDescription }}
            </p>

            <!-- ZONA PRINCIPAL DE ANIMACIÓN / DEMOSTRACIÓN -->
            <div class="relative w-full aspect-[16/9] sm:aspect-[16/9] max-w-2xl mx-auto rounded-3xl bg-gradient-to-br from-[#CFFBF0]/50 via-white to-[#FFE9DE]/50 border-2 border-[#00B39F]/25 p-4 sm:p-6 flex items-center justify-center overflow-hidden shadow-inner group mb-6">
              
              @if (!videoError() && currentStep().videoUrl) {
                <video
                  #stepVideo
                  [src]="currentStep().videoUrl"
                  autoplay
                  loop
                  muted
                  playsinline
                  class="w-full h-full object-contain rounded-2xl hidden"
                  (error)="onVideoError()"
                ></video>
              }

              <!-- ANIMACIÓN VECTORIAL / SVG INTERACTIVA SEGÚN EL PASO -->
              <div class="relative w-full h-full flex flex-col items-center justify-center">
                @switch (currentStep().iconType) {
                  @case ('palms') {
                    <div class="relative flex items-center justify-center animate-pulse-subtle">
                      <svg class="w-36 h-36 sm:w-44 sm:h-44 text-[#00B39F]" viewBox="0 0 120 120" fill="none">
                        <circle cx="60" cy="60" r="50" fill="#CFFBF0" fill-opacity="0.4" stroke="#00B39F" stroke-dasharray="6 6" stroke-width="2" />
                        <path d="M42 75C37 68 37 54 41 45C42 43 45 43 46 45C47 48 48 53 49 55" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                        <path d="M48 45C49 39 52 38 54 40C55 42 56 48 56 52" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                        <path d="M55 44C57 39 60 39 61 42C62 45 62 50 62 55" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                        <path d="M62 49C64 45 67 46 68 49C69 52 68 59 66 68C64 77 56 86 48 86C42 86 38 81 40 76" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                        <path d="M74 30C86 36 94 48 94 60C94 76 80 90 62 90" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M78 24L73 30L80 36" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="78" cy="60" r="7" fill="#CFFBF0" stroke="#00B39F" stroke-width="2"/>
                        <circle cx="88" cy="76" r="5" fill="#FFE9DE" stroke="#FF6A4D" stroke-width="2"/>
                        <circle cx="32" cy="38" r="4" fill="#00B39F"/>
                      </svg>
                    </div>
                  }
                  @case ('dorsal') {
                    <div class="relative flex items-center justify-center animate-pulse-subtle">
                      <svg class="w-36 h-36 sm:w-44 sm:h-44 text-[#00B39F]" viewBox="0 0 120 120" fill="none">
                        <rect x="28" y="46" width="48" height="38" rx="10" transform="rotate(-15 28 46)" fill="#CFFBF0" fill-opacity="0.4" stroke="#0B2B29" stroke-width="3"/>
                        <rect x="42" y="32" width="48" height="38" rx="10" transform="rotate(25 42 32)" fill="#FFE9DE" fill-opacity="0.5" stroke="#00B39F" stroke-width="3.5"/>
                        <path d="M46 36L44 18M54 38L55 16M64 42L68 18M73 48L80 24" stroke="#00B39F" stroke-width="3" stroke-linecap="round"/>
                        <path d="M26 30L32 20M32 20L40 26M32 20L18 38" stroke="#FF6A4D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M94 86L88 94M88 94L80 88M88 94L102 76" stroke="#FF6A4D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  }
                  @case ('interdigital') {
                    <div class="relative flex items-center justify-center animate-pulse-subtle">
                      <svg class="w-36 h-36 sm:w-44 sm:h-44 text-[#00B39F]" viewBox="0 0 120 120" fill="none">
                        <path d="M38 85V38C38 34 43 34 43 38V75" stroke="#0B2B29" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M47 75V33C47 29 52 29 52 33V75" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M56 75V36C56 32 61 32 61 36V75" stroke="#0B2B29" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M65 75V31C65 27 70 27 70 31V75" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M74 75V40C74 36 79 36 79 40V85" stroke="#0B2B29" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M52 20L52 12M52 12L48 16M52 12L56 16" stroke="#FF6A4D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M65 12L65 20M65 20L61 16M65 20L69 16" stroke="#FF6A4D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="60" cy="55" r="4" fill="#FF6A4D"/>
                        <circle cx="43" cy="58" r="3" fill="#00B39F"/>
                        <circle cx="70" cy="58" r="3" fill="#00B39F"/>
                      </svg>
                    </div>
                  }
                  @case ('fingers-locked') {
                    <div class="relative flex items-center justify-center animate-pulse-subtle">
                      <svg class="w-36 h-36 sm:w-44 sm:h-44 text-[#00B39F]" viewBox="0 0 120 120" fill="none">
                        <path d="M38 48C38 40 48 40 52 48C56 56 64 56 68 48C72 40 82 40 82 48V68C82 76 72 76 68 68C64 60 56 60 52 68C48 76 38 76 38 68V48Z" fill="#CFFBF0" fill-opacity="0.4" stroke="#0B2B29" stroke-width="3"/>
                        <path d="M45 42H75" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M45 74H75" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M26 58H14M14 58L20 52M14 58L20 64" stroke="#FF6A4D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M94 58H106M106 58L100 52M106 58L100 64" stroke="#FF6A4D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  }
                  @case ('thumbs') {
                    <div class="relative flex items-center justify-center animate-pulse-subtle">
                      <svg class="w-36 h-36 sm:w-44 sm:h-44 text-[#00B39F]" viewBox="0 0 120 120" fill="none">
                        <rect x="52" y="30" width="16" height="56" rx="8" fill="#FFE9DE" stroke="#0B2B29" stroke-width="3"/>
                        <path d="M36 50C36 42 46 42 54 44" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M36 62C36 54 46 54 54 56" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M36 74C36 66 46 66 54 68" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M80 44C88 52 88 64 80 72C74 78 64 82 50 80" stroke="#FF6A4D" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M84 38L80 44L86 48" stroke="#FF6A4D" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  }
                  @case ('nails') {
                    <div class="relative flex items-center justify-center animate-pulse-subtle">
                      <svg class="w-36 h-36 sm:w-44 sm:h-44 text-[#00B39F]" viewBox="0 0 120 120" fill="none">
                        <ellipse cx="60" cy="74" rx="38" ry="18" fill="#CFFBF0" fill-opacity="0.4" stroke="#0B2B29" stroke-width="3"/>
                        <path d="M52 28L56 60M60 24L60 62M68 28L64 60M46 34L54 58M74 34L66 58" stroke="#00B39F" stroke-width="3" stroke-linecap="round"/>
                        <circle cx="60" cy="72" r="10" stroke="#FF6A4D" stroke-width="2.5" stroke-dasharray="4 4" />
                        <path d="M70 66L74 72L68 74" stroke="#FF6A4D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  }
                }
              </div>

              <!-- Puntos Clave Flotantes sobre la Animación -->
              <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-slate-700 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/60 shadow-sm">
                <div class="flex items-center gap-1.5 truncate">
                  <span class="w-2 h-2 rounded-full bg-[#00B39F]"></span>
                  <span class="text-slate-500">Foco:</span>
                  <span class="text-[#008072] font-black truncate">{{ currentStep().anatomicalFocus }}</span>
                </div>
                <div class="hidden sm:flex items-center gap-1.5 text-[#FF6A4D]">
                  <span>💡 {{ currentStep().biomechanicalTip }}</span>
                </div>
              </div>
            </div>

            <!-- CONTROLES DE NAVEGACIÓN Y PROGRESO MANUAL -->
            <div class="flex items-center justify-between gap-3 max-w-xl mx-auto mb-8">
              <button
                type="button"
                (click)="prevPaso()"
                class="px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Anterior</span>
              </button>

              <!-- Indicadores de punto -->
              <div class="flex items-center gap-1.5">
                @for (step of pasosGuia; track step.id; let idx = $index) {
                  <button
                    type="button"
                    (click)="selectPaso(idx)"
                    class="h-2.5 rounded-full transition-all cursor-pointer"
                    [ngClass]="idx === pasoAnimadoActual() ? 'w-6 bg-[#00B39F]' : 'w-2.5 bg-slate-300 hover:bg-slate-400'"
                    [attr.aria-label]="'Ir a paso ' + step.id"
                  ></button>
                }
              </div>

              <button
                type="button"
                (click)="nextPaso()"
                class="px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Siguiente</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- BOTONES DE ACCIÓN PRINCIPAL (TURQUESA CON HOVER CORAL) -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                (click)="startPractice()"
                class="w-full sm:w-auto py-4 px-10 rounded-full font-black text-base sm:text-lg text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer bg-[#00B39F] hover:bg-[#FF6A4D] hover:shadow-[#FF6A4D]/35 hover:scale-105 active:scale-95 group"
              >
                <span>Iniciar Práctica con Cámara</span>
                <svg class="w-5 h-5 transition-transform group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <button
                type="button"
                (click)="goBack()"
                class="w-full sm:w-auto px-6 py-3.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition-all"
              >
                Volver al Diagnóstico
              </button>
            </div>

          </div>
        }
      </div>
    </div>
  `,
})
export class InicioComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly stateService = inject(HandwashStateService);

  readonly student = this.stateService.student;
  readonly pasosGuia = PASOS_GUIA_OMS;

  // Signal del índice del paso animado actual (0 a 5)
  readonly pasoAnimadoActual = signal(0);

  // Signal de reproducción automática (5s por paso)
  readonly isAutoplay = signal(true);

  // Progreso visual de 0% a 100% para la barra segmentada del paso actual
  readonly autoplayProgress = signal(0);

  // Estado si el video tiene error o no está cargado aún
  readonly videoError = signal(false);

  // Paso actual computado
  readonly currentStep = computed(() => this.pasosGuia[this.pasoAnimadoActual()]);

  readonly isLastStep = computed(
    () => this.pasoAnimadoActual() === this.pasosGuia.length - 1
  );

  private autoplayTimer: any = null;
  private readonly stepDurationMs = 5000;
  private readonly tickIntervalMs = 50;
  private elapsedInCurrentStep = 0;

  ngOnInit(): void {
    if (!this.student()) {
      this.router.navigate(['/bienvenida']);
      return;
    }
    this.startAutoplayLoop();
  }

  ngOnDestroy(): void {
    this.clearAutoplayTimer();
  }

  selectPaso(index: number): void {
    if (index >= 0 && index < this.pasosGuia.length) {
      this.pasoAnimadoActual.set(index);
      this.videoError.set(false);
      this.resetProgress();
    }
  }

  nextPaso(): void {
    const nextIdx = (this.pasoAnimadoActual() + 1) % this.pasosGuia.length;
    this.selectPaso(nextIdx);
  }

  prevPaso(): void {
    const prevIdx =
      (this.pasoAnimadoActual() - 1 + this.pasosGuia.length) % this.pasosGuia.length;
    this.selectPaso(prevIdx);
  }

  toggleAutoplay(): void {
    const newState = !this.isAutoplay();
    this.isAutoplay.set(newState);
    if (newState) {
      this.startAutoplayLoop();
    } else {
      this.clearAutoplayTimer();
    }
  }

  onVideoError(): void {
    this.videoError.set(true);
  }

  startPractice(): void {
    this.clearAutoplayTimer();
    this.stateService.resetPractice();
    this.router.navigate(['/practica']);
  }

  goBack(): void {
    this.clearAutoplayTimer();
    this.router.navigate(['/diagnostico']);
  }

  goToBienvenida(): void {
    this.clearAutoplayTimer();
    this.router.navigate(['/bienvenida']);
  }

  private startAutoplayLoop(): void {
    this.clearAutoplayTimer();
    this.autoplayTimer = setInterval(() => {
      if (!this.isAutoplay()) return;

      this.elapsedInCurrentStep += this.tickIntervalMs;
      const progress = Math.min(
        100,
        (this.elapsedInCurrentStep / this.stepDurationMs) * 100
      );
      this.autoplayProgress.set(progress);

      if (this.elapsedInCurrentStep >= this.stepDurationMs) {
        this.nextPaso();
      }
    }, this.tickIntervalMs);
  }

  private resetProgress(): void {
    this.elapsedInCurrentStep = 0;
    this.autoplayProgress.set(0);
  }

  private clearAutoplayTimer(): void {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
}
