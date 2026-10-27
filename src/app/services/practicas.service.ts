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

@Injectable({
  providedIn: 'root',
})
export class PracticasService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:3000/api';

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
}
