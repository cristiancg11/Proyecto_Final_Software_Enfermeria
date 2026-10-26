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
  targetArea: string;
  recommendedPressure: string;
  movementPattern: string;
  imagePath: string;
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
    targetArea: 'Superficie palmar bilateral completa',
    recommendedPressure: 'Firme y homogénea',
    movementPattern: 'Fricción circular continua de 360°',
    imagePath: 'assets/images/pasos/paso-1.svg',
    videoUrl: 'assets/videos/paso1_palmas.mp4',
    iconType: 'palms',
    biomechanicalTip: 'Realiza movimientos circulares amplios abarcando desde la base de la muñeca hasta los dedos.',
  },
  {
    id: 2,
    stepNumber: 2,
    title: 'Dorso de las Manos',
    actionName: 'Palma derecha sobre dorso izquierdo con dedos entrelazados',
    shortDescription:
      'Frotar la palma derecha sobre el dorso de la mano izquierda entrelazando los dedos, y viceversa, cubriendo toda el área cutánea posterior.',
    clinicalKey: 'Cobertura del dorso de la mano, área frecuentemente olvidada en lavados apresurados.',
    anatomicalFocus: 'Superficie cutánea dorsal y articulaciones metacarpianas.',
    targetArea: 'Dorso cutáneo y articulaciones metacarpofalángicas',
    recommendedPressure: 'Firme y longitudinal (nudillos a muñeca)',
    movementPattern: 'Deslizamiento longitudinal de vaivén',
    imagePath: 'assets/images/pasos/paso-2.svg',
    videoUrl: 'assets/videos/paso2_dorso.mp4',
    iconType: 'dorsal',
    biomechanicalTip: 'Desliza con presión firme desde los nudillos hasta la muñeca en ambas direcciones.',
  },
  {
    id: 3,
    stepNumber: 3,
    title: 'Espacios Interdigitales',
    actionName: 'Palmas unidas con dedos fuertemente entrelazados',
    shortDescription:
      'Frotar las palmas de las manos entre sí con los dedos entrelazados, friccionando profundamente los pliegues y surcos laterales.',
    clinicalKey: 'Remoción de colonias bacterianas alojadas entre los pliegues de los dedos.',
    anatomicalFocus: 'Pliegues interdigitales y caras laterales de los dedos.',
    targetArea: 'Pliegues y hendiduras interdigitales',
    recommendedPressure: 'Profunda en la base articular de los dedos',
    movementPattern: 'Fricción en peine recíproca',
    imagePath: 'assets/images/pasos/paso-3.svg',
    videoUrl: 'assets/videos/paso3_interdigital.mp4',
    iconType: 'interdigital',
    biomechanicalTip: 'Asegura fricción recíproca profunda desde la base articular hasta las puntas de los dedos.',
  },
  {
    id: 4,
    stepNumber: 4,
    title: 'Dorso de los Dedos',
    actionName: 'Dedos trabados en gancho contra la palma opuesta',
    shortDescription:
      'Frotar el dorso de los dedos flexionados contra la palma de la mano opuesta, manteniendo los dedos trabados en gancho o candado firme.',
    clinicalKey: 'Desinfección de articulaciones interfalángicas proximales y nudillos prominentes.',
    anatomicalFocus: 'Nudillos, articulaciones interfalángicas y lechos dorsales.',
    targetArea: 'Nudillos y falanges dorsales en gancho',
    recommendedPressure: 'Traba firme con contra-presión palmar',
    movementPattern: 'Desplazamiento horizontal de vaivén',
    imagePath: 'assets/images/pasos/paso-4.svg',
    videoUrl: 'assets/videos/paso4_dedos_trabados.mp4',
    iconType: 'fingers-locked',
    biomechanicalTip: 'Aplica movimiento lateral de vaivén para limpiar las rugosidades articulares.',
  },
  {
    id: 5,
    stepNumber: 5,
    title: 'Limpieza de Pulgares',
    actionName: 'Fricción circular del pulgar atrapado por la palma opuesta',
    shortDescription:
      'Rodea el pulgar izquierdo con la palma de la mano derecha en un puño cerrado y frota con rotación completa de 360°; luego repite con el pulgar derecho.',
    clinicalKey: 'El pulgar es el dedo con mayor interacción y contacto con instrumental y pacientes.',
    anatomicalFocus: 'Primer dedo (pulgar), pliegue aductor y eminencia tenar.',
    targetArea: 'Primer dedo (pulgar) bilateral y eminencia tenar',
    recommendedPressure: 'Envolvente circular de 360°',
    movementPattern: 'Rotación axial con puño cerrado',
    imagePath: 'assets/images/pasos/paso-5.svg',
    videoUrl: 'assets/videos/paso5_pulgares.mp4',
    iconType: 'thumbs',
    biomechanicalTip: 'Abarca toda la circunferencia del dedo con rotación de 360 grados.',
  },
  {
    id: 6,
    stepNumber: 6,
    title: 'Yemas y Uñas',
    actionName: 'Yemas y uñas agrupadas rotando contra el centro de la palma',
    shortDescription:
      'Frotar las yemas y uñas de los dedos agrupados en punta contra la palma contraria, efectuando rotaciones en espiral concéntrica.',
    clinicalKey: 'La zona subungueal es el reservorio de mayor densidad de microorganismos patógenos.',
    anatomicalFocus: 'Bordes libres ungueales, lecho subungueal y pulpejos táctiles.',
    targetArea: 'Lechos subungueales, pulpejos y cuenco palmar',
    recommendedPressure: 'Cónica y concentrada sobre la palma',
    movementPattern: 'Rotación en espiral concéntrica',
    imagePath: 'assets/images/pasos/paso-6.svg',
    videoUrl: 'assets/videos/paso6_unas.mp4',
    iconType: 'nails',
    biomechanicalTip: 'Presiona con firmeza en círculos concéntricos para forzar la penetración del antiséptico.',
  },
];

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    @keyframes rubPalmsLeft {
      0%, 100% { transform: translate(-3px, -3px) rotate(-3deg); }
      50% { transform: translate(3px, 3px) rotate(3deg); }
    }
    @keyframes rubPalmsRight {
      0%, 100% { transform: translate(3px, 3px) rotate(3deg); }
      50% { transform: translate(-3px, -3px) rotate(-3deg); }
    }
    @keyframes rubDorsalTop {
      0%, 100% { transform: translateY(-9px) rotate(14deg); }
      50% { transform: translateY(9px) rotate(16deg); }
    }
    @keyframes rubInterdigitalLeft {
      0%, 100% { transform: translateY(-4px); }
      50% { transform: translateY(4px); }
    }
    @keyframes rubInterdigitalRight {
      0%, 100% { transform: translateY(4px); }
      50% { transform: translateY(-4px); }
    }
    @keyframes rubHookLock {
      0%, 100% { transform: translateX(-6px); }
      50% { transform: translateX(6px); }
    }
    @keyframes rubThumbFist {
      0%, 100% { transform: rotate(-7deg) scale(0.98); }
      50% { transform: rotate(7deg) scale(1.02); }
    }
    @keyframes rubNailsCluster {
      0% { transform: rotate(0deg) translate(0px, 0px); }
      25% { transform: rotate(12deg) translate(3px, -2px); }
      50% { transform: rotate(0deg) translate(0px, 3px); }
      75% { transform: rotate(-12deg) translate(-3px, -2px); }
      100% { transform: rotate(0deg) translate(0px, 0px); }
    }
    @keyframes arrowPulse {
      0%, 100% { opacity: 0.8; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.08); }
    }
    .anim-rub-palms-left {
      animation: rubPalmsLeft 1.8s ease-in-out infinite;
      transform-origin: 110px 140px;
    }
    .anim-rub-palms-right {
      animation: rubPalmsRight 1.8s ease-in-out infinite;
      transform-origin: 190px 140px;
    }
    .anim-rub-dorsal-top {
      animation: rubDorsalTop 1.6s ease-in-out infinite;
      transform-origin: 160px 140px;
    }
    .anim-rub-interdigital-left {
      animation: rubInterdigitalLeft 1.4s ease-in-out infinite;
    }
    .anim-rub-interdigital-right {
      animation: rubInterdigitalRight 1.4s ease-in-out infinite;
    }
    .anim-rub-hook-lock {
      animation: rubHookLock 1.5s ease-in-out infinite;
    }
    .anim-rub-thumb-fist {
      animation: rubThumbFist 1.8s ease-in-out infinite;
      transform-origin: 215px 135px;
    }
    .anim-rub-nails-cluster {
      animation: rubNailsCluster 2s linear infinite;
      transform-origin: 160px 150px;
    }
    .anim-arrow-pulse {
      animation: arrowPulse 1.4s ease-in-out infinite;
      transform-origin: center;
    }
  `],
  template: `
    <!-- Contenedor Maestro con Degradado Aséptico Menta a Durazno -->
    <div class="min-h-screen py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#CFFBF0] via-[#E8FCF7] to-[#FFE9DE] text-[#0B2B29] relative overflow-hidden">
      <!-- Efectos y Resplandores Ambientales -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00B39F]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#FF6A4D]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/25 blur-3xl pointer-events-none"></div>

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
              <span>Paso 3 de 5: Guía Biomecánica Oficial OMS</span>
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

            <!-- ZONA PRINCIPAL DE ANIMACIÓN / DEMOSTRACIÓN ANATÓMICA DE MANOS -->
            <div class="relative w-full min-h-[300px] sm:min-h-[360px] max-w-2xl mx-auto rounded-3xl bg-gradient-to-br from-[#CFFBF0]/60 via-white to-[#FFE9DE]/60 border-2 border-[#00B39F]/30 p-4 sm:p-6 flex flex-col items-center justify-center overflow-hidden shadow-inner group mb-6">
              
              <!-- VISOR ANATÓMICO SVG INTERACTIVO CON MICRO-ANIMACIONES DE MANOS -->
              <div class="relative w-full h-64 sm:h-72 flex items-center justify-center">
                @switch (currentStep().iconType) {
                  @case ('palms') {
                    <!-- PASO 1: FROTADO DE PALMAS FRENTE A FRENTE -->
                    <svg class="w-full h-full max-h-64 sm:max-h-72" viewBox="0 0 320 260" fill="none">
                      <!-- Resplandor Aséptico y Órbita Circular -->
                      <circle cx="160" cy="130" r="90" stroke="#00B39F" stroke-width="2" stroke-dasharray="6 6" stroke-opacity="0.45"/>
                      <circle cx="160" cy="130" r="110" stroke="#FF6A4D" stroke-width="1.5" stroke-dasharray="4 8" stroke-opacity="0.35"/>
                      
                      <!-- Mano Izquierda Palmar (Micro-animación en Órbita) -->
                      <g class="anim-rub-palms-left">
                        <path d="M105 210 C100 175, 102 145, 108 120 C110 105, 116 90, 120 62 C122 52, 132 52, 134 62 L138 100 C140 85, 148 80, 152 90 L154 112 C156 102, 162 100, 166 110 L168 128 C172 122, 178 124, 178 134 C178 158, 168 185, 148 210 Z" 
                              fill="#FDBA74" stroke="#0B2B29" stroke-width="3" stroke-linejoin="round"/>
                        <!-- Pulgar en abducción suave -->
                        <path d="M170 140 C182 135, 194 138, 198 146 C202 155, 192 165, 180 168 L165 170" stroke="#0B2B29" stroke-width="2.5" fill="#FED7AA"/>
                        <!-- Pliegues palmares de flexión -->
                        <path d="M118 138 C130 144, 145 142, 156 135" stroke="#C2410C" stroke-width="2" stroke-linecap="round"/>
                      </g>

                      <!-- Mano Derecha Palmar (Micro-animación en Contra-Órbita) -->
                      <g class="anim-rub-palms-right">
                        <path d="M215 210 C215 185, 218 160, 212 135 C208 120, 202 108, 196 82 C192 70, 182 72, 180 84 L176 110 C172 95, 164 96, 162 110 L158 125 C152 120, 146 125, 146 136 C146 160, 158 185, 178 210 Z" 
                              fill="#FBBF24" fill-opacity="0.88" stroke="#008072" stroke-width="3" stroke-linejoin="round"/>
                        <!-- Pulgar derecho -->
                        <path d="M150 155 C138 150, 126 154, 122 162 C118 172, 130 180, 145 182 L158 180" stroke="#008072" stroke-width="2.5" fill="#FDE68A"/>
                        <path d="M194 142 C182 147, 170 144, 162 138" stroke="#B45309" stroke-width="2" stroke-linecap="round"/>
                      </g>

                      <!-- Flechas Circulares de Fricción Rotacional -->
                      <g class="anim-arrow-pulse">
                        <path d="M125 70 C150 52, 188 54, 212 72" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                        <polygon points="216,76 214,64 202,70" fill="#00B39F"/>
                        
                        <path d="M195 190 C170 208, 132 206, 108 188" stroke="#FF6A4D" stroke-width="3.5" stroke-linecap="round"/>
                        <polygon points="104,182 106,196 118,190" fill="#FF6A4D"/>
                      </g>
                    </svg>
                  }

                  @case ('dorsal') {
                    <!-- PASO 2: PALMA DERECHA SOBRE DORSO IZQUIERDO -->
                    <svg class="w-full h-full max-h-64 sm:max-h-72" viewBox="0 0 320 260" fill="none">
                      <!-- Mano Inferior (Vista Dorsal con Nudillos y Tendones) -->
                      <g class="hand-dorsum">
                        <path d="M125 215 C122 185, 124 158, 128 130 L124 72 C124 60, 135 60, 135 72 L138 120 L144 58 C144 46, 155 46, 155 58 L156 115 L162 62 C162 50, 173 50, 173 62 L171 120 L179 78 C179 68, 189 68, 189 80 L183 135 C186 160, 184 188, 176 215 Z" 
                              fill="#FED7AA" stroke="#0B2B29" stroke-width="3.2" stroke-linejoin="round"/>
                        <!-- Tendones extensores visibles en el dorso -->
                        <path d="M130 130 C132 142, 136 165, 140 185" stroke="#EA580C" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>
                        <path d="M145 125 C147 140, 149 165, 151 185" stroke="#EA580C" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>
                        <path d="M160 125 C160 140, 158 165, 156 185" stroke="#EA580C" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>
                      </g>

                      <!-- Mano Superior (Palma Deslizante con Dedos Entrelazados) -->
                      <g class="anim-rub-dorsal-top">
                        <path d="M106 175 C100 145, 110 122, 124 105 C132 94, 146 86, 164 82 C188 82, 208 92, 222 116 C230 130, 226 152, 218 175 Z" 
                              fill="#FBBF24" fill-opacity="0.88" stroke="#008072" stroke-width="3.2" stroke-linejoin="round"/>
                        <!-- Dedos cruzados entre espacios -->
                        <path d="M136 94 C134 68, 138 48, 140 35 C142 26, 152 27, 152 36 L148 90" stroke="#008072" stroke-width="2.8" stroke-linecap="round" fill="#FDE68A"/>
                        <path d="M156 86 C156 62, 160 40, 164 28 C166 18, 176 20, 176 30 L172 85" stroke="#008072" stroke-width="2.8" stroke-linecap="round" fill="#FDE68A"/>
                        <path d="M178 90 C180 70, 186 50, 190 40 C192 32, 202 33, 202 43 L194 92" stroke="#008072" stroke-width="2.8" stroke-linecap="round" fill="#FDE68A"/>
                      </g>

                      <!-- Flechas Longitudinales Bidireccionales -->
                      <g class="anim-arrow-pulse">
                        <path d="M78 150 L78 95" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                        <polygon points="78,86 73,98 83,98" fill="#00B39F"/>
                        
                        <path d="M242 95 L242 150" stroke="#FF6A4D" stroke-width="3.5" stroke-linecap="round"/>
                        <polygon points="242,158 237,146 247,146" fill="#FF6A4D"/>
                      </g>
                    </svg>
                  }

                  @case ('interdigital') {
                    <!-- PASO 3: PALMAS UNIDAS CON DEDOS ENTRELAZADOS -->
                    <svg class="w-full h-full max-h-64 sm:max-h-72" viewBox="0 0 320 260" fill="none">
                      <!-- Base Palmar Izquierda -->
                      <g class="anim-rub-interdigital-left">
                        <path d="M80 215 C85 178, 90 145, 100 122 C110 98, 120 95, 120 110 L120 152 C115 175, 105 198, 100 215 Z" 
                              fill="#FED7AA" stroke="#0B2B29" stroke-width="3" stroke-linejoin="round"/>
                        <!-- Dedos Mano Izquierda -->
                        <path d="M110 128 L110 65 C110 54, 121 54, 121 65 L121 128" fill="#FED7AA" stroke="#0B2B29" stroke-width="2.8" stroke-linecap="round"/>
                        <path d="M144 128 L144 40 C144 28, 155 28, 155 40 L155 128" fill="#FED7AA" stroke="#0B2B29" stroke-width="2.8" stroke-linecap="round"/>
                        <path d="M178 128 L178 50 C178 38, 189 38, 189 50 L189 128" fill="#FED7AA" stroke="#0B2B29" stroke-width="2.8" stroke-linecap="round"/>
                      </g>

                      <!-- Base Palmar Derecha Entrelazada -->
                      <g class="anim-rub-interdigital-right">
                        <path d="M240 215 C235 178, 230 145, 220 122 C210 98, 200 95, 200 110 L200 152 C205 175, 215 198, 220 215 Z" 
                              fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linejoin="round"/>
                        <!-- Dedos Mano Derecha -->
                        <path d="M127 128 L127 52 C127 40, 138 40, 138 52 L138 128" fill="#FBBF24" stroke="#008072" stroke-width="2.8" stroke-linecap="round"/>
                        <path d="M161 128 L161 38 C161 26, 172 26, 172 38 L172 128" fill="#FBBF24" stroke="#008072" stroke-width="2.8" stroke-linecap="round"/>
                        <path d="M195 128 L195 62 C195 50, 206 50, 206 62 L206 128" fill="#FBBF24" stroke="#008072" stroke-width="2.8" stroke-linecap="round"/>
                      </g>

                      <!-- Puntos Clave de Pliegues Interdigitales -->
                      <circle cx="124" cy="90" r="5" fill="#00B39F" fill-opacity="0.8"/>
                      <circle cx="141" cy="80" r="5" fill="#FF6A4D" fill-opacity="0.8"/>
                      <circle cx="158" cy="76" r="5" fill="#00B39F" fill-opacity="0.8"/>
                      <circle cx="175" cy="80" r="5" fill="#FF6A4D" fill-opacity="0.8"/>
                      <circle cx="192" cy="90" r="5" fill="#00B39F" fill-opacity="0.8"/>

                      <!-- Flechas Opuestas Verticales -->
                      <g class="anim-arrow-pulse">
                        <path d="M133 32 L133 16" stroke="#FF6A4D" stroke-width="3" stroke-linecap="round"/>
                        <polygon points="133,9 129,20 137,20" fill="#FF6A4D"/>
                        <path d="M183 16 L183 32" stroke="#00B39F" stroke-width="3" stroke-linecap="round"/>
                        <polygon points="183,39 179,28 187,28" fill="#00B39F"/>
                      </g>
                    </svg>
                  }

                  @case ('fingers-locked') {
                    <!-- PASO 4: DEDOS TRABADOS EN GANCHO (CANDADO) -->
                    <svg class="w-full h-full max-h-64 sm:max-h-72" viewBox="0 0 320 260" fill="none">
                      <!-- Grupo Candado con Micro-animación de Vaivén Lateral -->
                      <g class="anim-rub-hook-lock">
                        <!-- Muñeca y Brazo Izquierdo -->
                        <path d="M50 105 C75 105, 98 110, 112 115 L112 165 C98 170, 75 175, 50 175 Z" 
                              fill="#FED7AA" stroke="#0B2B29" stroke-width="3" stroke-linejoin="round"/>
                        <!-- Muñeca y Brazo Derecho -->
                        <path d="M270 105 C245 105, 222 110, 208 115 L208 165 C222 170, 245 175, 270 175 Z" 
                              fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linejoin="round"/>

                        <!-- Gancho Falanges Izquierdas -->
                        <path d="M112 98 C135 94, 162 94, 172 104 C180 112, 176 126, 162 126 L125 126" fill="#FED7AA" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                        <path d="M112 118 C135 114, 166 114, 176 124 C184 132, 180 144, 166 144 L125 144" fill="#FED7AA" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                        <path d="M112 138 C135 134, 166 134, 176 142 C184 150, 180 162, 166 162 L125 162" fill="#FED7AA" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                        <path d="M112 158 C130 156, 156 156, 166 164 C174 172, 170 182, 158 182 L125 182" fill="#FED7AA" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>

                        <!-- Gancho Falanges Derechas Interbloqueadas -->
                        <path d="M208 104 C185 100, 158 100, 148 108 C140 116, 144 128, 158 128 L195 128" fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linecap="round"/>
                        <path d="M208 124 C185 120, 154 120, 144 128 C136 136, 140 148, 154 148 L195 148" fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linecap="round"/>
                        <path d="M208 144 C185 140, 154 140, 144 148 C136 156, 140 168, 154 168 L195 168" fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linecap="round"/>
                        <path d="M208 164 C190 162, 162 162, 152 170 C144 178, 148 186, 162 186 L195 186" fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linecap="round"/>

                        <!-- Resaltes de Nudillos Activos -->
                        <circle cx="174" cy="112" r="3.5" fill="#FFFFFF" stroke="#FF6A4D" stroke-width="1.5"/>
                        <circle cx="178" cy="132" r="3.5" fill="#FFFFFF" stroke="#FF6A4D" stroke-width="1.5"/>
                        <circle cx="178" cy="150" r="3.5" fill="#FFFFFF" stroke="#FF6A4D" stroke-width="1.5"/>
                        <circle cx="144" cy="116" r="3.5" fill="#FFFFFF" stroke="#00B39F" stroke-width="1.5"/>
                        <circle cx="140" cy="136" r="3.5" fill="#FFFFFF" stroke="#00B39F" stroke-width="1.5"/>
                        <circle cx="140" cy="154" r="3.5" fill="#FFFFFF" stroke="#00B39F" stroke-width="1.5"/>
                      </g>

                      <!-- Flechas Horizontales de Vaivén -->
                      <g class="anim-arrow-pulse">
                        <path d="M105 60 L62 60" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                        <polygon points="54,60 66,54 66,66" fill="#00B39F"/>
                        
                        <path d="M215 60 L258 60" stroke="#FF6A4D" stroke-width="3.5" stroke-linecap="round"/>
                        <polygon points="266,60 254,54 254,66" fill="#FF6A4D"/>
                      </g>
                    </svg>
                  }

                  @case ('thumbs') {
                    <!-- PASO 5: FRICCIÓN ROTACIONAL DEL PULGAR -->
                    <svg class="w-full h-full max-h-64 sm:max-h-72" viewBox="0 0 320 260" fill="none">
                      <!-- Mano Izquierda: Pulgar Erguido -->
                      <g class="hand-thumb">
                        <path d="M90 220 C95 185, 100 155, 108 132 L124 132 C118 160, 114 190, 118 220 Z" 
                              fill="#FED7AA" stroke="#0B2B29" stroke-width="3" stroke-linejoin="round"/>
                        <!-- Pulgar que asciende y es atrapado -->
                        <path d="M112 135 C118 112, 126 82, 134 56 C138 44, 150 44, 152 56 L148 112" 
                              fill="#FED7AA" stroke="#0B2B29" stroke-width="3.2" stroke-linecap="round"/>
                        <path d="M136 58 C138 52, 146 52, 148 58" stroke="#0B2B29" stroke-width="2" fill="#FFE4D6"/>
                      </g>

                      <!-- Mano Derecha: Puño Rotacional Envolvente (Micro-animación de Giro) -->
                      <g class="anim-rub-thumb-fist">
                        <path d="M230 215 C216 190, 212 168, 204 150 L222 138 C232 160, 240 185, 250 215 Z" 
                              fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linejoin="round"/>
                        <!-- Falanges cerrándose en puño cilíndrico de 360° -->
                        <path d="M206 92 C188 82, 142 82, 128 96 C122 104, 128 118, 146 118 L194 114" fill="#FBBF24" stroke="#008072" stroke-width="3.2" stroke-linecap="round"/>
                        <path d="M202 110 C184 102, 142 102, 130 114 C124 122, 130 134, 148 134 L194 130" fill="#FBBF24" stroke="#008072" stroke-width="3.2" stroke-linecap="round"/>
                        <path d="M198 128 C180 122, 146 122, 136 134 C130 142, 138 152, 154 152 L194 146" fill="#FBBF24" stroke="#008072" stroke-width="3.2" stroke-linecap="round"/>
                        <path d="M192 146 C178 142, 152 142, 142 152 C138 160, 146 168, 164 168 L192 162" fill="#FBBF24" stroke="#008072" stroke-width="3.2" stroke-linecap="round"/>
                      </g>

                      <!-- Flechas Circulares de Rotación Envolvente -->
                      <g class="anim-arrow-pulse">
                        <path d="M106 72 C118 54, 162 52, 178 70" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                        <polygon points="184,76 180,64 170,70" fill="#00B39F"/>
                        
                        <path d="M178 168 C162 186, 118 184, 102 166" stroke="#FF6A4D" stroke-width="3.5" stroke-linecap="round"/>
                        <polygon points="96,160 100,172 110,166" fill="#FF6A4D"/>
                      </g>
                    </svg>
                  }

                  @case ('nails') {
                    <!-- PASO 6: YEMAS Y UÑAS ROTANDO EN PALMA OPUESTA -->
                    <svg class="w-full h-full max-h-64 sm:max-h-72" viewBox="0 0 320 260" fill="none">
                      <!-- Palma Inferior en Cuenco Supinado -->
                      <g class="hand-palmar-cup">
                        <path d="M125 225 C125 200, 116 182, 108 165" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                        <path d="M195 225 C195 200, 204 182, 212 165" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                        <!-- Cuenco de la palma -->
                        <path d="M88 172 C84 150, 96 132, 120 132 C135 132, 145 138, 160 140 C175 138, 185 132, 200 132 C224 132, 236 150, 232 172 C228 198, 195 212, 160 212 C125 212, 92 198, 88 172 Z" 
                              fill="#FED7AA" stroke="#0B2B29" stroke-width="3.2" stroke-linejoin="round"/>
                        <!-- Círculos guía concéntricos en el centro -->
                        <circle cx="160" cy="158" r="16" stroke="#00B39F" stroke-width="1.8" stroke-dasharray="3 3"/>
                        <circle cx="160" cy="158" r="28" stroke="#FF6A4D" stroke-width="1.5" stroke-dasharray="4 4"/>
                      </g>

                      <!-- Mano Superior: Yemas y Uñas en Cono (Micro-animación en Espiral) -->
                      <g class="anim-rub-nails-cluster">
                        <path d="M144 25 L146 65" stroke="#008072" stroke-width="2.8" stroke-linecap="round"/>
                        <path d="M176 25 L174 65" stroke="#008072" stroke-width="2.8" stroke-linecap="round"/>
                        <!-- Mano en cúpula descendente -->
                        <path d="M136 60 C132 78, 142 110, 150 144 L170 144 C178 110, 188 78, 184 60 Z" 
                              fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linejoin="round"/>
                        
                        <!-- Yemas y Uñas agrupadas en punta sobre la palma -->
                        <ellipse cx="150" cy="144" rx="4.5" ry="5.5" fill="#FFFFFF" stroke="#008072" stroke-width="2"/>
                        <ellipse cx="157" cy="141" rx="4.5" ry="5.5" fill="#FFFFFF" stroke="#008072" stroke-width="2"/>
                        <ellipse cx="163" cy="146" rx="4.5" ry="5.5" fill="#FFFFFF" stroke="#008072" stroke-width="2"/>
                        <ellipse cx="169" cy="141" rx="4.5" ry="5.5" fill="#FFFFFF" stroke="#008072" stroke-width="2"/>
                        <ellipse cx="174" cy="145" rx="4" ry="5" fill="#FFFFFF" stroke="#008072" stroke-width="2"/>
                      </g>

                      <!-- Flechas Espirales de Fricción Concéntrica -->
                      <g class="anim-arrow-pulse">
                        <path d="M146 120 C162 114, 182 118, 190 132" stroke="#FF6A4D" stroke-width="3" stroke-linecap="round"/>
                        <polygon points="192,138 194,126 182,130" fill="#FF6A4D"/>
                        
                        <path d="M174 185 C156 190, 135 184, 130 172" stroke="#00B39F" stroke-width="3" stroke-linecap="round"/>
                        <polygon points="128,166 126,178 138,174" fill="#00B39F"/>
                      </g>
                    </svg>
                  }
                }
              </div>

              <!-- TARJETAS FLOTANTES DE DATOS ANATÓMICOS Y BIOMECÁNICOS DESTACADOS -->
              <div class="w-full mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-bold text-slate-700">
                <!-- Área Objetivo -->
                <div class="bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/70 shadow-xs flex items-center gap-2 text-left">
                  <div class="w-7 h-7 rounded-xl bg-[#00B39F]/15 text-[#008072] flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div class="truncate">
                    <span class="text-slate-400 block text-[9px] uppercase tracking-wider">Área objetivo</span>
                    <span class="text-[#0B2B29] font-black truncate block">{{ currentStep().targetArea }}</span>
                  </div>
                </div>

                <!-- Presión Recomendada -->
                <div class="bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/70 shadow-xs flex items-center gap-2 text-left">
                  <div class="w-7 h-7 rounded-xl bg-[#FF6A4D]/15 text-[#FF6A4D] flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div class="truncate">
                    <span class="text-slate-400 block text-[9px] uppercase tracking-wider">Presión</span>
                    <span class="text-[#FF6A4D] font-black truncate block">{{ currentStep().recommendedPressure }}</span>
                  </div>
                </div>

                <!-- Patrón Biomecánico -->
                <div class="bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/70 shadow-xs flex items-center gap-2 text-left">
                  <div class="w-7 h-7 rounded-xl bg-[#008072]/15 text-[#008072] flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div class="truncate">
                    <span class="text-slate-400 block text-[9px] uppercase tracking-wider">Movimiento</span>
                    <span class="text-[#008072] font-black truncate block">{{ currentStep().movementPattern }}</span>
                  </div>
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
