import { Injectable, computed, signal } from '@angular/core';
import {
  DiagnosticAnswer,
  DiagnosticQuestion,
  EvaluationResult,
  HandwashStep,
  StepPaceStatus,
  StepTimeRecord,
  StudentInfo,
} from '../models/handwash.models';

@Injectable({
  providedIn: 'root',
})
export class HandwashStateService {
  // Banco de 5 Preguntas Técnicas Oficiales OMS
  private readonly clinicalQuestions: DiagnosticQuestion[] = [
    {
      id: 1,
      question: '¿Cuál es el principal objetivo del lavado de manos?',
      context: 'Protocolo de Bioseguridad OMS • Fundamentos',
      options: [
        'Eliminar la suciedad visible únicamente.',
        'Prevenir la transmisión de microorganismos y evitar infecciones.',
        'Mantener las manos hidratadas.',
      ],
      correctIndex: 1,
      rationale:
        'El objetivo principal del lavado de manos según la OMS es reducir la flora microbiana transitoria para prevenir la transmisión de microorganismos y evitar infecciones asociadas a la atención en salud.',
    },
    {
      id: 2,
      question: '¿Cuánto tiempo debe durar el lavado de manos con agua y jabón según la OMS?',
      context: 'Tiempos Normativos OMS • Lavado Clínico',
      options: [
        '10 a 15 segundos.',
        '20 a 30 segundos.',
        '40 a 60 segundos.',
      ],
      correctIndex: 2,
      rationale:
        'La OMS estipula que el procedimiento completo de lavado de manos con agua y jabón debe durar entre 40 y 60 segundos para permitir cubrir adecuadamente todas las etapas técnicas.',
    },
    {
      id: 3,
      question: '¿Qué zonas de las manos se deben frotar durante el lavado?',
      context: 'Técnica de Lavado OMS • Cobertura Anatómica',
      options: [
        'Palmas, dorsos, espacios interdigitales, pulgares, uñas y muñecas.',
        'Únicamente las palmas y los dedos.',
        'Solamente las uñas y las muñecas.',
      ],
      correctIndex: 0,
      rationale:
        'La técnica protocolaria de la OMS exige la cobertura integral de ambas manos: palmas, dorsos, espacios interdigitales, pulgares, uñas y muñecas.',
    },
    {
      id: 4,
      question: '¿En qué momento es indispensable realizar la higiene de manos en la atención en salud?',
      context: '5 Momentos OMS • Higiene Asistencial',
      options: [
        'Solamente al finalizar el turno.',
        'Antes y después del contacto con el paciente, según los momentos establecidos por la OMS.',
        'Únicamente cuando las manos están visiblemente sucias.',
      ],
      correctIndex: 1,
      rationale:
        'Es indispensable realizar la higiene antes y después del contacto con el paciente, así como en los 5 momentos establecidos por la OMS.',
    },
    {
      id: 5,
      question: '¿Cuál es el último paso de la técnica de lavado de manos?',
      context: 'Técnica de Lavado OMS • Secado y Cierre Aséptico',
      options: [
        'Cerrar el grifo directamente con las manos limpias.',
        'Secar las manos con la ropa.',
        'Secar las manos con una toalla desechable y utilizarla para cerrar el grifo.',
      ],
      correctIndex: 2,
      rationale:
        'El último paso de la técnica oficial de la OMS consiste en secar las manos con una toalla desechable y utilizarla para cerrar el grifo.',
    },
  ];

  private readonly _clinicalQuestions = signal<DiagnosticQuestion[]>(this.clinicalQuestions);

  get diagnosticQuestions(): DiagnosticQuestion[] {
    return this._clinicalQuestions();
  }

  setDiagnosticQuestions(questions: DiagnosticQuestion[]): void {
    if (questions && questions.length > 0) {
      this._clinicalQuestions.set(questions);
    }
  }

