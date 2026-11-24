import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HandwashStateService } from '../../core/services/handwash-state.service';
import { PracticasService } from '../../services/practicas.service';

export type FiltroModo = 'todos' | 'guiado' | 'simulacion' | 'desafio';

export interface RegistroHistorialPractica {
  id: string;
  modo: 'guiado' | 'simulacion' | 'desafio';
  tituloModo: string;
  iconoModo: string;
  fecha: string;
  duracionSegundos: number;
  errores: number;
  detalleError?: string;
  puntuacion: number;
  aprobado: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-fade-in text-slate-100 max-w-7xl mx-auto">
      
      <!-- 1. ENCABEZADO DE BIENVENIDA CLÍNICA Y ACCESO RÁPIDO -->
      <div class="relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-sm overflow-hidden">
        <!-- Destellos lumínicos clínicos suaves -->
        <div class="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-sky-100/60 blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-teal-100/60 blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Facultad de Enfermería • Simulación Clínica OMS</span>
            </div>
            
            <h1 class="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Bienvenido/a, <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-700 via-teal-700 to-emerald-700">{{ nombreEstudiante() }}</span>
            </h1>
            
            <p class="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Monitoreo continuo de bioseguridad, biomecánica en tiempo real con MediaPipe y acreditación del lavado de manos clínico.
            </p>
          </div>

          <!-- Botones de Acción Rápida -->
          <div class="flex flex-wrap items-center gap-3 shrink-0">
            <a
              routerLink="/practica"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <span>🖐️ Iniciar Práctica Guiada</span>
            </a>

            <a
              routerLink="/evaluacion-practica"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-sky-700 border border-slate-300 font-bold text-xs sm:text-sm shadow-xs hover:shadow-sm transition-all duration-300 cursor-pointer"
            >
              <span>🎯 Simulación Cámara IA</span>
            </a>

            <a
              routerLink="/cuanto-sabes"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm shadow-xs hover:shadow-sm transition-all duration-300 cursor-pointer"
            >
              <span>🧠 ¿Cuánto sabes?</span>
            </a>
          </div>
        </div>
      </div>

      <!-- 2. TARJETAS DE RESUMEN CON MÉTRICAS CLAVE -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        <!-- Métrica 1: Puntaje Promedio -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-sky-300 transition-all duration-300">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Puntaje Promedio</span>
            <div class="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="font-heading text-3xl font-extrabold text-slate-900 tracking-tight">{{ puntajePromedio().toFixed(1) }}</span>
            <span class="text-xs text-slate-500 font-medium">/ 10.0</span>
            <span class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
              [ngClass]="puntajePromedio() > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'">
              {{ puntajePromedio() >= 8.5 ? 'Óptimo OMS' : puntajePromedio() > 0 ? 'Aprobado' : 'Sin Prácticas' }}
            </span>
          </div>
          <div class="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-sky-500 to-teal-500 h-1.5 rounded-full transition-all duration-500" [style.width.%]="(puntajePromedio() / 10) * 100"></div>
          </div>
        </div>

        <!-- Métrica 2: Mejor Puntaje -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all duration-300">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mejor Puntaje</span>
            <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="font-heading text-3xl font-extrabold text-amber-600 tracking-tight">{{ mejorPuntaje().toFixed(1) }}</span>
            <span class="text-xs text-slate-500 font-medium">/ 10.0</span>
            <span class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
              [ngClass]="mejorPuntaje() > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200'">
              {{ mejorPuntaje() > 0 ? 'Récord' : 'Sin Récord' }}
            </span>
          </div>
          <p class="mt-3 text-[11px] text-slate-500">
            {{ mejorPuntaje() > 0 ? 'Acreditación clínica registrada' : 'Completa tu primera práctica para registrar tu récord' }}
          </p>
        </div>

        <!-- Métrica 3: Tiempo Acumulado -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-sky-300 transition-all duration-300">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiempo Acumulado</span>
            <div class="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="font-heading text-3xl font-extrabold text-slate-900 tracking-tight">{{ tiempoAcumuladoMinutos() }}</span>
            <span class="text-xs text-slate-500 font-medium">minutos</span>
            <span class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              Fricción
            </span>
          </div>
          <p class="mt-3 text-[11px] text-slate-500">
            {{ tiempoAcumuladoMinutos() > 0 ? 'Cumplimiento del rango OMS (40-60s por ciclo)' : '0 minutos de práctica registrados' }}
          </p>
        </div>

