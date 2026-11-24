import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HandwashStateService } from '../../core/services/handwash-state.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-6 animate-fade-in text-slate-800 p-2 sm:p-4">
      
      <!-- 1. TARJETA PRINCIPAL DEL ESTUDIANTE (LIMPIA Y DIRECTA) -->
      <div class="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <!-- Acento decorativo sutil -->
        <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600"></div>

        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left pt-2">
          
          <!-- Avatar / Inicial -->
          <div class="relative shrink-0">
            <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-600 flex items-center justify-center text-3xl sm:text-4xl text-white font-bold shadow-md shadow-sky-900/10">
              @if (avatar() && esImagenUrl(avatar())) {
                <img [src]="avatar()" [alt]="nombre()" class="w-full h-full object-cover rounded-2xl" />
              } @else {
                <span>{{ iniciales() || '🩺' }}</span>
              }
            </div>
            <span class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" title="Sesión activa"></span>
          </div>

          <!-- Información Esencial -->
          <div class="space-y-1.5 grow">
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
                {{ esDocente() ? 'Docente Supervisor' : 'Estudiante de Enfermería' }}
              </span>
              <span class="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
                UCC Pasto
              </span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {{ nombre() || 'Estudiante' }}
            </h1>

            <p class="text-sm text-slate-600 font-medium">
              {{ correo() || 'Sin correo registrado' }}
            </p>

            <div class="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span class="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-mono">
                ID: {{ codigoEstudiantil() }}
              </span>
              <span class="px-3 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-medium">
                📚 {{ semestre() }}
              </span>
              <span class="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                👥 {{ grupo() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- MENSAJES DE ESTADO / ALERTA -->
      @if (mensajeExito()) {
        <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <span>✅</span>
          <span>{{ mensajeExito() }}</span>
        </div>
      }

      @if (mensajeError()) {
        <div class="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{{ mensajeError() }}</span>
        </div>
      }

      <!-- 2. ESTADO Y AVANCE BÁSICO DEL ESTUDIANTE -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>📊</span> Estado de Avance en la Plataforma
        </h2>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <!-- Pre-Test -->
          <div class="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 text-center space-y-1">
            <span class="text-xs font-semibold text-slate-500 block">Pre-Test OMS</span>
            <span class="inline-flex items-center gap-1 text-xs font-bold" [ngClass]="pasoDesbloqueado(3) ? 'text-emerald-700' : 'text-amber-700'">
              {{ pasoDesbloqueado(3) ? '✅ Realizado' : '⏳ Pendiente' }}
            </span>
          </div>

          <!-- Práctica Guiada -->
          <div class="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 text-center space-y-1">
            <span class="text-xs font-semibold text-slate-500 block">Práctica 11 Pasos</span>
            <span class="inline-flex items-center gap-1 text-xs font-bold" [ngClass]="pasoDesbloqueado(4) ? 'text-emerald-700' : 'text-sky-700'">
              {{ pasoDesbloqueado(4) ? '✅ Realizada' : '🔄 En curso' }}
            </span>
          </div>

          <!-- Simulación IA -->
          <div class="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 text-center space-y-1">
            <span class="text-xs font-semibold text-slate-500 block">Simulación IA</span>
            <span class="inline-flex items-center gap-1 text-xs font-bold" [ngClass]="pasoDesbloqueado(4) ? 'text-emerald-700' : 'text-slate-500'">
              {{ pasoDesbloqueado(4) ? '🟢 Habilitada' : '🔒 Bloqueada' }}
            </span>
          </div>

          <!-- Post-Test -->
          <div class="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 text-center space-y-1">
            <span class="text-xs font-semibold text-slate-500 block">Post-Test OMS</span>
            <span class="inline-flex items-center gap-1 text-xs font-bold" [ngClass]="pasoDesbloqueado(6) ? 'text-emerald-700' : 'text-slate-500'">
              {{ pasoDesbloqueado(6) ? '✅ Completado' : '⏳ Pendiente' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 3. FORMULARIO BÁSICO DE EDICIÓN (OPCIONAL / COLAPSABLE) -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>✏️</span> Datos Básicos
            </h2>
            <p class="text-xs text-slate-500">Actualiza tu nombre o correo institucional si es necesario</p>
          </div>
          <button
            type="button"
            (click)="modoEdicion.set(!modoEdicion())"
            class="px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer"
            [ngClass]="modoEdicion() ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'"
          >
            {{ modoEdicion() ? 'Cancelar' : 'Modificar Datos' }}
          </button>
        </div>

        @if (modoEdicion()) {
          <form (ngSubmit)="guardarCambios()" class="space-y-4 pt-2 border-t border-slate-100 animate-fade-in">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-700">Nombre Completo</label>
                <input
                  type="text"
                  name="nombre"
                  [(ngModel)]="nombreInput"
                  required
                  minlength="3"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-700">Correo Institucional</label>
                <input
                  type="email"
                  name="correo"
                  [(ngModel)]="correoInput"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-700">Semestre</label>
                <select
                  name="semestre"
                  [(ngModel)]="semestreInput"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-teal-600"
                >
                  <option value="Semestre I">Semestre I</option>
                  <option value="Semestre II">Semestre II</option>
                  <option value="Semestre III">Semestre III</option>
                  <option value="Semestre IV">Semestre IV</option>
                  <option value="Semestre V">Semestre V</option>
                  <option value="Semestre VI">Semestre VI</option>
                  <option value="Semestre VII">Semestre VII</option>
                  <option value="Semestre VIII">Semestre VIII</option>
                  <option value="Internado Rotatorio">Internado Rotatorio</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-700">Grupo</label>
                <select
                  name="grupo"
                  [(ngModel)]="grupoInput"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-teal-600"
                >
                  <option value="Grupo A-1 • Clínica">Grupo A-1 • Clínica</option>
                  <option value="Grupo A-2 • Simulación">Grupo A-2 • Simulación</option>
                  <option value="Grupo B-1 • Clínica">Grupo B-1 • Clínica</option>
                  <option value="Grupo B-2 • Laboratorio">Grupo B-2 • Laboratorio</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                [disabled]="guardando()"
                class="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                @if (guardando()) {
                  <span class="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>Guardando...</span>
                } @else {
                  <span>💾 Guardar en Supabase</span>
                }
              </button>
            </div>
          </form>
        }
      </div>

      <!-- 4. BOTONES DE ACCIÓN PRINCIPALES -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <a
            routerLink="/dashboard"
            class="grow sm:grow-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <span>⬅️ Volver al Dashboard</span>
          </a>

          <a
            routerLink="/resultado"
            class="grow sm:grow-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <span>🏆 Ver Mis Resultados</span>
          </a>
        </div>

        <button
          type="button"
          (click)="cerrarSesion()"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <span>🚪 Cerrar Sesión</span>
        </button>
      </div>

    </div>
  `,
})
export class PerfilComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly stateService = inject(HandwashStateService);

  readonly usuarioActual = this.authService.usuarioActual;
  readonly esDocente = this.authService.esDocente;

  readonly nombre = signal<string>('');
  readonly correo = signal<string>('');
  readonly semestre = signal<string>('Semestre VII');
  readonly grupo = signal<string>('Grupo A-1 • Clínica');
  readonly avatar = signal<string>('');
  readonly codigoEstudiantil = computed(
    () => this.usuarioActual()?.codigoEstudiantil || '2026-ENF-UCC'
  );

  readonly iniciales = computed(() => {
    const n = this.nombre().trim();
    if (!n) return '🩺';
    const partes = n.split(' ').filter(Boolean);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
  });

  // Modo edición simple
  readonly modoEdicion = signal<boolean>(false);
  nombreInput = '';
  correoInput = '';
  semestreInput = 'Semestre VII';
  grupoInput = 'Grupo A-1 • Clínica';

  readonly guardando = signal<boolean>(false);
  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  ngOnInit(): void {
    const user = this.usuarioActual();
    if (user) {
      this.nombre.set(user.nombre || '');
      this.correo.set(user.correo || '');
      this.semestre.set(user.semestre || 'Semestre VII');
      this.grupo.set(user.grupo || 'Grupo A-1 • Clínica');
      this.avatar.set(user.avatar || '');

      this.nombreInput = user.nombre || '';
      this.correoInput = user.correo || '';
      this.semestreInput = user.semestre || 'Semestre VII';
      this.grupoInput = user.grupo || 'Grupo A-1 • Clínica';
    }
  }

  pasoDesbloqueado(paso: number): boolean {
    if (this.esDocente()) return true;
    return this.stateService.isStepUnlocked(paso);
  }

  esImagenUrl(str: string): boolean {
    return (
      str.startsWith('http://') ||
      str.startsWith('https://') ||
      str.startsWith('data:image/')
    );
  }

  guardarCambios(): void {
    this.mensajeExito.set(null);
    this.mensajeError.set(null);

    const nom = this.nombreInput.trim();
    const corr = this.correoInput.trim();

    if (!nom || nom.length < 3) {
      this.mensajeError.set('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    if (!corr || !corr.includes('@')) {
      this.mensajeError.set('Ingresa un correo institucional válido.');
      return;
    }

    this.guardando.set(true);

    const payload = {
      nombre: nom,
      correo: corr,
      semestre: this.semestreInput,
      grupo: this.grupoInput,
    };

    this.authService.actualizarPerfil(payload).subscribe({
      next: (res) => {
        this.guardando.set(false);
        this.nombre.set(nom);
        this.correo.set(corr);
        this.semestre.set(this.semestreInput);
        this.grupo.set(this.grupoInput);
        this.stateService.setStudent({
          fullName: nom,
          studentCode: this.codigoEstudiantil(),
          consent: true,
        });
        this.modoEdicion.set(false);
        this.mensajeExito.set('¡Tus datos han sido actualizados con éxito!');
      },
      error: (err) => {
        this.guardando.set(false);
        const errMsg =
          err?.error?.error ||
          err?.error?.message ||
          'Ocurrió un error al actualizar los datos en Supabase.';
        this.mensajeError.set(errMsg);
      },
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.stateService.resetAll();
    this.router.navigate(['/bienvenida']);
  }
}
