import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HandwashStateService } from '../../core/services/handwash-state.service';
import { PracticasService, RegistrarPracticaResponse } from '../../services/practicas.service';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
              <span class="text-xs font-bold text-[#008072] uppercase tracking-wider">Informe de Desempeño Clínico</span>
              <h2 class="font-heading text-2xl md:text-3xl text-slate-900 font-bold">Evaluación Final de Bioseguridad</h2>
            </div>
          </div>

          <div class="text-xs text-slate-600 text-center sm:text-right bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/80">
            <div>Fecha: <strong class="text-slate-900">{{ currentDate | date:'dd/MM/yyyy, h:mm a' }}</strong></div>
            <div>Estudiante: <strong class="text-[#008072]">{{ studentName() }}</strong></div>
            <div>Código: <span class="font-mono text-slate-900 font-semibold">{{ studentCode() }}</span></div>
          </div>
        </div>

        <!-- Bloque Central de Calificación: 3 Métricas Consolidadas -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-8">
          
          <!-- Puntuación Consolidada sobre 10 -->
          <div class="md:col-span-5 bg-gradient-to-br from-[#E6FBF7] via-white to-[#FFF1EE] rounded-3xl p-6 text-center border border-[#00B39F]/20 shadow-lg flex flex-col justify-between relative">
            <div>
              <span class="text-[11px] font-black uppercase tracking-widest text-[#008072] block mb-1">
                Calificación Final Consolidada
              </span>
              <div class="font-heading text-5xl sm:text-6xl font-black tracking-tight text-slate-900 my-2">
                {{ evaluation().overallScore.toFixed(1) }}
                <span class="text-2xl font-normal text-slate-400">/10</span>
              </div>
            </div>

            <!-- Nivel de Desempeño Badge -->
            <div class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm mx-auto"
                 [ngClass]="{
                   'bg-[#00B39F] text-white': evaluation().overallScore >= 8.5,
                   'bg-[#CFFBF0] text-[#008072] border border-[#00B39F]/40': evaluation().overallScore >= 6.0 && evaluation().overallScore < 8.5,
                   'bg-[#FFE9DE] text-[#FF6A4D] border border-[#FF6A4D]/40': evaluation().overallScore < 6.0
                 }">
              @if (evaluation().overallScore >= 8.5) {
                <span>★ Desempeño Sobresaliente (Aprobado)</span>
              } @else if (evaluation().overallScore >= 6.0) {
                <span>✓ Competencia Aséptica Acreditada (Aprobado)</span>
              } @else {
                <span>⚠ Requiere Refuerzo y Práctica (Reprobado)</span>
              }
            </div>

            <div class="text-[11px] text-slate-500 font-medium mt-3 border-t border-slate-100 pt-2">
              Ponderación oficial: 60% Técnica Biomecánica + 40% Evaluación Teórica
            </div>
          </div>

          <!-- Desglose de las 2 Evaluaciones (Práctica + Teórica) -->
          <div class="md:col-span-7 flex flex-col justify-between space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              <!-- Tarjeta 1: Nota Práctica -->
              <div class="bg-gradient-to-br from-[#E8FCF7] to-white p-4 sm:p-5 rounded-2xl border border-[#00B39F]/30 shadow-xs flex flex-col justify-between">
                <div>
                  <span class="inline-block px-2.5 py-0.5 rounded-full bg-[#00B39F]/15 text-[#008072] font-black text-[10px] uppercase mb-1">
                    60% Ponderación
                  </span>
                  <h4 class="text-xs sm:text-sm font-extrabold text-slate-900">1. Práctica Biomecánica</h4>
                  <p class="text-[11px] text-slate-600">6 pasos asistidos por cámara y MediaPipe</p>
                </div>
                <div class="mt-3 flex items-baseline justify-between border-t border-[#00B39F]/10 pt-2">
                  <span class="text-xs text-slate-500 font-semibold">Desempeño:</span>
                  <span class="text-2xl font-black text-[#008072]">
                    {{ (evaluation().notaPractica ?? 0).toFixed(1) }} <span class="text-xs text-slate-400">/ 10</span>
                  </span>
                </div>
              </div>

              <!-- Tarjeta 2: Nota Teórica -->
              <div class="bg-gradient-to-br from-[#EFF6FF] to-white p-4 sm:p-5 rounded-2xl border border-sky-300 shadow-xs flex flex-col justify-between">
                <div>
                  <span class="inline-block px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-black text-[10px] uppercase mb-1">
                    40% Ponderación
                  </span>
                  <h4 class="text-xs sm:text-sm font-extrabold text-slate-900">2. Cuestionario Teórico</h4>
                  <p class="text-[11px] text-slate-600">Fundamentos y 5 Momentos OMS</p>
                </div>
                <div class="mt-3 flex items-baseline justify-between border-t border-sky-100 pt-2">
                  <span class="text-xs text-slate-500 font-semibold">Desempeño:</span>
                  <span class="text-2xl font-black text-sky-700">
                    {{ (evaluation().notaTeorica ?? 0).toFixed(1) }} <span class="text-xs text-slate-400">/ 10</span>
                  </span>
                </div>
              </div>

            </div>

            <!-- Métricas Secundarias -->
            <div class="grid grid-cols-2 gap-3 pt-1">
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                <span class="text-[10px] font-bold text-slate-500 uppercase block">Tiempo en Cámara</span>
                <span class="text-base font-extrabold text-[#008072]">{{ evaluation().totalSeconds }}s</span>
              </div>
              <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                <span class="text-[10px] font-bold text-slate-500 uppercase block">Pasos Óptimos</span>
                <span class="text-base font-extrabold text-slate-900">{{ optimalStepsCount() }} de 6</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Tarjeta de Certificado Oficial Emitido y Validación QR -->
        @if (codigoCertificado()) {
          <div class="mt-8 bg-gradient-to-r from-[#0B2B29] via-[#0E2824] to-[#091E1C] rounded-3xl p-6 md:p-8 border border-[#00B39F]/40 shadow-xl text-white relative overflow-hidden">
            <div class="flex flex-col md:flex-row items-center justify-between gap-6">
              <div class="space-y-2 text-center md:text-left">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00B39F]/20 text-[#50E7FF] text-xs font-black uppercase tracking-wider">
                  <span>✓ Certificado Institucional Emitido</span>
                </div>
                <h3 class="text-xl md:text-2xl font-black text-white">
                  Acreditación de Competencia Clínica OMS
                </h3>
                <p class="text-xs text-[#C5D7E8] max-w-lg leading-relaxed">
                  Tu técnica ha sido acreditada y registrada en la base de datos institucional. Puedes verificar la autenticidad escaneando el código QR o ingresando al enlace directo.
                </p>
                <div class="pt-1">
                  <span class="text-xs text-slate-400 block">Código Único de Validación:</span>
                  <span class="font-mono text-sm md:text-base font-black text-[#50E7FF] bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 inline-block mt-1 select-all">
                    {{ codigoCertificado() }}
                  </span>
                </div>
              </div>

              <!-- Código QR y Botón de Validación -->
              <div class="flex flex-col items-center shrink-0 bg-white p-3 rounded-2xl shadow-lg border border-white/20">
                <img
                  [src]="qrCodeUrl()"
                  alt="QR Verificación Certificado"
                  class="w-28 h-28 object-contain rounded-lg"
                />
                <a
                  [routerLink]="['/validar', codigoCertificado()]"
                  target="_blank"
                  class="mt-2 text-[11px] font-extrabold text-[#008072] hover:text-[#00B39F] transition flex items-center gap-1"
                >
                  <span>Abrir Verificación</span>
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        }

        <!-- Botones de Acción Inmediata -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-slate-100 mt-8">
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
            <svg class="w-4 h-4 text-[#50E7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Imprimir / Guardar Informe</span>
          </button>

          <button
            type="button"
            (click)="restartAll()"
            class="text-xs text-slate-500 hover:text-[#FF6A4D] font-semibold transition py-2"
          >
            Nueva sesión de estudiante
          </button>
        </div>
      </div>

      <!-- Desglose Clínico de los 6 Pasos -->
      <div class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-heading text-2xl text-[#F5F8FF] font-bold drop-shadow-[0_2px_12px_rgba(80,231,255,0.2)]">
            Desglose Paso a Paso
          </h3>
          <span class="text-xs font-medium text-[#C5D7E8]">
            Rango esperado: <strong class="text-[#50E7FF]">3.0s — 8.0s</strong>
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (rec of evaluation().records; track rec.stepNumber) {
            <div class="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-md hover:shadow-lg transition-all duration-200">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-xl bg-[#00B39F] text-white font-bold text-xs flex items-center justify-center">
                    {{ rec.stepNumber }}
                  </div>
                  <h4 class="text-sm font-bold text-slate-900">{{ rec.stepTitle }}</h4>
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
              <div class="flex items-baseline justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 mb-3 border border-slate-100">
                <div>
                  <span class="text-slate-500">Tiempo: </span>
                  <strong class="text-sm text-slate-900">{{ rec.seconds }} s</strong>
                </div>
                <div>
                  <span class="text-slate-500">Puntos: </span>
                  <strong class="text-sm text-[#008072]">{{ rec.score.toFixed(2) }} / 1.67</strong>
                </div>
              </div>

              <!-- Feedback del Paso -->
              <p class="text-xs text-slate-700 leading-relaxed">
                {{ rec.feedback }}
              </p>
            </div>
          }
        </div>
      </div>

      <!-- Revisión del Cuestionario Diagnóstico -->
      <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/80 shadow-md">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-xl bg-[#FFE9DE] text-[#FF6A4D] flex items-center justify-center font-bold text-sm">
            ?
          </div>
          <h3 class="font-heading text-xl text-slate-900 font-bold">Revisión del Cuestionario Diagnóstico</h3>
        </div>

        <div class="space-y-4">
          @for (q of questions; track q.id) {
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs md:text-sm">
              <div class="font-bold text-slate-900 mb-1">
                {{ q.id }}. {{ q.question }}
              </div>
              <div class="text-[#008072] font-semibold mt-1">
                Respuesta correcta: {{ q.correctIndex !== undefined ? q.options[q.correctIndex] : 'Registrada en plataforma' }}
              </div>
              @if (q.rationale) {
                <p class="text-slate-600 mt-1 text-xs">
                  {{ q.rationale }}
                </p>
              }
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
  private readonly practicasService = inject(PracticasService);

  readonly currentDate = new Date();
  readonly questions = this.stateService.diagnosticQuestions;
  readonly student = this.stateService.student;
  readonly evaluation = this.stateService.evaluationResult;
  readonly codigoCertificado = signal<string | null>(null);
  private intentoGuardado = false;

  readonly studentName = computed(() => this.student()?.fullName || 'Estudiante Evaluado');
  readonly studentCode = computed(() => this.student()?.studentCode || 'No registrado');

  readonly qrCodeUrl = computed(() => {
    const cod = this.codigoCertificado();
    if (!cod) return '';
    const fullUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/validar/${encodeURIComponent(cod)}`
      : `http://localhost:4200/validar/${encodeURIComponent(cod)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(fullUrl)}`;
  });

  readonly optimalStepsCount = computed(() => {
    return this.evaluation().records.filter((r) => r.status === 'optimal').length;
  });

  constructor() {
    this.guardarIntentoPractica();
  }

  private guardarIntentoPractica(): void {
    if (this.intentoGuardado) return;
    const evalData = this.evaluation();
    if (!evalData.records || evalData.records.length === 0) return;

    this.intentoGuardado = true;
    const notaPractica = evalData.notaPractica !== undefined ? evalData.notaPractica : 0;
    const notaTeorica = evalData.notaTeorica !== undefined ? evalData.notaTeorica : 0;
    const notaFinal = evalData.notaFinal !== undefined ? evalData.notaFinal : evalData.overallScore;
    const aprobado = notaFinal >= 6.0;

    this.practicasService
      .registrarPractica({
        calificacion: notaFinal,
        notaPractica,
        notaTeorica,
        notaFinal,
        aprobado,
        detallePasosJson: {
          notaPractica,
          notaTeorica,
          notaFinal,
          records: evalData.records,
          totalSeconds: evalData.totalSeconds,
          performanceLevel: evalData.performanceLevel,
          student: this.student(),
          retroalimentacionTeorica: evalData.retroalimentacionTeorica || [],
        },
      })
      .subscribe({
        next: (res: RegistrarPracticaResponse) => {
          if (res.codigoCertificado) {
            this.codigoCertificado.set(res.codigoCertificado);
          } else if (res.certificado?.codigoVerificacion) {
            this.codigoCertificado.set(res.certificado.codigoVerificacion);
          }
        },
        error: (err: unknown) => {
          console.error('Error al persistir intento de práctica:', err);
        },
      });
  }

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
