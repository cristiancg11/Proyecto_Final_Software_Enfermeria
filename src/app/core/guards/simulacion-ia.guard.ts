import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HandwashStateService } from '../services/handwash-state.service';
import { AuthService } from '../../services/auth.service';

export const simulacionIaGuard: CanActivateFn = () => {
  const stateService = inject(HandwashStateService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Los docentes siempre tienen libre acceso para supervisión
  if (authService.esDocente()) {
    return true;
  }

  // Verificar si la práctica previa (Paso 4 desbloqueado) ha sido completada
  if (!stateService.haCompletadoPracticaGuiada()) {
    router.navigate(['/practica'], {
      queryParams: { bloqueo: 'simulacion_ia' },
    });
    return false;
  }

  return true;
};
