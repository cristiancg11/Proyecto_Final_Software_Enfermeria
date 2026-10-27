import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HandwashStateService } from '../services/handwash-state.service';
import { AuthService } from '../../services/auth.service';

export const studentAuthGuard: CanActivateFn = () => {
  const stateService = inject(HandwashStateService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificar si ya está el estudiante en el StateService
  const student = stateService.student();
  if (student && student.fullName) {
    return true;
  }

  // 2. Verificar si hay un usuario autenticado en AuthService
  const usuario = authService.usuarioActual();
  if (usuario && usuario.nombre) {
    stateService.setStudent({
      fullName: usuario.nombre,
      studentCode: usuario.codigoEstudiantil || '',
      consent: usuario.consentimiento !== undefined ? !!usuario.consentimiento : true,
    });
    return true;
  }

  // 3. Fallback de localStorage si hubo recarga directa de página
  if (typeof window !== 'undefined') {
    const rawUser = localStorage.getItem('usuario');
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u && u.nombre) {
          stateService.setStudent({
            fullName: u.nombre,
            studentCode: u.codigoEstudiantil || '',
            consent: u.consentimiento !== undefined ? !!u.consentimiento : true,
          });
          return true;
        }
      } catch {}
    }
  }

  // Redireccionar automáticamente al login / registro si no ha iniciado sesión
  return router.createUrlTree(['/bienvenida']);
};
