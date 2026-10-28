import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma';
import { Rol } from '@prisma/client';

async function seed() {
  console.log('🌱 Iniciando script de siembra (seed) para Manos Seguras...');

  // 1. Crear o recuperar usuario Docente
  const correoDocente = 'docente@ucc.edu.co';
  const codigoDocente = 'DOC-2026';
  const rawPassword = 'Docente2026*';

  let docente = await prisma.usuario.findFirst({
    where: {
      OR: [{ correo: correoDocente }, { codigoEstudiantil: codigoDocente }],
    },
  });

  if (!docente) {
    const passwordHashed = await bcrypt.hash(rawPassword, 10);
    docente = await prisma.usuario.create({
      data: {
        nombre: 'Docente Enfermería UCC',
        codigoEstudiantil: codigoDocente,
        correo: correoDocente,
        password: passwordHashed,
        rol: Rol.DOCENTE,
        consentimiento: true,
      },
    });
    console.log(`✅ Usuario Docente creado exitosamente: ${docente.nombre} (${docente.correo})`);
  } else {
    console.log(`ℹ️ Usuario Docente ya existente en la base de datos: ${docente.nombre} (${docente.correo})`);
  }

  // 2. Banco Robusto de 5 Casos Clínicos Estandarizados OMS
  const bancoPreguntasClinicas = [
    // Caso 1: Momento 1 (Antes del contacto con el paciente) ante examen físico rutinario
    {
      enunciado:
        'Caso Clínico 1: El profesional de enfermería ingresa a la unidad de un paciente hospitalizado para valorar signos vitales y realizar exploración física rutinaria cardiopulmonar. El paciente no presenta heridas abiertas ni drenajes activos. De acuerdo con los 5 Momentos de la OMS, ¿cuál es la indicación aséptica obligatoria antes de tocar al paciente?',
      justificacion:
        'Según la estrategia de los 5 Momentos de la OMS, el Momento 1 ("Antes del contacto con el paciente") es imperativo inmediatamente antes de cualquier examen físico, palpación o toma de signos vitales. Su propósito primordial es proteger al paciente de la colonización cruzada por microorganismos exógenos transportados transitoriamente en las manos del personal asistencial.',
      opciones: [
        {
          texto:
            'Efectuar fricción antiséptica con solución hidroalcohólica inmediatamente antes del contacto (Momento 1), protegiendo al paciente de patógenos del entorno asistencial.',
          esCorrecta: true,
        },
        {
          texto:
            'Colocarse guantes de procedimiento limpios de forma directa sin higiene de manos previa, al tratarse de un examen no invasivo.',
          esCorrecta: false,
        },
        {
          texto:
            'Realizar la higiene de manos únicamente al finalizar la valoración completa (Momento 4), ya que el paciente no tiene aislamiento.',
          esCorrecta: false,
        },
        {
          texto:
            'Omitir la higiene si las manos lucen visiblemente limpias y desinfectar exclusivamente las olivas del fonendoscopio con alcohol.',
          esCorrecta: false,
        },
      ],
    },

    // Caso 2: Momento 2 (Antes de una tarea aséptica) en canalización de vía periférica o cateterismo
    {
      enunciado:
        'Caso Clínico 2: Se programa la canalización de un catéter venoso periférico en el antebrazo de un paciente para terapia antibiótica. El enfermero preparó la bandeja con los insumos estériles y seleccionó el trayecto venoso. Conforme al protocolo de técnica aséptica y el Momento 2 de la OMS, ¿cuál es la conducta adecuada previa a la punción?',
      justificacion:
        'El Momento 2 de la OMS ("Antes de realizar una tarea limpia o aséptica") previene la inoculación de microorganismos directamente al torrente sanguíneo o tejidos estériles. Debe ejecutarse inmediatamente antes del procedimiento (mediante fricción con base alcohólica si las manos no tienen suciedad visible) y previo a calzarse los guantes, ya que estos no sustituyen la higiene previa ni son barrera infranqueable frente a microperforaciones.',
      opciones: [
        {
          texto:
            'Realizar higiene de manos antiséptica inmediatamente antes de manipular insumos estériles y puncionar el acceso vascular (Momento 2), y posteriormente colocarse los guantes.',
          esCorrecta: true,
        },
        {
          texto:
            'Realizar la higiene únicamente al culminar la venopunción y asegurar el apósito transparente sobre el sitio de inserción.',
          esCorrecta: false,
        },
        {
          texto:
            'Confiar exclusivamente en el uso de guantes estériles, puesto que la higiene previa se considera redundante con material estéril.',
          esCorrecta: false,
        },
        {
          texto:
            'Solo higienizarse las manos si se produce sangrado accidental durante la inserción del teflón intravascular.',
          esCorrecta: false,
        },
      ],
    },

    // Caso 3: Manejo de exposición a fluidos corporales y retiro de guantes (Momento 3 y técnica correcta)
    {
      enunciado:
        'Caso Clínico 3: Un enfermero finaliza el vaciado y medición de la orina de un catéter vesical cerrado utilizando guantes de examen limpios. Al retirar los guantes mediante la técnica pico-guante sin rozar la superficie externa contaminada, ¿cuál es la conducta mandatoria según las normas de bioseguridad hospitalaria?',
      justificacion:
        'La OMS estipula que el uso de guantes no reemplaza en ningún caso la higiene de manos. El Momento 3 ("Después del riesgo de exposición a líquidos corporales") exige realizar higiene de manos obligatoria de inmediato tras quitarse los guantes, debido a la posible contaminación de la piel por microporos indetectables o durante la maniobra de retiro de los elementos de protección personal.',
      opciones: [
        {
          texto:
            'Realizar higiene de manos inmediata al retirar los guantes (Momento 3: Después del riesgo de exposición a fluidos), dado que los guantes no brindan protección microbiológica absoluta.',
          esCorrecta: true,
        },
        {
          texto:
            'Omitir la higiene si los guantes se mantuvieron visualmente íntegros y no hubo humedad percibida sobre la epidermis.',
          esCorrecta: false,
        },
        {
          texto:
            'Aplicar solución hidroalcohólica directamente sobre los guantes puestos para descontaminarlos y reutilizarlos con otro paciente.',
          esCorrecta: false,
        },
        {
          texto:
            'Postergar la higiene hasta salir de la sala de hospitalización, limpiando únicamente el exterior del recipiente de medición.',
          esCorrecta: false,
        },
      ],
    },

    // Caso 4: Diferencia de indicación entre lavado con agua y jabón vs. fricción con base alcohólica
    {
      enunciado:
        'Caso Clínico 4: Durante la atención en sala de aislamiento a un paciente diagnosticado con colitis pseudomembranosa por Clostridioides difficile, o ante la presencia de manos con suciedad macroscópica visible o sangre, ¿por qué la directriz OMS establece el lavado con agua y jabón en lugar del alcohol en gel?',
      justificacion:
        'Las preparaciones de base alcohólica son potentes bactericidas de acción rápida, pero carecen de eficacia esporicida contra Clostridioides difficile y ven reducida su efectividad ante biocargas orgánicas espesas. Por tanto, ante esporas o suciedad visible, es mandatorio el lavado mecánico con agua y jabón para emulsionar y arrastrar físicamente los patógenos por fricción hidrodinámica.',
      opciones: [
        {
          texto:
            'Porque las esporas de Clostridioides difficile y la materia orgánica resisten la acción del alcohol; se requiere el arrastre mecánico y detergencia del agua y jabón.',
          esCorrecta: true,
        },
        {
          texto:
            'Porque el agua y jabón neutraliza químicamente las toxinas A y B en menos de 5 segundos a diferencia del alcohol en gel.',
          esCorrecta: false,
        },
        {
          texto:
            'Porque el alcohol al 70% degrada la capa lipídica de las esporas convirtiéndolas en formas vegetativas más invasivas.',
          esCorrecta: false,
        },
        {
          texto:
            'Porque el lavado con agua y jabón es de menor duración que la fricción hidroalcohólica recomendada en aislamientos.',
          esCorrecta: false,
        },
      ],
    },

    // Caso 5: Tiempo mínimo de fricción recomendado por la OMS para solución hidroalcohólica vs. lavado con agua y jabón
    {
      enunciado:
        'Caso Clínico 5: En un taller de simulación clínica de enfermería, se instruye sobre los tiempos de contacto óptimos recomendados por la OMS para garantizar la eficacia antimicrobiana. ¿Cuáles son los rangos temporales protocolarios para la fricción con solución hidroalcohólica y para el lavado con agua y jabón, respectivamente?',
      justificacion:
        'La OMS estipula que la fricción antiséptica con formulaciones a base de alcohol debe durar entre 20 y 30 segundos (frotando sistemáticamente hasta que el producto se evapore por completo y las manos queden secas). Por su parte, el lavado clínico con agua y jabón requiere entre 40 y 60 segundos para permitir la humectación, jabonado completo en los 6 pasos, enjuague y secado aséptico.',
      opciones: [
        {
          texto:
            'Fricción con base alcohólica: 20 a 30 segundos | Lavado con agua y jabón: 40 a 60 segundos completos.',
          esCorrecta: true,
        },
        {
          texto:
            'Fricción con base alcohólica: 10 a 15 segundos | Lavado con agua y jabón: 20 a 30 segundos.',
          esCorrecta: false,
        },
        {
          texto:
            'Fricción con base alcohólica: 40 a 60 segundos | Lavado con agua y jabón: 90 a 120 segundos.',
          esCorrecta: false,
        },
        {
          texto:
            'Fricción con base alcohólica: mínimo 60 segundos | Lavado con agua y jabón: 15 a 20 segundos breves.',
          esCorrecta: false,
        },
      ],
    },
  ];

  console.log(`📋 Sincronizando banco de ${bancoPreguntasClinicas.length} preguntas clínicas OMS...`);

  // Desactivar preguntas obsoletas previas para que los estudiantes solo reciban las 5 preguntas oficiales
  await prisma.pregunta.updateMany({
    data: { activa: false },
  });

  for (let i = 0; i < bancoPreguntasClinicas.length; i++) {
    const item = bancoPreguntasClinicas[i];

    // Buscar si ya existe la pregunta
    const preguntaExistente = await prisma.pregunta.findFirst({
      where: { enunciado: item.enunciado },
      include: { opciones: true },
    });

    if (preguntaExistente) {
      // Reactivar y actualizar justificación
      await prisma.pregunta.update({
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
          await prisma.opcionRespuesta.create({
            data: {
              preguntaId: preguntaExistente.id,
              texto: op.texto,
              esCorrecta: op.esCorrecta,
            },
          });
        }
      }
      console.log(`   [✓] Pregunta #${i + 1} actualizada y activada: "${item.enunciado.substring(0, 50)}..."`);
    } else {
      const creada = await prisma.pregunta.create({
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
      console.log(
        `   [+] Pregunta #${i + 1} insertada exitosamente: "${creada.enunciado.substring(0, 50)}..." (${creada.opciones.length} opciones)`
      );
    }
  }

  // 3. Resumen cuantitativo final
  const totalUsuarios = await prisma.usuario.count();
  const totalPreguntasActivas = await prisma.pregunta.count({ where: { activa: true } });
  const totalPreguntasGeneral = await prisma.pregunta.count();
  const totalOpciones = await prisma.opcionRespuesta.count();

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
    await prisma.$disconnect();
  });
