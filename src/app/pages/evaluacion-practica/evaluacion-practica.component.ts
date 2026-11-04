import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  DrawingUtils,
  FilesetResolver,
  HandLandmarker,
} from '@mediapipe/tasks-vision';
import { HandwashStateService } from '../../core/services/handwash-state.service';
import { HandwashStep } from '../../core/models/handwash.models';

export interface QualityAlert {
  type: 'hands-missing' | 'hands-apart' | 'still';
  message: string;
}

@Component({
  selector: 'app-evaluacion-practica',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Contenedor Maestro con Fondo Aséptico y Efectos de Luz -->
    <div
      class="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-6 lg:px-8 bg-gradient-to-br from-[#08151D] via-[#0E2428] to-[#081E1C] text-slate-100 relative overflow-hidden"
      [ngClass]="{ 'p-0 sm:p-0 min-h-0 h-[100dvh] overflow-hidden': isFullScreen() }"
    >
      <!-- Glows y Efectos Ambientales (ocultos en pantalla completa inmersiva) -->
      @if (!isFullScreen()) {
        <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00B39F]/15 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#50E7FF]/15 blur-3xl pointer-events-none"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
      }

      <div class="mx-auto relative z-10" [ngClass]="isFullScreen() ? 'w-full h-full' : 'max-w-5xl'">

        @if (!evaluacionFinalizada()) {

          <!-- 1. ENCABEZADO MINIMALISTA DE EVALUACIÓN PRÁCTICA (Ocultable en Fullscreen Móvil) -->
          @if (!isFullScreen()) {
            <div class="bg-gradient-to-r from-[#0d1e26] via-[#10292f] to-[#0c2420] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#00B39F]/30 shadow-2xl mb-4 sm:mb-6 relative overflow-hidden animate-fade-in">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                
                <div class="flex items-start sm:items-center gap-3">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#00B39F] to-[#50E7FF] text-[#080B10] flex items-center justify-center font-black text-lg sm:text-xl shadow-lg shrink-0">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6 text-[#080B10]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.3" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div class="flex flex-wrap items-center gap-2 mb-0.5">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-500/40">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                        <span>Examen Práctico Autónomo</span>
                      </span>

                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00B39F]/20 text-[#50E7FF] text-[11px] font-bold border border-[#00B39F]/30">
                        <span>Paso {{ currentStepIndex() + 1 }} de 6</span>
                      </span>
                    </div>

                    <h1 class="text-lg sm:text-2xl font-black text-white tracking-tight">
                      {{ currentClinicalTitle() }}
                    </h1>

                    <p class="text-xs text-[#A5C2DE] mt-0.5">
                      Estudiante: <strong class="text-white">{{ studentName() }}</strong>
                      <span class="mx-1 text-slate-500">•</span>
                      Código: <span class="font-mono text-[#50E7FF]">{{ studentCode() }}</span>
                    </p>
                  </div>
                </div>

                <!-- Botones Superiores: Repasar Práctica y Toggle Pantalla Completa -->
                <div class="flex items-center gap-2 self-start md:self-auto">
                  <button
                    type="button"
                    (click)="toggleFullScreen()"
                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-bold transition border border-white/15 cursor-pointer"
                    title="Modo pantalla completa"
                  >
                    <svg class="w-4 h-4 text-[#50E7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span class="hidden sm:inline">Pantalla Completa</span>
                  </button>

                  <a
                    routerLink="/practica"
                    (click)="stopCamera()"
                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-bold transition border border-white/15"
                    title="Volver a la práctica guiada con video"
                  >
                    <svg class="w-4 h-4 text-[#50E7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Práctica</span>
                  </a>
                </div>

              </div>
            </div>
          }

          <!-- 2. INTERFAZ LIMPIA ENFOCADA 100% EN LA CÁMARA Y DETECCIÓN (SIN STEPPER / GUÍA) -->
          <div
            class="relative overflow-hidden transition-all duration-300"
            [ngClass]="isFullScreen()
              ? 'fixed inset-0 z-50 w-full h-[100dvh] bg-slate-950 flex flex-col justify-between p-3 sm:p-5'
              : 'bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl border border-white/15 mb-6'"
          >
            
            <!-- Barra Superior del Visor: Identificación del Paso y Detección MediaPipe -->
            <div class="flex items-center justify-between gap-2 mb-3 z-30">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-[#00B39F] animate-ping"></span>
                <span class="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Paso {{ currentStepIndex() + 1 }}/6: {{ currentStep().title }}
                </span>
              </div>

              <!-- Controles Flotantes Superiores: Selector de Cámara, Fullscreen y Pausar -->
              <div class="flex items-center gap-1.5 sm:gap-2">
                <!-- SELECTOR DE CÁMARA FRONTAL / TRASERA (MÓVIL Y DESKTOP) -->
                <button
                  type="button"
                  (click)="alternarCamara()"
                  [disabled]="cameraLoading()"
                  class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-md"
                  [title]="camaraFacingMode() === 'user' ? 'Cambiar a cámara trasera' : 'Cambiar a cámara frontal'"
                >
                  <svg class="w-3.5 h-3.5 text-[#50E7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span class="text-[11px]">{{ camaraFacingMode() === 'user' ? 'Frontal' : 'Trasera' }}</span>
                </button>

                <!-- Botón Alternar Pantalla Completa -->
                <button
                  type="button"
                  (click)="toggleFullScreen()"
                  class="p-1.5 sm:p-2 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-md"
                  [title]="isFullScreen() ? 'Salir de pantalla completa' : 'Pantalla completa'"
                >
                  @if (isFullScreen()) {
                    <svg class="w-3.5 h-3.5 text-[#50E7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  } @else {
                    <svg class="w-3.5 h-3.5 text-[#50E7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  }
                </button>

                @if (cameraActive()) {
                  <button
                    type="button"
                    (click)="stopCamera()"
                    class="p-1.5 sm:p-2 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-md"
                    title="Pausar Cámara"
                  >
                    <svg class="w-3.5 h-3.5 text-[#FF6A4D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                }
              </div>
            </div>

            <!-- CONTENEDOR DE LA CÁMARA: RESPONSIVE / FULL SCREEN EN MÓVIL (h-[100dvh] o aspect amplio) -->
            <div
              class="relative w-full bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 flex items-center justify-center group mx-auto transition-all duration-300"
              [ngClass]="isFullScreen()
                ? 'grow min-h-0 h-full w-full'
                : 'min-h-[280px] sm:min-h-[380px] aspect-[4/3] sm:aspect-[16/10] max-h-[650px]'"
            >
              
              <!-- Video Stream con atributos obligatorios para celulares (iOS Safari y Android) -->
              <video
                #cameraVideo
                playsinline
                webkit-playsinline="true"
                autoplay
                muted
                [muted]="true"
                class="w-full h-full object-cover"
                [ngClass]="camaraFacingMode() === 'user' ? 'scale-x-[-1]' : ''"
              ></video>

              <!-- Canvas Superpuesto para Dibujo de MediaPipe AI -->
              <canvas
                #handOverlay
                class="absolute inset-0 w-full h-full pointer-events-none z-10 object-cover"
                [ngClass]="camaraFacingMode() === 'user' ? 'scale-x-[-1]' : ''"
              ></canvas>

              <!-- OVERLAY ANTES DE ACTIVAR LA CÁMARA (El temporizador NO inicia hasta que se active) -->
              @if (!cameraActive()) {
                <div class="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
                  <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#00B39F]/20 to-[#50E7FF]/20 text-[#50E7FF] border border-[#50E7FF]/30 flex items-center justify-center mb-4 shadow-xl">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <h3 class="font-black text-xl mb-1 text-white">Examen Práctico Autónomo</h3>
                  <p class="text-xs sm:text-sm text-slate-300 max-w-md mb-2 leading-relaxed">
                    Colócate frente a la cámara con las manos visibles. El cronómetro se activará <strong>únicamente cuando la cámara empiece a transmitir</strong>.
                  </p>
                  <p class="text-[11px] text-amber-300 font-bold mb-6">
                    ⏱️ Cronómetro en espera (0.0s) • Activa la cámara para comenzar
                  </p>

                  <button
                    type="button"
                    (click)="startCamera()"
                    [disabled]="cameraLoading()"
                    class="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#00B39F] via-[#50E7FF] to-[#D9FF43] hover:brightness-110 text-[#080B10] font-black text-sm shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    @if (cameraLoading()) {
                      <svg class="animate-spin w-4 h-4 text-[#080B10]" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Calibrando Visor MediaPipe...</span>
                    } @else {
                      <svg class="w-5 h-5 text-[#080B10]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Iniciar Cámara y Arrancar Examen</span>
                    }
                  </button>

                  @if (cameraError()) {
                    <p class="text-xs text-[#FF6A4D] font-bold mt-3 max-w-sm">{{ cameraError() }}</p>
                  }
                </div>
              }

              <!-- Badges Flotantes Dentro de la Cámara cuando está activa -->
              @if (cameraActive()) {
                <!-- Top Left: Indicador del paso actual -->
                <div class="absolute top-3 left-3 z-20">
                  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-md">
                    <span class="w-5 h-5 rounded-full bg-[#00B39F] text-white text-[11px] font-black flex items-center justify-center">
                      {{ currentStepIndex() + 1 }}
                    </span>
                    <span>{{ currentStep().title }}</span>
                  </div>
                </div>

                <!-- Top Right: Feedback de MediaPipe (Manos detectadas y frotado) -->
                <div class="absolute top-3 right-3 z-20 flex items-center gap-2">
                  <div
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md transition-all duration-300"
                    [ngClass]="handsDetected() >= 2
                      ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50'
                      : 'bg-[#FF6A4D]/25 text-[#FF6A4D] border-[#FF6A4D]/50'"
                  >
                    <span
                      class="w-2 h-2 rounded-full"
                      [ngClass]="handsDetected() >= 2 ? 'bg-emerald-400 animate-pulse' : 'bg-[#FF6A4D]'"
                    ></span>
                    <span>{{ handsDetected() }}/2 Manos</span>
                  </div>

                  @if (handsTogether() && handsRubbing()) {
                    <div class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-extrabold shadow-md backdrop-blur-md animate-pulse">
                      <span>✓ Fricción activa</span>
                    </div>
                  }
                </div>

                <!-- Alerta flotante central cuando la técnica se detiene -->
                @if (activeAlert()) {
                  <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none z-25 px-4 animate-fade-in">
                    <div
                      class="px-5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-2xl border-2 border-white/40 backdrop-blur-md flex items-center gap-2 transition-all transform scale-105"
                      [ngClass]="{
                        'bg-[#FF6A4D]/95 text-white shadow-[#FF6A4D]/40 animate-pulse': activeAlert()?.type === 'hands-missing' || activeAlert()?.type === 'still',
                        'bg-amber-500/95 text-white shadow-amber-500/40': activeAlert()?.type === 'hands-apart'
                      }"
                    >
                      <span>{{ activeAlert()?.message }}</span>
                    </div>
                  </div>
                }
              }

            </div>

            <!-- 3. CONTADOR Y BARRA DE PROGRESO DEL TIEMPO DE FRICCIÓN (ACTIVO SOLO TRAS INICIAR CÁMARA) -->
            <div class="mt-3 sm:mt-4 bg-black/50 rounded-2xl p-3 sm:p-4 border border-white/10 space-y-2.5 z-30">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                
                <div class="flex items-center gap-3">
                  <div class="font-heading text-2xl sm:text-4xl font-black tracking-tight"
                    [ngClass]="{
                      'text-slate-400': !cameraActive(),
                      'text-[#FF6A4D]': cameraActive() && currentSeconds() < 3.0,
                      'text-[#50E7FF]': cameraActive() && currentSeconds() >= 3.0 && currentSeconds() <= 8.0,
                      'text-amber-400': cameraActive() && currentSeconds() > 8.0
                    }"
                  >
                    {{ formattedTime() }}s
                  </div>
                  <div>
                    <span class="font-extrabold text-white block text-xs sm:text-sm">
                      {{ cameraActive() ? 'Tiempo de Fricción Registrado' : 'Cronómetro Listo (En Espera)' }}
                    </span>
                    <span class="text-slate-400 text-[11px]">
                      Objetivo mínimo OMS: <strong class="text-[#50E7FF]">3.0s</strong> (Rango óptimo 3 a 8s)
                    </span>
                  </div>
                </div>

                <!-- Badge de Estado de Ritmo OMS -->
                <div class="flex items-center gap-2">
                  <div
                    class="text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-xs"
                    [ngClass]="{
                      'bg-slate-800 text-slate-400 border-slate-700': !cameraActive(),
                      'bg-[#FF6A4D]/20 text-[#FF6A4D] border-[#FF6A4D]/40': cameraActive() && currentSeconds() < 3.0,
                      'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse': cameraActive() && currentSeconds() >= 3.0 && currentSeconds() <= 8.0,
                      'bg-amber-500/20 text-amber-300 border-amber-500/40': cameraActive() && currentSeconds() > 8.0
                    }"
                  >
                    @if (!cameraActive()) {
                      <span>Cámara Inactiva</span>
                    } @else if (currentSeconds() < 3.0) {
                      <span>Fricción Insuficiente (&lt;3.0s)</span>
                    } @else if (currentSeconds() <= 8.0) {
                      <span>✓ Rango Óptimo OMS (3 a 8s)</span>
                    } @else {
                      <span>Tiempo Extenso (&gt;8.0s)</span>
                    }
                  </div>

                  <span class="px-2 py-1 rounded-full bg-white/10 text-white font-mono text-xs font-bold border border-white/10">
                    {{ techniqueProgressPercent() }}%
                  </span>
                </div>

              </div>

              <!-- Barra de Progreso Lineal con Gradiente -->
              <div class="w-full h-2.5 sm:h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  [ngClass]="palmsValidated()
                    ? 'bg-gradient-to-r from-[#00B39F] via-[#50E7FF] to-[#D9FF43]'
                    : isTechniqueActive()
                    ? 'bg-gradient-to-r from-[#00B39F] to-[#50E7FF]'
                    : 'bg-[#FF6A4D]/80'"
                  [style.width.%]="techniqueProgressPercent()"
                ></div>
              </div>

              <!-- Mensaje de Feedback Textual Discreto -->
              <div class="flex items-center justify-between text-xs text-slate-300 pt-0.5">
                <p class="truncate font-medium text-[11px] sm:text-xs">
                  {{ cameraActive() ? palmsFeedback() : 'Presiona "Iniciar Cámara" para comenzar la transmisión.' }}
                </p>

                @if (cameraActive()) {
                  <button
                    type="button"
                    (click)="resetCurrentStepTimer()"
                    class="text-[11px] font-bold text-slate-400 hover:text-[#50E7FF] transition flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Reiniciar Tiempo</span>
                  </button>
                }
              </div>

            </div>

            <!-- 4. BOTÓN DE AVANCE O CONFIRMACIÓN DEL PASO -->
            <div class="mt-3 sm:mt-4 z-30">
              <button
                type="button"
                (click)="completeStep()"
                [disabled]="cameraActive() && !palmsValidated()"
                class="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-black text-sm sm:text-base text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
                [ngClass]="cameraActive() && !palmsValidated()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-white/5'
                  : 'bg-gradient-to-r from-[#00B39F] via-[#009988] to-[#008072] hover:brightness-110 shadow-teal-500/20 active:scale-[0.99]'"
              >
                <span>
                  @if (cameraActive() && !palmsValidated()) {
                    Frotando técnica autónoma... (Mínimo 3.0s requeridos)
                  } @else if (isLastStep()) {
                    Finalizar Evaluación Práctica y Guardar Calificación
                  } @else {
                    Confirmar Paso {{ currentStepIndex() + 1 }} y Avanzar al Siguiente
                  }
                </span>
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>

          <!-- Historial de Tiempos Registrados en Modo Autónomo -->
          @if (!isFullScreen() && completedRecords().length > 0) {
            <div class="bg-gradient-to-r from-[#0d1e26] via-[#10292f] to-[#0c2420] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/10 shadow-xl animate-fade-in">
              <div class="flex items-center gap-2 mb-3">
                <span class="w-2.5 h-2.5 rounded-full bg-[#50E7FF]"></span>
                <h3 class="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  Tiempos Registrados en Evaluación Autónoma
                </h3>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                @for (rec of completedRecords(); track rec.stepNumber) {
                  <div class="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
                    <div class="flex items-center justify-between text-[11px] text-slate-400 font-bold mb-1">
                      <span>Paso {{ rec.stepNumber }}</span>
                      <span
                        class="w-2 h-2 rounded-full"
                        [ngClass]="{
                          'bg-emerald-400': rec.status === 'optimal',
                          'bg-[#FF6A4D]': rec.status === 'too-fast',
                          'bg-amber-400': rec.status === 'too-slow'
                        }"
                      ></span>
                    </div>
                    <div class="font-heading text-lg font-black text-white">
                      {{ rec.seconds }}s
                    </div>
                    <div
                      class="text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-1 text-center truncate"
                      [ngClass]="{
                        'bg-emerald-500/20 text-emerald-300': rec.status === 'optimal',
                        'bg-[#FF6A4D]/20 text-[#FF6A4D]': rec.status === 'too-fast',
                        'bg-amber-500/20 text-amber-300': rec.status === 'too-slow'
                      }"
                    >
                      {{ rec.status === 'optimal' ? 'Óptimo' : rec.status === 'too-fast' ? 'Apresurado' : 'Extenso' }}
                    </div>
                  </div>
                }
              </div>
            </div>
          }

        } @else {

          <!-- 5. PANTALLA DE EVALUACIÓN PRÁCTICA COMPLETADA SATISFACTORIAMENTE -->
          <div class="bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-3xl p-6 sm:p-10 shadow-2xl border border-[#00B39F]/40 text-center animate-fade-in relative overflow-hidden">
            <!-- Glows decorativos -->
            <div class="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#00B39F]/20 blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-[#50E7FF]/20 blur-3xl pointer-events-none"></div>

            <div class="relative z-10 max-w-2xl mx-auto">
              
              <!-- Ícono de Éxito Biomecánico -->
              <div class="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#00B39F] via-[#50E7FF] to-[#D9FF43] p-1 mx-auto mb-6 shadow-2xl shadow-teal-500/30">
                <div class="w-full h-full bg-[#080B10] rounded-[22px] flex items-center justify-center text-[#50E7FF]">
                  <svg class="w-10 h-10 text-[#50E7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <!-- Badge y Título de Finalización -->
              <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider mb-3">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Fase Práctica Autónoma Acreditada</span>
              </div>

              <h2 class="font-heading text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3">
                ¡Evaluación Práctica Completada con Éxito!
              </h2>

              <p class="text-sm sm:text-base text-slate-300 mb-8 leading-relaxed">
                Has ejecutado de manera autónoma los 6 pasos oficiales de la OMS frente a la cámara web. La biomecánica de frotado y tus tiempos individuales han sido procesados y guardados en el sistema.
              </p>

              <!-- Tarjeta de Puntaje Práctico Biomecánico -->
              <div class="bg-black/50 rounded-3xl p-6 sm:p-8 border border-white/15 mb-8 shadow-xl">
                <span class="text-xs uppercase font-black tracking-widest text-[#50E7FF] block mb-2">
                  Calificación Biomecánica Obtenida
                </span>
                <div class="font-heading text-5xl sm:text-6xl font-black tracking-tight text-white mb-3">
                  {{ notaPractica().toFixed(1) }}
                  <span class="text-2xl text-slate-400 font-normal">/ 10</span>
                </div>

                <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
                  [ngClass]="notaPractica() >= 8.5 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'">
                  <span>{{ notaPractica() >= 8.5 ? '★ Técnica Biomecánica Sobresaliente' : '✓ Técnica Biomecánica Aprobada' }}</span>
                </div>

                <!-- Resumen de los 6 pasos -->
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6 pt-6 border-t border-white/10 text-left">
                  @for (rec of completedRecords(); track rec.stepNumber) {
                    <div class="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span class="text-[10px] text-slate-400 font-bold block">Paso {{ rec.stepNumber }}</span>
                      <span class="text-sm font-black text-white">{{ rec.seconds }}s</span>
                      <span class="text-[10px] font-bold block mt-0.5"
                        [ngClass]="rec.status === 'optimal' ? 'text-emerald-400' : 'text-[#FF6A4D]'">
                        {{ rec.status === 'optimal' ? 'Óptimo' : 'Ajustar' }}
                      </span>
                    </div>
                  }
                </div>
              </div>

              <!-- BOTÓN: CONTINUAR A EVALUACIÓN TEÓRICA -->
              <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  (click)="continuarAEvaluacionTeorica()"
                  class="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#00B39F] via-[#50E7FF] to-[#D9FF43] hover:brightness-110 text-[#080B10] font-black text-base shadow-2xl shadow-teal-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>Continuar a Evaluación Teórica</span>
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                <button
                  type="button"
                  (click)="reiniciarEvaluacion()"
                  class="w-full sm:w-auto px-6 py-4 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-bold text-sm transition border border-white/15 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg class="w-4 h-4 text-[#50E7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Repetir Evaluación Práctica</span>
                </button>
              </div>

            </div>
          </div>

        }

      </div>
    </div>
  `,
})
export class EvaluacionPracticaComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly stateService = inject(HandwashStateService);

  readonly student = this.stateService.student;
  readonly studentName = computed(() => this.student()?.fullName || 'Estudiante');
  readonly studentCode = computed(() => this.student()?.studentCode || 'No registrado');

  readonly steps = this.stateService.steps;
  readonly currentStepIndex = signal(0);
  readonly currentSeconds = signal(0);
  readonly cameraActive = signal(false);
  readonly cameraLoading = signal(false);
  readonly cameraError = signal('');
  readonly camaraFacingMode = signal<'user' | 'environment'>('user');
  readonly isFullScreen = signal(false);

  readonly handsDetected = signal(0);
  readonly handsTogether = signal(false);
  readonly handsRubbing = signal(false);
  readonly wristDistance = signal(0);
  readonly palmsEvidence = signal(0);
  readonly palmsValidated = signal(false);
  readonly palmsFeedback = signal('Coloca ambas manos en el encuadre para comenzar.');

  readonly evaluacionFinalizada = signal(false);
  readonly completedRecords = this.stateService.stepRecords;

  readonly clinicalTitles: string[] = [
    'Paso 1: Frotar palmas entre sí',
    'Paso 2: Palma derecha sobre dorso izquierdo y viceversa',
    'Paso 3: Frotar palmas con dedos entrelazados',
    'Paso 4: Frotar dorso de dedos contra la palma opuesta',
    'Paso 5: Frotación rotacional de los pulgares',
    'Paso 6: Frotado concéntrico de yemas y uñas sobre la palma',
  ];

  readonly currentClinicalTitle = computed(() => {
    return this.clinicalTitles[this.currentStepIndex()] || this.currentStep().title;
  });

  readonly currentStep = computed<HandwashStep>(() => this.steps[this.currentStepIndex()]);
  readonly isLastStep = computed(() => this.currentStepIndex() === this.steps.length - 1);

  readonly isTechniqueActive = computed(() => {
    return this.handsDetected() >= 2 && this.handsTogether() && this.handsRubbing();
  });

  readonly activeAlert = computed<QualityAlert | null>(() => {
    if (!this.cameraActive()) return null;
    if (this.handsDetected() < 2) {
      return { type: 'hands-missing', message: 'Coloca ambas manos en el encuadre' };
    }
    if (!this.handsTogether()) {
      return { type: 'hands-apart', message: 'Junta las manos para frotar' };
    }
    if (!this.handsRubbing()) {
      return { type: 'still', message: '⚠️ Frota activamente las manos' };
    }
    return null;
  });

  readonly techniqueProgressPercent = computed(() => {
    return Math.min(100, Math.round((this.currentSeconds() / 3.0) * 100));
  });

  readonly formattedTime = computed(() => {
    return this.currentSeconds().toFixed(1);
  });

  readonly notaPractica = computed(() => {
    const records = this.completedRecords();
    const sumScores = records.reduce((acc, r) => acc + r.score, 0);
    return Math.min(10, Math.max(0, Math.round(sumScores * 10) / 10));
  });

  @ViewChild('cameraVideo') private cameraVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('handOverlay') private handOverlay?: ElementRef<HTMLCanvasElement>;

  private stream: MediaStream | null = null;
  private detector: HandLandmarker | null = null;
  private drawingUtils: DrawingUtils | null = null;
  private animationFrame: number | null = null;
  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;
  private timerInterval: any = null;

  private previousKeyPoints: { x: number; y: number }[][] | null = null;
  private previousFrameAt: number | null = null;
  private smoothedMotion: number = 0;
  private effectiveSeconds: number = 0;

  ngOnInit(): void {
    if (!this.student()) {
      this.router.navigate(['/bienvenida']);
      return;
    }
    // Reiniciar práctica previa para registrar la evaluación autónoma limpia
    this.stateService.resetPractice();
    this.currentStepIndex.set(0);
    this.evaluacionFinalizada.set(false);
    this.effectiveSeconds = 0;
    this.currentSeconds.set(0);
    // REQUISITO 1: El temporizador NO debe iniciar automáticamente al cargar la vista.
    // Solo arrancará cuando la cámara esté transmitiendo video.
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.stopCamera();
  }

  toggleFullScreen(): void {
    this.isFullScreen.update((v) => !v);
  }

  async alternarCamara(): Promise<void> {
    const nuevoModo = this.camaraFacingMode() === 'user' ? 'environment' : 'user';
    this.camaraFacingMode.set(nuevoModo);
    if (this.cameraActive()) {
      await this.startCamera();
    }
  }

  async startCamera(): Promise<void> {
    this.cameraLoading.set(true);
    this.cameraError.set('');
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Tu navegador no permite el acceso a la cámara. Asegúrate de ingresar mediante HTTPS.');
      }

      this.releaseStream();

      const facing = this.camaraFacingMode();
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
      }

      const video = this.cameraVideo?.nativeElement;
      if (!video) throw new Error('Visor de video no disponible');

      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('autoplay', 'true');
      video.setAttribute('muted', 'true');
      video.playsInline = true;
      video.muted = true;
      video.autoplay = true;
      video.srcObject = this.stream;

      if (video.readyState < 1) {
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            video.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };
          video.addEventListener('loadedmetadata', onLoaded);
          setTimeout(resolve, 1500);
        });
      }

      await video.play();

      // REQUISITO 1: El cronómetro arranca ESTRICTAMENTE aquí, cuando la cámara está activa y transmitiendo
      this.cameraActive.set(true);
      this.startStepTimer();

      if (!this.detector) {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        try {
          this.detector = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
          });
        } catch {
          this.detector = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
          });
        }
      }

      this.detectHands();
    } catch (error: any) {
      this.releaseStream();
      this.cameraActive.set(false);
      this.stopTimer();
      this.cameraError.set(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Debes autorizar el permiso de acceso a la cámara en tu celular o navegador.'
          : error?.message || 'No fue posible iniciar la cámara en este dispositivo.'
      );
    } finally {
      this.cameraLoading.set(false);
    }
  }

  stopCamera(): void {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    if (this.autoAdvanceTimer !== null) clearTimeout(this.autoAdvanceTimer);
    this.animationFrame = null;
    this.cameraActive.set(false);
    this.stopTimer();
    this.handsDetected.set(0);
    this.handsTogether.set(false);
    this.handsRubbing.set(false);
    this.resetBiomechanicalState();
    this.releaseStream();

    const canvas = this.handOverlay?.nativeElement;
    if (canvas) {
      const context = canvas.getContext('2d');
      context?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  private releaseStream(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    const video = this.cameraVideo?.nativeElement;
    if (video) video.srcObject = null;
  }

  private detectHands(): void {
    const video = this.cameraVideo?.nativeElement;
    if (!video || !this.detector || !this.cameraActive()) return;

    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      const now = performance.now();
      const result = this.detector.detectForVideo(video, now);

      this.evaluateTechnique(result.landmarks, now);
      this.drawLandmarks(result.landmarks);
    }

    this.animationFrame = requestAnimationFrame(() => this.detectHands());
  }

  private evaluateTechnique(landmarks: { x: number; y: number }[][], now: number): void {
    const elapsed = this.previousFrameAt ? Math.min(0.12, (now - this.previousFrameAt) / 1000) : 0;
    this.previousFrameAt = now;
    const instruction = this.currentStep().title;

    // a) Validar presencia de ambas manos
    this.handsDetected.set(landmarks.length);

    if (landmarks.length < 2) {
      this.handsTogether.set(false);
      this.handsRubbing.set(false);
      this.palmsFeedback.set(`${instruction}: coloca ambas manos en el encuadre.`);
      this.previousKeyPoints = null;
      return;
    }

    // b) Proximidad de manos
    const wrist0 = landmarks[0][0];
    const wrist1 = landmarks[1][0];
    const wristDistance = Math.hypot(wrist0.x - wrist1.x, wrist0.y - wrist1.y);
    this.wristDistance.set(Math.round(wristDistance * 100) / 100);

    const palm0 = {
      x: (landmarks[0][0].x + landmarks[0][9].x) / 2,
      y: (landmarks[0][0].y + landmarks[0][9].y) / 2,
    };
    const palm1 = {
      x: (landmarks[1][0].x + landmarks[1][9].x) / 2,
      y: (landmarks[1][0].y + landmarks[1][9].y) / 2,
    };
    const palmDistance = Math.hypot(palm0.x - palm1.x, palm0.y - palm1.y);

    const threshold = this.currentProximityThreshold();
    const areHandsTogether = wristDistance < threshold || palmDistance < threshold;
    this.handsTogether.set(areHandsTogether);

    if (!areHandsTogether) {
      this.handsRubbing.set(false);
      this.palmsFeedback.set(`Junta las manos para realizar la técnica de ${instruction.toLowerCase()}.`);
      this.previousKeyPoints = null;
      return;
    }

    // c) Detección de frotado/movimiento
    const keyIndices = [4, 8, 12, 16, 20];
    const currentKeyPoints: { x: number; y: number }[][] = landmarks
      .slice(0, 2)
      .map((hand) => keyIndices.map((idx) => ({ x: hand[idx].x, y: hand[idx].y })));

    let deltaMovement = 0;
    let sampleCount = 0;

    if (this.previousKeyPoints && this.previousKeyPoints.length >= 2) {
      for (let h = 0; h < 2; h++) {
        for (let i = 0; i < keyIndices.length; i++) {
          const p1 = currentKeyPoints[h][i];
          const p0 = this.previousKeyPoints[h][i];
          if (p1 && p0) {
            deltaMovement += Math.hypot(p1.x - p0.x, p1.y - p0.y);
            sampleCount++;
          }
        }
      }
    }
    this.previousKeyPoints = currentKeyPoints;

    const avgMovement = sampleCount > 0 ? deltaMovement / sampleCount : 0;
    this.smoothedMotion = this.smoothedMotion * 0.65 + avgMovement * 0.35;

    const isRubbing = this.smoothedMotion > 0.0035;
    this.handsRubbing.set(isRubbing);

    if (!isRubbing) {
      this.palmsFeedback.set(`⚠️ Frota activamente las manos.`);
      return;
    }

    // CONDICIÓN CUMPLIDA: Fricción continua
    this.effectiveSeconds += elapsed;
    const roundedSeconds = Math.round(this.effectiveSeconds * 10) / 10;
    if (this.currentSeconds() !== roundedSeconds) {
      this.currentSeconds.set(roundedSeconds);
    }

    const evidence = Math.min(3.0, this.palmsEvidence() + elapsed);
    this.palmsEvidence.set(evidence);

    if (evidence >= 1.5 && !this.palmsValidated()) {
      this.palmsValidated.set(true);
    }

    if (this.effectiveSeconds < 3.0) {
      this.palmsFeedback.set(
        `¡Fricción continua en ${instruction}! Mantén el frotado activo hasta 3.0s mínimos.`
      );
    } else {
      this.palmsFeedback.set(`✓ ¡Excelente técnica autónoma y tiempo óptimo alcanzado (${roundedSeconds}s)!`);
    }

    // Avance automático tras alcanzar técnica validada y tiempo óptimo (>= 3s)
    if (this.palmsValidated() && this.effectiveSeconds >= 3.0 && this.autoAdvanceTimer === null) {
      this.autoAdvanceTimer = setTimeout(() => this.finishCurrentStep(), 900);
    }
  }

  private drawLandmarks(landmarks: { x: number; y: number }[][]): void {
    const canvas = this.handOverlay?.nativeElement;
    const video = this.cameraVideo?.nativeElement;
    if (!canvas || !video || !video.videoWidth || !video.videoHeight) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!this.drawingUtils) {
      this.drawingUtils = new DrawingUtils(context);
    }

    for (const hand of landmarks) {
      this.drawingUtils.drawConnectors(hand as any, HandLandmarker.HAND_CONNECTIONS, {
        color: '#00B39F',
        lineWidth: 3,
      });

      this.drawingUtils.drawLandmarks(hand as any, {
        color: '#50E7FF',
        fillColor: '#FFFFFF',
        lineWidth: 1.5,
        radius: 4,
      });
    }
  }

  private currentProximityThreshold(): number {
    return [0.42, 0.46, 0.42, 0.44, 0.4, 0.42][this.currentStepIndex()] ?? 0.42;
  }

  private resetBiomechanicalState(): void {
    this.palmsEvidence.set(0);
    this.palmsValidated.set(false);
    this.palmsFeedback.set('Coloca ambas manos en el encuadre para comenzar.');
    this.previousKeyPoints = null;
    this.previousFrameAt = null;
    this.smoothedMotion = 0;
    this.effectiveSeconds = 0;
  }

  private startStepTimer(): void {
    this.stopTimer();
    this.effectiveSeconds = 0;
    this.currentSeconds.set(0);
    this.resetBiomechanicalState();

    // REQUISITO 1: Si la cámara NO está activa, no arrancar temporizador
    if (!this.cameraActive()) {
      return;
    }
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetCurrentStepTimer(): void {
    if (this.cameraActive()) {
      this.startStepTimer();
    }
  }

  completeStep(): void {
    this.finishCurrentStep();
  }

  private finishCurrentStep(): void {
    if (this.autoAdvanceTimer !== null) clearTimeout(this.autoAdvanceTimer);
    this.autoAdvanceTimer = null;
    const finalSeconds = Math.max(0.5, this.currentSeconds());
    const stepNum = this.currentStep().number;

    // Guarda el puntaje de la práctica biomecánica en el servicio central
    this.stateService.recordStepTime(stepNum, finalSeconds);

    if (this.isLastStep()) {
      this.stopTimer();
      this.stopCamera();
      this.isFullScreen.set(false);
      this.stateService.unlockStep(5);
      this.evaluacionFinalizada.set(true);
    } else {
      this.currentStepIndex.update((idx) => idx + 1);
      this.startStepTimer();
    }
  }

  reiniciarEvaluacion(): void {
    this.stateService.resetPractice();
    this.currentStepIndex.set(0);
    this.evaluacionFinalizada.set(false);
    this.startCamera();
  }

  continuarAEvaluacionTeorica(): void {
    this.stateService.unlockStep(5);
    this.router.navigate(['/evaluacion-teorica']);
  }
}