  // Official 11 steps OMS
  readonly steps: HandwashStep[] = [
    {
      id: 1,
      number: 1,
      title: 'Mojar las manos',
      titulo: 'Mojar las manos',
      subtitle: 'Colocar ambas manos debajo del chorro de agua (simulación gestual sin agua real)',
      description: 'Mojar las manos: colocar ambas manos debajo del chorro de agua. (Realiza la simulación gestual frente a la cámara sin agua real).',
      clinicalKey: 'Simulación gestual: coloca ambas manos frente al visor simulando la entrada de agua corriente sin agua real.',
      iconType: 'water',
      targetArea: 'Superficie cutánea completa de ambas manos',
      recommendedPressure: 'Flujo de agua constante y templada',
      movementPattern: 'Inmersión bajo el chorro de agua',
    },
    {
      id: 2,
      number: 2,
      title: 'Aplicar jabón',
      titulo: 'Aplicar jabón',
      subtitle: 'Depositar suficiente jabón para cubrir toda la superficie de las manos (simulación gestual)',
      description: 'Aplicar jabón: depositar suficiente jabón para cubrir toda la superficie de las manos. (Simulación gestual de dispensador frente a la cámara).',
      clinicalKey: 'Simulación gestual: ahueca una mano y presiona el dispensador imaginario sobre la palma.',
      iconType: 'soap',
      targetArea: 'Cuenco palmar y dispersión superficial',
      recommendedPressure: 'Presión sobre dispensador clínico',
      movementPattern: 'Distribución preliminar',
    },
    {
      id: 3,
      number: 3,
      title: 'Palma con palma',
      titulo: 'Palma con palma',
      subtitle: 'Frotar ambas palmas entre sí',
      description: 'Palma con palma: frotar ambas palmas entre sí.',
      clinicalKey: 'Genera fricción vigorosa y emulsión antiséptica en toda la superficie palmar.',
      iconType: 'palms',
      targetArea: 'Superficie palmar bilateral completa',
      recommendedPressure: 'Firme y homogénea',
      movementPattern: 'Fricción circular continua de 360°',
    },
    {
      id: 4,
      number: 4,
      title: 'Palma con dorso',
      titulo: 'Palma con dorso',
      subtitle: 'Frotar la palma derecha sobre el dorso de la mano izquierda, con los dedos entrelazados, y viceversa',
      description: 'Palma con dorso: frotar la palma derecha sobre el dorso de la mano izquierda, con los dedos entrelazados, y viceversa.',
      clinicalKey: 'Limpia la superficie dorsal y articulaciones metacarpianas habitualmente desatendidas.',
      iconType: 'dorsal',
      targetArea: 'Dorso cutáneo y articulaciones metacarpianas bilaterales',
      recommendedPressure: 'Firme y longitudinal',
      movementPattern: 'Deslizamiento longitudinal de vaivén',
    },
    {
      id: 5,
      number: 5,
      title: 'Palma con palma y dedos entrelazados',
      titulo: 'Palma con palma y dedos entrelazados',
      subtitle: 'Frotar ambas palmas entre sí, entrelazando los dedos',
      description: 'Palma con palma y dedos entrelazados: frotar ambas palmas entre sí, entrelazando los dedos.',
      clinicalKey: 'Remueve colonias microbianas en los pliegues y hendiduras interdigitales.',
      iconType: 'interdigital',
      targetArea: 'Pliegues y espacios interdigitales',
      recommendedPressure: 'Profunda en la comisura articular',
      movementPattern: 'Fricción en peine recíproca',
    },
    {
      id: 6,
      number: 6,
      title: 'Dorso de los dedos',
      titulo: 'Dorso de los dedos',
      subtitle: 'Frotar el dorso de los dedos contra la palma de la mano contraria, manteniendo los dedos unidos',
      description: 'Dorso de los dedos: frotar el dorso de los dedos contra la palma de la mano contraria, manteniendo los dedos unidos.',
      clinicalKey: 'Desinfecta nudillos y articulaciones interfalángicas proximales trabadas en gancho.',
      iconType: 'fingers-locked',
      targetArea: 'Nudillos y falanges dorsales en gancho',
      recommendedPressure: 'Traba firme con contrapresión palmar',
      movementPattern: 'Desplazamiento horizontal de vaivén',
    },
    {
      id: 7,
      number: 7,
      title: 'Pulgares',
      titulo: 'Pulgares',
      subtitle: 'Rodear el pulgar izquierdo con la palma derecha y frotar con movimientos circulares; repetir con el otro pulgar',
      description: 'Pulgares: rodear el pulgar izquierdo con la palma derecha y frotar con movimientos circulares; repetir con el otro pulgar.',
      clinicalKey: 'El pulgar es el dedo con mayor interacción y contacto clínico; requiere rotación completa.',
      iconType: 'thumbs',
      targetArea: 'Primer dedo (pulgar) bilateral y eminencia tenar',
      recommendedPressure: 'Envolvente circular de 360°',
      movementPattern: 'Rotación axial de puño cerrado',
    },
    {
      id: 8,
      number: 8,
      title: 'Yemas de los dedos',
      titulo: 'Yemas de los dedos',
      subtitle: 'Frotar las yemas de los dedos de una mano contra la palma de la otra, realizando movimientos circulares. Repetir con la otra mano',
      description: 'Yemas de los dedos: frotar las yemas de los dedos de una mano contra la palma de la otra, realizando movimientos circulares. Repetir con la otra mano.',
      clinicalKey: 'La zona subungueal y pulpejos acumula la mayor densidad bacteriana; se limpia con rotación concéntrica.',
      iconType: 'nails',
      targetArea: 'Lechos ungueales, pulpejos y cuenco palmar',
      recommendedPressure: 'Cónica y concentrada sobre la palma',
      movementPattern: 'Rotación concéntrica en espiral',
    },
    {
      id: 9,
      number: 9,
      title: 'Enjuagar',
      titulo: 'Enjuagar',
      subtitle: 'Colocar ambas manos debajo del agua para retirar completamente el jabón (simulación gestual sin agua real)',
      description: 'Enjuagar: colocar ambas manos debajo del agua para retirar completamente el jabón. (Simulación gestual sin agua real frente a la cámara).',
      clinicalKey: 'Simulación gestual: coloca ambas manos hacia abajo simulando el arrastre de agua corriente sin agua real.',
      iconType: 'rinse',
      targetArea: 'Manos completas y muñecas',
      recommendedPressure: 'Flujo abundante de agua corriente',
      movementPattern: 'Arrastre de muñecas hacia puntas de dedos',
    },
    {
      id: 10,
      number: 10,
      title: 'Secar',
      titulo: 'Secar',
      subtitle: 'Secar las manos con una toalla desechable (simulación gestual)',
      description: 'Secar: secar las manos con una toalla desechable. (Simulación gestual de toques secantes frente a la cámara).',
      clinicalKey: 'Simulación gestual: realiza toques suaves sobre palmas y dorsos simulando la toalla desechable.',
      iconType: 'dry',
      targetArea: 'Superficie cutánea bilateral',
      recommendedPressure: 'Toques suaves sin frotar bruscamente',
      movementPattern: 'Palpación secante de distal a proximal',
    },
    {
      id: 11,
      number: 11,
      title: 'Cerrar el grifo',
      titulo: 'Cerrar el grifo',
      subtitle: 'Utilizar la misma toalla desechable para cerrar la llave del agua (simulación gestual)',
      description: 'Cerrar el grifo: utilizar la misma toalla desechable para cerrar la llave del agua. (Simulación gestual de cierre de grifo con toalla).',
      clinicalKey: 'Simulación gestual: simula accionar la manija del grifo interponiendo la toalla desechable imaginaria.',
      iconType: 'faucet',
      targetArea: 'Toalla desechable interpuesta en la manija',
      recommendedPressure: 'Cierre firme interponiendo papel',
      movementPattern: 'Cierre de válvula sin contacto dérmico directo',
    },
  ];

