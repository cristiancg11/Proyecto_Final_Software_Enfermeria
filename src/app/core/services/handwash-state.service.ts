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
    {
      id: 6,
      question:
        'Caso Clínico 6: El profesional de enfermería termina de administrar medicación oral y acomodar la postura de un paciente encamado en hospitalización general. No hubo contacto con sangre ni drenajes, y el paciente no tiene aislamiento infeccioso. Al salir del cubículo del paciente, ¿cuál es la conducta inmediata que exige el Momento 4 de la OMS?',
      context: '5 Momentos OMS • Momento 4 (Después del Contacto con el Paciente)',
      options: [
        'Realizar fricción antiséptica con formulación de base alcohólica inmediatamente al abandonar la unidad del paciente (Momento 4), para no diseminar microorganismos al resto del área clínica.',
        'Omitir la higiene si las manos se sienten secas y limpias, postergando la desinfección hasta el final de la ronda de medicamentos.',
        'Higienizarse las manos únicamente si el próximo paciente en la lista se encuentra en estado de inmunosupresión.',
        'Lavar las manos con agua y jabón únicamente al finalizar el turno de enfermería para evitar la resequedad dérmica.',
      ],
      correctIndex: 0,
      rationale:
        'El Momento 4 de la OMS ("Después del contacto con el paciente") protege el entorno asistencial circundante y a los próximos pacientes atendidos, eliminando la colonización de flora transitoria que se haya adherido a las manos tras la interacción clínica.',
    },
    {
      id: 7,
      question:
        'Caso Clínico 7: Una estudiante de enfermería ingresa a la habitación de un paciente sedado únicamente para silenciar una alarma de la bomba de infusión y ajustar la barandilla de seguridad de la cama. En ningún instante entra en contacto directo con la piel del paciente. Según la directriz del Momento 5 de la OMS, ¿qué acción es obligatoria antes de salir?',
      context: '5 Momentos OMS • Momento 5 (Después del Contacto con el Entorno)',
      options: [
        'Realizar fricción de manos con solución hidroalcohólica (Momento 5), debido a que las superficies inanimadas del entorno inmediato del paciente están colonizadas por microorganismos patógenos viables.',
        'No es necesaria la higiene de manos ya que no se produjo contacto físico directo con la epidermis del paciente.',
        'Basta con rociar alcohol sobre la pantalla táctil de la bomba de infusión sin realizar higiene personal de manos.',
        'Colocarse guantes limpios antes de tocar las barandillas y conservarlos puestos para entrar a la habitación vecina.',
      ],
      correctIndex: 0,
      rationale:
        'El Momento 5 ("Después del contacto con el entorno del paciente") es mandatorio porque los objetos inanimados del entorno inmediato (barandillas, monitores, mesas de noche) están intensamente colonizados por la microbiota del paciente y constituyen fómites de transmisión.',
    },
    {
      id: 8,
      question:
        'Caso Clínico 8: Durante la ronda supervisada en el servicio de medicina interna, el docente observa que un estudiante porta reloj de pulsera y un anillo de bodas liso bajo los guantes de examen. De acuerdo con las recomendaciones de técnica aséptica de la OMS y el principio "brazos limpios bajo el codo" (bare below the elbows), ¿cuál es la fundamentación científica para exigir el retiro de estos accesorios?',
      context: 'Técnica Aséptica OMS • Bare Below the Elbows y Joyas',
      options: [
        'La piel debajo de anillos y relojes presenta conteos bacterianos significativamente más elevados, dificulta la fricción completa de pliegues cutáneos y aumenta el riesgo de rasgado de guantes.',
        'Las joyas no interfieren con la antisepsia siempre que se aplique el doble de volumen de gel alcohólico sobre ellas.',
        'Solo se prohíben anillos con piedras preciosas incrustadas; los aros lisos y pulseras de goma están universalmente autorizados.',
        'El uso de reloj analógico es mandatorio según la OMS para controlar los segundos del cronómetro durante el lavado clínico.',
      ],
      correctIndex: 0,
      rationale:
        'La evidencia microbiológica de la OMS demuestra que la piel debajo de anillos y relojes alberga conteos bacterianos significativamente mayores de bacilos gramnegativos y estafilococos, dificulta la cobertura de fricción y eleva el riesgo de rotura de guantes.',
    },
    {
      id: 9,
      question:
        'Caso Clínico 9: Una profesional de enfermería labora en la unidad de cuidados intensivos neonatales luciendo uñas esculpidas en acrílico con esmalte semipermanente intacto. En relación con las Directrices de la OMS sobre Higiene de Manos en la Atención Sanitaria, ¿por qué está terminantemente desaconsejado el uso de uñas postizas en profesionales sanitarios?',
      context: 'Bioseguridad Hospitalaria • Uñas Artificiales y Esmalte',
      options: [
        'Porque el espacio subungueal de las uñas artificiales alberga una mayor carga bacteriana de Pseudomonas aeruginosa y hongos, habiéndose asociado a brotes de bacteriemias hospitalarias.',
        'Porque el polímero acrílico absorbe el alcohol en gel, neutralizando químicamente su propiedad bactericida.',
        'Porque las uñas largas no permiten colocarse guantes quirúrgicos de tallas estándar.',
        'La OMS solo restringe el esmalte cuando tiene más de 3 días de aplicación y presenta grietas visibles.',
      ],
      correctIndex: 0,
      rationale:
        'La OMS desaconseja de manera enfática el uso de uñas artificiales o extensiones en personal sanitario debido a que el espacio subungueal colonizado acumula una altísima carga de bacilos gramnegativos oportunistas (como Pseudomonas aeruginosa) y levaduras (Candida spp.), vinculándose a brotes hospitalarios.',
    },
    {
      id: 10,
      question:
        'Caso Clínico 10: Al evaluar los insumos antisépticos para la estación de higiene del servicio de urgencias, el comité de infecciones hospitalarias revisa formulaciones hidroalcohólicas. ¿Qué rango de concentración de alcohol (etanol o isopropanol) recomienda la OMS para garantizar una rápida desnaturalización proteica y óptima eficacia virucida/bactericida?',
      context: 'Insumos Antisépticos OMS • Concentración de Alcohol',
      options: [
        'Concentración de alcohol entre el 60% y el 80% (v/v), complementada con humectantes como glicerol para proteger la barrera dérmica.',
        'Alcohol puro absoluto al 96% o 100%, ya que la ausencia de agua potencia la deshidratación y muerte osmótica microbiana.',
        'Concentración baja entre el 30% y el 40%, con el fin de minimizar la irritación y resequedad cutánea en el personal asistencial.',
        'Cualquier preparado con más del 10% de alcohol tiene idéntico poder desinfectante según el estándar de la OMS.',
      ],
      correctIndex: 0,
      rationale:
        'Las formulaciones con 60% a 80% (v/v) de alcohol son las más eficaces microbiológicamente porque la presencia de agua es indispensable para permitir la coagulación y lisis de proteínas celulares; el alcohol al 100% evapora demasiado rápido sin penetrar las membranas.',
    },
    {
      id: 11,
      question:
        'Caso Clínico 11: Tras completar los 40 a 60 segundos de lavado de manos clínico con agua y jabón, un enfermero procede a secarse en el lavamanos de la central de procedimientos. Según el protocolo estandarizado de la OMS, ¿cuál es el procedimiento correcto de secado y cierre de la grifería manual?',
      context: 'Técnica de Lavado OMS • Secado Aséptico y Cierre de Grifo',
      options: [
        'Secar minuciosamente con toalla de papel desechable mediante palpación suave y utilizar la misma toalla para cerrar el grifo manual sin recontaminar las manos.',
        'Frotar enérgicamente con toalla de tela comunitaria y cerrar la llave utilizando la palma de la mano recién lavada.',
        'Permitir que las manos se sequen agitando los brazos al aire ambiente para no transferir celulosa del papel a la piel.',
        'Cerrar el grifo con la mano mojada antes de tomar la toalla de papel para evitar desperdicio de agua en el servicio.',
      ],
      correctIndex: 0,
      rationale:
        'Cerrar el grifo con la mano recién lavada recontamina la piel inmediatamente con los microorganismos depositados previamente en la manija. La OMS estipula secar con toalla de papel desechable mediante toques suaves y emplear la misma toalla para cerrar el grifo.',
    },
    {
      id: 12,
      question:
        'Caso Clínico 12: En una sesión de inducción clínica, se profundiza sobre las bases microbiológicas de la higiene de manos. ¿Cuál es la diferencia fundamental entre la flora residente y la flora transitoria de la piel humana y su relevancia en las Infecciones Asociadas a la Atención en Salud (IAAS)?',
      context: 'Microbiología Clínica • Flora Transitoria vs. Residente',
      options: [
        'La flora transitoria coloniza capas superficiales de la piel tras contacto asistencial, es la causa principal de infecciones cruzadas y se remueve fácilmente con higiene de manos apropiada.',
        'La flora transitoria está incrustada en folículos pilosos profundos y no puede ser removida con fricción hidroalcohólica convencional.',
        'La flora residente está compuesta exclusivamente por virus patógenos letales adquiridos durante intervenciones quirúrgicas.',
        'La flora transitoria protege permanentemente la piel del profesional y no debe removerse durante la atención sanitaria.',
      ],
      correctIndex: 0,
      rationale:
        'La flora transitoria (Staphylococcus aureus, enterobacterias) se adquiere por contacto asistencial, coloniza capas superficiales, sobrevive poco tiempo y causa la gran mayoría de IAAS, eliminándose fácilmente con higiene de manos apropiada.',
    },
    {
      id: 13,
      question:
        'Caso Clínico 13: El personal asistencial culmina la atención de un paciente en aislamiento por gotas y contacto en la unidad de cuidados especiales. Viste bata impermeable, guantes, mascarilla de alta eficiencia N95 y protector ocular. Conforme a las recomendaciones de bioseguridad de la OMS, ¿en qué momento exacto de la secuencia de retiro de EPP debe realizarse la fricción de manos intermedia?',
      context: 'Bioseguridad Hospitalaria • Secuencia de Retiro de EPP',
      options: [
        'Inmediatamente después de retirarse los guantes contaminados y antes de proceder a retirar la protección ocular y la mascarilla facial.',
        'Únicamente tras haber retirado absolutamente todas las prendas del EPP y encontrarse fuera del área clínica.',
        'Antes de descalzarse los guantes, rociándolos con hipoclorito de sodio para manipular las prendas limpias.',
        'No es necesaria la higiene intermedia ya que la superficie interna de los guantes es estéril.',
      ],
      correctIndex: 0,
      rationale:
        'Los guantes son la pieza más densamente contaminada del EPP. Retirarlos primero e higienizarse las manos de inmediato con solución alcohólica previene la autoinoculación al manipular el protector ocular o la mascarilla.',
    },
    {
      id: 14,
      question:
        'Caso Clínico 14: En una auditoría de calidad asistencial con lámpara de luz ultravioleta y reactivo fluorescente, se constata que varios estudiantes dejan áreas no alcanzadas tras la fricción. ¿Cuáles son las regiones anatómicas de las manos que con mayor frecuencia se omiten involuntariamente y cómo lo soluciona la técnica protocolaria de 6 pasos de la OMS?',
      context: 'Biomecánica del Frotado OMS • Pulgares y Yemas',
      options: [
        'Los pulgares, las puntas de los dedos (yemas/lechos ungueales) y los espacios interdigitales; se corrigen mediante el frotado en rotación del pulgar y la fricción de yemas contra la palma opuesta.',
        'El centro de la palma; se soluciona únicamente frotando palma contra palma con mayor presión mecánica.',
        'La cara dorsal del antebrazo; se corrige ampliando el lavado obligatorio hasta el tercio medio del brazo.',
        'Las líneas de flexión palmar; se corrigen sumergiendo las manos durante 3 minutos en cubetas antisépticas.',
      ],
      correctIndex: 0,
      rationale:
        'Estudios de fluorescencia demuestran que los pulgares, los lechos ungueales y los espacios interdigitales son las áreas más omitidas. Por ello, la OMS diseñó el Paso 5 (rotación de pulgares) y el Paso 6 (rotación de yemas sobre palma).',
    },
    {
      id: 15,
      question:
        'Caso Clínico 15: Un profesional de enfermería en área de urgencias experimenta eritema, ardor y pequeñas grietas dérmicas en el dorso de las manos por el elevado volumen de procedimientos diarios. ¿Cuál es la recomendación formal de la OMS para preservar la barrera epidérmica y prevenir la dermatitis ocupacional?',
      context: 'Salud Ocupacional • Prevención de Dermatitis y Emolientes',
      options: [
        'Priorizar la fricción con soluciones hidroalcohólicas que contengan emolientes protectores (como glicerol) por encima del lavado reiterado con jabón, y aplicar lociones hidratantes al terminar el turno.',
        'Reducir a menos de la mitad las indicaciones de higiene de manos durante el turno para permitir la cicatrización dérmica.',
        'Utilizar agua muy caliente con detergente quirúrgico para desinfectar y cauterizar las microfisuras de la piel.',
        'Permanecer con el mismo par de guantes de látex durante todo el turno laboral sin retirarlos en ningún momento.',
      ],
      correctIndex: 0,
      rationale:
        'Las formulaciones hidroalcohólicas de grado hospitalario enriquecidas con humectantes (como glicerol al 1.45%) son sustancialmente menos lesivas para el estrato córneo que el lavado repetido con jabón y agua, reduciendo el riesgo de dermatitis.',
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

  unlockStep(step: number): void {
    const next = Math.max(this._maxUnlockedStep(), Math.min(7, Math.max(1, step)));
    this._maxUnlockedStep.set(next);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('manos_seguras_max_step', String(next));
    }
  }

  resetProgressToStepOne(): void {
    this._maxUnlockedStep.set(1);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('manos_seguras_max_step', '1');
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