        <!-- Métrica 4: Pasos Dominados -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-teal-300 transition-all duration-300">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Técnica Biomecánica</span>
            <div class="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="font-heading text-3xl font-extrabold text-teal-700 tracking-tight">{{ pasosDominados() }} de 11</span>
            <span class="text-xs text-slate-500 font-medium">Pasos OMS</span>
            <span class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
              [ngClass]="porcentajePasosDominados() > 0 ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-slate-100 text-slate-500 border border-slate-200'">
              {{ porcentajePasosDominados() }}%
            </span>
          </div>
          <p class="mt-3 text-[11px] text-slate-500">
            {{ pasosDominados() === 11 ? 'Protocolo completo de 11 pasos dominado' : 'Completa la práctica guiada para dominar los 11 pasos' }}
          </p>
        </div>
      </div>

      <!-- 3. ACCESOS DIRECTOS A MODOS CLÍNICOS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        <!-- Opción 1: Práctica Guiada -->
        <a
          routerLink="/practica"
          class="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-teal-400 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 block group"
        >
          <div class="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center text-xl mb-3.5 group-hover:scale-105 transition-transform">
            🖐️
          </div>
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-heading text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              Práctica Guiada OMS
            </h3>
            <span class="text-teal-700 text-xs font-bold">11 Pasos →</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            Entrenamiento asistido con animaciones clínicas, voz de acompañamiento y cronómetro de estabilidad.
          </p>
        </a>

        <!-- Opción 2: Simulación Cámara IA -->
        <a
          routerLink="/evaluacion-practica"
          class="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-sky-400 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 block group"
        >
          <div class="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center text-xl mb-3.5 group-hover:scale-105 transition-transform">
            🎯
          </div>
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-heading text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
              Simulación Cámara IA
            </h3>
            <span class="text-sky-700 text-xs font-bold">Evaluación →</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            Evaluación autónoma con MediaPipe HandLandmarker. Análisis de postura, fricción y tiempo sin asistencia.
          </p>
        </a>

        <!-- Opción 3: Cuestionario Teórico OMS y Encuesta -->
        <a
          routerLink="/evaluacion-teorica"
          class="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-teal-400 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 block group relative overflow-hidden"
        >
          <div class="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center text-xl mb-3.5 group-hover:scale-105 transition-transform">
            📋
          </div>
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-heading text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              Cuestionario Teórico OMS
            </h3>
            <span class="text-teal-700 text-xs font-bold">Post-Test →</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            Evaluación oficial sobre los 5 momentos y técnica aséptica OMS, con retroalimentación inmediata.
          </p>
        </a>

        <!-- Opción 4: Minijuego ¿Cuánto sabes? -->
        <a
          routerLink="/cuanto-sabes"
          class="bg-gradient-to-br from-amber-50/60 to-white p-5 rounded-2xl border border-amber-300/80 hover:border-amber-500 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 block group relative overflow-hidden"
        >
          <div class="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center text-xl mb-3.5 group-hover:scale-105 transition-transform">
            🧠
          </div>
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-heading text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
              ¿Cuánto sabes?
            </h3>
            <span class="text-amber-700 text-xs font-bold">Reto ⚡ →</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            Trivia contrarreloj de 7 preguntas difíciles sobre microbiología y protocolos OMS. ¡Compite en el podio!
          </p>
        </a>
      </div>

      <!-- 4. SECCIÓN DE HISTORIAL Y PRÁCTICAS RECIENTES CON FILTROS -->
      <div class="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 class="font-heading text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>📋</span> Historial de Prácticas y Evaluaciones
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Registro trazable de sesiones de entrenamiento clínico y tiempos de asepsia
            </p>
          </div>

          <!-- Filtros de Modo -->
          <div class="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              (click)="filtroActivo.set('todos')"
              class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              [ngClass]="filtroActivo() === 'todos' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            >
              Todos ({{ historialCompleto().length }})
            </button>
            <button
              type="button"
              (click)="filtroActivo.set('guiado')"
              class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              [ngClass]="filtroActivo() === 'guiado' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            >
              Práctica
            </button>
            <button
              type="button"
              (click)="filtroActivo.set('simulacion')"
              class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              [ngClass]="filtroActivo() === 'simulacion' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            >
              Simulación IA
            </button>
          </div>
        </div>

