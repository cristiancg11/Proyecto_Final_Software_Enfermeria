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
    <div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
      <!-- Destellos ambientales clínicos -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-500/15 blur-3xl pointer-events-none"></div>

      <div class="max-w-5xl mx-auto relative z-10">
        <!-- Encabezado del Modo Reto Extremo -->
        <div class="bg-gradient-to-br from-[#0B192C] via-[#0F2942] to-[#0D3B3E] rounded-2xl p-6 sm:p-8 border border-teal-500/30 shadow-[0_24px_50px_-12px_rgba(7,17,30,0.6)] mb-8">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div class="space-y-2">
              <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/15 border border-teal-400/35 text-teal-300 text-xs font-bold uppercase tracking-wider">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Modo Competitivo • Velocidad + Precisión OMS</span>
              </div>
              <h1 class="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                ⚡ Reto Extremo: Trivia de Alta Dificultad
              </h1>
              <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Demuestra tu dominio de los protocolos clínicos de la OMS bajo presión de cronómetro. Quien logre el mayor número de aciertos en el <strong class="text-teal-300">menor tiempo total</strong> conquista el primer lugar del ranking.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3 self-start md:self-auto">
              <a
                routerLink="/introduccion"
                class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/15 transition-all duration-300"
              >
                ← Volver al Panel
              </a>
              @if (estadoJuego() !== 'jugando') {
                <button
                  type="button"
                  (click)="iniciarReto()"
                  class="btn-primary py-3 px-6 text-xs sm:text-sm"
                >
                  🔥 ¡Iniciar Reto Ahora!
                </button>
              }
            </div>
          </div>
        </div>

        <!-- ======================================================================= -->
        <!-- FASE 1: LOBBY DE PREPARACIÓN Y TABLERO DE LÍDER / ÚLTIMO LUGAR          -->
        <!-- ======================================================================= -->
        @if (estadoJuego() === 'lobby') {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 animate-fade-in">
            <!-- Panel de Configuración del Reto -->
            <div class="lg:col-span-7 bg-white/98 backdrop-blur-xl text-slate-800 rounded-2xl p-6 sm:p-8 shadow-[0_18px_40px_-12px_rgba(7,17,30,0.35)] border border-slate-200/90 flex flex-col justify-between space-y-6">
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-teal-700 block mb-1">
                  Configuración de Partida Competitiva
                </span>
                <h2 class="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-4">
                  Prepárate para competir contra el reloj
                </h2>

                <!-- Identificación rápida del competidor -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Tu Nombre o Alias Clínico</label>
                    <input
                      type="text"
                      [(ngModel)]="nombreCompetidor"
                      placeholder="Ej. Laura Ramírez"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Código Estudiantil</label>
                    <input
                      type="text"
                      [(ngModel)]="codigoCompetidor"
                      placeholder="Ej. ENF-2026-101"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                <!-- Selector de Cantidad de Preguntas (5 a 10) -->
                <div class="mb-5">
                  <label class="block text-xs font-semibold text-slate-700 mb-2">
                    Selecciona la intensidad del Reto Extremo:
                  </label>
                  <div class="grid grid-cols-3 gap-2.5">
                    @for (cant of [5, 8, 10]; track cant) {
                      <button
                        type="button"
                        (click)="cantidadPreguntasSeleccionada.set(cant)"
                        class="p-3.5 rounded-xl border text-center transition-all duration-300 cursor-pointer"
                        [ngClass]="cantidadPreguntasSeleccionada() === cant
                          ? 'bg-teal-50 border-teal-600 text-teal-800 shadow-xs ring-2 ring-teal-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'"
                      >
                        <div class="font-heading text-lg font-extrabold">{{ cant }} Preguntas</div>
                        <div class="text-[10px] font-bold uppercase tracking-wider opacity-80">
                          {{ cant === 5 ? 'Sprint Rápido' : cant === 8 ? 'Estándar OMS' : 'Maratón Extremo' }}
                        </div>
                      </button>
                    }
                  </div>
                </div>

                <!-- Reglas de Puntuación -->
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs space-y-2 text-slate-600">
                  <div class="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>🎯 Reglas Oficiales del Ranking:</span>
                  </div>
                  <p>• <strong class="text-slate-800">Prioridad 1 (Precisión):</strong> Quien logre el mayor porcentaje de aciertos sube a la cima.</p>
                  <p>• <strong class="text-slate-800">Prioridad 2 (Velocidad):</strong> En caso de empate en aciertos, lidera quien responda en el <strong class="text-teal-700">menor tiempo total</strong>.</p>
                </div>
              </div>

              <button
                type="button"
                (click)="iniciarReto()"
                class="w-full btn-primary py-4 px-6 text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🚀 Comenzar Trivia Cronometrada ({{ cantidadPreguntasSeleccionada() }} Preguntas)</span>
              </button>
            </div>

            <!-- Panel Derecho: Récords Actuales (Primer Lugar vs Último Lugar) -->
            <div class="lg:col-span-5 flex flex-col justify-between space-y-4">
              <!-- Tarjeta Primer Lugar -->
              @if (primerLugar()) {
                <div class="bg-gradient-to-br from-[#0F2942] via-[#0B192C] to-[#0D3B3E] rounded-2xl p-5 border border-amber-400/40 shadow-xl transition-all duration-300">
                  <div class="flex items-center justify-between mb-2">
                    <span class="px-3 py-0.5 rounded-md bg-amber-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider">
                      🥇 1.° Lugar • Líder Actual del Grupo
                    </span>
                    <span class="font-mono text-xs text-amber-300 font-bold">
                      ⚡ {{ primerLugar()!.tiempoSegundos }}s
                    </span>
                  </div>
                  <h3 class="font-heading text-lg font-extrabold text-white">
                    {{ primerLugar()!.nombre }}
                  </h3>
                  <p class="text-xs text-slate-300 mb-3">
                    Código: <span class="font-mono text-teal-300">{{ primerLugar()!.codigoEstudiantil }}</span>
                  </p>
                  <div class="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
                    <span class="text-emerald-300 font-semibold">
                      ✓ {{ primerLugar()!.aciertos }}/{{ primerLugar()!.totalPreguntas }} aciertos ({{ primerLugar()!.porcentajeExito }}%)
                    </span>
                    <span class="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-200 font-bold">
                      {{ primerLugar()!.puntajeCompetitivo }} pts
                    </span>
                  </div>
                </div>
              }

              <!-- Tarjeta Último Lugar -->
              @if (ultimoLugar()) {
                <div class="bg-gradient-to-br from-slate-900 via-[#0B192C] to-slate-900 rounded-2xl p-5 border border-rose-500/35 shadow-xl transition-all duration-300">
                  <div class="flex items-center justify-between mb-2">
                    <span class="px-3 py-0.5 rounded-md bg-rose-500/90 text-white font-bold text-[10px] uppercase tracking-wider">
                      🏁 Último Lugar (#{{ ultimoLugar()!.posicion }}) • Marca a Superar
                    </span>
                    <span class="font-mono text-xs text-rose-300 font-bold">
                      ⏱ {{ ultimoLugar()!.tiempoSegundos }}s
                    </span>
                  </div>
                  <h3 class="font-heading text-lg font-extrabold text-white">
                    {{ ultimoLugar()!.nombre }}
                  </h3>
                  <p class="text-xs text-slate-300 mb-3">
                    Código: <span class="font-mono text-slate-300">{{ ultimoLugar()!.codigoEstudiantil }}</span>
                  </p>
                  <div class="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
                    <span class="text-rose-300 font-semibold">
                      {{ ultimoLugar()!.aciertos }}/{{ ultimoLugar()!.totalPreguntas }} aciertos ({{ ultimoLugar()!.porcentajeExito }}%)
                    </span>
                    <span class="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-200 font-bold">
                      {{ ultimoLugar()!.puntajeCompetitivo }} pts
                    </span>
                  </div>
                </div>
              }

              <!-- Resumen rápido de la tabla -->
              <div class="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 text-xs text-slate-300">
                <div class="font-bold text-teal-300 mb-1">💡 Consejo de GuaneñaBot Coach:</div>
                <p class="leading-relaxed">
                  Lee con atención los distractores clínicos sobre esporas bacterianas, concentraciones de alcohol y tiempos exactos OMS antes de marcar.
                </p>
              </div>
            </div>
          </div>
        }

        <!-- ======================================================================= -->
        <!-- FASE 2: JUEGO EN VIVO CON CRONÓMETRO DE ALTA PRECISIÓN                  -->
        <!-- ======================================================================= -->
        @if (estadoJuego() === 'jugando' && preguntaActual()) {
          <div class="bg-white/98 backdrop-blur-xl text-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 mb-8 animate-fade-in">
            <!-- Barra superior del juego: Progreso, Racha y Cronómetro en Vivo -->
            <div class="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <span class="w-10 h-10 rounded-xl bg-[#0B192C] text-teal-300 font-bold text-sm flex items-center justify-center shadow-xs">
                  {{ indicePregunta() + 1 }}/{{ preguntasPartida().length }}
                </span>
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                    {{ preguntaActual()!.categoria }}
                  </span>
                  <span class="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase">
                    Dificultad {{ preguntaActual()!.dificultad }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-3">
                @if (rachaActual() >= 2) {
                  <span class="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold animate-bounce">
                    🔥 Racha x{{ rachaActual() }}
                  </span>
                }

                <!-- Cronómetro Competitivo -->
                <div class="px-4 py-2 rounded-xl bg-[#0B192C] text-white font-mono text-base sm:text-lg font-bold flex items-center gap-2 shadow-md">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>{{ tiempoFormateado() }}s</span>
                </div>
              </div>
            </div>

            <!-- Barra de progreso lineal -->
            <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
              <div
                class="h-full bg-gradient-to-r from-teal-600 to-emerald-500 transition-all duration-300"
                [style.width.%]="((indicePregunta() + 1) / preguntasPartida().length) * 100"
              ></div>
            </div>

            <!-- Enunciado de la pregunta -->
            <h2 class="font-heading text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-6">
              {{ preguntaActual()!.enunciado }}
            </h2>

            <!-- Opciones de respuesta -->
            <div class="space-y-3 mb-6">
              @for (opcion of preguntaActual()!.opciones; track $index; let idx = $index) {
                <button
                  type="button"
                  (click)="seleccionarOpcion(idx)"
                  [disabled]="opcionSeleccionada() !== null"
                  class="w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex items-start gap-3 cursor-pointer"
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

            <!-- Retroalimentación inmediata tras responder -->
            @if (opcionSeleccionada() !== null) {
              <div
                class="p-4 rounded-xl border mb-5 animate-fade-in text-xs sm:text-sm"
                [ngClass]="opcionSeleccionada() === preguntaActual()!.indiceCorrecto
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'"
              >
                <div class="font-bold mb-1">
                  {{ opcionSeleccionada() === preguntaActual()!.indiceCorrecto
                    ? '✅ ¡Respuesta Correcta! Velocidad y criterio clínico impecables.'
                    : '❌ Respuesta Incorrecta. Revisa el fundamento OMS:' }}
                </div>
                <p class="text-xs leading-relaxed opacity-90">
                  {{ preguntaActual()!.explicacionClinica }}
                </p>
              </div>

              <div class="flex justify-end">
                <button
                  type="button"
                  (click)="avanzarPregunta()"
                  class="btn-primary py-3 px-6 text-xs sm:text-sm flex items-center gap-2"
                >
                  <span>
                    {{ indicePregunta() + 1 < preguntasPartida().length ? 'Siguiente Pregunta →' : 'Finalizar y Ver Posición en el Ranking 🏆' }}
                  </span>
                </button>
              </div>
            }
          </div>
        }

        <!-- ======================================================================= -->
        <!-- FASE 3: RESULTADO DEL RETO EXTREMO Y ACTUALIZACIÓN EN TIEMPO REAL       -->
        <!-- ======================================================================= -->
        @if (estadoJuego() === 'finalizado') {
          <div class="bg-white/98 backdrop-blur-xl text-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 mb-8 animate-fade-in">
            <div class="text-center max-w-2xl mx-auto mb-6">
              <span class="inline-block px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs uppercase tracking-wider mb-2">
                ¡Reto Extremo Completado!
              </span>
              <h2 class="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Obtuviste el Puesto #{{ miPosicionAlcanzada() }} del Ranking
              </h2>
              <p class="text-xs sm:text-sm text-slate-600 mt-1">
                Competidor: <strong>{{ nombreCompetidor }}</strong> ({{ codigoCompetidor }})
              </p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span class="text-[10px] font-bold uppercase text-slate-500 block">Aciertos</span>
                <span class="font-heading text-2xl font-extrabold text-teal-700">
                  {{ aciertosTotales() }} / {{ preguntasPartida().length }}
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
              <div class="p-4 rounded-xl bg-[#0B192C] text-white text-center">
                <span class="text-[10px] font-bold uppercase text-teal-300 block">Puntaje Final</span>
                <span class="font-heading text-2xl font-extrabold text-white">
                  {{ puntajeCalculado() }} pts
                </span>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                (click)="iniciarReto()"
                class="btn-primary py-3 px-6 text-xs sm:text-sm"
              >
                🔄 Jugar de Nuevo para Mejorar mi Tiempo
              </button>
              <button
                type="button"
                (click)="estadoJuego.set('lobby')"
                class="btn-secondary py-3 px-5 text-xs sm:text-sm"
              >
                Cambiar Número de Preguntas
              </button>
            </div>
          </div>
        }

        <!-- ======================================================================= -->
        <!-- TABLA DE RANKING COMPETITIVO EN TIEMPO REAL (PRIMERO AL ÚLTIMO LUGAR)   -->
        <!-- ======================================================================= -->
        <div class="bg-white/98 backdrop-blur-xl text-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200/90">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 class="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>🏆 Ranking Competitivo en Tiempo Real</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Ordenado por mayor cantidad de aciertos en el menor tiempo de respuesta (destacando primero y último lugar)
              </p>
            </div>
            <span class="px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold self-start sm:self-auto">
              {{ ranking().length }} Competidores Registrados
            </span>
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th class="py-3.5 px-4">Posición / Estado</th>
                  <th class="py-3.5 px-4">Estudiante</th>
                  <th class="py-3.5 px-4 text-center">Aciertos</th>
                  <th class="py-3.5 px-4 text-center">Tiempo</th>
                  <th class="py-3.5 px-4 text-right">Puntaje</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs">
                @for (item of ranking(); track item.id) {
                  <tr
                    class="transition-colors duration-200"
                    [ngClass]="{
                      'bg-amber-50/70 font-semibold': item.posicion === 1,
                      'bg-rose-50/50': item.posicion === ranking().length && ranking().length > 1,
                      'ring-2 ring-inset ring-teal-500 bg-teal-50/60': item.esUsuarioActual
                    }"
                  >
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-2">
                        @if (item.posicion === 1) {
                          <span class="px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 font-bold text-[10px] uppercase">
                            🥇 1.° LÍDER
                          </span>
                        } @else if (item.posicion === ranking().length) {
                          <span class="px-2.5 py-1 rounded-md bg-rose-500 text-white font-bold text-[10px] uppercase">
                            🏁 #{{ item.posicion }} ÚLTIMO
                          </span>
                        } @else if (item.posicion === 2) {
                          <span class="px-2.5 py-1 rounded-md bg-slate-200 text-slate-800 font-bold text-[10px]">
                            🥈 #2
                          </span>
                        } @else if (item.posicion === 3) {
                          <span class="px-2.5 py-1 rounded-md bg-orange-100 text-orange-800 font-bold text-[10px]">
                            🥉 #3
                          </span>
                        } @else {
                          <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px]">
                            #{{ item.posicion }}
                          </span>
                        }
                      </div>
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-900">{{ item.nombre }}</span>
                        @if (item.esUsuarioActual) {
                          <span class="px-2 py-0.5 rounded-md bg-teal-600 text-white text-[9px] font-bold uppercase">Tú</span>
                        }
                      </div>
                      <span class="font-mono text-[11px] text-slate-400">{{ item.codigoEstudiantil }}</span>
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                        {{ item.aciertos }}/{{ item.totalPreguntas }} ({{ item.porcentajeExito }}%)
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                      ⏱ {{ item.tiempoSegundos.toFixed(1) }}s
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <span class="px-3 py-1 rounded-lg bg-[#0B192C] text-teal-300 font-bold">
                        {{ item.puntajeCompetitivo }} pts
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RetoExtremoComponent implements OnInit, OnDestroy {
  private readonly stateService = inject(StateService);
  private readonly authService = inject(AuthService);
  private readonly practicasService = inject(PracticasService);

  // Banco completo de 10 preguntas clínicas de alta dificultad OMS
  private readonly bancoPreguntasExtremas: PreguntaRetoExtremo[] = [
    {
      id: 1,
      categoria: 'Microbiología Clínica • Esporas',
      dificultad: 'Extrema',
      enunciado:
        'Ante un brote intrahospitalario por Clostridioides difficile, ¿cuál es el mecanismo bioquímico y físico exacto por el cual la OMS exige lavado con agua y jabón en lugar de alcohol glicerinado?',
      opciones: [
        'Las endosporas bacterianas son intrínsecamente resistentes a los alcoholes; se requiere fricción mecánica con agua y jabón para el arrastre físico de las esporas.',
        'El alcohol al 70% estimula la esporulación inmediata de C. difficile sobre la capa córnea.',
        'El jabón neutro destruye la pared de peptidoglicano de la espora en menos de 10 segundos por hidrólisis.',
        'Las soluciones hidroalcohólicas se inactivan únicamente por el pH alcalino del sudor palmar.',
      ],
      indiceCorrecto: 0,
      explicacionClinica:
        'Los alcoholes (etanol/isopropanol) carecen de actividad esporicida. Ante C. difficile es indispensable el arrastre físico-mecánico con agua y jabón.',
    },
    {
      id: 2,
      categoria: 'Farmacología Antiséptica OMS',
      dificultad: 'Alta',
      enunciado:
        'Según las Directrices de la OMS sobre Higiene de las Manos en la Atención Sanitaria, ¿cuál es la concentración óptima (v/v) de alcohol en las preparaciones hidroalcohólicas para desnaturalizar proteínas microbianas eficazmente?',
      opciones: [
        'Entre 60% y 80% v/v (concentraciones superiores al 95% son menos potentes porque la desnaturalización proteica requiere presencia de agua).',
        'Exactamente 99.9% de alcohol absoluto anhidro para deshidratar instantáneamente la cápsula bacteriana.',
        'Entre 30% y 45% v/v para evitar la evaporación prematura durante los 6 pasos.',
        'Cualquier concentración a partir del 25% siempre que contenga peróxido de hidrógeno al 5%.',
      ],
      indiceCorrecto: 0,
      explicacionClinica:
        'El rango bactericida óptimo estipulado por la OMS es del 60% al 80% v/v; sin agua, las proteínas no se desnaturalizan con igual eficiencia.',
    },
    {
      id: 3,
      categoria: 'Biomecánica Anatómica • Paso 5',
      dificultad: 'Alta',
      enunciado:
        'Durante el Paso 5 del protocolo OMS (Limpieza de Pulgares), ¿qué región anatómica crítica queda desprotegida si el estudiante omite el movimiento rotacional envolvente de 360°?',
      opciones: [
        'El primer dedo (pulgar), la eminencia tenar y el primer espacio interdigital, zonas de máximo contacto al manipular jeringas y llaves de tres vías.',
        'Exclusivamente la articulación radiocarpiana dorsal y el túnel carpiano.',
        'Los pliegues interdigitales entre el cuarto y quinto metacarpiano.',
        'El lecho subungueal del dedo meñique e hipotenar.',
      ],
      indiceCorrecto: 0,
      explicacionClinica:
        'El Paso 5 está diseñado específicamente para cubrir la superficie del pulgar y la eminencia tenar, que no entran en contacto durante los pasos 1 al 4.',
    },
    {
      id: 4,
      categoria: 'Reservorios Microbiológicos • Paso 6',
      dificultad: 'Extrema',
      enunciado:
        'Estudios cuantitativos de colonización cutánea citados por la OMS demuestran que una región específica de la mano alberga la mayor densidad de UFC (unidades formadoras de colonias) de flora residente y transitoria. ¿Cuál es?',
      opciones: [
        'La región subungueal (debajo de las uñas) y periungueal, razón por la cual el Paso 6 exige fricción concéntrica de las yemas contra la palma opuesta.',
        'El centro cóncavo de la palma debido a la mayor densidad de glándulas sudoríparas ecrinas.',
        'El dorso de la muñeca proximal.',
        'La cara lateral externa del dedo índice.',
      ],
      indiceCorrecto: 0,
      explicacionClinica:
        'El espacio subungueal concentra la mayor carga bacteriana de toda la mano; por ello las uñas cortas sin esmalte y el Paso 6 son obligatorios.',
    },
    {
      id: 5,
      categoria: '5 Momentos OMS • Secuencia Crítica',
      dificultad: 'Extrema',
      enunciado:
        'Un enfermero saluda al paciente dándole la mano (contacto cutáneo intacto) e inmediatamente después va a destapar una vía venosa central para administrar medicación. ¿Cuántas veces y en qué momentos debe higienizarse las manos?',
      opciones: [
        'Dos veces: antes de saludar al paciente (Momento 1) y nuevamente antes de manipular la vía central (Momento 2: antes de tarea aséptica), pues la piel del paciente puede colonizar los dedos del profesional.',
        'Una sola vez al entrar a la habitación, ya que se trata del mismo paciente y no hubo contacto con sangre.',
        'Solo al finalizar la administración del medicamento (Momento 4).',
        'No requiere nueva higiene si se coloca guantes estériles directamente tras darle la mano.',
      ],
      indiceCorrecto: 0,
      explicacionClinica:
        'Tocar la piel intacta del paciente transfiere flora del propio paciente a las manos del enfermero; antes de acceder a un sitio estéril (Momento 2) es imperativa una nueva fricción antiséptica.',
    },
    {
      id: 6,
      categoria: 'Tiempos Normativos OMS',
      dificultad: 'Alta',
      enunciado:
        '¿Cuál es la relación temporal oficial establecida por la OMS entre la fricción antiséptica con base alcohólica y el lavado clínico con agua y jabón?',
      opciones: [
        'Fricción hidroalcohólica: 20 a 30 segundos | Lavado con agua y jabón: 40 a 60 segundos.',
        'Fricción hidroalcohólica: 10 a 15 segundos | Lavado con agua y jabón: 20 a 30 segundos.',
        'Ambos procedimientos exigen exactamente 60 segundos cronometrados.',
        'Fricción hidroalcohólica: 45 segundos | Lavado con agua y jabón: 90 segundos.',
      ],
      indiceCorrecto: 0,
      explicacionClinica:
        'La fricción hidroalcohólica requiere de 20 a 30 segundos hasta evaporación completa, mientras el lavado con agua y jabón toma de 40 a 60 segundos.',
    },
    {
      id: 7,
      categoria: 'Dermatología Ocupacional y Bioseguridad',
      dificultad: 'Alta',
      enunciado:
        '¿Por qué las directrices de la OMS contraindican el uso de agua caliente durante el lavado de manos y el uso simultáneo de agua y jabón inmediatamente seguido de alcohol en gel?',
      opciones: [
        'Porque el agua caliente y el uso combinado eliminan los lípidos intercelulares del estrato córneo, provocando dermatitis irritativa de contacto que incrementa la colonización bacteriana.',
        'Porque el agua caliente inactiva el cloruro de sodio del agua potable.',
        'Porque el alcohol frío produce vasoconstricción periférica irreversible.',
        'Únicamente por ahorro energético hospitalario.',
      ],
      indiceCorrecto: 0,
      explicacionClinica:
        'La dermatitis irritativa daña la barrera epidérmica y favorece la colonización por Staphylococcus aureus y bacilos Gram negativos.',
    },
    {
      id: 8,
      categoria: 'Uso Racional de Guantes • OMS',
      dificultad: 'Extrema',
      enunciado:
        'Tras retirar unos guantes de examen aparentemente intactos luego de manipular un drenaje quirúrgico, ¿por qué es obligatoria la higiene de manos inmediata (Momento 3)?',
      opciones: [
        'Porque los guantes presentan microperforaciones inaparentes hasta en un 18% de los usos y las manos pueden contaminarse por reflujo o durante la maniobra de retiro.',
        'Solo es obligatoria si el guante era de nitrilo y no de látex.',
        'Únicamente para eliminar el talco lubricante del interior del guante.',
        'No es obligatoria si se empleó la técnica pico-guante correctamente.',
      ],
      indiceCorrecto: 0,
      explicacionClinica:
        'Los guantes nunca reemplazan la higiene de manos; los microporos y el retiro producen contaminación frecuente de la epidermis.',
    },
    {
      id: 9,
      categoria: 'Biomecánica • Paso 4 (Candado)',
      dificultad: 'Alta',
      enunciado:
        'En el Paso 4 de la OMS ("Dorso de los dedos contra la palma opuesta con los dedos trabados"), ¿qué estructuras anatómicas reciben la fricción principal?',
      opciones: [
        'La cara dorsal de las falanges medias y distales y las articulaciones interfalángicas.',
        'La cara palmar de la muñeca y el pliegue tenar.',
        'Exclusivamente la punta del dedo pulgar.',
        'El borde cubital del antebrazo.',
      ],
      indiceCorrecto: 0,
      explicacionClinica:
        'El enganche en candado permite frotar el dorso de las falanges y nudillos contra la palma opuesta.',
    },
    {
      id: 10,
      categoria: 'Entorno del Paciente • Momento 5',
      dificultad: 'Alta',
      enunciado:
        'Un profesional ajusta la velocidad de la bomba de infusión y acomoda la baranda de la cama sin llegar a tocar al paciente, y luego sale de la habitación. ¿A qué momento OMS corresponde higienizarse al salir?',
      opciones: [
        'Momento 5: Después del contacto con el entorno del paciente, ya que las superficies cercanas están colonizadas por la misma microbiota del paciente.',
        'Momento 1: Antes del contacto con el paciente.',
        'Momento 3: Después del riesgo de exposición a fluidos corporales.',
        'No aplica ningún momento OMS porque no hubo contacto directo con la piel del paciente.',
      ],
      indiceCorrecto: 0,
      explicacionClinica:
        'El Momento 5 protege al profesional y al ambiente hospitalario tras tocar objetos inanimados del entorno inmediato del paciente.',
    },
  ];

  nombreCompetidor = '';
  codigoCompetidor = '';

  readonly cantidadPreguntasSeleccionada = signal<number>(8);
  readonly estadoJuego = signal<'lobby' | 'jugando' | 'finalizado'>('lobby');
  readonly preguntasPartida = signal<PreguntaRetoExtremo[]>([]);
  readonly indicePregunta = signal<number>(0);
  readonly opcionSeleccionada = signal<number | null>(null);
  readonly aciertosTotales = signal<number>(0);
  readonly rachaActual = signal<number>(0);
  readonly tiempoTranscurridoSeg = signal<number>(0);
  readonly miPosicionAlcanzada = signal<number>(1);

  readonly ranking = signal<RegistroRetoExtremo[]>([]);

  private cronometroInterval: any = null;
  private inicioTimestamp = 0;

  readonly preguntaActual = computed<PreguntaRetoExtremo | null>(() => {
    const lista = this.preguntasPartida();
    return lista[this.indicePregunta()] || null;
  });

  readonly tiempoFormateado = computed(() => this.tiempoTranscurridoSeg().toFixed(1));

  readonly porcentajeAciertos = computed(() => {
    const total = Math.max(1, this.preguntasPartida().length);
    return Math.round((this.aciertosTotales() / total) * 100);
  });

  readonly puntajeCalculado = computed(() => {
    const total = Math.max(1, this.preguntasPartida().length);
    const aciertos = this.aciertosTotales();
    const tiempo = this.tiempoTranscurridoSeg();
    const bonoVelocidad = Math.max(0, Math.round(300 - tiempo * 3.2));
    return Math.round((aciertos / total) * 700 + (aciertos > 0 ? bonoVelocidad : 0));
  });

  readonly primerLugar = computed<RegistroRetoExtremo | null>(() => {
    const r = this.ranking();
    return r.length > 0 ? r[0] : null;
  });

  readonly ultimoLugar = computed<RegistroRetoExtremo | null>(() => {
    const r = this.ranking();
    return r.length > 0 ? r[r.length - 1] : null;
  });

  ngOnInit(): void {
    const student = this.stateService.student();
    const authUser = this.authService.usuarioActual();
    this.nombreCompetidor = student?.fullName || authUser?.nombre || 'Estudiante Clínico';
    this.codigoCompetidor =
      student?.studentCode || authUser?.codigoEstudiantil || 'ENF-2026-101';
    this.cargarRankingCompetitivo();
  }

  ngOnDestroy(): void {
    this.detenerCronometro();
  }

  cargarRankingCompetitivo(): void {
    this.practicasService.obtenerRankingRetoExtremo(this.codigoCompetidor).subscribe({
      next: (res: RankingRetoExtremoResponse) => {
        if (Array.isArray(res.ranking) && res.ranking.length > 0) {
          this.ranking.set(res.ranking);
        }
      },
      error: () => {
        this.ranking.set(this.obtenerRankingLocalFallback());
      },
    });
  }

  iniciarReto(): void {
    const cant = this.cantidadPreguntasSeleccionada();
    const seleccion = this.bancoPreguntasExtremas.slice(0, cant);
    this.preguntasPartida.set(seleccion);
    this.indicePregunta.set(0);
    this.opcionSeleccionada.set(null);
    this.aciertosTotales.set(0);
    this.rachaActual.set(0);
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
      this.rachaActual.update((r) => r + 1);
    } else {
      this.rachaActual.set(0);
    }
  }

  avanzarPregunta(): void {
    const siguiente = this.indicePregunta() + 1;
    if (siguiente < this.preguntasPartida().length) {
      this.indicePregunta.set(siguiente);
      this.opcionSeleccionada.set(null);
    } else {
      this.finalizarReto();
    }
  }

  private finalizarReto(): void {
    this.detenerCronometro();
    this.estadoJuego.set('finalizado');

    const payload = {
      nombre: this.nombreCompetidor.trim() || 'Estudiante Clínico',
      codigoEstudiantil: this.codigoCompetidor.trim() || 'ENF-2026-101',
      aciertos: this.aciertosTotales(),
      totalPreguntas: this.preguntasPartida().length,
      tiempoSegundos: this.tiempoTranscurridoSeg(),
    };

    this.practicasService.registrarRetoExtremo(payload).subscribe({
      next: (res: RankingRetoExtremoResponse) => {
        if (Array.isArray(res.ranking)) {
          this.ranking.set(res.ranking);
        }
        if (res.resultado?.posicion) {
          this.miPosicionAlcanzada.set(res.resultado.posicion);
        }
      },
      error: () => {
        const actualizado = this.registrarEnRankingLocalFallback(payload);
        this.ranking.set(actualizado);
        const mio = actualizado.find((r) => r.esUsuarioActual);
        if (mio) this.miPosicionAlcanzada.set(mio.posicion);
      },
    });
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
      return 'bg-slate-50 hover:bg-[#E6FBF7]/60 border-slate-200 hover:border-[#00B39F] text-slate-800';
    }
    if (idx === correcta) {
      return 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm';
    }
    if (idx === sel && sel !== correcta) {
      return 'bg-red-50 border-red-400 text-red-900';
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
      return 'bg-red-500 text-white';
    }
    return 'bg-slate-200 text-slate-400';
  }

  private obtenerRankingLocalFallback(): RegistroRetoExtremo[] {
    const base: RegistroRetoExtremo[] = [
      {
        id: 'seed-1',
        posicion: 1,
        nombre: 'Valeria Mendoza (Guardia UCI)',
        codigoEstudiantil: 'ENF-2026-412',
        aciertos: 8,
        totalPreguntas: 8,
        porcentajeExito: 100,
        tiempoSegundos: 38.4,
        puntajeCompetitivo: 985,
        fecha: new Date().toISOString(),
      },
      {
        id: 'seed-2',
        posicion: 2,
        nombre: 'Sebastián Rojas (Quirófano)',
        codigoEstudiantil: 'ENF-2026-809',
        aciertos: 8,
        totalPreguntas: 8,
        porcentajeExito: 100,
        tiempoSegundos: 44.7,
        puntajeCompetitivo: 950,
        fecha: new Date().toISOString(),
      },
      {
        id: 'seed-3',
        posicion: 3,
        nombre: 'Camila Gómez (Urgencias)',
        codigoEstudiantil: 'ENF-2026-274',
        aciertos: 7,
        totalPreguntas: 8,
        porcentajeExito: 88,
        tiempoSegundos: 41.2,
        puntajeCompetitivo: 865,
        fecha: new Date().toISOString(),
      },
      {
        id: 'seed-4',
        posicion: 4,
        nombre: 'Mateo Solarte (Hospitalización)',
        codigoEstudiantil: 'ENF-2026-930',
        aciertos: 5,
        totalPreguntas: 8,
        porcentajeExito: 63,
        tiempoSegundos: 69.5,
        puntajeCompetitivo: 580,
        fecha: new Date().toISOString(),
      },
    ];
    return base;
  }

  private registrarEnRankingLocalFallback(datos: {
    nombre: string;
    codigoEstudiantil: string;
    aciertos: number;
    totalPreguntas: number;
    tiempoSegundos: number;
  }): RegistroRetoExtremo[] {
    const base = this.ranking().filter(
      (r) => r.codigoEstudiantil.toLowerCase() !== datos.codigoEstudiantil.toLowerCase()
    );
    const porcentajeExito = Math.round((datos.aciertos / datos.totalPreguntas) * 100);
    const nuevo: RegistroRetoExtremo = {
      id: `local-${Date.now()}`,
      posicion: 0,
      nombre: datos.nombre,
      codigoEstudiantil: datos.codigoEstudiantil,
      aciertos: datos.aciertos,
      totalPreguntas: datos.totalPreguntas,
      porcentajeExito,
      tiempoSegundos: datos.tiempoSegundos,
      puntajeCompetitivo: this.puntajeCalculado(),
      fecha: new Date().toISOString(),
      esUsuarioActual: true,
    };
    return [...base, nuevo]
      .sort((a, b) =>
        b.porcentajeExito !== a.porcentajeExito
          ? b.porcentajeExito - a.porcentajeExito
          : a.tiempoSegundos - b.tiempoSegundos
      )
      .map((item, idx) => ({ ...item, posicion: idx + 1 }));
  }
}
