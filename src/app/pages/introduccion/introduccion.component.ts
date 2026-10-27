import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HandwashStateService } from '../../core/services/handwash-state.service';

@Component({
  selector: 'app-introduccion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fade-in text-slate-100">
      
      <!-- ENCABEZADO PRINCIPAL DE BIENVENIDA CLÍNICA -->
      <div class="relative bg-gradient-to-r from-[#08151D] via-[#0D2428] to-[#081E1C] rounded-3xl p-6 sm:p-10 border border-[#00B39F]/30 shadow-2xl overflow-hidden mb-10">
        <!-- Efectos lumínicos de fondo -->
        <div class="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#00B39F]/15 blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#50E7FF]/15 blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
          <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#00B39F]/20 border border-[#00B39F]/40 text-[#50E7FF] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <svg class="w-4 h-4 text-[#00B39F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Protocolo OMS • Directriz Mundial de Bioseguridad</span>
          </div>

          <h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-md">
            Higiene de Manos: <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#00B39F] via-[#50E7FF] to-[#D9FF43]">El Primer Escudo Clínico</span>
          </h1>

          <p class="text-sm sm:text-base md:text-lg text-[#C5D7E8] max-w-3xl leading-relaxed mb-6">
            Bienvenido/a a la plataforma de entrenamiento interactivo de la Universidad Cooperativa de Colombia. Antes de la simulación práctica, revisa los fundamentos epidemiológicos, los 5 momentos clave de atención asistencial y la metodología del entrenamiento que asegurarás en tu práctica hospitalaria.
          </p>

          <div class="inline-flex flex-wrap items-center gap-3 px-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-xs sm:text-sm text-slate-300">
            <span class="w-2.5 h-2.5 rounded-full bg-[#00B39F] animate-pulse"></span>
            <span>Estudiante en formación:</span>
            <strong class="text-white">{{ nombreEstudiante() }}</strong>
            <span class="text-slate-500">•</span>
            <span class="font-mono text-[#50E7FF]">{{ codigoEstudiante() }}</span>
          </div>
        </div>
      </div>

      <!-- SECCIÓN DE 3 TARJETAS INFORMATIVAS CLÍNICAS -->
      <div class="space-y-8 mb-12">

        <!-- TARJETA 1: ¿POR QUÉ ES VITAL? -->
        <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-white/80 text-slate-800 transition-all duration-300 hover:shadow-2xl">
          <div class="flex items-center gap-4 mb-5 border-b border-slate-100 pb-4">
            <div class="w-12 h-12 rounded-2xl bg-[#00B39F]/15 flex items-center justify-center text-[#008072] shrink-0 shadow-inner">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <span class="text-xs font-bold text-[#008072] uppercase tracking-wider block">Epidemiología y Seguridad del Paciente</span>
              <h2 class="text-xl sm:text-2xl font-black text-slate-900">
                1. ¿Por Qué es Vital la Higiene de Manos?
              </h2>
            </div>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            Las <strong>Infecciones Asociadas a la Atención de la Salud (IAAS)</strong> son el evento adverso más frecuente en la prestación de servicios clínicos hospitalarios a nivel mundial. Las manos del personal de salud son el vehículo principal para la transmisión cruzada de patógenos.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Bloque 1 -->
            <div class="bg-gradient-to-br from-[#E6FBF7] to-white p-4 sm:p-5 rounded-2xl border border-[#00B39F]/20 shadow-xs">
              <div class="text-2xl sm:text-3xl font-black text-[#008072] mb-1">Hasta 50%</div>
              <h3 class="text-xs sm:text-sm font-extrabold text-slate-900 mb-1.5">Reducción de IAAS</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Una técnica de higiene correcta reduce drásticamente las infecciones nosocomiales y complicaciones sépticas en salas de hospitalización y cuidados intensivos.
              </p>
            </div>

            <!-- Bloque 2 -->
            <div class="bg-gradient-to-br from-[#FFF4EE] to-white p-4 sm:p-5 rounded-2xl border border-[#FF6A4D]/20 shadow-xs">
              <div class="text-2xl sm:text-3xl font-black text-[#FF6A4D] mb-1">Microorganismos</div>
              <h3 class="text-xs sm:text-sm font-extrabold text-slate-900 mb-1.5">Flora Multirresistente</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Interrumpe la colonización de patógenos de alta alarma como <em>S. aureus resistente a meticilina (SARM)</em>, <em>K. pneumoniae productora de KPC</em> y <em>C. difficile</em>.
              </p>
            </div>

            <!-- Bloque 3 -->
            <div class="bg-gradient-to-br from-slate-50 to-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div class="text-2xl sm:text-3xl font-black text-[#0B2B29] mb-1">Costo-Efectiva</div>
              <h3 class="text-xs sm:text-sm font-extrabold text-slate-900 mb-1.5">Práctica de Mayor Impacto</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Constituye la intervención más económica, universal y con mayor evidencia científica para preservar la vida de pacientes inmunodeprimidos y quirúrgicos.
              </p>
            </div>
          </div>
        </div>

        <!-- TARJETA 2: LOS 5 MOMENTOS DEL LAVADO DE MANOS (OMS) -->
        <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-white/80 text-slate-800 transition-all duration-300 hover:shadow-2xl">
          <div class="flex items-center gap-4 mb-5 border-b border-slate-100 pb-4">
            <div class="w-12 h-12 rounded-2xl bg-[#50E7FF]/20 flex items-center justify-center text-[#008072] shrink-0 shadow-inner">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span class="text-xs font-bold text-[#008072] uppercase tracking-wider block">Estándar Universal de Atención</span>
              <h2 class="text-xl sm:text-2xl font-black text-slate-900">
                2. Los 5 Momentos del Lavado de Manos (OMS)
              </h2>
            </div>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            La Organización Mundial de la Salud sintetiza en 5 momentos asistenciales exactos cuándo debe ejecutarse la fricción antiséptica o el lavado clínico para romper el ciclo biológico de transmisión:
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <!-- Momento 1 -->
            <div class="p-4 rounded-2xl bg-[#F0FDF8] border border-[#00B39F]/20 flex flex-col justify-between hover:border-[#00B39F] transition">
              <div>
                <span class="w-7 h-7 rounded-full bg-[#00B39F] text-white flex items-center justify-center text-xs font-black mb-2 shadow-xs">
                  1
                </span>
                <h4 class="text-xs font-black text-slate-900 mb-1">Antes de tocar al paciente</h4>
                <p class="text-[11px] text-slate-600 leading-snug">
                  Al estrechar la mano, ayudar a incorporarse o realizar una exploración física.
                </p>
              </div>
              <span class="text-[10px] font-bold text-[#008072] uppercase block mt-3">Protege al paciente</span>
            </div>

            <!-- Momento 2 -->
            <div class="p-4 rounded-2xl bg-[#F0FDF8] border border-[#00B39F]/20 flex flex-col justify-between hover:border-[#00B39F] transition">
              <div>
                <span class="w-7 h-7 rounded-full bg-[#00B39F] text-white flex items-center justify-center text-xs font-black mb-2 shadow-xs">
                  2
                </span>
                <h4 class="text-xs font-black text-slate-900 mb-1">Antes de tarea aséptica</h4>
                <p class="text-[11px] text-slate-600 leading-snug">
                  Previo a canalizar vena, curar heridas, aspirar secreciones o colocar catéteres.
                </p>
              </div>
              <span class="text-[10px] font-bold text-[#008072] uppercase block mt-3">Evita inoculación</span>
            </div>

            <!-- Momento 3 -->
            <div class="p-4 rounded-2xl bg-[#FFF5F2] border border-[#FF6A4D]/25 flex flex-col justify-between hover:border-[#FF6A4D] transition">
              <div>
                <span class="w-7 h-7 rounded-full bg-[#FF6A4D] text-white flex items-center justify-center text-xs font-black mb-2 shadow-xs">
                  3
                </span>
                <h4 class="text-xs font-black text-slate-900 mb-1">Riesgo de exposición a fluidos</h4>
                <p class="text-[11px] text-slate-600 leading-snug">
                  Tras contacto con sangre, orina, drenajes corporales o retiro de guantes.
                </p>
              </div>
              <span class="text-[10px] font-bold text-[#FF6A4D] uppercase block mt-3">Protege al enfermero/a</span>
            </div>

            <!-- Momento 4 -->
            <div class="p-4 rounded-2xl bg-[#F4F9FF] border border-[#50E7FF]/30 flex flex-col justify-between hover:border-[#50E7FF] transition">
              <div>
                <span class="w-7 h-7 rounded-full bg-slate-900 text-[#50E7FF] flex items-center justify-center text-xs font-black mb-2 shadow-xs">
                  4
                </span>
                <h4 class="text-xs font-black text-slate-900 mb-1">Después de tocar al paciente</h4>
                <p class="text-[11px] text-slate-600 leading-snug">
                  Al despedirse del paciente tras auscultarlo, acomodarlo o asistirlo.
                </p>
              </div>
              <span class="text-[10px] font-bold text-slate-700 uppercase block mt-3">Protege el entorno</span>
            </div>

            <!-- Momento 5 -->
            <div class="p-4 rounded-2xl bg-[#F4F9FF] border border-[#50E7FF]/30 flex flex-col justify-between hover:border-[#50E7FF] transition">
              <div>
                <span class="w-7 h-7 rounded-full bg-slate-900 text-[#50E7FF] flex items-center justify-center text-xs font-black mb-2 shadow-xs">
                  5
                </span>
                <h4 class="text-xs font-black text-slate-900 mb-1">Contacto con entorno de cama</h4>
                <p class="text-[11px] text-slate-600 leading-snug">
                  Al manipular barandillas, mesas auxiliares, sábanas o bombas de infusión.
                </p>
              </div>
              <span class="text-[10px] font-bold text-slate-700 uppercase block mt-3">Superficies inanimadas</span>
            </div>
          </div>
        </div>

        <!-- TARJETA 3: METODOLOGÍA DEL ENTRENAMIENTO CLÍNICO -->
        <div class="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-white/80 text-slate-800 transition-all duration-300 hover:shadow-2xl">
          <div class="flex items-center gap-4 mb-5 border-b border-slate-100 pb-4">
            <div class="w-12 h-12 rounded-2xl bg-[#D9FF43]/20 flex items-center justify-center text-[#0B2B29] shrink-0 shadow-inner">
              <svg class="w-6 h-6 text-[#008072]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <span class="text-xs font-bold text-[#008072] uppercase tracking-wider block">Estructura Pedagógica</span>
              <h2 class="text-xl sm:text-2xl font-black text-slate-900">
                3. Metodología del Entrenamiento Clínico
              </h2>
            </div>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            Para alcanzar la certificación institucional, atravesarás un itinerario formativo guiado de 3 fases biomecánicas progresivas:
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Fase 1 -->
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2.5 py-1 rounded-full bg-[#00B39F]/15 text-[#008072] text-[11px] font-black uppercase">
                  Fase 1
                </span>
                <span class="text-xs text-slate-400 font-semibold">• Protocolo Inicial</span>
              </div>
              <h4 class="text-base font-extrabold text-slate-900 mb-1.5">Preparación Previa</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Verificación del checklist clínico: despojo de reloj y anillos, mangas dobladas sobre el codo, piel íntegra y dispensador de solución al alcance.
              </p>
            </div>

            <!-- Fase 2 -->
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2.5 py-1 rounded-full bg-[#50E7FF]/20 text-[#008072] text-[11px] font-black uppercase">
                  Fase 2
                </span>
                <span class="text-xs text-slate-400 font-semibold">• Práctica Asistida</span>
              </div>
              <h4 class="text-base font-extrabold text-slate-900 mb-1.5">Los 6 Pasos OMS</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Ejecución guiada con modelos anatómicos biomecánicos y video demostrativo de alta resolución. Cada paso calibra el ritmo óptimo (3 a 8 segundos).
              </p>
            </div>

            <!-- Fase 3 -->
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2.5 py-1 rounded-full bg-[#FFE9DE] text-[#FF6A4D] text-[11px] font-black uppercase">
                  Fase 3
                </span>
                <span class="text-xs text-slate-400 font-semibold">• Evaluación y QR</span>
              </div>
              <h4 class="text-base font-extrabold text-slate-900 mb-1.5">Acreditación Oficial</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Calificación biomecánica sobre 10 puntos, retroalimentación diagnóstica y generación de certificado verificable con código QR institucional.
              </p>
            </div>
          </div>
        </div>

      </div>

      <!-- BOTÓN INFERIOR DE ACCIÓN (TIPO PÍLDORA PROMINENTE #00B39F TURQUESA) -->
      <div class="flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-[#0C1A22] to-[#071318] rounded-3xl border border-[#00B39F]/30 shadow-2xl">
        <div class="w-12 h-12 rounded-full bg-[#00B39F]/20 flex items-center justify-center text-[#50E7FF] mb-3">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
        <h3 class="text-lg sm:text-xl font-extrabold text-white mb-2">
          ¿Listo para iniciar tu sesión de simulación clínica?
        </h3>
        <p class="text-xs sm:text-sm text-[#C5D7E8] max-w-md mb-6 leading-relaxed">
          Comenzaremos asegurando el cumplimiento de la lista de verificación previa para garantizar las condiciones asépticas de la práctica.
        </p>

        <!-- Botón tipo píldora prominente turquesa -->
        <button
          type="button"
          (click)="comenzarPreparacion()"
          class="w-full sm:w-auto px-10 py-4 rounded-full bg-[#00B39F] hover:bg-[#008072] text-white font-extrabold text-sm sm:text-base transition-all duration-300 shadow-[0_4px_24px_rgba(0,179,159,0.4)] hover:shadow-[0_6px_30px_rgba(0,179,159,0.6)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer group"
        >
          <span>Comenzar Preparación Previa</span>
          <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

    </div>
  `,
})
export class IntroduccionComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly stateService = inject(HandwashStateService);

  readonly nombreEstudiante = computed(() => {
    return (
      this.stateService.student()?.fullName ||
      this.authService.usuarioActual()?.nombre ||
      'Estudiante de Enfermería'
    );
  });

  readonly codigoEstudiante = computed(() => {
    return (
      this.stateService.student()?.studentCode ||
      this.authService.usuarioActual()?.codigoEstudiantil ||
      'UCC-ENF'
    );
  });

  comenzarPreparacion(): void {
    this.router.navigate(['/preparacion']);
  }
}
