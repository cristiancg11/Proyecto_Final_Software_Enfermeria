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
}
