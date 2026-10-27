import { Routes } from '@angular/router';
import { studentAuthGuard } from './core/guards/student-auth.guard';
import { docenteAuthGuard } from './core/guards/docente-auth.guard';

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
    path: 'login',
    redirectTo: 'bienvenida',
  },
  {
    path: 'admin',
    canActivate: [docenteAuthGuard],
    loadComponent: () =>
      import('./pages/admin/admin.component').then((m) => m.AdminComponent),
    title: 'Manos Seguras — Panel de Supervisión Docente',
  },
  {
    path: 'introduccion',
    canActivate: [studentAuthGuard],
    loadComponent: () =>
      import('./pages/introduccion/introduccion.component').then(
        (m) => m.IntroduccionComponent
      ),
    title: 'Manos Seguras — Introducción Clínica y Fundamentos OMS',
  },
  {
    path: 'preparacion',
    canActivate: [studentAuthGuard],
    loadComponent: () =>
      import('./pages/preparacion/preparacion.component').then(
        (m) => m.PreparacionComponent
      ),
    title: 'Manos Seguras — Preparación Previa Obligatoria',
  },
  {
    path: 'inicio',
    redirectTo: 'preparacion',
  },
  {
    path: 'practica',
    canActivate: [studentAuthGuard],
    loadComponent: () =>
      import('./features/practica/practica.component').then(
        (m) => m.PracticaComponent
      ),
    title: 'Manos Seguras — Práctica de 6 Pasos OMS',
  },
  {
    path: 'evaluacion-teorica',
    canActivate: [studentAuthGuard],
    loadComponent: () =>
      import('./pages/evaluacion-teorica/evaluacion-teorica.component').then(
        (m) => m.EvaluacionTeoricaComponent
      ),
    title: 'Manos Seguras — Evaluación Teórica Post-Práctica',
  },
  {
    path: 'diagnostico',
    redirectTo: 'evaluacion-teorica',
  },
  {
    path: 'resultado',
    canActivate: [studentAuthGuard],
    loadComponent: () =>
      import('./features/resultado/resultado.component').then(
        (m) => m.ResultadoComponent
      ),
    title: 'Manos Seguras — Resultados y Calificación',
  },
  {
    path: 'resultados',
    redirectTo: 'resultado',
  },
  {
    path: 'validar/:codigo',
    loadComponent: () =>
      import('./pages/validar-certificado/validar-certificado.component').then(
        (m) => m.ValidarCertificadoComponent
      ),
    title: 'Manos Seguras — Verificación Oficial de Certificado',
  },
  {
    path: '**',
    redirectTo: 'bienvenida',
  },
];
