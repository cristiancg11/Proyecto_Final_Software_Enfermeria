import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HandwashStateService } from '../services/handwash-state.service';
import { AuthService } from '../../services/auth.service';

const STEP_BY_ROUTE: { [path: string]: number } = {
  introduccion: 1,
  preparacion: 2,
  inicio: 2,
  practica: 3,
  'evaluacion-practica': 4,
  'evaluacion-teorica': 5,
  diagnostico: 5,
  encuesta: 6,
  resultado: 7,
};

export const studentAuthGuard: CanActivateFn = (route) => {
  const stateService = inject(HandwashStateService);
  const authService = inject(AuthService);
  const router = inject(Router);

  let autenticado = false;

  // 1. Verificar si hay sesión autenticada activa en AuthService y StateService
  const student = stateService.student();
  if (authService.estaAutenticado() && student && student.fullName) {
    autenticado = true;
  }

  // 2. Verificar si hay un usuario autenticado con token en AuthService
  if (!autenticado) {
    const usuario = authService.usuarioActual();
    if (authService.estaAutenticado() && usuario && usuario.nombre) {
      stateService.setStudent({
        fullName: usuario.nombre,
        studentCode: usuario.codigoEstudiantil || '',
        consent: usuario.consentimiento !== undefined ? !!usuario.consentimiento : true,
      });
      autenticado = true;
    }
  }

  // 3. Fallback de localStorage si hubo recarga directa de página con token válido
  if (!autenticado && typeof window !== 'undefined') {
    const rawToken = localStorage.getItem('token');
    const rawUser = localStorage.getItem('usuario');
    if (rawToken && rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u && u.nombre) {
          stateService.setStudent({
            fullName: u.nombre,
            studentCode: u.codigoEstudiantil || '',
            consent: u.consentimiento !== undefined ? !!u.consentimiento : true,
          });
          autenticado = true;
        }
      } catch {}
    }
  }

  if (!autenticado) {
    router.navigate(['/bienvenida']);
    return false;
  }

  // 4. Si el estudiante o docente está autenticado, permitir acceso completo a todos los módulos clínicos y de práctica
  return true;
};
