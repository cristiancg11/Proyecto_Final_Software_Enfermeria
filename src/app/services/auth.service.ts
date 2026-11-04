import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, retry, tap, throwError } from 'rxjs';

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
  user?: Usuario;
  token: string;
}

export interface ActualizarPerfilDatos {
  nombre?: string;
  correo?: string;
  passwordActual?: string;
  passwordNuevo?: string;
}

export interface ActualizarPerfilResponse {
  mensaje: string;
  user: Usuario;
  usuario: Usuario;
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
    const payload = {
      nombre: datos.nombre.trim(),
      codigoEstudiantil: datos.codigoEstudiantil.trim(),
      correo: datos.correo.trim().toLowerCase(),
      password: datos.password || 'Estudiante2026*',
      rol: datos.rol || 'ESTUDIANTE',
      consentimiento: datos.consentimiento ?? true,
    };

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/registro`, payload)
      .pipe(
        retry({ count: 2, delay: 800 }),
        catchError((err) => {
          console.error('❌ [AuthService.registro] Error al registrar usuario en el backend / Supabase:', {
            status: err?.status,
            statusText: err?.statusText,
            errorBody: err?.error,
            payloadEnviado: {
              nombre: payload.nombre,
              codigoEstudiantil: payload.codigoEstudiantil,
              correo: payload.correo,
              rol: payload.rol,
            },
          });
          return throwError(() => err);
        }),
        tap((res) => {
          const rawUser = res.usuario || res.user;
          if (rawUser) {
            this.guardarUsuarioEnDirectorioLocal(rawUser);
          }
        })
      );
  }

  /**
   * Permite al docente o administrador activo registrar un nuevo docente institucional
   * sin cerrar ni sobrescribir su propia sesión activa.
   * POST /api/auth/registro
   */
  registrarDocentePorAdmin(datos: {
    nombre: string;
    correo: string;
    password: string;
    codigoEstudiantil?: string;
  }): Observable<AuthResponse> {
    let headers = new HttpHeaders();
    const token = this.token();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/registro`,
      {
        nombre: datos.nombre.trim(),
        codigoEstudiantil:
          datos.codigoEstudiantil?.trim() || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        correo: datos.correo.trim().toLowerCase(),
        password: datos.password,
        rol: 'DOCENTE',
        consentimiento: true,
      },
      { headers }
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
        retry({ count: 2, delay: 800 }),
        catchError((err) => {
          console.error('❌ [AuthService.login] Error al autenticar usuario contra Supabase:', {
            status: err?.status,
            statusText: err?.statusText,
            errorBody: err?.error,
          });
          return throwError(() => err);
        }),
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
   * Actualiza el perfil institucional y/o contraseña del usuario autenticado
   * PUT /api/auth/perfil
   */
  actualizarPerfil(datos: ActualizarPerfilDatos): Observable<ActualizarPerfilResponse> {
    const token = this.token();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http
      .put<ActualizarPerfilResponse>(`${this.apiUrl}/auth/perfil`, datos, { headers })
      .pipe(
        tap((res) => {
          const user = res.user || res.usuario;
          if (user) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('usuario', JSON.stringify(user));
            }
            this.usuarioActual.set(user);
          }
        })
      );
  }

  /**
   * Guarda el JWT y los datos del usuario en localStorage y actualiza las Signals
   */
  private establecerSesion(res: AuthResponse): void {
    const rawUser = res.usuario || res.user;
    const user: Usuario = {
      ...rawUser,
      consentimiento: rawUser.consentimiento !== undefined ? !!rawUser.consentimiento : true,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', res.token);
      localStorage.setItem('usuario', JSON.stringify(user));
    }
    this.token.set(res.token);
    this.usuarioActual.set(user);
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

  private crearSesionRespaldoRegistro(datos: {
    nombre: string;
    codigoEstudiantil: string;
    correo: string;
    rol: 'ESTUDIANTE' | 'DOCENTE';
    consentimiento: boolean;
  }): AuthResponse {
    const usuario: Usuario = {
      id: `usr-${Date.now()}`,
      nombre: datos.nombre,
      codigoEstudiantil: datos.codigoEstudiantil,
      correo: datos.correo,
      rol: datos.rol,
      consentimiento: datos.consentimiento,
      fechaRegistro: new Date().toISOString(),
    };
    this.guardarUsuarioEnDirectorioLocal(usuario);
    return {
      mensaje: 'Registro exitoso en la plataforma Manos Seguras',
      usuario,
      user: usuario,
      token: `jwt-vercel-${Date.now()}`,
    };
  }

  private crearSesionRespaldoLogin(credenciales: LoginCredenciales): AuthResponse {
    const iden = (
      credenciales.identificador ||
      credenciales.correo ||
      credenciales.codigoEstudiantil ||
      'estudiante'
    )
      .trim()
      .toLowerCase();

    const directorio = this.obtenerDirectorioLocal();
    const encontrado = directorio.find(
      (u) =>
        u.correo.toLowerCase() === iden ||
        u.codigoEstudiantil.toLowerCase() === iden
    );

    const esDocente =
      encontrado?.rol === 'DOCENTE' ||
      iden.includes('docente') ||
      iden.includes('admin') ||
      iden === 'doc-2026';

    const usuario: Usuario = encontrado || {
      id: esDocente ? '7df1ce3a-c597-4de0-8abe-91221a55d8b3' : `est-${Date.now()}`,
      nombre: esDocente
        ? 'Docente Supervisor UCC'
        : iden.includes('@')
          ? iden.split('@')[0].replace(/[._]/g, ' ')
          : `Estudiante ${iden.toUpperCase()}`,
      codigoEstudiantil: esDocente ? 'DOC-2026' : iden.toUpperCase(),
      correo: iden.includes('@') ? iden : `${iden}@campusucc.edu.co`,
      rol: esDocente ? 'DOCENTE' : 'ESTUDIANTE',
      consentimiento: true,
      fechaRegistro: new Date().toISOString(),
    };

    return {
      mensaje: 'Autenticación exitosa',
      usuario,
      user: usuario,
      token: `jwt-vercel-${Date.now()}`,
    };
  }

  private guardarUsuarioEnDirectorioLocal(usuario: Usuario): void {
    if (typeof window === 'undefined') return;
    try {
      const lista = this.obtenerDirectorioLocal().filter(
        (u) => u.correo !== usuario.correo && u.codigoEstudiantil !== usuario.codigoEstudiantil
      );
      lista.push(usuario);
      localStorage.setItem('directorio_usuarios_manos_seguras', JSON.stringify(lista));
    } catch {}
  }

  private obtenerDirectorioLocal(): Usuario[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('directorio_usuarios_manos_seguras');
      return raw ? (JSON.parse(raw) as Usuario[]) : [];
    } catch {
      return [];
    }
  }
}
