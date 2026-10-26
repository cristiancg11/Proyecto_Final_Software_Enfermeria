import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HandwashStateService } from '../../core/services/handwash-state.service';

@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Contenedor Maestro con Degradado Menta a Durazno -->
    <div class="min-h-screen py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#CFFBF0] via-[#E8FCF7] to-[#FFE9DE] text-[#0B2B29] relative overflow-hidden">
      <!-- Efectos y Resplandores Ambientales -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00B39F]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#FF6A4D]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/20 blur-3xl pointer-events-none"></div>

      <div class="max-w-4xl mx-auto relative z-10">
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
              Para acceder a la evaluación diagnóstica de bioseguridad y registrar tu puntaje inicial, primero debes identificarte con tu nombre y código estudiantil.
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
          <!-- Contexto Superior del Estudiante -->
          <div class="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 mb-6 shadow-xl border border-white/50 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00B39F] to-[#008072] text-white font-black text-sm flex items-center justify-center shadow-md">
                {{ studentInitials() }}
              </div>
              <div>
                <span class="text-[11px] font-bold text-[#008072] uppercase tracking-wider block">
                  Estudiante Evaluado
                </span>
                <span class="text-sm sm:text-base font-extrabold text-[#0B2B29] leading-tight block">
                  {{ studentName() }}
                </span>
                <span class="text-xs text-slate-500 font-medium">
                  Cód: {{ studentCode() }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-3 self-end sm:self-auto">
              <div class="text-right">
                <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Aciertos Acumulados
                </span>
                <span class="text-sm font-black text-[#008072]">
                  {{ diagnosticScore() }} de {{ questions.length }} correctas
                </span>
              </div>
              <div class="w-10 h-10 rounded-2xl bg-[#00B39F]/10 border border-[#00B39F]/30 text-[#008072] flex items-center justify-center font-black text-xs shadow-xs">
                {{ Math.round((diagnosticScore() / questions.length) * 100) }}%
              </div>
            </div>
          </div>

          <!-- BARRA DE PROGRESO SUPERIOR: PREGUNTA X DE 5 -->
          <div class="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 mb-6 shadow-xl border border-white/50 animate-fade-in">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2.5">
                <span class="w-3 h-3 rounded-full bg-[#00B39F] animate-ping"></span>
                <span class="font-heading text-lg sm:text-xl font-black text-[#0B2B29] tracking-tight">
                  Pregunta {{ currentQuestionIndex() + 1 }} de {{ questions.length }}
                </span>
              </div>

              <!-- Badge con estado del avance total -->
              <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00B39F]/10 border border-[#00B39F]/25 text-[#008072] text-xs font-bold shadow-xs">
                <span>Progreso: {{ answeredCount() }}/{{ questions.length }} respondidas</span>
              </div>
            </div>

            <!-- Barra de Progreso Lineal -->
            <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                class="h-full rounded-full bg-gradient-to-r from-[#00B39F] via-[#009988] to-[#008072] transition-all duration-300"
                [style.width.%]="progressPercent()"
              ></div>
            </div>

            <!-- Stepper de 5 preguntas clínicas -->
            <div class="grid grid-cols-5 gap-2 sm:gap-4 mt-4 pt-2 border-t border-slate-100">
              @for (q of questions; track q.id; let idx = $index) {
                <button
                  type="button"
                  (click)="jumpToQuestion(idx)"
                  class="flex flex-col items-center gap-1 group cursor-pointer focus:outline-none"
                  [attr.aria-label]="'Ir a pregunta ' + (idx + 1)"
                >
                  <div
                    class="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-sm"
                    [ngClass]="{
                      'bg-gradient-to-r from-[#00B39F] to-[#009988] text-white ring-4 ring-[#00B39F]/25 scale-110 shadow-md': idx === currentQuestionIndex(),
                      'bg-[#00B39F] text-white': idx !== currentQuestionIndex() && isQuestionAnswered(q.id),
                      'bg-slate-100 text-slate-400 border border-slate-200/90 group-hover:border-[#00B39F]/40 group-hover:text-slate-700': idx !== currentQuestionIndex() && !isQuestionAnswered(q.id)
                    }"
                  >
                    @if (isQuestionAnswered(q.id) && idx !== currentQuestionIndex()) {
                      <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    } @else {
                      {{ idx + 1 }}
                    }
                  </div>
                  <span
                    class="text-[10px] font-bold truncate max-w-full hidden sm:block transition-colors"
                    [ngClass]="idx === currentQuestionIndex() ? 'text-[#008072] font-black' : isQuestionAnswered(q.id) ? 'text-[#0B2B29]' : 'text-slate-400'"
                  >
                    Caso {{ idx + 1 }}
                  </span>
                </button>
              }
            </div>
          </div>

          <!-- TARJETA PRINCIPAL DEL CASO CLÍNICO -->
          <div class="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/50 text-[#0B2B29] relative overflow-hidden animate-fade-in">
            <!-- Contexto Clínico OMS -->
            <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE9DE] text-[#FF6A4D] font-extrabold text-xs border border-[#FF6A4D]/20 shadow-xs">
                <svg class="w-3.5 h-3.5 text-[#FF6A4D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{{ currentQuestion().context }}</span>
              </span>

              <span class="text-xs font-extrabold text-slate-400">
                Pregunta {{ currentQuestionIndex() + 1 }} de {{ questions.length }}
              </span>
            </div>

            <!-- Enunciado de la Pregunta -->
            <div class="flex items-start gap-4 mb-6">
              <div class="w-10 h-10 rounded-2xl bg-[#00B39F] text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm mt-0.5">
                {{ currentQuestionIndex() + 1 }}
              </div>
              <h2 class="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B2B29] leading-snug">
                {{ currentQuestion().question }}
              </h2>
            </div>

            <!-- BOTONES DE RESPUESTA ESTILIZADOS CON TAILWIND -->
            <div class="grid grid-cols-1 gap-3.5 mt-6">
              @for (option of currentQuestion().options; track $index; let optIdx = $index) {
                <button
                  type="button"
                  (click)="selectOption(optIdx)"
                  class="w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4 cursor-pointer group relative overflow-hidden"
                  [ngClass]="{
                    'border-[#00B39F] bg-[#00B39F]/10 ring-2 ring-[#00B39F]/25 shadow-lg shadow-[#00B39F]/15 scale-[1.01]': isSelected(optIdx),
                    'border-slate-200/90 bg-white/80 hover:border-[#00B39F]/50 hover:bg-slate-50/90 hover:scale-[1.005] shadow-xs': !isSelected(optIdx)
                  }"
                >
                  <!-- Letra identificadora (A, B, C, D) -->
                  <div
                    class="w-8 h-8 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center shrink-0 transition-colors mt-0.5 shadow-xs"
                    [ngClass]="{
                      'bg-[#00B39F] text-white shadow-xs': isSelected(optIdx),
                      'bg-slate-100 text-slate-700 group-hover:bg-[#00B39F]/20 group-hover:text-[#008072]': !isSelected(optIdx)
                    }"
                  >
                    {{ optionLetters[optIdx] }}
                  </div>

                  <!-- Texto de la opción -->
                  <div
                    class="text-sm sm:text-base leading-relaxed grow transition-colors"
                    [ngClass]="isSelected(optIdx) ? 'text-[#0B2B29] font-extrabold' : 'text-slate-800 font-semibold group-hover:text-[#0B2B29]'"
                  >
                    {{ option }}
                  </div>

                  <!-- Checkmark de selección -->
                  @if (isSelected(optIdx)) {
                    <div class="w-6 h-6 rounded-full bg-[#00B39F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs animate-fade-in">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  }
                </button>
              }
            </div>

            <!-- BARRA DE NAVEGACIÓN Y BOTÓN DE AVANCE -->
            <div class="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <!-- Botón Anterior -->
              <button
                type="button"
                (click)="prevQuestion()"
                [disabled]="currentQuestionIndex() === 0"
                class="w-full sm:w-auto px-6 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Pregunta Anterior</span>
              </button>

              <!-- Mensaje de estado -->
              <div class="text-xs sm:text-sm text-center">
                @if (isCurrentQuestionAnswered()) {
                  <span class="text-[#008072] font-extrabold flex items-center gap-1.5 justify-center">
                    <svg class="w-4 h-4 text-[#00B39F]" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span>Respuesta registrada. Avanza a la siguiente pregunta.</span>
                  </span>
                } @else {
                  <span class="text-[#FF6A4D] font-bold">
                    * Selecciona una opción para habilitar el avance
                  </span>
                }
              </div>

              <!-- Botón Siguiente / Finalizar (Deshabilitado hasta marcar una opción) -->
              @if (!isLastQuestion()) {
                <button
                  type="button"
                  (click)="nextQuestion()"
                  [disabled]="!isCurrentQuestionAnswered()"
                  class="w-full sm:w-auto px-8 py-3.5 rounded-full font-extrabold text-sm sm:text-base text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
                  [ngClass]="!isCurrentQuestionAnswered()
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-[#00B39F] hover:bg-[#009988] hover:shadow-[#00B39F]/30 hover:scale-105 active:scale-95'"
                >
                  <span>Siguiente Pregunta</span>
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              } @else {
                <button
                  type="button"
                  (click)="finishDiagnostic()"
                  [disabled]="!isCurrentQuestionAnswered() || answeredCount() < questions.length"
                  class="w-full sm:w-auto px-8 py-3.5 rounded-full font-black text-sm sm:text-base text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
                  [ngClass]="!isCurrentQuestionAnswered() || answeredCount() < questions.length
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-[#00B39F] to-[#008072] hover:brightness-105 hover:shadow-[#00B39F]/30 hover:scale-105 active:scale-95'"
                >
                  <span>Completar Diagnóstico e Ir a Preparación</span>
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class DiagnosticoComponent {
  private readonly router = inject(Router);
  private readonly stateService = inject(HandwashStateService);

  readonly Math = Math;
  readonly optionLetters = ['A', 'B', 'C', 'D'];
  readonly questions = this.stateService.diagnosticQuestions;

  readonly student = this.stateService.student;
  readonly answers = this.stateService.diagnosticAnswers;
  readonly diagnosticScore = this.stateService.diagnosticScore;

  // Signal del índice de la pregunta activa (0 a 4)
  readonly currentQuestionIndex = signal(0);

  // Pregunta activa computada
  readonly currentQuestion = computed(() => this.questions[this.currentQuestionIndex()]);

  // Cantidad total de preguntas respondidas
  readonly answeredCount = computed(() => Object.keys(this.answers()).length);

  // Porcentaje del progreso de preguntas (20%, 40%, 60%, 80%, 100%)
  readonly progressPercent = computed(() => {
    return Math.round(((this.currentQuestionIndex() + 1) / this.questions.length) * 100);
  });

  // Valida si la pregunta actual ya tiene una opción elegida
  readonly isCurrentQuestionAnswered = computed(() => {
    const qId = this.currentQuestion().id;
    return this.answers()[qId] !== undefined;
  });

  // Determina si estamos en la última pregunta (pregunta 5)
  readonly isLastQuestion = computed(() => {
    return this.currentQuestionIndex() === this.questions.length - 1;
  });

  readonly studentName = computed(() => this.student()?.fullName || 'Estudiante');
  readonly studentCode = computed(() => this.student()?.studentCode || 'No registrado');
  readonly studentInitials = computed(() => {
    const name = this.student()?.fullName || 'E';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');
  });

  isSelected(optionIndex: number): boolean {
    const qId = this.currentQuestion().id;
    return this.answers()[qId] === optionIndex;
  }

  isQuestionAnswered(questionId: number): boolean {
    return this.answers()[questionId] !== undefined;
  }

  selectOption(optionIndex: number): void {
    const qId = this.currentQuestion().id;
    this.stateService.setDiagnosticAnswer(qId, optionIndex);
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex() < this.questions.length - 1) {
      this.currentQuestionIndex.update((idx) => idx + 1);
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update((idx) => idx - 1);
    }
  }

  jumpToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestionIndex.set(index);
    }
  }

  goToBienvenida(): void {
    this.router.navigate(['/bienvenida']);
  }

  finishDiagnostic(): void {
    if (this.answeredCount() === this.questions.length) {
      // El puntaje ya queda sincronizado reactivamente en stateService.diagnosticScore
      this.router.navigate(['/inicio']);
    }
  }
}
