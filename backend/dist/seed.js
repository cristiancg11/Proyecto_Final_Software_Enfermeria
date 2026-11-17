"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("./lib/prisma");
const client_1 = require("@prisma/client");
async function seed() {
    console.log('🌱 Iniciando script de siembra (seed) para Manos Seguras...');
    // 1. Crear o recuperar usuario Docente
    const correoDocente = 'docente@ucc.edu.co';
    const codigoDocente = 'DOC-2026';
    const rawPassword = 'Docente2026*';
    let docente = await prisma_1.prisma.usuario.findFirst({
        where: {
            OR: [{ correo: correoDocente }, { codigoEstudiantil: codigoDocente }],
        },
    });
    if (!docente) {
        const passwordHashed = await bcryptjs_1.default.hash(rawPassword, 10);
        docente = await prisma_1.prisma.usuario.create({
            data: {
                nombre: 'Docente Enfermería UCC',
                codigoEstudiantil: codigoDocente,
                correo: correoDocente,
                password: passwordHashed,
                rol: client_1.Rol.DOCENTE,
                consentimiento: true,
            },
        });
        console.log(`✅ Usuario Docente creado exitosamente: ${docente.nombre} (${docente.correo})`);
    }
    else {
        console.log(`ℹ️ Usuario Docente ya existente en la base de datos: ${docente.nombre} (${docente.correo})`);
    }
    // 2. Banco Robusto de 15 Preguntas Técnicas y Casos Clínicos Estandarizados OMS
    const bancoPreguntasClinicas = [
        // Caso 1: Momento 1 (Antes del contacto con el paciente) ante examen físico rutinario
        {
            enunciado: 'Caso Clínico 1: El profesional de enfermería ingresa a la unidad de un paciente hospitalizado para valorar signos vitales y realizar exploración física rutinaria cardiopulmonar. El paciente no presenta heridas abiertas ni drenajes activos. De acuerdo con los 5 Momentos de la OMS, ¿cuál es la indicación aséptica obligatoria antes de tocar al paciente?',
            justificacion: 'Según la estrategia de los 5 Momentos de la OMS, el Momento 1 ("Antes del contacto con el paciente") es imperativo inmediatamente antes de cualquier examen físico, palpación o toma de signos vitales. Su propósito primordial es proteger al paciente de la colonización cruzada por microorganismos exógenos transportados transitoriamente en las manos del personal asistencial.',
            opciones: [
                {
                    texto: 'Efectuar fricción antiséptica con solución hidroalcohólica inmediatamente antes del contacto (Momento 1), protegiendo al paciente de patógenos del entorno asistencial.',
                    esCorrecta: true,
                },
                {
                    texto: 'Colocarse guantes de procedimiento limpios de forma directa sin higiene de manos previa, al tratarse de un examen no invasivo.',
                    esCorrecta: false,
                },
                {
                    texto: 'Realizar la higiene de manos únicamente al finalizar la valoración completa (Momento 4), ya que el paciente no tiene aislamiento.',
                    esCorrecta: false,
                },
                {
                    texto: 'Omitir la higiene si las manos lucen visiblemente limpias y desinfectar exclusivamente las olivas del fonendoscopio con alcohol.',
                    esCorrecta: false,
                },
            ],
        },
        // Caso 2: Momento 2 (Antes de una tarea aséptica) en canalización de vía periférica o cateterismo
        {
            enunciado: 'Caso Clínico 2: Se programa la canalización de un catéter venoso periférico en el antebrazo de un paciente para terapia antibiótica. El enfermero preparó la bandeja con los insumos estériles y seleccionó el trayecto venoso. Conforme al protocolo de técnica aséptica y el Momento 2 de la OMS, ¿cuál es la conducta adecuada previa a la punción?',
            justificacion: 'El Momento 2 de la OMS ("Antes de realizar una tarea limpia o aséptica") previene la inoculación de microorganismos directamente al torrente sanguíneo o tejidos estériles. Debe ejecutarse inmediatamente antes del procedimiento (mediante fricción con base alcohólica si las manos no tienen suciedad visible) y previo a calzarse los guantes, ya que estos no sustituyen la higiene previa ni son barrera infranqueable frente a microperforaciones.',
            opciones: [
                {
                    texto: 'Realizar higiene de manos antiséptica inmediatamente antes de manipular insumos estériles y puncionar el acceso vascular (Momento 2), y posteriormente colocarse los guantes.',
                    esCorrecta: true,
                },
                {
                    texto: 'Realizar la higiene únicamente al culminar la venopunción y asegurar el apósito transparente sobre el sitio de inserción.',
                    esCorrecta: false,
                },
                {
                    texto: 'Confiar exclusivamente en el uso de guantes estériles, puesto que la higiene previa se considera redundante con material estéril.',
                    esCorrecta: false,
                },
                {
                    texto: 'Solo higienizarse las manos si se produce sangrado accidental durante la inserción del teflón intravascular.',
                    esCorrecta: false,
                },
            ],
        },
        // Caso 3: Manejo de exposición a fluidos corporales y retiro de guantes (Momento 3 y técnica correcta)
        {
            enunciado: 'Caso Clínico 3: Un enfermero finaliza el vaciado y medición de la orina de un catéter vesical cerrado utilizando guantes de examen limpios. Al retirar los guantes mediante la técnica pico-guante sin rozar la superficie externa contaminada, ¿cuál es la conducta mandatoria según las normas de bioseguridad hospitalaria?',
            justificacion: 'La OMS estipula que el uso de guantes no reemplaza en ningún caso la higiene de manos. El Momento 3 ("Después del riesgo de exposición a líquidos corporales") exige realizar higiene de manos obligatoria de inmediato tras quitarse los guantes, debido a la posible contaminación de la piel por microporos indetectables o durante la maniobra de retiro de los elementos de protección personal.',
            opciones: [
                {
                    texto: 'Realizar higiene de manos inmediata al retirar los guantes (Momento 3: Después del riesgo de exposición a fluidos), dado que los guantes no brindan protección microbiológica absoluta.',
                    esCorrecta: true,
                },
                {
                    texto: 'Omitir la higiene si los guantes se mantuvieron visualmente íntegros y no hubo humedad percibida sobre la epidermis.',
                    esCorrecta: false,
                },
                {
                    texto: 'Aplicar solución hidroalcohólica directamente sobre los guantes puestos para descontaminarlos y reutilizarlos con otro paciente.',
                    esCorrecta: false,
                },
                {
                    texto: 'Postergar la higiene hasta salir de la sala de hospitalización, limpiando únicamente el exterior del recipiente de medición.',
                    esCorrecta: false,
                },
            ],
        },
        // Caso 4: Diferencia de indicación entre lavado con agua y jabón vs. fricción con base alcohólica
        {
            enunciado: 'Caso Clínico 4: Durante la atención en sala de aislamiento a un paciente diagnosticado con colitis pseudomembranosa por Clostridioides difficile, o ante la presencia de manos con suciedad macroscópica visible o sangre, ¿por qué la directriz OMS establece el lavado con agua y jabón en lugar del alcohol en gel?',
            justificacion: 'Las preparaciones de base alcohólica son potentes bactericidas de acción rápida, pero carecen de eficacia esporicida contra Clostridioides difficile y ven reducida su efectividad ante biocargas orgánicas espesas. Por tanto, ante esporas o suciedad visible, es mandatorio el lavado mecánico con agua y jabón para emulsionar y arrastrar físicamente los patógenos por fricción hidrodinámica.',
            opciones: [
                {
                    texto: 'Porque las esporas de Clostridioides difficile y la materia orgánica resisten la acción del alcohol; se requiere el arrastre mecánico y detergencia del agua y jabón.',
                    esCorrecta: true,
                },
                {
                    texto: 'Porque el agua y jabón neutraliza químicamente las toxinas A y B en menos de 5 segundos a diferencia del alcohol en gel.',
                    esCorrecta: false,
                },
                {
                    texto: 'Porque el alcohol al 70% degrada la capa lipídica de las esporas convirtiéndolas en formas vegetativas más invasivas.',
                    esCorrecta: false,
                },
                {
                    texto: 'Porque el lavado con agua y jabón es de menor duración que la fricción hidroalcohólica recomendada en aislamientos.',
                    esCorrecta: false,
                },
            ],
        },
        // Caso 5: Tiempo mínimo de fricción recomendado por la OMS para solución hidroalcohólica vs. lavado con agua y jabón
        {
            enunciado: 'Caso Clínico 5: En un taller de simulación clínica de enfermería, se instruye sobre los tiempos de contacto óptimos recomendados por la OMS para garantizar la eficacia antimicrobiana. ¿Cuáles son los rangos temporales protocolarios para la fricción con solución hidroalcohólica y para el lavado con agua y jabón, respectivamente?',
            justificacion: 'La OMS estipula que la fricción antiséptica con formulaciones a base de alcohol debe durar entre 20 y 30 segundos (frotando sistemáticamente hasta que el producto se evapore por completo y las manos queden secas). Por su parte, el lavado clínico con agua y jabón requiere entre 40 y 60 segundos para permitir la humectación, jabonado completo en los 6 pasos, enjuague y secado aséptico.',
            opciones: [
                {
                    texto: 'Fricción con base alcohólica: 20 a 30 segundos | Lavado con agua y jabón: 40 a 60 segundos completos.',
                    esCorrecta: true,
                },
                {
                    texto: 'Fricción con base alcohólica: 10 a 15 segundos | Lavado con agua y jabón: 20 a 30 segundos.',
                    esCorrecta: false,
                },
                {
                    texto: 'Fricción con base alcohólica: 40 a 60 segundos | Lavado con agua y jabón: 90 a 120 segundos.',
                    esCorrecta: false,
                },
                {
                    texto: 'Fricción con base alcohólica: mínimo 60 segundos | Lavado con agua y jabón: 15 a 20 segundos breves.',
                    esCorrecta: false,
                },
            ],
        },
        // Caso 6: Momento 4 (Después del contacto con el paciente)
        {
            enunciado: 'Caso Clínico 6: El profesional de enfermería termina de administrar medicación oral y acomodar la postura de un paciente encamado en hospitalización general. No hubo contacto con sangre ni drenajes, y el paciente no tiene aislamiento infeccioso. Al salir del cubículo del paciente, ¿cuál es la conducta inmediata que exige el Momento 4 de la OMS?',
            justificacion: 'El Momento 4 de la OMS ("Después del contacto con el paciente") protege el entorno asistencial circundante y a los próximos pacientes atendidos, eliminando la colonización de flora transitoria que se haya adherido a las manos tras la interacción clínica con el paciente o su cama.',
            opciones: [
                {
                    texto: 'Realizar fricción antiséptica con formulación de base alcohólica inmediatamente al abandonar la unidad del paciente (Momento 4), para no diseminar microorganismos al resto del área clínica.',
                    esCorrecta: true,
                },
                {
                    texto: 'Omitir la higiene si las manos se sienten secas y limpias, postergando la desinfección hasta el final de la ronda de medicamentos.',
                    esCorrecta: false,
                },
                {
                    texto: 'Higienizarse las manos únicamente si el próximo paciente en la lista se encuentra en estado de inmunosupresión.',
                    esCorrecta: false,
                },
                {
                    texto: 'Lavar las manos con agua y jabón únicamente al finalizar el turno de enfermería para evitar la resequedad dérmica.',
                    esCorrecta: false,
                },
            ],
        },
        // Caso 7: Momento 5 (Después del contacto con el entorno del paciente)
        {
            enunciado: 'Caso Clínico 7: Una estudiante de enfermería ingresa a la habitación de un paciente sedado únicamente para silenciar una alarma de la bomba de infusión y ajustar la barandilla de seguridad de la cama. En ningún instante entra en contacto directo con la piel del paciente. Según la directriz del Momento 5 de la OMS, ¿qué acción es obligatoria antes de salir?',
            justificacion: 'El Momento 5 ("Después del contacto con el entorno del paciente") es mandatorio porque los objetos inanimados del entorno inmediato (barandillas, monitores, mesas de noche) están intensamente colonizados por la microbiota del paciente y constituyen fómites de transmisión cruzada en el hospital.',
            opciones: [
                {
                    texto: 'Realizar fricción de manos con solución hidroalcohólica (Momento 5), debido a que las superficies inanimadas del entorno inmediato del paciente están colonizadas por microorganismos patógenos viables.',
                    esCorrecta: true,
                },
                {
                    texto: 'No es necesaria la higiene de manos ya que no se produjo contacto físico directo con la epidermis del paciente.',
                    esCorrecta: false,
                },
                {
                    texto: 'Basta con rociar alcohol sobre la pantalla táctil de la bomba de infusión sin realizar higiene personal de manos.',
                    esCorrecta: false,
                },
                {
                    texto: 'Colocarse guantes limpios antes de tocar las barandillas y conservarlos puestos para entrar a la habitación vecina.',
                    esCorrecta: false,
                },
            ],
        },
        // Caso 8: Uso de joyas, anillos y relojes en la práctica asistencial
        {
            enunciado: 'Caso Clínico 8: Durante la ronda supervisada en el servicio de medicina interna, el docente observa que un estudiante porta reloj de pulsera y un anillo de bodas liso bajo los guantes de examen. De acuerdo con las recomendaciones de técnica aséptica de la OMS y el principio "brazos limpios bajo el codo" (bare below the elbows), ¿cuál es la fundamentación científica para exigir el retiro de estos accesorios?',
            justificacion: 'La evidencia microbiológica de la OMS demuestra que la piel debajo de anillos y relojes alberga conteos bacterianos significativamente mayores de bacilos gramnegativos y estafilococos, dificulta la cobertura completa de fricción antiséptica y eleva considerablemente la tasa de microperforaciones en los guantes.',
            opciones: [
                {
                    texto: 'La piel debajo de anillos y relojes presenta conteos bacterianos significativamente más elevados, dificulta la fricción completa de pliegues cutáneos y aumenta el riesgo de rasgado de guantes.',
                    esCorrecta: true,
                },
                {
                    texto: 'Las joyas no interfieren con la antisepsia siempre que se aplique el doble de volumen de gel alcohólico sobre ellas.',
                    esCorrecta: false,
                },
                {
                    texto: 'Solo se prohíben anillos con piedras preciosas incrustadas; los aros lisos y pulseras de goma están universalmente autorizados.',
                    esCorrecta: false,
                },
                {
                    texto: 'El uso de reloj analógico es mandatorio según la OMS para controlar los segundos del cronómetro durante el lavado clínico.',
                    esCorrecta: false,
                },
            ],
        },
        // Caso 9: Uñas artificiales y esmalte en unidades clínicas
        {
            enunciado: 'Caso Clínico 9: Una profesional de enfermería labora en la unidad de cuidados intensivos neonatales luciendo uñas esculpidas en acrílico con esmalte semipermanente intacto. En relación con las Directrices de la OMS sobre Higiene de Manos en la Atención Sanitaria, ¿por qué está terminantemente desaconsejado el uso de uñas postizas en profesionales sanitarios?',
            justificacion: 'La OMS desaconseja de manera enfática el uso de uñas artificiales o extensiones en personal sanitario debido a que el espacio subungueal colonizado acumula una altísima carga de bacilos gramnegativos oportunistas (como Pseudomonas aeruginosa) y levaduras (Candida spp.), vinculándose directamente con brotes letales de bacteriemia nosocomial.',
            opciones: [
                {
                    texto: 'Porque el espacio subungueal de las uñas artificiales alberga una mayor carga bacteriana de Pseudomonas aeruginosa y hongos, habiéndose asociado a brotes de bacteriemias hospitalarias.',
                    esCorrecta: true,
                },
                {
                    texto: 'Porque el polímero acrílico absorbe el alcohol en gel, neutralizando químicamente su propiedad bactericida.',
                    esCorrecta: false,
                },
                {
                    texto: 'Porque las uñas largas no permiten colocarse guantes quirúrgicos de tallas estándar.',
                    esCorrecta: false,
                },
                {
                    texto: 'La OMS solo restringe el esmalte cuando tiene más de 3 días de aplicación y presenta grietas visibles.',
                    esCorrecta: false,
                },
            ],
        },
        // Caso 10: Concentración y composición óptima de las soluciones alcohólicas
        {
            enunciado: 'Caso Clínico 10: Al evaluar los insumos antisépticos para la estación de higiene del servicio de urgencias, el comité de infecciones hospitalarias revisa formulaciones hidroalcohólicas. ¿Qué rango de concentración de alcohol (etanol o isopropanol) recomienda la OMS para garantizar una rápida desnaturalización proteica y óptima eficacia virucida/bactericida?',
            justificacion: 'Las formulaciones con 60% a 80% (v/v) de alcohol son las más eficaces microbiológicamente porque la presencia de agua es indispensable para permitir la coagulación y lisis de proteínas celulares; el alcohol al 100% evapora demasiado rápido sin penetrar las membranas y coagula superficialmente la pared de los patógenos.',
            opciones: [
                {
                    texto: 'Concentración de alcohol entre el 60% y el 80% (v/v), complementada con humectantes como glicerol para proteger la barrera dérmica.',
                    esCorrecta: true,
                },
                {
                    texto: 'Alcohol puro absoluto al 96% o 100%, ya que la ausencia de agua potencia la deshidratación y muerte osmótica microbiana.',
                    esCorrecta: false,
                },
                {
                    texto: 'Concentración baja entre el 30% y el 40%, con el fin de minimizar la irritación y resequedad cutánea en el personal asistencial.',
                    esCorrecta: false,
                },
                {
                    texto: 'Cualquier preparado con más del 10% de alcohol tiene idéntico poder desinfectante según el estándar de la OMS.',
                    esCorrecta: false,
                },
            ],
        },
        // Caso 11: Técnica de secado de manos y cierre del grifo con toalla
        {
            enunciado: 'Caso Clínico 11: Tras completar los 40 a 60 segundos de lavado de manos clínico con agua y jabón, un enfermero procede a secarse en el lavamanos de la central de procedimientos. Según el protocolo estandarizado de la OMS, ¿cuál es el procedimiento correcto de secado y cierre de la grifería manual?',
            justificacion: 'Cerrar el grifo con la mano recién lavada recontamina la piel inmediatamente con los microorganismos depositados previamente en la manija. La OMS estipula secar meticulosamente con toalla de papel desechable mediante toques suaves y emplear la misma toalla usada para cerrar la manija antes de desecharla.',
            opciones: [
                {
                    texto: 'Secar minuciosamente con toalla de papel desechable mediante palpación suave y utilizar la misma toalla para cerrar el grifo manual sin recontaminar las manos.',
                    esCorrecta: true,
                },
                {
                    texto: 'Frotar enérgicamente con toalla de tela comunitaria y cerrar la llave utilizando la palma de la mano recién lavada.',
                    esCorrecta: false,
                },
                {
                    texto: 'Permitir que las manos se sequen agitando los brazos al aire ambiente para no transferir celulosa del papel a la piel.',
                    esCorrecta: false,
                },
                {
                    texto: 'Cerrar el grifo con la mano mojada antes de tomar la toalla de papel para evitar desperdicio de agua en el servicio.',
                    esCorrecta: false,
                },
            ],
        },
        // Caso 12: Flora microbiana residente vs. flora transitoria
        {
            enunciado: 'Caso Clínico 12: En una sesión de inducción clínica, se profundiza sobre las bases microbiológicas de la higiene de manos. ¿Cuál es la diferencia fundamental entre la flora residente y la flora transitoria de la piel humana y su relevancia en las Infecciones Asociadas a la Atención en Salud (IAAS)?',
            justificacion: 'La flora transitoria (como Staphylococcus aureus, Enterococcus y bacilos gramnegativos) se adquiere por contacto con pacientes y superficies; coloniza capas superficiales de la epidermis, sobrevive poco tiempo y causa la inmensa mayoría de IAAS, pero afortunadamente se elimina con facilidad mediante la técnica adecuada de higiene.',
            opciones: [
                {
                    texto: 'La flora transitoria coloniza capas superficiales de la piel tras contacto asistencial, es la causa principal de infecciones cruzadas y se remueve fácilmente con higiene de manos apropiada.',
                    esCorrecta: true,
                },
                {
                    texto: 'La flora transitoria está incrustada en folículos pilosos profundos y no puede ser removida con fricción hidroalcohólica convencional.',
                    esCorrecta: false,
                },
                {
                    texto: 'La flora residente está compuesta exclusivamente por virus patógenos letales adquiridos durante intervenciones quirúrgicas.',
                    esCorrecta: false,
                },
                {
                    texto: 'La flora transitoria protege permanentemente la piel del profesional y no debe removerse durante la atención sanitaria.',
                    esCorrecta: false,
                },
            ],
        },
        // Caso 13: Higiene de manos en el protocolo de retiro de Equipo de Protección Personal (EPP)
        {
            enunciado: 'Caso Clínico 13: El personal asistencial culmina la atención de un paciente en aislamiento por gotas y contacto en la unidad de cuidados especiales. Viste bata impermeable, guantes, mascarilla de alta eficiencia N95 y protector ocular. Conforme a las recomendaciones de bioseguridad de la OMS, ¿en qué momento exacto de la secuencia de retiro de EPP debe realizarse la fricción de manos intermedia?',
            justificacion: 'Los guantes son la pieza más densamente contaminada del EPP. Retirarlos primero e higienizarse las manos de inmediato con solución alcohólica previene la autoinoculación al manipular el protector ocular, la mascarilla facial o la cabeza.',
            opciones: [
                {
                    texto: 'Inmediatamente después de retirarse los guantes contaminados y antes de proceder a retirar la protección ocular y la mascarilla facial.',
                    esCorrecta: true,
                },
                {
                    texto: 'Únicamente tras haber retirado absolutamente todas las prendas del EPP y encontrarse fuera del área clínica.',
                    esCorrecta: false,
                },
                {
                    texto: 'Antes de descalzarse los guantes, rociándolos con hipoclorito de sodio para manipular las prendas limpias.',
                    esCorrecta: false,
                },
                {
                    texto: 'No es necesaria la higiene intermedia ya que la superficie interna de los guantes es estéril.',
                    esCorrecta: false,
                },
            ],
        },
        // Caso 14: Biomecánica del frotado: pasos críticos de pulgares y yemas
        {
            enunciado: 'Caso Clínico 14: En una auditoría de calidad asistencial con lámpara de luz ultravioleta y reactivo fluorescente, se constata que varios estudiantes dejan áreas no alcanzadas tras la fricción. ¿Cuáles son las regiones anatómicas de las manos que con mayor frecuencia se omiten involuntariamente y cómo lo soluciona la técnica protocolaria de 6 pasos de la OMS?',
            justificacion: 'Estudios de fluorescencia demuestran consistentemente que los pulgares, los lechos ungueales (yemas de dedos) y los espacios interdigitales son las áreas más frecuentemente omitidas. Por ello, la OMS diseñó específicamente el Paso 5 (rotación de pulgares) y el Paso 6 (fricción circular de yemas en palma opuesta).',
            opciones: [
                {
                    texto: 'Los pulgares, las puntas de los dedos (yemas/lechos ungueales) y los espacios interdigitales; se corrigen mediante el frotado en rotación del pulgar y la fricción de yemas contra la palma opuesta.',
                    esCorrecta: true,
                },
                {
                    texto: 'El centro de la palma; se soluciona únicamente frotando palma contra palma con mayor presión mecánica.',
                    esCorrecta: false,
                },
                {
                    texto: 'La cara dorsal del antebrazo; se corrige ampliando el lavado obligatorio hasta el tercio medio del brazo.',
                    esCorrecta: false,
                },
                {
                    texto: 'Las líneas de flexión palmar; se corrigen sumergiendo las manos durante 3 minutos en cubetas antisépticas.',
                    esCorrecta: false,
                },
            ],
        },
        // Caso 15: Cuidado de la piel y prevención de dermatitis por higiene frecuente
        {
            enunciado: 'Caso Clínico 15: Un profesional de enfermería en área de urgencias experimenta eritema, ardor y pequeñas grietas dérmicas en el dorso de las manos por el elevado volumen de procedimientos diarios. ¿Cuál es la recomendación formal de la OMS para preservar la barrera epidérmica y prevenir la dermatitis ocupacional?',
            justificacion: 'Las formulaciones hidroalcohólicas de grado hospitalario enriquecidas con humectantes (como glicerol al 1.45%) son sustancialmente menos lesivas y resecantes para el estrato córneo que el lavado repetido con jabón y agua, reduciendo el riesgo de dermatitis.',
            opciones: [
                {
                    texto: 'Priorizar la fricción con soluciones hidroalcohólicas que contengan emolientes protectores (como glicerol) por encima del lavado reiterado con jabón, y aplicar lociones hidratantes al terminar el turno.',
                    esCorrecta: true,
                },
                {
                    texto: 'Reducir a menos de la mitad las indicaciones de higiene de manos durante el turno para permitir la cicatrización dérmica.',
                    esCorrecta: false,
                },
                {
                    texto: 'Utilizar agua muy caliente con detergente quirúrgico para desinfectar y cauterizar las microfisuras de la piel.',
                    esCorrecta: false,
                },
                {
                    texto: 'Permanecer con el mismo par de guantes de látex durante todo el turno laboral sin retirarlos en ningún momento.',
                    esCorrecta: false,
                },
            ],
        },
    ];
    console.log(`📋 Sincronizando banco de ${bancoPreguntasClinicas.length} preguntas clínicas OMS...`);
    // Desactivar preguntas obsoletas previas
    await prisma_1.prisma.pregunta.updateMany({
        data: { activa: false },
    });
    for (let i = 0; i < bancoPreguntasClinicas.length; i++) {
        const item = bancoPreguntasClinicas[i];
        // Buscar si ya existe la pregunta
        const preguntaExistente = await prisma_1.prisma.pregunta.findFirst({
            where: { enunciado: item.enunciado },
            include: { opciones: true },
        });
        if (preguntaExistente) {
            // Reactivar y actualizar justificación
            await prisma_1.prisma.pregunta.update({
                where: { id: preguntaExistente.id },
                data: {
                    activa: true,
                    justificacion: item.justificacion,
                    creadaPorId: docente.id,
                },
            });
            // Si no tiene opciones o faltan, actualizar opciones
            if (preguntaExistente.opciones.length === 0) {
                for (const op of item.opciones) {
                    await prisma_1.prisma.opcionRespuesta.create({
                        data: {
                            preguntaId: preguntaExistente.id,
                            texto: op.texto,
                            esCorrecta: op.esCorrecta,
                        },
                    });
                }
            }
            console.log(`   [✓] Pregunta #${i + 1} actualizada y activada: "${item.enunciado.substring(0, 50)}..."`);
        }
        else {
            const creada = await prisma_1.prisma.pregunta.create({
                data: {
                    enunciado: item.enunciado,
                    justificacion: item.justificacion,
                    activa: true,
                    creadaPorId: docente.id,
                    opciones: {
                        create: item.opciones.map((op) => ({
                            texto: op.texto,
                            esCorrecta: op.esCorrecta,
                        })),
                    },
                },
                include: {
                    opciones: true,
                },
            });
            console.log(`   [+] Pregunta #${i + 1} insertada exitosamente: "${creada.enunciado.substring(0, 50)}..." (${creada.opciones.length} opciones)`);
        }
    }
    // 3. Resumen cuantitativo final
    const totalUsuarios = await prisma_1.prisma.usuario.count();
    const totalPreguntasActivas = await prisma_1.prisma.pregunta.count({ where: { activa: true } });
    const totalPreguntasGeneral = await prisma_1.prisma.pregunta.count();
    const totalOpciones = await prisma_1.prisma.opcionRespuesta.count();
    console.log('----------------------------------------------------');
    console.log('🎉 Proceso de siembra (seed) completado con éxito:');
    console.log(`   • Total Usuarios en DB: ${totalUsuarios}`);
    console.log(`   • Total Preguntas Activas para Evaluación: ${totalPreguntasActivas}`);
    console.log(`   • Total Preguntas Históricas: ${totalPreguntasGeneral}`);
    console.log(`   • Total Opciones de Respuesta en DB: ${totalOpciones}`);
    console.log('----------------------------------------------------');
}
seed()
    .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
