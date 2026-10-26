import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const docenteAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Permite el acceso únicamente a usuarios autenticados con rol DOCENTE
  if (authService.estaAutenticado() && authService.esDocente()) {
    return true;
  }

  // Redirigir a bienvenida si no es docente
  return router.createUrlTree(['/bienvenida']);
};
