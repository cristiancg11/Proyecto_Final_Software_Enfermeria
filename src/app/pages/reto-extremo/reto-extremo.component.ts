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

            <div class="flex flex-wrap items-center gap-3 shrink-0">
              <a
                routerLink="/dashboard"
                class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-all cursor-pointer"
              >
                ← Volver al Dashboard
              </a>
              @if (estadoJuego() !== 'jugando') {
                <button
                  type="button"
                  (click)="iniciarReto()"
                  class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
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
                • El cronómetro corre en vivo. Al completar las 7 preguntas, tu tiempo y puntaje se registrarán en la tabla de <strong>Supabase</strong> para disputar el Podio.
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
                    {{ indicePregunta() + 1 < 7 ? 'Siguiente Pregunta →' : 'Finalizar y Guardar en Supabase 🏆' }}
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
              ✓ Reto Registrado en Supabase Cloud
            </div>

            <h2 class="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              ¡Partida Finalizada, {{ nombreCompetidor }}!
            </h2>

            <p class="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Tus resultados han sido guardados en Supabase. Mira a continuación tu ubicación en el Podio y la tabla de posiciones.
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

            <div class="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                (click)="iniciarReto()"
                class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                🔄 Jugar de Nuevo para Mejorar Tiempo
              </button>
              <a
                routerLink="/dashboard"
                class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-300 transition-all cursor-pointer"
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
                  Sincronizado con Supabase • Ordenado por mayor puntaje (aciertos + velocidad)
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

  // 7 PREGUNTAS CLÍNICAS DE ALTA DIFICULTAD OMS (CON 4 OPCIONES A, B, C, D)
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

  iniciarReto(): void {
    this.preguntasPartida.set(this.bancoPreguntasExtremas);
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
