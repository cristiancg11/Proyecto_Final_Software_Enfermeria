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
      import('./features/inicio/inicio.component').then(
        (m) => m.InicioComponent
      ),
    title: 'Manos Seguras — Preparación para la Práctica',
  },
  {
    path: 'inicio',
    redirectTo: 'preparacion',
  },
  {
    path: 'diagnostico',
    canActivate: [studentAuthGuard],
    loadComponent: () =>
      import('./features/diagnostico/diagnostico.component').then(
        (m) => m.DiagnosticoComponent
      ),
    title: 'Manos Seguras — Diagnóstico de Bioseguridad',
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
    path: 'resultado',
    canActivate: [studentAuthGuard],
    loadComponent: () =>
      import('./features/resultado/resultado.component').then(
        (m) => m.ResultadoComponent
      ),
    title: 'Manos Seguras — Resultados y Calificación',
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
