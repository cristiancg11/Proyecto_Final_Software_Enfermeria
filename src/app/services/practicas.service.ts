import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface DetallePasoBiomecanico {
  stepNumber: number;
  stepTitle?: string;
  seconds: number;
  status: 'optimal' | 'too-fast' | 'too-slow';
  score: number;
  feedback?: string;
}

export interface PracticaEstudianteDocente {
  id: string;
  estudianteId: string;
  nombre: string;
  codigo: string;
  correo: string;
  fecha: string | Date;
  calificacion: number;
  notaPractica?: number;
  notaTeorica?: number;
  notaFinal?: number;
  aprobado: boolean;
  estado: string;
  certificado?: {
    id: string;
    codigoVerificacion: string;
    fechaEmision: string | Date;
  } | null;
  detallePasos: DetallePasoBiomecanico[] | any;
}

export interface PracticasDocenteResponse {
  total: number;
  practicas: PracticaEstudianteDocente[];
}

export interface RegistrarPracticaDto {
  calificacion?: number;
  notaPractica?: number;
  notaTeorica?: number;
  notaFinal?: number;
  aprobado?: boolean;
  detallePasosJson: any;
  usuarioId?: string;
  correo?: string;
  codigoEstudiantil?: string;
}

export interface RegistrarPracticaResponse {
  mensaje: string;
  intento: any;
  codigoCertificado: string | null;
  codigoVerificacion?: string | null;
  certificado?: {
    id: string;
    codigoVerificacion: string;
    fechaEmision: string | Date;
  } | null;
}

export interface ValidarCertificadoResponse {
  valido: boolean;
  certificado?: {
    id?: string;
    codigoVerificacion: string;
    codigo?: string;
    fechaEmision: string | Date;
    fecha?: string | Date;
    calificacion?: number;
    nombre?: string;
    estudiante?: string;
    codigoEstudiantil?: string;
    codigoInstitucional?: string;
    correo?: string;
    aprobado?: boolean;
    detallePasos?: any;
  };
  error?: string;
}

export interface InsigniaDigitalIA {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  categoria: 'excelencia' | 'tecnica' | 'progreso' | 'constancia';
  desbloqueada: boolean;
  progreso: number;
  criterio: string;
}

export interface ParticipanteRankingIA {
  posicion: number;
  aliasAnonimo: string;
  codigoAnonimizado: string;
  intentosCompletados: number;
  notaIntento1: number;
  notaIntento2: number | null;
  notaIntento3: number | null;
  notaActual: number;
  mejoraPorcentual: number;
  puntajeEsfuerzoIA: number;
  tendencia: 'ascendente' | 'estable' | 'destacado';
  insignias: string[];
  esUsuarioActual?: boolean;
}

export interface RankingProgresoIAResponse {
  generadoEn: string;
  motorIA: string;
  metricasCohorte: {
    totalEstudiantesAnalizados: number;
    promedioMejoraIntento1a3: number;
    tasaDominioPulgares: number;
    tiempoOptimoPromedioSeg: number;
  };
  rankingGrupal: ParticipanteRankingIA[];
  catalogoInsignias: InsigniaDigitalIA[];
}

export interface RegistroRetoExtremo {
  id: string;
  posicion: number;
  nombre: string;
  codigoEstudiantil: string;
  aciertos: number;
  totalPreguntas: number;
  porcentajeExito: number;
  tiempoSegundos: number;
  puntajeCompetitivo: number;
  fecha: string;
  esUsuarioActual?: boolean;
}

export interface RankingRetoExtremoResponse {
  totalParticipantes: number;
  primerLugar: RegistroRetoExtremo | null;
  ultimoLugar: RegistroRetoExtremo | null;
  ranking: RegistroRetoExtremo[];
  resultado?: RegistroRetoExtremo;
}

@Injectable({
  providedIn: 'root',
})
export class PracticasService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private get apiUrl(): string {
    return this.authService.apiUrl;
  }

  private obtenerHeadersAuth(): HttpHeaders {
    const token = this.authService.token();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * Consulta todas las prácticas de estudiantes realizadas para supervisión del docente
   * GET /api/practicas/docente
   */
  obtenerPracticasDocente(): Observable<PracticasDocenteResponse> {
    return this.http.get<PracticasDocenteResponse>(
      `${this.apiUrl}/practicas/docente`,
      { headers: this.obtenerHeadersAuth() }
    );
  }

  /**
   * Guarda el intento de práctica de lavado de manos del estudiante y genera certificado si aprueba
   * POST /api/practicas
   */
  registrarPractica(datos: RegistrarPracticaDto): Observable<RegistrarPracticaResponse> {
    return this.http.post<RegistrarPracticaResponse>(
      `${this.apiUrl}/practicas`,
      datos,
      { headers: this.obtenerHeadersAuth() }
    );
  }

  /**
   * Valida públicamente la autenticidad de un certificado emitido
   * GET /api/certificados/validar/:codigo
   */
  validarCertificado(codigo: string): Observable<ValidarCertificadoResponse> {
    const codigoLimpio = encodeURIComponent(codigo.trim());
    return this.http.get<ValidarCertificadoResponse>(
      `${this.apiUrl}/certificados/validar/${codigoLimpio}`
    );
  }

  /**
   * Obtiene el tablero de desafío contra compañeros y analítica de progresión IA
   * GET /api/ia/ranking-progreso
   */
  obtenerRankingProgresoIA(codigoEstudiantil?: string): Observable<RankingProgresoIAResponse> {
    const query = codigoEstudiantil
      ? `?codigoEstudiantil=${encodeURIComponent(codigoEstudiantil.trim())}`
      : '';
    return this.http.get<RankingProgresoIAResponse>(
      `${this.apiUrl}/ia/ranking-progreso${query}`,
      { headers: this.obtenerHeadersAuth() }
    );
  }

  /**
   * Obtiene el ranking competitivo del Modo Trivia Reto Extremo (primero y último lugar)
   * GET /api/ia/reto-extremo/ranking
   */
  obtenerRankingRetoExtremo(codigoEstudiantil?: string): Observable<RankingRetoExtremoResponse> {
    const query = codigoEstudiantil
      ? `?codigoEstudiantil=${encodeURIComponent(codigoEstudiantil.trim())}`
      : '';
    return this.http.get<RankingRetoExtremoResponse>(
      `${this.apiUrl}/ia/reto-extremo/ranking${query}`,
      { headers: this.obtenerHeadersAuth() }
    );
  }

  /**
   * Registra el resultado de la Trivia Reto Extremo y devuelve el ranking actualizado
   * POST /api/ia/reto-extremo/registrar
   */
  registrarRetoExtremo(datos: {
    nombre: string;
    codigoEstudiantil: string;
    aciertos: number;
    totalPreguntas: number;
    tiempoSegundos: number;
  }): Observable<RankingRetoExtremoResponse> {
    return this.http.post<RankingRetoExtremoResponse>(
      `${this.apiUrl}/ia/reto-extremo/registrar`,
      datos,
      { headers: this.obtenerHeadersAuth() }
    );
  }
}
