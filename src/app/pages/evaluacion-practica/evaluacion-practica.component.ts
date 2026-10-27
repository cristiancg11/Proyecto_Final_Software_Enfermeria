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
import { HandwashStep, StepTimeRecord } from '../../core/models/handwash.models';

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
    <div class="min-h-screen py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#08151D] via-[#0E2428] to-[#081E1C] text-slate-100 relative overflow-hidden">
      <!-- Glows y Efectos Ambientales -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00B39F]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#50E7FF]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

      <div class="max-w-5xl mx-auto relative z-10">

        <!-- 1. ENCABEZADO: EVALUACIÓN PRÁCTICA DE TÉCNICA BIOMECÁNICA -->
        <div class="bg-gradient-to-r from-[#0d1e26] via-[#10292f] to-[#0c2420] rounded-3xl p-5 sm:p-7 border border-[#00B39F]/30 shadow-2xl mb-6 relative overflow-hidden animate-fade-in">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div class="flex items-start sm:items-center gap-3.5">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00B39F] to-[#50E7FF] text-[#080B10] flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                <svg class="w-6 h-6 text-[#080B10]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.3" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <!-- BADGE SOLICITADO: MODO AUTÓNOMO -->
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/40 shadow-xs">
                    <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    <span>Modo Autónomo • Sin Asistencia Visual</span>
                  </span>

                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B39F]/20 text-[#50E7FF] text-xs font-bold border border-[#00B39F]/30">
                    <span>Fase 4 • Protocolo Biomecánico OMS</span>
                  </span>
                </div>

                <h1 class="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                  Evaluación Práctica de Técnica Biomecánica
                </h1>

                <p class="text-xs sm:text-sm text-[#A5C2DE] mt-1">
                  Estudiante: <strong class="text-white">{{ studentName() }}</strong>
                  <span class="mx-1.5 text-slate-500">•</span>
                  Código: <span class="font-mono text-[#50E7FF]">{{ studentCode() }}</span>
                </p>
              </div>
            </div>

            <!-- Botón Volver a Práctica Asistida si requiere repasar -->
            <div class="flex items-center gap-2 self-start md:self-auto">
              <a
                routerLink="/practica"
                (click)="stopCamera()"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-bold transition border border-white/15"
                title="Volver a la práctica guiada con video"
              >
                <svg class="w-4 h-4 text-[#50E7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Práctica con Video</span>
              </a>
            </div>

          </div>
        </div>

        @if (!evaluacionFinalizada()) {

          <!-- 2. STEPPER SUPERIOR DE LOS 6 PASOS OMS -->
          <div class="bg-gradient-to-r from-[#0d1e26] via-[#10292f] to-[#0c2420] rounded-3xl p-4 sm:p-6 mb-6 shadow-xl border border-white/10 animate-fade-in">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span class="text-[11px] font-bold text-[#50E7FF] uppercase tracking-wider block">
                  Paso Requerido {{ currentStepIndex() + 1 }} de 6
                </span>
                <h2 class="font-heading text-lg sm:text-xl font-black text-white">
                  {{ currentClinicalTitle() }}
                </h2>
              </div>

              <!-- Indicador de Tiempo Objetivo OMS -->
              <div class="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00B39F]/15 border border-[#00B39F]/30 text-[#50E7FF] text-xs font-bold">
                <svg class="w-4 h-4 text-[#00B39F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Fricción requerida: Mínimo 3.0s (Óptimo 3-8s)</span>
              </div>
            </div>

            <!-- Stepper visual de 6 pasos -->
            <div class="grid grid-cols-6 gap-2 sm:gap-4 items-center">
              @for (step of steps; track step.number; let idx = $index) {
                <div class="flex flex-col items-center gap-1.5 text-center">
                  <div
                    class="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-md"
                    [ngClass]="{
                      'bg-gradient-to-r from-[#00B39F] to-[#50E7FF] text-[#080B10] ring-4 ring-[#50E7FF]/30 scale-110 shadow-[#50E7FF]/40': idx === currentStepIndex(),
                      'bg-emerald-500 text-white': idx < currentStepIndex(),
                      'bg-white/10 text-slate-400 border border-white/10': idx > currentStepIndex()
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
                    [ngClass]="idx === currentStepIndex() ? 'text-[#50E7FF]' : idx < currentStepIndex() ? 'text-white' : 'text-slate-400'"
                  >
                    {{ step.title }}
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- 3. PANTALLA CENTRADA CON EL FEED DE CÁMARA AMPLIO Y PROMINENTE (SIN VIDEO GUÍA) -->
          <div class="bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/15 relative overflow-hidden animate-fade-in mb-6">
            
            <!-- Barra Superior Interna del Visor -->
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <!-- Indicador del Paso Activo -->
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-[#00B39F] animate-ping"></span>
                <span class="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  {{ currentStep().title }}
                </span>
                <span class="text-xs text-slate-400 hidden sm:inline">• {{ currentStep().subtitle }}</span>
              </div>

              <!-- Feedback discreto de detección de manos con MediaPipe -->
              <div class="flex items-center gap-2">
                <div
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300"
                  [ngClass]="handsDetected() >= 2
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-[#FF6A4D]/20 text-[#FF6A4D] border-[#FF6A4D]/40'"
                >
                  <span
                    class="w-2 h-2 rounded-full"
                    [ngClass]="handsDetected() >= 2 ? 'bg-emerald-400 animate-pulse' : 'bg-[#FF6A4D]'"
                  ></span>
                  <span>MediaPipe: {{ handsDetected() }}/2 Manos</span>
                </div>

                @if (handsTogether() && handsRubbing()) {
                  <span class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#50E7FF]/20 text-[#50E7FF] text-xs font-bold border border-[#50E7FF]/40 animate-pulse">
                    <span>Frotado Activo ✓</span>
                  </span>
                }
              </div>
            </div>

            <!-- Contenedor del Feed de Cámara Web Individual Grande y Centrado -->
            <div class="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[580px] bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 flex items-center justify-center group mx-auto">
              
              <!-- Video Stream con efecto espejo -->
              <video
                #cameraVideo
                autoplay
                muted
                playsinline
                class="w-full h-full object-cover scale-x-[-1]"
              ></video>

              <!-- Canvas Superpuesto para Dibujo de MediaPipe AI -->
              <canvas
                #handOverlay
                class="absolute inset-0 w-full h-full pointer-events-none z-10 scale-x-[-1] object-cover"
              ></canvas>

              <!-- Overlay cuando la cámara aún no ha sido encendida -->
              @if (!cameraActive()) {
                <div class="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
                  <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#00B39F]/20 to-[#50E7FF]/20 text-[#50E7FF] border border-[#50E7FF]/30 flex items-center justify-center mb-4 shadow-xl">
                    <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 class="font-black text-xl mb-1 text-white">Iniciar Cámara para Evaluación Autónoma</h3>
                  <p class="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
                    Colócate frente a la cámara web con las manos visibles. MediaPipe evaluará tu biomecánica sin guía visual, simulando una evaluación hospitalaria real.
                  </p>
                  <button
                    type="button"
                    (click)="startCamera()"
                    [disabled]="cameraLoading()"
                    class="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#00B39F] via-[#50E7FF] to-[#D9FF43] hover:brightness-110 text-[#080B10] font-black text-sm shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    @if (cameraLoading()) {
                      <span>Calibrando Visor MediaPipe...</span>
                    } @else {
                      <span>Activar Cámara y Comenzar</span>
                    }
                  </button>
                  @if (cameraError()) {
                    <p class="text-xs text-[#FF6A4D] font-bold mt-3 max-w-sm">{{ cameraError() }}</p>
                  }
                </div>
              }

              <!-- Badges Flotantes Dentro de la Cámara (FEEDBACK DISCRETO) -->
              @if (cameraActive()) {
                <!-- Top Left: Indicador del paso en vivo -->
                <div class="absolute top-3 left-3 z-20">
                  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-md">
                    <span class="w-5 h-5 rounded-full bg-[#00B39F] text-white text-[11px] font-black flex items-center justify-center">
                      {{ currentStepIndex() + 1 }}
                    </span>
                    <span>Modo Autónomo: {{ currentStep().title }}</span>
                  </div>
                </div>

                <!-- Top Right: Feedback de Alineación / Frotado -->
                <div class="absolute top-3 right-3 z-20 flex items-center gap-2">
                  @if (handsTogether() && handsRubbing()) {
                    <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white text-xs font-extrabold shadow-md backdrop-blur-md animate-pulse">
                      <span class="w-2 h-2 rounded-full bg-white"></span>
                      <span>Fricción biomecánica detectada</span>
                    </div>
                  } @else if (handsDetected() >= 2) {
                    <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 text-white text-xs font-bold shadow-md backdrop-blur-md">
                      <span>Junta las manos para frotar</span>
                    </div>
                  }

                  <button
                    type="button"
                    (click)="stopCamera()"
                    class="p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer"
                    title="Pausar Cámara"
                  >
                    <svg class="w-3.5 h-3.5 text-[#FF6A4D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                </div>

                <!-- Alerta flotante central discreta cuando la técnica se detiene -->
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

            <!-- 4. CONTADOR Y BARRA DE PROGRESO DEL TIEMPO DE FRICCIÓN REQUERIDO -->
            <div class="mt-5 bg-black/40 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                
                <div class="flex items-center gap-3">
                  <div class="font-heading text-3xl sm:text-4xl font-black tracking-tight"
                    [ngClass]="{
                      'text-[#FF6A4D]': currentSeconds() < 3.0,
                      'text-[#50E7FF]': currentSeconds() >= 3.0 && currentSeconds() <= 8.0,
                      'text-amber-400': currentSeconds() > 8.0
                    }"
                  >
                    {{ formattedTime() }}s
                  </div>
                  <div>
                    <span class="font-extrabold text-white block">Tiempo de Fricción Continuo</span>
                    <span class="text-slate-400 text-[11px]">
                      Objetivo mínimo: <strong class="text-[#50E7FF]">3.0s</strong> • Rango óptimo OMS: <strong class="text-white">3 a 8s</strong>
                    </span>
                  </div>
                </div>

                <!-- Badge de Estado de Ritmo OMS -->
                <div class="flex items-center gap-2">
                  <div
                    class="text-[11px] font-extrabold px-3 py-1.5 rounded-full border shadow-xs"
                    [ngClass]="{
                      'bg-[#FF6A4D]/20 text-[#FF6A4D] border-[#FF6A4D]/40': currentSeconds() < 3.0,
                      'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse': currentSeconds() >= 3.0 && currentSeconds() <= 8.0,
                      'bg-amber-500/20 text-amber-300 border-amber-500/40': currentSeconds() > 8.0
                    }"
                  >
                    @if (currentSeconds() < 3.0) {
                      <span>Fricción Insuficiente (&lt;3.0s)</span>
                    } @else if (currentSeconds() <= 8.0) {
                      <span>✓ Rango Óptimo OMS (3 a 8s)</span>
                    } @else {
                      <span>Tiempo Extenso (&gt;8.0s)</span>
                    }
                  </div>

                  <span class="px-2.5 py-1 rounded-full bg-white/10 text-white font-mono text-xs font-bold border border-white/10">
                    {{ techniqueProgressPercent() }}%
                  </span>
                </div>

              </div>

              <!-- Barra de Progreso Lineal con Gradiente -->
              <div class="w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
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
              <div class="flex items-center justify-between text-xs text-slate-300 pt-1">
                <p class="truncate font-medium">
                  {{ palmsFeedback() }}
                </p>

                <button
                  type="button"
                  (click)="resetCurrentStepTimer()"
                  class="text-[11px] font-bold text-slate-400 hover:text-[#50E7FF] transition flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reiniciar Cronómetro</span>
                </button>
              </div>

            </div>

            <!-- Botón de Acción para Avanzar o Confirmar el Paso -->
            <div class="mt-5">
              <button
                type="button"
                (click)="completeStep()"
                [disabled]="cameraActive() && !palmsValidated()"
                class="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
                [ngClass]="cameraActive() && !palmsValidated()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-white/5'
                  : 'bg-gradient-to-r from-[#00B39F] via-[#009988] to-[#008072] hover:brightness-110 shadow-teal-500/20 active:scale-[0.99]'"
              >
                <span>
                  @if (cameraActive() && !palmsValidated()) {
                    Frotando de forma autónoma... (Mínimo 3.0s requeridos)
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
          @if (completedRecords().length > 0) {
            <div class="bg-gradient-to-r from-[#0d1e26] via-[#10292f] to-[#0c2420] rounded-3xl p-5 border border-white/10 shadow-xl animate-fade-in">
              <div class="flex items-center gap-2 mb-3">
                <span class="w-2.5 h-2.5 rounded-full bg-[#50E7FF]"></span>
                <h3 class="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  Tiempos Registrados en Evaluación Autónoma
                </h3>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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

              <!-- BOTÓN SOLICITADO: CONTINUAR A EVALUACIÓN TEÓRICA -->
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
    this.startStepTimer();
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
    this.startStepTimer();
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
    this.startStepTimer();
    this.startCamera();
  }

  continuarAEvaluacionTeorica(): void {
    this.router.navigate(['/evaluacion-teorica']);
  }
}
