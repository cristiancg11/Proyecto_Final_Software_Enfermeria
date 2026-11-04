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
      <div class="relative bg-gradient-to-br from-[#0B192C] via-[#0F2942] to-[#0D3B3E] rounded-2xl p-6 sm:p-10 border border-teal-500/30 shadow-[0_24px_50px_-12px_rgba(7,17,30,0.6)] overflow-hidden mb-10">
        <!-- Efectos lumínicos de fondo -->
        <div class="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
          <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <svg class="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Protocolo OMS • Directriz Mundial de Bioseguridad</span>
          </div>

          <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Higiene de Manos: <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-sky-300">El Primer Escudo Clínico</span>
          </h1>

          <p class="text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl leading-relaxed mb-6">
            Bienvenido/a a la plataforma de entrenamiento interactivo de la Universidad Cooperativa de Colombia. Antes de la simulación práctica, revisa los fundamentos epidemiológicos, los 5 momentos clave de atención asistencial y la metodología del entrenamiento que asegurarás en tu práctica hospitalaria.
          </p>

          <div class="flex flex-wrap items-center gap-3">
            <div class="inline-flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700/70 text-xs sm:text-sm text-slate-300">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Estudiante en formación:</span>
              <strong class="text-white">{{ nombreEstudiante() }}</strong>
              <span class="text-slate-500">•</span>
              <span class="font-mono text-teal-300 font-semibold">{{ codigoEstudiante() }}</span>
            </div>

            <a
              routerLink="/reto-extremo"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-teal-950/40 hover:scale-[1.02] transition-all duration-300 border border-teal-400/30"
            >
              <span>⚡ ¡Modo Reto Extremo: Demuestra tu Nivel!</span>
            </a>
          </div>
        </div>
      </div>

      <!-- SECCIÓN DE 3 TARJETAS INFORMATIVAS CLÍNICAS -->
      <div class="space-y-8 mb-12">

        <!-- TARJETA 1: ¿POR QUÉ ES VITAL? -->
        <div class="bg-white/98 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-[0_18px_40px_-12px_rgba(7,17,30,0.35)] border border-slate-200/90 text-slate-800 transition-all duration-300">
          <div class="flex items-center gap-4 mb-5 border-b border-slate-100 pb-4">
            <div class="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200/70 flex items-center justify-center text-teal-700 shrink-0">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <span class="text-xs font-bold text-teal-700 uppercase tracking-wider block">Epidemiología y Seguridad del Paciente</span>
              <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                1. ¿Por Qué es Vital la Higiene de Manos?
              </h2>
            </div>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            Las <strong>Infecciones Asociadas a la Atención de la Salud (IAAS)</strong> son el evento adverso más frecuente en la prestación de servicios clínicos hospitalarios a nivel mundial. Las manos del personal de salud son el vehículo principal para la transmisión cruzada de patógenos.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Bloque 1 -->
            <div class="bg-gradient-to-br from-teal-50/80 to-white p-5 rounded-xl border border-teal-200/70 shadow-xs transition-all duration-300 hover:shadow-md">
              <div class="text-2xl sm:text-3xl font-extrabold text-teal-700 mb-1">Hasta 50%</div>
              <h3 class="text-xs sm:text-sm font-bold text-slate-900 mb-1.5">Reducción de IAAS</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Una técnica de higiene correcta reduce drásticamente las infecciones nosocomiales y complicaciones sépticas en salas de hospitalización y cuidados intensivos.
              </p>
            </div>

            <!-- Bloque 2 -->
            <div class="bg-gradient-to-br from-sky-50/80 to-white p-5 rounded-xl border border-sky-200/70 shadow-xs transition-all duration-300 hover:shadow-md">
              <div class="text-2xl sm:text-3xl font-extrabold text-sky-700 mb-1">Microorganismos</div>
              <h3 class="text-xs sm:text-sm font-bold text-slate-900 mb-1.5">Flora Multirresistente</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Interrumpe la colonización de patógenos de alta alarma como <em>S. aureus resistente a meticilina (SARM)</em>, <em>K. pneumoniae productora de KPC</em> y <em>C. difficile</em>.
              </p>
            </div>

            <!-- Bloque 3 -->
            <div class="bg-gradient-to-br from-slate-50 to-white p-5 rounded-xl border border-slate-200/90 shadow-xs transition-all duration-300 hover:shadow-md">
              <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">Costo-Efectiva</div>
              <h3 class="text-xs sm:text-sm font-bold text-slate-900 mb-1.5">Práctica de Mayor Impacto</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Constituye la intervención más económica, universal y con mayor evidencia científica para preservar la vida de pacientes inmunodeprimidos y quirúrgicos.
              </p>
            </div>
          </div>
        </div>

        <!-- TARJETA 2: LOS 5 MOMENTOS DEL LAVADO DE MANOS (OMS) -->
        <div class="bg-white/98 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-[0_18px_40px_-12px_rgba(7,17,30,0.35)] border border-slate-200/90 text-slate-800 transition-all duration-300">
          <div class="flex items-center gap-4 mb-5 border-b border-slate-100 pb-4">
            <div class="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200/70 flex items-center justify-center text-sky-700 shrink-0">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span class="text-xs font-bold text-sky-700 uppercase tracking-wider block">Estándar Universal de Atención</span>
              <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                2. Los 5 Momentos del Lavado de Manos (OMS)
              </h2>
            </div>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            La Organización Mundial de la Salud sintetiza en 5 momentos asistenciales exactos cuándo debe ejecutarse la fricción antiséptica o el lavado clínico para romper el ciclo biológico de transmisión:
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <!-- Momento 1 -->
            <div class="p-4 rounded-xl bg-teal-50/50 border border-teal-200/70 flex flex-col justify-between hover:border-teal-500 transition-all duration-300">
              <div>
                <span class="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold mb-2.5 shadow-xs">
                  1
                </span>
                <h4 class="text-xs font-bold text-slate-900 mb-1">Antes de tocar al paciente</h4>
                <p class="text-[11px] text-slate-600 leading-snug">
                  Al estrechar la mano, ayudar a incorporarse o realizar una exploración física.
                </p>
              </div>
              <span class="text-[10px] font-bold text-teal-700 uppercase block mt-3">Protege al paciente</span>
            </div>

            <!-- Momento 2 -->
            <div class="p-4 rounded-xl bg-teal-50/50 border border-teal-200/70 flex flex-col justify-between hover:border-teal-500 transition-all duration-300">
              <div>
                <span class="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold mb-2.5 shadow-xs">
                  2
                </span>
                <h4 class="text-xs font-bold text-slate-900 mb-1">Antes de tarea aséptica</h4>
                <p class="text-[11px] text-slate-600 leading-snug">
                  Previo a canalizar vena, curar heridas, aspirar secreciones o colocar catéteres.
                </p>
              </div>
              <span class="text-[10px] font-bold text-teal-700 uppercase block mt-3">Evita inoculación</span>
            </div>

            <!-- Momento 3 -->
            <div class="p-4 rounded-xl bg-sky-50/60 border border-sky-200/80 flex flex-col justify-between hover:border-sky-500 transition-all duration-300">
              <div>
                <span class="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold mb-2.5 shadow-xs">
                  3
                </span>
                <h4 class="text-xs font-bold text-slate-900 mb-1">Riesgo de exposición a fluidos</h4>
                <p class="text-[11px] text-slate-600 leading-snug">
                  Tras contacto con sangre, orina, drenajes corporales o retiro de guantes.
                </p>
              </div>
              <span class="text-[10px] font-bold text-sky-700 uppercase block mt-3">Protege al enfermero/a</span>
            </div>

            <!-- Momento 4 -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between hover:border-slate-400 transition-all duration-300">
              <div>
                <span class="w-7 h-7 rounded-lg bg-[#0B192C] text-teal-300 flex items-center justify-center text-xs font-bold mb-2.5 shadow-xs">
                  4
                </span>
                <h4 class="text-xs font-bold text-slate-900 mb-1">Después de tocar al paciente</h4>
                <p class="text-[11px] text-slate-600 leading-snug">
                  Al despedirse del paciente tras auscultarlo, acomodarlo o asistirlo.
                </p>
              </div>
              <span class="text-[10px] font-bold text-slate-700 uppercase block mt-3">Protege el entorno</span>
            </div>

            <!-- Momento 5 -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between hover:border-slate-400 transition-all duration-300">
              <div>
                <span class="w-7 h-7 rounded-lg bg-[#0B192C] text-teal-300 flex items-center justify-center text-xs font-bold mb-2.5 shadow-xs">
                  5
                </span>
                <h4 class="text-xs font-bold text-slate-900 mb-1">Contacto con entorno de cama</h4>
                <p class="text-[11px] text-slate-600 leading-snug">
                  Al manipular barandillas, mesas auxiliares, sábanas o bombas de infusión.
                </p>
              </div>
              <span class="text-[10px] font-bold text-slate-700 uppercase block mt-3">Superficies inanimadas</span>
            </div>
          </div>
        </div>

        <!-- TARJETA 3: METODOLOGÍA DEL ENTRENAMIENTO CLÍNICO -->
        <div class="bg-white/98 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-[0_18px_40px_-12px_rgba(7,17,30,0.35)] border border-slate-200/90 text-slate-800 transition-all duration-300">
          <div class="flex items-center gap-4 mb-5 border-b border-slate-100 pb-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700 shrink-0">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <span class="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Estructura Pedagógica</span>
              <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                3. Metodología del Entrenamiento Clínico
              </h2>
            </div>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            Para alcanzar la certificación institucional, atravesarás un itinerario formativo guiado de 3 fases biomecánicas progresivas:
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Fase 1 -->
            <div class="p-5 rounded-xl bg-slate-50 border border-slate-200/90 relative overflow-hidden transition-all duration-300 hover:border-teal-400">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[11px] font-bold uppercase">
                  Fase 1
                </span>
                <span class="text-xs text-slate-400 font-semibold">• Protocolo Inicial</span>
              </div>
              <h4 class="text-base font-bold text-slate-900 mb-1.5">Preparación Previa</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Verificación del checklist clínico: despojo de reloj y anillos, mangas dobladas sobre el codo, piel íntegra y dispensador de solución al alcance.
              </p>
            </div>

            <!-- Fase 2 -->
            <div class="p-5 rounded-xl bg-slate-50 border border-slate-200/90 relative overflow-hidden transition-all duration-300 hover:border-teal-400">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[11px] font-bold uppercase">
                  Fase 2
                </span>
                <span class="text-xs text-slate-400 font-semibold">• Práctica Asistida</span>
              </div>
              <h4 class="text-base font-bold text-slate-900 mb-1.5">Los 6 Pasos OMS</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Ejecución guiada con modelos anatómicos biomecánicos y video demostrativo de alta resolución. Cada paso calibra el ritmo óptimo (3 a 8 segundos).
              </p>
            </div>

            <!-- Fase 3 -->
            <div class="p-5 rounded-xl bg-slate-50 border border-slate-200/90 relative overflow-hidden transition-all duration-300 hover:border-teal-400">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase">
                  Fase 3
                </span>
                <span class="text-xs text-slate-400 font-semibold">• Evaluación y QR</span>
              </div>
              <h4 class="text-base font-bold text-slate-900 mb-1.5">Acreditación Oficial</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Calificación biomecánica sobre 10 puntos, retroalimentación diagnóstica y generación de certificado verificable con código QR institucional.
              </p>
            </div>
          </div>
        </div>

      </div>

      <!-- BANNER INFERIOR DE ACCIÓN -->
      <div class="flex flex-col items-center justify-center text-center p-8 sm:p-10 bg-gradient-to-br from-[#0B192C] via-[#0F2942] to-[#0D3B3E] rounded-2xl border border-teal-500/30 shadow-2xl">
        <div class="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 mb-3">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
        <h3 class="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
          ¿Listo para iniciar tu sesión de simulación clínica?
        </h3>
        <p class="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
          Comenzaremos asegurando el cumplimiento de la lista de verificación previa para garantizar las condiciones asépticas de la práctica.
        </p>

        <button
          type="button"
          (click)="comenzarPreparacion()"
          class="w-full sm:w-auto btn-primary px-10 py-4 text-sm sm:text-base flex items-center justify-center gap-3 cursor-pointer group"
        >
          <span>Comenzar Preparación Previa</span>
          <svg class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
