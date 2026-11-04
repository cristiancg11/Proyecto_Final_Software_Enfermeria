import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HandwashStateService } from '../services/handwash-state.service';
import { AuthService } from '../../services/auth.service';

export const studentAuthGuard: CanActivateFn = () => {
  const stateService = inject(HandwashStateService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificar si hay sesión autenticada activa en AuthService y StateService
  const student = stateService.student();
  if (authService.estaAutenticado() && student && student.fullName) {
    return true;
  }

  // 2. Verificar si hay un usuario autenticado con token en AuthService
  const usuario = authService.usuarioActual();
  if (authService.estaAutenticado() && usuario && usuario.nombre) {
    stateService.setStudent({
      fullName: usuario.nombre,
      studentCode: usuario.codigoEstudiantil || '',
      consent: usuario.consentimiento !== undefined ? !!usuario.consentimiento : true,
    });
    return true;
  }

  // 3. Fallback de localStorage si hubo recarga directa de página con token válido
  if (typeof window !== 'undefined') {
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
          return true;
        }
      } catch {}
    }
  }

  // Redireccionar automáticamente al login / registro si no ha iniciado sesión
  return router.createUrlTree(['/bienvenida']);
};
