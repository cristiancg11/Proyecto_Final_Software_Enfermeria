import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandwashStateService } from '../../core/services/handwash-state.service';
import { HandwashStep } from '../../core/models/handwash.models';

@Component({
  selector: 'app-practica',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-6 md:py-10 animate-fade-in">
      @if (!student()) {
        <!-- Pantalla de bloqueo si no está autenticado -->
        <div class="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white text-center max-w-xl mx-auto">
          <div class="w-16 h-16 rounded-3xl bg-[#FF6A4D]/15 text-[#FF6A4D] flex items-center justify-center mx-auto mb-5 shadow-sm">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 class="font-heading text-2xl md:text-3xl text-[#0B2B29] mb-3">
            Identificación Requerida
          </h2>
          <p class="text-sm md:text-base text-[#537571] mb-6 leading-relaxed">
            Para iniciar el cronómetro y evaluar la práctica de los 6 pasos, primero debes registrar tus datos en el formulario de bienvenida.
          </p>
          <button
            type="button"
            (click)="goToBienvenida()"
            class="btn-primary py-3.5 px-8 text-base shadow-lg"
          >
            Ir al Formulario de Registro
          </button>
        </div>
      } @else {
        <!-- Indicador de Progreso Superior (6 Pasos) -->
        <div class="bg-white/80 backdrop-blur-md rounded-3xl p-5 md:p-6 mb-6 shadow-md border border-white/90">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-[#00B39F] animate-ping"></span>
              <span class="text-xs md:text-sm font-bold text-[#0B2B29] tracking-wide uppercase">
                Práctica Guiada • Paso {{ currentStepIndex() + 1 }} de 6
              </span>
            </div>
            <span class="text-xs font-semibold px-3 py-1 rounded-full bg-[#00B39F]/10 text-[#008072]">
              Objetivo: 3 a 8 segundos
            </span>
          </div>

        <!-- 6 Puntos de progreso -->
        <div class="grid grid-cols-6 gap-2 md:gap-4">
          @for (step of steps; track step.number; let idx = $index) {
            <div class="flex flex-col items-center gap-2">
              <div
                class="w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center font-bold text-xs md:text-sm transition-all duration-300"
                [ngClass]="{
                  'bg-[#00B39F] text-white ring-4 ring-[#00B39F]/20 scale-105 shadow-md': idx === currentStepIndex(),
                  'bg-[#CFFBF0] text-[#008072]': idx < currentStepIndex(),
                  'bg-slate-100 text-slate-400': idx > currentStepIndex()
                }"
              >
                @if (idx < currentStepIndex()) {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  {{ step.number }}
                }
              </div>
              <span
                class="hidden md:block text-[11px] font-medium text-center truncate max-w-[80px]"
                [ngClass]="idx === currentStepIndex() ? 'text-[#0B2B29] font-bold' : 'text-[#87A3A0]'"
              >
                {{ step.title }}
              </span>
            </div>
          }
        </div>
      </div>

      <!-- Tarjeta Principal del Paso Actual -->
      <div class="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-white relative overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- Columna Izquierda: Información del Paso -->
          <div class="lg:col-span-6 space-y-5">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#FFE9DE] text-[#FF6A4D] text-xs font-bold">
              Maniobra Oficial OMS #{{ currentStep().number }}
            </div>

            <h2 class="font-heading text-3xl md:text-4xl text-[#0B2B29] leading-tight">
              {{ currentStep().title }}
            </h2>

            <p class="text-sm md:text-base font-semibold text-[#008072]">
              {{ currentStep().subtitle }}
            </p>

            <p class="text-base text-[#1E4845] leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
              {{ currentStep().description }}
            </p>

            <!-- Clave Clínica -->
            <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-[#CFFBF0]/30 border border-[#00B39F]/20 text-xs md:text-sm text-[#0B2B29]">
              <div class="w-6 h-6 rounded-lg bg-[#00B39F] text-white flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span class="font-bold text-[#008072]">Importancia Aséptica: </span>
                {{ currentStep().clinicalKey }}
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Cronómetro y Visualizador -->
          <div class="lg:col-span-6 flex flex-col items-center justify-center text-center">
            <div class="w-full mb-5 relative overflow-hidden rounded-2xl bg-[#0B2B29] aspect-[4/3]">
              <video #cameraVideo autoplay muted playsinline class="w-full h-full object-cover scale-x-[-1]"></video>
              <canvas #handOverlay class="absolute inset-0 w-full h-full pointer-events-none"></canvas>
              @if (cameraActive()) {
                <div class="absolute left-3 top-3 rounded-full bg-[#0B2B29]/80 px-3 py-1 text-[11px] font-bold text-white">
                  {{ handsDetected() >= 2 ? '✓ Dos manos detectadas' : 'Muestra ambas manos' }}
                </div>
                @if (cameraActive()) {
                  <div class="absolute bottom-3 left-3 right-3 rounded-xl bg-white/90 px-3 py-2 text-left text-[11px] text-[#0B2B29]">
                    <b>{{ palmsValidated() ? '✓ Movimiento reconocido por cámara' : 'Reconociendo el movimiento: ' + palmsEvidence().toFixed(1) + ' / 1.5 s' }}</b>
                    <br>
                    @if (palmsValidated() && currentSeconds() < 3) {
                      Mantén la fricción hasta que el cronómetro llegue a 3.0 s para que el paso sea óptimo.
                    } @else {
                      {{ palmsFeedback() }}
                    }
                  </div>
                }
                <button type="button" (click)="stopCamera()" class="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#0B2B29]">Apagar</button>
              } @else {
                <div class="absolute inset-0 flex flex-col items-center justify-center p-5 text-white">
                  <p class="text-sm font-bold">Evaluación asistida por cámara</p>
                  <p class="mt-1 text-xs text-white/70">El video se procesa en este dispositivo; no se guarda.</p>
                  <button type="button" (click)="startCamera()" [disabled]="cameraLoading()" class="mt-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0B2B29]">{{ cameraLoading() ? 'Preparando…' : 'Activar cámara' }}</button>
                  @if (cameraError()) { <p class="mt-2 text-xs text-[#FFB6A6]">{{ cameraError() }}</p> }
                </div>
              }
            </div>
            <!-- Representación Visual del Cronómetro -->
            <div class="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center mb-6">
              <!-- Círculo de Fondo -->
              <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  class="text-slate-100"
                  stroke-width="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <!-- Arco de Progreso Dinámico -->
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke-width="8"
                  stroke-linecap="round"
                  fill="transparent"
                  [attr.stroke-dasharray]="circumference"
                  [attr.stroke-dashoffset]="strokeDashoffset()"
                  [ngClass]="{
                    'text-[#FF6A4D]': currentSeconds() < 3.0,
                    'text-[#00B39F]': currentSeconds() >= 3.0 && currentSeconds() <= 8.0,
                    'text-amber-500': currentSeconds() > 8.0
                  }"
                  stroke="currentColor"
                  class="transition-all duration-100"
                />
              </svg>

              <!-- Tiempo en Centro del Círculo -->
              <div class="absolute flex flex-col items-center justify-center">
                <!-- Icono de animación de paso -->
                <div class="w-10 h-10 mb-1 rounded-full flex items-center justify-center"
                     [ngClass]="{
                       'bg-[#FF6A4D]/15 text-[#FF6A4D]': currentSeconds() < 3.0,
                       'bg-[#00B39F]/15 text-[#00B39F] animate-bounce': currentSeconds() >= 3.0 && currentSeconds() <= 8.0,
                       'bg-amber-100 text-amber-600': currentSeconds() > 8.0
                     }">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <div class="font-heading text-4xl md:text-5xl font-bold tracking-tight text-[#0B2B29]">
                  {{ formattedTime() }}
                </div>
                <div class="text-[11px] font-bold uppercase tracking-wider text-[#537571] mt-1">
                  segundos
                </div>

                <!-- Estado del Ritmo -->
                <div class="mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                     [ngClass]="{
                       'bg-[#FFE9DE] text-[#FF6A4D]': currentSeconds() < 3.0,
                       'bg-[#CFFBF0] text-[#008072]': currentSeconds() >= 3.0 && currentSeconds() <= 8.0,
                       'bg-amber-100 text-amber-700': currentSeconds() > 8.0
                     }">
                  @if (currentSeconds() < 3.0) {
                    <span>Acelera fricción (mín 3s)</span>
                  } @else if (currentSeconds() <= 8.0) {
                    <span>¡Rango Óptimo!</span>
                  } @else {
                    <span>Tiempo extenso (>8s)</span>
                  }
                </div>
              </div>
            </div>

            <!-- Botón de acción principal: Paso Completado -->
            <button
              type="button"
              (click)="completeStep()"
              [disabled]="cameraActive()"
              class="w-full btn-primary py-4 text-base md:text-lg flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] group"
            >
              <span>{{ cameraActive() ? 'La cámara avanzará al detectar el movimiento' : (isLastStep() ? 'Finalizar Práctica' : 'Paso Completado') }}</span>
              <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <!-- Reiniciar tiempo de este paso -->
            <button
              type="button"
              (click)="resetCurrentStepTimer()"
              class="mt-3 text-xs text-[#537571] hover:text-[#0B2B29] font-medium flex items-center gap-1 transition"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reiniciar cronómetro de este paso
            </button>
          </div>

        </div>
      </div>

      <!-- Resumen de pasos ya completados -->
      @if (completedRecords().length > 0) {
        <div class="mt-6 bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/80">
          <div class="text-xs font-bold text-[#0B2B29] mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-[#00B39F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Tiempos registrados en esta sesión:
          </div>
          <div class="flex flex-wrap gap-2">
            @for (rec of completedRecords(); track rec.stepNumber) {
              <div class="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-2">
                <span class="font-bold text-[#0B2B29]">Paso {{ rec.stepNumber }}:</span>
                <span class="font-semibold"
                      [ngClass]="{
                        'text-[#008072]': rec.status === 'optimal',
                        'text-[#FF6A4D]': rec.status === 'too-fast',
                        'text-amber-600': rec.status === 'too-slow'
                      }">
                  {{ rec.seconds }}s
                </span>
              </div>
            }
          </div>
        </div>
      }
      }
    </div>
  `,
})
export class PracticaComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly stateService = inject(HandwashStateService);

  readonly student = this.stateService.student;
  readonly steps = this.stateService.steps;
  readonly currentStepIndex = signal(0);
  readonly currentSeconds = signal(0);
  readonly cameraActive = signal(false);
  readonly cameraLoading = signal(false);
  readonly cameraError = signal('');
  readonly handsDetected = signal(0);
  readonly palmsEvidence = signal(0);
  readonly palmsValidated = signal(false);
  readonly palmsFeedback = signal('Acerca las palmas y frota continuamente.');

  @ViewChild('cameraVideo') private cameraVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('handOverlay') private handOverlay?: ElementRef<HTMLCanvasElement>;

  readonly currentStep = computed(() => this.steps[this.currentStepIndex()]);
  readonly isLastStep = computed(() => this.currentStepIndex() === this.steps.length - 1);
  readonly completedRecords = this.stateService.stepRecords;

  // SVG circular timer config
  readonly radius = 52;
  readonly circumference = 2 * Math.PI * this.radius;

  // Computed visual circle offset (maps 0 to 10 seconds to circumference)
  readonly strokeDashoffset = computed(() => {
    const s = this.currentSeconds();
    const progress = Math.min(1, s / 10);
    return this.circumference * (1 - progress);
  });

  readonly formattedTime = computed(() => {
    const s = this.currentSeconds();
    return s.toFixed(1);
  });

  private timerInterval: any = null;
  private startTime: number = 0;
  private stream: MediaStream | null = null;
  private detector: HandLandmarker | null = null;
  private animationFrame: number | null = null;
  private previousCenters: { x: number; y: number }[] | null = null;
  private previousFrameAt: number | null = null;
  private autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    if (!this.student()) {
      this.router.navigate(['/bienvenida']);
      return;
    }
    this.startStepTimer();
  }

  goToBienvenida(): void {
    this.router.navigate(['/bienvenida']);
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.stopCamera();
  }

  async startCamera(): Promise<void> {
    this.cameraLoading.set(true); this.cameraError.set('');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      const video = this.cameraVideo?.nativeElement;
      if (!video) throw new Error('Visor no disponible');
      video.srcObject = this.stream; await video.play();
      if (!this.detector) {
        const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
        this.detector = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task' }, runningMode: 'VIDEO', numHands: 2 });
      }
      this.cameraActive.set(true); this.detectHands();
    } catch (error) {
      this.releaseStream();
      this.cameraError.set(error instanceof DOMException && error.name === 'NotAllowedError' ? 'Debes autorizar el permiso de cámara.' : 'No fue posible iniciar la cámara.');
    } finally { this.cameraLoading.set(false); }
  }

  stopCamera(): void {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    if (this.autoAdvanceTimer !== null) clearTimeout(this.autoAdvanceTimer);
    this.animationFrame = null; this.cameraActive.set(false); this.handsDetected.set(0); this.resetPalmsEvidence(); this.releaseStream();
    const canvas = this.handOverlay?.nativeElement; canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  }

  private detectHands(): void {
    const video = this.cameraVideo?.nativeElement;
    if (!video || !this.detector || !this.cameraActive()) return;
    const result = this.detector.detectForVideo(video, performance.now());
    this.handsDetected.set(result.landmarks.length); this.evaluatePalms(result.landmarks); this.drawLandmarks(result.landmarks);
    this.animationFrame = requestAnimationFrame(() => this.detectHands());
  }

  private evaluatePalms(landmarks: { x: number; y: number }[][]): void {
    const now = performance.now();
    const instruction = this.currentStep().title;
    if (landmarks.length < 2) { this.palmsFeedback.set(`${instruction}: muestra las dos manos frente a la cámara.`); this.previousCenters = null; this.previousFrameAt = now; return; }
    const centers = landmarks.slice(0, 2).map(hand => ({ x: (hand[0].x + hand[9].x) / 2, y: (hand[0].y + hand[9].y) / 2 }));
    const close = Math.hypot(centers[0].x - centers[1].x, centers[0].y - centers[1].y) < this.currentDistanceThreshold();
    const movement = this.previousCenters ? (Math.hypot(centers[0].x - this.previousCenters[0].x, centers[0].y - this.previousCenters[0].y) + Math.hypot(centers[1].x - this.previousCenters[1].x, centers[1].y - this.previousCenters[1].y)) / 2 : 0;
    const elapsed = this.previousFrameAt ? Math.min(.15, (now - this.previousFrameAt) / 1000) : 0;
    if (close && movement > .004) {
      const evidence = Math.min(1.5, this.palmsEvidence() + elapsed);
      this.palmsEvidence.set(evidence);
      if (evidence >= 1.5 && !this.palmsValidated()) {
        this.palmsValidated.set(true);
        this.palmsFeedback.set(`${instruction} reconocido. Mantén la fricción hasta completar 3 segundos.`);
      } else if (!this.palmsValidated()) this.palmsFeedback.set(`¡Bien! Mantén el movimiento de ${instruction.toLowerCase()}.`);
    } else this.palmsFeedback.set(close ? `Realiza fricción continua para ${instruction.toLowerCase()}.` : `Acerca las manos para ${instruction.toLowerCase()}.`);
    if (this.palmsValidated() && this.currentSeconds() >= 3 && this.autoAdvanceTimer === null) {
      this.palmsFeedback.set(`${instruction} validado con tiempo óptimo. Avanzando al siguiente paso…`);
      this.autoAdvanceTimer = setTimeout(() => this.finishCurrentStep(), 900);
    }
    this.previousCenters = centers; this.previousFrameAt = now;
  }

  private drawLandmarks(landmarks: { x: number; y: number }[][]): void {
    const canvas = this.handOverlay?.nativeElement, video = this.cameraVideo?.nativeElement;
    if (!canvas || !video || !video.videoWidth) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const context = canvas.getContext('2d'); if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height); context.fillStyle = '#00B39F';
    for (const hand of landmarks) for (const point of hand) { context.beginPath(); context.arc((1 - point.x) * canvas.width, point.y * canvas.height, 4, 0, Math.PI * 2); context.fill(); }
  }

  private resetPalmsEvidence(): void { this.palmsEvidence.set(0); this.palmsValidated.set(false); this.palmsFeedback.set('Acerca las palmas y frota continuamente.'); this.previousCenters = null; this.previousFrameAt = null; }
  private currentDistanceThreshold(): number { return [0.34, 0.43, 0.34, 0.38, 0.30, 0.32][this.currentStepIndex()] ?? 0.34; }
  private releaseStream(): void { this.stream?.getTracks().forEach(track => track.stop()); this.stream = null; const video = this.cameraVideo?.nativeElement; if (video) video.srcObject = null; }

  private startStepTimer(): void {
    this.stopTimer();
    this.startTime = Date.now();
    this.currentSeconds.set(0);

    this.timerInterval = setInterval(() => {
      const elapsedMs = Date.now() - this.startTime;
      this.currentSeconds.set(Math.round((elapsedMs / 1000) * 10) / 10);
    }, 100);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetCurrentStepTimer(): void {
    this.startStepTimer();
  }

  completeStep(): void {
    this.finishCurrentStep();
  }

  private finishCurrentStep(): void {
    if (this.autoAdvanceTimer !== null) clearTimeout(this.autoAdvanceTimer);
    this.autoAdvanceTimer = null;
    const finalSeconds = Math.max(0.5, this.currentSeconds());
    const stepNum = this.currentStep().number;

    // Record step in state
    this.stateService.recordStepTime(stepNum, finalSeconds);

    if (this.isLastStep()) {
      this.stopTimer();
      this.router.navigate(['/resultado']);
    } else {
      this.currentStepIndex.update((idx) => idx + 1);
      this.resetPalmsEvidence();
      this.startStepTimer();
    }
  }
}
