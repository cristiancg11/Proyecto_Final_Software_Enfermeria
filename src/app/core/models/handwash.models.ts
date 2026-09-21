export interface StudentInfo {
  fullName: string;
  studentCode: string;
  consent: boolean;
  registeredAt?: Date;
}

export interface DiagnosticQuestion {
  id: number;
  question: string;
  context: string;
  options: string[];
  correctIndex: number;
  rationale: string;
}

export interface DiagnosticAnswer {
  questionId: number;
  selectedOptionIndex: number;
}

export interface HandwashStep {
  id: number;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  clinicalKey: string;
  iconType: 'palms' | 'dorsal' | 'interdigital' | 'fingers-locked' | 'thumbs' | 'nails';
}

export type StepPaceStatus = 'optimal' | 'too-fast' | 'too-slow';

export interface StepTimeRecord {
  stepNumber: number;
  stepTitle: string;
  seconds: number;
  status: StepPaceStatus;
  score: number; // Max 1.6667 per step, total 10.0
  feedback: string;
}

export interface EvaluationResult {
  student: StudentInfo | null;
  overallScore: number; // Out of 10 (1 decimal)
  totalSeconds: number;
  records: StepTimeRecord[];
  performanceLevel: 'excellent' | 'good' | 'needs-practice';
  performanceTitle: string;
  performanceDescription: string;
  quizScore: number;
  totalQuizQuestions: number;
}
