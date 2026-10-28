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
    @keyframes waterRipple {
      0%, 100% { transform: translateY(0px) scale(1); opacity: 0.9; }
      50% { transform: translateY(4px) scale(1.05); opacity: 1; }
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
    .anim-water-ripple { animation: waterRipple 2s ease-in-out infinite; }
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

          <!-- 3. PREVIO DE APERTURA DE GRIFO (MODAL O TARJETA INTRODUCTORIA DE 5 SEGUNDOS) -->
          @if (mostrarFaseInicial()) {
            <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div class="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-teal-500/30 text-center relative overflow-hidden">
                <!-- Decoración ambiental -->
                <div class="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-[#00B39F]/15 blur-2xl pointer-events-none"></div>
                <div class="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-sky-500/15 blur-2xl pointer-events-none"></div>

                <!-- Ilustración / Animación de Apertura de Grifo y Aplicación de Jabón -->
                <div class="relative w-24 h-24 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-teal-50 to-sky-100 border border-teal-200/80 flex items-center justify-center shadow-inner">
                  <svg class="w-14 h-14 text-[#008072] anim-water-ripple" viewBox="0 0 64 64" fill="none">
                    <!-- Grifo hospitalario -->
                    <path d="M14 26H30C34.4183 26 38 29.5817 38 34V38" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                    <path d="M22 26V18M26 18H18" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
                    <path d="M10 22H14V30H10C8.89543 30 8 29.1046 8 28V24C8 22.8954 8.89543 22 10 22Z" fill="currentColor"/>
                    <!-- Chorro de agua corriente fluida -->
                    <path d="M38 38V48" stroke="#38BDF8" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="2 3" class="animate-pulse"/>
                    <!-- Gotas de agua y espuma antiséptica -->
                    <circle cx="34" cy="52" r="3" fill="#00B39F" class="animate-bounce"/>
                    <circle cx="43" cy="49" r="2.5" fill="#38BDF8" class="animate-ping"/>
                    <circle cx="38" cy="56" r="3.5" fill="#2DD4BF" opacity="0.8"/>
                    <!-- Manos en cuenco aséptico -->
                    <path d="M20 56C25 58 39 60 46 54" stroke="#0B2B29" stroke-width="3" stroke-linecap="round"/>
                  </svg>
                  <span class="absolute -top-1 -right-1 flex h-4 w-4">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-4 w-4 bg-[#00B39F]"></span>
                  </span>
                </div>

                <!-- Badge de Estado Inicial -->
                <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-3 shadow-xs">
                  <span class="w-2 h-2 rounded-full bg-[#00B39F] animate-pulse"></span>
                  <span>Fase Inicial • Protocolo Aséptico OMS</span>
                </div>

                <h2 class="font-heading text-2xl sm:text-3xl font-extrabold text-[#0B2B29] mb-3 leading-tight">
                  Humedece tus manos y aplica suficiente jabón
                </h2>

                <p class="text-sm text-slate-600 mb-6 leading-relaxed">
                  Antes de iniciar el frotado mecánico de los 6 pasos, abre el grifo con el codo, humedece completamente tus manos con agua corriente y dosifica de 3 a 5 ml de jabón o antiséptico para cubrir toda la superficie palmar.
                </p>

                <!-- Instrucciones Rápidas de Seguridad -->
                <div class="bg-slate-50 rounded-2xl p-4 mb-6 text-left border border-slate-200/80 text-xs space-y-2.5">
                  <div class="flex items-center gap-2.5 text-slate-700">
                    <span class="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">1</span>
                    <span>Abre el grifo regulando una temperatura agradable y caudal moderado.</span>
                  </div>
                  <div class="flex items-center gap-2.5 text-slate-700">
                    <span class="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">2</span>
                    <span>Moja ambas palmas, dorsos y muñecas sin sacudir.</span>
                  </div>
                  <div class="flex items-center gap-2.5 text-slate-700">
                    <span class="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">3</span>
                    <span>Presiona el dispensador para obtener suficiente espuma o antiséptico.</span>
                  </div>
                </div>

                <!-- Temporizador orientativo y Botón de Inicio Mecánico -->
                <div class="space-y-3">
                  <button
                    type="button"
                    (click)="iniciarFrotadoMecanico()"
                    class="w-full py-4 px-8 rounded-full bg-gradient-to-r from-[#00B39F] to-[#008072] hover:from-[#009988] hover:to-[#006e62] text-white font-extrabold text-base sm:text-lg shadow-xl shadow-teal-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <span>Iniciar Frotado Mecánico</span>
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <p class="text-[11px] text-slate-400 font-medium">
                    @if (segundosGrifo() > 0) {
                      Tiempo sugerido de preparación: <span class="font-bold text-teal-700">{{ segundosGrifo() }} segundos restantes</span>
                    } @else {
                      <span class="font-bold text-[#008072]">¡Listo para el paso 1! Pulsa para activar la cámara web.</span>
                    }
                  </p>
                </div>
              </div>
            </div>
          }

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

              <!-- Badge Objetivo de Tiempo y Acceso Directo a Evaluacion Practica -->
              <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00B39F]/10 border border-[#00B39F]/25 text-[#008072] text-xs font-bold shadow-xs">
                  <svg class="w-4 h-4 text-[#00B39F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Frotado Requerido: 3 a 8s</span>
                </div>

                <button
                  type="button"
                  (click)="irAEvaluacionPractica()"
                  class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md hover:shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
                >
                  <span>Ir a Evaluación Práctica</span>
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
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

          <!-- 1. ESTRUCTURA VISUAL SPLIT-SCREEN (GRID 2 COLUMNAS DE IGUAL JERARQUÍA) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

            <!-- PANEL IZQUIERDO: "Demostración Guía del Paso" -->
            <div class="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl border border-white/60 flex flex-col justify-between space-y-5 animate-fade-in">
              
              <!-- Encabezado del Panel Izquierdo -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-extrabold border border-teal-200/80 shadow-xs">
                    <span class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                    Demostración Guía del Paso
                  </span>
                  <span class="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    Paso Activo: <strong class="text-teal-700">{{ currentStepIndex() + 1 }}</strong> de 6
                  </span>
                </div>

                <h2 class="font-heading text-xl sm:text-2xl font-extrabold text-[#0B2B29] leading-tight">
                  {{ currentClinicalTitle() }}
                </h2>

                <p class="text-xs sm:text-sm text-slate-600 font-medium">
                  {{ currentStep().subtitle }}
                </p>
              </div>

              <!-- Contenedor con reproductor de video funcional (autoplay, loop, muted, playsinline) y fallback animado en bucle -->
              <div class="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-teal-500/30 shadow-2xl flex items-center justify-center group">
                <!-- Video Guía Clínico Real en bucle (Paso activo) -->
                <video
                  #demoVideo
                  *ngIf="!videoDemoError()"
                  [src]="videoUrl()"
                  (error)="onVideoDemoError()"
                  autoplay
                  loop
                  muted
                  playsinline
                  class="w-full h-full object-cover rounded-2xl"
                ></video>

                <!-- Fallback Animado Biomecánico en Bucle (Técnica OMS) para que NUNCA quede como imagen estática -->
                <div *ngIf="videoDemoError()" class="relative w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
                  <div class="absolute inset-0 bg-[#00B39F]/5 pointer-events-none"></div>

                  <!-- Elemento ilustrativo animado con keyframes biomecánicos en bucle continuo -->
                  <div class="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56">
                    <img
                      [src]="svgFallbackUrl()"
                      [alt]="currentClinicalTitle()"
                      class="max-h-full max-w-full object-contain filter drop-shadow-2xl transition-transform duration-700"
                      [ngClass]="{
                        'anim-rub-palms-left': currentStepIndex() === 0,
                        'anim-rub-dorsal-top': currentStepIndex() === 1,
                        'anim-rub-interdigital-left': currentStepIndex() === 2,
                        'anim-rub-hook-lock': currentStepIndex() === 3,
                        'anim-rub-thumb-fist': currentStepIndex() === 4,
                        'anim-rub-nails-cluster': currentStepIndex() === 5
                      }"
                    />
                  </div>

                  <!-- Subtítulo inferior dinámico -->
                  <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none px-2">
                    <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-teal-500/50 text-[10px] sm:text-xs font-bold text-teal-300 backdrop-blur-md shadow-lg">
                      <span class="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                      <span>Demostración Animada en Bucle • OMS</span>
                    </div>
                    <span class="text-[10px] text-slate-300 font-bold bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                      Paso {{ currentStepIndex() + 1 }} de 6
                    </span>
                  </div>
                </div>

                <!-- Badge flotante superior con estado del reproductor -->
                <div class="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-teal-500/30 text-[11px] font-bold text-teal-300">
                  <svg class="w-3.5 h-3.5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <span>Video Demostrativo Clínico OMS</span>
                </div>
              </div>

              <!-- Breve indicación de técnica y clave clínica -->
              <div class="space-y-3">
                <div class="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200/80 text-slate-800 text-xs sm:text-sm">
                  <div class="flex items-start gap-2.5">
                    <div class="w-6 h-6 rounded-lg bg-[#00B39F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <span class="font-extrabold text-teal-900">Indicación de Técnica: </span>
                      <span class="text-slate-700 font-medium">{{ currentTechniqueInstruction() }}</span>
                    </div>
                  </div>
                </div>

                <!-- Relevancia Clínica -->
                <div class="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700">
                  <div class="w-5 h-5 rounded-md bg-slate-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span class="font-bold text-slate-900">Objetivo Clínico: </span>
                    <span>{{ currentStep().clinicalKey }}</span>
                  </div>
                </div>
              </div>

              <!-- Cronómetro visual circular y tiempo de fricción -->
              <div class="flex items-center justify-around pt-2 border-t border-slate-100">
                <!-- Círculo SVG -->
                <div class="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
                  <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" class="text-slate-100" stroke-width="8" stroke="currentColor" fill="transparent" />
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
                  <div class="absolute flex flex-col items-center justify-center text-center">
                    <div class="font-heading text-2xl sm:text-3xl font-black tracking-tight text-[#0B2B29]">
                      {{ formattedTime() }}s
                    </div>
                    <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Fricción
                    </span>
                  </div>
                </div>

                <!-- Indicador de Ritmo OMS y Botón Reinicio -->
                <div class="flex flex-col items-start gap-2 max-w-[210px]">
                  <span class="text-[11px] font-bold text-slate-500">Ritmo de Fricción OMS:</span>
                  <div
                    class="text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-xs"
                    [ngClass]="{
                      'bg-[#FFE9DE] text-[#FF6A4D] border-[#FF6A4D]/30': currentSeconds() < 3.0,
                      'bg-[#CFFBF0] text-[#008072] border-[#00B39F]/40 animate-pulse': currentSeconds() >= 3.0 && currentSeconds() <= 8.0,
                      'bg-amber-100 text-amber-800 border-amber-300': currentSeconds() > 8.0
                    }"
                  >
                    @if (currentSeconds() < 3.0) {
                      <span>Fricción Insuficiente (&lt;3s)</span>
                    } @else if (currentSeconds() <= 8.0) {
                      <span>✓ Rango Óptimo OMS (3-8s)</span>
                    } @else {
                      <span>Tiempo Extenso (&gt;8s)</span>
                    }
                  </div>

                  <button
                    type="button"
                    (click)="resetCurrentStepTimer()"
                    class="px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-600 hover:text-[#0B2B29] bg-white border border-slate-200 hover:border-slate-300 shadow-xs flex items-center gap-1.5 cursor-pointer mt-1"
                  >
                    <svg class="w-3 h-3 text-[#00B39F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Reiniciar cronómetro</span>
                  </button>
                </div>
              </div>

            </div>

            <!-- PANEL DERECHO: "Tu Ejecución en Vivo" -->
            <div class="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl border border-white/60 flex flex-col justify-between space-y-4 animate-fade-in">

              <!-- Encabezado del Panel Derecho -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200/80 shadow-xs">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Tu Ejecución en Vivo
                  </span>
                  <span class="text-xs font-semibold text-slate-500 hidden sm:inline">
                    Tracking MediaPipe AI
                  </span>
                </div>

                <!-- Indicador de detección de ambas manos -->
                <div
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 border shadow-xs"
                  [ngClass]="handsDetected() >= 2
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-[#FFE9DE] text-[#FF6A4D] border-[#FF6A4D]/40'"
                >
                  <span
                    class="w-2 h-2 rounded-full"
                    [ngClass]="handsDetected() >= 2 ? 'bg-emerald-500 animate-pulse' : 'bg-[#FF6A4D]'"
                  ></span>
                  <span>Manos detectadas: {{ handsDetected() }}/2</span>
                </div>
              </div>

              <!-- Contenedor del Feed de Cámara Web Amplio con Canvas Superpuesto -->
              <div class="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/60 flex items-center justify-center group">
                
                <!-- Video Stream con inversión de espejo -->
                <video
                  #cameraVideo
                  autoplay
                  muted
                  playsinline
                  class="w-full h-full object-cover scale-x-[-1]"
                ></video>

                <!-- Canvas de Detección MediaPipe con dimensiones nativas y scale-x-[-1] -->
                <canvas
                  #handOverlay
                  class="absolute inset-0 w-full h-full pointer-events-none z-10 scale-x-[-1] object-cover"
                ></canvas>

                <!-- Overlay cuando la cámara está inactiva -->
                @if (!cameraActive()) {
                  <div class="absolute inset-0 z-20 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
                    <div class="w-14 h-14 rounded-2xl bg-teal-500/20 text-[#00B39F] border border-teal-500/30 flex items-center justify-center mb-3">
                      <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 class="font-extrabold text-base mb-1">Cámara en Espera</h4>
                    <p class="text-xs text-slate-300 max-w-xs mb-4">
                      Ubica tus manos frente a la cámara para que MediaPipe detecte los 21 puntos articulares.
                    </p>
                    <button
                      type="button"
                      (click)="iniciarCamara()"
                      [disabled]="cameraLoading()"
                      class="px-5 py-2.5 rounded-full bg-[#00B39F] hover:bg-[#009988] text-white font-bold text-xs shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      @if (cameraLoading()) {
                        <span>Iniciando Visor...</span>
                      } @else {
                        <span>Activar Cámara</span>
                      }
                    </button>
                  </div>
                }

                <!-- Badges Flotantes Dentro de la Cámara -->
                @if (cameraActive()) {
                  <!-- Top Left: Indicador del paso en vivo -->
                  <div class="absolute top-3 left-3 z-20">
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-md">
                      <span class="w-5 h-5 rounded-full bg-[#00B39F] text-white text-[11px] font-black flex items-center justify-center">
                        {{ currentStepIndex() + 1 }}
                      </span>
                      <span>En vivo: {{ currentStep().title }}</span>
                    </div>
                  </div>

                  <!-- Top Right: Feedback de Alineación / Frotado -->
                  <div class="absolute top-3 right-3 z-20 flex items-center gap-2">
                    @if (handsTogether() && handsRubbing()) {
                      <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white text-xs font-extrabold shadow-md backdrop-blur-md animate-pulse">
                        <span class="w-2 h-2 rounded-full bg-white"></span>
                        <span>Alineación correcta</span>
                      </div>
                    } @else if (handsDetected() >= 2) {
                      <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 text-white text-xs font-bold shadow-md backdrop-blur-md">
                        <span>Manos juntas requeridas</span>
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

                  <!-- Alerta flotante central cuando la técnica se detiene -->
                  @if (activeAlert()) {
                    <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none z-25 px-4 animate-fade-in">
                      <div
                        class="px-5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-2xl border-2 border-white/60 backdrop-blur-md flex items-center gap-2 transition-all transform scale-105"
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

              <!-- Barra de progreso del paso actual y porcentaje -->
              <div class="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-[#0B2B29]">Progreso de Fricción:</span>
                    <span class="text-slate-500 font-semibold">{{ formattedTime() }}s / 3.0s objetivo</span>
                  </div>
                  <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-xs"
                    [ngClass]="palmsValidated() ? 'bg-emerald-100 text-emerald-800' : isTechniqueActive() ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'">
                    <span>{{ techniqueProgressPercent() }}%</span>
                  </div>
                </div>

                <!-- Barra lineal de progreso -->
                <div class="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    [ngClass]="palmsValidated() ? 'bg-gradient-to-r from-emerald-400 to-[#00B39F]' : isTechniqueActive() ? 'bg-gradient-to-r from-[#00B39F] to-emerald-400' : 'bg-[#FF6A4D]/80'"
                    [style.width.%]="techniqueProgressPercent()"
                  ></div>
                </div>

                <!-- Feedback textual en vivo -->
                <p class="text-xs text-slate-600 font-medium truncate pt-0.5">
                  {{ palmsFeedback() }}
                </p>
              </div>

              <!-- Botones de Acción de la Cámara / Paso -->
              <div class="pt-1">
                <button
                  type="button"
                  (click)="completeStep()"
                  [disabled]="cameraActive() && !palmsValidated()"
                  class="w-full py-3.5 px-6 rounded-full font-extrabold text-sm sm:text-base text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
                  [ngClass]="cameraActive() && !palmsValidated()
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-[#00B39F] hover:bg-[#009988] hover:shadow-[#00B39F]/30 hover:scale-[1.01] active:scale-[0.99]'"
                >
                  <span>
                    @if (cameraActive() && !palmsValidated()) {
                      Frotando frente a la cámara...
                    } @else if (isLastStep()) {
                      Ir a Evaluación Práctica
                    } @else {
                      Avanzar al Siguiente Paso
                    }
                  </span>
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
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
  readonly usingFallbackVideo = signal(false);

  // Previo de Apertura de Grifo
  readonly mostrarFaseInicial = signal(true);
  readonly segundosGrifo = signal(5);
  private grifoInterval: any = null;

  // URLs remotas de fallback directo para los 6 pasos OMS (contingencia garantizada)
  readonly fallbackVideoUrls: string[] = [
    'https://upload.wikimedia.org/wikipedia/commons/8/89/Clean_hands_short.webm',
    'https://upload.wikimedia.org/wikipedia/commons/6/60/20200303_-_SFGovTV_-_SFDPH_WASH_HANDS_SPANISH.webm',
    'https://upload.wikimedia.org/wikipedia/commons/6/60/20200303_-_SFGovTV_-_SFDPH_WASH_HANDS_SPANISH.webm',
    'https://upload.wikimedia.org/wikipedia/commons/6/60/20200303_-_SFGovTV_-_SFDPH_WASH_HANDS_SPANISH.webm',
    'https://upload.wikimedia.org/wikipedia/commons/8/89/Clean_hands_short.webm',
    'https://upload.wikimedia.org/wikipedia/commons/8/89/Clean_hands_short.webm',
  ];

  // 2. SINCRONIZACIÓN DINÁMICA DEL RECURSO GUÍA
  readonly videoUrl = computed(() => {
    const idx = this.currentStepIndex();
    if (this.usingFallbackVideo()) {
      return this.fallbackVideoUrls[idx] || `assets/videos/paso${idx + 1}.mp4`;
    }
    return `assets/videos/paso${idx + 1}.mp4`;
  });
  readonly svgFallbackUrl = computed(() => `assets/images/pasos/paso-${this.currentStepIndex() + 1}.svg`);

  readonly clinicalTitles: string[] = [
    'Paso 1: Frotar palmas entre sí',
    'Paso 2: Palma derecha sobre dorso izquierdo y viceversa',
    'Paso 3: Frotar palmas con dedos entrelazados',
    'Paso 4: Frotar dorso de dedos contra la palma opuesta',
    'Paso 5: Frotación rotacional de los pulgares',
    'Paso 6: Frotado concéntrico de yemas y uñas sobre la palma',
  ];

  readonly techniqueInstructions: string[] = [
    'Realiza movimientos circulares constantes cubriendo toda la superficie palmar.',
    'Frota firmemente la palma sobre el dorso de la otra mano entrelazando los dedos, luego alterna.',
    'Mantén las palmas enfrentadas y desliza los dedos entrelazados de la base a las puntas.',
    'Traba los dedos en gancho contra la palma opuesta realizando un movimiento de vaivén horizontal.',
    'Rodea el pulgar con la palma opuesta y realiza giros completos de 360 grados en rotación.',
    'Agrupa las yemas de los dedos sobre la palma cóncava opuesta con movimientos circulares en espiral.',
  ];

  readonly currentClinicalTitle = computed(() => {
    return this.clinicalTitles[this.currentStepIndex()] || this.currentStep().title;
  });

  readonly currentTechniqueInstruction = computed(() => {
    return this.techniqueInstructions[this.currentStepIndex()] || this.currentStep().description;
  });

  // Alias compatibles
  get camaraActiva(): boolean {
    return this.cameraActive();
  }

  iniciarCamara(): Promise<void> {
    return this.startCamera();
  }

  @ViewChild('demoVideo') private demoVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('cameraVideo') private cameraVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('handOverlay') private handOverlay?: ElementRef<HTMLCanvasElement>;

  readonly currentStep = computed<HandwashStep>(() => this.steps[this.currentStepIndex()]);
  readonly pasoActual = computed<HandwashStep>(() => this.steps[this.currentStepIndex()]);
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
    // Iniciar cuenta regresiva orientativa de apertura de grifo (5 segundos)
    this.mostrarFaseInicial.set(true);
    this.segundosGrifo.set(5);
    this.iniciarCuentaRegresivaGrifo();
  }

  private iniciarCuentaRegresivaGrifo(): void {
    if (this.grifoInterval) clearInterval(this.grifoInterval);
    this.grifoInterval = setInterval(() => {
      const act = this.segundosGrifo();
      if (act > 0) {
        this.segundosGrifo.set(act - 1);
      } else {
        clearInterval(this.grifoInterval);
        this.grifoInterval = null;
      }
    }, 1000);
  }

  iniciarFrotadoMecanico(): void {
    if (this.grifoInterval) {
      clearInterval(this.grifoInterval);
      this.grifoInterval = null;
    }
    this.mostrarFaseInicial.set(false);
    this.startStepTimer();
    this.startCamera();
  }

  goToBienvenida(): void {
    this.router.navigate(['/bienvenida']);
  }

  ngOnDestroy(): void {
    if (this.grifoInterval) {
      clearInterval(this.grifoInterval);
      this.grifoInterval = null;
    }
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

    // b) Proximidad de manos: distancia euclidiana entre muñecas (0) y centro de palmas
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
        lineWidth: 4,
      });

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
    this.usingFallbackVideo.set(false);
    this.videoDemoError.set(false);
    this.recargarVideoDemostrativo();
    this.startStepTimer();
  }

  onVideoDemoError(): void {
    if (!this.usingFallbackVideo()) {
      this.usingFallbackVideo.set(true);
      this.recargarVideoDemostrativo();
    } else {
      this.videoDemoError.set(true);
    }
  }

  private recargarVideoDemostrativo(): void {
    setTimeout(() => {
      const v = this.demoVideo?.nativeElement;
      if (v) {
        v.load();
        v.play().catch(() => {});
      }
    }, 60);
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
      this.stopCamera();
      this.router.navigate(['/evaluacion-practica']);
    } else {
      this.currentStepIndex.update((idx) => idx + 1);
      this.usingFallbackVideo.set(false);
      this.videoDemoError.set(false);
      this.recargarVideoDemostrativo();
      this.startStepTimer();
    }
  }

  irAEvaluacionPractica(): void {
    this.stopTimer();
    this.stopCamera();
    this.router.navigate(['/evaluacion-practica']);
  }
}
