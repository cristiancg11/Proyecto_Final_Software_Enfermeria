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
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative isolate w-full min-h-screen flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-gradient-to-br from-[#06182E] via-[#0B3A6B] to-[#0A4F6E]">
      <!-- Botón Flotante de Modo Oscuro / Claro en Bienvenida -->
      <div class="absolute top-4 right-4 z-20">
        <button
          type="button"
          (click)="themeService.toggleTheme()"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
          [title]="themeService.isDark() ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'"
        >
          <span>{{ themeService.isDark() ? '☀️' : '🌙' }}</span>
          <span class="text-[11px] font-medium hidden sm:inline">{{ themeService.isDark() ? 'Modo Claro' : 'Modo Oscuro' }}</span>
        </button>
      </div>

      <!-- Decoración de fondo -->
      <div class="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-400/20 blur-3xl"></div>
      <div class="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:26px_26px]"></div>

      <div class="relative w-full max-w-lg lg:max-w-xl mx-auto py-6 sm:py-8 animate-fade-in">
        <!-- Encabezado -->
        <div class="mb-6 sm:mb-8 text-center">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-200 backdrop-blur">
            <span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75"></span><span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-300"></span></span>
            <span>Plataforma Clínica • Facultad de Enfermería</span>
          </div>
          <div class="mx-auto mb-3.5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-300 to-sky-400 shadow-[0_16px_40px_-8px_rgba(52,211,153,0.6)]">
            <svg class="h-7 w-7 sm:h-8 sm:w-8 text-[#06182E]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <h1 class="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Manos <span class="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">Seguras</span>
          </h1>
          <p class="mx-auto mt-2 max-w-sm sm:max-w-md text-xs sm:text-sm leading-relaxed text-slate-300">
            Simulación, entrenamiento clínico y acreditación de la higiene de manos bajo el protocolo oficial de la OMS.
          </p>
        </div>

        <!-- Selector de acceso -->
        <div class="mb-4 sm:mb-5 grid grid-cols-2 gap-1 rounded-2xl border border-white/15 bg-white/10 p-1 shadow-xl backdrop-blur-xl">
          <button type="button" (click)="cambiarTipoAcceso('estudiante')"
            class="flex cursor-pointer items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2.5 py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm"
            [ngClass]="tipoAcceso() === 'estudiante' ? 'bg-white text-[#0B3A6B] shadow-md' : 'text-slate-200 hover:bg-white/10 hover:text-white'">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span>Estudiante</span>
          </button>
          <button type="button" (click)="cambiarTipoAcceso('docente')"
            class="flex cursor-pointer items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2.5 py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm"
            [ngClass]="tipoAcceso() === 'docente' ? 'bg-white text-[#0B3A6B] shadow-md' : 'text-slate-200 hover:bg-white/10 hover:text-white'">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5"/></svg>
            <span>Docente / Admin</span>
          </button>
        </div>

        <!-- Tarjeta principal -->
        <div class="rounded-3xl border border-white/60 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 sm:p-7 md:p-8 shadow-[0_20px_60px_-15px_rgba(2,12,27,0.6)]">
          @if (tipoAcceso() === 'docente') {
            <div class="mb-7 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0B3A6B] to-sky-600 text-white shadow-lg shadow-sky-900/20">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5"/></svg>
              </div>
              <div>
                <h2 class="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl">Ingreso de Personal Docente</h2>
                <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400 md:text-sm">Panel de gestión clínica y supervisión docente</p>
              </div>
            </div>

            @if (mensajeError()) {
              <div class="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 animate-fade-in"><svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg><div><span class="font-bold">Atención: </span>{{ mensajeError() }}</div></div>
            }
            @if (mensajeExito()) {
              <div class="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-fade-in"><svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><div>{{ mensajeExito() }}</div></div>
            }

            <form [formGroup]="docenteForm" (ngSubmit)="onSubmitDocente()" class="space-y-5">
              <div>
                <label for="docenteIdentificador" class="mb-2 block text-[13px] font-semibold tracking-wide text-slate-700 dark:text-slate-200">
                  Código, correo o nombre institucional <span class="text-rose-500">*</span>
                </label>
                <input id="docenteIdentificador" type="text" formControlName="identificador" placeholder="Ej. DOC-2026, docente@ucc.edu.co o tu nombre" class="peer w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3.5 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/15" />
              </div>
              <div>
                <label for="docentePassword" class="mb-2 block text-[13px] font-semibold tracking-wide text-slate-700 dark:text-slate-200">Contraseña <span class="text-rose-500">*</span></label>
                <div class="relative">
                  <input id="docentePassword" [type]="verPassword() ? 'text' : 'password'" formControlName="password" placeholder="Ingresa tu contraseña de docente" class="peer w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3.5 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/15 pr-12" />
                  <button type="button" (click)="verPassword.set(!verPassword())" class="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition" [attr.aria-label]="verPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </button>
                </div>
              </div>
              <div class="pt-2">
              <button type="submit" [disabled]="docenteForm.invalid || cargando()" class="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B3A6B] via-[#0E6BA8] to-emerald-500 px-6 py-4 text-base font-bold text-white shadow-[0_14px_30px_-10px_rgba(14,107,168,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-10px_rgba(16,185,129,0.6)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
                <span class="relative z-10 flex items-center justify-center gap-2.5">
                  @if (cargando()) {<svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25"/><path fill="currentColor" class="opacity-90" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"/></svg>}
                  <span>{{ cargando() ? 'Verificando credenciales de docente...' : 'Acceder al panel docente' }}</span>
                </span>
                <span class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"></span>
              </button>
              </div>
            </form>
          }

          @if (tipoAcceso() === 'estudiante') {
            <div class="mb-7 flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl">
                  {{ modo() === 'registro' ? 'Identificación del estudiante' : 'Iniciar sesión clínica' }}
                </h2>
                <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                  {{ modo() === 'registro' ? 'Registra tus datos institucionales para tu práctica clínica' : 'Accede con tus credenciales registradas' }}
                </p>
              </div>
              <div class="flex shrink-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1">
                <button type="button" (click)="cambiarModo('registro')"
                  class="cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300"
                  [ngClass]="modo() === 'registro' ? 'bg-gradient-to-r from-[#0B3A6B] to-sky-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'">Registro</button>
                <button type="button" (click)="cambiarModo('login')"
                  class="cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300"
                  [ngClass]="modo() === 'login' ? 'bg-gradient-to-r from-[#0B3A6B] to-sky-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'">Ingresar</button>
              </div>
            </div>

            @if (mensajeError()) {
              <div class="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 animate-fade-in"><svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg><div><span class="font-bold">Atención: </span>{{ mensajeError() }}</div></div>
            }
            @if (mensajeExito()) {
              <div class="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-fade-in"><svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><div>{{ mensajeExito() }}</div></div>
            }

            @if (modo() === 'registro') {
              <form [formGroup]="studentForm" (ngSubmit)="onSubmitRegistro()" class="space-y-5">
              <div>
                <label for="fullName" class="mb-2 block text-[13px] font-semibold tracking-wide text-slate-700 dark:text-slate-200">Nombre completo <span class="text-rose-500">*</span></label>
                <input id="fullName" type="text" formControlName="fullName" placeholder="Ej. Laura Marcela Ramírez Gómez" class="peer w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3.5 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/15" />
              </div>
              <div>
                <label for="studentCode" class="mb-2 block text-[13px] font-semibold tracking-wide text-slate-700 dark:text-slate-200">Código estudiantil o documento <span class="text-rose-500">*</span></label>
                <input id="studentCode" type="text" formControlName="studentCode" (input)="alCambiarCodigo()" placeholder="Ej. ENF-2026-101 o documento de identidad" class="peer w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3.5 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/15" />
              </div>
              <div>
                <label for="correo" class="mb-2 block text-[13px] font-semibold tracking-wide text-slate-700 dark:text-slate-200">Correo electrónico institucional <span class="text-rose-500">*</span></label>
                <input id="correo" type="email" formControlName="correo" placeholder="estudiante@campusucc.edu.co" class="peer w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3.5 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/15" />
              </div>
              <div>
                <label for="password" class="mb-2 block text-[13px] font-semibold tracking-wide text-slate-700 dark:text-slate-200">Contraseña de acceso <span class="text-rose-500">*</span></label>
                <div class="relative">
                  <input id="password" [type]="verPassword() ? 'text' : 'password'" formControlName="password" placeholder="Ej. Estudiante2026*" class="peer w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3.5 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/15 pr-12" />
                  <button type="button" (click)="verPassword.set(!verPassword())" class="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition" [attr.aria-label]="verPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </button>
                </div>
              </div>

                <div class="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950/40 dark:to-sky-950/30 p-4 md:p-5">
                  <label class="flex cursor-pointer items-start gap-3.5">
                    <input type="checkbox" formControlName="consent" id="consentCheck" class="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded accent-emerald-600" />
                    <div class="text-xs leading-relaxed text-slate-700 dark:text-slate-300 md:text-sm">
                      <span class="font-bold text-[#0B3A6B] dark:text-emerald-400">Consentimiento informado: </span>
                      Acepto participar voluntariamente en esta sesión pedagógica y de evaluación de bioseguridad.
                    </div>
                  </label>
                </div>

              <button type="submit" [disabled]="studentForm.invalid || cargando()" class="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B3A6B] via-[#0E6BA8] to-emerald-500 px-6 py-4 text-base font-bold text-white shadow-[0_14px_30px_-10px_rgba(14,107,168,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-10px_rgba(16,185,129,0.6)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
                <span class="relative z-10 flex items-center justify-center gap-2.5">
                  @if (cargando()) {<svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25"/><path fill="currentColor" class="opacity-90" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"/></svg>}
                  <span>{{ cargando() ? 'Registrando en base de datos...' : 'Registrar y comenzar entrenamiento' }}</span>
                </span>
                <span class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"></span>
              </button>
              </form>
            }

            @if (modo() === 'login') {
              <form [formGroup]="loginForm" (ngSubmit)="onSubmitLogin()" class="space-y-5">
              <div>
                <label for="identificador" class="mb-2 block text-[13px] font-semibold tracking-wide text-slate-700 dark:text-slate-200">Código estudiantil o correo <span class="text-rose-500">*</span></label>
                <input id="identificador" type="text" formControlName="identificador" placeholder="Ej. ENF-2026-101 o estudiante@campusucc.edu.co" class="peer w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3.5 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/15" />
              </div>
              <div>
                <label for="loginPassword" class="mb-2 block text-[13px] font-semibold tracking-wide text-slate-700 dark:text-slate-200">Contraseña <span class="text-rose-500">*</span></label>
                <div class="relative">
                  <input id="loginPassword" [type]="verPassword() ? 'text' : 'password'" formControlName="password" placeholder="Ingresa tu contraseña" class="peer w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3.5 text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/15 pr-12" />
                  <button type="button" (click)="verPassword.set(!verPassword())" class="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition" [attr.aria-label]="verPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </button>
                </div>
              </div>

              <button type="submit" [disabled]="loginForm.invalid || cargando()" class="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B3A6B] via-[#0E6BA8] to-emerald-500 px-6 py-4 text-base font-bold text-white shadow-[0_14px_30px_-10px_rgba(14,107,168,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-10px_rgba(16,185,129,0.6)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
                <span class="relative z-10 flex items-center justify-center gap-2.5">
                  @if (cargando()) {<svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25"/><path fill="currentColor" class="opacity-90" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"/></svg>}
                  <span>{{ cargando() ? 'Verificando credenciales...' : 'Iniciar sesión y continuar' }}</span>
                </span>
                <span class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"></span>
              </button>
              </form>
            }
          }
        </div>

        <!-- ACCESO RÁPIDO PARA DEMOSTRACIÓN DE ESTUDIANTE -->
        <div class="mt-6 p-4 rounded-2xl bg-slate-900/85 border border-teal-500/40 text-center shadow-2xl backdrop-blur-md space-y-2.5">
          <div class="flex items-center justify-center gap-2 text-xs font-bold text-teal-300">
            <span class="animate-pulse">🧪</span>
            <span>Acceso de Demostración Académica (Estudiante)</span>
          </div>
          <div>
            <button
              type="button"
              (click)="iniciarDemoEstudiante()"
              class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-md shadow-teal-950/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>👨‍🎓</span>
              <span>Entrar como Estudiante Demo</span>
            </button>
          </div>
        </div>

        <p class="mt-6 text-center text-xs text-slate-400">Universidad Cooperativa de Colombia • Programa de Enfermería</p>
      </div>
    </div>
  `,
})
export class BienvenidaComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly stateService = inject(HandwashStateService);
  readonly themeService = inject(ThemeService);

  readonly tipoAcceso = signal<'estudiante' | 'docente'>('estudiante');
  readonly modo = signal<'registro' | 'login'>('registro');
  readonly cargando = signal<boolean>(false);
  readonly mensajeError = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);
  readonly verPassword = signal<boolean>(false);

  readonly docenteForm = new FormGroup({
    identificador: new FormControl('', [Validators.required, Validators.minLength(2)]),
    password: new FormControl('', [Validators.required, Validators.minLength(1)]),
  });

  readonly studentForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    studentCode: new FormControl('', [Validators.required, Validators.minLength(4)]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('Estudiante2026*', [Validators.required, Validators.minLength(6)]),
    consent: new FormControl(true, [Validators.requiredTrue]),
  });

  readonly loginForm = new FormGroup({
    identificador: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(1)]),
  });

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
    const { identificador, password } = this.docenteForm.getRawValue();
    this.cargando.set(true);
    this.mensajeError.set(null);

    const idNorm = (identificador || '').trim();

    this.authService.login({ identificador: idNorm, password: password || '' }).subscribe({
      next: (res) => {
        this.cargando.set(false);
        const user = res.user || res.usuario;
        if (user && AuthService.esRolDocente(user.rol)) {
          this.stateService.setStudent({ fullName: user.nombre, studentCode: user.codigoEstudiantil || 'DOCENTE-UCC', consent: true });
          this.stateService.unlockStep(12);
          this.router.navigate(['/admin']);
        } else {
          // La cuenta existe pero está registrada como estudiante
          this.authService.logout();
          this.mensajeError.set(
            'Esta cuenta no tiene asignado el rol de Docente en la base de datos de Supabase. Ingresa con tus credenciales de docente o contacta al administrador.'
          );
        }
      },
      error: (err) => {
        this.cargando.set(false);
        const status = err?.status ?? 0;
        if (status === 401 || status === 400) {
          this.mensajeError.set('Identificador (código, correo o nombre) o contraseña incorrectos. Verifica que la cuenta exista en Supabase con rol DOCENTE.');
        } else if (status === 0 || status >= 500) {
          this.mensajeError.set(
            'No fue posible conectar con el servidor en este momento (la base de datos puede estar reactivándose). Espera unos segundos e intenta de nuevo.'
          );
        } else {
          this.mensajeError.set(err?.error?.error || 'No fue posible iniciar sesión como docente.');
        }
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

    const datosRegistro = {
      nombre: val.fullName?.trim() || '',
      codigoEstudiantil: val.studentCode?.trim() || '',
      correo: val.correo?.trim().toLowerCase() || '',
      password: val.password || 'Estudiante2026*',
      consentimiento: !!val.consent,
    };

    this.authService.registro(datosRegistro).subscribe({
      next: () => {
        this.cargando.set(false);
        this.authService.logout();
        this.modo.set('login');
        this.mensajeError.set(null);
        this.mensajeExito.set('¡Registro exitoso! Por favor inicia sesión con tus credenciales');
        this.loginForm.reset();
        this.studentForm.reset({
          fullName: '',
          studentCode: '',
          correo: '',
          password: 'Estudiante2026*',
          consent: true,
        });
      },
      error: (err) => {
        this.cargando.set(false);
        this.mensajeError.set(err.error?.error || 'Error al conectar con el servidor.');
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

    this.authService.login({ identificador: identificador?.trim() || '', password: password || '' }).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.redirigirSegunRol(res);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mensajeError.set(err.error?.error || 'Credenciales no válidas.');
      },
    });
  }

  private redirigirSegunRol(res: AuthResponse): void {
    const user = res.usuario || res.user;
    this.stateService.setStudent({
      fullName: user.nombre,
      studentCode: user.codigoEstudiantil || '',
      consent: user?.consentimiento !== undefined ? !!user.consentimiento : true,
    });
    if (AuthService.esRolDocente(user.rol)) {
      this.stateService.unlockStep(7);
      this.router.navigate(['/admin']);
    } else {
      this.stateService.resetProgressToStepOne();
      this.router.navigate(['/dashboard']);
    }
  }

  iniciarDemoEstudiante(): void {
    const demoUser = {
      id: 'demo-estudiante-2026',
      nombre: 'Alejandro Morales Rivera',
      codigoEstudiantil: '2026-ENF-701',
      correo: 'alejandro.morales@campusucc.edu.co',
      rol: 'ESTUDIANTE' as const,
      consentimiento: true,
      semestre: 'Semestre VII',
      grupo: 'Grupo A-1 • Clínica',
      avatar: '👨‍⚕️',
      fechaRegistro: new Date(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', 'demo-jwt-token-estudiante-2026');
      localStorage.setItem('usuario', JSON.stringify(demoUser));
    }
    this.authService.token.set('demo-jwt-token-estudiante-2026');
    this.authService.usuarioActual.set(demoUser);
    this.stateService.setStudent({
      fullName: demoUser.nombre,
      studentCode: demoUser.codigoEstudiantil,
      consent: true,
    });
    this.stateService.resetProgressToStepOne();
    this.router.navigate(['/dashboard']);
  }

  iniciarDemoDocente(): void {
    const demoDocente = {
      id: 'demo-docente-2026',
      nombre: 'Dra. Claudia Martínez',
      codigoEstudiantil: 'DOC-ENF-001',
      correo: 'claudia.martinez@campusucc.edu.co',
      rol: 'DOCENTE' as const,
      consentimiento: true,
      semestre: 'Coordinación Clínica',
      grupo: 'Comité Evaluador OMS',
      avatar: '👩‍⚕️',
      fechaRegistro: new Date(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', 'demo-jwt-token-docente-2026');
      localStorage.setItem('usuario', JSON.stringify(demoDocente));
    }
    this.authService.token.set('demo-jwt-token-docente-2026');
    this.authService.usuarioActual.set(demoDocente);
    this.stateService.setStudent({
      fullName: demoDocente.nombre,
      studentCode: demoDocente.codigoEstudiantil,
      consent: true,
    });
    this.stateService.unlockStep(7);
    this.router.navigate(['/admin']);
  }
}
