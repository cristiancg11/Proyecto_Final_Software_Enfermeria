import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const docenteAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Re-hidratar sesión desde localStorage si las señales aún no la tienen (recarga directa de /admin)
  if (!authService.estaAutenticado() && typeof window !== 'undefined') {
    const rawToken = localStorage.getItem('token');
    const rawUser = localStorage.getItem('usuario');
    if (rawToken && rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u && u.nombre) {
          authService.token.set(rawToken);
          authService.usuarioActual.set({ ...u, rol: AuthService.normalizarRol(u.rol) });
        }
      } catch {}
    }
  }

  // Permite el acceso a usuarios autenticados con rol docente (DOCENTE / PROFESOR / ADMIN)
  if (authService.estaAutenticado() && authService.esDocente()) {
    return true;
  }

  // Un estudiante autenticado vuelve a su dashboard; sin sesión, a bienvenida
  if (authService.estaAutenticado() && authService.usuarioActual()) {
    return router.createUrlTree(['/dashboard']);
  }
  return router.createUrlTree(['/bienvenida']);
};
