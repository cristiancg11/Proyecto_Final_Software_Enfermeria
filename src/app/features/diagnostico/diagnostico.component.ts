import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HandwashStateService } from '../../core/services/handwash-state.service';

@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      <!-- Barra Superior / Contexto del Estudiante -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/80 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#00B39F]/15 flex items-center justify-center text-[#00B39F] font-bold">
            {{ studentInitials() }}
          </div>
          <div>
            <div class="text-xs text-[#537571] font-semibold">Estudiante Evaluado</div>
            <div class="text-sm font-bold text-[#0B2B29]">{{ studentName() }}</div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right">
            <div class="text-xs text-[#537571] font-semibold">Progreso Diagnóstico</div>
            <div class="text-sm font-bold text-[#008072]">{{ answeredCount() }} de 3 Preguntas</div>
          </div>
          <div class="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center text-xs font-bold text-[#00B39F]"
               [ngClass]="answeredCount() === 3 ? 'border-[#00B39F] bg-[#00B39F]/10' : 'border-slate-200'">
            {{ Math.round((answeredCount() / 3) * 100) }}%
          </div>
        </div>
      </div>

      <!-- Encabezado de la Sección -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFE9DE] text-[#FF6A4D] text-xs font-bold mb-3 border border-[#FF6A4D]/20">
          Evaluación Inicial de Conocimientos
        </div>
        <h1 class="font-heading text-3xl md:text-4xl text-[#0B2B29] mb-3">
          Cuestionario de Bioseguridad
        </h1>
        <p class="text-sm md:text-base text-[#537571] max-w-xl mx-auto">
          Responde estas 3 preguntas fundamentales para verificar tus conocimientos previos antes de iniciar la práctica física en el simulador.
        </p>
      </div>

      <!-- Lista de Preguntas -->
      <div class="space-y-8">
        @for (q of questions; track q.id; let qIdx = $index) {
          <div class="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-lg border border-white/80 transition-all duration-300">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-8 h-8 rounded-xl bg-[#00B39F] text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 shadow-sm">
                {{ q.id }}
              </div>
              <div>
                <span class="text-xs font-semibold text-[#00B39F] uppercase tracking-wider">{{ q.context }}</span>
                <h3 class="text-base md:text-lg font-bold text-[#0B2B29] mt-1 leading-snug">
                  {{ q.question }}
                </h3>
              </div>
            </div>

            <!-- Opciones -->
            <div class="grid grid-cols-1 gap-3 mt-5">
              @for (option of q.options; track $index; let optIdx = $index) {
                <button
                  type="button"
                  (click)="selectOption(q.id, optIdx)"
                  class="w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 group cursor-pointer"
                  [ngClass]="{
                    'border-[#00B39F] bg-[#00B39F]/10 shadow-sm ring-2 ring-[#00B39F]/20': isSelected(q.id, optIdx),
                    'border-slate-200/90 bg-white hover:border-[#00B39F]/40 hover:bg-slate-50/80': !isSelected(q.id, optIdx)
                  }"
                >
                  <!-- Letra / Badge -->
                  <div
                    class="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors mt-0.5"
                    [ngClass]="{
                      'bg-[#00B39F] text-white': isSelected(q.id, optIdx),
                      'bg-slate-100 text-[#537571] group-hover:bg-[#00B39F]/20 group-hover:text-[#00B39F]': !isSelected(q.id, optIdx)
                    }"
                  >
                    {{ optionLetters[optIdx] }}
                  </div>

                  <!-- Texto de la opción -->
                  <div class="text-sm font-medium leading-relaxed grow"
                       [ngClass]="isSelected(q.id, optIdx) ? 'text-[#0B2B29] font-semibold' : 'text-[#1E4845]'">
                    {{ option }}
                  </div>

                  <!-- Icono de selección -->
                  <div class="shrink-0 mt-0.5" *ngIf="isSelected(q.id, optIdx)">
                    <div class="w-5 h-5 rounded-full bg-[#00B39F] text-white flex items-center justify-center">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              }
            </div>
          </div>
        }
      </div>

      <!-- Barra Inferior Fija / Navegación -->
      <div class="sticky bottom-6 mt-10 p-4 md:p-5 rounded-3xl bg-white/95 backdrop-blur-xl border border-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-xs md:text-sm text-[#537571] text-center sm:text-left">
          @if (answeredCount() < 3) {
            <span>Responde todas las preguntas para desbloquear la práctica. Faltan <strong class="text-[#FF6A4D]">{{ 3 - answeredCount() }}</strong>.</span>
          } @else {
            <span class="text-[#008072] font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 0 000 16zm3.707-9.293a1 laid 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              ¡Cuestionario completado! Listo para pasar a la bienvenida de práctica.
            </span>
          }
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            (click)="goToBienvenida()"
            class="btn-secondary px-5 py-3 text-sm flex-1 sm:flex-initial"
          >
            Atrás
          </button>

          <button
            type="button"
            (click)="onContinue()"
            [disabled]="answeredCount() < 3"
            class="btn-primary px-8 py-3.5 text-sm md:text-base flex-1 sm:flex-initial disabled:opacity-40 disabled:cursor-not-allowed group shadow-lg"
          >
            <span>Continuar ({{ answeredCount() }}/3)</span>
            <svg class="w-4 h-4 ml-2 inline-block transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
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
  readonly studentName = computed(() => this.student()?.fullName || 'Estudiante');
  readonly studentInitials = computed(() => {
    const name = this.student()?.fullName || 'E';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');
  });

  readonly answers = this.stateService.diagnosticAnswers;
  readonly answeredCount = computed(() => Object.keys(this.answers()).length);

  isSelected(questionId: number, optionIndex: number): boolean {
    return this.answers()[questionId] === optionIndex;
  }

  selectOption(questionId: number, optionIndex: number): void {
    this.stateService.setDiagnosticAnswer(questionId, optionIndex);
  }

  goToBienvenida(): void {
    this.router.navigate(['/bienvenida']);
  }

  onContinue(): void {
    if (this.answeredCount() === 3) {
      this.router.navigate(['/inicio']);
    }
  }
}
