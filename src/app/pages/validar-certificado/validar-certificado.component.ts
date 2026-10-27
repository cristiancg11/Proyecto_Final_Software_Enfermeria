import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PracticasService, ValidarCertificadoResponse } from '../../services/practicas.service';

@Component({
  selector: 'app-validar-certificado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#080E14] via-[#0E1A22] to-[#0A1612] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden">
      <!-- Glows de fondo estéticos -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00B39F]/15 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#50E7FF]/15 blur-3xl pointer-events-none"></div>

      <!-- Contenedor Principal (Optimizado para móvil y desktop) -->
      <div class="w-full max-w-xl mx-auto relative z-10 animate-fade-in">

        <!-- Logotipo y Membrete Institucional -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-[#00B39F]/15 border border-[#00B39F]/30 text-[#50E7FF] text-xs font-bold uppercase tracking-wider mb-3">
            <svg class="w-4 h-4 text-[#00B39F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Validación Pública Oficial • Manos Seguras</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
            Acreditación de Competencia Clínica
          </h1>
          <p class="text-xs text-slate-400 mt-1">
            Universidad Cooperativa de Colombia • Facultad de Enfermería
          </p>
        </div>

        <!-- ESTADO: CARGANDO -->
        @if (cargando()) {
          <div class="bg-white/95 backdrop-blur-md rounded-3xl p-10 text-center shadow-2xl border border-white/80 text-slate-800">
            <svg class="animate-spin h-10 w-10 text-[#00B39F] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <h3 class="text-base font-bold text-slate-900 mb-1">Verificando Código en el Registro Académico...</h3>
            <p class="text-xs text-slate-500 font-mono">{{ codigoUrl() }}</p>
          </div>
        }

        <!-- ESTADO: CERTIFICADO VÁLIDO -->
        @else if (certificadoValido() && certificado()) {
          <div class="bg-white rounded-3xl shadow-2xl border border-white/80 overflow-hidden text-slate-800 print:shadow-none">
            <!-- Barra Superior del Sello Oficial -->
            <div class="bg-gradient-to-r from-[#008072] via-[#00B39F] to-[#50E7FF] p-4 text-white text-center relative">
              <div class="flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Documento Oficial Verificado • Técnica OMS</span>
              </div>
            </div>

            <!-- Contenido del Certificado -->
            <div class="p-6 sm:p-8 space-y-6">
              <!-- Sello Visual de Autenticidad -->
              <div class="flex flex-col items-center text-center">
                <div class="w-20 h-20 rounded-full bg-[#E6FBF7] border-4 border-[#00B39F]/30 flex items-center justify-center text-[#008072] shadow-inner mb-3 relative">
                  <svg class="w-10 h-10 text-[#008072]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                  </svg>
                  <span class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00B39F] text-white flex items-center justify-center text-xs font-black shadow-md">✓</span>
                </div>
                <span class="text-[11px] font-black uppercase tracking-widest text-[#008072]">
                  Certificado de Competencia Práctica
                </span>
                <h2 class="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {{ certificado()?.nombre || certificado()?.estudiante }}
                </h2>
                <div class="inline-flex items-center gap-2 mt-1 text-xs text-slate-500 font-semibold">
                  <span>Código Estudiantil:</span>
                  <span class="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                    {{ certificado()?.codigoEstudiantil || certificado()?.codigoInstitucional }}
                  </span>
                </div>
              </div>

              <!-- Bloque Clínico de Acreditación -->
              <div class="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed text-center sm:text-left">
                <p>
                  Certificamos que el estudiante ha completado y aprobado satisfactoriamente la simulación y evaluación de la <strong>Técnica de Lavado de Manos Clínico en 6 Pasos</strong>, conforme a los protocolos biomecánicos y los 5 Momentos estandarizados por la <strong>Organización Mundial de la Salud (OMS)</strong>.
                </p>
              </div>

              <!-- Detalles de Calificación y Fecha -->
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-[#E6FBF7] rounded-2xl p-3.5 border border-[#00B39F]/20 text-center">
                  <span class="text-[10px] font-bold uppercase text-[#008072] block">Calificación Obtenida</span>
                  <span class="text-2xl sm:text-3xl font-black text-[#008072]">
                    {{ (certificado()?.calificacion || 10).toFixed(1) }}
                    <span class="text-xs font-normal text-slate-500">/ 10</span>
                  </span>
                </div>
                <div class="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 text-center">
                  <span class="text-[10px] font-bold uppercase text-slate-500 block">Fecha de Emisión</span>
                  <span class="text-sm sm:text-base font-extrabold text-slate-800 block mt-1">
                    {{ (certificado()?.fechaEmision || certificado()?.fecha) | date:'dd/MM/yyyy' }}
                  </span>
                  <span class="text-[10px] text-slate-400">
                    {{ (certificado()?.fechaEmision || certificado()?.fecha) | date:'hh:mm a' }}
                  </span>
                </div>
              </div>

              <!-- Código Único de Verificación -->
              <div class="bg-slate-900 text-white rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                <div>
                  <span class="text-[10px] font-semibold text-slate-400 block uppercase">Código de Verificación Único</span>
                  <span class="font-mono text-xs sm:text-sm font-black text-[#50E7FF] tracking-wider select-all">
                    {{ certificado()?.codigoVerificacion || certificado()?.codigo }}
                  </span>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                  ACTIVO • ACREDITADO
                </span>
              </div>

              <!-- Botones de Acción -->
              <div class="flex flex-col sm:flex-row items-center gap-3 pt-2 print:hidden">
                <button
                  type="button"
                  (click)="imprimir()"
                  class="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-[#00B39F] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Imprimir Certificado</span>
                </button>

                <a
                  routerLink="/bienvenida"
                  class="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition text-center"
                >
                  Ir al Portal Principal
                </a>
              </div>
            </div>
          </div>
        }

        <!-- ESTADO: NO ENCONTRADO O INVÁLIDO -->
        @else {
          <div class="bg-white rounded-3xl shadow-2xl border border-red-200 p-8 text-center text-slate-800">
            <div class="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="text-xl font-bold text-slate-900 mb-2">Certificado No Encontrado</h2>
            <p class="text-xs text-slate-600 mb-4 leading-relaxed">
              El código de verificación <strong class="font-mono text-slate-900">{{ codigoUrl() }}</strong> no coincide con ningún certificado emitido en la plataforma Manos Seguras o ha sido revocado.
            </p>
            <a
              routerLink="/bienvenida"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              Volver al Inicio
            </a>
          </div>
        }

        <!-- Footer discreto -->
        <div class="text-center mt-6 text-[11px] text-slate-400">
          Plataforma de Simulación y Evaluación Clínica de Lavado de Manos • Versión 1.0.0
        </div>
      </div>
    </div>
  `,
})
export class ValidarCertificadoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly practicasService = inject(PracticasService);

  readonly codigoUrl = signal<string>('');
  readonly cargando = signal<boolean>(true);
  readonly certificadoValido = signal<boolean>(false);
  readonly certificado = signal<any | null>(null);

  ngOnInit(): void {
    const codigo = this.route.snapshot.paramMap.get('codigo') || '';
    this.codigoUrl.set(codigo);

    if (codigo) {
      this.consultarCertificado(codigo);
    } else {
      this.cargando.set(false);
      this.certificadoValido.set(false);
    }
  }

  consultarCertificado(codigo: string): void {
    this.cargando.set(true);
    this.practicasService.validarCertificado(codigo).subscribe({
      next: (res: ValidarCertificadoResponse) => {
        this.cargando.set(false);
        if (res.valido && res.certificado) {
          this.certificadoValido.set(true);
          this.certificado.set(res.certificado);
        } else {
          this.certificadoValido.set(false);
          this.certificado.set(null);
        }
      },
      error: () => {
        this.cargando.set(false);
        this.certificadoValido.set(false);
        this.certificado.set(null);
      },
    });
  }

  imprimir(): void {
    window.print();
  }
}
