import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HandwashStateService } from '../../core/services/handwash-state.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      <!-- Tarjeta Hero Central -->
      <div class="bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/80 text-center relative overflow-hidden">
        <!-- Elementos decorativos de fondo -->
        <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#CFFBF0]/60 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#FFE9DE]/60 blur-3xl pointer-events-none"></div>

        <!-- Tag Superior -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00B39F]/10 border border-[#00B39F]/20 text-[#008072] text-xs md:text-sm font-semibold mb-6">
          <span class="w-2 h-2 rounded-full bg-[#00B39F] animate-ping"></span>
          Simulador de Destreza Clínica
        </div>

        <!-- Título Principal -->
        <h1 class="font-heading text-4xl md:text-5xl lg:text-6xl text-[#0B2B29] tracking-tight mb-4">
          Manos Seguras
        </h1>

        <!-- Subtítulo / Descripción -->
        <p class="text-base md:text-xl text-[#537571] max-w-2xl mx-auto leading-relaxed mb-8">
          Bienvenido a la sesión de práctica supervisada. Ejecutarás los <strong class="text-[#0B2B29]">6 pasos oficiales</strong> de la técnica de lavado de manos clínico con cronometraje en tiempo real.
        </p>

        <!-- Ilustración Médica SVG -->
        <div class="relative w-48 h-48 md:w-56 md:h-56 mx-auto mb-8 flex items-center justify-center">
          <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-[#CFFBF0] via-[#E6FBF7] to-[#FFE9DE] opacity-80 animate-pulse-subtle"></div>
          
          <!-- Ilustración SVG Manos y Burbujas Asépticas -->
          <svg class="w-32 h-32 md:w-36 md:h-36 relative z-10 text-[#00B39F]" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Gota de agua central -->
            <path d="M60 18C60 18 36 48 36 70C36 83.2548 46.7452 94 60 94C73.2548 94 84 83.2548 84 70C84 48 60 18 60 18Z" fill="#00B39F" fill-opacity="0.15" stroke="#00B39F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- Brillo de la gota -->
            <path d="M50 56C47 62 48 74 54 80" stroke="#00B39F" stroke-width="2.5" stroke-linecap="round"/>

            <!-- Manos estilizadas en acción de lavado -->
            <path d="M42 66C38 68 33 73 34 78C35 83 40 85 45 83L52 80" stroke="#0B2B29" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M78 66C82 68 87 73 86 78C85 83 80 85 75 83L68 80" stroke="#0B2B29" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M46 72L60 76L74 72" stroke="#00B39F" stroke-width="3" stroke-linecap="round"/>

            <!-- Burbujas asépticas / espuma -->
            <circle cx="34" cy="46" r="6" fill="#CFFBF0" stroke="#00B39F" stroke-width="2"/>
            <circle cx="86" cy="48" r="8" fill="#FFE9DE" stroke="#FF6A4D" stroke-width="2"/>
            <circle cx="78" cy="30" r="4.5" fill="#CFFBF0" stroke="#00B39F" stroke-width="2"/>
            <circle cx="42" cy="32" r="3.5" fill="#FFE9DE" stroke="#FF6A4D" stroke-width="1.5"/>
            <circle cx="60" cy="100" r="4" fill="#00B39F" fill-opacity="0.3"/>
          </svg>
        </div>

        <!-- Tarjetas de Instrucciones Didácticas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left max-w-3xl mx-auto">
          <div class="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div class="w-8 h-8 rounded-xl bg-[#00B39F]/15 text-[#00B39F] font-bold flex items-center justify-center text-sm mb-2">1</div>
            <h4 class="text-sm font-bold text-[#0B2B29]">6 Pasos Oficiales</h4>
            <p class="text-xs text-[#537571] mt-1">Recorrerás cada maniobra de frotación paso a paso de manera individual.</p>
          </div>

          <div class="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div class="w-8 h-8 rounded-xl bg-[#FF6A4D]/15 text-[#FF6A4D] font-bold flex items-center justify-center text-sm mb-2">2</div>
            <h4 class="text-sm font-bold text-[#0B2B29]">Ritmo Ideal: 3 a 8s</h4>
            <p class="text-xs text-[#537571] mt-1">El cronómetro evaluará si te mantienes en el tiempo óptimo por paso.</p>
          </div>

          <div class="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div class="w-8 h-8 rounded-xl bg-[#00B39F]/15 text-[#00B39F] font-bold flex items-center justify-center text-sm mb-2">3</div>
            <h4 class="text-sm font-bold text-[#0B2B29]">Calificación sobre 10</h4>
            <p class="text-xs text-[#537571] mt-1">Recibirás un desglose clínico detallado con retroalimentación instantánea.</p>
          </div>
        </div>

        <!-- Botón de Acción Principal -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            (click)="startPractice()"
            class="btn-primary py-4 px-10 text-lg flex items-center gap-3 w-full sm:w-auto shadow-xl hover:scale-105 group"
          >
            <span>Comenzar Práctica</span>
            <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <button
            type="button"
            (click)="goBack()"
            class="btn-secondary py-3.5 px-6 text-sm text-[#537571] hover:text-[#0B2B29] w-full sm:w-auto"
          >
            Revisar Cuestionario
          </button>
        </div>
      </div>
    </div>
  `,
})
export class InicioComponent {
  private readonly router = inject(Router);
  private readonly stateService = inject(HandwashStateService);

  startPractice(): void {
    this.stateService.resetPractice();
    this.router.navigate(['/practica']);
  }

  goBack(): void {
    this.router.navigate(['/diagnostico']);
  }
}
