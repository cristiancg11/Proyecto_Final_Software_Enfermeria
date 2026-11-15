import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HandwashStateService } from '../../core/services/handwash-state.service';

export interface AvatarPreset {
  id: string;
  nombre: string;
  icono: string;
  gradiente: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in text-slate-100">
      
      <!-- 1. ENCABEZADO DE PERFIL ACADÉMICO -->
      <div class="relative bg-gradient-to-br from-[#0B192C] via-[#0F2942] to-[#0D3B3E] rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-teal-500/30 shadow-[0_20px_50px_-12px_rgba(7,17,30,0.6)] overflow-hidden">
        <!-- Efectos lumínicos clínicos -->
        <div class="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-teal-500/15 blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-sky-500/15 blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
          
          <!-- Avatar Principal con Indicador de Estado -->
          <div class="relative group">
            <div
              class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-600 p-1 shadow-2xl flex items-center justify-center shrink-0 border-2 border-teal-300/40"
            >
              @if (avatarSeleccionado() && esImagenUrl(avatarSeleccionado())) {
                <img
                  [src]="avatarSeleccionado()"
                  [alt]="nombre()"
                  class="w-full h-full object-cover rounded-[22px]"
                />
              } @else {
                <div class="w-full h-full bg-[#080B10] rounded-[22px] flex items-center justify-center text-4xl sm:text-5xl select-none">
                  {{ avatarSeleccionado() || '🩺' }}
                </div>
              }
            </div>
            <span
              class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-3 border-[#0B192C] shadow-sm animate-pulse"
              title="Usuario activo en plataforma"
            ></span>
          </div>

          <!-- Información Principal -->
          <div class="space-y-1.5 grow">
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-bold uppercase tracking-wider">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{{ esDocente() ? 'Docente Supervisor' : 'Estudiante de Enfermería' }}</span>
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                UCC Pasto
              </span>
            </div>

            <h1 class="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {{ nombre() }}
            </h1>

            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
              <span class="flex items-center gap-1 text-teal-300 font-semibold">
                <span>📚</span> {{ semestre() }}
              </span>
              <span>•</span>
              <span class="flex items-center gap-1 text-slate-300">
                <span>👥</span> {{ grupo() }}
              </span>
              <span>•</span>
              <span class="font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-800">
                ID: {{ codigoEstudiantil() }}
              </span>
            </div>

            <p class="text-xs text-slate-400 pt-1">
              {{ correo() }}
            </p>
          </div>

          <!-- Botón de Acceso a Resultados/Certificado -->
          <div class="shrink-0 self-center sm:self-auto">
            <a
              routerLink="/resultado"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-teal-300 hover:text-white border border-teal-500/40 text-xs font-bold shadow-md transition-all duration-300 cursor-pointer"
            >
              <span>🏆 Ver Calificaciones</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Alertas de Éxito / Error -->
      @if (mensajeExito()) {
        <div class="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-fade-in shadow-lg">
          <span class="text-lg">✅</span>
          <span>{{ mensajeExito() }}</span>
        </div>
      }

      @if (mensajeError()) {
        <div class="p-4 rounded-2xl bg-rose-950/80 border border-rose-400/50 text-rose-200 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-fade-in shadow-lg">
          <span class="text-lg">⚠️</span>
          <span>{{ mensajeError() }}</span>
        </div>
      }

      <!-- 2. SELECCIÓN DE AVATAR CLÍNICO -->
      <div class="bg-[#0B192C]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-700/60 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div>
            <h2 class="font-heading text-lg font-bold text-white flex items-center gap-2">
              <span>🎭</span> Avatar y Foto de Perfil
            </h2>
            <p class="text-xs text-slate-400">
              Selecciona un avatar médico oficial o carga una foto personalizada
            </p>
          </div>
          <span class="text-[11px] text-teal-400 font-semibold hidden sm:inline">8 Avatares Disponibles</span>
        </div>

        <!-- Galería de Avatares Clínicos -->
        <div class="grid grid-cols-4 sm:grid-cols-8 gap-2.5 sm:gap-3">
          @for (preset of avataresPreset; track preset.id) {
            <button
              type="button"
              (click)="seleccionarPreset(preset)"
              class="flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 cursor-pointer group active:scale-95"
              [ngClass]="avatarSeleccionado() === preset.icono
                ? 'bg-teal-500/25 border-teal-400 ring-2 ring-teal-400/40 shadow-md shadow-teal-950/50 scale-105'
                : 'bg-slate-900/70 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'"
              [title]="preset.nombre"
            >
              <span class="text-2xl sm:text-3xl mb-1 group-hover:scale-110 transition-transform">
                {{ preset.icono }}
              </span>
              <span class="text-[10px] text-slate-300 truncate w-full text-center font-medium">
                {{ preset.nombre }}
              </span>
            </button>
          }
        </div>

        <!-- Carga de Foto Personalizada / URL -->
        <div class="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <div class="w-full sm:grow relative">
            <input
              type="text"
              [(ngModel)]="urlFotoInput"
              (input)="aplicarUrlFoto()"
              placeholder="O ingresa la URL de tu foto de perfil (https://...)"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
            />
          </div>

          <label
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold cursor-pointer transition-all shrink-0"
          >
            <span>📁 Subir desde dispositivo</span>
            <input
              type="file"
              accept="image/*"
              class="hidden"
              (change)="onArchivoSeleccionado($event)"
            />
          </label>
        </div>
      </div>

      <!-- 3. FORMULARIO DE DATOS PERSONALES -->
      <form (ngSubmit)="guardarCambios()" class="bg-[#0B192C]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-700/60 shadow-xl space-y-6">
        
        <div class="border-b border-slate-700/60 pb-3">
          <h2 class="font-heading text-lg font-bold text-white flex items-center gap-2">
            <span>📝</span> Datos Académicos del Usuario
          </h2>
          <p class="text-xs text-slate-400">
            Actualiza tu información personal persistente en Supabase y la plataforma institucional
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <!-- Nombre Completo -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>Nombre Completo</span>
              <span class="text-teal-400">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              [(ngModel)]="nombre"
              required
              minlength="3"
              class="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
              placeholder="Ej. Juan Pérez Gómez"
            />
          </div>

          <!-- Correo Electrónico Institucional -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>Correo Institucional</span>
              <span class="text-teal-400">*</span>
            </label>
            <input
              type="email"
              name="correo"
              [(ngModel)]="correo"
              required
              class="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
              placeholder="estudiante@campusucc.edu.co"
            />
          </div>

          <!-- Semestre Académico -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300">
              Semestre Académico
            </label>
            <select
              name="semestre"
              [(ngModel)]="semestre"
              class="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
            >
              <option value="Semestre I">Semestre I • Fundamentos de Enfermería</option>
              <option value="Semestre II">Semestre II • Procedimientos Básicos</option>
              <option value="Semestre III">Semestre III • Farmacología y Asepsia</option>
              <option value="Semestre IV">Semestre IV • Cuidado Médico-Quirúrgico</option>
              <option value="Semestre V">Semestre V • Salud Comunitaria</option>
              <option value="Semestre VI">Semestre VI • Materno Infantil</option>
              <option value="Semestre VII">Semestre VII • Práctica Clínica Hospitalaria</option>
              <option value="Semestre VIII">Semestre VIII • Urgencias y UCI</option>
              <option value="Internado Rotatorio">Internado Rotatorio de Enfermería</option>
            </select>
          </div>

          <!-- Grupo / Sección Clínica -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300">
              Grupo / Sección Clínica
            </label>
            <select
              name="grupo"
              [(ngModel)]="grupo"
              class="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
            >
              <option value="Grupo A-1 • Clínica">Grupo A-1 • Clínica Matutina</option>
              <option value="Grupo A-2 • Simulación">Grupo A-2 • Simulación Hospitalaria</option>
              <option value="Grupo B-1 • Clínica">Grupo B-1 • Clínica Vespertina</option>
              <option value="Grupo B-2 • Laboratorio">Grupo B-2 • Laboratorio de Destrezas</option>
              <option value="Grupo C • Hospital Universitario">Grupo C • Hospital Universitario</option>
            </select>
          </div>

          <!-- Código Estudiantil (Protegido / Solo lectura) -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Código Estudiantil Institucional</span>
              <span class="text-[10px] text-slate-400">🔒 Vinculado a Supabase</span>
            </label>
            <input
              type="text"
              [value]="codigoEstudiantil()"
              disabled
              class="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-400 font-mono cursor-not-allowed select-none"
            />
          </div>

          <!-- Rol Universitario (Protegido) -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Rol Institucional</span>
              <span class="text-[10px] text-slate-400">Verificado</span>
            </label>
            <input
              type="text"
              [value]="esDocente() ? 'Docente / Instructor Clínico' : 'Estudiante de Pregrado'"
              disabled
              class="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-400 cursor-not-allowed select-none"
            />
          </div>
        </div>

        <!-- 4. CAMBIO DE CONTRASEÑA (OPCIONAL) -->
        <div class="pt-4 border-t border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <span>🔐</span> Seguridad y Cambio de Contraseña
              </h3>
              <p class="text-[11px] text-slate-400">
                Deja estos campos en blanco si no deseas cambiar tu contraseña actual
              </p>
            </div>
            <button
              type="button"
              (click)="mostrarCambioPassword.set(!mostrarCambioPassword())"
              class="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
            >
              {{ mostrarCambioPassword() ? 'Ocultar campos' : 'Modificar contraseña' }}
            </button>
          </div>

          @if (mostrarCambioPassword()) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-300">Contraseña Actual</label>
                <input
                  type="password"
                  name="passwordActual"
                  [(ngModel)]="passwordActual"
                  placeholder="Tu contraseña actual"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-300">Nueva Contraseña (mínimo 6 caracteres)</label>
                <input
                  type="password"
                  name="passwordNuevo"
                  [(ngModel)]="passwordNuevo"
                  placeholder="Nueva contraseña segura"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
          }
        </div>

