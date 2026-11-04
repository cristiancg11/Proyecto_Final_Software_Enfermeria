import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth.service';
import { HandwashStateService } from '../../core/services/handwash-state.service';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16 animate-fade-in">
      <!-- Encabezado Institucional de Alta Gama -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
          <svg class="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Plataforma Clínica • Facultad de Enfermería</span>
        </div>
        <h1 class="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
          Manos <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-sky-300">Seguras</span>
        </h1>
        <p class="text-sm sm:text-base md:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
          Sistema inteligente de simulación, entrenamiento clínico y acreditación de higiene de manos bajo el protocolo oficial de la OMS.
        </p>
      </div>

      <!-- SELECTOR DE ACCESO: ESTUDIANTE vs DOCENTE / ADMIN -->
      <div class="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 shadow-xl mb-6">
        <!-- Opción 1: Acceso Estudiante -->
        <button
          type="button"
          (click)="cambiarTipoAcceso('estudiante')"
          class="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer"
          [ngClass]="tipoAcceso() === 'estudiante' ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-900/40' : 'text-slate-300 hover:text-white hover:bg-white/5'"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Acceso Estudiante</span>
        </button>

        <!-- Opción 2: Acceso Docente / Admin -->
        <button
          type="button"
          (click)="cambiarTipoAcceso('docente')"
          class="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer"
          [ngClass]="tipoAcceso() === 'docente' ? 'bg-gradient-to-r from-[#0F2942] to-teal-700 text-white shadow-lg shadow-slate-950/50 border border-teal-400/30' : 'text-slate-300 hover:text-white hover:bg-white/5'"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5" />
          </svg>
          <span>Acceso Docente / Admin</span>
        </button>
      </div>

      <!-- Tarjeta Principal del Formulario -->
      <div class="bg-white/98 backdrop-blur-xl rounded-2xl p-6 sm:p-8 md:p-10 shadow-[0_24px_60px_-15px_rgba(7,17,30,0.55)] border border-slate-200/90 transition-all duration-300">
        <!-- ============================================================== -->
        <!-- CASO 1: FORMULARIO DOCENTE / ADMIN                             -->
        <!-- ============================================================== -->
        @if (tipoAcceso() === 'docente') {
          <div class="border-b border-slate-100 pb-5 mb-6">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200/70 flex items-center justify-center text-teal-700 shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5" />
                </svg>
              </div>
              <div>
                <h2 class="font-heading text-xl md:text-2xl text-slate-900 font-bold tracking-tight">
                  Ingreso de Personal Docente
                </h2>
                <div class="inline-block px-2.5 py-0.5 mt-1 rounded-md bg-teal-50 border border-teal-200/60 text-teal-800 text-[11px] font-semibold">
                  Panel de Gestión Clínica y Supervisión Docente
                </div>
              </div>
            </div>
          </div>

          <!-- Alertas de Error / Éxito -->
          @if (mensajeError()) {
            <div class="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 animate-fade-in text-rose-700">
              <svg class="w-5 h-5 shrink-0 mt-0.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div class="text-xs md:text-sm">
                <span class="font-bold">Atención: </span>{{ mensajeError() }}
              </div>
            </div>
          }

          @if (mensajeExito()) {
            <div class="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 animate-fade-in text-emerald-800">
              <svg class="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div class="text-xs md:text-sm font-semibold">
                {{ mensajeExito() }}
              </div>
            </div>
          }

          <form [formGroup]="docenteForm" (ngSubmit)="onSubmitDocente()" class="space-y-5">
            <!-- Campo Correo Institucional -->
            <div>
              <label for="docenteCorreo" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Correo Institucional <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="docenteCorreo"
                  type="email"
                  formControlName="correo"
                  placeholder="docente@ucc.edu.co"
                  class="w-full px-4 py-3.5 pl-11 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all duration-300 text-slate-900 font-medium placeholder-slate-400"
                />
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Campo Contraseña -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label for="docentePassword" class="block text-xs sm:text-sm font-semibold text-slate-700">
                  Contraseña <span class="text-rose-500">*</span>
                </label>
              </div>
              <div class="relative">
                <input
                  id="docentePassword"
                  [type]="verPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Ingresa tu contraseña de docente"
                  class="w-full px-4 py-3.5 pl-11 pr-11 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all duration-300 text-slate-900 font-medium placeholder-slate-400"
                />
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  (click)="verPassword.set(!verPassword())"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  <svg *ngIf="!verPassword()" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg *ngIf="verPassword()" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Botón Acceder al Panel Docente -->
            <div class="pt-2">
              <button
                type="submit"
                [disabled]="docenteForm.invalid || cargando()"
                class="w-full btn-primary py-4 text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer transition-all duration-300"
              >
                @if (cargando()) {
                  <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Verificando Credenciales de Docente...</span>
                } @else {
                  <span>Acceder al Panel Docente</span>
                  <svg class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                }
              </button>
            </div>
          </form>
        }

        <!-- ============================================================== -->
        <!-- CASO 2: FLUJO DE ESTUDIANTE (REGISTRO O INGRESO)              -->
        <!-- ============================================================== -->
        @if (tipoAcceso() === 'estudiante') {
          <!-- Selector de Modo: Registro vs Ingreso -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200/70 flex items-center justify-center text-teal-700 shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 class="font-heading text-xl md:text-2xl text-slate-900 font-bold tracking-tight">
                  {{ modo() === 'registro' ? 'Identificación del Estudiante' : 'Iniciar Sesión Clínica' }}
                </h2>
                <p class="text-xs md:text-sm text-slate-500">
                  {{ modo() === 'registro' ? 'Registra tus datos institucionales para tu práctica clínica' : 'Accede con tus credenciales registradas' }}
                </p>
              </div>
            </div>

            <!-- Selector de Modo -->
            <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
              <button
                type="button"
                (click)="cambiarModo('registro')"
                class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer"
                [ngClass]="modo() === 'registro' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'"
              >
                Registro
              </button>
              <button
                type="button"
                (click)="cambiarModo('login')"
                class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer"
                [ngClass]="modo() === 'login' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'"
              >
                Ingresar
              </button>
            </div>
          </div>

          <!-- Alertas de Error / Éxito -->
          @if (mensajeError()) {
            <div class="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 animate-fade-in text-rose-700">
              <svg class="w-5 h-5 shrink-0 mt-0.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div class="text-xs md:text-sm">
                <span class="font-bold">Atención: </span>{{ mensajeError() }}
              </div>
            </div>
          }

          @if (mensajeExito()) {
            <div class="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 animate-fade-in text-emerald-800">
              <svg class="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div class="text-xs md:text-sm font-semibold">
                {{ mensajeExito() }}
              </div>
            </div>
          }

          <!-- SUB-FORMULARIO 1: REGISTRO DE ESTUDIANTE -->
          @if (modo() === 'registro') {
            <form [formGroup]="studentForm" (ngSubmit)="onSubmitRegistro()" class="space-y-5">
              <!-- Campo Nombre Completo -->
              <div>
                <label for="fullName" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  Nombre Completo <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="fullName"
                    type="text"
                    formControlName="fullName"
                    placeholder="Ej. Laura Marcela Ramírez Gómez"
                    class="w-full px-4 py-3.5 pl-11 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all duration-300 text-slate-900 font-medium placeholder-slate-400"
                    [class.border-rose-400]="fullNameInvalid"
                  />
                  <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                @if (fullNameInvalid) {
                  <p class="mt-1.5 text-xs text-rose-500 font-medium">Por favor ingresa tu nombre completo (mínimo 3 caracteres).</p>
                }
              </div>

              <!-- Campo Código Estudiantil -->
              <div>
                <label for="studentCode" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  Código Estudiantil o Documento <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="studentCode"
                    type="text"
                    formControlName="studentCode"
                    placeholder="Ej. ENF-2026-101 o Documento de Identidad"
                    (input)="alCambiarCodigo()"
                    class="w-full px-4 py-3.5 pl-11 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all duration-300 text-slate-900 font-medium placeholder-slate-400"
                    [class.border-rose-400]="studentCodeInvalid"
                  />
                  <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                </div>
                @if (studentCodeInvalid) {
                  <p class="mt-1.5 text-xs text-rose-500 font-medium">Ingresa un código estudiantil o documento válido (mínimo 4 caracteres).</p>
                }
              </div>

              <!-- Campo Correo Electrónico Institucional -->
              <div>
                <label for="correo" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  Correo Electrónico Institucional <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="correo"
                    type="email"
                    formControlName="correo"
                    placeholder="estudiante@campusucc.edu.co"
                    class="w-full px-4 py-3.5 pl-11 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all duration-300 text-slate-900 font-medium placeholder-slate-400"
                    [class.border-rose-400]="correoInvalid"
                  />
                  <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                @if (correoInvalid) {
                  <p class="mt-1.5 text-xs text-rose-500 font-medium">Ingresa un correo electrónico válido.</p>
                }
              </div>

              <!-- Campo Contraseña -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label for="password" class="block text-xs sm:text-sm font-semibold text-slate-700">
                    Contraseña de Acceso <span class="text-rose-500">*</span>
                  </label>
                  <span class="text-[11px] text-slate-400 font-medium">Mínimo 6 caracteres</span>
                </div>
                <div class="relative">
                  <input
                    id="password"
                    [type]="verPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Ej. Estudiante2026*"
                    class="w-full px-4 py-3.5 pl-11 pr-11 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all duration-300 text-slate-900 font-medium placeholder-slate-400"
                    [class.border-rose-400]="passwordInvalid"
                  />
                  <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    (click)="verPassword.set(!verPassword())"
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    <svg *ngIf="!verPassword()" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg *ngIf="verPassword()" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  </button>
                </div>
                @if (passwordInvalid) {
                  <p class="mt-1.5 text-xs text-rose-500 font-medium">La contraseña debe tener al menos 6 caracteres.</p>
                }
              </div>

              <!-- Consentimiento Informado -->
              <div class="rounded-xl border border-teal-200/80 bg-teal-50/60 p-4 md:p-5 transition-all duration-300">
                <label class="flex items-start gap-3.5 cursor-pointer">
                  <input
                    type="checkbox"
                    formControlName="consent"
                    id="consentCheck"
                    class="mt-1 w-5 h-5 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer transition accent-teal-600"
                  />
                  <div class="text-xs md:text-sm text-slate-700 leading-relaxed">
                    <span class="font-bold text-teal-800">Consentimiento Informado: </span>
                    Acepto participar voluntariamente en esta sesión pedagógica y de evaluación de bioseguridad. Comprendo que mis respuestas y tiempos de práctica se registrarán en la base de datos con fines de retroalimentación formativa y académica.
                  </div>
                </label>
                @if (consentInvalid) {
                  <p class="mt-2 text-xs text-rose-500 font-medium pl-8">Debes aceptar el consentimiento informado para continuar.</p>
                }
              </div>

              <!-- Botón de Registro -->
              <div class="pt-2">
                <button
                  type="submit"
                  [disabled]="studentForm.invalid || cargando()"
                  class="w-full btn-primary py-4 text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer transition-all duration-300"
                >
                  @if (cargando()) {
                    <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Registrando en Base de Datos...</span>
                  } @else {
                    <span>Registrar y Comenzar Entrenamiento</span>
                    <svg class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  }
                </button>
              </div>
            </form>
          }

          <!-- SUB-FORMULARIO 2: INICIO DE SESIÓN DE ESTUDIANTE -->
          @if (modo() === 'login') {
            <form [formGroup]="loginForm" (ngSubmit)="onSubmitLogin()" class="space-y-5">
              <!-- Campo Identificador -->
              <div>
                <label for="identificador" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  Código Estudiantil o Correo <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="identificador"
                    type="text"
                    formControlName="identificador"
                    placeholder="Ej. ENF-2026-101 o estudiante@campusucc.edu.co"
                    class="w-full px-4 py-3.5 pl-11 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all duration-300 text-slate-900 font-medium placeholder-slate-400"
                  />
                  <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Campo Contraseña -->
              <div>
                <label for="loginPassword" class="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  Contraseña <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="loginPassword"
                    [type]="verPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Ingresa tu contraseña"
                    class="w-full px-4 py-3.5 pl-11 pr-11 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all duration-300 text-slate-900 font-medium placeholder-slate-400"
                  />
                  <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    (click)="verPassword.set(!verPassword())"
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    <svg *ngIf="!verPassword()" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg *ngIf="verPassword()" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Botón de Login -->
              <div class="pt-2">
                <button
                  type="submit"
                  [disabled]="loginForm.invalid || cargando()"
                  class="w-full btn-primary py-4 text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer transition-all duration-300"
                >
                  @if (cargando()) {
                    <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Verificando Credenciales...</span>
                  } @else {
                    <span>Iniciar Sesión y Continuar</span>
                    <svg class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  }
                </button>
              </div>
            </form>
          }
        }
      </div>

      <!-- Indicadores Institucionales de Confianza -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div class="bg-slate-900/75 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 shadow-lg flex items-center gap-3.5 transition-all duration-300 hover:border-teal-500/40">
          <div class="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-teal-300 shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xs font-bold text-white">Sincronización en Tiempo Real</h3>
            <p class="text-[11px] text-slate-400">PostgreSQL & Supabase Cloud</p>
          </div>
        </div>

        <div class="bg-slate-900/75 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 shadow-lg flex items-center gap-3.5 transition-all duration-300 hover:border-teal-500/40">
          <div class="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-300 shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xs font-bold text-white">Estándar Clínico OMS</h3>
            <p class="text-[11px] text-slate-400">Supervisión y analítica docente</p>
          </div>
        </div>

        <div class="bg-slate-900/75 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 shadow-lg flex items-center gap-3.5 transition-all duration-300 hover:border-teal-500/40">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-300 shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xs font-bold text-white">Visión Artificial IA</h3>
            <p class="text-[11px] text-slate-400">Protocolo asistido de 6 pasos</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BienvenidaComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly stateService = inject(HandwashStateService);

  readonly tipoAcceso = signal<'estudiante' | 'docente'>('estudiante');
  readonly modo = signal<'registro' | 'login'>('registro');
  readonly cargando = signal<boolean>(false);
  readonly mensajeError = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);
  readonly verPassword = signal<boolean>(false);

  // Formulario exclusivo de Docente / Admin
  readonly docenteForm = new FormGroup({
    correo: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
  });

  // Formulario de Registro de Estudiante
  readonly studentForm = new FormGroup({
    fullName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    studentCode: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
    ]),
    correo: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('Estudiante2026*', [
      Validators.required,
      Validators.minLength(6),
    ]),
    consent: new FormControl(true, [Validators.requiredTrue]),
  });

  // Formulario de Login de Estudiante
  readonly loginForm = new FormGroup({
    identificador: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
  });

  get fullNameInvalid(): boolean {
    const ctrl = this.studentForm.controls.fullName;
    return ctrl.touched && ctrl.invalid;
  }

  get studentCodeInvalid(): boolean {
    const ctrl = this.studentForm.controls.studentCode;
    return ctrl.touched && ctrl.invalid;
  }

  get correoInvalid(): boolean {
    const ctrl = this.studentForm.controls.correo;
    return ctrl.touched && ctrl.invalid;
  }

  get passwordInvalid(): boolean {
    const ctrl = this.studentForm.controls.password;
    return ctrl.touched && ctrl.invalid;
  }

  get consentInvalid(): boolean {
    const ctrl = this.studentForm.controls.consent;
    return ctrl.touched && ctrl.invalid;
  }

  cambiarTipoAcceso(tipo: 'estudiante' | 'docente'): void {
    this.tipoAcceso.set(tipo);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
  }

  cambiarModo(nuevoModo: 'registro' | 'login'): void {
    this.modo.set(nuevoModo);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
  }

  alCambiarCodigo(): void {
    const codigo = this.studentForm.controls.studentCode.value?.trim() || '';
    const correoCtrl = this.studentForm.controls.correo;
    if (!correoCtrl.dirty && codigo.length >= 3) {
      correoCtrl.setValue(`${codigo.toLowerCase().replace(/[^a-z0-9]/g, '')}@campusucc.edu.co`);
    }
  }

  onSubmitDocente(): void {
    if (this.docenteForm.invalid) {
      this.docenteForm.markAllAsTouched();
      return;
    }

    const { correo, password } = this.docenteForm.getRawValue();
    this.cargando.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    this.authService
      .login({
        identificador: correo?.trim() || '',
        password: password || '',
      })
      .subscribe({
        next: (res) => {
          this.cargando.set(false);
          const user = res.user || res.usuario;

          if (user.rol === 'DOCENTE') {
            this.mensajeExito.set('¡Bienvenido, docente! Ingresando al panel de supervisión...');
            this.stateService.setStudent({
              fullName: user.nombre,
              studentCode: user.codigoEstudiantil,
              consent: true,
            });
            setTimeout(() => {
              this.router.navigate(['/admin']);
            }, 350);
          } else {
            this.mensajeError.set(
              'Esta cuenta no cuenta con rol de Docente/Administrador. Por favor ingresa por la opción de "Acceso Estudiante".'
            );
          }
        },
        error: (err) => {
          this.cargando.set(false);
          this.mensajeError.set(
            err.error?.error || 'Credenciales de docente no válidas. Revisa tu correo y contraseña.'
          );
        },
      });
  }

  onSubmitRegistro(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const val = this.studentForm.getRawValue();
    this.cargando.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    const datosRegistro = {
      nombre: val.fullName?.trim() || '',
      codigoEstudiantil: val.studentCode?.trim() || '',
      correo: val.correo?.trim().toLowerCase() || '',
      password: val.password || 'Estudiante2026*',
      consentimiento: !!val.consent,
    };

    this.authService.registro(datosRegistro).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.mensajeExito.set('¡Registro completado con éxito! Conectando...');
        this.redirigirSegunRol(res);
      },
      error: (err) => {
        if (err.status === 409) {
          this.intentarLoginFallback(datosRegistro.codigoEstudiantil, datosRegistro.password, datosRegistro.nombre);
          return;
        }

        this.cargando.set(false);
        const errDetalles = err.error?.detalles
          ? err.error.detalles.map((d: any) => d.mensaje).join(', ')
          : null;
        this.mensajeError.set(errDetalles || err.error?.error || 'Error al conectar con el servidor.');
      },
    });
  }

  onSubmitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { identificador, password } = this.loginForm.getRawValue();
    this.cargando.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    this.authService
      .login({
        identificador: identificador?.trim() || '',
        password: password || '',
      })
      .subscribe({
        next: (res) => {
          this.cargando.set(false);
          this.mensajeExito.set('¡Bienvenido de nuevo! Ingresando al sistema...');
          this.redirigirSegunRol(res);
        },
        error: (err) => {
          this.cargando.set(false);
          this.mensajeError.set(
            err.error?.error || 'Credenciales no válidas. Revisa tu código/correo y contraseña.'
          );
        },
      });
  }

  private intentarLoginFallback(codigo: string, password: string, nombreRespaldo: string): void {
    this.authService
      .login({
        identificador: codigo,
        password: password,
      })
      .subscribe({
        next: (res) => {
          this.cargando.set(false);
          this.mensajeExito.set('¡Usuario ya registrado encontrado! Sesión iniciada.');
          this.redirigirSegunRol(res);
        },
        error: () => {
          this.cargando.set(false);
          this.mensajeError.set(
            'El código o correo ya se encuentra registrado. Ingresa tu contraseña en la pestaña "Ingresar".'
          );
          this.loginForm.patchValue({ identificador: codigo });
          this.cambiarModo('login');
        },
      });
  }

  private redirigirSegunRol(res: AuthResponse): void {
    const user = res.usuario || res.user;
    const consentimiento = user?.consentimiento !== undefined ? !!user.consentimiento : true;
    this.stateService.setStudent({
      fullName: user.nombre,
      studentCode: user.codigoEstudiantil || '',
      consent: consentimiento,
    });

    setTimeout(() => {
      if (user.rol === 'DOCENTE') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/introduccion']);
      }
    }, 250);
  }
}
