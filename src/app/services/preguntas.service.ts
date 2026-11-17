import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface OpcionEstudiante {
  id: string;
  texto: string;
  esCorrecta?: boolean;
}

export interface PreguntaEstudiante {
  id: string;
  enunciado: string;
  justificacion?: string;
  correctIndexFallback?: number;
  opciones: OpcionEstudiante[];
}

export interface PreguntasEstudianteResponse {
  total: number;
  preguntas: PreguntaEstudiante[];
}

export interface OpcionDocente {
  id?: string;
  texto: string;
  esCorrecta: boolean;
  vecesElegida?: number;
}

export interface PreguntaDocente {
  id: string;
  enunciado: string;
  justificacion?: string;
  activa: boolean;
  fechaCreacion: string | Date;
  creadaPor: string;
  totalRespuestas: number;
  opciones: OpcionDocente[];
}

export interface PreguntasDocenteResponse {
  total: number;
  preguntas: PreguntaDocente[];
}

export interface NuevaOpcionPregunta {
  texto: string;
  esCorrecta: boolean;
}

export interface CrearPreguntaDto {
  enunciado: string;
  justificacion?: string;
  opciones: NuevaOpcionPregunta[];
}

export interface CrearPreguntaResponse {
  mensaje: string;
  pregunta: {
    id: string;
    enunciado: string;
    justificacion?: string;
    opciones: { id: string; texto: string; esCorrecta: boolean }[];
  };
}

export interface EnviarDiagnosticoDto {
  tipo: 'PRE' | 'POST';
  respuestas: { preguntaId: string; opcionSeleccionadaId: string }[];
  usuarioId?: string;
}

export interface RetroalimentacionPregunta {
  preguntaId: string;
  enunciado: string;
  justificacion: string;
  opcionSeleccionada: { id: string; texto: string } | null;
  opcionCorrecta: { id: string; texto: string } | null;
  esCorrecta: boolean;
}

export interface EnviarDiagnosticoResponse {
  mensaje: string;
  intentoId: string;
  tipo: 'PRE' | 'POST';
  puntaje: number;
  calificacion10?: number;
  aciertos: number;
  totalPreguntas: number;
  retroalimentacion?: RetroalimentacionPregunta[];
}

