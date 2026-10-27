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

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              (click)="abrirModalDocente()"
              class="px-4 py-2.5 rounded-2xl bg-[#00B39F] hover:bg-[#008072] text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>+ Registrar Docente</span>
            </button>

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

      <!-- MENSAJES DE ESTADO (TOASTS) -->
      @if (mensajeExito()) {
        <div class="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between animate-fade-in shadow-xs">
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
        <div class="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center justify-between animate-fade-in shadow-xs">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ mensajeError() }}</span>
          </div>
          <button (click)="mensajeError.set(null)" class="text-red-700 hover:text-red-900 font-bold">&times;</button>
        </div>
      }

      <!-- PESTAÑAS DE NAVEGACIÓN DOCENTE (3 PESTAÑAS) -->
      <div class="flex flex-wrap items-center gap-2 sm:gap-4 mb-6 border-b border-slate-200 pb-3">
        <!-- Pestaña 1 -->
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

        <!-- Pestaña 2 -->
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

        <!-- Pestaña 3: Mi Perfil & Seguridad -->
        <button
          type="button"
          (click)="pestanaActiva.set('perfil')"
          class="px-5 py-3 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-2.5 cursor-pointer shadow-xs"
          [ngClass]="pestanaActiva() === 'perfil' ? 'bg-[#00B39F] text-white shadow-md' : 'bg-white/80 text-slate-700 hover:bg-white'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>3. Mi Perfil & Seguridad</span>
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

            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                (click)="exportarResultadosCSV()"
                class="px-4 py-2.5 rounded-2xl bg-[#008072] hover:bg-[#00B39F] text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                <svg class="w-4 h-4 text-[#50E7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Exportar Resultados (CSV/Excel)</span>
              </button>

              <div class="text-xs text-slate-500 font-semibold text-right">
                Mostrando <strong class="text-slate-900">{{ practicasFiltradas().length }}</strong> de {{ practicas().length }} prácticas registradas
              </div>
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
      <!-- PESTAÑA 3: MI PERFIL & SEGURIDAD                               -->
      <!-- ============================================================== -->
      @if (pestanaActiva() === 'perfil') {
        <div class="space-y-8 animate-fade-in">
          <!-- Tarjeta de Resumen del Docente -->
          <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-white/80 flex flex-col sm:flex-row items-center gap-6">
            <div class="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#00B39F] to-[#008072] text-white flex items-center justify-center text-3xl font-black shadow-lg shrink-0">
              {{ docenteNombre().charAt(0).toUpperCase() }}
            </div>
            <div class="grow text-center sm:text-left">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B39F]/10 border border-[#00B39F]/30 text-[#008072] text-xs font-black mb-2">
                <span>{{ docenteRol() }} INSTITUCIONAL UCC</span>
              </div>
              <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900">
                {{ docenteNombre() }}
              </h3>
              <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {{ docenteCorreo() }} • Código Asignado: <strong class="text-slate-800">{{ docenteCodigo() }}</strong>
              </p>
            </div>
          </div>

          <!-- Grid de Formularios: Datos de Contacto y Cambio de Contraseña -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Formulario 1: Datos Personales y Contacto -->
            <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-white/80">
              <div class="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                <div class="w-10 h-10 rounded-2xl bg-[#00B39F]/15 text-[#00B39F] flex items-center justify-center font-bold">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-heading text-lg font-bold text-slate-900">Datos de Perfil</h4>
                  <p class="text-xs text-slate-500">Actualiza tu nombre y correo institucional</p>
                </div>
              </div>

              <form [formGroup]="formPerfil" (ngSubmit)="guardarPerfil()" class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    formControlName="nombre"
                    placeholder="Ej. Docente de Enfermería UCC"
                    class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00B39F] focus:ring-4 focus:ring-[#00B39F]/10 outline-none text-xs sm:text-sm font-medium transition"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Correo Electrónico Institucional *
                  </label>
                  <input
                    type="email"
                    formControlName="correo"
                    placeholder="docente@ucc.edu.co"
                    class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00B39F] focus:ring-4 focus:ring-[#00B39F]/10 outline-none text-xs sm:text-sm font-medium transition"
                  />
                </div>

                <div class="pt-3">
                  <button
                    type="submit"
                    [disabled]="formPerfil.invalid || actualizandoPerfil()"
                    class="w-full btn-primary py-3.5 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
                  >
                    @if (actualizandoPerfil()) {
                      <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Guardando Cambios...</span>
                    } @else {
                      <span>Guardar Datos de Perfil</span>
                    }
                  </button>
                </div>
              </form>
            </div>

            <!-- Formulario 2: Cambio de Contraseña -->
            <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-white/80">
              <div class="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                <div class="w-10 h-10 rounded-2xl bg-[#FF6A4D]/15 text-[#FF6A4D] flex items-center justify-center font-bold">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-heading text-lg font-bold text-slate-900">Seguridad de la Cuenta</h4>
                  <p class="text-xs text-slate-500">Actualiza tu contraseña periódicamente</p>
                </div>
              </div>

              <form [formGroup]="formPassword" (ngSubmit)="guardarPassword()" class="space-y-4">
                <!-- Contraseña Actual -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Contraseña Actual *
                  </label>
                  <div class="relative">
                    <input
                      [type]="verPasswordActual() ? 'text' : 'password'"
                      formControlName="passwordActual"
                      placeholder="Ingresa tu contraseña actual"
                      class="w-full px-4 py-3 pr-11 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00B39F] focus:ring-4 focus:ring-[#00B39F]/10 outline-none text-xs sm:text-sm font-medium transition"
                    />
                    <button
                      type="button"
                      (click)="verPasswordActual.set(!verPasswordActual())"
                      class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Nueva Contraseña -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Nueva Contraseña (mínimo 6 caracteres) *
                  </label>
                  <div class="relative">
                    <input
                      [type]="verPasswordNuevo() ? 'text' : 'password'"
                      formControlName="passwordNuevo"
                      placeholder="Ingresa la nueva contraseña"
                      class="w-full px-4 py-3 pr-11 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00B39F] focus:ring-4 focus:ring-[#00B39F]/10 outline-none text-xs sm:text-sm font-medium transition"
                    />
                    <button
                      type="button"
                      (click)="verPasswordNuevo.set(!verPasswordNuevo())"
                      class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Confirmar Nueva Contraseña -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Confirmar Nueva Contraseña *
                  </label>
                  <div class="relative">
                    <input
                      [type]="verPasswordConfirmar() ? 'text' : 'password'"
                      formControlName="passwordConfirmar"
                      placeholder="Repite la nueva contraseña"
                      class="w-full px-4 py-3 pr-11 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00B39F] focus:ring-4 focus:ring-[#00B39F]/10 outline-none text-xs sm:text-sm font-medium transition"
                    />
                    <button
                      type="button"
                      (click)="verPasswordConfirmar.set(!verPasswordConfirmar())"
                      class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="pt-3">
                  <button
                    type="submit"
                    [disabled]="formPassword.invalid || actualizandoPassword()"
                    class="w-full btn-primary py-3.5 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
                  >
                    @if (actualizandoPassword()) {
                      <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Actualizando Contraseña...</span>
                    } @else {
                      <span>Actualizar Contraseña</span>
                    }
                  </button>
                </div>
              </form>
            </div>
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

      <!-- ============================================================== -->
      <!-- MODAL PARA REGISTRO DE NUEVO DOCENTE                           -->
      <!-- ============================================================== -->
      @if (modalDocenteAbierto()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-white overflow-hidden text-slate-800">
            <!-- Encabezado del Modal -->
            <div class="bg-gradient-to-r from-[#0B2B29] to-[#008072] p-6 text-white flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#50E7FF]">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white">Añadir Nuevo Docente</h3>
                  <p class="text-xs text-emerald-100">Crear credenciales para personal académico o supervisor</p>
                </div>
              </div>
              <button
                type="button"
                (click)="cerrarModalDocente()"
                class="text-white/80 hover:text-white font-bold text-2xl transition cursor-pointer"
              >
                &times;
              </button>
            </div>

            <!-- Formulario del Modal -->
            <form [formGroup]="formNuevoDocente" (ngSubmit)="guardarNuevoDocente()" class="p-6 space-y-4">
              <!-- Nombre -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nombre Completo <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  formControlName="nombre"
                  placeholder="Ej: Dra. María Fernanda Gómez"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-[#00B39F] focus:ring-4 focus:ring-[#00B39F]/10 outline-none"
                />
                @if (formNuevoDocente.get('nombre')?.touched && formNuevoDocente.get('nombre')?.invalid) {
                  <span class="text-[11px] text-red-500 mt-1 block font-medium">El nombre completo es requerido.</span>
                }
              </div>

              <!-- Correo Institucional -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Correo Institucional <span class="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  formControlName="correo"
                  placeholder="docente.enfermeria@ucc.edu.co"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-[#00B39F] focus:ring-4 focus:ring-[#00B39F]/10 outline-none"
                />
                @if (formNuevoDocente.get('correo')?.touched && formNuevoDocente.get('correo')?.invalid) {
                  <span class="text-[11px] text-red-500 mt-1 block font-medium">Ingrese un correo electrónico válido.</span>
                }
              </div>

              <!-- Contraseña Temporal -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Contraseña Temporal <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    [type]="verPasswordDocente() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Mínimo 6 caracteres"
                    class="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-[#00B39F] focus:ring-4 focus:ring-[#00B39F]/10 outline-none"
                  />
                  <button
                    type="button"
                    (click)="verPasswordDocente.set(!verPasswordDocente())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    @if (verPasswordDocente()) {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    } @else {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    }
                  </button>
                </div>
                @if (formNuevoDocente.get('password')?.touched && formNuevoDocente.get('password')?.invalid) {
                  <span class="text-[11px] text-red-500 mt-1 block font-medium">La contraseña debe tener al menos 6 caracteres.</span>
                }
              </div>

              <!-- Código Docente (Opcional) -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Código Institucional <span class="text-slate-400 font-normal lowercase">(opcional, ej. DOC-2026)</span>
                </label>
                <input
                  type="text"
                  formControlName="codigoEstudiantil"
                  placeholder="Se generará automáticamente si se omite"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-[#00B39F] focus:ring-4 focus:ring-[#00B39F]/10 outline-none font-mono"
                />
              </div>

              <!-- Botones del Modal -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  (click)="cerrarModalDocente()"
                  class="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="registrandoDocente() || formNuevoDocente.invalid"
                  class="px-6 py-2.5 rounded-xl bg-[#00B39F] hover:bg-[#008072] text-white text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  @if (registrandoDocente()) {
                    <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Guardando...</span>
                  } @else {
                    <span>Registrar Docente</span>
                  }
                </button>
              </div>
            </form>
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

  readonly pestanaActiva = signal<'practicas' | 'preguntas' | 'perfil'>('practicas');
  readonly busqueda = signal<string>('');
  readonly cargandoPracticas = signal<boolean>(false);
  readonly cargandoPreguntas = signal<boolean>(false);
  readonly guardandoPregunta = signal<boolean>(false);
  readonly actualizandoPerfil = signal<boolean>(false);
  readonly actualizandoPassword = signal<boolean>(false);

  readonly verPasswordActual = signal<boolean>(false);
  readonly verPasswordNuevo = signal<boolean>(false);
  readonly verPasswordConfirmar = signal<boolean>(false);

  readonly practicas = signal<PracticaEstudianteDocente[]>([]);
  readonly preguntas = signal<PreguntaDocente[]>([]);
  readonly modalDetalleAbierto = signal<boolean>(false);
  readonly practicaSeleccionada = signal<PracticaEstudianteDocente | null>(null);

  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  readonly docenteNombre = computed(() => this.authService.usuarioActual()?.nombre || 'Docente UCC');
  readonly docenteCodigo = computed(() => this.authService.usuarioActual()?.codigoEstudiantil || 'DOC-UCC');
  readonly docenteCorreo = computed(() => this.authService.usuarioActual()?.correo || 'docente@ucc.edu.co');
  readonly docenteRol = computed(() => this.authService.usuarioActual()?.rol || 'DOCENTE');

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

  // Formulario reactivo para actualización de perfil
  readonly formPerfil = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    correo: new FormControl('', [Validators.required, Validators.email]),
  });

  // Formulario reactivo para cambio de contraseña
  readonly formPassword = new FormGroup({
    passwordActual: new FormControl('', [Validators.required, Validators.minLength(1)]),
    passwordNuevo: new FormControl('', [Validators.required, Validators.minLength(6)]),
    passwordConfirmar: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  // Modal y Formulario reactivo para registrar nuevo docente
  readonly modalDocenteAbierto = signal<boolean>(false);
  readonly registrandoDocente = signal<boolean>(false);
  readonly verPasswordDocente = signal<boolean>(false);

  readonly formNuevoDocente = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    codigoEstudiantil: new FormControl(''),
  });

  ngOnInit(): void {
    this.recargarDatos();
    const u = this.authService.usuarioActual();
    if (u) {
      this.formPerfil.patchValue({
        nombre: u.nombre,
        correo: u.correo,
      });
    }
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

  guardarPerfil(): void {
    if (this.formPerfil.invalid) {
      this.formPerfil.markAllAsTouched();
      return;
    }

    const { nombre, correo } = this.formPerfil.getRawValue();
    this.actualizandoPerfil.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    this.authService
      .actualizarPerfil({
        nombre: nombre?.trim() || undefined,
        correo: correo?.trim().toLowerCase() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.actualizandoPerfil.set(false);
          this.mensajeExito.set(res.mensaje || 'Datos de perfil actualizados exitosamente');
        },
        error: (err) => {
          this.actualizandoPerfil.set(false);
          this.mensajeError.set(err.error?.error || 'Error al actualizar datos de perfil.');
        },
      });
  }

  guardarPassword(): void {
    if (this.formPassword.invalid) {
      this.formPassword.markAllAsTouched();
      return;
    }

    const { passwordActual, passwordNuevo, passwordConfirmar } = this.formPassword.getRawValue();

    if (passwordNuevo !== passwordConfirmar) {
      this.mensajeError.set('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    this.actualizandoPassword.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    this.authService
      .actualizarPerfil({
        passwordActual: passwordActual || '',
        passwordNuevo: passwordNuevo || '',
      })
      .subscribe({
        next: (res) => {
          this.actualizandoPassword.set(false);
          this.mensajeExito.set(res.mensaje || 'Contraseña actualizada correctamente');
          this.formPassword.reset();
        },
        error: (err) => {
          this.actualizandoPassword.set(false);
          this.mensajeError.set(err.error?.error || 'Error al cambiar la contraseña.');
        },
      });
  }

  abrirModalDocente(): void {
    this.formNuevoDocente.reset();
    this.verPasswordDocente.set(false);
    this.modalDocenteAbierto.set(true);
  }

  cerrarModalDocente(): void {
    this.modalDocenteAbierto.set(false);
    this.formNuevoDocente.reset();
  }

  guardarNuevoDocente(): void {
    if (this.formNuevoDocente.invalid) {
      this.formNuevoDocente.markAllAsTouched();
      return;
    }

    const { nombre, correo, password, codigoEstudiantil } = this.formNuevoDocente.getRawValue();
    this.registrandoDocente.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    this.authService
      .registrarDocentePorAdmin({
        nombre: nombre || '',
        correo: correo || '',
        password: password || '',
        codigoEstudiantil: codigoEstudiantil?.trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.registrandoDocente.set(false);
          this.mensajeExito.set(
            `¡Docente "${res.usuario?.nombre || nombre}" registrado exitosamente con rol DOCENTE!`
          );
          this.cerrarModalDocente();
        },
        error: (err) => {
          this.registrandoDocente.set(false);
          this.mensajeError.set(err.error?.error || 'Error al registrar el nuevo docente institucional.');
        },
      });
  }

  exportarResultadosCSV(): void {
    const lista = this.practicasFiltradas();
    if (!lista || lista.length === 0) {
      this.mensajeError.set('No hay registros de prácticas para exportar en este momento.');
      return;
    }

    const encabezados = ['Estudiante', 'Código', 'Correo', 'Calificación', 'Estado', 'Fecha'];
    const filas = lista.map((p) => [
      `"${(p.nombre || '').replace(/"/g, '""')}"`,
      `"${(p.codigo || '').replace(/"/g, '""')}"`,
      `"${(p.correo || '').replace(/"/g, '""')}"`,
      (p.calificacion || 0).toFixed(1),
      `"${(p.estado || (p.aprobado ? 'Aprobado' : 'Requiere práctica')).replace(/"/g, '""')}"`,
      `"${new Date(p.fecha).toLocaleString('es-CO')}"`,
    ]);

    const csvContent = '\uFEFF' + [encabezados.join(','), ...filas.map((f) => f.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Resultados_Practicas_Manos_Seguras_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.mensajeExito.set('Archivo CSV generado y descargado exitosamente.');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/bienvenida']);
  }
}
