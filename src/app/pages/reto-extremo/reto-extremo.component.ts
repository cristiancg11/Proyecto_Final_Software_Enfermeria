import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HandwashStateService as StateService } from '../../core/services/handwash-state.service';
import { AuthService } from '../../services/auth.service';
import {
  PracticasService,
  RankingRetoExtremoResponse,
  RegistroRetoExtremo,
} from '../../services/practicas.service';

export interface PreguntaRetoExtremo {
  id: number;
  categoria: string;
  dificultad: 'Alta' | 'Extrema';
  enunciado: string;
  opciones: string[];
  indiceCorrecto: number;
  explicacionClinica: string;
}

@Component({
  selector: 'app-reto-extremo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-full py-6 sm:py-8 px-3 sm:px-6 lg:px-8 text-slate-800 relative">
      <div class="max-w-4xl mx-auto relative z-10 space-y-6">
        
        <!-- ENCABEZADO CLÍNICO "¿CUÁNTO SABES?" -->
        <div class="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-teal-600"></div>

          <div class="flex flex-col md:flex-row md:items-center justify-between gap-5 pt-2">
            <div class="space-y-2">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-wider">
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>Reto Extra • Agilidad Mental OMS</span>
              </div>
              <h1 class="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                🧠 ¿Cuánto sabes?
              </h1>
              <p class="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                7 preguntas difíciles de microbiología intrahospitalaria y protocolos clínicos de la OMS. El puntaje combina <strong class="text-slate-900">aciertos + bonificación por rapidez</strong>.
              </p>
            </div>

            <div class="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 w-full md:w-auto">
              <a
                routerLink="/dashboard"
                class="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-all cursor-pointer"
              >
                ← Volver al Dashboard
              </a>
              @if (estadoJuego() !== 'jugando') {
                <button
                  type="button"
                  (click)="iniciarReto()"
                  class="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer active:scale-98"
                >
                  ⚡ Iniciar Reto (7 Preguntas)
                </button>
              }
            </div>
          </div>
        </div>

        <!-- ======================================================================= -->
        <!-- FASE 1: LOBBY DE PREPARACIÓN                                            -->
        <!-- ======================================================================= -->
        @if (estadoJuego() === 'lobby') {
          <div class="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-amber-700 block mb-1">
                Fase de Preparación
              </span>
              <h2 class="font-heading text-xl sm:text-2xl font-bold text-slate-900">
                Prepárate para competir contra el reloj
              </h2>
            </div>

            <!-- Datos del Estudiante -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Nombre o Alias del Participante</label>
                <input
                  type="text"
                  [(ngModel)]="nombreCompetidor"
                  placeholder="Tu nombre completo"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm font-medium text-slate-900 outline-none"
                />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Código Estudiantil</label>
                <input
                  type="text"
                  [(ngModel)]="codigoCompetidor"
                  placeholder="ID institucional"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm font-medium text-slate-900 outline-none"
                />
              </div>
            </div>

            <!-- Reglas Claras de Puntuación -->
            <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
              <div class="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <span>🎯 Sistema de Puntuación (Máx. 1.000 pts):</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div class="p-3 bg-white rounded-xl border border-slate-200 text-center">
                  <span class="font-extrabold text-amber-800 text-lg block">7 Preguntas</span>
                  <span class="text-slate-500">4 opciones (A, B, C, D)</span>
                </div>
                <div class="p-3 bg-white rounded-xl border border-slate-200 text-center">
                  <span class="font-extrabold text-teal-700 text-lg block">Hasta 700 pts</span>
                  <span class="text-slate-500">100 pts por acierto</span>
                </div>
                <div class="p-3 bg-white rounded-xl border border-slate-200 text-center">
                  <span class="font-extrabold text-sky-700 text-lg block">Hasta 300 pts</span>
                  <span class="text-slate-500">Bono por rapidez</span>
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed pt-1">
                • El cronómetro corre en vivo. Al completar las 7 preguntas, tu tiempo y puntaje se registrarán en la <strong>tabla de posiciones oficial</strong> para disputar el Podio.
              </p>
            </div>

            <button
              type="button"
              (click)="iniciarReto()"
              class="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-teal-600 hover:brightness-105 text-white font-extrabold text-base shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🚀 Comenzar Trivia Contrarreloj (7 Preguntas)</span>
            </button>
          </div>
        }

        <!-- ======================================================================= -->
        <!-- FASE 2: TRIVIA ACTIVA CON CRONÓMETRO CONTRARRELOJ                       -->
        <!-- ======================================================================= -->
        @if (estadoJuego() === 'jugando' && preguntaActual()) {
          <div class="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
            <!-- Barra superior: Número de pregunta, categoría y reloj activo -->
            <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <span class="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-sm flex items-center justify-center">
                  {{ indicePregunta() + 1 }} / 7
                </span>
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                    {{ preguntaActual()!.categoria }}
                  </span>
                  <span class="text-[11px] font-semibold text-rose-700">
                    Dificultad: {{ preguntaActual()!.dificultad }}
                  </span>
                </div>
              </div>

              <!-- Reloj / Temporizador activo -->
              <div class="px-4 py-2 rounded-xl bg-slate-900 text-white font-mono text-base sm:text-lg font-bold flex items-center gap-2 shadow-xs">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>⏱ {{ tiempoFormateado() }}s</span>
              </div>
            </div>

            <!-- Barra de progreso -->
            <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-amber-500 to-teal-600 transition-all duration-300"
                [style.width.%]="((indicePregunta() + 1) / 7) * 100"
              ></div>
            </div>

            <!-- Enunciado de la pregunta -->
            <h2 class="font-heading text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {{ preguntaActual()!.enunciado }}
            </h2>

            <!-- 4 Opciones de Respuesta (A, B, C, D) -->
            <div class="space-y-3">
              @for (opcion of preguntaActual()!.opciones; track $index; let idx = $index) {
                <button
                  type="button"
                  (click)="seleccionarOpcion(idx)"
                  [disabled]="opcionSeleccionada() !== null"
                  class="w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer"
                  [ngClass]="obtenerClaseOpcion(idx)"
                >
                  <span
                    class="w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5"
                    [ngClass]="obtenerClaseLetraOpcion(idx)"
                  >
                    {{ ['A', 'B', 'C', 'D'][idx] }}
                  </span>
                  <span class="text-xs sm:text-sm font-medium leading-relaxed">
                    {{ opcion }}
                  </span>
                </button>
              }
            </div>

            <!-- Retroalimentación Técnica Inmediata -->
            @if (opcionSeleccionada() !== null) {
              <div
                class="p-4 rounded-xl border animate-fade-in text-xs sm:text-sm"
                [ngClass]="opcionSeleccionada() === preguntaActual()!.indiceCorrecto
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'"
              >
                <div class="font-bold mb-1">
                  {{ opcionSeleccionada() === preguntaActual()!.indiceCorrecto
                    ? '✅ ¡Correcto! Excelente criterio clínico.'
                    : '❌ Incorrecto. Fundamento técnico OMS:' }}
                </div>
                <p class="leading-relaxed opacity-95">
                  {{ preguntaActual()!.explicacionClinica }}
                </p>
              </div>

              <div class="flex justify-end pt-2">
                <button
                  type="button"
                  (click)="avanzarPregunta()"
                  class="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>
                    {{ indicePregunta() + 1 < 7 ? 'Siguiente Pregunta →' : 'Finalizar y Registrar Puntuación 🏆' }}
                  </span>
                </button>
              </div>
            }
          </div>
        }

        <!-- ======================================================================= -->
        <!-- FASE 3: RESULTADO PERSONAL TRAS COMPLETAR                                -->
        <!-- ======================================================================= -->
        @if (estadoJuego() === 'finalizado') {
          <div class="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fade-in text-center">
            
            <div class="inline-block px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-2">
              ✓ Reto Registrado Oficialmente
            </div>

            <h2 class="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              ¡Partida Finalizada, {{ nombreCompetidor }}!
            </h2>

            <p class="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Tus resultados han sido registrados exitosamente. Mira a continuación tu ubicación en el Podio y la tabla de posiciones.
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-2xl mx-auto pt-2">
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Aciertos</span>
                <span class="font-heading text-2xl font-extrabold text-teal-700">
                  {{ aciertosTotales() }} / 7
                </span>
              </div>
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Precisión</span>
                <span class="font-heading text-2xl font-extrabold text-slate-900">
                  {{ porcentajeAciertos() }}%
                </span>
              </div>
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Tiempo Total</span>
                <span class="font-heading text-2xl font-extrabold text-sky-700">
                  {{ tiempoFormateado() }}s
                </span>
              </div>
              <div class="p-4 rounded-xl bg-amber-50 border border-amber-300 text-center">
                <span class="text-[10px] font-bold uppercase text-amber-800 block">Puntaje Final</span>
                <span class="font-heading text-2xl font-extrabold text-amber-900">
                  {{ puntajeCalculado() }} pts
                </span>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-3 w-full max-w-md mx-auto">
              <button
                type="button"
                (click)="iniciarReto()"
                class="w-full sm:w-auto text-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:scale-98"
              >
                🔄 Jugar de Nuevo para Mejorar Tiempo
              </button>
              <a
                routerLink="/dashboard"
                class="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-300 transition-all cursor-pointer active:scale-98"
              >
                Ir al Dashboard
              </a>
            </div>
          </div>
        }

        <!-- ======================================================================= -->
        <!-- PODIO Y TABLA DE POSICIONES EN TIEMPO REAL (LOBBY Y FINALIZADO)         -->
        <!-- ======================================================================= -->
        @if (estadoJuego() !== 'jugando') {
          <div class="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>🏆 Clasificación en Vivo</span>
                </div>
                <h3 class="font-heading text-xl sm:text-2xl font-extrabold text-slate-900">
                  Podio y Tabla de Posiciones
                </h3>
                <p class="text-xs text-slate-500">
                  Sincronizado en tiempo real • Ordenado por mayor puntaje (aciertos + velocidad)
                </p>
              </div>
              <button
                type="button"
                (click)="cargarRankingCompetitivo()"
                class="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                <span>🔄 Actualizar Podio</span>
              </button>
            </div>

            <!-- PODIO VISUAL (TOP 3) -->
            @if (ranking().length > 0) {
              <div class="pt-4 pb-2">
                <div class="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-xl mx-auto pt-6">
                  
                  <!-- 2.º LUGAR (Plata - Izquierda) -->
                  @if (segundoLugar()) {
                    <div class="flex flex-col items-center animate-fade-in order-1">
                      <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-700 flex items-center justify-center text-xl sm:text-2xl shadow-sm mb-2">
                        🥈
                      </div>
                      <span class="text-[11px] sm:text-xs font-bold text-slate-800 truncate max-w-full text-center px-1">
                        {{ segundoLugar()!.nombre }}
                      </span>
                      <span class="text-[10px] text-slate-500 font-mono">
                        {{ segundoLugar()!.puntajeCompetitivo }} pts
                      </span>
                      <div class="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-t from-slate-200 to-slate-100 border-t-2 border-x-2 border-slate-300 flex flex-col items-center justify-center p-2 mt-2 shadow-xs">
                        <span class="text-base sm:text-xl font-extrabold text-slate-700">2.°</span>
                        <span class="text-[10px] text-slate-500 font-mono">⏱ {{ segundoLugar()!.tiempoSegundos }}s</span>
                      </div>
                    </div>
                  } @else {
                    <div class="order-1"></div>
                  }

                  <!-- 1.º LUGAR (Oro - Centro, Más alto) -->
                  @if (primerLugar()) {
                    <div class="flex flex-col items-center animate-fade-in order-2 -mt-4">
                      <div class="relative">
                        <span class="absolute -top-3.5 left-1/2 -translate-x-1/2 text-base animate-bounce">👑</span>
                        <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-800 flex items-center justify-center text-2xl sm:text-3xl shadow-md mb-2">
                          🥇
                        </div>
                      </div>
                      <span class="text-xs sm:text-sm font-extrabold text-amber-950 truncate max-w-full text-center px-1">
                        {{ primerLugar()!.nombre }}
                      </span>
                      <span class="text-[11px] text-amber-800 font-bold font-mono">
                        {{ primerLugar()!.puntajeCompetitivo }} pts
                      </span>
                      <div class="w-full h-32 sm:h-36 rounded-t-2xl bg-gradient-to-t from-amber-300/40 via-amber-200/50 to-amber-100 border-t-2 border-x-2 border-amber-400 flex flex-col items-center justify-center p-2 mt-2 shadow-sm">
                        <span class="text-xl sm:text-2xl font-black text-amber-900">1.°</span>
                        <span class="text-[10px] text-amber-800 font-bold font-mono">⏱ {{ primerLugar()!.tiempoSegundos }}s</span>
                        <span class="text-[9px] text-emerald-800 font-semibold bg-emerald-100/80 px-1.5 py-0.5 rounded-full mt-1">
                          {{ primerLugar()!.aciertos }}/7 aciertos
                        </span>
                      </div>
                    </div>
                  } @else {
                    <div class="order-2"></div>
                  }

                  <!-- 3.º LUGAR (Bronce - Derecha) -->
                  @if (tercerLugar()) {
                    <div class="flex flex-col items-center animate-fade-in order-3">
                      <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-amber-50 border-2 border-amber-600/40 text-amber-900 flex items-center justify-center text-lg sm:text-xl shadow-sm mb-2">
                        🥉
                      </div>
                      <span class="text-[11px] sm:text-xs font-bold text-slate-800 truncate max-w-full text-center px-1">
                        {{ tercerLugar()!.nombre }}
                      </span>
                      <span class="text-[10px] text-slate-500 font-mono">
                        {{ tercerLugar()!.puntajeCompetitivo }} pts
                      </span>
                      <div class="w-full h-20 sm:h-24 rounded-t-2xl bg-gradient-to-t from-amber-200/30 to-amber-50 border-t-2 border-x-2 border-amber-600/30 flex flex-col items-center justify-center p-2 mt-2 shadow-xs">
                        <span class="text-sm sm:text-lg font-extrabold text-amber-900">3.°</span>
                        <span class="text-[10px] text-slate-500 font-mono">⏱ {{ tercerLugar()!.tiempoSegundos }}s</span>
                      </div>
                    </div>
                  } @else {
                    <div class="order-3"></div>
                  }

                </div>
              </div>
            }

            <!-- TABLA DE CLASIFICACIÓN COMPLETA (ORDENADA DE MAYOR A MENOR) -->
            <div class="overflow-x-auto rounded-xl border border-slate-200">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th class="py-3 px-3 sm:px-4">Puesto</th>
                    <th class="py-3 px-3 sm:px-4">Participante</th>
                    <th class="py-3 px-2 sm:px-4 text-center">Aciertos</th>
                    <th class="py-3 px-2 sm:px-4 text-center">Tiempo</th>
                    <th class="py-3 px-3 sm:px-4 text-right">Puntaje</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                  @for (item of ranking(); track item.id; let idx = $index) {
                    <tr
                      class="transition-colors"
                      [ngClass]="{
                        'bg-amber-50/60 font-semibold': idx === 0,
                        'bg-teal-50/70 ring-1 ring-inset ring-teal-500 font-bold': item.esUsuarioActual || item.codigoEstudiantil === codigoCompetidor
                      }"
                    >
                      <td class="py-3 px-3 sm:px-4 whitespace-nowrap">
                        @if (idx === 0) {
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-extrabold text-[10px]">
                            🥇 1.°
                          </span>
                        } @else if (idx === 1) {
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-bold text-[10px]">
                            🥈 2.°
                          </span>
                        } @else if (idx === 2) {
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                            🥉 3.°
                          </span>
                        } @else if (idx === ranking().length - 1 && ranking().length > 3) {
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold text-[10px]">
                            🏁 #{{ idx + 1 }}
                          </span>
                        } @else {
                          <span class="text-slate-600 font-semibold">
                            #{{ idx + 1 }}
                          </span>
                        }
                      </td>

                      <td class="py-3 px-3 sm:px-4">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <span class="font-bold text-slate-900">{{ item.nombre }}</span>
                          @if (item.esUsuarioActual || item.codigoEstudiantil === codigoCompetidor) {
                            <span class="px-1.5 py-0.5 rounded bg-teal-600 text-white text-[9px] font-bold uppercase">
                              Tú
                            </span>
                          }
                        </div>
                        <span class="text-[10px] text-slate-400 font-mono">{{ item.codigoEstudiantil }}</span>
                      </td>

                      <td class="py-3 px-2 sm:px-4 text-center whitespace-nowrap">
                        <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs">
                          {{ item.aciertos }} / {{ item.totalPreguntas }}
                        </span>
                      </td>

                      <td class="py-3 px-2 sm:px-4 text-center font-mono text-slate-700 whitespace-nowrap">
                        ⏱ {{ item.tiempoSegundos.toFixed(1) }}s
                      </td>

                      <td class="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                        <span class="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 font-extrabold text-xs">
                          {{ item.puntajeCompetitivo }} pts
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

      </div>
    </div>
  `,
})
export class RetoExtremoComponent implements OnInit, OnDestroy {
  private readonly stateService = inject(StateService);
  private readonly authService = inject(AuthService);
  private readonly practicasService = inject(PracticasService);

  // BANCO DE 50 PREGUNTAS CLÍNICAS DE ALTA DIFICULTAD OMS (CON 4 OPCIONES A, B, C, D)
  private readonly bancoPreguntasExtremas: PreguntaRetoExtremo[] = [
    {
      id: 1,
      categoria: 'Microbiología Clínica • Esporas',
      dificultad: 'Extrema',
      enunciado:
        'Ante un brote intrahospitalario por Clostridioides difficile, ¿cuál es el mecanismo por el cual la OMS exige lavado con agua y jabón en lugar de solución hidroalcohólica?',
      opciones: [
        'Las soluciones hidroalcohólicas se inactivan únicamente por el pH del sudor palmar.',
        'Las endosporas bacterianas son intrínsecamente resistentes al alcohol; se requiere la fricción mecánica con agua y jabón para su arrastre físico.',
        'El alcohol al 70% estimula la esporulación inmediata sobre la capa córnea.',
        'El jabón neutro disuelve químicamente la corteza esporal por hidrólisis alcalina.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'Los alcoholes carecen de actividad esporicida. Ante C. difficile es indispensable el arrastre físico-mecánico con agua y jabón para remover las endosporas.',
    },
    {
      id: 2,
      categoria: 'Farmacología Antiséptica OMS',
      dificultad: 'Alta',
      enunciado:
        'Según las Directrices de la OMS sobre Higiene de las Manos, ¿cuál es la concentración óptima (v/v) de alcohol en las preparaciones antisépticas y por qué?',
      opciones: [
        'Entre 60% y 80% v/v, ya que la desnaturalización proteica microbiana requiere la presencia de agua como catalizador.',
        'Exactamente 99.9% de alcohol puro para deshidratar de forma instantánea la membrana bacteriana.',
        'Entre 35% y 45% v/v para retrasar la evaporación durante la aplicación.',
        '50% de alcohol mezclado en partes iguales con peróxido de hidrógeno al 10%.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'El rango bactericida óptimo estipulado por la OMS es del 60% al 80% v/v; sin agua, las proteínas microbianas no se desnaturalizan eficazmente.',
    },
    {
      id: 3,
      categoria: 'Reservorios Microbiológicos • Zonas Críticas',
      dificultad: 'Extrema',
      enunciado:
        'Los estudios cuantitativos de microbiología hospitalaria demuestran que una zona anatómica específica de la mano alberga la mayor densidad de UFC (unidades formadoras de colonias). ¿Cuál es?',
      opciones: [
        'El centro cóncavo de la palma debido a la concentración de glándulas sudoríparas.',
        'El dorso de la muñeca en la cara dorsal.',
        'La región subungueal (debajo de las uñas) y periungueal, razón por la cual se exige frotar las yemas contra la palma opuesta.',
        'El pliegue interdigital entre el cuarto y quinto dedo.',
      ],
      indiceCorrecto: 2, // Opción C
      explicacionClinica:
        'El espacio subungueal concentra la mayor carga bacteriana de toda la mano; por ello las uñas cortas y el frotado rotacional de las yemas son obligatorios.',
    },
    {
      id: 4,
      categoria: 'Biomecánica y Zonas Críticas • Pulgares',
      dificultad: 'Alta',
      enunciado:
        'Durante la higiene de manos, ¿cuál es la principal razón por la que la OMS incluye un paso exclusivo de frotación rotacional para los pulgares?',
      opciones: [
        'Para fortalecer los ligamentos colaterales de la articulación metacarpofalángica.',
        'Porque los pulgares y la eminencia tenar son zonas de máxima pinza clínica que suelen omitirse durante el frotado palma con palma y dorso.',
        'Porque el pulgar secreta un sebo graso diferente que bloquea el antiséptico.',
        'Únicamente para asegurar que el tiempo del procedimiento alcance los 60 segundos.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'El pulgar y la eminencia tenar son la principal herramienta de prensión asistencial y quedan sistemáticamente sin frotar si no se realiza el movimiento envolvente específico.',
    },
    {
      id: 5,
      categoria: '5 Momentos de la OMS • Procedimiento Asistencial',
      dificultad: 'Extrema',
      enunciado:
        'Un enfermero ayuda a incorporar al paciente en la cama (contacto con piel intacta) e inmediatamente después se dispone a administrar un bolo intravenoso por un catéter venoso periférico. ¿Cómo debe proceder según los 5 Momentos de la OMS?',
      opciones: [
        'Solo colocarse guantes limpios, ya que no hubo contacto previo con fluidos biológicos.',
        'Esperar a terminar la administración de la medicación para realizar una única higiene.',
        'Realizar higiene de manos inmediatamente antes de manipular el acceso vascular (Momento 2: antes de una tarea aséptica), tras haber tocado al paciente.',
        'No es necesaria la higiene intermedia porque pertenece al mismo paciente en la misma cama.',
      ],
      indiceCorrecto: 2, // Opción C
      explicacionClinica:
        'Tocar la piel intacta del paciente (Momento 1/4) transfiere microorganismos a las manos; antes de acceder a un sitio crítico o estéril (Momento 2) es obligatoria una nueva higiene.',
    },
    {
      id: 6,
      categoria: 'Tiempos Normativos de Bioseguridad',
      dificultad: 'Alta',
      enunciado:
        '¿Cuáles son los tiempos mínimos normativos recomendados por la OMS para la fricción con base alcohólica vs. el lavado con agua y jabón?',
      opciones: [
        'Fricción con alcohol: 10 a 15 s | Lavado con agua y jabón: 20 a 30 s.',
        'Fricción con alcohol: 40 a 60 s | Lavado con agua y jabón: 20 a 30 s.',
        'Ambos procedimientos requieren un tiempo idéntico de 60 segundos cronometrados.',
        'Fricción con alcohol: 20 a 30 s | Lavado con agua y jabón: 40 a 60 s.',
      ],
      indiceCorrecto: 3, // Opción D
      explicacionClinica:
        'La fricción antiséptica con alcohol toma entre 20 y 30 segundos hasta el secado completo, mientras el lavado con agua y jabón requiere de 40 a 60 segundos.',
    },
    {
      id: 7,
      categoria: 'Dermatología Ocupacional e Infecciones Asociadas',
      dificultad: 'Alta',
      enunciado:
        '¿Por qué la OMS contraindica lavarse las manos con agua y jabón e inmediatamente después aplicarse solución alcohólica en la misma atención?',
      opciones: [
        'Porque el jabón precipita los cristales de alcohol haciéndolo inflamable sobre la dermis.',
        'El uso simultáneo no aporta mayor reducción bacteriana y produce daño de la barrera cutánea (dermatitis irritativa), aumentando la colonización bacteriana secundaria.',
        'Porque el alcohol neutraliza de forma inmediata los surfactantes del jabón en el desagüe.',
        'Por el costo excesivo que genera en los insumos hospitalarios.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'La combinación secuencial de agua, jabón y alcohol elimina los lípidos epidérmicos y produce microfisuras en la piel que facilitan la colonización por patógenos nosocomiales.',
    },
    {
      id: 8,
      categoria: 'Microbiología Clínica • Flora Cutánea',
      dificultad: 'Alta',
      enunciado:
        'En el contexto del control de infecciones intrahospitalarias, ¿cuál es la distinción microbiológica fundamental entre la flora cutánea residente y la transitoria?',
      opciones: [
        'La flora transitoria coloniza las capas superficiales de la epidermis, se adquiere por contacto con pacientes o fómites y es la principal responsable de las IAAS; se remueve con facilidad con la higiene de manos.',
        'La flora residente está compuesta exclusivamente por patógenos esporulados anaerobios de alta virulencia.',
        'La flora transitoria habita en los estratos profundos y folículos pilosos, requiriendo 10 minutos de cepillado con yodopovidona para eliminarse.',
        'La flora residente no puede sobrevivir más de 5 minutos sobre la piel debido a los ácidos grasos sebáceos.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'La flora transitoria (S. aureus, enterobacterias, Pseudomonas) coloniza la capa córnea superficial tras el contacto asistencial y causa la mayoría de las infecciones hospitalarias. Se elimina mediante fricción alcohólica o lavado clínico.',
    },
    {
      id: 9,
      categoria: 'Formulaciones Locales OMS • Control Químico',
      dificultad: 'Extrema',
      enunciado:
        'En las formulaciones magistrales recomendadas por la OMS para la preparación local de soluciones hidroalcohólicas, ¿cuál es el objetivo específico de incluir peróxido de hidrógeno al 0.125%?',
      opciones: [
        'Actuar como el antiséptico principal para desinfectar la piel del operador.',
        'Inactivar esporas bacterianas contaminantes presentes en las botellas o soluciones durante su preparación y envasado.',
        'Otorgar viscosidad y adherencia para evitar el goteo durante la aplicación en dispensador.',
        'Aclarar la solución y neutralizar los malos olores del alcohol desnaturalizado.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'El peróxido de hidrógeno en baja concentración (0.125%) no posee efecto antiséptico sobre la piel, pero destruye endosporas contaminantes en el recipiente o insumos durante su preparación.',
    },
    {
      id: 10,
      categoria: 'Bioseguridad Hospitalaria • Dispensadores',
      dificultad: 'Extrema',
      enunciado:
        'La OMS y los CDC prohíben de forma estricta rellenar o completar recipientes de jabón líquido ("topping-up") sin previa desinfección y secado total. ¿Cuál es la justificación microbiológica?',
      opciones: [
        'La mezcla de jabones de diferente fabricante causa una reacción exotérmica que quema la piel.',
        'Los dispensadores rellenados sobre remanentes se contaminan masivamente con biopelículas de bacilos Gram negativos oportunistas, como Pseudomonas aeruginosa y Serratia marcescens.',
        'El jabón líquido se evapora en menos de 24 horas si entra aire fresco al contenedor.',
        'El plástico del dispensador neutraliza los surfactantes convirtiendo el jabón en agua inerte.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'El "topping-up" favorece la formación de biofilms resistentes en el fondo de los dispensadores que albergan bacilos Gram negativos nosocomiales, transformando el jabón en foco de brotes.',
    },
    {
      id: 11,
      categoria: 'Barreras de Bioseguridad • Guantes Médicos',
      dificultad: 'Alta',
      enunciado:
        'Respecto al uso de guantes clínicos y su relación con la higiene de manos, ¿cuál de las siguientes afirmaciones es correcta según la OMS?',
      opciones: [
        'El uso de guantes exime de realizar higiene de manos si no se aprecian rasgaduras visibles.',
        'Es una práctica recomendada frotar con alcohol los guantes entre paciente y paciente para optimizar recursos.',
        'Los guantes proporcionan una barrera imperfecta; hasta en un 30% pueden presentar microperforaciones y las manos se contaminan al retirarlos, exigiendo higiene inmediata tras el retiro.',
        'Los guantes clínicos pueden lavarse con agua y jabón puestos para atender hasta 3 pacientes consecutivos.',
      ],
      indiceCorrecto: 2, // Opción C
      explicacionClinica:
        'Los guantes no sustituyen la higiene de manos. Durante la atención pueden ocurrir microfisuras inadvertidas y la técnica de retiro frecuentemente contamina las manos del operador con la superficie externa.',
    },
    {
      id: 12,
      categoria: 'Antisepsia Quirúrgica • Bloque Quirúrgico',
      dificultad: 'Extrema',
      enunciado:
        'En la antisepsia prequirúrgica de las manos del equipo quirúrgico, ¿cuál es una directriz explícita de la OMS para evitar infecciones del sitio quirúrgico?',
      opciones: [
        'Cepillar vigorosamente toda la piel de antebrazos y manos con cerdas rígidas durante 10 minutos.',
        'El cepillado de la piel está contraindicado por provocar microabrasiones que favorecen la proliferación bacteriana; solo se aconseja cepillo o limpiador blando para uñas en el primer lavado.',
        'Aplicar alcohol al 96% puro sin agente emoliente para deshidratar de inmediato la epidermis.',
        'Enjuagar los brazos con agua hirviendo antes de calzar los guantes estériles.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'La OMS desaconseja el cepillado cutáneo vigoroso ya que erosiona la epidermis y multiplica la dispersión bacteriana. El frotado quirúrgico debe realizarse con las manos desnudas usando técnica adecuada.',
    },
    {
      id: 13,
      categoria: 'Epidemiología y Métricas • Indicador OMS',
      dificultad: 'Alta',
      enunciado:
        'En los programas de vigilancia epidemiológica con metodología de observación directa de la OMS, ¿cómo se calcula la tasa global de adherencia a la higiene de manos?',
      opciones: [
        '(Litros de alcohol consumidos en el servicio / Número de camas ocupadas) × 100',
        '(Número de acciones de higiene de manos realizadas / Número total de oportunidades observadas) × 100',
        '(Número de pacientes sin infecciones intrahospitalarias / Total de camas activas) × 100',
        '(Horas de turno del personal / Número de dispensadores instalados) × 100',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'La métrica estandarizada mundial de la OMS es: [Acciones observadas realizadas (fricción o lavado) / Total de oportunidades observadas correspondientes a los 5 Momentos] × 100.',
    },
    {
      id: 14,
      categoria: 'Control de Brotes • Gastroenteritis Viral',
      dificultad: 'Extrema',
      enunciado:
        'Durante un brote nosocomial de gastroenteritis aguda por Norovirus en una sala de internación, ¿cuál es la indicación prioritaria de la OMS respecto a la higiene de manos?',
      opciones: [
        'Utilizar únicamente alcohol en gel al 70%, pues lisa la cápside proteica en 3 segundos.',
        'Priorizar el lavado de manos con agua y jabón, ya que los virus sin envoltura lipídica (como Norovirus) son menos susceptibles al alcohol y requieren arrastre físico-mecánico.',
        'Sumergir las manos en hipoclorito de sodio al 5% antes de cada contacto clínico.',
        'Suspender la higiene de manos para evitar la sequedad cutánea durante el turno.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'Norovirus es un virus sin envoltura lipídica con alta tolerancia a los alcoholes convencionales. El lavado vigoroso con agua y jabón es la recomendación prioritaria para su remoción mecánica.',
    },
    {
      id: 15,
      categoria: '5 Momentos OMS • Riesgo Biológico',
      dificultad: 'Alta',
      enunciado:
        'Al canalizar una vía periférica difícil, se produce una salpicadura de sangre en el guante y el dorso de la mano del enfermero. Tras desechar el cortopunzante en el contenedor rígido, ¿cómo debe actuar según el Momento 3?',
      opciones: [
        'Frotar alcohol sobre el guante para desinfectar la superficie antes de tocar al paciente.',
        'Retirarse los guantes y lavarse de inmediato con agua y jabón, ya que existe contaminación con materia biológica visible.',
        'Colocarse un guante limpio por encima del manchado para continuar el procedimiento.',
        'Frotarse gel alcohólico directamente sobre la sangre fresca visible de la mano.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'El Momento 3 (después del riesgo de exposición a fluidos corporales) con suciedad macroscópica exige obligatoriamente agua y jabón; la materia orgánica inactiva los alcoholes y fija proteínas a la dermis.',
    },
    {
      id: 16,
      categoria: 'Bioseguridad • Política Bare Below the Elbows',
      dificultad: 'Alta',
      enunciado:
        '¿Cuál es la justificación microbiológica de la OMS para exigir que las manos y muñecas del personal de salud estén libres de anillos, relojes y pulseras en áreas clínicas?',
      opciones: [
        'Criterios estrictamente estéticos e institucionales de presentación personal.',
        'La piel debajo de los anillos retiene humedad y alberga hasta 10 veces más bacilos Gram negativos y levaduras, además de interferir con la fricción y rasgar guantes.',
        'Los metales nobles reaccionan con el alcohol formando vapores tóxicos en el ambiente.',
        'Las pulseras bloquean el flujo de retorno venoso en la muñeca del trabajador.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'La evidencia demuestra que las áreas subungueales y debajo de anillos actúan como reservorios persistentes de Gram negativos multirresistentes y levaduras, impidiendo una fricción antiséptica homogénea.',
    },
    {
      id: 17,
      categoria: 'IAAS y Reservorios • Uñas y Cosmética',
      dificultad: 'Extrema',
      enunciado:
        'Respecto al uso de uñas postizas, acrílicas o esmalte agrietado en el personal de enfermería en áreas de cuidados intensivos, ¿qué evidencia epidemiológica documenta la OMS?',
      opciones: [
        'No representan riesgo si tienen un largo menor a 2 centímetros desde el pulpejo.',
        'Se han vinculado directamente como el origen causal de brotes epidémicos letales por Serratia marcescens, Pseudomonas aeruginosa y Candida en UCI y neonatología.',
        'El material acrílico absorbe el alcohol y prolonga el efecto antiséptico durante el turno.',
        'Solo están restringidas en el personal que prepara alimentos en el comedor hospitalario.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'Las uñas artificiales acumulan microorganismos multirresistentes difíciles de erradicar con la higiene regular, habiendo sido el foco comprobado de múltiples brotes nosocomiales graves.',
    },
    {
      id: 18,
      categoria: 'Mecanismos Biocidas • Alcoholes',
      dificultad: 'Alta',
      enunciado:
        '¿Cuál es el mecanismo bioquímico fundamental por el cual los alcoholes (etanol e isopropanol) ejercen su acción destructiva sobre bacterias vegetativas y hongos?',
      opciones: [
        'Bloqueo irreversible de la replicación del ADN mitocondrial por intercalación de bases.',
        'Desnaturalización y precipitación rápida de proteínas celulares junto con la lisis de la membrana celular fosfolipídica.',
        'Inhibición competitiva exclusiva de la enzima transcriptasa reversa.',
        'Producción masiva de radicales libres que destruyen la cápsula polisacárida bacteriana.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'Los alcoholes actúan desnaturalizando proteínas y disolviendo los componentes lipídicos de las membranas, lo que causa la lisis osmótica casi inmediata en presencia de agua.',
    },
    {
      id: 19,
      categoria: 'Equipamiento Hospitalario • Secado de Manos',
      dificultad: 'Alta',
      enunciado:
        'En áreas clínicas y de hospitalización, ¿por qué la OMS desaconseja el uso de secadores de aire caliente o aire a alta velocidad para el secado de manos?',
      opciones: [
        'Por su elevado costo de mantenimiento eléctrico en comparación con las toallas descartables.',
        'Porque provocan recirculación de aire turbulento que dispersa bioaerosoles bacterianos a varios metros recontaminando manos y superficies clínicas.',
        'Porque el aire caliente inactiva la queratina dérmica causando descamación inmediata.',
        'Porque alteran la calibración de los termómetros de mercurio de la sala.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'Los secadores de aire generan turbulencias que aerosolizan microorganismos ambientales y del lavamanos a más de 2 metros; la toalla de papel descartable ofrece secado rápido y fricción mecánica sin bioaerosoles.',
    },
    {
      id: 20,
      categoria: 'Farmacología Antiséptica • Efecto Residual',
      dificultad: 'Alta',
      enunciado:
        'En el lavado antiséptico de manos, ¿qué propiedad farmacológica sustancial diferencia al gluconato de clorhexidina respecto al alcohol simple?',
      opciones: [
        'Su capacidad esporicida instantánea en menos de 5 segundos de contacto.',
        'Su marcada actividad antimicrobiana residual acumulativa (sustantividad) gracias a su unión electrostática persistente a las proteínas del estrato córneo.',
        'Su evaporación inmediata en menos de 3 segundos sin dejar residuos en la piel.',
        'Su completa ausencia de citotoxicidad al contacto con mucosas y oído interno.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'La clorhexidina posee alta sustantividad (afinidad catiónica por la queratina dérmica), lo que le confiere un efecto inhibitorio residual prolongado de varias horas tras el lavado.',
    },
    {
      id: 21,
      categoria: 'Bundles de Infección • Accesos Vasculares',
      dificultad: 'Extrema',
      enunciado:
        'En el paquete de medidas (bundle) para la prevención de infecciones del torrente sanguíneo asociadas a Catéter Venoso Central (CVC), ¿cuál es el antiséptico cutáneo de elección para la curación del sitio de inserción?',
      opciones: [
        'Alcohol al 96% puro aplicado mediante fricción concéntrica sin esperar secado.',
        'Gluconato de clorhexidina al 2% en base alcohólica al 70%, dejándolo secar al aire por completo antes de cualquier manipulación.',
        'Solución salina normal al 0.9% para proteger la integridad del endotelio vascular.',
        'Yodopovidona al 10% enjuagada inmediatamente con agua destilada.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'La clorhexidina al 2% en alcohol al 70% es el preparado recomendado con mayor evidencia para inserción y curación de vías centrales, combinando acción rápida con persistencia residual.',
    },
    {
      id: 22,
      categoria: '5 Momentos OMS • Delimitación de Zonas',
      dificultad: 'Alta',
      enunciado:
        'Un enfermero ingresa a la habitación de un paciente, silencia la alarma del monitor multiparámetro y acomoda los cables en la mesa de noche sin tocar directamente al paciente. ¿A qué Momento de la OMS corresponde la higiene al retirarse?',
      opciones: [
        'Momento 1: Antes de tocar al paciente.',
        'Momento 2: Antes de una tarea limpia/aséptica.',
        'Momento 5: Después del contacto con el entorno del paciente.',
        'No requiere higiene ya que no existió contacto físico con el paciente.',
      ],
      indiceCorrecto: 2, // Opción C
      explicacionClinica:
        'El Momento 5 exige higiene tras tocar cualquier objeto, mueble o equipo dentro del área inmediata del paciente al abandonarla, ya que el entorno está intensamente colonizado por su microbiota.',
    },
    {
      id: 23,
      categoria: 'Virología Clínica • Espectro Antiséptico',
      dificultad: 'Alta',
      enunciado:
        '¿Por qué las soluciones hidroalcohólicas son altamente eficaces contra virus como SARS-CoV-2, Influenza y VIH, en comparación con Enterovirus o Rotavirus?',
      opciones: [
        'Porque los virus respiratorios y retrovirus poseen una envoltura lipídica que el alcohol disuelve rápidamente, inactivando sus proteínas de anclaje celular.',
        'Porque los virus con envoltura carecen de genoma al exponerse al oxígeno atmosférico.',
        'Porque el alcohol al 70% genera mutaciones letales espontáneas en el ARN viral.',
        'Porque los virus sin envoltura son eliminados exclusivamente por luz solar.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'Los virus envueltos poseen una membrana lipídica muy sensible a los solventes alcohólicos que disuelven su cubierta e impiden su infectividad celular; los virus desnudos o no envueltos son mucho más estables.',
    },
    {
      id: 24,
      categoria: 'Resistencia Antimicrobiana • Bacterias Panresistentes',
      dificultad: 'Extrema',
      enunciado:
        'Al atender a un paciente con infección por Klebsiella pneumoniae productora de carbapenemasas (KPC) o Acinetobacter baumannii multirresistente sin presencia de fluidos corporales, ¿cuál es la conducta validada por la OMS para la antisepsia de manos?',
      opciones: [
        'El alcohol en gel es inútil contra bacterias panresistentes; se debe utilizar obligatoriamente formaldehído diluido.',
        'La fricción con preparados hidroalcohólicos sigue siendo el método de elección, ya que los mecanismos plasmídicos de resistencia a antibióticos no confieren protección frente a la desnaturalización proteica del alcohol.',
        'Se debe sumergir las manos en cloruro de benzalconio al 5% durante 5 minutos seguidos.',
        'Solo se permite el lavado con agua destilada caliente sin jabón ni alcohol.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'Las mutaciones o plásmidos que confieren resistencia a los antibióticos (como betalactamasas) no protegen a las bacterias de la lisis física y desnaturalización de proteínas provocada por los preparados alcohólicos.',
    },
    {
      id: 25,
      categoria: 'Técnica de Antisepsia • Evaporación y Secado',
      dificultad: 'Alta',
      enunciado:
        'Al realizar la fricción con solución hidroalcohólica, ¿por qué la OMS exige frotar hasta que las manos queden totalmente secas y prohíbe sacudirlas o soplarlas?',
      opciones: [
        'Porque sacudir o soplar las manos las recontamina con microorganismos orales y aerosoles del entorno, interrumpiendo el tiempo de contacto biocida óptimo del antiséptico.',
        'Porque el alcohol en estado líquido absorbe la luz ultravioleta del techo y decolora la piel.',
        'Únicamente para evitar manchar con gel el uniforme o la historia clínica del paciente.',
        'Porque el alcohol que gotea en el suelo deteriora el piso de vinilo conductivo del hospital.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'Soplar proyecta microbiota respiratoria del operador sobre la piel, y sacudir las manos genera corrientes de bioaerosoles. La antisepsia se completa únicamente cuando el producto se evapora tras cubrir toda la superficie.',
    },
    {
      id: 26,
      categoria: 'Micología Hospitalaria • Candida auris',
      dificultad: 'Extrema',
      enunciado:
        'Ante un paciente colonizado o infectado por Candida auris multirresistente en una unidad de cuidados intensivos, ¿cuál es la consideración clave de la OMS y el CDC sobre la higiene de manos?',
      opciones: [
        'Los alcoholes son totalmente ineficaces contra todas las levaduras; solo se debe usar hipoclorito de sodio en piel.',
        'Las soluciones alcohólicas con formulaciones de la OMS conservan actividad fungicida frente a C. auris, pero si las manos tienen sospecha de contaminación con materia orgánica o fluidos, se debe priorizar agua y jabón.',
        'C. auris no se transmite por las manos del personal de salud, sino exclusivamente por vía aérea.',
        'Basta con frotar las manos durante 3 segundos con solución salina.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'Las preparaciones alcohólicas bien formuladas son eficaces contra C. auris en manos limpias, pero la persistencia ambiental y la presencia de fluidos requieren lavado estricto con agua y jabón y desinfección rigurosa de superficies con esporicidas.',
    },
    {
      id: 27,
      categoria: 'Bundles de Infección • Sonda Vesical (CAUTI)',
      dificultad: 'Alta',
      enunciado:
        'Para prevenir Infecciones del Tracto Urinario Asociadas a Catéter (CAUTI), ¿cuál es la indicación crítica de higiene de manos al manipular el sistema de drenaje urinario cerrado?',
      opciones: [
        'Realizar higiene de manos y colocarse guantes limpios inmediatamente antes de abrir el puerto de drenaje de la bolsa colectora, evitando que el grifo toque el recipiente receptor.',
        'Solo se requiere higiene de manos si la orina tiene olor fétido o hematuria franca.',
        'Desconectar la sonda vesical de la bolsa colectora para lavarla con alcohol al 70%.',
        'Vaciar la orina con guantes usados en otros pacientes si pertenecen a la misma habitación.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'La manipulación del sistema colector cerrado exige higiene de manos y guantes limpios (Momento 2) para prevenir la migración bacteriana intraluminal hacia la vejiga, asegurando que el tubo de vaciado nunca toque el receptáculo.',
    },
    {
      id: 28,
      categoria: 'Terapia Intensiva • Prevención de NAV',
      dificultad: 'Extrema',
      enunciado:
        'En un paciente intubado con ventilación mecánica invasiva, ¿cómo se articulan los 5 Momentos de la OMS al realizar una aspiración de secreciones endotraqueales con circuito abierto?',
      opciones: [
        'Higiene de manos únicamente al finalizar el procedimiento completo.',
        'Higiene de manos antes de ponerse el EPP y manipular el circuito (Momento 2: tarea aséptica) y nueva higiene obligatoria tras desechar el material y retirarse los guantes (Momento 3).',
        'No es necesaria la higiene previa porque la sonda de aspiración ya viene con empaque de fábrica.',
        'Realizar solo lavado de manos si el paciente tiene diagnóstico de neumonía bacteriana confirmada.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'La aspiración endotraqueal accede a la vía aérea inferior estéril (Momento 2: riesgo crítico de NAV); inmediatamente después de retirar la sonda y los guantes con secreciones respiratorias se debe realizar higiene (Momento 3).',
    },
    {
      id: 29,
      categoria: 'Aislamiento Hospitalario • Retiro de EPP',
      dificultad: 'Extrema',
      enunciado:
        'Durante el protocolo de desvestido (doffing) del Equipo de Protección Personal (EPP) en un aislamiento de contacto por patógenos multirresistentes, ¿en qué punto es crucial realizar higiene de manos?',
      opciones: [
        'Únicamente al llegar a su domicilio al finalizar la jornada laboral.',
        'Inmediatamente después del retiro de los guantes contaminados, antes de tocar la mascarilla, gafas o bata en la zona de la cabeza o cuello.',
        'Solo si se observan roturas de la tela plástica de la bata.',
        'Frotando alcohol sobre la superficie exterior de la bata antes de desatarla.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'Los guantes son el elemento más densamente contaminado; tras retirarlos, se debe realizar higiene de manos inmediata para evitar autoinocularse en conjuntiva o mucosas al retirar la mascarilla o las gafas.',
    },
    {
      id: 30,
      categoria: 'Farmacología Antiséptica • Humectantes OMS',
      dificultad: 'Alta',
      enunciado:
        'En la formulación estandarizada de fricción alcohólica de la OMS, ¿por qué se especifica una concentración exacta de glicerol al 1.45% v/v?',
      opciones: [
        'Porque concentraciones mayores al 1.5% reducen la eficacia biocida del alcohol al prolongar excesivamente el tiempo de secado y disminuir el contacto bacteriano.',
        'Porque el glicerol al 1.45% es el agente que destruye las paredes de las bacterias Gram positivas.',
        'Para dar un color azul distintivo que identifique el preparado hospitalario.',
        'Para acelerar la evaporación del alcohol a menos de 5 segundos.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'El glicerol previene la resequedad dérmica, pero un exceso (>1.5%) reduce la actividad antimicrobiana intrínseca de los alcoholes y deja una sensación pegajosa indeseable.',
    },
    {
      id: 31,
      categoria: 'Microbiología Cuantitativa • Reducción Logarítmica',
      dificultad: 'Extrema',
      enunciado:
        'En los ensayos de eficacia microbiológica de antisépticos cutáneos, ¿qué implicación clínica tiene una "reducción de 5 log10" en el recuento bacteriano de las manos?',
      opciones: [
        'Disminuye la carga microbiana en un 50% de las colonias.',
        'Reduce la población bacteriana inicial en un 99.999% (un factor de cien mil veces).',
        'Inactiva exactamente 5 bacterias individuales por centímetro cuadrado de piel.',
        'Aumenta la resistencia de la piel a 5 antibióticos diferentes.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'Una reducción de 1 log equivale al 90%, 2 log al 99%, 3 log al 99.9%, 4 log al 99.99% y 5 log al 99.999%. Las soluciones alcohólicas de calidad logran reducciones de 3.5 a 5 log10 en menos de 30 segundos.',
    },
    {
      id: 32,
      categoria: 'Bloque Quirúrgico • Fricción Quirúrgica OMS',
      dificultad: 'Alta',
      enunciado:
        'Según las guías de la OMS para la preparación preoperatoria del equipo quirúrgico, ¿qué ventajas ofrece la fricción alcohólica quirúrgica frente al lavado quirúrgico acuoso con antiséptico?',
      opciones: [
        'Menor tiempo total de preparación (alrededor de 3 minutos vs 5 minutos), mejor tolerancia cutánea del personal y un efecto antimicrobiano inicial igual o superior sin riesgo de recontaminación por el agua del grifo.',
        'Permite operar sin guantes estériles en cirugías menores.',
        'No requiere que las manos estén limpias ni secas antes de aplicarse el producto.',
        'El alcohol quirúrgico dura activo más de 48 horas continuas en la piel.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'La fricción quirúrgica con solución hidroalcohólica es más rápida, ahorra grandes volúmenes de agua tratada, cuida la integridad cutánea y elimina el riesgo de recontaminación bacteriana a través de los grifos del lavamanos.',
    },
    {
      id: 33,
      categoria: 'Cuidados Críticos • Paciente Gran Quemado',
      dificultad: 'Extrema',
      enunciado:
        'Al atender a un paciente con quemaduras de segundo y tercer grado con pérdida extensa de la barrera epidérmica, ¿cuál es la conducta de bioseguridad mandatoria antes de la curación?',
      opciones: [
        'Utilizar únicamente guantes de examen sin realizar higiene previa porque la piel del paciente ya está abierta.',
        'Higiene minuciosa de manos con técnica completa (Momento 2) y uso de técnica y campos estériles estrictos, dado el riesgo crítico de sepsis invasiva por Pseudomonas y Staphylococcus.',
        'Aplicar alcohol al 70% directamente sobre las áreas cruentas quemadas para desinfectar la fascia.',
        'Realizar higiene de manos únicamente con agua destilada fría para evitar el olor a jabón.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'En quemaduras extensas la pérdida de epidermis elimina la primera línea defensiva del organismo; la higiene rigurosa previa al procedimiento (Momento 2) con barrera estéril es vital para prevenir bacteriemias y shock séptico.',
    },
    {
      id: 34,
      categoria: 'Vectores de Transmisión • Fómites Clínicos',
      dificultad: 'Alta',
      enunciado:
        'Un estudio de cultivo bacteriológico demuestra que los diafragmas de los estetoscopios albergan cargas bacterianas similares a las yemas de las manos del personal de salud. ¿Cómo debe proceder el clínico al examinar pacientes sucesivos?',
      opciones: [
        'Basta con lavar el estetoscopio una vez por semana con agua jabonosa.',
        'Realizar higiene de manos (Momento 1) y desinfectar el diafragma del estetoscopio con alcohol isopropílico al 70% antes y después de examinar a cada paciente.',
        'Examinar al paciente únicamente a través de tres capas de sábanas gruesas para no tocar la piel.',
        'Sustituir el estetoscopio por la palpación manual con guantes sin desinfectar.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'Los estetoscopios actúan como fómites directos de transmisión cruzada entre pacientes; desinfectar la campana/diafragma con alcohol al 70% antes y después de la auscultación, junto con la higiene de manos, previene brotes intrahospitalarios.',
    },
    {
      id: 35,
      categoria: 'Farmacología Antiséptica • Incompatibilidad Química',
      dificultad: 'Extrema',
      enunciado:
        '¿Por qué el gluconato de clorhexidina no debe combinarse con jabones duros corrientes o cremas hidratantes que contengan surfactantes aniónicos (como laurilsulfato sódico)?',
      opciones: [
        'Porque los surfactantes aniónicos forman complejos insolubles con la molécula catiónica de clorhexidina, neutralizando completamente su actividad bactericida.',
        'Porque produce una reacción que tiñe permanentemente la dermis de color negro.',
        'Porque genera gas cloro tóxico en el ambiente de la habitación.',
        'Porque duplica su poder oxidante provocando necrosis tisular inmediata.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'La clorhexidina es un catión orgánico; al entrar en contacto con sustancias aniónicas (como jabones tradicionales o ciertos humectantes) precipita químicamente y pierde toda su eficacia antimicrobiana.',
    },
    {
      id: 36,
      categoria: 'Toxicología y Bioseguridad • Antisépticos vs Desinfectantes',
      dificultad: 'Alta',
      enunciado:
        '¿Cuál es la diferencia regulatoria y biológica fundamental entre un antiséptico y un desinfectante en el entorno sanitario?',
      opciones: [
        'Los antisépticos son formulaciones formuladas para aplicarse sobre tejidos vivos y piel; los desinfectantes son sustancias químicas diseñadas para objetos inanimados y superficies inertes por su toxicidad tisular.',
        'Los antisépticos eliminan esporas en 1 segundo y los desinfectantes tardan 24 horas.',
        'Los desinfectantes pueden ingerirse con seguridad en dosis bajas.',
        'No existe ninguna diferencia; son términos sinónimos intercambiables en todos los niveles clínicos.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'Los antisépticos están diseñados para reducir la carga microbiana en piel y mucosas sin provocar daño citotóxico severo. Los desinfectantes son para fómites y mobiliario inerte debido a su elevada toxicidad en tejidos humanos.',
    },
    {
      id: 37,
      categoria: 'Microbiología Nosocomial • Enterococo Resistente (VRE)',
      dificultad: 'Extrema',
      enunciado:
        'Enterococcus faecium resistente a vancomicina (VRE) es conocido por persistir semanas en superficies secas del entorno del paciente. ¿Cuál es la implicación directa para el Momento 5 de la OMS?',
      opciones: [
        'No requiere higiene si el trabajador solo apoyó las manos en las barandas de la cama sin tocar las sábanas.',
        'Tocar veladores, barandas o monitores en la habitación de un paciente con VRE contamina las manos con la misma densidad que el contacto cutáneo directo, obligando a realizar higiene rigurosa al salir (Momento 5).',
        'VRE muere instantáneamente al contacto con el aire seco de la habitación.',
        'Solo se requiere higiene de manos si el trabajador sufre una cortadura en el dedo.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'VRE tiene una gran resistencia a la desecación ambiental y coloniza fuertemente el mobiliario circundante. La higiene al dejar el entorno (Momento 5) es esencial para frenar su diseminación a otros enfermos.',
    },
    {
      id: 38,
      categoria: 'Procedimientos Clínicos • Curación de Herida Quirúrgica',
      dificultad: 'Alta',
      enunciado:
        'Al realizar la curación de una laparotomía con drenaje purulento activo, ¿cuál es la secuencia correcta de higiene de manos entre la retirada del vendaje sucio y la aplicación de la nueva gasa estéril?',
      opciones: [
        'Retirar apósito con guantes limpios, desecharlos, realizar higiene de manos inmediata (Momento 3), calzarse guantes estériles (Momento 2) y colocar el nuevo apósito estéril.',
        'Mantener los mismos guantes de la retirada para manipular las gasas limpias y ahorrar tiempo.',
        'Aplicar alcohol sobre el vendaje sucio antes de despegar el esparadrapo.',
        'Soplar sobre la herida quirúrgica para secar el exudado antes de la nueva gasa.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'Al retirar material sucio con fluidos se activa el Momento 3 (retirar guantes y descontaminar manos); antes de tocar insumos estériles o el lecho de la incisión se activa el Momento 2 (higiene y colocación de guantes estériles).',
    },
    {
      id: 39,
      categoria: 'Pediatría y Neonatología • Toxicidad por Yodo',
      dificultad: 'Extrema',
      enunciado:
        '¿Por qué la OMS y las sociedades de neonatología contraindican el uso rutinario de yodopovidona para la antisepsia de piel en recién nacidos de muy bajo peso al nacer (< 1500 g)?',
      opciones: [
        'Porque la inmadurez del estrato córneo permite la absorción sistémica masiva de yodo, causando hipotiroidismo transitorio o disfunción tiroidea en el prematuro.',
        'Porque el yodo descompone el surfactante pulmonar a través de la piel.',
        'Porque la yodopovidona decolora permanentemente las mantas térmicas de la incubadora.',
        'Porque atrae insectos hacia la cuna de calor radiante.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'La piel del prematuro es sumamente delgada y permeable; la absorción transcutánea de yodo bloquea la glándula tiroides (efecto Wolff-Chaikoff), provocando hipotiroidismo yatrogénico grave.',
    },
    {
      id: 40,
      categoria: 'Formulaciones Locales OMS • Isopropanol vs Etanol',
      dificultad: 'Alta',
      enunciado:
        'La OMS estipula dos fórmulas oficiales para preparar fricción hidroalcohólica: Fórmula 1 (con etanol al 80%) y Fórmula 2 (con alcohol isopropílico al 75%). ¿Cuál es una diferencia técnica relevante entre ambos?',
      opciones: [
        'El isopropanol es ligeramente más activo frente a bacterias vegetativas pero menos eficaz contra ciertos virus sin envoltura (como poliovirus y hepatitis A) en comparación con el etanol.',
        'El etanol no destruye bacterias Gram negativas en ninguna concentración.',
        'La fórmula con isopropanol requiere añadir aceite de oliva para estabilizarse.',
        'El etanol al 80% está prohibido en hospitales por considerarse material combustible explosivo.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'El etanol al 80% ofrece un espectro antiviral ligeramente más amplio contra ciertos enterovirus y virus no envueltos en comparación con el isopropanol al 75%, aunque ambos son excelentes bactericidas para uso hospitalario.',
    },
    {
      id: 41,
      categoria: 'Infectología • Mycobacterium tuberculosis',
      dificultad: 'Extrema',
      enunciado:
        'Respecto a la susceptibilidad de Mycobacterium tuberculosis (bacilo de Koch) frente a los agentes de higiene de manos, ¿cuál es el comportamiento de las soluciones hidroalcohólicas?',
      opciones: [
        'El alcohol no puede penetrar la gruesa pared rica en ácidos micólicos de las micobacterias.',
        'Las soluciones alcohólicas concentradas (60-80%) poseen una potente actividad tuberculicida rápida, superando ampliamente a los jabones comunes y a los amonios cuaternarios.',
        'M. tuberculosis prolifera dentro de los frascos de alcohol al 70%.',
        'Solo se logra destruir micobacterias mediante lavado con agua a 100 °C sobre la piel.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'A pesar del alto contenido lipídico y ácidos micólicos de la pared micobacteriana, los preparados con alcohol al 70-80% penetran y lisan Mycobacterium tuberculosis con rapidez, siendo biocidas de primera línea.',
    },
    {
      id: 42,
      categoria: 'Niveles de Higiene • Objetivos Clínicos',
      dificultad: 'Alta',
      enunciado:
        '¿Cuál es el objetivo primario que diferencia el "lavado clínico de manos" respecto a la simple higiene doméstica o "lavado social"?',
      opciones: [
        'El lavado clínico busca eliminar la suciedad visible, materia orgánica y reducir sustancialmente la flora bacteriana transitoria adquirida en el contacto asistencial mediante técnica estandarizada y tiempos protocolizados.',
        'El lavado clínico solo busca aromatizar las manos para comodidad del paciente.',
        'El lavado social utiliza agua estéril y el clínico agua de grifo sin tratar.',
        'El lavado clínico no requiere jabón ni secado.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'El lavado clínico tiene como fin primordial remover suciedad y reducir la microbiota transitoria patógena entre pacientes mediante la técnica sistemática de 11 pasos y un tiempo estandarizado de 40 a 60 segundos.',
    },
    {
      id: 43,
      categoria: 'Normativa OMS • Prohibición de Toallas de Tela',
      dificultad: 'Alta',
      enunciado:
        '¿Por qué las directrices de bioseguridad hospitalaria prohíben taxativamente el uso de toallas de tela comunitarias o compartidas para el secado de manos del personal?',
      opciones: [
        'Porque las toallas de tela húmedas compartidas se convierten en focos masivos de colonización bacteriana y recontaminan las manos limpias de los profesionales de inmediato.',
        'Porque la tela desgasta los uniformes quirúrgicos al frotarla.',
        'Porque el hilo de algodón absorbe los rayos gamma de los equipos de radiología.',
        'Porque el costo del lavado textil en lavandería es más alto que comprar toallas de papel.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'Las toallas de tela comunitarias retienen humedad constante y detritos orgánicos, actuando como vectores de recontaminación bacteriana masiva entre usuarios; solo se autorizan toallas de papel desechable de un solo uso.',
    },
    {
      id: 44,
      categoria: 'Urgencias y Accesos Vasculares • Retirada Precoz',
      dificultad: 'Extrema',
      enunciado:
        'En una reanimación cardiopulmonar en el servicio de urgencias, se inserta un catéter venoso periférico sin tiempo para realizar la antisepsia adecuada de la piel. Según los protocolos de prevención de infecciones, ¿qué medida debe adoptarse?',
      opciones: [
        'Dejar el catéter durante 7 días para no molestar las venas del paciente.',
        'Retirar el catéter y canalizar uno nuevo bajo condiciones asépticas tan pronto como el paciente esté estabilizado, preferiblemente antes de 24 a 48 horas.',
        'Inyectar alcohol al 70% por la luz del catéter para esterilizar la vena desde adentro.',
        'Colocar dos apósitos encima sin cambiar la vía.',
      ],
      indiceCorrecto: 1, // Opción B
      explicacionClinica:
        'Cualquier catéter colocado en situaciones de emergencia sin estricta asepsia cutánea se considera potencialmente contaminado y debe reemplazarse en un sitio nuevo bajo técnica estéril dentro de las primeras 24-48 horas.',
    },
    {
      id: 45,
      categoria: 'Bioquímica Antimicrobiana • Neutralización por Pus',
      dificultad: 'Extrema',
      enunciado:
        '¿Cuál es el motivo fundamental por el cual un lecho de herida o piel con restos abundantes de sangre coagulada y secreción purulenta debe lavarse primero con solución fisiológica antes de aplicar antisépticos?',
      opciones: [
        'La albúmina, restos celulares y proteínas del exudado ligan y neutralizan químicamente los agentes antisépticos activos, creando un escudo protector para las bacterias subyacentes.',
        'El pus cataliza la evaporación instantánea de cualquier líquido en 1 segundo.',
        'Los glóbulos blancos del pus se vuelven cancerígenos al entrar en contacto con antisépticos.',
        'Porque la solución salina al 0.9% es el único esporicida aprobado por la OMS.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'La materia orgánica (sangre, proteínas séricas, pus) inactiva gran parte de los antisépticos (yodóforos, clorhexidina, alcoholes) al quelarlos o consumirlos, exigiendo la limpieza mecánica previa para permitir su contacto con los microorganismos.',
    },
    {
      id: 46,
      categoria: 'Inmunología Cutánea • Microbiota Residente',
      dificultad: 'Alta',
      enunciado:
        '¿Cuál es la función beneficiosa esencial de la microbiota cutánea residente comensal (como Staphylococcus epidermidis y Corynebacterium) en la piel de las manos sanas?',
      opciones: [
        'Interferir por competencia biológica y producción de péptidos antimicrobianos (bacteriocinas) impidiendo la colonización por patógenos nosocomiales invasores.',
        'Estimular la producción de sudor ácido para disolver los guantes clínicos.',
        'Almacenar glucógeno para alimentar las células nerviosas de los dedos.',
        'Facilitar la entrada de virus para inducir inmunidad de rebaño.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'La flora residente forma una barrera ecológica protectora por competencia de nicho y secreción de bacteriocinas que impiden que patógenos virulentos transitorios colonicen la piel de forma persistente.',
    },
    {
      id: 47,
      categoria: 'Salud Ocupacional • Temperatura del Agua',
      dificultad: 'Alta',
      enunciado:
        '¿Por qué las directrices de la OMS recomiendan evitar el uso de agua caliente durante el lavado de manos del personal sanitario?',
      opciones: [
        'Porque el agua caliente despoja la barrera lipídica protectora de la epidermis, aumentando el riesgo de dermatitis por contacto sin aportar ningún beneficio bactericida adicional.',
        'Porque el agua caliente congela el jabón en el lavamanos.',
        'Porque las bacterias hospitalarias solo se multiplican en agua fría.',
        'Por regulaciones estrictas de conservación de energía del departamento de mantenimiento.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'El agua caliente no mejora la remoción bacteriana (la temperatura tolerable para la piel no es biocida) y en cambio deseca y degrada los lípidos cutáneos, provocando eccemas que facilitan la colonización patógena.',
    },
    {
      id: 48,
      categoria: 'Gestión de la Calidad • Estrategia Multimodal OMS',
      dificultad: 'Extrema',
      enunciado:
        'La OMS promueve la "Estrategia Multimodal para la Mejora de la Higiene de las Manos" como el estándar global de intervención. ¿Cuáles son sus cinco componentes fundamentales?',
      opciones: [
        'Cambio del sistema (acceso a insumos en el punto de atención), Formación y aprendizaje, Evaluación y retroalimentación, Recordatorios en el lugar de trabajo y Clima institucional de seguridad.',
        'Sanciones económicas, Inspección policial, Aislamiento total de enfermeros, Multas a pacientes y Cierre de salas.',
        'Cambio de directores, Compra de guantes negros, Aumento salarial, Instalación de cámaras y Despidos inmediatos.',
        'Uso de jabón en barra, Secadores de aire, Eliminación de soluciones alcohólicas, Cero supervisión y Turnos de 24 horas.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'Los 5 pilares de la Estrategia Multimodal de la OMS han demostrado un incremento sostenido del cumplimiento del personal al articular infraestructura disponible, capacitación continua, auditoría con feedback, cartelería clave y cultura institucional de seguridad.',
    },
    {
      id: 49,
      categoria: 'Hemodiálisis y Nefrología • Acceso Vascular (FAV)',
      dificultad: 'Alta',
      enunciado:
        'En la sala de hemodiálisis, antes de canular una Fístula Arteriovenosa (FAV) nativa para iniciar la terapia de reemplazo renal, ¿cuál es el paso de higiene indispensable?',
      opciones: [
        'Higiene de manos con fricción alcohólica o lavado antiséptico (Momento 2) y aplicación rigurosa de antiséptico cutáneo en el brazo con técnica aséptica, dejando secar totalmente.',
        'Limpiar el brazo con agua corriente de grifo y puncionar inmediatamente con la piel mojada.',
        'No realizar ninguna higiene si el paciente se bañó en su casa por la mañana.',
        'Soplar sobre el sitio de punción para identificar el latido del frémito.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'La fístula es la línea de vida del paciente en hemodiálisis; canularla sin higiene estricta previa (Momento 2) expone al paciente a bacteriemia por S. aureus y pérdida definitiva del acceso vascular.',
    },
    {
      id: 50,
      categoria: '5 Momentos OMS • Diferenciación Epidemiológica',
      dificultad: 'Alta',
      enunciado:
        '¿Cuál es la razón epidemiológica por la cual la OMS definió el Momento 4 ("después del contacto con el paciente") y el Momento 5 ("después del contacto con el entorno del paciente") como momentos separados?',
      opciones: [
        'Para diferenciar claramente los riesgos microbiológicos y evitar la diseminación cruzada hacia otras áreas asistenciales, reconociendo que tocar muebles o monitores transfiere patógenos con idéntica frecuencia que tocar la piel del enfermo.',
        'Únicamente para hacer más largas las listas de chequeo de los supervisores.',
        'Porque el entorno del paciente nunca se contamina con bacterias humanas.',
        'Porque el Momento 5 solo aplica para el personal de limpieza y maestranza.',
      ],
      indiceCorrecto: 0, // Opción A
      explicacionClinica:
        'La distinción formal refuerza la toma de conciencia: el entorno inmediato está saturado con la microbiota del paciente. Salir de la unidad tras tocar la cama o los equipos sin lavarse las manos es una de las causas más frecuentes de propagación nosocomial en el puesto de enfermería.',
    },
  ];

  nombreCompetidor = '';
  codigoCompetidor = '';

  readonly estadoJuego = signal<'lobby' | 'jugando' | 'finalizado'>('lobby');
  readonly preguntasPartida = signal<PreguntaRetoExtremo[]>([]);
  readonly indicePregunta = signal<number>(0);
  readonly opcionSeleccionada = signal<number | null>(null);
  readonly aciertosTotales = signal<number>(0);
  readonly tiempoTranscurridoSeg = signal<number>(0);

  // Ranking y Podio en vivo
  readonly ranking = signal<RegistroRetoExtremo[]>([]);

  readonly primerLugar = computed<RegistroRetoExtremo | null>(() => {
    const list = this.ranking();
    return list.length > 0 ? list[0] : null;
  });

  readonly segundoLugar = computed<RegistroRetoExtremo | null>(() => {
    const list = this.ranking();
    return list.length > 1 ? list[1] : null;
  });

  readonly tercerLugar = computed<RegistroRetoExtremo | null>(() => {
    const list = this.ranking();
    return list.length > 2 ? list[2] : null;
  });

  readonly ultimoLugar = computed<RegistroRetoExtremo | null>(() => {
    const list = this.ranking();
    return list.length > 0 ? list[list.length - 1] : null;
  });

  private cronometroInterval: any = null;
  private inicioTimestamp = 0;

  readonly preguntaActual = computed<PreguntaRetoExtremo | null>(() => {
    const lista = this.preguntasPartida();
    return lista[this.indicePregunta()] || null;
  });

  readonly tiempoFormateado = computed(() => this.tiempoTranscurridoSeg().toFixed(1));

  readonly porcentajeAciertos = computed(() => {
    return Math.round((this.aciertosTotales() / 7) * 100);
  });

  readonly puntajeCalculado = computed(() => {
    const aciertos = this.aciertosTotales();
    const tiempo = this.tiempoTranscurridoSeg();
    // 100 pts por acierto (hasta 700) + bono por rapidez (hasta 300)
    const baseAciertos = Math.round((aciertos / 7) * 700);
    const bonoVelocidad = Math.max(0, Math.round(300 - tiempo * 3.5));
    return baseAciertos + (aciertos > 0 ? bonoVelocidad : 0);
  });

  ngOnInit(): void {
    const student = this.stateService.student();
    const authUser = this.authService.usuarioActual();
    this.nombreCompetidor = student?.fullName || authUser?.nombre || 'Estudiante de Enfermería';
    this.codigoCompetidor = student?.studentCode || authUser?.codigoEstudiantil || '2026-ENF-UCC';

    this.cargarRankingCompetitivo();
  }

  ngOnDestroy(): void {
    this.detenerCronometro();
  }

  cargarRankingCompetitivo(): void {
    this.practicasService.obtenerRankingRetoExtremo(this.codigoCompetidor).subscribe({
      next: (res: RankingRetoExtremoResponse) => {
        if (Array.isArray(res.ranking) && res.ranking.length > 0) {
          this.ranking.set(this.ordenarRegistros(res.ranking));
        } else {
          this.ranking.set(this.obtenerRankingLocalFallback());
        }
      },
      error: () => {
        this.ranking.set(this.obtenerRankingLocalFallback());
      },
    });
  }

  /**
   * Baraja las 4 opciones de una pregunta y reubica adecuadamente el índice correcto.
   */
  private barajarOpcionesPregunta(pregunta: PreguntaRetoExtremo): PreguntaRetoExtremo {
    const opcionesConEstado = pregunta.opciones.map((texto, idx) => ({
      texto,
      esCorrecta: idx === pregunta.indiceCorrecto,
    }));

    // Algoritmo Fisher-Yates para barajar las 4 opciones
    for (let i = opcionesConEstado.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opcionesConEstado[i], opcionesConEstado[j]] = [opcionesConEstado[j], opcionesConEstado[i]];
    }

    return {
      ...pregunta,
      opciones: opcionesConEstado.map((item) => item.texto),
      indiceCorrecto: opcionesConEstado.findIndex((item) => item.esCorrecta),
    };
  }

  /**
   * Selecciona 7 preguntas al azar del banco disponible y baraja las opciones de cada una.
   */
  private seleccionarPreguntasAleatorias(): PreguntaRetoExtremo[] {
    const bancoCopia = [...this.bancoPreguntasExtremas];

    // Algoritmo Fisher-Yates para seleccionar preguntas aleatorias del banco
    for (let i = bancoCopia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bancoCopia[i], bancoCopia[j]] = [bancoCopia[j], bancoCopia[i]];
    }

    const seleccionadas = bancoCopia.slice(0, Math.min(7, bancoCopia.length));
    return seleccionadas.map((preg) => this.barajarOpcionesPregunta(preg));
  }

  iniciarReto(): void {
    const seleccionadas = this.seleccionarPreguntasAleatorias();
    this.preguntasPartida.set(seleccionadas);
    this.indicePregunta.set(0);
    this.opcionSeleccionada.set(null);
    this.aciertosTotales.set(0);
    this.tiempoTranscurridoSeg.set(0);
    this.estadoJuego.set('jugando');

    this.detenerCronometro();
    this.inicioTimestamp = performance.now();
    this.cronometroInterval = setInterval(() => {
      const transcurrido = (performance.now() - this.inicioTimestamp) / 1000;
      this.tiempoTranscurridoSeg.set(Math.round(transcurrido * 10) / 10);
    }, 100);
  }

  seleccionarOpcion(idx: number): void {
    if (this.opcionSeleccionada() !== null) return;
    this.opcionSeleccionada.set(idx);
    const actual = this.preguntaActual();
    if (actual && idx === actual.indiceCorrecto) {
      this.aciertosTotales.update((v) => v + 1);
    }
  }

  avanzarPregunta(): void {
    const siguiente = this.indicePregunta() + 1;
    if (siguiente < 7) {
      this.indicePregunta.set(siguiente);
      this.opcionSeleccionada.set(null);
    } else {
      this.finalizarReto();
    }
  }

  private finalizarReto(): void {
    this.detenerCronometro();
    this.estadoJuego.set('finalizado');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const puntaje = this.puntajeCalculado();
    const tiempo = this.tiempoTranscurridoSeg();
    const aciertos = this.aciertosTotales();

    const payload = {
      nombre: this.nombreCompetidor.trim() || 'Estudiante de Enfermería',
      codigoEstudiantil: this.codigoCompetidor.trim() || '2026-ENF-UCC',
      aciertos,
      totalPreguntas: 7,
      tiempoSegundos: tiempo,
    };

    // 1. Guardar en Supabase mediante backend
    this.practicasService.registrarRetoExtremo(payload).subscribe({
      next: (res: RankingRetoExtremoResponse) => {
        if (Array.isArray(res.ranking) && res.ranking.length > 0) {
          this.ranking.set(this.ordenarRegistros(res.ranking));
        } else {
          this.actualizarLocalYRanking(payload, puntaje);
        }
      },
      error: () => {
        this.actualizarLocalYRanking(payload, puntaje);
      },
    });
  }

  private actualizarLocalYRanking(payload: any, puntaje: number): void {
    const local = this.obtenerRankingLocalFallback();
    const nuevo: RegistroRetoExtremo = {
      id: `local-${Date.now()}`,
      posicion: 0,
      nombre: payload.nombre,
      codigoEstudiantil: payload.codigoEstudiantil,
      aciertos: payload.aciertos,
      totalPreguntas: 7,
      porcentajeExito: Math.round((payload.aciertos / 7) * 100),
      tiempoSegundos: payload.tiempoSegundos,
      puntajeCompetitivo: puntaje,
      fecha: new Date().toISOString(),
      esUsuarioActual: true,
    };

    const filtrados = local.filter(
      (r) => r.codigoEstudiantil.toLowerCase() !== payload.codigoEstudiantil.toLowerCase()
    );
    const combinados = this.ordenarRegistros([...filtrados, nuevo]);
    this.ranking.set(combinados);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ranking_cuanto_sabes', JSON.stringify(combinados));
      } catch {}
    }
  }

  private ordenarRegistros(lista: RegistroRetoExtremo[]): RegistroRetoExtremo[] {
    return [...lista]
      .sort((a, b) => {
        if (b.puntajeCompetitivo !== a.puntajeCompetitivo) {
          return b.puntajeCompetitivo - a.puntajeCompetitivo;
        }
        return a.tiempoSegundos - b.tiempoSegundos;
      })
      .map((item, idx) => ({ ...item, posicion: idx + 1 }));
  }

  private obtenerRankingLocalFallback(): RegistroRetoExtremo[] {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('ranking_cuanto_sabes');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return this.ordenarRegistros(parsed);
          }
        }
      } catch {}
    }

    const iniciales: RegistroRetoExtremo[] = [
      {
        id: 'seed-1',
        posicion: 1,
        nombre: 'Valeria Mendoza (UCI Adultos)',
        codigoEstudiantil: '2026-ENF-412',
        aciertos: 7,
        totalPreguntas: 7,
        porcentajeExito: 100,
        tiempoSegundos: 19.4,
        puntajeCompetitivo: 980,
        fecha: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: 'seed-2',
        posicion: 2,
        nombre: 'Sebastián Rojas (Quirófano)',
        codigoEstudiantil: '2026-ENF-809',
        aciertos: 7,
        totalPreguntas: 7,
        porcentajeExito: 100,
        tiempoSegundos: 25.1,
        puntajeCompetitivo: 935,
        fecha: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
      },
      {
        id: 'seed-3',
        posicion: 3,
        nombre: 'Camila Gómez (Urgencias)',
        codigoEstudiantil: '2026-ENF-274',
        aciertos: 6,
        totalPreguntas: 7,
        porcentajeExito: 86,
        tiempoSegundos: 21.8,
        puntajeCompetitivo: 855,
        fecha: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
      },
      {
        id: 'seed-4',
        posicion: 4,
        nombre: 'Mateo Solarte (Hospitalización)',
        codigoEstudiantil: '2026-ENF-930',
        aciertos: 5,
        totalPreguntas: 7,
        porcentajeExito: 71,
        tiempoSegundos: 38.6,
        puntajeCompetitivo: 645,
        fecha: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      },
      {
        id: 'seed-5',
        posicion: 5,
        nombre: 'Daniela Narváez (Pediatría)',
        codigoEstudiantil: '2026-ENF-155',
        aciertos: 4,
        totalPreguntas: 7,
        porcentajeExito: 57,
        tiempoSegundos: 46.2,
        puntajeCompetitivo: 495,
        fecha: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      },
    ];

    return this.ordenarRegistros(iniciales);
  }

  private detenerCronometro(): void {
    if (this.cronometroInterval) {
      clearInterval(this.cronometroInterval);
      this.cronometroInterval = null;
    }
  }

  obtenerClaseOpcion(idx: number): string {
    const sel = this.opcionSeleccionada();
    const correcta = this.preguntaActual()?.indiceCorrecto;
    if (sel === null) {
      return 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 hover:border-amber-400 text-slate-800';
    }
    if (idx === correcta) {
      return 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm';
    }
    if (idx === sel && sel !== correcta) {
      return 'bg-rose-50 border-rose-400 text-rose-900';
    }
    return 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
  }

  obtenerClaseLetraOpcion(idx: number): string {
    const sel = this.opcionSeleccionada();
    const correcta = this.preguntaActual()?.indiceCorrecto;
    if (sel === null) {
      return 'bg-slate-200 text-slate-700';
    }
    if (idx === correcta) {
      return 'bg-emerald-500 text-white';
    }
    if (idx === sel && sel !== correcta) {
      return 'bg-rose-500 text-white';
    }
    return 'bg-slate-200 text-slate-400';
  }
}
