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
  // Questions Catalog
  private readonly questionBank: DiagnosticQuestion[] = [
    {
      id: 1,
      question:
        '¿Cuál es el momento primordial para realizar la higiene de manos en la atención clínica según los 5 Momentos de la OMS?',
      context: 'Fundamentos de bioseguridad en entornos hospitalarios',
      options: [
        'Únicamente al finalizar el turno de guardia médica o de enfermería.',
        'Antes de tocar al paciente y antes de realizar una tarea limpia o aséptica.',
        'Solamente cuando las manos presenten suciedad visible o restos biológicos.',
        'Exclusivamente después de manipular residuos biopeligrosos.',
      ],
      correctIndex: 1,
      rationale:
        'La OMS establece como momentos prioritarios el contacto previo al paciente y la realización de tareas limpias/asépticas para evitar la transmisión cruzada de patógenos.',
    },
    {
      id: 2,
      question:
        '¿Cuál es el tiempo total recomendado por la OMS para un lavado de manos clínico con agua y jabón?',
      context: 'Duración y efectividad del procedimiento antiséptico',
      options: [
        'De 10 a 15 segundos con secado al aire.',
        'De 40 a 60 segundos para garantizar la fricción mecánica completa de todas las superficies.',
        'Mínimo 5 minutos frotando con cepillos de cerdas quirúrgicas.',
        'Exactamente 20 segundos aplicando solución alcohólica sobre agua fría.',
      ],
      correctIndex: 1,
      rationale:
        'El lavado clínico completo con agua y jabón requiere entre 40 y 60 segundos; una fricción menor a 40 segundos no elimina eficazmente la flora transitoria.',
    },
    {
      id: 3,
      question:
        '¿Qué requisito previo es obligatorio antes de comenzar el protocolo de lavado de manos clínico?',
      context: 'Preparación del profesional de enfermería',
      options: [
        'Aplicar abundante crema humectante o protectora.',
        'Colocarse guantes de látex antes de abrir la llave del agua.',
        'Retirar anillos, reloj, pulseras y tener uñas cortas, limpias y sin esmalte.',
        'Lavar los codos con antiséptico yodado previo a las palmas.',
      ],
      correctIndex: 2,
      rationale:
        'Las joyas y el esmalte acumulan microorganismos patógenos y microfisuras que impiden una antisepsia eficaz en el área asistencial.',
    },
    { id: 4, question: '¿Cuándo se recomienda preferir la fricción con preparación alcohólica?', context: 'Selección del método de higiene', options: ['Cuando las manos no están visiblemente sucias.', 'Solo después de usar guantes estériles.', 'Únicamente al final del turno.', 'Cuando hay sangre visible en las manos.'], correctIndex: 0, rationale: 'La preparación alcohólica es el método preferido cuando las manos no están visiblemente sucias, por su rapidez y eficacia.' },
    { id: 5, question: '¿Qué se debe hacer inmediatamente después de quitarse los guantes?', context: 'Uso seguro de guantes', options: ['Aplicar crema humectante.', 'Realizar higiene de manos.', 'Colocar un nuevo par de guantes.', 'Desinfectar solo las uñas.'], correctIndex: 1, rationale: 'Los guantes no sustituyen la higiene de manos; pueden contaminarse al retirarlos o tener microperforaciones.' },
    { id: 6, question: '¿Cuál es la acción correcta antes de una tarea aséptica?', context: 'Prevención de infecciones', options: ['Higiene de manos antes de preparar o manipular material limpio.', 'Usar doble guante sin higiene previa.', 'Esperar hasta terminar el procedimiento.', 'Lavar únicamente la mano dominante.'], correctIndex: 0, rationale: 'La higiene antes de una tarea aséptica evita llevar microorganismos al paciente o al material estéril.' },
    { id: 7, question: '¿Por qué se recomienda mantener las uñas cortas?', context: 'Preparación de manos', options: ['Para usar mejor el reloj clínico.', 'Porque bajo las uñas se acumulan microorganismos.', 'Para reducir el consumo de jabón.', 'Porque acelera el secado de guantes.'], correctIndex: 1, rationale: 'Las zonas subungueales son reservorios frecuentes de microorganismos y son difíciles de limpiar correctamente.' },
    { id: 8, question: 'Después de tocar el entorno del paciente, ¿qué corresponde hacer?', context: '5 Momentos OMS', options: ['Higiene de manos antes de atender otro paciente.', 'Retirar el uniforme.', 'Usar guantes estériles de inmediato.', 'Esperar al final de la jornada.'], correctIndex: 0, rationale: 'La higiene tras tocar el entorno del paciente previene la transmisión cruzada entre superficies y pacientes.' },
    { id: 9, question: '¿Qué superficie suele omitirse durante un lavado apresurado?', context: 'Técnica de fricción', options: ['La frente.', 'El antebrazo completo.', 'Pulgares, yemas y espacios interdigitales.', 'Los hombros.'], correctIndex: 2, rationale: 'Pulgares, yemas, uñas y espacios interdigitales son zonas de difícil acceso que requieren movimientos específicos.' },
    { id: 10, question: '¿Cuál es el objetivo principal de la fricción durante la higiene de manos?', context: 'Fundamento de la técnica', options: ['Perfumar las manos.', 'Remover flora transitoria de las superficies de la mano.', 'Reemplazar el uso de agua.', 'Aumentar la temperatura de la piel.'], correctIndex: 1, rationale: 'La fricción mecánica permite desprender la flora transitoria de todas las superficies de las manos.' },
  ];

  private activeDiagnosticQuestions: DiagnosticQuestion[] = this.pickRandomQuestions(5);
  get diagnosticQuestions(): DiagnosticQuestion[] { return this.activeDiagnosticQuestions; }

  // Official 6 steps
  readonly steps: HandwashStep[] = [
    {
      id: 1,
      number: 1,
      title: 'Palma con Palma',
      subtitle: 'Fricción inicial y distribución del jabón',
      description:
        'Frota las palmas de las manos entre sí realizando movimientos circulares enérgicos para generar espuma homogénea.',
      clinicalKey: 'Asegura la activación del surfactante del jabón en toda la superficie palmar.',
      iconType: 'palms',
    },
    {
      id: 2,
      number: 2,
      title: 'Dorso de las Manos',
      subtitle: 'Fricción de superficies dorsales',
      description:
        'Frota la palma de la mano derecha sobre el dorso de la mano izquierda entrelazando los dedos, y viceversa.',
      clinicalKey: 'Cubre la zona dorsal, habitualmente olvidada en el lavado descuidado.',
      iconType: 'dorsal',
    },
    {
      id: 3,
      number: 3,
      title: 'Espacios Interdigitales',
      subtitle: 'Palma con palma y dedos entrelazados',
      description:
        'Frota las palmas de las manos entre sí con los dedos fuertemente entrelazados, de la base a las puntas.',
      clinicalKey: 'Remueve colonias bacterianas que habitan entre los pliegues de los dedos.',
      iconType: 'interdigital',
    },
    {
      id: 4,
      number: 4,
      title: 'Dorso de los Dedos',
      subtitle: 'Traba digital contra la palma opuesta',
      description:
        'Frota el dorso de los dedos contra la palma de la mano opuesta, manteniendo los dedos trabados entre sí.',
      clinicalKey: 'Desinfecta nudillos y articulaciones interfalángicas proximales.',
      iconType: 'fingers-locked',
    },
    {
      id: 5,
      number: 5,
      title: 'Limpieza de Pulgares',
      subtitle: 'Frotación rotacional envoltoria',
      description:
        'Rodea el pulgar izquierdo con la palma de la mano derecha, frota con un movimiento de rotación, y repite con el otro pulgar.',
      clinicalKey: 'El pulgar es el dedo con mayor interacción y contacto con instrumental clínico.',
      iconType: 'thumbs',
    },
    {
      id: 6,
      number: 6,
      title: 'Yemas y Uñas',
      subtitle: 'Fricción ungueal concéntrica',
      description:
        'Frota la punta de los dedos y las uñas de la mano derecha contra la palma de la mano izquierda con rotación, y viceversa.',
      clinicalKey: 'La zona subungueal es el reservorio de mayor densidad de microorganismos patógenos.',
      iconType: 'nails',
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
    this.activeDiagnosticQuestions = this.pickRandomQuestions(5);
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

  private pickRandomQuestions(count: number): DiagnosticQuestion[] {
    return [...this.questionBank].sort(() => Math.random() - 0.5).slice(0, count);
  }
}