        <!-- Tabla de Registros Interactiva -->
        <div class="overflow-x-auto -mx-5 sm:mx-0">
          <table class="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th class="py-3 px-4">Modo</th>
                <th class="py-3 px-4">Fecha / Hora</th>
                <th class="py-3 px-4">Duración</th>
                <th class="py-3 px-4">Errores Biomecánicos</th>
                <th class="py-3 px-4">Puntuación</th>
                <th class="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (item of historialFiltrado(); track item.id) {
                <tr class="hover:bg-slate-50/70 transition-colors">
                  
                  <!-- Modo -->
                  <td class="py-3 px-4">
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border"
                      [ngClass]="{
                        'bg-teal-50 text-teal-700 border-teal-200': item.modo === 'guiado',
                        'bg-sky-50 text-sky-700 border-sky-200': item.modo === 'simulacion',
                        'bg-amber-50 text-amber-800 border-amber-200': item.modo === 'desafio'
                      }"
                    >
                      <span>{{ item.iconoModo }}</span>
                      <span>{{ item.tituloModo }}</span>
                    </span>
                  </td>

                  <!-- Fecha -->
                  <td class="py-3 px-4 text-slate-600">
                    {{ item.fecha }}
                  </td>

                  <!-- Duración -->
                  <td class="py-3 px-4 font-mono text-slate-700">
                    {{ item.duracionSegundos }}s
                  </td>

                  <!-- Errores -->
                  <td class="py-3 px-4">
                    @if (item.errores === 0) {
                      <span class="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <span>✓</span> 0 errores (Técnica limpia)
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 text-amber-800 font-semibold" [title]="item.detalleError || ''">
                        <span>⚠️</span> {{ item.errores }} {{ item.errores === 1 ? 'error' : 'errores' }}
                      </span>
                    }
                  </td>

                  <!-- Puntuación -->
                  <td class="py-3 px-4">
                    <span
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs border"
                      [ngClass]="item.puntuacion >= 9.0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'"
                    >
                      {{ item.puntuacion.toFixed(1) }} / 10
                    </span>
                  </td>

                  <!-- Acción -->
                  <td class="py-3 px-4 text-center">
                    <button
                      type="button"
                      (click)="repetirModo(item.modo)"
                      class="px-3 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-800 border border-sky-200 transition-all font-semibold cursor-pointer text-[11px]"
                    >
                      Repetir
                    </button>
                  </td>
                </tr>
              }

              @if (historialFiltrado().length === 0) {
                <tr>
                  <td colspan="6" class="py-10 text-center">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <span class="text-3xl">📋</span>
                      <p class="text-sm font-semibold text-slate-700">Aún no tienes prácticas ni evaluaciones registradas</p>
                      <p class="text-xs text-slate-400 max-w-sm">Tus métricas iniciarán en cero y subirán en tiempo real a medida que completes las prácticas guiadas y simulaciones con IA.</p>
                      <button
                        type="button"
                        (click)="repetirModo('guiado')"
                        class="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        <span>🖐️</span> Iniciar Práctica de 11 Pasos
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200">
          <span>Mostrando {{ historialFiltrado().length }} de {{ historialCompleto().length }} registros</span>
          <span class="text-[11px] text-teal-600">Directrices Oficiales OMS • Lavado de Manos Clínico (11 Pasos)</span>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly stateService = inject(HandwashStateService);
  private readonly practicasService = inject(PracticasService);

  readonly student = this.stateService.student;
  readonly usuarioActual = this.authService.usuarioActual;

  readonly nombreEstudiante = computed(
    () =>
      this.student()?.fullName ||
      this.usuarioActual()?.nombre ||
      'Estudiante de Enfermería'
  );

  readonly codigoEstudiante = computed(
    () =>
      this.student()?.studentCode ||
      this.usuarioActual()?.codigoEstudiantil ||
      '2026-ENF-UCC'
  );

  readonly filtroActivo = signal<FiltroModo>('todos');

  readonly historialCompleto = signal<RegistroHistorialPractica[]>([]);

  readonly puntajePromedio = computed<number>(() => {
    const list = this.historialCompleto();
    if (list.length > 0) {
      const sum = list.reduce((acc, item) => acc + item.puntuacion, 0);
      return Math.round((sum / list.length) * 10) / 10;
    }
    const evalData = this.stateService.evaluationResult();
    if (evalData && (evalData.notaFinal !== undefined || evalData.overallScore !== undefined)) {
      const nota = evalData.notaFinal ?? evalData.overallScore ?? 0;
      return Math.round(nota * 10) / 10;
    }
    return 0.0;
  });

  readonly mejorPuntaje = computed<number>(() => {
    const list = this.historialCompleto();
    if (list.length > 0) {
      const max = Math.max(...list.map((item) => item.puntuacion));
      return Math.round(max * 10) / 10;
    }
    const evalData = this.stateService.evaluationResult();
    if (evalData && (evalData.notaFinal !== undefined || evalData.overallScore !== undefined)) {
      const nota = evalData.notaFinal ?? evalData.overallScore ?? 0;
      return Math.round(nota * 10) / 10;
    }
    return 0.0;
  });

  readonly tiempoAcumuladoMinutos = computed<number>(() => {
    const list = this.historialCompleto();
    if (list.length > 0) {
      const totalSeg = list.reduce((acc, item) => acc + (item.duracionSegundos || 0), 0);
      return Math.round(totalSeg / 60);
    }
    const evalData = this.stateService.evaluationResult();
    if (evalData && evalData.totalSeconds) {
      return Math.round(evalData.totalSeconds / 60);
    }
    return 0;
  });

  readonly pasosDominados = computed<number>(() => {
    if (this.historialCompleto().length > 0) return 11;
    const records = this.stateService.stepRecords();
    if (records && records.length > 0) return Math.min(11, records.length);
    if (this.stateService.isStepUnlocked(4)) return 11;
    return 0;
  });

  readonly porcentajePasosDominados = computed<number>(() => {
    return Math.round((this.pasosDominados() / 11) * 100);
  });

  readonly historialFiltrado = computed(() => {
    const filtro = this.filtroActivo();
    const lista = this.historialCompleto();
    if (filtro === 'todos') {
      return lista;
    }
    return lista.filter((item) => item.modo === filtro);
  });

  ngOnInit(): void {
    this.cargarHistorialReal();
  }

  private cargarHistorialReal(): void {
    const registros: RegistroHistorialPractica[] = [];
    const codigo = this.codigoEstudiante();

    // 1. Intentar cargar desde localStorage si hay intentos previos guardados para este usuario
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`manos_seguras_historial_${codigo}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            registros.push(...parsed);
          }
        }
      } catch {}
    }

    // 2. Si el stateService tiene una evaluación reciente y aún no está en la lista
    const evalResult = this.stateService.evaluationResult();
    if (evalResult && (evalResult.overallScore !== undefined || evalResult.notaFinal !== undefined)) {
      const notaReal = Number((evalResult.notaFinal ?? evalResult.overallScore ?? 0).toFixed(1));
      const yaExiste = registros.some((r) => r.id === 'sesion-actual');
      if (!yaExiste && notaReal > 0) {
        registros.unshift({
          id: 'sesion-actual',
          modo: 'simulacion',
          tituloModo: 'Simulación Cámara IA',
          iconoModo: '🎯',
          fecha: 'Hoy (Sesión reciente)',
          duracionSegundos: evalResult.totalSeconds || 60,
          errores: evalResult.records ? evalResult.records.filter((r) => r.status !== 'optimal').length : 0,
          puntuacion: notaReal,
          aprobado: notaReal >= 6.0,
        });
      }
    }

    this.historialCompleto.set(registros);
  }

  repetirModo(modo: 'guiado' | 'simulacion' | 'desafio'): void {
    if (modo === 'guiado') {
      this.router.navigate(['/practica']);
    } else if (modo === 'simulacion') {
      this.router.navigate(['/evaluacion-practica']);
    } else if (modo === 'desafio') {
      this.router.navigate(['/evaluacion-teorica']);
    }
  }
}
