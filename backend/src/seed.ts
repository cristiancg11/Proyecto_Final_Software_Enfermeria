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

  // 2. Definición de preguntas clínicas oficiales OMS
  const preguntasSeed = [
    {
      enunciado: '¿Cuál es el primer momento para la higiene de manos según la estrategia multimodal de los 5 Momentos de la OMS?',
      justificacion:
        'Según la OMS, el Momento 1 es "Antes de tocar al paciente". Su objetivo es proteger al paciente de la colonización y transmisión de microorganismos patógenos transportados en las manos del personal de salud o del entorno previo.',
      opciones: [
        { texto: 'Antes de tocar al paciente', esCorrecta: true },
        { texto: 'Después de tocar al paciente', esCorrecta: false },
        { texto: 'Después del riesgo de exposición a líquidos corporales', esCorrecta: false },
        { texto: 'Antes de realizar una tarea limpia o aséptica', esCorrecta: false },
      ],
    },
    {
      enunciado: 'De acuerdo con las directrices de la OMS, ¿cuál es la duración recomendada para la fricción de manos con una preparación de base alcohólica?',
      justificacion:
        'La OMS estipula que la fricción antiséptica con soluciones o geles a base de alcohol debe durar entre 20 y 30 segundos, asegurando que el producto cubra todas las superficies de las manos y se seque por evaporación sin uso de toallas.',
      opciones: [
        { texto: 'Entre 20 y 30 segundos', esCorrecta: true },
        { texto: 'Entre 40 y 60 segundos', esCorrecta: false },
        { texto: 'Entre 10 y 15 segundos', esCorrecta: false },
        { texto: 'Mínimo 2 minutos con abundante solución', esCorrecta: false },
      ],
    },
    {
      enunciado: 'Durante la práctica clínica, ¿en cuál de las siguientes situaciones está estrictamente indicado el lavado de manos con agua y jabón en lugar del uso de alcohol en gel?',
      justificacion:
        'El lavado de manos con agua y jabón es mandatario cuando las manos están visiblemente sucias o manchadas de sangre u otros fluidos corporales, tras usar el baño, o ante exposición documentada o sospecha de microorganismos esporulados como Clostridioides difficile, ya que el alcohol no erradica las esporas.',
      opciones: [
        {
          texto: 'Cuando las manos estén visiblemente sucias o ante sospecha o contacto con esporas (ej. Clostridioides difficile)',
          esCorrecta: true,
        },
        { texto: 'Únicamente al finalizar el turno hospitalario', esCorrecta: false },
        { texto: 'Siempre que se ingrese a una habitación de hospitalización general', esCorrecta: false },
        { texto: 'Solo cuando no se disponga de guantes estériles o limpios', esCorrecta: false },
      ],
    },
  ];

  console.log(`📋 Insertando ${preguntasSeed.length} preguntas clínicas vinculadas al docente...`);

  for (let i = 0; i < preguntasSeed.length; i++) {
    const item = preguntasSeed[i];
    const preguntaExistente = await prisma.pregunta.findFirst({
      where: { enunciado: item.enunciado },
    });

    if (!preguntaExistente) {
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
      console.log(`   [+] Pregunta #${i + 1} insertada: "${creada.enunciado.substring(0, 50)}..." (${creada.opciones.length} opciones)`);
    } else {
      console.log(`   [i] Pregunta #${i + 1} ya existía en el banco: "${item.enunciado.substring(0, 50)}..."`);
    }
  }

  // 3. Resumen final
  const totalUsuarios = await prisma.usuario.count();
  const totalPreguntas = await prisma.pregunta.count();
  const totalOpciones = await prisma.opcionRespuesta.count();

  console.log('----------------------------------------------------');
  console.log('🎉 Proceso de siembra (seed) completado con éxito:');
  console.log(`   • Total Usuarios en DB: ${totalUsuarios}`);
  console.log(`   • Total Preguntas Clínicas: ${totalPreguntas}`);
  console.log(`   • Total Opciones de Respuesta: ${totalOpciones}`);
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
