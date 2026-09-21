import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HandwashStateService } from '../../core/services/handwash-state.service';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      <!-- Badge de Encabezado -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00B39F]/10 border border-[#00B39F]/20 text-[#008072] text-xs md:text-sm font-semibold mb-4 shadow-sm">
          <svg class="w-4 h-4 text-[#00B39F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Proyecto de Grado • Facultad de Enfermería
        </div>
        <h1 class="font-heading text-4xl md:text-5xl lg:text-6xl text-[#0B2B29] tracking-tight mb-4">
          Manos Seguras
        </h1>
        <p class="text-base md:text-lg text-[#537571] max-w-xl mx-auto leading-relaxed">
          Plataforma de entrenamiento clínico y evaluación interactiva de la técnica de lavado de manos según la norma internacional de la OMS.
        </p>
      </div>

      <!-- Tarjeta Principal del Formulario -->
      <div class="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-white/80 transition-all duration-300 hover:shadow-2xl">
        <div class="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
          <div class="w-10 h-10 rounded-2xl bg-[#00B39F]/15 flex items-center justify-center text-[#00B39F]">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 class="font-heading text-xl md:text-2xl text-[#0B2B29]">Identificación del Estudiante</h2>
            <p class="text-xs md:text-sm text-[#537571]">Ingresa tus datos para registrar tu progreso y generar tu certificado</p>
          </div>
        </div>

        <form [formGroup]="studentForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Campo Nombre Completo -->
          <div>
            <label for="fullName" class="block text-sm font-semibold text-[#0B2B29] mb-2">
              Nombre Completo <span class="text-[#FF6A4D]">*</span>
            </label>
            <div class="relative">
              <input
                id="fullName"
                type="text"
                formControlName="fullName"
                placeholder="Ej. Laura Marcela Ramírez Gómez"
                class="w-full px-4 py-3.5 pl-11 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#00B39F] focus:ring-4 focus:ring-[#00B39F]/10 outline-none transition duration-200 text-[#0B2B29] font-medium"
                [class.border-red-400]="fullNameInvalid"
              />
              <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            @if (fullNameInvalid) {
              <p class="mt-1.5 text-xs text-red-500 font-medium">Por favor ingresa tu nombre completo (mínimo 3 caracteres).</p>
            }
          </div>

          <!-- Campo Código Estudiantil -->
          <div>
            <label for="studentCode" class="block text-sm font-semibold text-[#0B2B29] mb-2">
              Código Estudiantil o Documento <span class="text-[#FF6A4D]">*</span>
            </label>
            <div class="relative">
              <input
                id="studentCode"
                type="text"
                formControlName="studentCode"
                placeholder="Ej. ENF-2024-8849 o Documento de Identidad"
                class="w-full px-4 py-3.5 pl-11 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#00B39F] focus:ring-4 focus:ring-[#00B39F]/10 outline-none transition duration-200 text-[#0B2B29] font-medium"
                [class.border-red-400]="studentCodeInvalid"
              />
              <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
            </div>
            @if (studentCodeInvalid) {
              <p class="mt-1.5 text-xs text-red-500 font-medium">Ingresa un código estudiantil o documento válido.</p>
            }
          </div>

          <!-- Consentimiento Informado -->
          <div class="rounded-2xl border border-[#00B39F]/20 bg-[#CFFBF0]/20 p-4 md:p-5 transition-colors">
            <label class="flex items-start gap-3.5 cursor-pointer">
              <input
                type="checkbox"
                formControlName="consent"
                id="consentCheck"
                class="mt-1 w-5 h-5 rounded text-[#00B39F] border-slate-300 focus:ring-[#00B39F] cursor-pointer transition accent-[#00B39F]"
              />
              <div class="text-xs md:text-sm text-[#0B2B29] leading-relaxed">
                <span class="font-bold text-[#008072]">Consentimiento Informado: </span>
                Acepto participar voluntariamente en esta sesión pedagógica y de evaluación de bioseguridad. Comprendo que mis respuestas y tiempos de práctica se registrarán con fines de retroalimentación formativa y académica.
              </div>
            </label>
            @if (consentInvalid) {
              <p class="mt-2 text-xs text-red-500 font-medium pl-8">Debes aceptar el consentimiento informado para continuar.</p>
            }
          </div>

          <!-- Botón de Envío -->
          <div class="pt-2">
            <button
              type="submit"
              [disabled]="studentForm.invalid"
              class="w-full btn-primary py-4 text-base md:text-lg flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <span>Continuar al Cuestionario</span>
              <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <!-- Resumen de Características -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/60 flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-[#00B39F]/15 flex items-center justify-center text-[#00B39F] shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xs font-bold text-[#0B2B29]">Cronómetro en Vivo</h3>
            <p class="text-[11px] text-[#537571]">Medición por paso (3-8s)</p>
          </div>
        </div>

        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/60 flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-[#FF6A4D]/15 flex items-center justify-center text-[#FF6A4D] shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xs font-bold text-[#0B2B29]">Calificación Automática</h3>
            <p class="text-[11px] text-[#537571]">Evaluación precisa sobre 10</p>
          </div>
        </div>

        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/60 flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-[#00B39F]/15 flex items-center justify-center text-[#00B39F] shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xs font-bold text-[#0B2B29]">Técnica OMS</h3>
            <p class="text-[11px] text-[#537571]">Protocolo clínico de 6 pasos</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BienvenidaComponent {
  private readonly router = inject(Router);
  private readonly stateService = inject(HandwashStateService);

  readonly studentForm = new FormGroup({
    fullName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    studentCode: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    consent: new FormControl(false, [Validators.requiredTrue]),
  });

  get fullNameInvalid(): boolean {
    const ctrl = this.studentForm.controls.fullName;
    return ctrl.touched && ctrl.invalid;
  }

  get studentCodeInvalid(): boolean {
    const ctrl = this.studentForm.controls.studentCode;
    return ctrl.touched && ctrl.invalid;
  }

  get consentInvalid(): boolean {
    const ctrl = this.studentForm.controls.consent;
    return ctrl.touched && ctrl.invalid;
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      const { fullName, studentCode, consent } = this.studentForm.value;
      this.stateService.setStudent({
        fullName: fullName?.trim() || '',
        studentCode: studentCode?.trim() || '',
        consent: !!consent,
      });
      this.router.navigate(['/diagnostico']);
    } else {
      this.studentForm.markAllAsTouched();
    }
  }
}
