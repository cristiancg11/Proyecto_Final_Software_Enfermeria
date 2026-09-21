import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'bienvenida',
  },
  {
    path: 'bienvenida',
    loadComponent: () =>
      import('./features/bienvenida/bienvenida.component').then(
        (m) => m.BienvenidaComponent
      ),
    title: 'Manos Seguras — Registro y Consentimiento',
  },
  {
    path: 'diagnostico',
    loadComponent: () =>
      import('./features/diagnostico/diagnostico.component').then(
        (m) => m.DiagnosticoComponent
      ),
    title: 'Manos Seguras — Diagnóstico de Bioseguridad',
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./features/inicio/inicio.component').then(
        (m) => m.InicioComponent
      ),
    title: 'Manos Seguras — Preparación para la Práctica',
  },
  {
    path: 'practica',
    loadComponent: () =>
      import('./features/practica/practica.component').then(
        (m) => m.PracticaComponent
      ),
    title: 'Manos Seguras — Práctica de 6 Pasos OMS',
  },
  {
    path: 'resultado',
    loadComponent: () =>
      import('./features/resultado/resultado.component').then(
        (m) => m.ResultadoComponent
      ),
    title: 'Manos Seguras — Resultados y Calificación',
  },
  {
    path: '**',
    redirectTo: 'bienvenida',
  },
];
