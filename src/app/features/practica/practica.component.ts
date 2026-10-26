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
import { Router } from '@angular/router';
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
  selector: 'app-practica',
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
      0%, 100% { transform: translateY(-8px) rotate(14deg); }
      50% { transform: translateY(8px) rotate(16deg); }
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
    .anim-rub-palms-left { animation: rubPalmsLeft 1.8s ease-in-out infinite; transform-origin: 110px 140px; }
    .anim-rub-palms-right { animation: rubPalmsRight 1.8s ease-in-out infinite; transform-origin: 190px 140px; }
    .anim-rub-dorsal-top { animation: rubDorsalTop 1.6s ease-in-out infinite; transform-origin: 160px 140px; }
    .anim-rub-interdigital-left { animation: rubInterdigitalLeft 1.4s ease-in-out infinite; }
    .anim-rub-interdigital-right { animation: rubInterdigitalRight 1.4s ease-in-out infinite; }
    .anim-rub-hook-lock { animation: rubHookLock 1.5s ease-in-out infinite; }
    .anim-rub-thumb-fist { animation: rubThumbFist 1.8s ease-in-out infinite; transform-origin: 215px 135px; }
    .anim-rub-nails-cluster { animation: rubNailsCluster 2s linear infinite; transform-origin: 160px 150px; }
    .anim-arrow-pulse { animation: arrowPulse 1.4s ease-in-out infinite; transform-origin: center; }
  `],
  template: `
    <!-- Contenedor Maestro con Degradado Suave Menta a Durazno -->
    <div class="min-h-screen py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#CFFBF0] via-[#E8FCF7] to-[#FFE9DE] text-[#0B2B29] relative overflow-hidden">
      <!-- Destellos y Efectos Ambientales Asépticos -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00B39F]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#FF6A4D]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/20 blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto relative z-10">
        @if (!student()) {
          <!-- Pantalla de Bloqueo / Identificación Requerida -->
          <div class="max-w-xl mx-auto my-12 bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/50 text-center animate-fade-in">
            <div class="w-20 h-20 rounded-3xl bg-[#FF6A4D]/15 text-[#FF6A4D] flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#FF6A4D]/30">
              <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span class="inline-block px-3.5 py-1 rounded-full bg-[#FF6A4D]/10 text-[#FF6A4D] font-bold text-xs uppercase tracking-wider mb-3">
              Acceso Restringido
            </span>
            <h2 class="font-heading text-3xl font-extrabold text-[#0B2B29] mb-3">
              Identificación Requerida
            </h2>
            <p class="text-sm md:text-base text-[#0B2B29]/75 mb-8 leading-relaxed">
              Para iniciar la práctica clínica supervisada de los 6 pasos y calibrar el cronómetro biomecánico, primero debes registrar tus datos en el módulo de bienvenida.
            </p>
            <button
              type="button"
              (click)="goToBienvenida()"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#00B39F] hover:bg-[#009988] text-white font-bold text-base shadow-xl hover:shadow-[#00B39F]/30 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <span>Ir al Registro de Estudiantes</span>
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        } @else {
          <!-- BARRA SUPERIOR DE PROGRESO DE LOS 6 PASOS -->
          <div class="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 mb-6 shadow-xl border border-white/50 animate-fade-in">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-[#00B39F] animate-ping"></div>
                <div>
                  <h1 class="text-sm sm:text-base font-extrabold text-[#0B2B29] uppercase tracking-wide flex items-center gap-2">
                    <span>Práctica Clínica Supervisada</span>
                    <span class="text-[#00B39F]">•</span>
                    <span class="text-[#00B39F] font-bold">Paso {{ currentStepIndex() + 1 }} de 6</span>
                  </h1>
                  <p class="text-xs text-[#0B2B29]/70 hidden sm:block">
                    Evaluación por Calidad de Técnica Biomecánica • Protocolo OMS
                  </p>
                </div>
              </div>

              <!-- Badge Objetivo de Tiempo -->
              <div class="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00B39F]/10 border border-[#00B39F]/25 text-[#008072] text-xs font-bold shadow-xs">
                <svg class="w-4 h-4 text-[#00B39F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Frotado Activo Requerido: 3 a 8 segundos</span>
              </div>
            </div>

            <!-- Stepper visual de 6 pasos con píldoras y conectores -->
            <div class="grid grid-cols-6 gap-2 sm:gap-4 items-center">
              @for (step of steps; track step.number; let idx = $index) {
                <div class="flex flex-col items-center gap-1.5 text-center group">
                  <div
                    class="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-md"
                    [ngClass]="{
                      'bg-gradient-to-r from-[#00B39F] to-[#009988] text-white ring-4 ring-[#00B39F]/30 scale-110 shadow-[#00B39F]/40': idx === currentStepIndex(),
                      'bg-[#00B39F] text-white': idx < currentStepIndex(),
                      'bg-slate-100 text-slate-400 border border-slate-200': idx > currentStepIndex()
                    }"
                  >
                    @if (idx < currentStepIndex()) {
                      <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    } @else {
                      {{ step.number }}
                    }
                  </div>
                  <span
                    class="text-[10px] sm:text-xs font-bold truncate max-w-full hidden md:block transition-colors"
                    [ngClass]="idx === currentStepIndex() ? 'text-[#008072]' : idx < currentStepIndex() ? 'text-[#0B2B29]' : 'text-slate-400'"
                  >
                    {{ step.title }}
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- GRID PRINCIPAL (Cámara 67-70% / Guía Clínica 30-33%) -->
          <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">

            <!-- ÁREA PRINCIPAL DE LA CÁMARA (COLUMNA PROTAGONISTA 67%) -->
            <div class="xl:col-span-8 flex flex-col gap-4">
              <div class="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/60 flex items-center justify-center group">

                <!-- Video Stream con inversión de espejo -->
                <video
                  #cameraVideo
                  autoplay
                  muted
                  playsinline
                  class="w-full h-full object-cover scale-x-[-1]"
                ></video>

                <!-- Canvas de Detección MediaPipe con dimensiones nativas y scale-x-[-1] sincronizado -->
                <canvas
                  #handOverlay
                  class="absolute inset-0 w-full h-full pointer-events-none z-10 scale-x-[-1] object-cover"
                ></canvas>

                <!-- BADGE FLOTANTE: ESQUINA SUPERIOR IZQUIERDA -->
                <div class="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <div class="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-white/60 shadow-lg text-[#0B2B29]">
                    <span class="w-6 h-6 rounded-full bg-[#00B39F] text-white text-xs font-black flex items-center justify-center shadow-xs">
                      {{ currentStepIndex() + 1 }}
                    </span>
                    <span class="text-xs sm:text-sm font-extrabold tracking-tight">
                      Paso {{ currentStepIndex() + 1 }} de 6:
                    </span>
                    <span class="text-xs sm:text-sm font-bold text-[#008072] max-w-[140px] sm:max-w-xs truncate">
                      {{ currentStep().title }}
                    </span>
                  </div>
                </div>

                <!-- BADGE FLOTANTE: ESQUINA SUPERIOR DERECHA (Indicadores en vivo) -->
                <div class="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <!-- Indicador de detección de ambas manos -->
                  <div
                    class="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-300 shadow-lg backdrop-blur-md border"
                    [ngClass]="handsDetected() >= 2
                      ? 'bg-emerald-500/90 border-emerald-400 text-white shadow-emerald-500/25'
                      : 'bg-[#FF6A4D]/90 border-[#FF6A4D] text-white shadow-[#FF6A4D]/25'"
                  >
                    <span
                      class="w-2.5 h-2.5 rounded-full"
                      [ngClass]="handsDetected() >= 2 ? 'bg-white animate-pulse' : 'bg-white/80'"
                    ></span>
                    <span class="tracking-wide">
                      Manos detectadas: {{ handsDetected() }}/2
                    </span>
                  </div>

                  <!-- Indicador de Frotado Activo -->
                  @if (cameraActive() && isTechniqueActive()) {
                    <div class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#00B39F]/90 border border-white/40 text-white text-xs font-extrabold shadow-lg backdrop-blur-md animate-pulse">
                      <span class="w-2 h-2 rounded-full bg-white"></span>
                      <span>Frotando</span>
                    </div>
                  }

                  @if (cameraActive()) {
                    <button
                      type="button"
                      (click)="stopCamera()"
                      class="px-3.5 py-2 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md text-xs font-semibold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                      title="Apagar Cámara"
                    >
                      <svg class="w-3.5 h-3.5 text-[#FF6A4D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <span class="hidden sm:inline">Apagar</span>
                    </button>
                  }
                </div>

                <!-- AVISO VISUAL FLOTANTE CENTRAL CUANDO SE CONGELA EL PROGRESO -->
                @if (cameraActive() && activeAlert()) {
                  <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none z-25 px-4 animate-fade-in">
                    <div
                      class="px-6 py-3.5 rounded-full font-black text-sm sm:text-base shadow-2xl border-2 border-white/60 backdrop-blur-md flex items-center gap-3 transition-all transform scale-105"
                      [ngClass]="{
                        'bg-[#FF6A4D]/95 text-white shadow-[#FF6A4D]/40 animate-pulse': activeAlert()?.type === 'hands-missing' || activeAlert()?.type === 'still',
                        'bg-amber-500/95 text-white shadow-amber-500/40': activeAlert()?.type === 'hands-apart'
                      }"
                    >
                      @if (activeAlert()?.type === 'still') {
                        <svg class="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      } @else {
                        <svg class="w-5 h-5 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      }
                      <span>{{ activeAlert()?.message }}</span>
                    </div>
                  </div>
                }

                <!-- OVERLAY CUANDO LA CÁMARA ESTÁ APAGADA -->
                @if (!cameraActive()) {
                  <div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950/90 backdrop-blur-sm z-15">
                    <div class="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#00B39F]/30 via-[#50E7FF]/20 to-transparent border border-[#00B39F]/40 flex items-center justify-center mb-4 shadow-xl shadow-[#00B39F]/10">
                      <svg class="w-9 h-9 sm:w-10 sm:h-10 text-[#00B39F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <h3 class="font-heading text-xl sm:text-2xl font-extrabold text-[#F5F8FF] mb-2">
                      Evaluación Biomecánica Asistida
                    </h3>
                    <p class="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
                      Activa tu cámara web para reconocimiento de manos (21 puntos clave por mano) y medición de frotado efectivo en tiempo real.
                    </p>

                    <button
                      type="button"
                      (click)="startCamera()"
                      [disabled]="cameraLoading()"
                      class="px-8 py-3.5 rounded-full bg-[#00B39F] hover:bg-[#009988] text-white font-extrabold text-sm shadow-xl hover:shadow-[#00B39F]/30 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 cursor-pointer"
                    >
                      @if (cameraLoading()) {
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Inicializando Visor...</span>
                      } @else {
                        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Activar Cámara en Vivo</span>
                      }
                    </button>

                    @if (cameraError()) {
                      <div class="mt-4 px-4 py-2 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-semibold max-w-sm">
                        {{ cameraError() }}
                      </div>
                    }

                    <span class="mt-4 text-[11px] text-slate-400">
                      Privacidad garantizada: El procesamiento de visión ocurre localmente en tu equipo.
                    </span>
                  </div>
                }

                <!-- BARRA INFERIOR FLOTANTE: PROGRESO DE TÉCNICA -->
                <div class="absolute bottom-4 left-4 right-4 z-20 bg-slate-950/85 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 border border-white/20 shadow-2xl text-white">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2.5 min-w-0">
                      @if (palmsValidated()) {
                        <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      } @else if (isTechniqueActive()) {
                        <div class="w-6 h-6 rounded-full bg-[#00B39F]/20 text-[#00B39F] flex items-center justify-center shrink-0 border border-[#00B39F]/40 animate-pulse">
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      } @else {
                        <div class="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      }
                      <span class="text-xs sm:text-sm font-semibold truncate text-[#F5F8FF]">
                        @if (cameraActive()) {
                          {{ palmsFeedback() }}
                        } @else {
                          Realiza la maniobra frente a la pantalla y registra el tiempo transcurrido.
                        }
                      </span>
                    </div>

                    <!-- Indicador porcentaje de técnica y estado -->
                    <div class="shrink-0 flex items-center gap-2 self-end sm:self-auto px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold">
                      <span class="text-slate-300">Técnica:</span>
                      <span [ngClass]="palmsValidated() ? 'text-emerald-400 font-extrabold' : isTechniqueActive() ? 'text-[#00B39F] font-bold' : 'text-amber-400 font-medium'">
                        {{ techniqueProgressPercent() }}%
                      </span>
                    </div>
                  </div>

                  <!-- Barra de progreso lineal -->
                  <div class="w-full h-2.5 bg-white/15 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      class="h-full rounded-full transition-all duration-300"
                      [ngClass]="palmsValidated() ? 'bg-gradient-to-r from-emerald-400 to-[#00B39F]' : isTechniqueActive() ? 'bg-gradient-to-r from-[#00B39F] to-emerald-400' : 'bg-[#FF6A4D]/80'"
                      [style.width.%]="techniqueProgressPercent()"
                    ></div>
                  </div>
                </div>

              </div>
            </div>

            <!-- PANEL LATERAL DE GUÍA CLÍNICA (COLUMNA 33%) -->
            <div class="xl:col-span-4 bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-xl border border-white/50 flex flex-col justify-between space-y-6 animate-fade-in">
              
              <!-- Encabezado del Paso Actual -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE9DE] text-[#FF6A4D] text-xs font-extrabold border border-[#FF6A4D]/20 shadow-xs">
                    Maniobra OMS #{{ currentStep().number }}
                  </span>
                  <span class="text-xs font-bold text-slate-400">
                    Paso {{ currentStepIndex() + 1 }} de 6
                  </span>
                </div>

                <h2 class="font-heading text-2xl sm:text-3xl font-extrabold text-[#0B2B29] leading-tight">
                  {{ currentStep().title }}
                </h2>

                <p class="text-xs sm:text-sm font-bold text-[#008072]">
                  {{ currentStep().subtitle }}
                </p>
              </div>

              <!-- RECUADRO GUÍA ANATÓMICA: VISOR ANIMADO DE MANOS EN MOVIMIENTO BIOMECÁNICO -->
              <div class="relative min-h-[260px] sm:min-h-[290px] rounded-2xl bg-gradient-to-br from-[#CFFBF0]/60 via-white to-[#FFE9DE]/60 border-2 border-[#00B39F]/30 p-3 sm:p-4 flex flex-col items-center justify-between overflow-hidden shadow-inner group">
                
                <!-- Encabezado superior de la Guía Anatómica -->
                <div class="w-full flex items-center justify-between mb-1.5 z-10">
                  <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#008072] px-2.5 py-1 rounded-full bg-white/90 border border-[#00B39F]/30 shadow-xs">
                    <span class="w-2 h-2 rounded-full bg-[#00B39F] animate-ping"></span>
                    <span>Guía Anatómica • Paso {{ currentStep().number }} de 6</span>
                  </span>
                  <span class="text-[10px] font-extrabold text-[#FF6A4D] px-2 py-0.5 rounded-full bg-[#FFE9DE] border border-[#FF6A4D]/25 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#FF6A4D] animate-pulse"></span>
                    <span>Manos en Bucle</span>
                  </span>
                </div>

                <!-- Visor Central: Video Clip en Bucle o Render Anatómico Vectorial Animado -->
                <div class="relative w-full h-44 sm:h-48 flex items-center justify-center my-auto">
                  @if (!videoDemoError() && currentStep().videoDemo) {
                    <video
                      #guideVideo
                      [src]="currentStep().videoDemo"
                      autoplay
                      loop
                      muted
                      playsinline
                      class="w-full h-full object-contain rounded-xl shadow-xs"
                      (error)="onVideoDemoError()"
                    ></video>
                  } @else {
                    <!-- MANOS CLÍNICAS ANATÓMICAS CON MICRO-ANIMACIONES DE MOVIMIENTO REAL -->
                    @switch (currentStep().iconType) {
                      @case ('palms') {
                        <!-- Paso 1: Frotado Palma con Palma -->
                        <svg class="w-full h-full max-h-44 sm:max-h-48" viewBox="0 0 320 260" fill="none">
                          <circle cx="160" cy="130" r="85" stroke="#00B39F" stroke-width="1.8" stroke-dasharray="5 5" stroke-opacity="0.4"/>
                          <circle cx="160" cy="130" r="105" stroke="#FF6A4D" stroke-width="1.2" stroke-dasharray="4 6" stroke-opacity="0.3"/>
                          <!-- Mano Izquierda en Órbita -->
                          <g class="anim-rub-palms-left">
                            <path d="M105 210 C100 175, 102 145, 108 120 C110 105, 116 90, 120 62 C122 52, 132 52, 134 62 L138 100 C140 85, 148 80, 152 90 L154 112 C156 102, 162 100, 166 110 L168 128 C172 122, 178 124, 178 134 C178 158, 168 185, 148 210 Z" fill="#FDBA74" stroke="#0B2B29" stroke-width="3" stroke-linejoin="round"/>
                            <path d="M170 140 C182 135, 194 138, 198 146 C202 155, 192 165, 180 168 L165 170" stroke="#0B2B29" stroke-width="2.5" fill="#FED7AA"/>
                            <path d="M118 138 C130 144, 145 142, 156 135" stroke="#C2410C" stroke-width="2" stroke-linecap="round"/>
                          </g>
                          <!-- Mano Derecha en Contra-Órbita -->
                          <g class="anim-rub-palms-right">
                            <path d="M215 210 C215 185, 218 160, 212 135 C208 120, 202 108, 196 82 C192 70, 182 72, 180 84 L176 110 C172 95, 164 96, 162 110 L158 125 C152 120, 146 125, 146 136 C146 160, 158 185, 178 210 Z" fill="#FBBF24" fill-opacity="0.88" stroke="#008072" stroke-width="3" stroke-linejoin="round"/>
                            <path d="M150 155 C138 150, 126 154, 122 162 C118 172, 130 180, 145 182 L158 180" stroke="#008072" stroke-width="2.5" fill="#FDE68A"/>
                            <path d="M194 142 C182 147, 170 144, 162 138" stroke="#B45309" stroke-width="2" stroke-linecap="round"/>
                          </g>
                          <!-- Flechas de rotación -->
                          <g class="anim-arrow-pulse">
                            <path d="M125 70 C150 52, 188 54, 212 72" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                            <polygon points="216,76 214,64 202,70" fill="#00B39F"/>
                            <path d="M195 190 C170 208, 132 206, 108 188" stroke="#FF6A4D" stroke-width="3.5" stroke-linecap="round"/>
                            <polygon points="104,182 106,196 118,190" fill="#FF6A4D"/>
                          </g>
                        </svg>
                      }
                      @case ('dorsal') {
                        <!-- Paso 2: Palma Derecha sobre Dorso Izquierdo -->
                        <svg class="w-full h-full max-h-44 sm:max-h-48" viewBox="0 0 320 260" fill="none">
                          <g class="hand-dorsum">
                            <path d="M125 215 C122 185, 124 158, 128 130 L124 72 C124 60, 135 60, 135 72 L138 120 L144 58 C144 46, 155 46, 155 58 L156 115 L162 62 C162 50, 173 50, 173 62 L171 120 L179 78 C179 68, 189 68, 189 80 L183 135 C186 160, 184 188, 176 215 Z" fill="#FED7AA" stroke="#0B2B29" stroke-width="3.2" stroke-linejoin="round"/>
                            <path d="M130 130 C132 142, 136 165, 140 185" stroke="#EA580C" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>
                            <path d="M145 125 C147 140, 149 165, 151 185" stroke="#EA580C" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>
                            <path d="M160 125 C160 140, 158 165, 156 185" stroke="#EA580C" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>
                          </g>
                          <g class="anim-rub-dorsal-top">
                            <path d="M106 175 C100 145, 110 122, 124 105 C132 94, 146 86, 164 82 C188 82, 208 92, 222 116 C230 130, 226 152, 218 175 Z" fill="#FBBF24" fill-opacity="0.88" stroke="#008072" stroke-width="3.2" stroke-linejoin="round"/>
                            <path d="M136 94 C134 68, 138 48, 140 35 C142 26, 152 27, 152 36 L148 90" stroke="#008072" stroke-width="2.8" stroke-linecap="round" fill="#FDE68A"/>
                            <path d="M156 86 C156 62, 160 40, 164 28 C166 18, 176 20, 176 30 L172 85" stroke="#008072" stroke-width="2.8" stroke-linecap="round" fill="#FDE68A"/>
                            <path d="M178 90 C180 70, 186 50, 190 40 C192 32, 202 33, 202 43 L194 92" stroke="#008072" stroke-width="2.8" stroke-linecap="round" fill="#FDE68A"/>
                          </g>
                          <g class="anim-arrow-pulse">
                            <path d="M78 150 L78 95" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                            <polygon points="78,86 73,98 83,98" fill="#00B39F"/>
                            <path d="M242 95 L242 150" stroke="#FF6A4D" stroke-width="3.5" stroke-linecap="round"/>
                            <polygon points="242,158 237,146 247,146" fill="#FF6A4D"/>
                          </g>
                        </svg>
                      }
                      @case ('interdigital') {
                        <!-- Paso 3: Dedos Entrelazados Palma con Palma -->
                        <svg class="w-full h-full max-h-44 sm:max-h-48" viewBox="0 0 320 260" fill="none">
                          <g class="anim-rub-interdigital-left">
                            <path d="M80 215 C85 178, 90 145, 100 122 C110 98, 120 95, 120 110 L120 152 C115 175, 105 198, 100 215 Z" fill="#FED7AA" stroke="#0B2B29" stroke-width="3" stroke-linejoin="round"/>
                            <path d="M110 128 L110 65 C110 54, 121 54, 121 65 L121 128" fill="#FED7AA" stroke="#0B2B29" stroke-width="2.8" stroke-linecap="round"/>
                            <path d="M144 128 L144 40 C144 28, 155 28, 155 40 L155 128" fill="#FED7AA" stroke="#0B2B29" stroke-width="2.8" stroke-linecap="round"/>
                            <path d="M178 128 L178 50 C178 38, 189 38, 189 50 L189 128" fill="#FED7AA" stroke="#0B2B29" stroke-width="2.8" stroke-linecap="round"/>
                          </g>
                          <g class="anim-rub-interdigital-right">
                            <path d="M240 215 C235 178, 230 145, 220 122 C210 98, 200 95, 200 110 L200 152 C205 175, 215 198, 220 215 Z" fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linejoin="round"/>
                            <path d="M127 128 L127 52 C127 40, 138 40, 138 52 L138 128" fill="#FBBF24" stroke="#008072" stroke-width="2.8" stroke-linecap="round"/>
                            <path d="M161 128 L161 38 C161 26, 172 26, 172 38 L172 128" fill="#FBBF24" stroke="#008072" stroke-width="2.8" stroke-linecap="round"/>
                            <path d="M195 128 L195 62 C195 50, 206 50, 206 62 L206 128" fill="#FBBF24" stroke="#008072" stroke-width="2.8" stroke-linecap="round"/>
                          </g>
                          <circle cx="124" cy="90" r="4.5" fill="#00B39F" fill-opacity="0.8"/>
                          <circle cx="141" cy="80" r="4.5" fill="#FF6A4D" fill-opacity="0.8"/>
                          <circle cx="158" cy="76" r="4.5" fill="#00B39F" fill-opacity="0.8"/>
                          <circle cx="175" cy="80" r="4.5" fill="#FF6A4D" fill-opacity="0.8"/>
                          <circle cx="192" cy="90" r="4.5" fill="#00B39F" fill-opacity="0.8"/>
                          <g class="anim-arrow-pulse">
                            <path d="M133 32 L133 16" stroke="#FF6A4D" stroke-width="3" stroke-linecap="round"/>
                            <polygon points="133,9 129,20 137,20" fill="#FF6A4D"/>
                            <path d="M183 16 L183 32" stroke="#00B39F" stroke-width="3" stroke-linecap="round"/>
                            <polygon points="183,39 179,28 187,28" fill="#00B39F"/>
                          </g>
                        </svg>
                      }
                      @case ('fingers-locked') {
                        <!-- Paso 4: Dedos Trabados en Gancho -->
                        <svg class="w-full h-full max-h-44 sm:max-h-48" viewBox="0 0 320 260" fill="none">
                          <g class="anim-rub-hook-lock">
                            <path d="M50 105 C75 105, 98 110, 112 115 L112 165 C98 170, 75 175, 50 175 Z" fill="#FED7AA" stroke="#0B2B29" stroke-width="3" stroke-linejoin="round"/>
                            <path d="M270 105 C245 105, 222 110, 208 115 L208 165 C222 170, 245 175, 270 175 Z" fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linejoin="round"/>
                            <path d="M112 98 C135 94, 162 94, 172 104 C180 112, 176 126, 162 126 L125 126" fill="#FED7AA" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                            <path d="M112 118 C135 114, 166 114, 176 124 C184 132, 180 144, 166 144 L125 144" fill="#FED7AA" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                            <path d="M112 138 C135 134, 166 134, 176 142 C184 150, 180 162, 166 162 L125 162" fill="#FED7AA" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                            <path d="M112 158 C130 156, 156 156, 166 164 C174 172, 170 182, 158 182 L125 182" fill="#FED7AA" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                            <path d="M208 104 C185 100, 158 100, 148 108 C140 116, 144 128, 158 128 L195 128" fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linecap="round"/>
                            <path d="M208 124 C185 120, 154 120, 144 128 C136 136, 140 148, 154 148 L195 148" fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linecap="round"/>
                            <path d="M208 144 C185 140, 154 140, 144 148 C136 156, 140 168, 154 168 L195 168" fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linecap="round"/>
                            <path d="M208 164 C190 162, 162 162, 152 170 C144 178, 148 186, 162 186 L195 186" fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linecap="round"/>
                            <circle cx="174" cy="112" r="3.5" fill="#FFFFFF" stroke="#FF6A4D" stroke-width="1.5"/>
                            <circle cx="178" cy="132" r="3.5" fill="#FFFFFF" stroke="#FF6A4D" stroke-width="1.5"/>
                            <circle cx="178" cy="150" r="3.5" fill="#FFFFFF" stroke="#FF6A4D" stroke-width="1.5"/>
                            <circle cx="144" cy="116" r="3.5" fill="#FFFFFF" stroke="#00B39F" stroke-width="1.5"/>
                            <circle cx="140" cy="136" r="3.5" fill="#FFFFFF" stroke="#00B39F" stroke-width="1.5"/>
                            <circle cx="140" cy="154" r="3.5" fill="#FFFFFF" stroke="#00B39F" stroke-width="1.5"/>
                          </g>
                          <g class="anim-arrow-pulse">
                            <path d="M105 60 L62 60" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                            <polygon points="54,60 66,54 66,66" fill="#00B39F"/>
                            <path d="M215 60 L258 60" stroke="#FF6A4D" stroke-width="3.5" stroke-linecap="round"/>
                            <polygon points="266,60 254,54 254,66" fill="#FF6A4D"/>
                          </g>
                        </svg>
                      }
                      @case ('thumbs') {
                        <!-- Paso 5: Fricción del Pulgar Atrapado -->
                        <svg class="w-full h-full max-h-44 sm:max-h-48" viewBox="0 0 320 260" fill="none">
                          <g class="hand-thumb">
                            <path d="M90 220 C95 185, 100 155, 108 132 L124 132 C118 160, 114 190, 118 220 Z" fill="#FED7AA" stroke="#0B2B29" stroke-width="3" stroke-linejoin="round"/>
                            <path d="M112 135 C118 112, 126 82, 134 56 C138 44, 150 44, 152 56 L148 112" fill="#FED7AA" stroke="#0B2B29" stroke-width="3.2" stroke-linecap="round"/>
                            <path d="M136 58 C138 52, 146 52, 148 58" stroke="#0B2B29" stroke-width="2" fill="#FFE4D6"/>
                          </g>
                          <g class="anim-rub-thumb-fist">
                            <path d="M230 215 C216 190, 212 168, 204 150 L222 138 C232 160, 240 185, 250 215 Z" fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linejoin="round"/>
                            <path d="M206 92 C188 82, 142 82, 128 96 C122 104, 128 118, 146 118 L194 114" fill="#FBBF24" stroke="#008072" stroke-width="3.2" stroke-linecap="round"/>
                            <path d="M202 110 C184 102, 142 102, 130 114 C124 122, 130 134, 148 134 L194 130" fill="#FBBF24" stroke="#008072" stroke-width="3.2" stroke-linecap="round"/>
                            <path d="M198 128 C180 122, 146 122, 136 134 C130 142, 138 152, 154 152 L194 146" fill="#FBBF24" stroke="#008072" stroke-width="3.2" stroke-linecap="round"/>
                            <path d="M192 146 C178 142, 152 142, 142 152 C138 160, 146 168, 164 168 L192 162" fill="#FBBF24" stroke="#008072" stroke-width="3.2" stroke-linecap="round"/>
                          </g>
                          <g class="anim-arrow-pulse">
                            <path d="M106 72 C118 54, 162 52, 178 70" stroke="#00B39F" stroke-width="3.5" stroke-linecap="round"/>
                            <polygon points="184,76 180,64 170,70" fill="#00B39F"/>
                            <path d="M178 168 C162 186, 118 184, 102 166" stroke="#FF6A4D" stroke-width="3.5" stroke-linecap="round"/>
                            <polygon points="96,160 100,172 110,166" fill="#FF6A4D"/>
                          </g>
                        </svg>
                      }
                      @case ('nails') {
                        <!-- Paso 6: Yemas y Uñas en Palma -->
                        <svg class="w-full h-full max-h-44 sm:max-h-48" viewBox="0 0 320 260" fill="none">
                          <g class="hand-palmar-cup">
                            <path d="M125 225 C125 200, 116 182, 108 165" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                            <path d="M195 225 C195 200, 204 182, 212 165" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                            <path d="M88 172 C84 150, 96 132, 120 132 C135 132, 145 138, 160 140 C175 138, 185 132, 200 132 C224 132, 236 150, 232 172 C228 198, 195 212, 160 212 C125 212, 92 198, 88 172 Z" fill="#FED7AA" stroke="#0B2B29" stroke-width="3.2" stroke-linejoin="round"/>
                            <circle cx="160" cy="158" r="15" stroke="#00B39F" stroke-width="1.8" stroke-dasharray="3 3"/>
                            <circle cx="160" cy="158" r="26" stroke="#FF6A4D" stroke-width="1.5" stroke-dasharray="4 4"/>
                          </g>
                          <g class="anim-rub-nails-cluster">
                            <path d="M144 25 L146 65" stroke="#008072" stroke-width="2.8" stroke-linecap="round"/>
                            <path d="M176 25 L174 65" stroke="#008072" stroke-width="2.8" stroke-linecap="round"/>
                            <path d="M136 60 C132 78, 142 110, 150 144 L170 144 C178 110, 188 78, 184 60 Z" fill="#FBBF24" stroke="#008072" stroke-width="3" stroke-linejoin="round"/>
                            <ellipse cx="150" cy="144" rx="4.5" ry="5.5" fill="#FFFFFF" stroke="#008072" stroke-width="2"/>
                            <ellipse cx="157" cy="141" rx="4.5" ry="5.5" fill="#FFFFFF" stroke="#008072" stroke-width="2"/>
                            <ellipse cx="163" cy="146" rx="4.5" ry="5.5" fill="#FFFFFF" stroke="#008072" stroke-width="2"/>
                            <ellipse cx="169" cy="141" rx="4.5" ry="5.5" fill="#FFFFFF" stroke="#008072" stroke-width="2"/>
                            <ellipse cx="174" cy="145" rx="4.5" ry="5.5" fill="#FFFFFF" stroke="#008072" stroke-width="2"/>
                          </g>
                          <g class="anim-arrow-pulse">
                            <path d="M146 120 C162 114, 182 118, 190 132" stroke="#FF6A4D" stroke-width="3" stroke-linecap="round"/>
                            <polygon points="192,138 194,126 182,130" fill="#FF6A4D"/>
                            <path d="M174 185 C156 190, 135 184, 130 172" stroke="#00B39F" stroke-width="3" stroke-linecap="round"/>
                            <polygon points="128,166 126,178 138,174" fill="#00B39F"/>
                          </g>
                        </svg>
                      }
                    }
                  }
                </div>

                <!-- Chips flotantes de datos biomecánicos -->
                <div class="w-full mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <div class="flex items-center gap-1 truncate">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#00B39F]"></span>
                    <span class="text-slate-400">Área:</span>
                    <span class="text-[#0B2B29] font-black truncate">{{ currentStep().targetArea }}</span>
                  </div>
                  <div class="hidden sm:flex items-center gap-1 text-[#FF6A4D] shrink-0 font-extrabold">
                    <span>⚡ {{ currentStep().recommendedPressure }}</span>
                  </div>
                </div>

              </div>

              <!-- INSTRUCCIÓN TEXTUAL CLARA Y DETALLADA -->
              <div class="space-y-3">
                <p class="text-xs sm:text-sm text-[#0B2B29]/85 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 shadow-xs">
                  {{ currentStep().description }}
                </p>

                <!-- Clave Clínica Aséptica -->
                <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-[#CFFBF0]/40 border border-[#00B39F]/30 text-xs text-[#0B2B29]">
                  <div class="w-6 h-6 rounded-lg bg-[#00B39F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span class="font-extrabold text-[#008072]">Relevancia Clínica: </span>
                    <span>{{ currentStep().clinicalKey }}</span>
                  </div>
                </div>
              </div>

              <!-- CRONÓMETRO VISUAL CIRCULAR Y TIEMPO EFECTIVO DE FROTADO -->
              <div class="flex flex-col items-center justify-center pt-2">
                <div class="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center mb-3">
                  <!-- Círculo SVG de Fondo -->
                  <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      class="text-slate-100"
                      stroke-width="8"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <!-- Arco de Progreso Dinámico según segundos -->
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      stroke-width="8"
                      stroke-linecap="round"
                      fill="transparent"
                      [attr.stroke-dasharray]="circumference"
                      [attr.stroke-dashoffset]="strokeDashoffset()"
                      [ngClass]="{
                        'text-[#FF6A4D]': currentSeconds() < 3.0,
                        'text-[#00B39F]': currentSeconds() >= 3.0 && currentSeconds() <= 8.0,
                        'text-amber-500': currentSeconds() > 8.0
                      }"
                      stroke="currentColor"
                      class="transition-all duration-150"
                    />
                  </svg>

                  <!-- Lectura Digital Central -->
                  <div class="absolute flex flex-col items-center justify-center text-center">
                    <div class="font-heading text-4xl sm:text-5xl font-black tracking-tight text-[#0B2B29]">
                      {{ formattedTime() }}
                    </div>
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-0.5">
                      Segundos Efectivos
                    </span>

                    <!-- Badge de Estado del Ritmo OMS -->
                    <div
                      class="mt-2 text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-xs transition-colors"
                      [ngClass]="{
                        'bg-[#FFE9DE] text-[#FF6A4D] border-[#FF6A4D]/30': currentSeconds() < 3.0,
                        'bg-[#CFFBF0] text-[#008072] border-[#00B39F]/40 animate-pulse': currentSeconds() >= 3.0 && currentSeconds() <= 8.0,
                        'bg-amber-100 text-amber-800 border-amber-300': currentSeconds() > 8.0
                      }"
                    >
                      @if (currentSeconds() < 3.0) {
                        <span>Fricción Insuficiente (&lt;3s)</span>
                      } @else if (currentSeconds() <= 8.0) {
                        <span>✓ Rango Óptimo OMS</span>
                      } @else {
                        <span>Tiempo Extenso (&gt;8s)</span>
                      }
                    </div>
                  </div>
                </div>

                <!-- Barra lineal de referencia del rango 3 a 8s -->
                <div class="w-full max-w-xs space-y-1 text-center">
                  <div class="flex justify-between text-[10px] font-bold text-slate-400 px-1">
                    <span>0s</span>
                    <span class="text-[#008072]">3s (Mín)</span>
                    <span class="text-[#008072]">8s (Máx)</span>
                    <span>10s+</span>
                  </div>
                  <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                    <div class="w-[30%] bg-[#FF6A4D]/30 border-r border-white"></div>
                    <div class="w-[50%] bg-[#00B39F]/40 border-r border-white"></div>
                    <div class="w-[20%] bg-amber-400/30"></div>
                  </div>
                </div>
              </div>

              <!-- BOTONES DE CONTROL ESTILO PÍLDORA -->
              <div class="space-y-3 pt-2">
                <!-- Botón Principal: Siguiente Paso / Finalizar -->
                <button
                  type="button"
                  (click)="completeStep()"
                  [disabled]="cameraActive() && !palmsValidated()"
                  class="w-full py-4 px-6 rounded-full font-extrabold text-base sm:text-lg text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group"
                  [ngClass]="cameraActive() && !palmsValidated()
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-[#00B39F] hover:bg-[#009988] hover:shadow-[#00B39F]/30 hover:scale-[1.02] active:scale-[0.98]'"
                >
                  <span>
                    @if (cameraActive() && !palmsValidated()) {
                      Frotando frente a la cámara...
                    } @else if (isLastStep()) {
                      Finalizar y Calificar Práctica
                    } @else {
                      Paso Completado
                    }
                  </span>
                  <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                <!-- Botón Secundario Píldora: Reiniciar Tiempo -->
                <div class="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    (click)="resetCurrentStepTimer()"
                    class="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-[#0B2B29] bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5 text-[#00B39F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Reiniciar cronómetro</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          <!-- RESUMEN DE PASOS REGISTRADOS EN LA SESIÓN -->
          @if (completedRecords().length > 0) {
            <div class="mt-8 bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/50 shadow-xl text-[#0B2B29] animate-fade-in">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-xl bg-[#00B39F]/15 text-[#00B39F] flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-[#0B2B29]">
                    Registros Clínicos de la Sesión
                  </h3>
                  <p class="text-[11px] text-slate-500">
                    Historial de tiempos y ritmo aséptico por maniobra
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                @for (rec of completedRecords(); track rec.stepNumber) {
                  <div class="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div class="flex items-center justify-between text-[11px] text-slate-500 font-bold mb-1">
                      <span>Paso {{ rec.stepNumber }}</span>
                      <span
                        class="w-2 h-2 rounded-full"
                        [ngClass]="{
                          'bg-emerald-500': rec.status === 'optimal',
                          'bg-[#FF6A4D]': rec.status === 'too-fast',
                          'bg-amber-500': rec.status === 'too-slow'
                        }"
                      ></span>
                    </div>

                    <div class="font-heading text-lg font-black text-[#0B2B29]">
                      {{ rec.seconds }}s
                    </div>

                    <div
                      class="text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-1 text-center truncate"
                      [ngClass]="{
                        'bg-[#CFFBF0] text-[#008072]': rec.status === 'optimal',
                        'bg-[#FFE9DE] text-[#FF6A4D]': rec.status === 'too-fast',
                        'bg-amber-100 text-amber-800': rec.status === 'too-slow'
                      }"
                    >
                      {{ rec.status === 'optimal' ? 'Óptimo' : rec.status === 'too-fast' ? 'Apresurado' : 'Extenso' }}
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class PracticaComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly stateService = inject(HandwashStateService);

  readonly student = this.stateService.student;
  readonly steps = this.stateService.steps;
  readonly currentStepIndex = signal(0);
  readonly currentSeconds = signal(0);
  readonly cameraActive = signal(false);
  readonly cameraLoading = signal(false);
  readonly cameraError = signal('');
  readonly handsDetected = signal(0);
  readonly handsTogether = signal(false);
  readonly handsRubbing = signal(false);
  readonly wristDistance = signal(0);
  readonly palmsEvidence = signal(0);
  readonly palmsValidated = signal(false);
  readonly palmsFeedback = signal('Coloca ambas manos en el encuadre para comenzar.');
  readonly videoDemoError = signal(false);

  @ViewChild('cameraVideo') private cameraVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('handOverlay') private handOverlay?: ElementRef<HTMLCanvasElement>;

  readonly currentStep = computed<HandwashStep>(() => this.steps[this.currentStepIndex()]);
  readonly isLastStep = computed(() => this.currentStepIndex() === this.steps.length - 1);
  readonly completedRecords = this.stateService.stepRecords;

  // Condición de técnica activa: ambas manos detectadas + juntas + frotado activo
  readonly isTechniqueActive = computed(() => {
    return this.handsDetected() >= 2 && this.handsTogether() && this.handsRubbing();
  });

  // Aviso flotante sobre el video según la calidad de técnica
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

  // Porcentaje de progreso de técnica para el paso actual (0% a 100%)
  readonly techniqueProgressPercent = computed(() => {
    return Math.min(100, Math.round((this.currentSeconds() / 3.0) * 100));
  });

  // SVG circular timer config
  readonly radius = 52;
  readonly circumference = 2 * Math.PI * this.radius;

  // Computed visual circle offset (mapea 0 a 8 segundos al perímetro del círculo)
  readonly strokeDashoffset = computed(() => {
    const s = this.currentSeconds();
    const progress = Math.min(1, s / 8);
    return this.circumference * (1 - progress);
  });

  readonly formattedTime = computed(() => {
    const s = this.currentSeconds();
    return s.toFixed(1);
  });

  private timerInterval: any = null;
  private stream: MediaStream | null = null;
  private detector: HandLandmarker | null = null;
  private drawingUtils: DrawingUtils | null = null;
  private animationFrame: number | null = null;
  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

  // Variables biomecánicas para cálculo de delta de frotado y proximidad
  private previousKeyPoints: { x: number; y: number }[][] | null = null;
  private previousFrameAt: number | null = null;
  private smoothedMotion: number = 0;
  private effectiveSeconds: number = 0;

  ngOnInit(): void {
    if (!this.student()) {
      this.router.navigate(['/bienvenida']);
      return;
    }
    this.startStepTimer();
  }

  goToBienvenida(): void {
    this.router.navigate(['/bienvenida']);
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.stopCamera();
  }

  async startCamera(): Promise<void> {
    this.cameraLoading.set(true);
    this.cameraError.set('');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      const video = this.cameraVideo?.nativeElement;
      if (!video) throw new Error('Visor no disponible');
      video.srcObject = this.stream;
      await video.play();

      if (!this.detector) {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        this.detector = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });
      }

      // Detenemos el cronómetro por intervalo ciego para que la cámara gobierne el progreso
      this.stopTimer();
      this.cameraActive.set(true);
      this.detectHands();
    } catch (error) {
      this.releaseStream();
      this.cameraError.set(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Debes autorizar el permiso de acceso a la cámara.'
          : 'No fue posible iniciar la cámara en este dispositivo.'
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

  private detectHands(): void {
    const video = this.cameraVideo?.nativeElement;
    if (!video || !this.detector || !this.cameraActive()) return;

    // Solo procesar si el video tiene dimensiones nativas válidas
    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      const now = performance.now();
      const result = this.detector.detectForVideo(video, now);

      this.evaluateTechnique(result.landmarks, now);
      this.drawLandmarks(result.landmarks);
    }

    this.animationFrame = requestAnimationFrame(() => this.detectHands());
  }

  /**
   * Medición por Calidad de Técnica:
   * 1. Presencia de ambas manos (>= 2).
   * 2. Proximidad euclidiana entre muñecas (landmark 0).
   * 3. Delta de desplazamiento de puntas de dedos [4, 8, 12, 16, 20].
   * El cronómetro SOLO suma tiempo cuando se cumplen las tres condiciones.
   */
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
      return; // Progreso congelado
    }

    // b) Proximidad de manos: calcular distancia euclidiana entre muñecas (landmark 0)
    const wrist0 = landmarks[0][0];
    const wrist1 = landmarks[1][0];
    const wristDistance = Math.hypot(wrist0.x - wrist1.x, wrist0.y - wrist1.y);
    this.wristDistance.set(Math.round(wristDistance * 100) / 100);

    // Complementar con la distancia entre los centros de palma (muñeca 0 + base de dedo medio 9)
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
      return; // Progreso congelado
    }

    // c) Detección de frotado/movimiento: calcular delta de desplazamiento en puntas de dedos
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
    // Filtro exponencial para evitar falsos positivos por ruido
    this.smoothedMotion = this.smoothedMotion * 0.65 + avgMovement * 0.35;

    // Umbral de frotado activo por encima del temblor estático
    const isRubbing = this.smoothedMotion > 0.0035;
    this.handsRubbing.set(isRubbing);

    if (!isRubbing) {
      this.palmsFeedback.set(`⚠️ Frota activamente las manos.`);
      return; // Progreso congelado si las manos están quietas
    }

    // CONDICIÓN CUMPLIDA: Manos juntas y frotado continuo detectado
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
      this.palmsFeedback.set(`✓ ¡Excelente técnica y tiempo óptimo alcanzado (${roundedSeconds}s)!`);
    }

    // Avance automático al alcanzar técnica validada y tiempo óptimo (>= 3s)
    if (this.palmsValidated() && this.effectiveSeconds >= 3.0 && this.autoAdvanceTimer === null) {
      this.autoAdvanceTimer = setTimeout(() => this.finishCurrentStep(), 900);
    }
  }

  /**
   * Renderizado nítido sobre el <canvas> usando DrawingUtils:
   * - Dimensiones sincronizadas con videoWidth y videoHeight.
   * - Conectores turquesa #00B39F con lineWidth = 4.
   * - Puntos blancos con borde acento coral #FF6A4D y radio = 5.
   */
  private drawLandmarks(landmarks: { x: number; y: number }[][]): void {
    const canvas = this.handOverlay?.nativeElement;
    const video = this.cameraVideo?.nativeElement;
    if (!canvas || !video || !video.videoWidth || !video.videoHeight) return;

    // 1. Asegurar correspondencia exacta de resolución nativa para evitar desajustes
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
      // Dibujar 21 conexiones con DrawingUtils: turquesa #00B39F con lineWidth = 4
      this.drawingUtils.drawConnectors(hand as any, HandLandmarker.HAND_CONNECTIONS, {
        color: '#00B39F',
        lineWidth: 4,
      });

      // Dibujar los 21 landmarks: blanco con borde coral #FF6A4D, radio 5
      this.drawingUtils.drawLandmarks(hand as any, {
        color: '#FF6A4D',
        fillColor: '#FFFFFF',
        lineWidth: 2,
        radius: 5,
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

  private releaseStream(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    const video = this.cameraVideo?.nativeElement;
    if (video) video.srcObject = null;
  }

  private startStepTimer(): void {
    this.stopTimer();
    this.effectiveSeconds = 0;
    this.currentSeconds.set(0);
    this.resetBiomechanicalState();

    // Solo si la cámara está inactiva, mantener cronómetro manual como respaldo
    if (!this.cameraActive()) {
      const startTime = Date.now();
      this.timerInterval = setInterval(() => {
        const elapsedMs = Date.now() - startTime;
        this.effectiveSeconds = Math.round((elapsedMs / 1000) * 10) / 10;
        this.currentSeconds.set(this.effectiveSeconds);
      }, 100);
    }
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetCurrentStepTimer(): void {
    this.videoDemoError.set(false);
    this.startStepTimer();
  }

  onVideoDemoError(): void {
    this.videoDemoError.set(true);
  }

  completeStep(): void {
    this.finishCurrentStep();
  }

  private finishCurrentStep(): void {
    if (this.autoAdvanceTimer !== null) clearTimeout(this.autoAdvanceTimer);
    this.autoAdvanceTimer = null;
    const finalSeconds = Math.max(0.5, this.currentSeconds());
    const stepNum = this.currentStep().number;

    // Registrar paso en el estado global
    this.stateService.recordStepTime(stepNum, finalSeconds);

    if (this.isLastStep()) {
      this.stopTimer();
      this.router.navigate(['/resultado']);
    } else {
      this.currentStepIndex.update((idx) => idx + 1);
      this.videoDemoError.set(false);
      this.startStepTimer();
    }
  }
}
