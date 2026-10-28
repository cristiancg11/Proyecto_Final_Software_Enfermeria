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
  // Banco de 5 Preguntas Clínicas Estandarizadas OMS
  private readonly clinicalQuestions: DiagnosticQuestion[] = [
    {
      id: 1,
      question:
        'Caso Clínico 1: El profesional de enfermería ingresa a la unidad de un paciente hospitalizado para valorar signos vitales y realizar exploración física rutinaria cardiopulmonar. El paciente no presenta heridas abiertas ni drenajes activos. De acuerdo con los 5 Momentos de la OMS, ¿cuál es la indicación aséptica obligatoria antes de tocar al paciente?',
      context: '5 Momentos OMS • Momento 1 (Antes del Contacto)',
      options: [
        'Efectuar fricción antiséptica con solución hidroalcohólica inmediatamente antes del contacto (Momento 1), protegiendo al paciente de patógenos del entorno asistencial.',
        'Colocarse guantes de procedimiento limpios de forma directa sin higiene de manos previa, al tratarse de un examen no invasivo.',
        'Realizar la higiene de manos únicamente al finalizar la valoración completa (Momento 4), ya que el paciente no tiene aislamiento.',
        'Omitir la higiene si las manos lucen visiblemente limpias y desinfectar exclusivamente las olivas del fonendoscopio con alcohol.',
      ],
      correctIndex: 0,
      rationale:
        'Según la estrategia de los 5 Momentos de la OMS, el Momento 1 ("Antes del contacto con el paciente") es imperativo inmediatamente antes de cualquier examen físico, palpación o toma de signos vitales. Su propósito primordial es proteger al paciente de la colonización cruzada por microorganismos exógenos transportados transitoriamente en las manos del personal asistencial.',
    },
    {
      id: 2,
      question:
        'Caso Clínico 2: Se programa la canalización de un catéter venoso periférico en el antebrazo de un paciente para terapia antibiótica. El enfermero preparó la bandeja con los insumos estériles y seleccionó el trayecto venoso. Conforme al protocolo de técnica aséptica y el Momento 2 de la OMS, ¿cuál es la conducta adecuada previa a la punción?',
      context: '5 Momentos OMS • Momento 2 (Tarea Aséptica)',
      options: [
        'Realizar higiene de manos antiséptica inmediatamente antes de manipular insumos estériles y puncionar el acceso vascular (Momento 2), y posteriormente colocarse los guantes.',
        'Realizar la higiene únicamente al culminar la venopunción y asegurar el apósito transparente sobre el sitio de inserción.',
        'Confiar exclusivamente en el uso de guantes estériles, puesto que la higiene previa se considera redundante con material estéril.',
        'Solo higienizarse las manos si se produce sangrado accidental durante la inserción del teflón intravascular.',
      ],
      correctIndex: 0,
      rationale:
        'El Momento 2 de la OMS ("Antes de realizar una tarea limpia o aséptica") previene la inoculación de microorganismos directamente al torrente sanguíneo o tejidos estériles. Debe ejecutarse inmediatamente antes del procedimiento (mediante fricción con base alcohólica si las manos no tienen suciedad visible) y previo a calzarse los guantes, ya que estos no sustituyen la higiene previa ni son barrera infranqueable frente a microperforaciones.',
    },
    {
      id: 3,
      question:
        'Caso Clínico 3: Un enfermero finaliza el vaciado y medición de la orina de un catéter vesical cerrado utilizando guantes de examen limpios. Al retirar los guantes mediante la técnica pico-guante sin rozar la superficie externa contaminada, ¿cuál es la conducta mandatoria según las normas de bioseguridad hospitalaria?',
      context: '5 Momentos OMS • Momento 3 (Exposición a Fluidos y Retiro de Guantes)',
      options: [
        'Realizar higiene de manos inmediata al retirar los guantes (Momento 3: Después del riesgo de exposición a fluidos), dado que los guantes no brindan protección microbiológica absoluta.',
        'Omitir la higiene si los guantes se mantuvieron visualmente íntegros y no hubo humedad percibida sobre la epidermis.',
        'Aplicar solución hidroalcohólica directamente sobre los guantes puestos para descontaminarlos y reutilizarlos con otro paciente.',
        'Postergar la higiene hasta salir de la sala de hospitalización, limpiando únicamente el exterior del recipiente de medición.',
      ],
      correctIndex: 0,
      rationale:
        'La OMS estipula que el uso de guantes no reemplaza en ningún caso la higiene de manos. El Momento 3 ("Después del riesgo de exposición a líquidos corporales") exige realizar higiene de manos obligatoria de inmediato tras quitarse los guantes, debido a la posible contaminación de la piel por microporos indetectables o durante la maniobra de retiro de los elementos de protección personal.',
    },
    {
      id: 4,
      question:
        'Caso Clínico 4: Durante la atención en sala de aislamiento a un paciente diagnosticado con colitis pseudomembranosa por Clostridioides difficile, o ante la presencia de manos con suciedad macroscópica visible o sangre, ¿por qué la directriz OMS establece el lavado con agua y jabón en lugar del alcohol en gel?',
      context: 'Bioseguridad Hospitalaria • Esporas y Suciedad Visible',
      options: [
        'Porque las esporas de Clostridioides difficile y la materia orgánica resisten la acción del alcohol; se requiere el arrastre mecánico y detergencia del agua y jabón.',
        'Porque el agua y jabón neutraliza químicamente las toxinas A y B en menos de 5 segundos a diferencia del alcohol en gel.',
        'Porque el alcohol al 70% degrada la capa lipídica de las esporas convirtiéndolas en formas vegetativas más invasivas.',
        'Porque el lavado con agua y jabón es de menor duración que la fricción hidroalcohólica recomendada en aislamientos.',
      ],
      correctIndex: 0,
      rationale:
        'Las preparaciones de base alcohólica son potentes bactericidas de acción rápida, pero carecen de eficacia esporicida contra Clostridioides difficile y ven reducida su efectividad ante biocargas orgánicas espesas. Por tanto, ante esporas o suciedad visible, es mandatorio el lavado mecánico con agua y jabón para emulsionar y arrastrar físicamente los patógenos por fricción hidrodinámica.',
    },
    {
      id: 5,
      question:
        'Caso Clínico 5: En un taller de simulación clínica de enfermería, se instruye sobre los tiempos de contacto óptimos recomendados por la OMS para garantizar la eficacia antimicrobiana. ¿Cuáles son los rangos temporales protocolarios para la fricción con solución hidroalcohólica y para el lavado con agua y jabón, respectivamente?',
      context: 'Tiempos Normativos OMS • Fricción vs. Lavado',
      options: [
        'Fricción con base alcohólica: 20 a 30 segundos | Lavado con agua y jabón: 40 a 60 segundos completos.',
        'Fricción con base alcohólica: 10 a 15 segundos | Lavado con agua y jabón: 20 a 30 segundos.',
        'Fricción con base alcohólica: 40 a 60 segundos | Lavado con agua y jabón: 90 a 120 segundos.',
        'Fricción con base alcohólica: mínimo 60 segundos | Lavado con agua y jabón: 15 a 20 segundos breves.',
      ],
      correctIndex: 0,
      rationale:
        'La OMS estipula que la fricción antiséptica con formulaciones a base de alcohol debe durar entre 20 y 30 segundos (frotando sistemáticamente hasta que el producto se evapore por completo y las manos queden secas). Por su parte, el lavado clínico con agua y jabón requiere entre 40 y 60 segundos para permitir la humectación, jabonado completo en los 6 pasos, enjuague y secado aséptico.',
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

  // Official 6 steps
  readonly steps: HandwashStep[] = [
    {
      id: 1,
      number: 1,
      title: 'Palma con Palma',
      titulo: 'Palma con Palma',
      subtitle: 'Fricción inicial y distribución del antiséptico',
      description:
        'Frota las palmas de las manos entre sí realizando movimientos circulares enérgicos para generar emulsión homogénea.',
      clinicalKey: 'Asegura la activación del antiséptico en toda la superficie palmar.',
      iconType: 'palms',
      demoUrl:
        'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&q=80',
      videoDemo: 'assets/animations/paso-1.mp4',
      imageDemo:
        'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&q=80',
      targetArea: 'Superficie palmar bilateral completa',
      recommendedPressure: 'Firme y homogénea',
      movementPattern: 'Fricción circular continua de 360°',
    },
    {
      id: 2,
      number: 2,
      title: 'Dorso de las Manos',
      titulo: 'Dorso de las Manos',
      subtitle: 'Fricción de superficies dorsales',
      description:
        'Frota la palma de la mano derecha sobre el dorso de la mano izquierda entrelazando los dedos, y viceversa.',
      clinicalKey: 'Cubre la zona dorsal, habitualmente olvidada en el lavado descuidado.',
      iconType: 'dorsal',
      demoUrl:
        'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=600&q=80',
      videoDemo: 'assets/animations/paso-2.mp4',
      imageDemo:
        'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=600&q=80',
      targetArea: 'Dorso cutáneo y articulaciones metacarpianas',
      recommendedPressure: 'Firme y longitudinal (nudillos a muñeca)',
      movementPattern: 'Deslizamiento longitudinal de vaivén',
    },
    {
      id: 3,
      number: 3,
      title: 'Espacios Interdigitales',
      titulo: 'Espacios Interdigitales',
      subtitle: 'Palma con palma y dedos entrelazados',
      description:
        'Frota las palmas de las manos entre sí con los dedos fuertemente entrelazados, de la base a las puntas.',
      clinicalKey: 'Remueve colonias bacterianas que habitan entre los pliegues de los dedos.',
      iconType: 'interdigital',
      demoUrl:
        'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&q=80',
      videoDemo: 'assets/animations/paso-3.mp4',
      imageDemo:
        'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&q=80',
      targetArea: 'Pliegues y hendiduras interdigitales',
      recommendedPressure: 'Profunda en la base articular',
      movementPattern: 'Fricción en peine recíproca',
    },
    {
      id: 4,
      number: 4,
      title: 'Dorso de los Dedos',
      titulo: 'Dorso de los Dedos',
      subtitle: 'Traba digital contra la palma opuesta',
      description:
        'Frota el dorso de los dedos contra la palma de la mano opuesta, manteniendo los dedos trabados entre sí en gancho.',
      clinicalKey: 'Desinfecta nudillos y articulaciones interfalángicas proximales.',
      iconType: 'fingers-locked',
      demoUrl:
        'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=600&q=80',
      videoDemo: 'assets/animations/paso-4.mp4',
      imageDemo:
        'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=600&q=80',
      targetArea: 'Nudillos y falanges dorsales en gancho',
      recommendedPressure: 'Traba firme con contra-presión palmar',
      movementPattern: 'Desplazamiento horizontal de vaivén',
    },
    {
      id: 5,
      number: 5,
      title: 'Limpieza de Pulgares',
      titulo: 'Limpieza de Pulgares',
      subtitle: 'Frotación rotacional envolvente',
      description:
        'Rodea el pulgar izquierdo con la palma de la mano derecha en puño cerrado, frota con rotación completa, y repite.',
      clinicalKey: 'El pulgar es el dedo con mayor interacción y contacto con instrumental clínico.',
      iconType: 'thumbs',
      demoUrl:
        'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&q=80',
      videoDemo: 'assets/animations/paso-5.mp4',
      imageDemo:
        'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&q=80',
      targetArea: 'Primer dedo (pulgar) bilateral y eminencia tenar',
      recommendedPressure: 'Envolvente circular de 360°',
      movementPattern: 'Rotación axial de puño cerrado',
    },
    {
      id: 6,
      number: 6,
      title: 'Yemas y Uñas',
      titulo: 'Yemas y Uñas',
      subtitle: 'Fricción ungueal concéntrica',
      description:
        'Frota la punta de los dedos y las uñas agrupadas contra la palma de la mano opuesta con rotación en espiral.',
      clinicalKey: 'La zona subungueal es el reservorio de mayor densidad de microorganismos patógenos.',
      iconType: 'nails',
      demoUrl:
        'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=600&q=80',
      videoDemo: 'assets/animations/paso-6.mp4',
      imageDemo:
        'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=600&q=80',
      targetArea: 'Lechos ungueales, pulpejos y cuenco palmar',
      recommendedPressure: 'Cónica y concentrada sobre la palma',
      movementPattern: 'Rotación en espiral concéntrica',
    },
  ];

  // State Signals
  private readonly _student = signal<StudentInfo | null>(null);
  private readonly _diagnosticAnswers = signal<{ [questionId: string | number]: number }>({});
  private readonly _backendScore = signal<number | null>(null);
  private readonly _stepRecords = signal<StepTimeRecord[]>([]);
  private readonly _notaTeorica = signal<number>(0);
  private readonly _retroalimentacionTeorica = signal<any[]>([]);

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
    const maxStepScore = 10 / 6;
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

  resetAll(): void {
    this._student.set(null);
    this._diagnosticAnswers.set({});
    this._stepRecords.set([]);
    this._notaTeorica.set(0);
    this._retroalimentacionTeorica.set([]);
  }
}
