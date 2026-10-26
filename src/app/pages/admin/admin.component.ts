import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PracticasService, PracticaEstudianteDocente, DetallePasoBiomecanico } from '../../services/practicas.service';
import { PreguntasService, PreguntaDocente } from '../../services/preguntas.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-[#0B2B29]">
      <!-- ENCABEZADO PRINCIPAL DEL PANEL DOCENTE -->
      <div class="bg-gradient-to-r from-[#0e1626] via-[#112233] to-[#0B2B29] rounded-3xl p-6 sm:p-8 border border-[#50E7FF]/25 shadow-2xl mb-8 text-white relative overflow-hidden">
        <div class="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#50E7FF]/10 blur-3xl pointer-events-none"></div>
        <div class="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-[#00B39F]/10 blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00B39F] to-[#50E7FF] text-[#080B10] flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              <svg class="w-7 h-7 text-[#080B10]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#50E7FF]/15 border border-[#50E7FF]/30 text-[#50E7FF] text-xs font-bold mb-2">
                <span>FACULTAD DE ENFERMERÍA • PANEL DOCENTE</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-[#F5F8FF] tracking-tight">
                Supervisión Clínica y Gestión de Preguntas
              </h1>
              <p class="text-xs sm:text-sm text-[#C5D7E8]">
                Docente: <strong class="text-white">{{ docenteNombre() }}</strong> • Cód: <span class="text-[#50E7FF]">{{ docenteCodigo() }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="recargarDatos()"
              class="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <svg class="w-4 h-4" [class.animate-spin]="cargandoPracticas() || cargandoPreguntas()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Actualizar Datos</span>
            </button>

            <button
              type="button"
              (click)="logout()"
              class="px-4 py-2.5 rounded-2xl bg-[#FF6A4D]/20 hover:bg-[#FF6A4D]/30 border border-[#FF6A4D]/40 text-[#FF9D85] text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        <!-- TARJETAS DE MÉTRICAS GLOBALES -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/15">
          <div class="bg-black/30 rounded-2xl p-3.5 border border-white/10">
            <span class="text-[11px] font-semibold text-[#A5C2DE] block">Total Prácticas</span>
            <span class="text-2xl font-black text-white">{{ practicas().length }}</span>
          </div>
          <div class="bg-black/30 rounded-2xl p-3.5 border border-white/10">
            <span class="text-[11px] font-semibold text-[#CFFBF0] block">Aprobados</span>
            <span class="text-2xl font-black text-[#00B39F]">{{ totalAprobadas() }}</span>
          </div>
          <div class="bg-black/30 rounded-2xl p-3.5 border border-white/10">
            <span class="text-[11px] font-semibold text-[#FFE9DE] block">Requieren Refuerzo</span>
            <span class="text-2xl font-black text-[#FF6A4D]">{{ totalRequiere() }}</span>
          </div>
          <div class="bg-black/30 rounded-2xl p-3.5 border border-white/10">
            <span class="text-[11px] font-semibold text-[#C5D7E8] block">Banco de Preguntas</span>
            <span class="text-2xl font-black text-[#50E7FF]">{{ preguntas().length }}</span>
          </div>
        </div>
      </div>

      <!-- MENSAJES DE ESTADO -->
      @if (mensajeExito()) {
        <div class="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between animate-fade-in">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ mensajeExito() }}</span>
          </div>
          <button (click)="mensajeExito.set(null)" class="text-emerald-700 hover:text-emerald-900 font-bold">&times;</button>
        </div>
      }

      @if (mensajeError()) {
        <div class="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center justify-between animate-fade-in">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ mensajeError() }}</span>
          </div>
          <button (click)="mensajeError.set(null)" class="text-red-700 hover:text-red-900 font-bold">&times;</button>
        </div>
      }

      <!-- PESTAÑAS DE NAVEGACIÓN DOCENTE -->
      <div class="flex items-center gap-2 sm:gap-4 mb-6 border-b border-slate-200 pb-3">
        <button
          type="button"
          (click)="pestanaActiva.set('practicas')"
          class="px-5 py-3 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-2.5 cursor-pointer shadow-xs"
          [ngClass]="pestanaActiva() === 'practicas' ? 'bg-[#00B39F] text-white shadow-md' : 'bg-white/80 text-slate-700 hover:bg-white'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>1. Supervisión de Prácticas de Lavado</span>
          <span class="px-2 py-0.5 rounded-full text-xs font-black" [ngClass]="pestanaActiva() === 'practicas' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'">
            {{ practicas().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="pestanaActiva.set('preguntas')"
          class="px-5 py-3 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-2.5 cursor-pointer shadow-xs"
          [ngClass]="pestanaActiva() === 'preguntas' ? 'bg-[#00B39F] text-white shadow-md' : 'bg-white/80 text-slate-700 hover:bg-white'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>2. Creador de Preguntas Clínicas</span>
          <span class="px-2 py-0.5 rounded-full text-xs font-black" [ngClass]="pestanaActiva() === 'preguntas' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'">
            {{ preguntas().length }}
          </span>
        </button>
      </div>

      <!-- ============================================================== -->
      <!-- PESTAÑA 1: SUPERVISIÓN DE PRÁCTICAS DE LAVADO                  -->
      <!-- ============================================================== -->
      @if (pestanaActiva() === 'practicas') {
        <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-white/80 animate-fade-in">
          <!-- Buscador y Filtros -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <div class="relative grow max-w-md">
              <input
                type="text"
                [value]="busqueda()"
                (input)="alBuscar($event)"
                placeholder="Buscar por estudiante, código o correo..."
                class="w-full px-4 py-3 pl-11 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00B39F] focus:ring-4 focus:ring-[#00B39F]/10 outline-none text-xs sm:text-sm font-medium transition"
              />
              <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              @if (busqueda()) {
                <button
                  type="button"
                  (click)="busqueda.set('')"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold"
                >
                  &times;
                </button>
              }
            </div>

            <div class="text-xs text-slate-500 font-semibold text-right">
              Mostrando <strong class="text-slate-900">{{ practicasFiltradas().length }}</strong> de {{ practicas().length }} prácticas registradas
            </div>
          </div>

          <!-- Tabla de Prácticas -->
          @if (cargandoPracticas()) {
            <div class="py-16 text-center">
              <svg class="animate-spin h-8 w-8 text-[#00B39F] mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <p class="text-sm text-slate-600">Consultando prácticas de estudiantes en la base de datos...</p>
            </div>
          } @else if (practicasFiltradas().length === 0) {
            <div class="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p class="text-sm font-bold text-slate-700 mb-1">No se encontraron prácticas registradas</p>
              <p class="text-xs text-slate-500">
                {{ busqueda() ? 'Intenta con otro término de búsqueda.' : 'Los estudiantes evaluados aparecerán automáticamente aquí.' }}
              </p>
            </div>
          } @else {
            <div class="overflow-x-auto rounded-2xl border border-slate-200">
              <table class="w-full text-left text-xs sm:text-sm">
                <thead class="bg-slate-50/90 text-slate-700 font-extrabold uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th class="py-3.5 px-4">Estudiante</th>
                    <th class="py-3.5 px-4">Código</th>
                    <th class="py-3.5 px-4">Fecha / Hora</th>
                    <th class="py-3.5 px-4 text-center">Calificación</th>
                    <th class="py-3.5 px-4 text-center">Estado</th>
                    <th class="py-3.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (p of practicasFiltradas(); track p.id) {
                    <tr class="hover:bg-slate-50/80 transition-colors">
                      <td class="py-3.5 px-4">
                        <div class="font-extrabold text-slate-900">{{ p.nombre }}</div>
                        <div class="text-[11px] text-slate-500">{{ p.correo }}</div>
                      </td>
                      <td class="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {{ p.codigo }}
                      </td>
                      <td class="py-3.5 px-4 text-slate-600">
                        {{ p.fecha | date:'dd/MM/yyyy HH:mm' }}
                      </td>
                      <td class="py-3.5 px-4 text-center">
                        <span class="inline-block px-3 py-1 rounded-full text-xs font-black shadow-xs"
                              [ngClass]="p.calificacion >= 7.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'">
                          {{ p.calificacion.toFixed(1) }} / 10
                        </span>
                      </td>
                      <td class="py-3.5 px-4 text-center">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                              [ngClass]="p.aprobado ? 'bg-[#CFFBF0] text-[#008072] border border-[#00B39F]/30' : 'bg-[#FFE9DE] text-[#FF6A4D] border border-[#FF6A4D]/30'">
                          <span class="w-1.5 h-1.5 rounded-full" [ngClass]="p.aprobado ? 'bg-[#00B39F]' : 'bg-[#FF6A4D]'"></span>
                          {{ p.estado }}
                        </span>
                      </td>
                      <td class="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          (click)="abrirDetalle(p)"
                          class="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-[#00B39F] text-white text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Detalle Biomecánico</span>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- ============================================================== -->
      <!-- PESTAÑA 2: CREADOR DE PREGUNTAS CLÍNICAS                       -->
      <!-- ============================================================== -->
      @if (pestanaActiva() === 'preguntas') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          <!-- Formulario de Creación (Columna Izquierda) -->
          <div class="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-white/80">
            <div class="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
              <div class="w-10 h-10 rounded-2xl bg-[#00B39F]/15 text-[#00B39F] flex items-center justify-center font-bold">
                +
              </div>
              <div>
                <h3 class="font-heading text-lg font-bold text-slate-900">Nueva Pregunta Clínica</h3>
                <p class="text-xs text-slate-500">Agrega un caso clínico con 4 opciones de respuesta</p>
              </div>
            </div>

            <form [formGroup]="formPregunta" (ngSubmit)="guardarPregunta()" class="space-y-4">
              <!-- Enunciado -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Enunciado del Caso Clínico *
                </label>
                <textarea
                  formControlName="enunciado"
                  rows="3"
                  placeholder="Ej. Durante el aislamiento de un paciente con sospecha de C. difficile, ¿cuál es el procedimiento indicado tras el contacto?"
                  class="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00B39F] focus:ring-4 focus:ring-[#00B39F]/10 outline-none text-xs sm:text-sm font-medium transition resize-none"
                ></textarea>
                @if (formPregunta.controls.enunciado.touched && formPregunta.controls.enunciado.invalid) {
                  <p class="text-[11px] text-red-500 mt-1 font-semibold">El enunciado debe tener al menos 5 caracteres.</p>
                }
              </div>

              <!-- Justificación Pedagógica -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Justificación Clínica Pedagógica
                </label>
                <textarea
                  formControlName="justificacion"
                  rows="2"
                  placeholder="Explicación basada en la evidencia científica OMS para retroalimentar al estudiante..."
                  class="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00B39F] focus:ring-4 focus:ring-[#00B39F]/10 outline-none text-xs sm:text-sm font-medium transition resize-none"
                ></textarea>
              </div>

              <!-- 4 Opciones de Respuesta con Radio Button -->
              <div class="space-y-3 pt-2">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Opciones de Respuesta (Marca la opción correcta con el círculo) *
                </label>

                <!-- Opción 1 -->
                <div class="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 has-[:checked]:border-[#00B39F] has-[:checked]:bg-[#00B39F]/5 transition">
                  <input
                    type="radio"
                    name="correctaIndex"
                    formControlName="correctaIndex"
                    [value]="0"
                    id="radioOpt0"
                    class="w-5 h-5 text-[#00B39F] accent-[#00B39F] cursor-pointer"
                  />
                  <input
                    type="text"
                    formControlName="opcion1"
                    placeholder="Opción A (Texto)"
                    class="grow bg-transparent text-xs sm:text-sm font-medium outline-none text-slate-900"
                  />
                  <span class="text-xs font-extrabold text-slate-400">A</span>
                </div>

                <!-- Opción 2 -->
                <div class="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 has-[:checked]:border-[#00B39F] has-[:checked]:bg-[#00B39F]/5 transition">
                  <input
                    type="radio"
                    name="correctaIndex"
                    formControlName="correctaIndex"
                    [value]="1"
                    id="radioOpt1"
                    class="w-5 h-5 text-[#00B39F] accent-[#00B39F] cursor-pointer"
                  />
                  <input
                    type="text"
                    formControlName="opcion2"
                    placeholder="Opción B (Texto)"
                    class="grow bg-transparent text-xs sm:text-sm font-medium outline-none text-slate-900"
                  />
                  <span class="text-xs font-extrabold text-slate-400">B</span>
                </div>

                <!-- Opción 3 -->
                <div class="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 has-[:checked]:border-[#00B39F] has-[:checked]:bg-[#00B39F]/5 transition">
                  <input
                    type="radio"
                    name="correctaIndex"
                    formControlName="correctaIndex"
                    [value]="2"
                    id="radioOpt2"
                    class="w-5 h-5 text-[#00B39F] accent-[#00B39F] cursor-pointer"
                  />
                  <input
                    type="text"
                    formControlName="opcion3"
                    placeholder="Opción C (Texto)"
                    class="grow bg-transparent text-xs sm:text-sm font-medium outline-none text-slate-900"
                  />
                  <span class="text-xs font-extrabold text-slate-400">C</span>
                </div>

                <!-- Opción 4 -->
                <div class="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 has-[:checked]:border-[#00B39F] has-[:checked]:bg-[#00B39F]/5 transition">
                  <input
                    type="radio"
                    name="correctaIndex"
                    formControlName="correctaIndex"
                    [value]="3"
                    id="radioOpt3"
                    class="w-5 h-5 text-[#00B39F] accent-[#00B39F] cursor-pointer"
                  />
                  <input
                    type="text"
                    formControlName="opcion4"
                    placeholder="Opción D (Texto)"
                    class="grow bg-transparent text-xs sm:text-sm font-medium outline-none text-slate-900"
                  />
                  <span class="text-xs font-extrabold text-slate-400">D</span>
                </div>
              </div>

              <!-- Botón Guardar -->
              <div class="pt-3">
                <button
                  type="submit"
                  [disabled]="formPregunta.invalid || guardandoPregunta()"
                  class="w-full btn-primary py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
                >
                  @if (guardandoPregunta()) {
                    <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Guardando en PostgreSQL...</span>
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span>Guardar Pregunta Clínica</span>
                  }
                </button>
              </div>
            </form>
          </div>

          <!-- Listado de Preguntas Vigentes (Columna Derecha) -->
          <div class="lg:col-span-7 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-heading text-lg font-bold text-slate-900">
                Banco de Preguntas Activas ({{ preguntas().length }})
              </h3>
              <span class="text-xs text-slate-500">Actualizado con base de datos</span>
            </div>

            @if (cargandoPreguntas()) {
              <div class="p-12 text-center bg-white/80 rounded-3xl border border-slate-200">
                <svg class="animate-spin h-8 w-8 text-[#00B39F] mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <p class="text-xs text-slate-500">Cargando preguntas...</p>
              </div>
            } @else if (preguntas().length === 0) {
              <div class="p-8 text-center bg-white/80 rounded-3xl border border-slate-200 text-slate-500 text-xs">
                No hay preguntas creadas. Utiliza el formulario para añadir la primera.
              </div>
            } @else {
              @for (p of preguntas(); track p.id; let pIdx = $index) {
                <div class="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200/90 relative">
                  <!-- Cabecera de Pregunta -->
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="flex items-start gap-3">
                      <span class="w-7 h-7 rounded-xl bg-[#00B39F] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-xs">
                        {{ pIdx + 1 }}
                      </span>
                      <div>
                        <h4 class="text-sm font-extrabold text-slate-900 leading-snug">
                          {{ p.enunciado }}
                        </h4>
                        @if (p.justificacion) {
                          <p class="text-xs text-slate-600 mt-1 italic">
                            💡 Justificación: {{ p.justificacion }}
                          </p>
                        }
                      </div>
                    </div>

                    <button
                      type="button"
                      (click)="eliminarPregunta(p.id)"
                      class="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                      title="Eliminar o desactivar pregunta"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span class="hidden sm:inline">Eliminar</span>
                    </button>
                  </div>

                  <!-- Lista de 4 opciones -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                    @for (opt of p.opciones; track opt.id; let oIdx = $index) {
                      <div
                        class="p-2.5 rounded-xl text-xs flex items-start gap-2 border"
                        [ngClass]="opt.esCorrecta ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'"
                      >
                        <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-extrabold"
                              [ngClass]="opt.esCorrecta ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'">
                          {{ opt.esCorrecta ? '✓' : optionLetters[oIdx] }}
                        </span>
                        <span class="grow leading-relaxed">{{ opt.texto }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }

      <!-- ============================================================== -->
      <!-- MODAL DE DETALLE BIOMECÁNICO PASO A PASO (1 AL 6)               -->
      <!-- ============================================================== -->
      @if (modalDetalleAbierto() && practicaSeleccionada()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/60 flex flex-col">
            <!-- Cabecera del Modal -->
            <div class="p-6 bg-gradient-to-r from-[#0e1626] to-[#0B2B29] text-white flex items-center justify-between">
              <div>
                <span class="text-xs font-bold text-[#50E7FF] uppercase tracking-wider block">
                  Auditoría Biomecánica de Lavado de Manos
                </span>
                <h3 class="text-xl font-extrabold text-white">
                  {{ practicaSeleccionada()?.nombre }}
                </h3>
                <p class="text-xs text-[#A5C2DE]">
                  Cód: {{ practicaSeleccionada()?.codigo }} • {{ practicaSeleccionada()?.fecha | date:'dd/MM/yyyy HH:mm' }}
                </p>
              </div>

              <button
                type="button"
                (click)="cerrarDetalle()"
                class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <!-- Resumen de Calificación -->
            <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs sm:text-sm">
              <div class="flex items-center gap-3">
                <span class="text-slate-500 font-semibold">Calificación Obtenida:</span>
                <span class="text-base font-black px-3 py-1 rounded-full shadow-xs"
                      [ngClass]="(practicaSeleccionada()?.calificacion || 0) >= 7.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'">
                  {{ practicaSeleccionada()?.calificacion?.toFixed(1) }} / 10
                </span>
              </div>

              @if (practicaSeleccionada()?.certificado) {
                <div class="flex items-center gap-1.5 text-xs text-[#008072] font-bold">
                  <svg class="w-4 h-4 text-[#00B39F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                  </svg>
                  <span>Certificado: {{ practicaSeleccionada()?.certificado?.codigoVerificacion }}</span>
                </div>
              }
            </div>

            <!-- Lista de Pasos 1 al 6 -->
            <div class="p-6 overflow-y-auto space-y-3 grow">
              @if (obtenerPasosFormateados().length === 0) {
                <p class="text-xs text-slate-500 text-center py-6">No hay desglose por paso disponible para esta práctica.</p>
              } @else {
                @for (paso of obtenerPasosFormateados(); track paso.stepNumber) {
                  <div class="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <div class="flex items-center justify-between mb-1.5">
                      <div class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded-lg bg-[#00B39F] text-white flex items-center justify-center font-bold text-xs">
                          {{ paso.stepNumber }}
                        </span>
                        <h5 class="text-xs sm:text-sm font-extrabold text-slate-900">
                          {{ paso.stepTitle || ('Paso ' + paso.stepNumber) }}
                        </h5>
                      </div>

                      <span class="text-xs font-bold px-2.5 py-0.5 rounded-full"
                            [ngClass]="{
                              'bg-emerald-100 text-emerald-800': paso.status === 'optimal',
                              'bg-amber-100 text-amber-800': paso.status === 'too-fast',
                              'bg-purple-100 text-purple-800': paso.status === 'too-slow'
                            }">
                        @if (paso.status === 'optimal') { ✓ Ritmo Óptimo }
                        @else if (paso.status === 'too-fast') { ⚠ Demasiado Rápido }
                        @else { ⏱ Prolongado }
                      </span>
                    </div>

                    <div class="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>Tiempo: <strong class="text-slate-900">{{ paso.seconds }}s</strong> (Esperado: 3.0s — 8.0s)</span>
                      <span>Puntaje: <strong class="text-[#008072]">{{ paso.score?.toFixed(2) }} / 1.67</strong></span>
                    </div>

                    @if (paso.feedback) {
                      <p class="text-[11px] text-slate-500 italic mt-1">
                        {{ paso.feedback }}
                      </p>
                    }
                  </div>
                }
              }
            </div>

            <!-- Pie del Modal -->
            <div class="p-4 bg-slate-100 border-t border-slate-200 text-right">
              <button
                type="button"
                (click)="cerrarDetalle()"
                class="px-6 py-2 rounded-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow transition cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly practicasService = inject(PracticasService);
  private readonly preguntasService = inject(PreguntasService);
  private readonly router = inject(Router);

  readonly optionLetters = ['A', 'B', 'C', 'D'];

  readonly pestanaActiva = signal<'practicas' | 'preguntas'>('practicas');
  readonly busqueda = signal<string>('');
  readonly cargandoPracticas = signal<boolean>(false);
  readonly cargandoPreguntas = signal<boolean>(false);
  readonly guardandoPregunta = signal<boolean>(false);

  readonly practicas = signal<PracticaEstudianteDocente[]>([]);
  readonly preguntas = signal<PreguntaDocente[]>([]);
  readonly modalDetalleAbierto = signal<boolean>(false);
  readonly practicaSeleccionada = signal<PracticaEstudianteDocente | null>(null);

  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  readonly docenteNombre = computed(() => this.authService.usuarioActual()?.nombre || 'Docente UCC');
  readonly docenteCodigo = computed(() => this.authService.usuarioActual()?.codigoEstudiantil || 'DOC-UCC');

  readonly practicasFiltradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const list = this.practicas();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(q) ||
        p.codigo?.toLowerCase().includes(q) ||
        p.correo?.toLowerCase().includes(q)
    );
  });

  readonly totalAprobadas = computed(() => this.practicas().filter((p) => p.aprobado).length);
  readonly totalRequiere = computed(() => this.practicas().filter((p) => !p.aprobado).length);

  // Formulario reactivo para creación de preguntas
  readonly formPregunta = new FormGroup({
    enunciado: new FormControl('', [Validators.required, Validators.minLength(5)]),
    justificacion: new FormControl(''),
    opcion1: new FormControl('', [Validators.required]),
    opcion2: new FormControl('', [Validators.required]),
    opcion3: new FormControl('', [Validators.required]),
    opcion4: new FormControl('', [Validators.required]),
    correctaIndex: new FormControl<number>(0, [Validators.required]),
  });

  ngOnInit(): void {
    this.recargarDatos();
  }

  recargarDatos(): void {
    this.cargarPracticas();
    this.cargarPreguntas();
  }

  cargarPracticas(): void {
    this.cargandoPracticas.set(true);
    this.practicasService.obtenerPracticasDocente().subscribe({
      next: (res) => {
        this.practicas.set(res.practicas || []);
        this.cargandoPracticas.set(false);
      },
      error: (err) => {
        this.cargandoPracticas.set(false);
        this.mensajeError.set(err.error?.error || 'Error al cargar supervisión de prácticas');
      },
    });
  }

  cargarPreguntas(): void {
    this.cargandoPreguntas.set(true);
    this.preguntasService.obtenerPreguntasDocente().subscribe({
      next: (res) => {
        this.preguntas.set(res.preguntas || []);
        this.cargandoPreguntas.set(false);
      },
      error: (err) => {
        this.cargandoPreguntas.set(false);
        this.mensajeError.set(err.error?.error || 'Error al cargar el banco de preguntas');
      },
    });
  }

  alBuscar(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.busqueda.set(val);
  }

  abrirDetalle(practica: PracticaEstudianteDocente): void {
    this.practicaSeleccionada.set(practica);
    this.modalDetalleAbierto.set(true);
  }

  cerrarDetalle(): void {
    this.modalDetalleAbierto.set(false);
    this.practicaSeleccionada.set(null);
  }

  obtenerPasosFormateados(): DetallePasoBiomecanico[] {
    const raw = this.practicaSeleccionada()?.detallePasos;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      if (typeof raw === 'string') return JSON.parse(raw);
    } catch {
      return [];
    }
    return [];
  }

  guardarPregunta(): void {
    if (this.formPregunta.invalid) {
      this.formPregunta.markAllAsTouched();
      return;
    }

    const val = this.formPregunta.getRawValue();
    this.guardandoPregunta.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    const correctaIdx = Number(val.correctaIndex || 0);

    const opciones = [
      { texto: val.opcion1?.trim() || '', esCorrecta: correctaIdx === 0 },
      { texto: val.opcion2?.trim() || '', esCorrecta: correctaIdx === 1 },
      { texto: val.opcion3?.trim() || '', esCorrecta: correctaIdx === 2 },
      { texto: val.opcion4?.trim() || '', esCorrecta: correctaIdx === 3 },
    ];

    this.preguntasService
      .crearPregunta({
        enunciado: val.enunciado?.trim() || '',
        justificacion: val.justificacion?.trim() || undefined,
        opciones,
      })
      .subscribe({
        next: () => {
          this.guardandoPregunta.set(false);
          this.mensajeExito.set('¡Pregunta clínica creada exitosamente y publicada en el banco!');
          this.formPregunta.reset({ correctaIndex: 0 });
          this.cargarPreguntas();
        },
        error: (err) => {
          this.guardandoPregunta.set(false);
          this.mensajeError.set(err.error?.error || 'Error al guardar la nueva pregunta clínica.');
        },
      });
  }

  eliminarPregunta(id: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar o desactivar esta pregunta clínica?')) {
      return;
    }

    this.preguntasService.eliminarPregunta(id).subscribe({
      next: (res) => {
        this.mensajeExito.set(res.mensaje || 'Pregunta procesada con éxito.');
        this.cargarPreguntas();
      },
      error: (err) => {
        this.mensajeError.set(err.error?.error || 'Error al eliminar la pregunta clínica.');
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/bienvenida']);
  }
}
