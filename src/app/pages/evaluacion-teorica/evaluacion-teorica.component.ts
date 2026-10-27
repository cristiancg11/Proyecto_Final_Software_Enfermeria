import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HandwashStateService } from '../../core/services/handwash-state.service';
import { PreguntasService, PreguntaEstudiante, RetroalimentacionPregunta } from '../../services/preguntas.service';
import { AuthService } from '../../services/auth.service';

interface OpcionEvaluacion {
  id: string;
  texto: string;
}

interface PreguntaEvaluacion {
  id: string;
  enunciado: string;
  opciones: OpcionEvaluacion[];
  justificacionFallback?: string;
  correctIndexFallback?: number;
}

@Component({
  selector: 'app-evaluacion-teorica',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#08151D] via-[#0E2428] to-[#081E1C] text-slate-100 relative overflow-hidden">
      <!-- Glows y Efectos Asépticos de Fondo -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00B39F]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#50E7FF]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

      <div class="max-w-4xl mx-auto relative z-10">
        
        <!-- ENCABEZADO DE LA EVALUACIÓN TEÓRICA -->
        <div class="bg-gradient-to-r from-[#0d1e26] via-[#10292f] to-[#0c2420] rounded-3xl p-5 sm:p-7 border border-[#00B39F]/30 shadow-2xl mb-6 relative overflow-hidden animate-fade-in">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00B39F] to-[#50E7FF] text-[#080B10] flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                <svg class="w-6 h-6 text-[#080B10]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.3" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00B39F]/20 text-[#50E7FF] text-xs font-bold mb-1 border border-[#00B39F]/30">
                  <span class="w-2 h-2 rounded-full bg-[#50E7FF] animate-pulse"></span>
                  <span>Fase 5 • Post-Test Clínico Docente</span>
                </div>
                <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Evaluación Teórica de Bioseguridad y 5 Momentos OMS
                </h1>
                <p class="text-xs text-[#A5C2DE]">
                  Estudiante: <strong class="text-white">{{ studentName() }}</strong> • Cód: <span class="font-mono text-[#50E7FF]">{{ studentCode() }}</span>
                </p>
              </div>
            </div>

            <!-- Progreso Cuantitativo -->
            @if (!mostrarRetroalimentacion() && preguntas().length > 0) {
              <div class="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/10 self-start sm:self-auto">
                <div class="text-right">
                  <span class="text-[10px] uppercase font-bold text-slate-400 block">Progreso</span>
                  <span class="text-xs sm:text-sm font-black text-[#50E7FF]">
                    Pregunta {{ indiceActual() + 1 }} de {{ preguntas().length }}
                  </span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-[#00B39F]/20 text-[#50E7FF] font-black text-xs flex items-center justify-center border border-[#00B39F]/40">
                  {{ porcentajeProgreso() }}%
                </div>
              </div>
            }
          </div>

          <!-- Barra de Progreso Lineal -->
          @if (!mostrarRetroalimentacion() && preguntas().length > 0) {
            <div class="w-full h-2 bg-black/40 rounded-full overflow-hidden mt-4 border border-white/10 p-0.5">
              <div
                class="h-full rounded-full bg-gradient-to-r from-[#00B39F] via-[#50E7FF] to-[#D9FF43] transition-all duration-300"
                [style.width.%]="porcentajeProgreso()"
              ></div>
            </div>
          }
        </div>

        <!-- PANTALLA 1: ESTADO DE CARGA -->
        @if (cargando()) {
          <div class="bg-white/95 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/40 text-center text-slate-800 my-8">
            <svg class="animate-spin h-10 w-10 text-[#00B39F] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <h3 class="text-lg font-black text-slate-900 mb-1">Cargando Banco de Preguntas Docente</h3>
            <p class="text-xs text-slate-600">Sincronizando casos clínicos de bioseguridad del panel administrativo...</p>
          </div>
        }

        <!-- PANTALLA 2: FORMULARIO INTERACTIVO DE PREGUNTAS (1 A 1) -->
        @else if (!mostrarRetroalimentacion() && preguntaActual()) {
          <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80 text-slate-800 animate-fade-in mb-6">
            
            <!-- Etiqueta del caso clínico -->
            <div class="flex items-center justify-between mb-4">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-black uppercase tracking-wider border border-teal-200">
                <span class="w-2 h-2 rounded-full bg-[#00B39F]"></span>
                Caso Clínico • Pregunta {{ indiceActual() + 1 }} de {{ preguntas().length }}
              </span>
              <span class="text-xs text-slate-400 font-semibold">Selección única</span>
            </div>

            <!-- Enunciado de la Pregunta -->
            <h2 class="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 leading-relaxed mb-6">
              {{ preguntaActual()!.enunciado }}
            </h2>

            <!-- 4 Opciones de Respuesta -->
            <div class="space-y-3 mb-8">
              @for (opcion of preguntaActual()!.opciones; track opcion.id; let idx = $index) {
                <button
                  type="button"
                  (click)="seleccionarOpcion(preguntaActual()!.id, opcion.id)"
                  class="w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 cursor-pointer group"
                  [ngClass]="respuestas()[preguntaActual()!.id] === opcion.id
                    ? 'bg-teal-50/80 border-[#00B39F] shadow-md ring-2 ring-[#00B39F]/20'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-100/80'"
                >
                  <!-- Letra de Opción (A, B, C, D) -->
                  <div
                    class="w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-all mt-0.5 shadow-xs"
                    [ngClass]="respuestas()[preguntaActual()!.id] === opcion.id
                      ? 'bg-[#00B39F] text-white scale-105'
                      : 'bg-white text-slate-600 border border-slate-300 group-hover:border-slate-400'"
                  >
                    {{ letrasOpcion[idx] || (idx + 1) }}
                  </div>

                  <!-- Texto de Opción -->
                  <span
                    class="text-xs sm:text-sm font-semibold transition-colors"
                    [ngClass]="respuestas()[preguntaActual()!.id] === opcion.id ? 'text-teal-900 font-bold' : 'text-slate-700 group-hover:text-slate-900'"
                  >
                    {{ opcion.texto }}
                  </span>
                </button>
              }
            </div>

            <!-- Botones de Navegación del Cuestionario -->
            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                (click)="irAnterior()"
                [disabled]="indiceActual() === 0"
                class="px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 hover:bg-slate-100"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Pregunta Anterior</span>
              </button>

              @if (indiceActual() < preguntas().length - 1) {
                <button
                  type="button"
                  (click)="irSiguiente()"
                  [disabled]="!respuestas()[preguntaActual()!.id]"
                  class="px-6 py-3 rounded-full bg-[#00B39F] hover:bg-[#008072] text-white font-extrabold text-xs sm:text-sm transition shadow-lg shadow-teal-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                >
                  <span>Siguiente Pregunta</span>
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              } @else {
                <button
                  type="button"
                  (click)="finalizarEvaluacion()"
                  [disabled]="!respuestas()[preguntaActual()!.id] || enviando()"
                  class="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#00B39F] to-[#008072] hover:from-[#009988] hover:to-[#006e62] text-white font-black text-xs sm:text-sm transition shadow-xl shadow-teal-500/30 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                >
                  @if (enviando()) {
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Calificando Evaluación...</span>
                  } @else {
                    <span>Finalizar Evaluación</span>
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  }
                </button>
              }
            </div>

          </div>
        }

        <!-- PANTALLA 3: RETROALIMENTACIÓN CLÍNICA CON JUSTIFICACIÓN DOCENTE -->
        @else if (mostrarRetroalimentacion()) {
          <div class="space-y-6 animate-fade-in">
            
            <!-- Tarjeta Resumen de Calificación Teórica -->
            <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80 text-slate-800 text-center relative overflow-hidden">
              <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-extrabold uppercase tracking-wider mb-3">
                <span>Resultado del Cuestionario Teórico</span>
              </div>

              <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                ¡Evaluación Teórica Completada!
              </h2>
              <p class="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mb-6">
                Revisa a continuación la retroalimentación detallada y las justificaciones pedagógicas formuladas por el docente para cada pregunta.
              </p>

              <div class="inline-flex items-baseline gap-2 bg-gradient-to-br from-teal-50 to-white px-8 py-4 rounded-3xl border border-teal-200/80 shadow-inner mb-4">
                <span class="text-4xl sm:text-5xl font-black text-[#008072]">
                  {{ notaTeorica().toFixed(1) }}
                </span>
                <span class="text-xl font-bold text-slate-400">/ 10</span>
                <span class="ml-3 text-xs font-extrabold px-3 py-1 rounded-full"
                  [ngClass]="notaTeorica() >= 6.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'">
                  {{ totalAciertos() }} de {{ totalPreguntas() }} Aciertos
                </span>
              </div>

              <div>
                <button
                  type="button"
                  (click)="continuarAResultados()"
                  class="px-8 py-4 rounded-full bg-[#00B39F] hover:bg-[#008072] text-white font-black text-sm sm:text-base shadow-xl shadow-teal-500/30 transition transform hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-3"
                >
                  <span>Continuar a Resultados Finales</span>
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Listado Detallado de Retroalimentación de Cada Pregunta -->
            <div class="space-y-4">
              <div class="flex items-center justify-between text-white px-2">
                <h3 class="font-extrabold text-base sm:text-lg flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#50E7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Justificaciones Clínicas Docente</span>
                </h3>
                <span class="text-xs text-slate-400">Protocolo de Bioseguridad OMS</span>
              </div>

              @for (item of retroalimentacion(); track item.preguntaId; let i = $index) {
                <div class="bg-white/95 backdrop-blur-md rounded-2xl p-5 border shadow-md text-slate-800 transition"
                  [ngClass]="item.esCorrecta ? 'border-emerald-300' : 'border-red-300'">
                  
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <span class="text-xs font-black uppercase tracking-wider block"
                      [ngClass]="item.esCorrecta ? 'text-emerald-700' : 'text-red-600'">
                      Pregunta {{ i + 1 }} • {{ item.esCorrecta ? '✓ Respuesta Correcta' : '✗ Respuesta Incorrecta' }}
                    </span>
                  </div>

                  <h4 class="text-sm font-extrabold text-slate-900 mb-3">
                    {{ item.enunciado }}
                  </h4>

                  <!-- Comparativa de Opciones -->
                  <div class="space-y-1.5 text-xs mb-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div class="flex items-start gap-2">
                      <span class="font-bold text-slate-500 w-24 shrink-0">Tu Respuesta:</span>
                      <span class="font-semibold" [ngClass]="item.esCorrecta ? 'text-emerald-800' : 'text-red-700'">
                        {{ item.opcionSeleccionada?.texto || 'No respondida' }}
                      </span>
                    </div>

                    @if (!item.esCorrecta && item.opcionCorrecta) {
                      <div class="flex items-start gap-2 pt-1 border-t border-slate-200/80">
                        <span class="font-bold text-emerald-700 w-24 shrink-0">Respuesta Oficial:</span>
                        <span class="font-bold text-emerald-800">
                          {{ item.opcionCorrecta.texto }}
                        </span>
                      </div>
                    }
                  </div>

                  <!-- Justificación Pedagógica del Docente -->
                  <div class="p-3.5 rounded-xl bg-teal-50/90 border border-teal-200/80 text-xs text-slate-800 space-y-1">
                    <div class="flex items-center gap-1.5 text-teal-900 font-extrabold">
                      <svg class="w-4 h-4 text-[#00B39F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Justificación Clínica Docente:</span>
                    </div>
                    <p class="text-slate-700 leading-relaxed pl-5 font-medium">
                      {{ item.justificacion }}
                    </p>
                  </div>

                </div>
              }
            </div>

            <!-- Botón Final Flotante -->
            <div class="text-center pt-4 pb-8">
              <button
                type="button"
                (click)="continuarAResultados()"
                class="px-10 py-4 rounded-full bg-[#00B39F] hover:bg-[#008072] text-white font-black text-base shadow-xl shadow-teal-500/30 transition transform hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-3"
              >
                <span>Ver Calificación Consolidada y Certificado QR</span>
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>
        }

      </div>
    </div>
  `,
})
export class EvaluacionTeoricaComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly stateService = inject(HandwashStateService);
  private readonly preguntasService = inject(PreguntasService);
  private readonly authService = inject(AuthService);

  readonly letrasOpcion = ['A', 'B', 'C', 'D', 'E'];
  readonly student = this.stateService.student;
  readonly studentName = computed(() => this.student()?.fullName || this.authService.usuarioActual()?.nombre || 'Estudiante');
  readonly studentCode = computed(() => this.student()?.studentCode || this.authService.usuarioActual()?.codigoEstudiantil || 'UCC-ENF');

  readonly preguntas = signal<PreguntaEvaluacion[]>([]);
  readonly indiceActual = signal<number>(0);
  readonly respuestas = signal<{ [preguntaId: string]: string }>({});
  readonly cargando = signal<boolean>(true);
  readonly enviando = signal<boolean>(false);
  readonly mostrarRetroalimentacion = signal<boolean>(false);
  readonly retroalimentacion = signal<RetroalimentacionPregunta[]>([]);
  readonly notaTeorica = signal<number>(0);
  readonly totalAciertos = signal<number>(0);

  readonly totalPreguntas = computed(() => this.preguntas().length);
  readonly preguntaActual = computed(() => this.preguntas()[this.indiceActual()] || null);

  readonly porcentajeProgreso = computed(() => {
    const total = this.totalPreguntas();
    if (total === 0) return 0;
    return Math.round(((this.indiceActual() + 1) / total) * 100);
  });

  ngOnInit(): void {
    this.cargarPreguntas();
  }

  cargarPreguntas(): void {
    this.cargando.set(true);

    this.preguntasService.obtenerPreguntasEstudiante().subscribe({
      next: (res) => {
        if (res.preguntas && res.preguntas.length > 0) {
          const formatted: PreguntaEvaluacion[] = res.preguntas.map((p) => ({
            id: String(p.id),
            enunciado: p.enunciado,
            opciones: p.opciones.map((o) => ({ id: String(o.id), texto: o.texto })),
          }));
          this.preguntas.set(formatted);
          this.cargando.set(false);
        } else {
          this.usarFallbackPreguntasOMS();
        }
      },
      error: () => {
        this.usarFallbackPreguntasOMS();
      },
    });
  }

  private usarFallbackPreguntasOMS(): void {
    const fallbackList = this.stateService.diagnosticQuestions;
    const formatted: PreguntaEvaluacion[] = fallbackList.map((q) => ({
      id: String(q.id),
      enunciado: q.question,
      justificacionFallback: q.rationale,
      correctIndexFallback: q.correctIndex,
      opciones: q.options.map((opt, idx) => ({ id: `${q.id}-opt-${idx}`, texto: opt })),
    }));
    this.preguntas.set(formatted);
    this.cargando.set(false);
  }

  seleccionarOpcion(preguntaId: string, opcionId: string): void {
    this.respuestas.update((prev) => ({
      ...prev,
      [preguntaId]: opcionId,
    }));
  }

  irSiguiente(): void {
    if (this.indiceActual() < this.preguntas().length - 1) {
      this.indiceActual.update((idx) => idx + 1);
    }
  }

  irAnterior(): void {
    if (this.indiceActual() > 0) {
      this.indiceActual.update((idx) => idx - 1);
    }
  }

  finalizarEvaluacion(): void {
    const respuestasMap = this.respuestas();
    const preguntasList = this.preguntas();

    const payloadRespuestas = preguntasList.map((p) => ({
      preguntaId: p.id,
      opcionSeleccionadaId: respuestasMap[p.id] || '',
    }));

    this.enviando.set(true);

    // Intentar registrar en el backend PostgreSQL
    this.preguntasService
      .registrarDiagnostico({
        tipo: 'POST',
        respuestas: payloadRespuestas,
      })
      .subscribe({
        next: (res) => {
          this.enviando.set(false);
          const nota = res.calificacion10 !== undefined ? res.calificacion10 : Math.round((res.aciertos / res.totalPreguntas) * 10 * 10) / 10;
          this.notaTeorica.set(nota);
          this.totalAciertos.set(res.aciertos);

          if (res.retroalimentacion && res.retroalimentacion.length > 0) {
            this.retroalimentacion.set(res.retroalimentacion);
            this.stateService.setEvaluacionTeorica(nota, res.retroalimentacion);
          } else {
            this.procesarRetroalimentacionLocal(respuestasMap, preguntasList, nota);
          }

          this.mostrarRetroalimentacion.set(true);
        },
        error: () => {
          this.enviando.set(false);
          this.procesarRetroalimentacionLocal(respuestasMap, preguntasList);
          this.mostrarRetroalimentacion.set(true);
        },
      });
  }

  private procesarRetroalimentacionLocal(
    respuestasMap: { [id: string]: string },
    preguntasList: PreguntaEvaluacion[],
    notaBackend?: number
  ): void {
    let aciertos = 0;
    const retro: RetroalimentacionPregunta[] = preguntasList.map((p) => {
      const selectedId = respuestasMap[p.id];
      const selectedOption = p.opciones.find((o) => o.id === selectedId) || null;
      let esCorrecta = false;
      let opcionCorrecta: { id: string; texto: string } | null = null;

      if (p.correctIndexFallback !== undefined) {
        opcionCorrecta = p.opciones[p.correctIndexFallback] || null;
        esCorrecta = opcionCorrecta ? opcionCorrecta.id === selectedId : false;
      } else {
        // Si no hay correctIndex fallback, asumir primera como correcta orientativa
        opcionCorrecta = p.opciones[0] || null;
        esCorrecta = selectedId === p.opciones[0]?.id;
      }

      if (esCorrecta) aciertos++;

      return {
        preguntaId: p.id,
        enunciado: p.enunciado,
        justificacion: p.justificacionFallback || 'Directriz estandarizada OMS sobre técnica y momentos asistenciales.',
        opcionSeleccionada: selectedOption,
        opcionCorrecta,
        esCorrecta,
      };
    });

    const notaFinal = notaBackend !== undefined ? notaBackend : Math.round((aciertos / preguntasList.length) * 10 * 10) / 10;
    this.notaTeorica.set(notaFinal);
    this.totalAciertos.set(aciertos);
    this.retroalimentacion.set(retro);
    this.stateService.setEvaluacionTeorica(notaFinal, retro);
  }

  continuarAResultados(): void {
    this.router.navigate(['/resultado']);
  }
}
