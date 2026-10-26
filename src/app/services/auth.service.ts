import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Usuario {
  id: string;
  nombre: string;
  codigoEstudiantil: string;
  correo: string;
  rol: 'ESTUDIANTE' | 'DOCENTE';
  consentimiento: boolean;
  fechaRegistro?: string | Date;
}

export interface RegistroDatos {
  nombre: string;
  codigoEstudiantil: string;
  correo: string;
  password?: string;
  rol?: 'ESTUDIANTE' | 'DOCENTE';
  consentimiento?: boolean;
}

export interface LoginCredenciales {
  correo?: string;
  codigoEstudiantil?: string;
  identificador?: string;
  password?: string;
}

export interface AuthResponse {
  mensaje: string;
  usuario: Usuario;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  // Manejo de estado reactivo mediante Signals
  readonly token = signal<string | null>(this.obtenerTokenInicial());
  readonly usuarioActual = signal<Usuario | null>(this.obtenerUsuarioInicial());

  // Señales computadas de utilidad clínica
  readonly estaAutenticado = computed<boolean>(() => !!this.token());
  readonly esDocente = computed<boolean>(() => this.usuarioActual()?.rol === 'DOCENTE');
  readonly esEstudiante = computed<boolean>(() => this.usuarioActual()?.rol === 'ESTUDIANTE');

  /**
   * Registra un nuevo estudiante o docente en el backend PostgreSQL
   * POST /api/auth/registro
   */
  registro(datos: RegistroDatos): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/registro`, {
        nombre: datos.nombre.trim(),
        codigoEstudiantil: datos.codigoEstudiantil.trim(),
        correo: datos.correo.trim().toLowerCase(),
        password: datos.password || 'Estudiante2026*',
        rol: datos.rol || 'ESTUDIANTE',
        consentimiento: datos.consentimiento ?? true,
      })
      .pipe(
        tap((res) => {
          this.establecerSesion(res);
        })
      );
  }

  /**
   * Inicia sesión con correo/código y contraseña
   * POST /api/auth/login
   */
  login(credenciales: LoginCredenciales): Observable<AuthResponse> {
    const payload: LoginCredenciales = {
      password: credenciales.password || 'Estudiante2026*',
    };

    if (credenciales.correo) {
      payload.correo = credenciales.correo.trim().toLowerCase();
    }
    if (credenciales.codigoEstudiantil) {
      payload.codigoEstudiantil = credenciales.codigoEstudiantil.trim();
    }
    if (credenciales.identificador) {
      payload.identificador = credenciales.identificador.trim();
    }

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, payload)
      .pipe(
        tap((res) => {
          this.establecerSesion(res);
        })
      );
  }

  /**
   * Cierra la sesión activa, limpiando token y estado del usuario
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    this.token.set(null);
    this.usuarioActual.set(null);
  }

  /**
   * Guarda el JWT y los datos del usuario en localStorage y actualiza las Signals
   */
  private establecerSesion(res: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', res.token);
      localStorage.setItem('usuario', JSON.stringify(res.usuario));
    }
    this.token.set(res.token);
    this.usuarioActual.set(res.usuario);
  }

  private obtenerTokenInicial(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private obtenerUsuarioInicial(): Usuario | null {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('usuario');
      if (raw) {
        try {
          return JSON.parse(raw) as Usuario;
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}
