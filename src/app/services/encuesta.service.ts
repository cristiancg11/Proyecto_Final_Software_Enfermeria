import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface RegistrarEncuestaDto {
  facilidadUso: number;
  utilidadGuia: number;
  claridadFeed: number;
  recomendacion: number;
  comentarios?: string | null;
  usuarioId?: string;
  codigoEstudiantil?: string;
  correo?: string;
}

export interface EncuestaDocenteItem {
  id: string;
  estudianteId: string;
  nombre: string;
  codigo: string;
  correo: string;
  facilidadUso: number;
  utilidadGuia: number;
  claridadFeed: number;
  recomendacion: number;
  promedioIndividual: number;
  comentarios?: string | null;
  fecha: string | Date;
}

export interface EncuestasDocenteResponse {
  total: number;
  promedioGeneral: number;
  promedioFacilidadUso: number;
  promedioUtilidadGuia: number;
  promedioClaridadFeed: number;
  promedioRecomendacion: number;
  encuestas: EncuestaDocenteItem[];
}

@Injectable({
  providedIn: 'root',
})
export class EncuestaService {
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
   * Registra la encuesta de satisfacción y percepción pedagógica del estudiante
   * POST /api/encuesta
   */
  enviarEncuesta(datos: RegistrarEncuestaDto): Observable<{ mensaje: string; encuesta: any }> {
    return this.http.post<{ mensaje: string; encuesta: any }>(
      `${this.apiUrl}/encuesta`,
      datos,
      { headers: this.obtenerHeadersAuth() }
    );
  }

  /**
   * Obtiene para el docente las métricas y promedios de satisfacción de la plataforma
   * GET /api/encuesta/docente
   */
  obtenerEncuestasDocente(): Observable<EncuestasDocenteResponse> {
    return this.http.get<EncuestasDocenteResponse>(
      `${this.apiUrl}/encuesta/docente`,
      { headers: this.obtenerHeadersAuth() }
    );
  }
}