        <!-- Botones de Acción -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <a
            routerLink="/dashboard"
            class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Cancelar
          </a>

          <button
            type="submit"
            [disabled]="guardando()"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-950/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            @if (guardando()) {
              <span class="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
              <span>Guardando en Supabase...</span>
            } @else {
              <span>💾 Guardar Cambios</span>
            }
          </button>
        </div>
      </form>
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
  readonly codigoEstudiantil = computed(
    () => this.usuarioActual()?.codigoEstudiantil || '2026-ENF-UCC'
  );

  readonly avatarSeleccionado = signal<string>('🩺');
  readonly urlFotoInput = signal<string>('');
  readonly mostrarCambioPassword = signal<boolean>(false);
  readonly passwordActual = signal<string>('');
  readonly passwordNuevo = signal<string>('');

  readonly guardando = signal<boolean>(false);
  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  readonly avataresPreset: AvatarPreset[] = [
    { id: '1', nombre: 'Clínico', icono: '👨‍⚕️', gradiente: 'from-teal-500 to-emerald-600' },
    { id: '2', nombre: 'Clínica', icono: '👩‍⚕️', gradiente: 'from-teal-500 to-sky-600' },
    { id: '3', nombre: 'Asepsia', icono: '🩺', gradiente: 'from-emerald-500 to-teal-700' },
    { id: '4', nombre: 'Quirúrgico', icono: '😷', gradiente: 'from-sky-500 to-blue-700' },
    { id: '5', nombre: 'Hospital', icono: '🏥', gradiente: 'from-indigo-500 to-purple-600' },
    { id: '6', nombre: 'Guantes', icono: '🧤', gradiente: 'from-teal-400 to-cyan-600' },
    { id: '7', nombre: 'Escudo', icono: '🛡️', gradiente: 'from-amber-400 to-emerald-600' },
    { id: '8', nombre: 'Ciencia', icono: '🔬', gradiente: 'from-rose-500 to-teal-600' },
  ];

