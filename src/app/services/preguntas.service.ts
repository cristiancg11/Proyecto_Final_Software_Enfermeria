import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface OpcionEstudiante {
  id: string;
  texto: string;
}

export interface PreguntaEstudiante {
  id: string;
  enunciado: string;
  opciones: OpcionEstudiante[];
}

export interface PreguntasEstudianteResponse {
  total: number;
  preguntas: PreguntaEstudiante[];
}

export interface OpcionDocente {
  id?: string;
  texto: string;
  esCorrecta: boolean;
  vecesElegida?: number;
}

export interface PreguntaDocente {
  id: string;
  enunciado: string;
  justificacion?: string;
  activa: boolean;
  fechaCreacion: string | Date;
  creadaPor: string;
  totalRespuestas: number;
  opciones: OpcionDocente[];
}

export interface PreguntasDocenteResponse {
  total: number;
  preguntas: PreguntaDocente[];
}

export interface NuevaOpcionPregunta {
  texto: string;
  esCorrecta: boolean;
}

export interface CrearPreguntaDto {
  enunciado: string;
  justificacion?: string;
  opciones: NuevaOpcionPregunta[];
}

export interface CrearPreguntaResponse {
  mensaje: string;
  pregunta: {
    id: string;
    enunciado: string;
    justificacion?: string;
    opciones: { id: string; texto: string; esCorrecta: boolean }[];
  };
}

export interface EnviarDiagnosticoDto {
  tipo: 'PRE' | 'POST';
  respuestas: { preguntaId: string; opcionSeleccionadaId: string }[];
}

export interface EnviarDiagnosticoResponse {
  mensaje: string;
  intentoId: string;
  tipo: 'PRE' | 'POST';
  puntaje: number;
  aciertos: number;
  totalPreguntas: number;
}

@Injectable({
  providedIn: 'root',
})
export class PreguntasService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:3000/api';

  // Signals reactivos para el estado del banco de preguntas
  readonly preguntasEstudiante = signal<PreguntaEstudiante[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Genera los encabezados con Bearer token para solicitudes autenticadas
   */
  private obtenerHeadersAuth(): HttpHeaders {
    const token = this.authService.token();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * Obtiene las preguntas clínicas para estudiantes (omitiendo esCorrecta)
   * GET /api/preguntas/estudiante (con cabecera Authorization: Bearer <token>)
   */
  obtenerPreguntasEstudiante(): Observable<PreguntasEstudianteResponse> {
    this.cargando.set(true);
    this.error.set(null);

    return this.http
      .get<PreguntasEstudianteResponse>(`${this.apiUrl}/preguntas/estudiante`, {
        headers: this.obtenerHeadersAuth(),
      })
      .pipe(
        tap({
          next: (res) => {
            this.preguntasEstudiante.set(res.preguntas || []);
            this.cargando.set(false);
          },
          error: (err) => {
            const errorMsg =
              err.error?.error || 'Error al cargar las preguntas clínicas desde el servidor.';
            this.error.set(errorMsg);
            this.cargando.set(false);
          },
        })
      );
  }

  /**
   * Crea una nueva pregunta clínica con sus opciones (exclusivo para Docente)
   * POST /api/preguntas
   */
  crearPregunta(pregunta: CrearPreguntaDto): Observable<CrearPreguntaResponse> {
    return this.http.post<CrearPreguntaResponse>(
      `${this.apiUrl}/preguntas`,
      pregunta,
      { headers: this.obtenerHeadersAuth() }
    );
  }

  /**
   * Obtiene todas las preguntas clínicas con sus respuestas correctas y estadísticas (Docente)
   * GET /api/preguntas/docente
   */
  obtenerPreguntasDocente(): Observable<PreguntasDocenteResponse> {
    return this.http.get<PreguntasDocenteResponse>(
      `${this.apiUrl}/preguntas/docente`,
      { headers: this.obtenerHeadersAuth() }
    );
  }

  /**
   * Envía las respuestas del test diagnóstico para calificación automática en backend
   * POST /api/preguntas/diagnostico
   */
  registrarDiagnostico(datos: EnviarDiagnosticoDto): Observable<EnviarDiagnosticoResponse> {
    return this.http.post<EnviarDiagnosticoResponse>(
      `${this.apiUrl}/preguntas/diagnostico`,
      datos,
      { headers: this.obtenerHeadersAuth() }
    );
  }
}