  // State Signals
  private readonly _student = signal<StudentInfo | null>(null);
  private readonly _diagnosticAnswers = signal<{ [questionId: string | number]: number }>({});
  private readonly _backendScore = signal<number | null>(null);
  private readonly _stepRecords = signal<StepTimeRecord[]>([]);
  private readonly _notaTeorica = signal<number>(0);
  private readonly _retroalimentacionTeorica = signal<any[]>([]);
  private readonly _maxUnlockedStep = signal<number>(this.obtenerPasoMaximoInicial());

  constructor() {
    if (typeof window !== 'undefined') {
      const rawUser = localStorage.getItem('usuario');
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser);
          if (user && user.nombre) {
            this._student.set({
              fullName: user.nombre,
              studentCode: user.codigoEstudiantil || '',
              consent: user.consentimiento !== undefined ? !!user.consentimiento : true,
              registeredAt: new Date(),
            });
          }
        } catch {}
      }
    }
  }

  // Public readonly accessors
  readonly student = this._student.asReadonly();
  readonly diagnosticAnswers = this._diagnosticAnswers.asReadonly();
  readonly stepRecords = this._stepRecords.asReadonly();
  readonly notaTeoricaSignal = this._notaTeorica.asReadonly();
  readonly retroalimentacionTeorica = this._retroalimentacionTeorica.asReadonly();
  readonly maxUnlockedStep = this._maxUnlockedStep.asReadonly();

  // Diagnostics completion signal
  readonly isDiagnosticComplete = computed(() => {
    const answers = this._diagnosticAnswers();
    return this.diagnosticQuestions.every((q) => answers[q.id] !== undefined);
  });

  // Diagnostic Quiz Score computed (usa score del backend si fue calificado allí, o aciertos locales)
  readonly diagnosticScore = computed(() => {
    if (this._backendScore() !== null) {
      return this._backendScore()!;
    }
    const answers = this._diagnosticAnswers();
    let correctCount = 0;
    this.diagnosticQuestions.forEach((q) => {
      if (q.correctIndex !== undefined && answers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });
    return correctCount;
  });

  // Evaluation computation con consolidación de Nota Práctica + Nota Teórica
  readonly evaluationResult = computed<EvaluationResult>(() => {
    const student = this._student();
    const records = this._stepRecords();
    const quizScore = this.diagnosticScore();

    const sumScores = records.reduce((acc, r) => acc + r.score, 0);
    const notaPractica = Math.min(10, Math.max(0, Math.round(sumScores * 10) / 10));
    const notaTeorica = this._notaTeorica();

    // Promedio ponderado: 60% práctica con cámara + 40% cuestionario teórico
    const notaFinal = records.length > 0
      ? Math.round(((notaPractica * 0.6) + (notaTeorica * 0.4)) * 10) / 10
      : notaTeorica;

    const totalSeconds = records.reduce((acc, r) => acc + r.seconds, 0);

    let performanceLevel: 'excellent' | 'good' | 'needs-practice' = 'needs-practice';
    let performanceTitle = 'Requiere Refuerzo Práctico';
    let performanceDescription =
      'Es fundamental practicar manteniendo un ritmo controlado. El rango ideal para cada movimiento es de 3 a 8 segundos para asegurar una adecuada desinfección sin apresuramientos.';

    if (notaFinal >= 8.5) {
      performanceLevel = 'excellent';
      performanceTitle = '¡Excelente Competencia Clínica!';
      performanceDescription =
        'Has demostrado un dominio sobresaliente de la biomecánica, tiempos OMS y los fundamentos teóricos de bioseguridad.';
    } else if (notaFinal >= 6.0) {
      performanceLevel = 'good';
      performanceTitle = 'Buen Desempeño Clínico';
      performanceDescription =
        'Tu técnica y conocimientos son seguros y cumplen con los estándares asistenciales hospitalarios.';
    }

    return {
      student,
      overallScore: notaFinal,
      notaPractica,
      notaTeorica,
      notaFinal,
      totalSeconds: Math.round(totalSeconds * 10) / 10,
      records,
      performanceLevel,
      performanceTitle,
      performanceDescription,
      quizScore,
      totalQuizQuestions: this.diagnosticQuestions.length,
      retroalimentacionTeorica: this._retroalimentacionTeorica(),
    };
  });

  // State Mutators
  setStudent(student: StudentInfo): void {
    this._diagnosticAnswers.set({});
    this._student.set({
      ...student,
      registeredAt: new Date(),
    });
  }

  setDiagnosticAnswer(questionId: string | number, optionIndex: number): void {
    this._diagnosticAnswers.update((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  }

  setBackendScore(score: number): void {
    this._backendScore.set(score);
  }


  recordStepTime(stepNumber: number, seconds: number): StepTimeRecord {
    const step = this.steps.find((s) => s.number === stepNumber);
    const title = step ? step.title : `Paso ${stepNumber}`;

    // Max score per step is 10 / 6 = 1.6667
    const maxStepScore = 10 / (this.steps.length || 11);
    let score = maxStepScore;
    let status: StepPaceStatus = 'optimal';
    let feedback = '';

    const roundedSeconds = Math.round(seconds * 10) / 10;

    if (roundedSeconds >= 3.0 && roundedSeconds <= 8.0) {
      status = 'optimal';
      score = maxStepScore;
      feedback =
        '¡Tiempo ideal! Permite adecuada fricción mecánica y distribución del antiséptico.';
    } else if (roundedSeconds < 3.0) {
      status = 'too-fast';
      // Scaled down score for being too fast
      const factor = Math.max(0.25, roundedSeconds / 3.0);
      score = Number((maxStepScore * factor * 0.75).toFixed(2));
      feedback = `Demasiado rápido (${roundedSeconds}s). Dedica al menos 3 a 5 segundos para remover la flora transitoria.`;
    } else {
      status = 'too-slow';
      // Too slow (> 8s): minor penalty to keep clinic efficiency
      const overTime = roundedSeconds - 8.0;
      const penalty = Math.min(0.8, overTime * 0.12);
      score = Number(Math.max(0.6, maxStepScore - penalty).toFixed(2));
      feedback = `Tiempo prolongado (${roundedSeconds}s). En atención hospitalaria es clave mantener fluidez sin extender innecesariamente el procedimiento.`;
    }

    const record: StepTimeRecord = {
      stepNumber,
      stepTitle: title,
      seconds: roundedSeconds,
      status,
      score,
      feedback,
    };

    this._stepRecords.update((records) => {
      const filtered = records.filter((r) => r.stepNumber !== stepNumber);
      return [...filtered, record].sort((a, b) => a.stepNumber - b.stepNumber);
    });

    return record;
  }

  setEvaluacionTeorica(nota: number, retro: any[] = []): void {
    this._notaTeorica.set(nota);
    this._retroalimentacionTeorica.set(retro);
  }

  resetPractice(): void {
    this._stepRecords.set([]);
  }

  unlockStep(step: number): void {
    const next = Math.max(this._maxUnlockedStep(), Math.min(this.steps.length + 1, Math.max(1, step)));
    this._maxUnlockedStep.set(next);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('manos_seguras_max_step', String(next));
    }
  }

  marcarPracticaGuiadaCompletada(): void {
    this.unlockStep(4);
    if (typeof window !== 'undefined') {
      const code = this._student()?.studentCode || '';
      if (code) {
        localStorage.setItem(`manos_seguras_practica_completada_${code}`, 'true');
      }
      sessionStorage.setItem('manos_seguras_practica_completada', 'true');
    }
  }

  haCompletadoPracticaGuiada(): boolean {
    if (this._maxUnlockedStep() >= 4) {
      return true;
    }
    if (typeof window !== 'undefined') {
      const code = this._student()?.studentCode || '';
      if (code && localStorage.getItem(`manos_seguras_practica_completada_${code}`) === 'true') {
        return true;
      }
      if (sessionStorage.getItem('manos_seguras_practica_completada') === 'true') {
        return true;
      }
    }
    return false;
  }

  resetProgressToStepOne(): void {
    this._maxUnlockedStep.set(1);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('manos_seguras_max_step', '1');
      sessionStorage.removeItem('manos_seguras_practica_completada');
    }
  }

  isStepUnlocked(step: number): boolean {
    return this._maxUnlockedStep() >= step;
  }

  getRouteForStep(step: number): string {
    const routes: { [key: number]: string } = {
      1: '/introduccion',
      2: '/preparacion',
      3: '/practica',
      4: '/evaluacion-practica',
      5: '/evaluacion-teorica',
      6: '/encuesta',
      7: '/resultado',
    };
    return routes[step] || '/introduccion';
  }

  private obtenerPasoMaximoInicial(): number {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('manos_seguras_max_step');
      const parsed = saved ? parseInt(saved, 10) : 1;
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 7) {
        return parsed;
      }
    }
    return 1;
  }

  resetAll(): void {
    this._student.set(null);
    this._diagnosticAnswers.set({});
    this._stepRecords.set([]);
    this._notaTeorica.set(0);
    this._retroalimentacionTeorica.set([]);
    this._maxUnlockedStep.set(1);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('manos_seguras_max_step');
    }
  }
}
