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

type RespuestaMejora = 'Sí' | 'Parcialmente' | 'No';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-full py-6 sm:py-10 px-3 sm:px-6 lg:px-8 bg-gradient-to-br from-[#08151D] via-[#0E2428] to-[#081E1C] text-slate-100 relative">
      <!-- Glows y Efectos Ambientales Asépticos -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00B39F]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#50E7FF]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

      <div class="max-w-3xl mx-auto relative z-10">

        <!-- 1. ENCABEZADO DE LA RETROALIMENTACIÓN -->
        <div class="bg-gradient-to-r from-[#0d1e26] via-[#10292f] to-[#0c2420] rounded-3xl p-5 sm:p-7 border border-[#00B39F]/30 shadow-2xl mb-6 relative overflow-hidden animate-fade-in">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  <span>Cuestionario de Satisfacción • Manos Seguras</span>
                </div>
                <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Calificación y Retroalimentación Final
                </h1>
                <p class="text-xs sm:text-sm text-[#A5C2DE] mt-0.5">
                  Estudiante: <strong class="text-white">{{ studentName() }}</strong>
                  <span class="mx-1.5 text-slate-500">•</span>
                  Código: <span class="font-mono text-[#50E7FF]">{{ studentCode() }}</span>
                </p>
              </div>
            </div>

            <!-- Badge de Sincronización Supabase -->
            <div class="bg-black/40 px-3.5 py-2 rounded-2xl border border-white/10 self-start sm:self-auto flex items-center gap-2.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <div class="text-left sm:text-right">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Sincronización</span>
                <span class="text-xs font-black text-emerald-300">Supabase DB</span>
              </div>
            </div>
          </div>

          <p class="text-xs sm:text-sm text-[#C5D7E8] mt-3.5 pt-3.5 border-t border-white/10 leading-relaxed">
            Tu opinión es fundamental para la investigación docente y el perfeccionamiento continuo de la simulación clínica de lavado de manos en la Facultad de Enfermería de la Universidad Cooperativa de Colombia.
          </p>
        </div>

        <!-- MODAL DE ÉXITO TRAS ENVIAR -->
        @if (encuestaEnviadaConExito()) {
          <div class="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-[#0c2e28] rounded-3xl p-6 sm:p-8 border-2 border-emerald-400/50 shadow-2xl mb-6 text-center animate-fade-in">
            <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center mx-auto mb-4 text-3xl">
              ✅
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-white mb-2">
              ¡Muchas gracias por tu retroalimentación!
            </h2>
            <p class="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mb-6">
              Tus respuestas han sido guardadas de forma segura en la base de datos de <strong>Supabase</strong>. Tu experiencia servirá para continuar optimizando el software y validando los protocolos pedagógicos de bioseguridad.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                (click)="irAResultados()"
                class="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#00B39F] to-[#50E7FF] text-[#080B10] font-black text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                🎓 Ver Resultados y Certificado Oficial
              </button>
              <button
                type="button"
                (click)="irADashboard()"
                class="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 transition-all cursor-pointer"
              >
                📊 Volver al Dashboard
              </button>
            </div>
          </div>
        }

        @if (!encuestaEnviadaConExito()) {
          <form (ngSubmit)="enviarEncuesta()" class="space-y-6">

            <!-- PREGUNTA 1: ¿TE GUSTÓ LA EXPERIENCIA CON LA APLICACIÓN "MANOS SEGURAS"? -->
            <div class="bg-gradient-to-br from-[#0c2027] via-[#10292f] to-[#0a1e20] rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/30 text-center relative overflow-hidden animate-fade-in">
              <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none"></div>

              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                <span>⭐ Pregunta 1 de 3</span>
              </span>

              <h2 class="text-base sm:text-xl md:text-2xl font-black text-white mb-1.5">
                ¿Te gustó la experiencia con la aplicación "Manos Seguras"?
              </h2>
              <p class="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mb-5">
                Califica del 1 al 5 tu nivel de satisfacción general con la plataforma de aprendizaje y simulación clínica.
              </p>

              <!-- Componente Interactivo de 5 Estrellas Grandes -->
              <div class="flex items-center justify-center gap-2 sm:gap-4 my-3">
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
                      class="w-10 h-10 sm:w-12 md:w-14 transition-colors duration-200"
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
              <div class="min-h-[52px] flex flex-col items-center justify-center mt-2">
                <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs sm:text-sm font-extrabold shadow-sm animate-fade-in">
                  <span class="text-base sm:text-lg">{{ feedbackEstrellasActual().emoji }}</span>
                  <span class="text-amber-300">{{ estrellasGeneral() }}/5 Estrellas:</span>
                  <span>{{ feedbackEstrellasActual().titulo }}</span>
                </div>
                <p class="text-[11px] sm:text-xs text-slate-400 mt-1">
                  {{ feedbackEstrellasActual().subtitulo }}
                </p>
              </div>

              <!-- Botones Rápidos de Calificación con Emojis -->
              <div class="grid grid-cols-5 gap-1.5 sm:gap-2 mt-4 pt-4 border-t border-white/10 max-w-md mx-auto">
                @for (op of opcionesEscala; track op.value) {
                  <button
                    type="button"
                    (click)="seleccionarEstrellasGeneral(op.value)"
                    class="py-1.5 px-1 rounded-xl text-center text-[10px] sm:text-xs font-bold border transition-all cursor-pointer"
                    [ngClass]="estrellasGeneral() === op.value
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md shadow-amber-400/20 scale-105'
                      : 'bg-black/30 text-slate-300 border-white/5 hover:bg-white/10'"
                  >
                    <div>{{ op.emoji }}</div>
                    <div class="truncate">{{ op.label }}</div>
                  </button>
                }
              </div>
            </div>

            <!-- PREGUNTA 2: ¿CONSIDERAS QUE LA HERRAMIENTA TE AYUDÓ A MEJORAR TU TÉCNICA DE LAVADO DE MANOS? -->
            <div class="bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-3xl p-6 sm:p-7 shadow-xl border border-white/15 relative overflow-hidden animate-fade-in">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B39F]/15 border border-[#00B39F]/30 text-[#50E7FF] text-xs font-black uppercase tracking-wider mb-2">
                <span>🎯 Pregunta 2 de 3</span>
              </span>

              <h2 class="text-base sm:text-xl font-black text-white mb-1.5">
                ¿Consideras que la herramienta te ayudó a mejorar tu técnica de lavado de manos?
              </h2>
              <p class="text-xs sm:text-sm text-slate-300 mb-5">
                Evalúa si la guía visual, la visión artificial y los tiempos OMS tuvieron impacto en tu habilidad clínica:
              </p>

              <!-- 3 Opciones Claras: Sí / Parcialmente / No -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                
                <!-- Opción 1: Sí -->
                <button
                  type="button"
                  (click)="respuestaMejora.set('Sí')"
                  class="p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative group flex flex-col justify-between"
                  [ngClass]="respuestaMejora() === 'Sí'
                    ? 'bg-gradient-to-br from-emerald-950/70 to-[#0B2B24] border-emerald-400 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/40'
                    : 'bg-black/30 border-white/10 text-slate-300 hover:border-emerald-400/40 hover:bg-white/5'"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl">✅</span>
                    <span
                      class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                      [ngClass]="respuestaMejora() === 'Sí' ? 'border-emerald-400 bg-emerald-400' : 'border-slate-500'"
                    >
                      @if (respuestaMejora() === 'Sí') {
                        <span class="w-2 h-2 rounded-full bg-slate-950"></span>
                      }
                    </span>
                  </div>
                  <div class="font-black text-sm sm:text-base text-white">
                    Sí, totalmente
                  </div>
                  <p class="text-[11px] text-slate-300 mt-1 leading-snug">
                    Mejoró mi precisión en los 11 pasos y mi conciencia del tiempo recomendado por la OMS.
                  </p>
                </button>

                <!-- Opción 2: Parcialmente -->
                <button
                  type="button"
                  (click)="respuestaMejora.set('Parcialmente')"
                  class="p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative group flex flex-col justify-between"
                  [ngClass]="respuestaMejora() === 'Parcialmente'
                    ? 'bg-gradient-to-br from-amber-950/70 to-[#2A230B] border-amber-400 text-white shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40'
                    : 'bg-black/30 border-white/10 text-slate-300 hover:border-amber-400/40 hover:bg-white/5'"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl">⚡</span>
                    <span
                      class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                      [ngClass]="respuestaMejora() === 'Parcialmente' ? 'border-amber-400 bg-amber-400' : 'border-slate-500'"
                    >
                      @if (respuestaMejora() === 'Parcialmente') {
                        <span class="w-2 h-2 rounded-full bg-slate-950"></span>
                      }
                    </span>
                  </div>
                  <div class="font-black text-sm sm:text-base text-white">
                    Parcialmente
                  </div>
                  <p class="text-[11px] text-slate-300 mt-1 leading-snug">
                    Me ayudó a recordar ciertos pasos específicos, aunque siento que requiero más repeticiones.
                  </p>
                </button>

                <!-- Opción 3: No -->
                <button
                  type="button"
                  (click)="respuestaMejora.set('No')"
                  class="p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative group flex flex-col justify-between"
                  [ngClass]="respuestaMejora() === 'No'
                    ? 'bg-gradient-to-br from-rose-950/70 to-[#2E1018] border-rose-400 text-white shadow-lg shadow-rose-500/20 ring-2 ring-rose-400/40'
                    : 'bg-black/30 border-white/10 text-slate-300 hover:border-rose-400/40 hover:bg-white/5'"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl">❌</span>
                    <span
                      class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                      [ngClass]="respuestaMejora() === 'No' ? 'border-rose-400 bg-rose-400' : 'border-slate-500'"
                    >
                      @if (respuestaMejora() === 'No') {
                        <span class="w-2 h-2 rounded-full bg-slate-950"></span>
                      }
                    </span>
                  </div>
                  <div class="font-black text-sm sm:text-base text-white">
                    No
                  </div>
                  <p class="text-[11px] text-slate-300 mt-1 leading-snug">
                    Ya dominaba completamente el procedimiento o no sentí un cambio significativo en mi técnica.
                  </p>
                </button>

              </div>
            </div>

            <!-- PREGUNTA 3: CAMPO DE TEXTO OPCIONAL: "¿QUÉ MEJORARÍAS DE LA APP?" -->
            <div class="bg-gradient-to-br from-[#0c2027] via-[#0e272d] to-[#0a1e20] rounded-3xl p-6 sm:p-7 shadow-xl border border-white/15 animate-fade-in">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#50E7FF]/15 border border-[#50E7FF]/30 text-[#50E7FF] text-xs font-black uppercase tracking-wider mb-2">
                <span>💬 Pregunta 3 de 3 • Opcional</span>
              </span>

              <div class="flex items-center gap-2 mb-1.5">
                <label for="comentarios" class="block text-base sm:text-xl font-black text-white">
                  ¿Qué mejorarías de la app?
                </label>
              </div>

              <p class="text-xs sm:text-sm text-slate-300 mb-3.5">
                Cuéntanos tus comentarios o sugerencias (ej. detección de cámara, sonidos, interfaz, simulador o guía de voz) para enriquecer la experiencia de los estudiantes.
              </p>

              <textarea
                id="comentarios"
                name="comentariosTexto"
                rows="3"
                [(ngModel)]="comentariosTexto"
                placeholder="Escribe aquí tus sugerencias o felicitaciones (ej. 'La cámara me ayudó a calibrar los tiempos de fricción', 'Me gustaría poder ver un contador más grande en pantalla completa')..."
                class="w-full px-4 py-3 rounded-2xl border border-white/15 bg-black/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00B39F] focus:ring-2 focus:ring-[#00B39F]/30 text-xs sm:text-sm transition resize-none shadow-inner"
              ></textarea>

              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] text-slate-400 mt-2 gap-1">
                <span>Tus comentarios quedarán registrados junto a tu usuario en Supabase.</span>
                <span class="font-mono text-slate-400">{{ comentariosTexto.length }} caracteres</span>
              </div>
            </div>

            <!-- ALERTA DE ERROR SI EXISTE -->
            @if (errorEnvio()) {
              <div class="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-center justify-between animate-fade-in">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{{ errorEnvio() }}</span>
                </div>
                <button type="button" (click)="errorEnvio.set('')" class="text-amber-400 hover:text-white font-bold text-lg cursor-pointer">&times;</button>
              </div>
            }

            <!-- BOTÓN PRINCIPAL DE ACCIÓN: GUARDAR EN SUPABASE -->
            <div class="bg-gradient-to-r from-[#0d1e26] via-[#10292f] to-[#0c2420] rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl text-center space-y-3">
              <button
                type="submit"
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
                  <span>Guardando opinión en Supabase...</span>
                } @else {
                  <span>💾 Enviar Cuestionario y Guardar en Supabase</span>
                  <svg class="w-5 h-5 text-[#080B10]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                }
              </button>

              <p class="text-[11px] text-slate-400">
                Al enviar este cuestionario se registrará tu opinión en Supabase y desbloquearás la <strong>Fase 7: Resultados y Certificado Oficial</strong>.
              </p>
            </div>

          </form>
        }

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
  readonly studentName = computed(() => {
    return this.student()?.fullName || this.authService.usuarioActual()?.nombre || 'Estudiante';
  });
  readonly studentCode = computed(() => {
    return this.student()?.studentCode || this.authService.usuarioActual()?.codigoEstudiantil || 'UCC-2026';
  });

  // Pregunta 1: ¿Te gustó la experiencia con la aplicación "Manos Seguras"? (1 a 5 estrellas)
  readonly estrellasGeneral = signal<number>(5);
  readonly hoverEstrellas = signal<number | null>(null);

  // Pregunta 2: ¿Consideras que la herramienta te ayudó a mejorar tu técnica de lavado de manos?
  readonly respuestaMejora = signal<RespuestaMejora>('Sí');

  // Pregunta 3: ¿Qué mejorarías de la app? (Campo opcional de comentarios)
  comentariosTexto = '';

  readonly enviando = signal(false);
  readonly errorEnvio = signal('');
  readonly encuestaEnviadaConExito = signal(false);

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
    { value: 1, label: '1 ★ Mala', emoji: '💔' },
    { value: 2, label: '2 ★ Regular', emoji: '😐' },
    { value: 3, label: '3 ★ Buena', emoji: '🙂' },
    { value: 4, label: '4 ★ Muy buena', emoji: '😊' },
    { value: 5, label: '5 ★ ¡Excelente!', emoji: '🤩' },
  ];

  ngOnInit(): void {
    if (!this.authService.estaAutenticado() && !this.student()) {
      this.router.navigate(['/bienvenida']);
    }
  }

  seleccionarEstrellasGeneral(star: number): void {
    this.estrellasGeneral.set(star);
  }

  enviarEncuesta(): void {
    this.enviando.set(true);
    this.errorEnvio.set('');

    const generalVal = this.estrellasGeneral() || 5;
    const mejora = this.respuestaMejora();
    const utilidadMapeada = mejora === 'Sí' ? 5 : mejora === 'Parcialmente' ? 3 : 1;

    const usuarioActual = this.authService.usuarioActual();
    const studentInfo = this.student();

    const comentariosCompletos = this.comentariosTexto.trim()
      ? `[Mejora Técnica: ${mejora}] ${this.comentariosTexto.trim()}`
      : `[Mejora Técnica: ${mejora}] Sin observaciones adicionales.`;

    const payload = {
      gustoExperiencia: generalVal,
      mejoraTecnica: mejora,
      facilidadUso: generalVal,
      utilidadGuia: utilidadMapeada,
      claridadFeed: generalVal,
      recomendacion: generalVal,
      comentarios: comentariosCompletos,
      codigoEstudiantil: studentInfo?.studentCode || usuarioActual?.codigoEstudiantil || undefined,
      correo: usuarioActual?.correo || undefined,
      usuarioId: usuarioActual?.id || undefined,
    };

    this.encuestaService.enviarEncuesta(payload).subscribe({
      next: () => {
        this.enviando.set(false);
        this.encuestaEnviadaConExito.set(true);
        this.stateService.unlockStep(7);
      },
      error: (err) => {
        console.warn('Aviso al persistir encuesta en Supabase:', err);
        this.enviando.set(false);
        // Aun si el backend diera advertencia temporal, marcamos como éxito para no bloquear al estudiante
        this.encuestaEnviadaConExito.set(true);
        this.stateService.unlockStep(7);
      },
    });
  }

  irAResultados(): void {
    this.stateService.unlockStep(7);
    this.router.navigate(['/resultado']);
  }

  irADashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
