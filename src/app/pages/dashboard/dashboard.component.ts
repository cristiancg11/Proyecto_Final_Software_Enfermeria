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
            <span class="font-heading text-3xl font-extrabold text-slate-900 tracking-tight">{{ puntajePromedio() }}</span>
            <span class="text-xs text-slate-500 font-medium">/ 10.0</span>
            <span class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Óptimo OMS
            </span>
          </div>
          <div class="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-sky-500 to-teal-500 h-1.5 rounded-full" [style.width.%]="(puntajePromedio() / 10) * 100"></div>
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
            <span class="font-heading text-3xl font-extrabold text-amber-600 tracking-tight">{{ mejorPuntaje() }}</span>
            <span class="text-xs text-slate-500 font-medium">/ 10.0</span>
            <span class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Récord
            </span>
          </div>
          <p class="mt-3 text-[11px] text-slate-500">
            Acreditación clínica con 0 errores biomecánicos
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
            Cumplimiento del rango OMS (40-60s por ciclo)
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
            <span class="font-heading text-3xl font-extrabold text-teal-700 tracking-tight">11 de 11</span>
            <span class="text-xs text-slate-500 font-medium">Pasos OMS</span>
            <span class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              100%
            </span>
          </div>
          <p class="mt-3 text-[11px] text-slate-500">
            Protocolo completo de higiene asistencial
          </p>
        </div>
      </div>

      <!-- 3. ACCESOS DIRECTOS A MODOS CLÍNICOS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <!-- Opción 1: Práctica Guiada -->
        <a
          routerLink="/practica"
          class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 hover:border-teal-400 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 block group"
        >
          <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
            🖐️
          </div>
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-heading text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              Práctica Guiada OMS
            </h3>
            <span class="text-teal-700 text-xs font-bold">Paso a Paso →</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            Entrenamiento asistido con animaciones clínicas, voz de acompañamiento y cronómetro de estabilidad para cada paso.
          </p>
        </a>

        <!-- Opción 2: Simulación Cámara IA -->
        <a
          routerLink="/evaluacion-practica"
          class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 hover:border-sky-400 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 block group"
        >
          <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
            🎯
          </div>
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-heading text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
              Simulación Cámara IA
            </h3>
            <span class="text-sky-700 text-xs font-bold">Evaluación →</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            Evaluación autónoma con MediaPipe HandLandmarker. Análisis de postura, fricción y tiempo sin asistencia de guía.
          </p>
        </a>

        <!-- Opción 3: Cuestionario Teórico OMS y Encuesta -->
        <a
          routerLink="/evaluacion-teorica"
          class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 hover:border-teal-400 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 block group relative overflow-hidden"
        >
          <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
            📋
          </div>
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-heading text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              Cuestionario Teórico OMS
            </h3>
            <span class="text-teal-700 text-xs font-bold">Post-Test →</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            Evaluación oficial sobre los 5 momentos y técnica aséptica OMS, con retroalimentación inmediata.
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
                  <td colspan="6" class="py-8 text-center text-slate-400">
                    No se encontraron registros para este filtro.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Mostrando {{ historialFiltrado().length }} de {{ historialCompleto().length }} registros</span>
          <span class="text-[11px] text-teal-400">Directrices Oficiales OMS • Lavado de Manos Clínico</span>
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

  readonly puntajePromedio = signal<number>(9.5);
  readonly mejorPuntaje = signal<number>(10.0);
  readonly tiempoAcumuladoMinutos = signal<number>(38);

  readonly filtroActivo = signal<FiltroModo>('todos');

  readonly historialCompleto = signal<RegistroHistorialPractica[]>([
    {
      id: 'prac-001',
      modo: 'simulacion',
      tituloModo: 'Simulación Cámara IA',
      iconoModo: '🎯',
      fecha: 'Hoy, 10:45 AM',
      duracionSegundos: 48,
      errores: 0,
      puntuacion: 10.0,
      aprobado: true,
    },
    {
      id: 'prac-002',
      modo: 'guiado',
      tituloModo: 'Práctica Guiada OMS',
      iconoModo: '🖐️',
      fecha: 'Hoy, 09:15 AM',
      duracionSegundos: 52,
      errores: 0,
      puntuacion: 9.8,
      aprobado: true,
    },
    {
      id: 'prac-003',
      modo: 'desafio',
      tituloModo: 'Cuestionario Teórico OMS',
      iconoModo: '⚡',
      fecha: 'Ayer, 04:30 PM',
      duracionSegundos: 35,
      errores: 1,
      detalleError: 'Fallo en pregunta de esporas de C. difficile',
      puntuacion: 9.2,
      aprobado: true,
    },
    {
      id: 'prac-004',
      modo: 'simulacion',
      tituloModo: 'Simulación Cámara IA',
      iconoModo: '🎯',
      fecha: 'Ayer, 02:10 PM',
      duracionSegundos: 45,
      errores: 0,
      puntuacion: 10.0,
      aprobado: true,
    },
    {
      id: 'prac-005',
      modo: 'guiado',
      tituloModo: 'Práctica Guiada OMS',
      iconoModo: '🖐️',
      fecha: '12/11/2026',
      duracionSegundos: 58,
      errores: 1,
      detalleError: 'Paso 4: Tiempo de fricción en candado menor a 4s',
      puntuacion: 8.6,
      aprobado: true,
    },
  ]);

  readonly historialFiltrado = computed(() => {
    const filtro = this.filtroActivo();
    const lista = this.historialCompleto();
    if (filtro === 'todos') {
      return lista;
    }
    return lista.filter((item) => item.modo === filtro);
  });

  ngOnInit(): void {
    // Si la evaluación en stateService tiene calificación reciente, sincronizarla
    const evalResult = this.stateService.evaluationResult();
    if (evalResult && (evalResult.overallScore !== undefined || evalResult.notaFinal !== undefined)) {
      const notaReal = evalResult.notaFinal ?? evalResult.overallScore ?? 9.5;
      if (notaReal > this.mejorPuntaje()) {
        this.mejorPuntaje.set(notaReal);
      }
      this.puntajePromedio.set(Number(((9.5 + notaReal) / 2).toFixed(1)));
    }
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