  ngOnInit(): void {
    const user = this.usuarioActual();
    if (user) {
      this.nombre.set(user.nombre || '');
      this.correo.set(user.correo || '');
      this.semestre.set(user.semestre || 'Semestre VII');
      this.grupo.set(user.grupo || 'Grupo A-1 • Clínica');
      if (user.avatar) {
        this.avatarSeleccionado.set(user.avatar);
        if (this.esImagenUrl(user.avatar)) {
          this.urlFotoInput.set(user.avatar);
        }
      }
    }
  }

  seleccionarPreset(preset: AvatarPreset): void {
    this.avatarSeleccionado.set(preset.icono);
    this.urlFotoInput.set('');
  }

  aplicarUrlFoto(): void {
    const url = this.urlFotoInput().trim();
    if (url && this.esImagenUrl(url)) {
      this.avatarSeleccionado.set(url);
    }
  }

  esImagenUrl(str: string): boolean {
    return (
      str.startsWith('http://') ||
      str.startsWith('https://') ||
      str.startsWith('data:image/')
    );
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.mensajeError.set('Por favor selecciona un archivo de imagen válido.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.mensajeError.set('La imagen no debe superar los 2MB de tamaño.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (base64) {
          this.avatarSeleccionado.set(base64);
          this.urlFotoInput.set(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  guardarCambios(): void {
    this.mensajeExito.set(null);
    this.mensajeError.set(null);

    const nombreVal = this.nombre().trim();
    const correoVal = this.correo().trim();

    if (!nombreVal || nombreVal.length < 3) {
      this.mensajeError.set('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    if (!correoVal || !correoVal.includes('@')) {
      this.mensajeError.set('Ingresa un correo electrónico institucional válido.');
      return;
    }

    this.guardando.set(true);

    const payload: any = {
      nombre: nombreVal,
      correo: correoVal,
      semestre: this.semestre(),
      grupo: this.grupo(),
      avatar: this.avatarSeleccionado(),
    };

    if (this.mostrarCambioPassword() && this.passwordNuevo()) {
      if (!this.passwordActual()) {
        this.guardando.set(false);
        this.mensajeError.set('Ingresa tu contraseña actual para confirmar el cambio.');
        return;
      }
      payload.passwordActual = this.passwordActual();
      payload.passwordNuevo = this.passwordNuevo();
    }

    this.authService.actualizarPerfil(payload).subscribe({
      next: (res) => {
        this.guardando.set(false);
        this.mensajeExito.set(res.mensaje || '¡Tus datos de perfil han sido actualizados con éxito!');
        // Actualizar datos del estudiante en stateService para certificados y evaluación
        this.stateService.setStudent({
          fullName: nombreVal,
          studentCode: this.codigoEstudiantil(),
          consent: true,
        });
        this.passwordActual.set('');
        this.passwordNuevo.set('');
        this.mostrarCambioPassword.set(false);
      },
      error: (err) => {
        this.guardando.set(false);
        const errMsg =
          err?.error?.error ||
          err?.error?.message ||
          'Ocurrió un error al actualizar los datos en Supabase. Inténtalo nuevamente.';
        this.mensajeError.set(errMsg);
      },
    });
  }
}
