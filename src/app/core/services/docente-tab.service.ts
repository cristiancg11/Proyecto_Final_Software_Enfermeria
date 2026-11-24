import { Injectable, signal } from '@angular/core';

export type DocentePestana = 'seguimiento' | 'practicas' | 'preguntas' | 'encuestas' | 'perfil';

@Injectable({
  providedIn: 'root',
})
export class DocenteTabService {
  readonly pestanaActiva = signal<DocentePestana>('seguimiento');

  seleccionarPestana(tab: DocentePestana): void {
    this.pestanaActiva.set(tab);
  }
}
