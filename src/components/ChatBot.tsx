'use client';

import React, { useMemo } from 'react';
import ChatBot, { Flow, Settings, Styles } from 'react-chatbotify';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

/* ==========================================================================
   SISTEMA DE NORMALIZACIÓN Y REGLAS DE PALABRAS CLAVE
   ========================================================================== */

interface ReglaRuta {
  palabras: string[];
  destino: string;
}

const REGLAS_RUTAS: ReglaRuta[] = [
  {
    palabras: [
      'contact', 'hablar con alguien', 'hablar con una persona', 'whatsapp',
      'telefono', 'llamar', 'humano', 'atencion al socio', 'atencion al cliente',
      'asesor', 'representante', 'numero', 'mail', 'correo'
    ],
    destino: 'contacto'
  },
  {
    palabras: [
      'asociar', 'ser socio', 'quiero unirme', 'socio nuevo', 'hacerme socio',
      'afiliar', 'afiliacion', 'inscripcion socio', 'darme de alta', 'alta'
    ],
    destino: 'asociarme'
  },
  {
    palabras: [
      'pagar', 'cuota', 'pago', 'deuda', 'comprobante', 'transferencia',
      'cbu', 'alias', 'factura', 'saldo', 'abonar', 'reportar pago'
    ],
    destino: 'pagar'
  },
  {
    palabras: [
      'taller', 'curso', 'capacitacion', 'capacitaciones', 'material de estudio',
      'clase', 'inscrib', 'anotarme', 'estudiar', 'aprender'
    ],
    destino: 'talleres'
  },
  {
    palabras: [
      'beneficio', 'ventaja', 'descuento', 'por que asociarme', 'que gano',
      'credito', 'prestamo', 'vivienda', 'sorteo', 'convenio'
    ],
    destino: 'beneficios'
  },
  {
    palabras: [
      'noticia', 'novedad', 'que paso', 'ultimas noticias', 'comunicado',
      'institucional', 'evento', 'asamblea'
    ],
    destino: 'noticias'
  },
  {
    palabras: ['otra consulta', 'hacer otra consulta', 'consulta', 'opciones'],
    destino: 'menu_opciones'
  },
  {
    palabras: [
      'hola', 'buenas', 'buen dia', 'buenas tardes', 'buenas noches',
      'hey', 'que tal', 'menu', 'inicio', 'empezar', 'ayuda', 'volver', 'volver al menu'
    ],
    destino: 'start'
  },
  {
    palabras: ['gracias', 'chau', 'adios', 'nos vemos', 'hasta luego', 'listo', 'muchas gracias'],
    destino: 'despedida'
  }
];

