import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HandwashStateService } from '../../core/services/handwash-state.service';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      <!-- Certificado / Tarjeta de Calificación Principal -->
      <div class="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-white relative overflow-hidden mb-8">
        
        <!-- Efectos de fondo suaves -->
        <div class="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#CFFBF0]/70 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-[#FFE9DE]/70 blur-3xl pointer-events-none"></div>

        <!-- Encabezado de Evaluación -->
        <div class="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 pb-6 mb-8 gap-4">
          <div class="flex items-center gap-3.5 text-center sm:text-left">
            <div class="w-12 h-12 rounded-2xl bg-[#00B39F]/15 flex items-center justify-center text-[#00B39F] shrink-0 shadow-inner">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <span class="text-xs font-bold text-[#00B39F] uppercase tracking-wider">Informe de Desempeño Clínico</span>
              <h2 class="font-heading text-2xl md:text-3xl text-[#0B2B29]">Evaluación Final de Bioseguridad</h2>
            </div>
          </div>

          <div class="text-xs text-[#537571] text-center sm:text-right bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-100">
            <div>Fecha: <strong class="text-[#0B2B29]">{{ currentDate | date:'dd/MM/yyyy, h:mm a' }}</strong></div>
            <div>Estudiante: <strong class="text-[#008072]">{{ studentName() }}</strong></div>
            <div>Código: <span class="font-mono text-[#0B2B29]">{{ studentCode() }}</span></div>
          </div>
        </div>

        <!-- Bloque Central de Calificación -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-8">
          
          <!-- Puntuación Principal sobre 10 -->
          <div class="md:col-span-5 bg-gradient-to-br from-[#E6FBF7] via-white to-[#FFF1EE] rounded-3xl p-6 md:p-8 text-center border border-[#00B39F]/20 shadow-lg relative">
            <span class="text-xs font-bold uppercase tracking-widest text-[#537571] block mb-1">
              Calificación Obtenida
            </span>
            <div class="font-heading text-6xl md:text-7xl font-extrabold tracking-tight text-[#0B2B29] my-2">
              {{ evaluation().overallScore.toFixed(1) }}
              <span class="text-2xl md:text-3xl font-normal text-[#537571]">/10</span>
            </div>

            <!-- Nivel de Desempeño Badge -->
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold mt-2 shadow-sm"
                 [ngClass]="{
                   'bg-[#00B39F] text-white': evaluation().performanceLevel === 'excellent',
                   'bg-[#CFFBF0] text-[#008072] border border-[#00B39F]/30': evaluation().performanceLevel === 'good',
                   'bg-[#FFE9DE] text-[#FF6A4D] border border-[#FF6A4D]/30': evaluation().performanceLevel === 'needs-practice'
                 }">
              @if (evaluation().performanceLevel === 'excellent') {
                <span>★ Técnica Sobresaliente</span>
              } @else if (evaluation().performanceLevel === 'good') {
                <span>✓ Técnica Adecuada</span>
              } @else {
                <span>⚠ Requiere Práctica</span>
              }
            </div>
          </div>

          <!-- Métricas Complementarias -->
          <div class="md:col-span-7 space-y-4">
            <h3 class="font-heading text-xl text-[#0B2B29]">
              {{ evaluation().performanceTitle }}
            </h3>
            <p class="text-sm text-[#537571] leading-relaxed">
              {{ evaluation().performanceDescription }}
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span class="text-[11px] font-bold text-[#537571] uppercase block">Tiempo Total</span>
                <span class="text-lg font-bold text-[#008072]">{{ evaluation().totalSeconds }}s</span>
              </div>

              <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span class="text-[11px] font-bold text-[#537571] uppercase block">Pasos Óptimos</span>
                <span class="text-lg font-bold text-[#0B2B29]">{{ optimalStepsCount() }} de 6</span>
              </div>

              <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 col-span-2 sm:col-span-1">
                <span class="text-[11px] font-bold text-[#537571] uppercase block">Quiz Diagnóstico</span>
                <span class="text-lg font-bold text-[#FF6A4D]">{{ evaluation().quizScore }} de {{ evaluation().totalQuizQuestions }} Aciertos</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Botones de Acción Inmediata -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            (click)="repeatPractice()"
            class="btn-primary py-4 px-8 text-base flex items-center gap-3 w-full sm:w-auto shadow-lg hover:scale-105 group"
          >
            <svg class="w-5 h-5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Repetir Práctica</span>
          </button>

          <button
            type="button"
            (click)="windowPrint()"
            class="btn-secondary py-3.5 px-6 text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <svg class="w-4 h-4 text-[#008072]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Imprimir / Guardar Informe</span>
          </button>

          <button
            type="button"
            (click)="restartAll()"
            class="text-xs text-[#537571] hover:text-[#FF6A4D] font-semibold transition py-2"
          >
            Nueva sesión de estudiante
          </button>
        </div>
      </div>

      <!-- Desglose Clínico de los 6 Pasos -->
      <div class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-heading text-2xl text-[#0B2B29]">
            Desglose Paso a Paso
          </h3>
          <span class="text-xs font-medium text-[#537571]">
            Rango esperado: <strong>3.0s — 8.0s</strong>
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (rec of evaluation().records; track rec.stepNumber) {
            <div class="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-md hover:shadow-lg transition-all duration-200">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-xl bg-[#00B39F] text-white font-bold text-xs flex items-center justify-center">
                    {{ rec.stepNumber }}
                  </div>
                  <h4 class="text-sm font-bold text-[#0B2B29]">{{ rec.stepTitle }}</h4>
                </div>

                <!-- Estado Badge -->
                <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                      [ngClass]="{
                        'bg-[#CFFBF0] text-[#008072] border border-[#00B39F]/20': rec.status === 'optimal',
                        'bg-[#FFE9DE] text-[#FF6A4D] border border-[#FF6A4D]/20': rec.status === 'too-fast',
                        'bg-amber-100 text-amber-700 border border-amber-200': rec.status === 'too-slow'
                      }">
                  @if (rec.status === 'optimal') {
                    ✓ Óptimo
                  } @else if (rec.status === 'too-fast') {
                    ⚠ Rápido
                  } @else {
                    ⏱ Extenso
                  }
                </span>
              </div>

              <!-- Tiempo y Puntuación -->
              <div class="flex items-baseline justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 mb-3">
                <div>
                  <span class="text-[#537571]">Tiempo: </span>
                  <strong class="text-sm text-[#0B2B29]">{{ rec.seconds }} s</strong>
                </div>
                <div>
                  <span class="text-[#537571]">Puntos: </span>
                  <strong class="text-sm text-[#008072]">{{ rec.score.toFixed(2) }} / 1.67</strong>
                </div>
              </div>

              <!-- Feedback del Paso -->
              <p class="text-xs text-[#1E4845] leading-relaxed">
                {{ rec.feedback }}
              </p>
            </div>
          }
        </div>
      </div>

      <!-- Revisión del Cuestionario Diagnóstico -->
      <div class="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/80 shadow-md">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-xl bg-[#FFE9DE] text-[#FF6A4D] flex items-center justify-center font-bold text-sm">
            ?
          </div>
          <h3 class="font-heading text-xl text-[#0B2B29]">Revisión del Cuestionario Diagnóstico</h3>
        </div>

        <div class="space-y-4">
          @for (q of questions; track q.id) {
            <div class="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs md:text-sm">
              <div class="font-bold text-[#0B2B29] mb-1">
                {{ q.id }}. {{ q.question }}
              </div>
              <div class="text-[#008072] font-semibold mt-1">
                Respuesta correcta: {{ q.options[q.correctIndex] }}
              </div>
              <p class="text-[#537571] mt-1 text-xs">
                {{ q.rationale }}
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ResultadoComponent {
  private readonly router = inject(Router);
  private readonly stateService = inject(HandwashStateService);

  readonly currentDate = new Date();
  readonly questions = this.stateService.diagnosticQuestions;
  readonly student = this.stateService.student;
  readonly evaluation = this.stateService.evaluationResult;

  readonly studentName = computed(() => this.student()?.fullName || 'Estudiante Evaluado');
  readonly studentCode = computed(() => this.student()?.studentCode || 'No registrado');

  readonly optimalStepsCount = computed(() => {
    return this.evaluation().records.filter((r) => r.status === 'optimal').length;
  });

  repeatPractice(): void {
    this.stateService.resetPractice();
    this.router.navigate(['/practica']);
  }

  restartAll(): void {
    this.stateService.resetAll();
    this.router.navigate(['/bienvenida']);
  }

  windowPrint(): void {
    window.print();
  }
}
