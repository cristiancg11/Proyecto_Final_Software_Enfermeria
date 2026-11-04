import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HandwashStateService } from '../../core/services/handwash-state.service';
import { AuthService } from '../../services/auth.service';
import { EncuestaService } from '../../services/encuesta.service';

interface StarFeedback {
  valor: number;
  titulo: string;
  subtitulo: string;
  emoji: string;
}

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen py-6 sm:py-10 md:py-12 px-3 sm:px-6 lg:px-8 bg-gradient-to-br from-[#08151D] via-[#0E2428] to-[#081E1C] text-slate-100 relative overflow-hidden">
      <!-- Glows y Efectos Ambientales Asépticos -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00B39F]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#50E7FF]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

      <div class="max-w-4xl mx-auto relative z-10">

        <!-- 1. ENCABEZADO DE LA RETROALIMENTACIÓN -->
        <div class="bg-gradient-to-r from-[#0d1e26] via-[#10292f] to-[#0c2420] rounded-3xl p-5 sm:p-8 border border-[#00B39F]/30 shadow-2xl mb-6 sm:mb-8 relative overflow-hidden animate-fade-in">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-start sm:items-center gap-3.5">
              <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#00B39F] via-[#50E7FF] to-[#D9FF43] p-1 shadow-lg shrink-0">
                <div class="w-full h-full bg-[#080B10] rounded-[14px] flex items-center justify-center text-[#50E7FF]">
                  <svg class="w-6 h-6 sm:w-7 sm:h-7 text-[#50E7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>

              <div>
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00B39F]/20 text-[#50E7FF] text-xs font-bold mb-1.5 border border-[#00B39F]/30 shadow-xs">
                  <span class="w-2 h-2 rounded-full bg-[#50E7FF] animate-pulse"></span>
                  <span>Fase 6 • Calificación y Retroalimentación Final</span>
                </div>
                <h1 class="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                  Calificación y Opinión de la Plataforma
                </h1>
                <p class="text-xs sm:text-sm text-[#A5C2DE] mt-0.5">
                  Estudiante: <strong class="text-white">{{ studentName() }}</strong>
                  <span class="mx-1.5 text-slate-500">•</span>
                  Código: <span class="font-mono text-[#50E7FF]">{{ studentCode() }}</span>
                </p>
              </div>
            </div>

            <!-- Progreso de llenado -->
            <div class="bg-black/40 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-white/10 self-start md:self-auto flex items-center gap-3">
              <div class="text-right">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Completitud</span>
                <span class="text-xs sm:text-sm font-black text-[#50E7FF]">
                  {{ totalContestadas() }} de 4 dimensiones
                </span>
              </div>
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#00B39F]/20 text-[#50E7FF] font-black text-xs flex items-center justify-center border border-[#00B39F]/40">
                {{ porcentajeCompletado() }}%
              </div>
            </div>
          </div>

          <p class="text-xs sm:text-sm text-[#C5D7E8] mt-3.5 pt-3.5 border-t border-white/10 leading-relaxed">
            Tu opinión es fundamental para la investigación docente y el perfeccionamiento continuo de la simulación clínica en la Facultad de Enfermería. Califica tu experiencia general con "Manos Seguras" antes de emitir tu certificado.
          </p>
        </div>

        <!-- 2. SECCIÓN PRINCIPAL: CALIFICACIÓN GENERAL POR ESTRELLAS (1 A 5) -->
        <div class="bg-gradient-to-br from-[#0c2027] via-[#10292f] to-[#0a1e20] rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/30 mb-6 sm:mb-8 text-center relative overflow-hidden animate-fade-in">
          <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none"></div>

          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
            <span>⭐ Calificación General</span>
          </span>

          <h2 class="text-lg sm:text-2xl font-black text-white mb-1">
            ¿Cómo calificas tu experiencia general con Manos Seguras?
          </h2>
          <p class="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mb-5">
            Toca las estrellas para calificar tu nivel de satisfacción general con la plataforma de aprendizaje y simulación.
          </p>

          <!-- Componente Interactivo de 5 Estrellas Grandes -->
          <div class="flex items-center justify-center gap-2 sm:gap-4 my-2">
            @for (star of [1, 2, 3, 4, 5]; track star) {
              <button
                type="button"
                (click)="seleccionarEstrellasGeneral(star)"
                (mouseenter)="hoverEstrellas.set(star)"
                (mouseleave)="hoverEstrellas.set(null)"
                class="p-1 sm:p-2 transition-all transform hover:scale-125 active:scale-95 cursor-pointer focus:outline-none"
                [attr.aria-label]="'Calificar ' + star + ' estrellas'"
              >
                <svg
                  class="w-10 h-10 sm:w-14 sm:h-14 transition-colors duration-200"
                  [ngClass]="(hoverEstrellas() !== null ? hoverEstrellas()! >= star : estrellasGeneral() >= star)
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                    : 'text-slate-600 fill-slate-800 hover:text-slate-400'"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            }
          </div>

          <!-- Mensaje Dinámico del Feedback de Estrellas -->
          <div class="min-h-[50px] flex flex-col items-center justify-center mt-2">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs sm:text-sm font-extrabold shadow-sm animate-fade-in">
              <span class="text-base sm:text-lg">{{ feedbackEstrellasActual().emoji }}</span>
              <span class="text-amber-300">{{ estrellasGeneral() }}/5 Estrellas:</span>
              <span>{{ feedbackEstrellasActual().titulo }}</span>
            </div>
            <p class="text-[11px] sm:text-xs text-slate-400 mt-1">
              {{ feedbackEstrellasActual().subtitulo }}
            </p>
          </div>
        </div>

        <!-- 3. DETALLE DE SATISFACCIÓN POR DIMENSIÓN CLÍNICA (4 TARJETAS INTERACTIVAS) -->
        <div class="space-y-4 sm:space-y-5 mb-6 sm:mb-8">

          <!-- DIMENSIÓN 1: NAVEGACIÓN Y FACILIDAD DE USO -->
          <div class="bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-3xl p-5 sm:p-6 shadow-xl border border-white/15 hover:border-[#00B39F]/40 transition duration-300">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-2.5">
                <span class="w-7 h-7 rounded-xl bg-[#00B39F] text-[#080B10] font-black text-xs flex items-center justify-center">1</span>
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-white">
                    Facilidad de Uso y Navegación
                  </h3>
                  <p class="text-[11px] text-slate-400">
                    Transiciones entre módulos, fluidez y diseño intuitivo.
                  </p>
                </div>
              </div>

              <!-- Puntuación seleccionada -->
              <div class="flex items-center gap-1 self-start sm:self-auto">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <button
                    type="button"
                    (click)="facilidadUso.set(star)"
                    class="p-1 cursor-pointer focus:outline-none transition transform hover:scale-120"
                    [attr.aria-label]="'Puntuación ' + star"
                  >
                    <svg
                      class="w-6 h-6 sm:w-7 sm:h-7"
                      [ngClass]="(facilidadUso() ?? 0) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-600 fill-slate-800'"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                }
              </div>
            </div>

            <!-- Botones descriptivos rápidos para celular -->
            <div class="grid grid-cols-5 gap-1.5 pt-1">
              @for (op of opcionesEscala; track op.value) {
                <button
                  type="button"
                  (click)="facilidadUso.set(op.value)"
                  class="py-1.5 px-1 rounded-xl text-center text-[10px] font-bold border transition-all cursor-pointer"
                  [ngClass]="facilidadUso() === op.value
                    ? 'bg-[#00B39F] text-[#080B10] border-teal-300 font-extrabold shadow-sm'
                    : 'bg-black/30 text-slate-400 border-white/5 hover:bg-white/5'"
                >
                  <span>{{ op.emoji }} {{ op.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- DIMENSIÓN 2: MATERIAL DIDÁCTICO Y GUÍAS OMS -->
          <div class="bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-3xl p-5 sm:p-6 shadow-xl border border-white/15 hover:border-[#00B39F]/40 transition duration-300">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-2.5">
                <span class="w-7 h-7 rounded-xl bg-[#50E7FF] text-[#080B10] font-black text-xs flex items-center justify-center">2</span>
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-white">
                    Videos, Checklist y Guías OMS
                  </h3>
                  <p class="text-[11px] text-slate-400">
                    Claridad pedagógica de las animaciones y fundamentos teóricos.
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-1 self-start sm:self-auto">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <button
                    type="button"
                    (click)="utilidadGuia.set(star)"
                    class="p-1 cursor-pointer focus:outline-none transition transform hover:scale-120"
                    [attr.aria-label]="'Puntuación ' + star"
                  >
                    <svg
                      class="w-6 h-6 sm:w-7 sm:h-7"
                      [ngClass]="(utilidadGuia() ?? 0) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-600 fill-slate-800'"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                }
              </div>
            </div>

            <div class="grid grid-cols-5 gap-1.5 pt-1">
              @for (op of opcionesEscala; track op.value) {
                <button
                  type="button"
                  (click)="utilidadGuia.set(op.value)"
                  class="py-1.5 px-1 rounded-xl text-center text-[10px] font-bold border transition-all cursor-pointer"
                  [ngClass]="utilidadGuia() === op.value
                    ? 'bg-[#50E7FF] text-[#080B10] border-sky-300 font-extrabold shadow-sm'
                    : 'bg-black/30 text-slate-400 border-white/5 hover:bg-white/5'"
                >
                  <span>{{ op.emoji }} {{ op.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- DIMENSIÓN 3: VISIÓN ARTIFICIAL & FEEDBACK POR CÁMARA -->
          <div class="bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-3xl p-5 sm:p-6 shadow-xl border border-white/15 hover:border-[#00B39F]/40 transition duration-300">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-2.5">
                <span class="w-7 h-7 rounded-xl bg-[#D9FF43] text-[#080B10] font-black text-xs flex items-center justify-center">3</span>
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-white">
                    Detección por Cámara (MediaPipe AI)
                  </h3>
                  <p class="text-[11px] text-slate-400">
                    Cronómetro biomecánico en tiempo real y alertas de frotado.
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-1 self-start sm:self-auto">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <button
                    type="button"
                    (click)="claridadFeed.set(star)"
                    class="p-1 cursor-pointer focus:outline-none transition transform hover:scale-120"
                    [attr.aria-label]="'Puntuación ' + star"
                  >
                    <svg
                      class="w-6 h-6 sm:w-7 sm:h-7"
                      [ngClass]="(claridadFeed() ?? 0) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-600 fill-slate-800'"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                }
              </div>
            </div>

            <div class="grid grid-cols-5 gap-1.5 pt-1">
              @for (op of opcionesEscala; track op.value) {
                <button
                  type="button"
                  (click)="claridadFeed.set(op.value)"
                  class="py-1.5 px-1 rounded-xl text-center text-[10px] font-bold border transition-all cursor-pointer"
                  [ngClass]="claridadFeed() === op.value
                    ? 'bg-[#D9FF43] text-[#080B10] border-lime-300 font-extrabold shadow-sm'
                    : 'bg-black/30 text-slate-400 border-white/5 hover:bg-white/5'"
                >
                  <span>{{ op.emoji }} {{ op.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- DIMENSIÓN 4: RECOMENDACIÓN ACADÉMICA -->
          <div class="bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-3xl p-5 sm:p-6 shadow-xl border border-white/15 hover:border-[#00B39F]/40 transition duration-300">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-2.5">
                <span class="w-7 h-7 rounded-xl bg-[#FF6A4D] text-white font-black text-xs flex items-center justify-center">4</span>
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-white">
                    Recomendación a Futuros Colegas
                  </h3>
                  <p class="text-[11px] text-slate-400">
                    Utilidad de la herramienta en laboratorios de simulación y prácticas.
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-1 self-start sm:self-auto">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <button
                    type="button"
                    (click)="recomendacion.set(star)"
                    class="p-1 cursor-pointer focus:outline-none transition transform hover:scale-120"
                    [attr.aria-label]="'Puntuación ' + star"
                  >
                    <svg
                      class="w-6 h-6 sm:w-7 sm:h-7"
                      [ngClass]="(recomendacion() ?? 0) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-600 fill-slate-800'"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                }
              </div>
            </div>

            <div class="grid grid-cols-5 gap-1.5 pt-1">
              @for (op of opcionesEscala; track op.value) {
                <button
                  type="button"
                  (click)="recomendacion.set(op.value)"
                  class="py-1.5 px-1 rounded-xl text-center text-[10px] font-bold border transition-all cursor-pointer"
                  [ngClass]="recomendacion() === op.value
                    ? 'bg-[#FF6A4D] text-white border-rose-300 font-extrabold shadow-sm'
                    : 'bg-black/30 text-slate-400 border-white/5 hover:bg-white/5'"
                >
                  <span>{{ op.emoji }} {{ op.label }}</span>
                </button>
              }
            </div>
          </div>

        </div>

        <!-- 4. CAMPO DE TEXTO ABIERTO OPCIONAL: COMENTARIOS Y SUGERENCIAS -->
        <div class="bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-3xl p-5 sm:p-7 shadow-xl border border-white/15 mb-6 sm:mb-8 animate-fade-in">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-base sm:text-lg">💬</span>
            <label for="comentarios" class="block text-sm sm:text-base font-extrabold text-white">
              Comentarios, sugerencias o experiencia con "Manos Seguras" (opcional)
            </label>
          </div>

          <p class="text-xs text-slate-400 mb-3">
            Cuéntanos qué te pareció la plataforma, qué fue lo más útil o qué aspectos consideras que podemos enriquecer para futuros estudiantes de enfermería.
          </p>

          <textarea
            id="comentarios"
            rows="3"
            [(ngModel)]="comentariosTexto"
            placeholder="Escribe tus comentarios aquí (ej. 'La detección de la cámara me ayudó a calibrar los tiempos de fricción', 'Me pareció excelente el acompañamiento de Manitos Coach')..."
            class="w-full px-4 py-3 rounded-2xl border border-white/15 bg-black/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00B39F] focus:ring-2 focus:ring-[#00B39F]/30 text-xs sm:text-sm transition resize-none shadow-inner"
          ></textarea>

          <div class="flex justify-between items-center text-[11px] text-slate-400 mt-2">
            <span>Tu retroalimentación se almacenará de manera segura en la base de datos institucional.</span>
            <span class="font-mono text-slate-400">{{ comentariosTexto.length }} caracteres</span>
          </div>
        </div>

        <!-- ALERTA DE ERROR SI EXISTE -->
        @if (errorEnvio()) {
          <div class="mb-6 p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-center justify-between animate-fade-in">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ errorEnvio() }}</span>
            </div>
            <button (click)="errorEnvio.set('')" class="text-amber-400 hover:text-white font-bold text-lg cursor-pointer">&times;</button>
          </div>
        }

        <!-- 5. BOTÓN DE ACCIÓN: ENVIAR OPINIÓN Y FINALIZAR -->
        <div class="bg-gradient-to-r from-[#0d1e26] via-[#10292f] to-[#0c2420] rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl text-center space-y-3">
          <button
            type="button"
            (click)="enviarEncuesta()"
            [disabled]="enviando()"
            class="w-full sm:w-auto px-8 sm:px-12 py-4 rounded-full font-black text-sm sm:text-base shadow-2xl transition-all duration-300 transform flex items-center justify-center gap-3 mx-auto cursor-pointer"
            [ngClass]="enviando()
              ? 'bg-slate-800 text-slate-400 cursor-wait border border-white/10'
              : 'bg-gradient-to-r from-[#00B39F] via-[#50E7FF] to-[#D9FF43] hover:brightness-110 text-[#080B10] hover:scale-105 active:scale-95 shadow-teal-500/30'"
          >
            @if (enviando()) {
              <svg class="animate-spin h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Guardando opinión en Supabase y finalizando...</span>
            } @else {
              <span>Enviar opinión y finalizar</span>
              <svg class="w-5 h-5 text-[#080B10]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            }
          </button>

          <p class="text-[11px] text-slate-400">
            Al enviar tu opinión, desbloquearás inmediatamente la <strong>Fase 7: Resultados y Certificado Oficial</strong>.
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

  // Calificación General por Estrellas (1 a 5)
  readonly estrellasGeneral = signal<number>(5);
  readonly hoverEstrellas = signal<number | null>(null);

  // Calificaciones por Dimensión (1 a 5)
  readonly facilidadUso = signal<number | null>(5);
  readonly utilidadGuia = signal<number | null>(5);
  readonly claridadFeed = signal<number | null>(5);
  readonly recomendacion = signal<number | null>(5);

  comentariosTexto = '';

  readonly enviando = signal(false);
  readonly errorEnvio = signal('');

  readonly starFeedbacks: StarFeedback[] = [
    { valor: 1, titulo: 'Experiencia Deficiente', subtitulo: 'Requiere mejoras sustanciales en interfaz o guía.', emoji: '😕' },
    { valor: 2, titulo: 'Experiencia Regular', subtitulo: 'Cumple lo básico, pero necesita optimización.', emoji: '😐' },
    { valor: 3, titulo: 'Buena Experiencia', subtitulo: 'Herramienta útil y adecuada para la práctica.', emoji: '🙂' },
    { valor: 4, titulo: 'Muy Buena Experiencia', subtitulo: 'Gran apoyo visual y biomecánico con cámara.', emoji: '😊' },
    { valor: 5, titulo: '¡Excelente Plataforma!', subtitulo: 'Simulación clínica sobresaliente e innovadora.', emoji: '🤩' },
  ];

  readonly feedbackEstrellasActual = computed<StarFeedback>(() => {
    const val = this.hoverEstrellas() ?? this.estrellasGeneral();
    return this.starFeedbacks.find((f) => f.valor === val) || this.starFeedbacks[4];
  });

  readonly opcionesEscala = [
    { value: 1, label: '1 ★', emoji: '😕' },
    { value: 2, label: '2 ★', emoji: '😐' },
    { value: 3, label: '3 ★', emoji: '🙂' },
    { value: 4, label: '4 ★', emoji: '😊' },
    { value: 5, label: '5 ★', emoji: '🤩' },
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

  ngOnInit(): void {
    if (!this.student()) {
      this.router.navigate(['/bienvenida']);
    }
  }

  seleccionarEstrellasGeneral(star: number): void {
    this.estrellasGeneral.set(star);
    // Sincronizar suavemente las dimensiones si el usuario solo califica con las estrellas principales
    this.facilidadUso.set(star);
    this.utilidadGuia.set(star);
    this.claridadFeed.set(star);
    this.recomendacion.set(star);
  }

  enviarEncuesta(): void {
    this.enviando.set(true);
    this.errorEnvio.set('');

    const generalVal = this.estrellasGeneral() || 5;
    const facilidad = this.facilidadUso() ?? generalVal;
    const utilidad = this.utilidadGuia() ?? generalVal;
    const claridad = this.claridadFeed() ?? generalVal;
    const rec = this.recomendacion() ?? generalVal;

    const payload = {
      facilidadUso: facilidad,
      utilidadGuia: utilidad,
      claridadFeed: claridad,
      recomendacion: rec,
      comentarios: this.comentariosTexto.trim() || null,
      codigoEstudiantil: this.student()?.studentCode || undefined,
      correo: this.authService.usuarioActual()?.correo || undefined,
      usuarioId: this.authService.usuarioActual()?.id || undefined,
    };

    this.encuestaService.enviarEncuesta(payload).subscribe({
      next: () => {
        this.enviando.set(false);
        this.stateService.unlockStep(7);
        this.router.navigate(['/resultado']);
      },
      error: (err) => {
        console.warn('Aviso al persistir encuesta en servidor:', err);
        this.enviando.set(false);
        // Permitir continuar al paso 7 (Resultados) para no bloquear la emisión del certificado
        this.stateService.unlockStep(7);
        this.router.navigate(['/resultado']);
      },
    });
  }
}