function normalizarTexto(texto: string): string {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function resolverRutaPorMensaje(params: { userInput: string }): string {
  const textoLimpio = normalizarTexto(params.userInput);
  const reglaCoincidente = REGLAS_RUTAS.find((regla) =>
    regla.palabras.some((palabra) => {
      const palabraLimpia = normalizarTexto(palabra);
      return textoLimpio.includes(palabraLimpia);
    })
  );
  return reglaCoincidente ? reglaCoincidente.destino : 'no_entendido';
}

/* ==========================================================================
   COMPONENTE PRINCIPAL
   ========================================================================== */

export default function AppChatBot() {
  const { data: session, status } = useSession();
  const estaLogueado = status === 'authenticated';
  const nombreUsuario = session?.user?.nombre ? ` ${session.user.nombre.split(' ')[0]}` : '';

  // Menú dinámico: si está logueado, se excluye "¿Cómo me asocio?"
  const opcionesMenu = useMemo(() => {
    const base = [
      '¿Cuáles son los beneficios?',
      '¿Cómo pago mi cuota?',
      '¿Cómo me inscribo a un taller?',
      'Últimas noticias',
      'Quiero hablar con una persona'
    ];
    return estaLogueado ? base : ['¿Cómo me asocio?', ...base];
  }, [estaLogueado]);

  const evaluarSeleccionOpciones = (params: { userInput: string }): string => {
    switch (params.userInput) {
      case '¿Cómo me asocio?':
        return 'asociarme';
      case '¿Cuáles son los beneficios?':
        return 'beneficios';
      case '¿Cómo pago mi cuota?':
        return 'pagar';
      case '¿Cómo me inscribo a un taller?':
        return 'talleres';
      case 'Últimas noticias':
        return 'noticias';
      case 'Quiero hablar con una persona':
        return 'contacto';
      case '⬅ Volver al menú':
        return 'start';
      case 'Hacer otra consulta':
        return 'menu_opciones';
      default:
        return resolverRutaPorMensaje(params);
    }
  };

  const flow: Flow = {
    start: {
      message: `¡Hola${nombreUsuario}! 👋 Soy Meli IA, asistente virtual de Cooperativa Riojana. ¿En qué te puedo ayudar hoy?`,
      options: opcionesMenu,
      path: evaluarSeleccionOpciones
    },

    menu_opciones: {
      options: opcionesMenu,
      path: evaluarSeleccionOpciones
    },

    asociarme: {
      message: estaLogueado
        ? '¡Ya contás con tu cuenta de socio activa! Si necesitás realizar algún trámite, podés gestionar tus cuotas o talleres desde tu portal.'
        : 'Completá el formulario de "Solicitud de Asociación" con tus datos personales y de contacto. Nuestro equipo administrativo lo revisa y te aprueba en 48-72hs hábiles; luego te llegará un email con tus credenciales de acceso al Portal del Socio.',
      component: estaLogueado ? undefined : (
        <div className="mt-2">
          <Link
            href="/asociarme"
            className="inline-block rounded-md bg-[#0f3d3a] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#16504c]"
          >
            Ir al formulario de asociación →
          </Link>
        </div>
      ),
      options: ['⬅ Volver al menú', 'Hacer otra consulta'],
      path: (params: { userInput: string }) => {
        if (params.userInput === '⬅ Volver al menú') return 'start';
        if (params.userInput === 'Hacer otra consulta') return 'menu_opciones';
        return resolverRutaPorMensaje(params);
      }
    },

    beneficios: {
      message:
        'Como socio accedés a créditos con tasas preferenciales, descuentos exclusivos en comercios adheridos, talleres y capacitaciones gratuitas, y prioridad en los planes de vivienda cooperativa.',
      options: estaLogueado
        ? ['⬅ Volver al menú', 'Hacer otra consulta']
        : ['⬅ Volver al menú', '¿Cómo me asocio?', 'Hacer otra consulta'],
      path: (params: { userInput: string }) => {
        if (params.userInput === '⬅ Volver al menú') return 'start';
        if (params.userInput === 'Hacer otra consulta') return 'menu_opciones';
        if (params.userInput === '¿Cómo me asocio?') return 'asociarme';
        return resolverRutaPorMensaje(params);
      }
    },

    pagar: {
      message: estaLogueado
        ? 'Desde tu portal podés ingresar directamente a "Reportar Pago", elegir el período a abonar, consultar los datos de CBU/Alias y adjuntar tu comprobante de transferencia. La validación demora 24-48hs hábiles.'
        : 'Para abonar tu cuota debés iniciar sesión en el Portal del Socio, ingresar a "Reportar Pago", elegir el período y adjuntar tu comprobante de transferencia.',
      component: (
        <div className="mt-2">
          <Link
            href={estaLogueado ? '/portal/pagos/reportar' : '/login'}
            className="inline-block rounded-md bg-[#0f3d3a] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#16504c]"
          >
            {estaLogueado ? 'Ir a Reportar Pago →' : 'Iniciar sesión en el Portal →'}
          </Link>
        </div>
      ),
      options: ['⬅ Volver al menú', 'Hacer otra consulta'],
      path: (params: { userInput: string }) => {
        if (params.userInput === '⬅ Volver al menú') return 'start';
        if (params.userInput === 'Hacer otra consulta') return 'menu_opciones';
        return resolverRutaPorMensaje(params);
      }
    },

    talleres: {
      message:
        'Revisá los talleres y cursos formativos disponibles en nuestra sección. Podés inscribirte directamente desde la web. Si necesitás darte de baja, podés gestionarlo dentro de las 48hs posteriores desde "Mis Talleres" en tu Portal.',
      component: (
        <div className="mt-2">
          <Link
            href="/talleres"
            className="inline-block rounded-md bg-[#0f3d3a] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#16504c]"
          >
            Ver talleres disponibles →
          </Link>
        </div>
      ),
      options: ['⬅ Volver al menú', 'Hacer otra consulta'],
      path: (params: { userInput: string }) => {
        if (params.userInput === '⬅ Volver al menú') return 'start';
        if (params.userInput === 'Hacer otra consulta') return 'menu_opciones';
        return resolverRutaPorMensaje(params);
      }
    },

    noticias: {
      message:
        'Mantenete al día con los comunicados oficiales, proyectos barriales, asambleas y convenios institucionales en nuestra sección de noticias.',
      component: (
        <div className="mt-2">
          <Link
            href="/noticias"
            className="inline-block rounded-md bg-[#0f3d3a] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#16504c]"
          >
            Ver noticias y novedades →
          </Link>
        </div>
      ),
      options: ['⬅ Volver al menú', 'Hacer otra consulta'],
      path: (params: { userInput: string }) => {
        if (params.userInput === '⬅ Volver al menú') return 'start';
        if (params.userInput === 'Hacer otra consulta') return 'menu_opciones';
        return resolverRutaPorMensaje(params);
      }
    },

    contacto: {
      message:
        '¡Con gusto te ayudamos! Podés enviarnos un mensaje por el formulario de contacto o comunicarte telefónicamente al 0800-444-COOP (lunes a viernes de 8:00 a 20:00 hs).',
      component: (
        <div className="mt-2">
          <Link
            href="/contacto"
            className="inline-block rounded-md bg-[#0f3d3a] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#16504c]"
          >
            Ir a Formulario de Contacto →
          </Link>
        </div>
      ),
      options: ['⬅ Volver al menú', 'Hacer otra consulta'],
      path: (params: { userInput: string }) => {
        if (params.userInput === '⬅ Volver al menú') return 'start';
        if (params.userInput === 'Hacer otra consulta') return 'menu_opciones';
        return resolverRutaPorMensaje(params);
      }
    },

    despedida: {
      message: '¡De nada! Si necesitás algo más, acá voy a estar para ayudarte. ¡Que tengas un excelente día! 😊',
      options: ['⬅ Volver al menú', 'Hacer otra consulta'],
      path: (params: { userInput: string }) => {
        if (params.userInput === '⬅ Volver al menú') return 'start';
        if (params.userInput === 'Hacer otra consulta') return 'menu_opciones';
        return resolverRutaPorMensaje(params);
      }
    },

    no_entendido: {
      message:
        'Perdón, solo puedo ayudarte con información y trámites de la Cooperativa Riojana (pagos, beneficios, talleres, noticias o atención al socio). ¿Querés que revisemos alguno de estos temas?',
      options: ['⬅ Volver al menú', 'Quiero hablar con una persona', 'Hacer otra consulta'],
      path: (params: { userInput: string }) => {
        if (params.userInput === '⬅ Volver al menú') return 'start';
        if (params.userInput === 'Hacer otra consulta') return 'menu_opciones';
        if (params.userInput === 'Quiero hablar con una persona') return 'contacto';
        return resolverRutaPorMensaje(params);
      }
    }
  };

  const settings: Settings = {
    general: {
      primaryColor: '#0f3d3a',
      secondaryColor: '#0f3d3a',
      showFooter: false
    },
    header: {
      title: 'Meli IA - Asistente Virtual',
      showAvatar: true,
    },
    botBubble: {
      showAvatar: true,
      avatar: '👩‍💼'
    },
    chatHistory: {
      storageKey: 'cooperativa_meli_chat',
      disabled: false
    },
    chatInput: {
      enabledPlaceholderText: 'Escribí tu consulta aquí...'
    },
    notification: {
      disabled: true
    },
    tooltip: {
      mode: 'NEVER'
    },
    chatButton: {
      icon: () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <MessageCircle
            size={20}
            color="#ffffff"
            strokeWidth={2.2}
            style={{ width: '20px', height: '20px' }}
          />
        </div>
      )
    }
  };

  const styles: Styles = {
    headerStyle: {
      backgroundColor: '#0f3d3a',
      color: '#ffffff',
      fontWeight: 'bold'
    },
    chatWindowStyle: {
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
    },
    chatButtonStyle: {
      width: '48px',
      height: '48px'
    },
    tooltipStyle: {
      backgroundColor: '#ffffff',
      color: '#1f2937',
      fontWeight: 600,
      fontSize: '13px',
      lineHeight: '1.4',
      textAlign: 'center',
      borderRadius: '14px',
      padding: '12px 16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      whiteSpace: 'pre-line'
    }
  };

  return <ChatBot key={estaLogueado ? 'logged-in' : 'guest'} flow={flow} settings={settings} styles={styles} />;
}