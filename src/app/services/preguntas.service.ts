import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface OpcionEstudiante {
  id: string;
  texto: string;
  esCorrecta?: boolean;
}

export interface PreguntaEstudiante {
  id: string;
  enunciado: string;
  justificacion?: string;
  correctIndexFallback?: number;
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
  usuarioId?: string;
}

export interface RetroalimentacionPregunta {
  preguntaId: string;
  enunciado: string;
  justificacion: string;
  opcionSeleccionada: { id: string; texto: string } | null;
  opcionCorrecta: { id: string; texto: string } | null;
  esCorrecta: boolean;
}

export interface EnviarDiagnosticoResponse {
  mensaje: string;
  intentoId: string;
  tipo: 'PRE' | 'POST';
  puntaje: number;
  calificacion10?: number;
  aciertos: number;
  totalPreguntas: number;
  retroalimentacion?: RetroalimentacionPregunta[];
}

@Injectable({
  providedIn: 'root',
})
export class PreguntasService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private get apiUrl(): string {
    return this.authService.apiUrl;
  }

  // Signals reactivos para el estado del banco de preguntas
  readonly preguntasEstudiante = signal<PreguntaEstudiante[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // BANCO TÉCNICO OFICIAL DE 5 PREGUNTAS ESTANDARIZADAS OMS
  readonly bancoOficialOMS: PreguntaEstudiante[] = [
    {
      id: 'oms-1',
      enunciado: '¿Cuál es el principal objetivo del lavado de manos?',
      justificacion:
        'Prevenir la transmisión de microorganismos y evitar infecciones asociadas a la atención en salud según directrices OMS.',
      correctIndexFallback: 1,
      opciones: [
        { id: 'q1-a', texto: 'Eliminar la suciedad visible únicamente.', esCorrecta: false },
        { id: 'q1-b', texto: 'Prevenir la transmisión de microorganismos y evitar infecciones.', esCorrecta: true },
        { id: 'q1-c', texto: 'Mantener las manos hidratadas.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-2',
      enunciado: '¿Cuánto tiempo debe durar el lavado de manos con agua y jabón según la OMS?',
      justificacion:
        'La OMS estipula que el lavado de manos con agua y jabón debe durar de 40 a 60 segundos completos.',
      correctIndexFallback: 2,
      opciones: [
        { id: 'q2-a', texto: '10 a 15 segundos.', esCorrecta: false },
        { id: 'q2-b', texto: '20 a 30 segundos.', esCorrecta: false },
        { id: 'q2-c', texto: '40 a 60 segundos.', esCorrecta: true },
      ],
    },
    {
      id: 'oms-3',
      enunciado: '¿Qué zonas de las manos se deben frotar durante el lavado?',
      justificacion:
        'Se deben frotar palmas, dorsos, espacios interdigitales, pulgares, uñas y muñecas para cobertura aséptica total.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'q3-a', texto: 'Palmas, dorsos, espacios interdigitales, pulgares, uñas y muñecas.', esCorrecta: true },
        { id: 'q3-b', texto: 'Únicamente las palmas y los dedos.', esCorrecta: false },
        { id: 'q3-c', texto: 'Solamente las uñas y las muñecas.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-4',
      enunciado: '¿En qué momento es indispensable realizar la higiene de manos en la atención en salud?',
      justificacion:
        'Antes y después del contacto con el paciente, conforme a los 5 momentos estipulados por la OMS.',
      correctIndexFallback: 1,
      opciones: [
        { id: 'q4-a', texto: 'Solamente al finalizar el turno.', esCorrecta: false },
        { id: 'q4-b', texto: 'Antes y después del contacto con el paciente, según los momentos establecidos por la OMS.', esCorrecta: true },
        { id: 'q4-c', texto: 'Únicamente cuando las manos están visiblemente sucias.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-5',
      enunciado: '¿Cuál es el último paso de la técnica de lavado de manos?',
      justificacion:
        'Secar las manos con una toalla desechable y utilizarla para cerrar el grifo sin recontaminarse.',
      correctIndexFallback: 2,
      opciones: [
        { id: 'q5-a', texto: 'Cerrar el grifo directamente con las manos limpias.', esCorrecta: false },
        { id: 'q5-b', texto: 'Secar las manos con la ropa.', esCorrecta: false },
        { id: 'q5-c', texto: 'Secar las manos con una toalla desechable y utilizarla para cerrar el grifo.', esCorrecta: true },
      ],
    },
  ];

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
   * GET /api/preguntas/estudiante
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
   * CUESTIONARIO ESTANDARIZADO OMS:
   * Retorna las 5 preguntas técnicas oficiales de la OMS para evaluar en Pre-Test y Post-Test.
   */
  obtenerCincoPreguntasAleatorias(tipo: 'PRE' | 'POST'): Observable<PreguntaEstudiante[]> {
    // Clonar para asegurar inmutabilidad y opciones ordenadas
    const copia: PreguntaEstudiante[] = this.bancoOficialOMS.map((p) => ({
      ...p,
      opciones: p.opciones.map((o) => ({ ...o })),
    }));
    return of(copia);
  }

  /**
   * Lógica interna del algoritmo de selección aleatoria sin repetición consecutiva
   */
  private seleccionarPreguntasDiferentes(
    tipo: 'PRE' | 'POST',
    fuente: PreguntaEstudiante[]
  ): PreguntaEstudiante[] {
    const poolCompleto = fuente.length >= 5 ? fuente : this.bancoOficialOMS;

    // Recuperar IDs de las preguntas del intento previo del estudiante
    const storageKey = `manos_seguras_prev_${tipo}_ids`;
    let prevIds: string[] = [];
    try {
      const guardados = localStorage.getItem(storageKey);
      if (guardados) prevIds = JSON.parse(guardados);
    } catch {
      prevIds = [];
    }

    // Filtrar candidatas que NO hayan salido en el intento previo
    let candidatas = poolCompleto.filter((p) => !prevIds.includes(String(p.id)));

    // Si por alguna razón el pool no tiene al menos 5 preguntas restantes, mezclar todo el pool
    if (candidatas.length < 5) {
      candidatas = [...poolCompleto];
    }

    // Mezclar candidatas usando el algoritmo Fisher-Yates
    const barajadas = this.barajarArray([...candidatas]);

    // Tomar exactamente 5 preguntas
    const seleccionadas = barajadas.slice(0, 5);

    // Guardar los nuevos 5 IDs para evitar repetición en el siguiente intento
    try {
      localStorage.setItem(storageKey, JSON.stringify(seleccionadas.map((p) => String(p.id))));
    } catch {
      // Ignorar si localStorage está deshabilitado
    }

    // Barajar también las opciones de cada pregunta para que no se memorice la posición (A, B, C, D)
    return seleccionadas.map((p) => {
      // Buscar información adicional de justificación en el banco local si viene del backend sin ella
      const localRef = this.bancoOficialOMS.find((b) => b.enunciado === p.enunciado);
      return {
        ...p,
        justificacion: p.justificacion || localRef?.justificacion || 'Protocolo de Técnica Aséptica y 5 Momentos OMS.',
        correctIndexFallback: p.correctIndexFallback !== undefined ? p.correctIndexFallback : localRef?.correctIndexFallback,
        opciones: this.barajarArray([...p.opciones]),
      };
    });
  }

  /**
   * Algoritmo Fisher-Yates Shuffle para desordenar arrays de forma imparcial
   */
  private barajarArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
   * Envía las respuestas del test diagnóstico para calificación automática y guardado en Supabase
   * POST /api/preguntas/diagnostico
   */
  registrarDiagnostico(datos: EnviarDiagnosticoDto): Observable<EnviarDiagnosticoResponse> {
    const payload = {
      ...datos,
      usuarioId: datos.usuarioId || this.authService.usuarioActual()?.id,
    };

    return this.http.post<EnviarDiagnosticoResponse>(
      `${this.apiUrl}/preguntas/diagnostico`,
      payload,
      { headers: this.obtenerHeadersAuth() }
    );
  }

  /**
   * Elimina o desactiva una pregunta clínica (Solo Docentes)
   * DELETE /api/preguntas/:id
   */
  eliminarPregunta(id: string): Observable<{ mensaje: string; accion: string }> {
    return this.http.delete<{ mensaje: string; accion: string }>(
      `${this.apiUrl}/preguntas/${id}`,
      { headers: this.obtenerHeadersAuth() }
    );
  }
}