@Injectable({
  providedIn: 'root',
})
export class PreguntasService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private get apiUrl(): string {
    return this.authService.apiUrl;
  }

  // Signals reactivos para el estado del banco de preguntas
  readonly preguntasEstudiante = signal<PreguntaEstudiante[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // BANCO TÉCNICO OFICIAL DE 15 PREGUNTAS CLÍNICAS OMS
  readonly bancoOficialOMS: PreguntaEstudiante[] = [
    {
      id: 'oms-caso-1',
      enunciado:
        'Caso Clínico 1: El profesional de enfermería ingresa a la unidad de un paciente hospitalizado para valorar signos vitales y realizar exploración física rutinaria cardiopulmonar. El paciente no presenta heridas abiertas ni drenajes activos. De acuerdo con los 5 Momentos de la OMS, ¿cuál es la indicación aséptica obligatoria antes de tocar al paciente?',
      justificacion:
        'Según la estrategia de los 5 Momentos de la OMS, el Momento 1 ("Antes del contacto con el paciente") es imperativo inmediatamente antes de cualquier examen físico o palpación para proteger al paciente de patógenos del entorno asistencial transportados transitoriamente en las manos.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c1-o1', texto: 'Efectuar fricción antiséptica con solución hidroalcohólica inmediatamente antes del contacto (Momento 1), protegiendo al paciente de patógenos del entorno asistencial.', esCorrecta: true },
        { id: 'c1-o2', texto: 'Colocarse guantes de procedimiento limpios de forma directa sin higiene de manos previa, al tratarse de un examen no invasivo.', esCorrecta: false },
        { id: 'c1-o3', texto: 'Realizar la higiene de manos únicamente al finalizar la valoración completa (Momento 4), ya que el paciente no tiene aislamiento.', esCorrecta: false },
        { id: 'c1-o4', texto: 'Omitir la higiene si las manos lucen visiblemente limpias y desinfectar exclusivamente las olivas del fonendoscopio con alcohol.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-caso-2',
      enunciado:
        'Caso Clínico 2: Se programa la canalización de un catéter venoso periférico en el antebrazo de un paciente para terapia antibiótica. El enfermero preparó la bandeja con insumos estériles y seleccionó el trayecto venoso. Conforme al protocolo de técnica aséptica y el Momento 2 de la OMS, ¿cuál es la conducta adecuada previa a la punción?',
      justificacion:
        'El Momento 2 de la OMS ("Antes de realizar una tarea limpia o aséptica") previene la inoculación de microorganismos directamente al torrente sanguíneo o tejidos estériles. Debe ejecutarse inmediatamente antes del procedimiento y previo a colocarse los guantes.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c2-o1', texto: 'Realizar higiene de manos antiséptica inmediatamente antes de manipular insumos estériles y puncionar el acceso vascular (Momento 2), y posteriormente colocarse los guantes.', esCorrecta: true },
        { id: 'c2-o2', texto: 'Realizar la higiene únicamente al culminar la venopunción y asegurar el apósito transparente sobre el sitio de inserción.', esCorrecta: false },
        { id: 'c2-o3', texto: 'Confiar exclusivamente en el uso de guantes estériles, puesto que la higiene previa se considera redundante con material estéril.', esCorrecta: false },
        { id: 'c2-o4', texto: 'Solo higienizarse las manos si se produce sangrado accidental durante la inserción del teflón intravascular.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-caso-3',
      enunciado:
        'Caso Clínico 3: Un enfermero finaliza el vaciado y medición de la orina de un catéter vesical cerrado utilizando guantes de examen limpios. Al retirar los guantes mediante la técnica pico-guante sin rozar la superficie externa contaminada, ¿cuál es la conducta mandatoria según las normas de bioseguridad hospitalaria?',
      justificacion:
        'La OMS estipula que el uso de guantes no reemplaza en ningún caso la higiene de manos. El Momento 3 ("Después del riesgo de exposición a líquidos corporales") exige realizar higiene de manos obligatoria de inmediato tras quitarse los guantes, debido a la posible contaminación por microporos.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c3-o1', texto: 'Realizar higiene de manos inmediata al retirar los guantes (Momento 3: Después del riesgo de exposición a fluidos), dado que los guantes no brindan protección microbiológica absoluta.', esCorrecta: true },
        { id: 'c3-o2', texto: 'Omitir la higiene si los guantes se mantuvieron visualmente íntegros y no hubo humedad percibida sobre la epidermis.', esCorrecta: false },
        { id: 'c3-o3', texto: 'Aplicar solución hidroalcohólica directamente sobre los guantes puestos para descontaminarlos y reutilizarlos con otro paciente.', esCorrecta: false },
        { id: 'c3-o4', texto: 'Postergar la higiene hasta salir de la sala de hospitalización, limpiando únicamente el exterior del recipiente de medición.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-caso-4',
      enunciado:
        'Caso Clínico 4: Durante la atención en sala de aislamiento a un paciente diagnosticado con colitis pseudomembranosa por Clostridioides difficile, o ante la presencia de manos con suciedad macroscópica visible o sangre, ¿por qué la directriz OMS establece el lavado con agua y jabón en lugar del alcohol en gel?',
      justificacion:
        'Las preparaciones de base alcohólica carecen de eficacia esporicida contra Clostridioides difficile y ven reducida su efectividad ante biocargas orgánicas espesas. Por tanto, ante esporas o suciedad visible, es mandatorio el lavado mecánico con agua y jabón para arrastrar físicamente los patógenos.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c4-o1', texto: 'Porque las esporas de Clostridioides difficile y la materia orgánica resisten la acción del alcohol; se requiere el arrastre mecánico y detergencia del agua y jabón.', esCorrecta: true },
        { id: 'c4-o2', texto: 'Porque el agua y jabón neutraliza químicamente las toxinas A y B en menos de 5 segundos a diferencia del alcohol en gel.', esCorrecta: false },
        { id: 'c4-o3', texto: 'Porque el alcohol al 70% degrada la capa lipídica de las esporas convirtiéndolas en formas vegetativas más invasivas.', esCorrecta: false },
        { id: 'c4-o4', texto: 'Porque el lavado con agua y jabón es de menor duración que la fricción hidroalcohólica recomendada en aislamientos.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-caso-5',
      enunciado:
        'Caso Clínico 5: En un taller de simulación clínica de enfermería, se instruye sobre los tiempos de contacto óptimos recomendados por la OMS para garantizar la eficacia antimicrobiana. ¿Cuáles son los rangos temporales protocolarios para la fricción con solución hidroalcohólica y para el lavado con agua y jabón, respectivamente?',
      justificacion:
        'La OMS estipula que la fricción antiséptica con formulaciones a base de alcohol debe durar entre 20 y 30 segundos (frotando hasta secar completamente). Por su parte, el lavado clínico con agua y jabón requiere entre 40 y 60 segundos.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c5-o1', texto: 'Fricción con base alcohólica: 20 a 30 segundos | Lavado con agua y jabón: 40 a 60 segundos completos.', esCorrecta: true },
        { id: 'c5-o2', texto: 'Fricción con base alcohólica: 10 a 15 segundos | Lavado con agua y jabón: 20 a 30 segundos.', esCorrecta: false },
        { id: 'c5-o3', texto: 'Fricción con base alcohólica: 40 a 60 segundos | Lavado con agua y jabón: 90 a 120 segundos.', esCorrecta: false },
        { id: 'c5-o4', texto: 'Fricción con base alcohólica: mínimo 60 segundos | Lavado con agua y jabón: 15 a 20 segundos breves.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-caso-6',
      enunciado:
        'Caso Clínico 6: El profesional de enfermería termina de administrar medicación oral y acomodar la postura de un paciente encamado en hospitalización general. No hubo contacto con sangre ni drenajes, y el paciente no tiene aislamiento infeccioso. Al salir del cubículo del paciente, ¿cuál es la conducta inmediata que exige el Momento 4 de la OMS?',
      justificacion:
        'El Momento 4 de la OMS ("Después del contacto con el paciente") protege el entorno asistencial circundante y a los próximos pacientes atendidos, eliminando la colonización de flora transitoria que se haya adherido a las manos tras la interacción clínica.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c6-o1', texto: 'Realizar fricción antiséptica con formulación de base alcohólica inmediatamente al abandonar la unidad del paciente (Momento 4), para no diseminar microorganismos al resto del área clínica.', esCorrecta: true },
        { id: 'c6-o2', texto: 'Omitir la higiene si las manos se sienten secas y limpias, postergando la desinfección hasta el final de la ronda de medicamentos.', esCorrecta: false },
        { id: 'c6-o3', texto: 'Higienizarse las manos únicamente si el próximo paciente en la lista se encuentra en estado de inmunosupresión.', esCorrecta: false },
        { id: 'c6-o4', texto: 'Lavar las manos con agua y jabón únicamente al finalizar el turno de enfermería para evitar la resequedad dérmica.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-caso-7',
      enunciado:
        'Caso Clínico 7: Una estudiante de enfermería ingresa a la habitación de un paciente sedado únicamente para silenciar una alarma de la bomba de infusión y ajustar la barandilla de seguridad de la cama. En ningún instante entra en contacto directo con la piel del paciente. Según la directriz del Momento 5 de la OMS, ¿qué acción es obligatoria antes de salir?',
      justificacion:
        'El Momento 5 ("Después del contacto con el entorno del paciente") es mandatorio porque los objetos inanimados del entorno inmediato (barandillas, monitores, mesas de noche) están intensamente colonizados por la microbiota del paciente y constituyen fómites de transmisión.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c7-o1', texto: 'Realizar fricción de manos con solución hidroalcohólica (Momento 5), debido a que las superficies inanimadas del entorno inmediato del paciente están colonizadas por microorganismos patógenos viables.', esCorrecta: true },
        { id: 'c7-o2', texto: 'No es necesaria la higiene de manos ya que no se produjo contacto físico directo con la epidermis del paciente.', esCorrecta: false },
        { id: 'c7-o3', texto: 'Basta con rociar alcohol sobre la pantalla táctil de la bomba de infusión sin realizar higiene personal de manos.', esCorrecta: false },
        { id: 'c7-o4', texto: 'Colocarse guantes limpios antes de tocar las barandillas y conservarlos puestos para entrar a la habitación vecina.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-caso-8',
      enunciado:
        'Caso Clínico 8: Durante la ronda supervisada en el servicio de medicina interna, el docente observa que un estudiante porta reloj de pulsera y un anillo de bodas liso bajo los guantes de examen. De acuerdo con las recomendaciones de técnica aséptica de la OMS y el principio "brazos limpios bajo el codo" (bare below the elbows), ¿cuál es la fundamentación científica para exigir el retiro de estos accesorios?',
      justificacion:
        'La evidencia microbiológica de la OMS demuestra que la piel debajo de anillos y relojes alberga conteos bacterianos significativamente mayores de bacilos gramnegativos y estafilococos, dificulta la cobertura de fricción y eleva el riesgo de rotura de guantes.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c8-o1', texto: 'La piel debajo de anillos y relojes presenta conteos bacterianos significativamente más elevados, dificulta la fricción completa de pliegues cutáneos y aumenta el riesgo de rasgado de guantes.', esCorrecta: true },
        { id: 'c8-o2', texto: 'Las joyas no interfieren con la antisepsia siempre que se aplique el doble de volumen de gel alcohólico sobre ellas.', esCorrecta: false },
        { id: 'c8-o3', texto: 'Solo se prohíben anillos con piedras preciosas incrustadas; los aros lisos y pulseras de goma están universalmente autorizados.', esCorrecta: false },
        { id: 'c8-o4', texto: 'El uso de reloj analógico es mandatorio según la OMS para controlar los segundos del cronómetro durante el lavado clínico.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-caso-9',
      enunciado:
        'Caso Clínico 9: Una profesional de enfermería labora en la unidad de cuidados intensivos neonatales luciendo uñas esculpidas en acrílico con esmalte semipermanente intacto. En relación con las Directrices de la OMS sobre Higiene de Manos en la Atención Sanitaria, ¿por qué está terminantemente desaconsejado el uso de uñas postizas en profesionales sanitarios?',
      justificacion:
        'La OMS desaconseja de manera enfática el uso de uñas artificiales o extensiones en personal sanitario debido a que el espacio subungueal colonizado acumula una altísima carga de bacilos gramnegativos oportunistas (como Pseudomonas aeruginosa) y levaduras (Candida spp.), vinculándose a brotes hospitalarios.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c9-o1', texto: 'Porque el espacio subungueal de las uñas artificiales alberga una mayor carga bacteriana de Pseudomonas aeruginosa y hongos, habiéndose asociado a brotes de bacteriemias hospitalarias.', esCorrecta: true },
        { id: 'c9-o2', texto: 'Porque el polímero acrílico absorbe el alcohol en gel, neutralizando químicamente su propiedad bactericida.', esCorrecta: false },
        { id: 'c9-o3', texto: 'Porque las uñas largas no permiten colocarse guantes quirúrgicos de tallas estándar.', esCorrecta: false },
        { id: 'c9-o4', texto: 'La OMS solo restringe el esmalte cuando tiene más de 3 días de aplicación y presenta grietas visibles.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-caso-10',
      enunciado:
        'Caso Clínico 10: Al evaluar los insumos antisépticos para la estación de higiene del servicio de urgencias, el comité de infecciones hospitalarias revisa formulaciones hidroalcohólicas. ¿Qué rango de concentración de alcohol (etanol o isopropanol) recomienda la OMS para garantizar una rápida desnaturalización proteica y óptima eficacia virucida/bactericida?',
      justificacion:
        'Las formulaciones con 60% a 80% (v/v) de alcohol son las más eficaces microbiológicamente porque la presencia de agua es indispensable para permitir la coagulación y lisis de proteínas celulares; el alcohol al 100% evapora demasiado rápido sin penetrar las membranas.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c10-o1', texto: 'Concentración de alcohol entre el 60% y el 80% (v/v), complementada con humectantes como glicerol para proteger la barrera dérmica.', esCorrecta: true },
        { id: 'c10-o2', texto: 'Alcohol puro absoluto al 96% o 100%, ya que la ausencia de agua potencia la deshidratación y muerte osmótica microbiana.', esCorrecta: false },
        { id: 'c10-o3', texto: 'Concentración baja entre el 30% y el 40%, con el fin de minimizar la irritación y resequedad cutánea en el personal asistencial.', esCorrecta: false },
        { id: 'c10-o4', texto: 'Cualquier preparado con más del 10% de alcohol tiene idéntico poder desinfectante según el estándar de la OMS.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-caso-11',
      enunciado:
        'Caso Clínico 11: Tras completar los 40 a 60 segundos de lavado de manos clínico con agua y jabón, un enfermero procede a secarse en el lavamanos de la central de procedimientos. Según el protocolo estandarizado de la OMS, ¿cuál es el procedimiento correcto de secado y cierre de la grifería manual?',
      justificacion:
        'Cerrar el grifo con la mano recién lavada recontamina la piel inmediatamente con los microorganismos depositados previamente en la manija. La OMS estipula secar con toalla de papel desechable mediante toques suaves y emplear la misma toalla para cerrar el grifo.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c11-o1', texto: 'Secar minuciosamente con toalla de papel desechable mediante palpación suave y utilizar la misma toalla para cerrar el grifo manual sin recontaminar las manos.', esCorrecta: true },
        { id: 'c11-o2', texto: 'Frotar enérgicamente con toalla de tela comunitaria y cerrar la llave utilizando la palma de la mano recién lavada.', esCorrecta: false },
        { id: 'c11-o3', texto: 'Permitir que las manos se sequen agitando los brazos al aire ambiente para no transferir celulosa del papel a la piel.', esCorrecta: false },
        { id: 'c11-o4', texto: 'Cerrar el grifo con la mano mojada antes de tomar la toalla de papel para evitar desperdicio de agua en el servicio.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-caso-12',
      enunciado:
        'Caso Clínico 12: En una sesión de inducción clínica, se profundiza sobre las bases microbiológicas de la higiene de manos. ¿Cuál es la diferencia fundamental entre la flora residente y la flora transitoria de la piel humana y su relevancia en las Infecciones Asociadas a la Atención en Salud (IAAS)?',
      justificacion:
        'La flora transitoria (Staphylococcus aureus, enterobacterias) se adquiere por contacto asistencial, coloniza capas superficiales, sobrevive poco tiempo y causa la gran mayoría de IAAS, eliminándose fácilmente con higiene de manos apropiada.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c12-o1', texto: 'La flora transitoria coloniza capas superficiales de la piel tras contacto asistencial, es la causa principal de infecciones cruzadas y se remueve fácilmente con higiene de manos apropiada.', esCorrecta: true },
        { id: 'c12-o2', texto: 'La flora transitoria está incrustada en folículos pilosos profundos y no puede ser removida con fricción hidroalcohólica convencional.', esCorrecta: false },
        { id: 'c12-o3', texto: 'La flora residente está compuesta exclusivamente por virus patógenos letales adquiridos durante intervenciones quirúrgicas.', esCorrecta: false },
        { id: 'c12-o4', texto: 'La flora transitoria protege permanentemente la piel del profesional y no debe removerse durante la atención sanitaria.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-caso-13',
      enunciado:
        'Caso Clínico 13: El personal asistencial culmina la atención de un paciente en aislamiento por gotas y contacto en la unidad de cuidados especiales. Viste bata impermeable, guantes, mascarilla de alta eficiencia N95 y protector ocular. Conforme a las recomendaciones de bioseguridad de la OMS, ¿en qué momento exacto de la secuencia de retiro de EPP debe realizarse la fricción de manos intermedia?',
      justificacion:
        'Los guantes son la pieza más densamente contaminada del EPP. Retirarlos primero e higienizarse las manos de inmediato con solución alcohólica previene la autoinoculación al manipular el protector ocular o la mascarilla.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c13-o1', texto: 'Inmediatamente después de retirarse los guantes contaminados y antes de proceder a retirar la protección ocular y la mascarilla facial.', esCorrecta: true },
        { id: 'c13-o2', texto: 'Únicamente tras haber retirado absolutamente todas las prendas del EPP y encontrarse fuera del área clínica.', esCorrecta: false },
        { id: 'c13-o3', texto: 'Antes de descalzarse los guantes, rociándolos con hipoclorito de sodio para manipular las prendas limpias.', esCorrecta: false },
        { id: 'c13-o4', texto: 'No es necesaria la higiene intermedia ya que la superficie interna de los guantes es estéril.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-caso-14',
      enunciado:
        'Caso Clínico 14: En una auditoría de calidad asistencial con lámpara de luz ultravioleta y reactivo fluorescente, se constata que varios estudiantes dejan áreas no alcanzadas tras la fricción. ¿Cuáles son las regiones anatómicas de las manos que con mayor frecuencia se omiten involuntariamente y cómo lo soluciona la técnica protocolaria de 6 pasos de la OMS?',
      justificacion:
        'Estudios de fluorescencia demuestran que los pulgares, los lechos ungueales y los espacios interdigitales son las áreas más omitidas. Por ello, la OMS diseñó el Paso 5 (rotación de pulgares) y el Paso 6 (rotación de yemas sobre palma).',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c14-o1', texto: 'Los pulgares, las puntas de los dedos (yemas/lechos ungueales) y los espacios interdigitales; se corrigen mediante el frotado en rotación del pulgar y la fricción de yemas contra la palma opuesta.', esCorrecta: true },
        { id: 'c14-o2', texto: 'El centro de la palma; se soluciona únicamente frotando palma contra palma con mayor presión mecánica.', esCorrecta: false },
        { id: 'c14-o3', texto: 'La cara dorsal del antebrazo; se corrige ampliando el lavado obligatorio hasta el tercio medio del brazo.', esCorrecta: false },
        { id: 'c14-o4', texto: 'Las líneas de flexión palmar; se corrigen sumergiendo las manos durante 3 minutos en cubetas antisépticas.', esCorrecta: false },
      ],
    },
    {
      id: 'oms-caso-15',
      enunciado:
        'Caso Clínico 15: Un profesional de enfermería en área de urgencias experimenta eritema, ardor y pequeñas grietas dérmicas en el dorso de las manos por el elevado volumen de procedimientos diarios. ¿Cuál es la recomendación formal de la OMS para preservar la barrera epidérmica y prevenir la dermatitis ocupacional?',
      justificacion:
        'Las formulaciones hidroalcohólicas de grado hospitalario enriquecidas con humectantes (como glicerol al 1.45%) son sustancialmente menos lesivas para el estrato córneo que el lavado repetido con jabón y agua, reduciendo el riesgo de dermatitis.',
      correctIndexFallback: 0,
      opciones: [
        { id: 'c15-o1', texto: 'Priorizar la fricción con soluciones hidroalcohólicas que contengan emolientes protectores (como glicerol) por encima del lavado reiterado con jabón, y aplicar lociones hidratantes al terminar el turno.', esCorrecta: true },
        { id: 'c15-o2', texto: 'Reducir a menos de la mitad las indicaciones de higiene de manos durante el turno para permitir la cicatrización dérmica.', esCorrecta: false },
        { id: 'c15-o3', texto: 'Utilizar agua muy caliente con detergente quirúrgico para desinfectar y cauterizar las microfisuras de la piel.', esCorrecta: false },
        { id: 'c15-o4', texto: 'Permanecer con el mismo par de guantes de látex durante todo el turno laboral sin retirarlos en ningún momento.', esCorrecta: false },
      ],
    },
  ];

  /**
   * Genera los encabezados con Bearer token para solicitudes autenticadas
   */
  private obtenerHeadersAuth(): HttpHeaders {
    const token = this.authService.token();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * Obtiene las preguntas clínicas para estudiantes (omitiendo esCorrecta)
   * GET /api/preguntas/estudiante
   */
  obtenerPreguntasEstudiante(): Observable<PreguntasEstudianteResponse> {
    this.cargando.set(true);
    this.error.set(null);

    return this.http
      .get<PreguntasEstudianteResponse>(`${this.apiUrl}/preguntas/estudiante`, {
        headers: this.obtenerHeadersAuth(),
      })
      .pipe(
        tap({
          next: (res) => {
            this.preguntasEstudiante.set(res.preguntas || []);
            this.cargando.set(false);
          },
          error: (err) => {
            const errorMsg =
              err.error?.error || 'Error al cargar las preguntas clínicas desde el servidor.';
            this.error.set(errorMsg);
            this.cargando.set(false);
          },
        })
      );
  }

  /**
   * ALGORITMO DINÁMICO OMS:
   * Selecciona aleatoriamente 5 preguntas técnicas del banco asegurando que sean
   * COMPLETAMENTE DIFERENTES a las de su intento anterior (sin repetir secuencia).
   */
  obtenerCincoPreguntasAleatorias(tipo: 'PRE' | 'POST'): Observable<PreguntaEstudiante[]> {
    return this.obtenerPreguntasEstudiante().pipe(
      map((res) => {
        const poolBackend = res.preguntas && res.preguntas.length >= 5 ? res.preguntas : [];
        return this.seleccionarPreguntasDiferentes(tipo, poolBackend);
      }),
      catchError(() => {
        // En caso de desconexión temporal, usar el banco local de 15 preguntas OMS
        const seleccionadas = this.seleccionarPreguntasDiferentes(tipo, this.bancoOficialOMS);
        return of(seleccionadas);
      })
    );
  }

  /**
   * Lógica interna del algoritmo de selección aleatoria sin repetición consecutiva
   */
  private seleccionarPreguntasDiferentes(
    tipo: 'PRE' | 'POST',
    fuente: PreguntaEstudiante[]
  ): PreguntaEstudiante[] {
    const poolCompleto = fuente.length >= 5 ? fuente : this.bancoOficialOMS;

    // Recuperar IDs de las preguntas del intento previo del estudiante
    const storageKey = `manos_seguras_prev_${tipo}_ids`;
    let prevIds: string[] = [];
    try {
      const guardados = localStorage.getItem(storageKey);
      if (guardados) prevIds = JSON.parse(guardados);
    } catch {
      prevIds = [];
    }

    // Filtrar candidatas que NO hayan salido en el intento previo
    let candidatas = poolCompleto.filter((p) => !prevIds.includes(String(p.id)));

    // Si por alguna razón el pool no tiene al menos 5 preguntas restantes, mezclar todo el pool
    if (candidatas.length < 5) {
      candidatas = [...poolCompleto];
    }

    // Mezclar candidatas usando el algoritmo Fisher-Yates
    const barajadas = this.barajarArray([...candidatas]);

    // Tomar exactamente 5 preguntas
    const seleccionadas = barajadas.slice(0, 5);

    // Guardar los nuevos 5 IDs para evitar repetición en el siguiente intento
    try {
      localStorage.setItem(storageKey, JSON.stringify(seleccionadas.map((p) => String(p.id))));
    } catch {
      // Ignorar si localStorage está deshabilitado
    }

    // Barajar también las opciones de cada pregunta para que no se memorice la posición (A, B, C, D)
    return seleccionadas.map((p) => {
      // Buscar información adicional de justificación en el banco local si viene del backend sin ella
      const localRef = this.bancoOficialOMS.find((b) => b.enunciado === p.enunciado);
      return {
        ...p,
        justificacion: p.justificacion || localRef?.justificacion || 'Protocolo de Técnica Aséptica y 5 Momentos OMS.',
        correctIndexFallback: p.correctIndexFallback !== undefined ? p.correctIndexFallback : localRef?.correctIndexFallback,
        opciones: this.barajarArray([...p.opciones]),
      };
    });
  }

  /**
   * Algoritmo Fisher-Yates Shuffle para desordenar arrays de forma imparcial
   */
  private barajarArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Crea una nueva pregunta clínica con sus opciones (exclusivo para Docente)
   * POST /api/preguntas
   */
  crearPregunta(pregunta: CrearPreguntaDto): Observable<CrearPreguntaResponse> {
    return this.http.post<CrearPreguntaResponse>(
      `${this.apiUrl}/preguntas`,
      pregunta,
      { headers: this.obtenerHeadersAuth() }
    );
  }

  /**
   * Obtiene todas las preguntas clínicas con sus respuestas correctas y estadísticas (Docente)
   * GET /api/preguntas/docente
   */
  obtenerPreguntasDocente(): Observable<PreguntasDocenteResponse> {
    return this.http.get<PreguntasDocenteResponse>(
      `${this.apiUrl}/preguntas/docente`,
      { headers: this.obtenerHeadersAuth() }
    );
  }

  /**
   * Envía las respuestas del test diagnóstico para calificación automática y guardado en Supabase
   * POST /api/preguntas/diagnostico
   */
  registrarDiagnostico(datos: EnviarDiagnosticoDto): Observable<EnviarDiagnosticoResponse> {
    const payload = {
      ...datos,
      usuarioId: datos.usuarioId || this.authService.usuarioActual()?.id,
    };

    return this.http.post<EnviarDiagnosticoResponse>(
      `${this.apiUrl}/preguntas/diagnostico`,
      payload,
      { headers: this.obtenerHeadersAuth() }
    );
  }

  /**
   * Elimina o desactiva una pregunta clínica (Solo Docentes)
   * DELETE /api/preguntas/:id
   */
  eliminarPregunta(id: string): Observable<{ mensaje: string; accion: string }> {
    return this.http.delete<{ mensaje: string; accion: string }>(
      `${this.apiUrl}/preguntas/${id}`,
      { headers: this.obtenerHeadersAuth() }
    );
  }
}
