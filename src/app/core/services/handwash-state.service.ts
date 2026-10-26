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
        'Antes de realizar una punción venosa periférica a un paciente canalizado, ¿cuál es la acción de higiene de manos estrictamente indicada según los 5 momentos de la OMS?',
      context: '5 Momentos OMS • Tarea Aséptica / Limpia',
      options: [
        'Lavado con agua y jabón solo si hay suciedad visible, de lo contrario fricción con preparado de base alcohólica.',
        'Lavado exclusivo con clorhexidina al 4% durante 2 minutos continuos.',
        'Es suficiente con la postura de guantes estériles sin higiene previa.',
        'Fricción de manos únicamente después de retirar la aguja del paciente.',
      ],
      correctIndex: 0,
      rationale:
        'Corresponde al Momento 2 (Antes de realizar una tarea aséptica/limpia). Si las manos no están visiblemente sucias, la fricción con base alcohólica es el estándar preferido por su rapidez y eficacia antimicrobiana.',
    },
    {
      id: 2,
      question:
        '¿Cuál es el tiempo mínimo requerido para una fricción efectiva con solución alcohólica según el protocolo estandarizado de la OMS?',
      context: 'Protocolo Estandarizado OMS • Tiempo de Fricción',
      options: [
        '10 a 15 segundos.',
        '20 a 30 segundos.',
        '40 a 60 segundos.',
        '90 segundos completos.',
      ],
      correctIndex: 1,
      rationale:
        'La fricción con alcohol glicerinado debe durar entre 20 y 30 segundos cubriendo todos los pasos, a diferencia del lavado con agua y jabón que requiere entre 40 y 60 segundos.',
    },
    {
      id: 3,
      question:
        'Durante la atención a un paciente con diarrea confirmada por Clostridioides difficile, ¿cuál método de higiene de manos es obligatorio tras el contacto?',
      context: 'Bioseguridad Hospitalaria • Esporas Bacterianas',
      options: [
        'Fricción con solución hidroalcohólica al 70%.',
        'Lavado con agua y jabón común o antimicrobiano.',
        'Uso de gel antibacterial seguido de secado con toalla de tela.',
        'Solo retiro cuidadoso de guantes sin necesidad de lavado inmediato.',
      ],
      correctIndex: 1,
      rationale:
        'Las esporas de Clostridioides difficile son resistentes a la acción bactericida del alcohol; se requiere la acción mecánica del agua y jabón para arrastrarlas físicamente.',
    },
    {
      id: 4,
      question:
        "En la técnica de 6 pasos de la OMS, ¿cuál es el objetivo primordial del paso de 'rotación de los pulgares atrapándolos con la palma opuesta'?",
      context: 'Técnica de 6 Pasos OMS • Biomecánica Digital',
      options: [
        'Friccionar la articulación de la muñeca.',
        'Descontaminar la zona tenar y el primer dedo, frecuentemente omitidos en el frotado general.',
        'Limpiar el lecho ungueal y las cutículas.',
        'Retirar la flora transitoria del dorso de la mano.',
      ],
      correctIndex: 1,
      rationale:
        'Los pulgares y sus pliegues interdigitales son una de las áreas anatómicas que con mayor frecuencia se omiten cuando se realiza fricción simple palma contra palma.',
    },
    {
      id: 5,
      question:
        'Tras ajustar la bomba de infusión y acomodar la barandilla de la cama de un paciente (sin contacto físico directo con su piel), ¿es obligatorio higienizarse las manos?',
      context: '5 Momentos OMS • Entorno Asistencial',
      options: [
        'No, porque no hubo contacto con fluidos ni con el cuerpo del paciente.',
        'Sí, corresponde al Momento 5 (Después del contacto con el entorno del paciente).',
        'Solo si se va a salir inmediatamente del pabellón de hospitalización.',
        'Únicamente si el paciente se encuentra bajo aislamiento por gotas.',
      ],
      correctIndex: 1,
      rationale:
        'El entorno inmediato del paciente se contamina con la misma flora del paciente; por tanto, el Momento 5 exige desinfección al abandonar la unidad o cambiar de actividad.',
    },
  ];

  get diagnosticQuestions(): DiagnosticQuestion[] {
    return this.clinicalQuestions;
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
  private readonly _diagnosticAnswers = signal<{ [questionId: number]: number }>({});
  private readonly _stepRecords = signal<StepTimeRecord[]>([]);

  // Public readonly accessors
  readonly student = this._student.asReadonly();
  readonly diagnosticAnswers = this._diagnosticAnswers.asReadonly();
  readonly stepRecords = this._stepRecords.asReadonly();

  // Diagnostics completion signal
  readonly isDiagnosticComplete = computed(() => {
    const answers = this._diagnosticAnswers();
    return this.diagnosticQuestions.every((q) => answers[q.id] !== undefined);
  });

  // Diagnostic Quiz Score computed
  readonly diagnosticScore = computed(() => {
    const answers = this._diagnosticAnswers();
    let correctCount = 0;
    this.diagnosticQuestions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });
    return correctCount;
  });

  // Evaluation computation
  readonly evaluationResult = computed<EvaluationResult>(() => {
    const student = this._student();
    const records = this._stepRecords();
    const quizScore = this.diagnosticScore();

    if (records.length === 0) {
      return {
        student,
        overallScore: 0,
        totalSeconds: 0,
        records: [],
        performanceLevel: 'needs-practice',
        performanceTitle: 'Sin datos de práctica',
        performanceDescription: 'Completa la sesión de práctica para obtener tu evaluación.',
        quizScore,
        totalQuizQuestions: this.diagnosticQuestions.length,
      };
    }

    const totalSeconds = records.reduce((acc, r) => acc + r.seconds, 0);
    const sumScores = records.reduce((acc, r) => acc + r.score, 0);
    const roundedOverall = Math.min(10, Math.max(0, Math.round(sumScores * 10) / 10));

    let performanceLevel: 'excellent' | 'good' | 'needs-practice' = 'needs-practice';
    let performanceTitle = 'Requiere Refuerzo Práctico';
    let performanceDescription =
      'Es fundamental practicar manteniendo un ritmo controlado. El rango ideal para cada movimiento es de 3 a 8 segundos para asegurar una adecuada desinfección sin apresuramientos.';

    if (roundedOverall >= 9.0) {
      performanceLevel = 'excellent';
      performanceTitle = '¡Excelente Técnica Quirúrgica y Clínica!';
      performanceDescription =
        'Has demostrado un dominio excepcional de la biomecánica y los tiempos recomendados por la OMS. Tu técnica garantiza una reducción óptima de la carga bacteriana.';
    } else if (roundedOverall >= 7.0) {
      performanceLevel = 'good';
      performanceTitle = 'Buen Desempeño Clínico';
      performanceDescription =
        'Tu técnica es segura y cumple con los estándares asistenciales. Revisa los pasos señalados para calibrar con mayor precisión el tiempo en cada maniobra.';
    }

    return {
      student,
      overallScore: roundedOverall,
      totalSeconds: Math.round(totalSeconds * 10) / 10,
      records,
      performanceLevel,
      performanceTitle,
      performanceDescription,
      quizScore,
      totalQuizQuestions: this.diagnosticQuestions.length,
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

  setDiagnosticAnswer(questionId: number, optionIndex: number): void {
    this._diagnosticAnswers.update((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
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

  resetPractice(): void {
    this._stepRecords.set([]);
  }

  resetAll(): void {
    this._student.set(null);
    this._diagnosticAnswers.set({});
    this._stepRecords.set([]);
  }

}
