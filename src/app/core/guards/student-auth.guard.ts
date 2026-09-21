import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HandwashStateService } from '../services/handwash-state.service';

export const studentAuthGuard: CanActivateFn = (route, state) => {
  const stateService = inject(HandwashStateService);
  const router = inject(Router);

  const student = stateService.student();
  if (student && student.fullName && student.consent) {
    return true;
  }

  // Redireccionar automáticamente al login / registro si no ha iniciado sesión
  return router.createUrlTree(['/bienvenida']);
};
