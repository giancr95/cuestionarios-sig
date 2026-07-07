// ---------------------------------------------------------------------------
// Esquema de los 7 formularios (estructura usada por render.js)
//
// Cada formulario tiene un `id`, metadatos (código, versión, fecha de emisión,
// fecha de revisión) y una lista de `sections`. Cada sección tiene un `type`:
//   - "fields"         : campos simples en una cuadrícula
//   - "radio-area"     : selector de área (Empaque / Pilado / ...)
//   - "checklist"      : lista de ítems con opciones (Sí/No o AC/RE/N/A)
//   - "daily-checks"   : matriz ítems × días (checkbox por día)
//   - "evaluacion-grid": matriz aspectos × días con evaluación + descripción + acción
//   - "epp-grid"       : tabla de colaboradores × EPP
//   - "produccion"     : tabla de producción detallada (R-PLP-001)
//   - "observaciones"  : textarea
//   - "firma"          : campo de firma (nombre de quien firma)
// ---------------------------------------------------------------------------

const ASPECTOS_PBM = [
  "Lavamanos, limpio y en buen estado",
  "Infraestructura de proceso (piso, paredes, techos) limpias, sin acumulación de suciedad, derrames o posibles peligros",
  "Equipos de producción limpios y cerrados",
  "Equipo de procesamiento sin reparaciones temporales",
  "Los implementos de limpieza se encuentran en buen estado y ordenados",
  "Todos los productos y subproductos están sobre tarima",
  "El material de empaque se encuentra sobre tarimas, limpio y ordenado",
  "Desechos recolectados, basureros limpios, en buen estado, con bolsa y tapa",
  "Imanes limpios y colocados correctamente",
  "Áreas de proceso libre de plaga viva, excretas y olores",
  "Cobertores de motores colocados y en buen estado",
  "Acrílicos, plástico quebradizo en buen estado y lámparas en buen estado y con cobertor",
  "Se encuentran las tarimas en buen estado y en su lugar",
  "Áreas libres de derrames de agua y/o combustibles",
  "Materia prima en condiciones óptimas para proceso",
  "Sistemas de monitoreo de plagas activadas (insectos y roedores)",
  "Posibilidad de crecimiento de plaga",
  "Limpieza de cortinas plásticas y antiáfidos",
  "Tapas de tolva de almacenamiento bien colocadas",
  "Tapas de colochos transportadores bien colocadas"
];

const ASPECTOS_PBP_INTERNOS = [
  "Estado del lavamanos bueno",
  "Paredes limpias",
  "Las tapas de los equipos se encuentran cerrados",
  "Los pisos se encuentran libres de derrames de producto",
  "Los equipos de limpieza se encuentran en sus áreas",
  "Se encuentran los sacos con producto sobre tarimas",
  "El material de empaque se encuentra sobre tarimas",
  "Las lámparas de insectos se encuentran funcionales",
  "Se encuentran cobertores de motores puestos",
  "Las trampas para roedores se encuentran activas",
  "Los trabajos temporales tienen orden de trabajo realizada",
  "Se encuentran los visores y lámparas con cobertor",
  "Se encuentran las tarimas en buen estado y en su lugar",
  "Los recipientes de basura se encuentran tapados y en buen estado",
  "Se encuentra libre de derrames de agua y/o combustibles",
  "Limpieza de cortinas plásticas y antiáfidos"
];

const ASPECTOS_PBP_EXTERNOS = [
  "Se encuentran las trampas de roedores activadas y limpias",
  "Se encuentra el perímetro con el zacate bajo y limpio",
  "Se encuentran los drenajes limpios y con protección",
  "Los escombros, tarimas, chatarra y otros se encuentran ordenados y bajo techo"
];

const EPP_ITEMS = [
  "Casco",
  "Malla p/Cabello",
  "Tapones Auditivos",
  "Zapatos de Protección",
  "Anteojos de Protección",
  "Mascarilla Desechable",
  "Arnés y Líneas de Vida",
  "Máscara p/Esmerilar",
  "Máscara p/Soldar",
  "Guantes, Polainas, Mangas y Delantal Cuero"
];

const CHECKLIST_ARL = [
  "Aspirado de elevador de llenado empacadoras",
  "Aspirado de transportador salida flujómetros",
  "Aspirado de transportador llenado tolvas",
  "Soplado de tolvas de empacadoras",
  "Adecuado nivel de vitamina en dosificador",
  "Adecuada colocación de tapas en tolvas",
  "Adecuada colocación de tapas en transportadores",
  "Tarimas limpias, en buen estado y fumigadas",
  "Cartón limpio y libre de impurezas/plagas",
  "Bobinas limpias y en buen estado",
  "Sellado vertical/horizontal adecuado",
  "Impresión adecuada en bolsas",
  "Impresión adecuada de etiquetas para bultos"
];

const MATERIALES_EMPAQUE = [
  { codigo: "1-1-3", desc: "BOBINA CAÑERO 80-20 1.8KG" },
  { codigo: "1-1-5", desc: "BOBINA LIBORIO 80-20 1.8KG" },
  { codigo: "1-1-7", desc: "BOBINA LIBORIO 80-20 2KG" },
  { codigo: "1-1-12", desc: "BOBINA LIBORIO 99-01 1.8KG" },
  { codigo: "1-1-13", desc: "BOBINA LIBORIO 95-05 1.8KG" },
  { codigo: "1-1-14", desc: "BOBINA LIBORIO 99-01 FIT 1.8KG" },
  { codigo: "1-1-15", desc: "BOBINA LIBORIO 90-10 1.8KG" },
  { codigo: "1-1-16", desc: "BOBINA LIBORIO 99-01 4KG" },
  { codigo: "1-1-17", desc: "BOBINA LIBORIO 99-01 1KG" },
  { codigo: "1-1-18", desc: "BOBINA LIBORIO 99-01 FIT 1KG" },
  { codigo: "1-1-19", desc: "BOBINA DOÑA VILMA 80-20 1.8KG" },
  { codigo: "1-1-20", desc: "BOBINA DOÑA VILMA 90-10 1.8KG" },
  { codigo: "1-1-21", desc: "BOBINA DOÑA VILMA 99-01 1.8KG" },
  { codigo: "1-1-22", desc: "BOBINA MONTELIMAR 80-20 1.8KG" },
  { codigo: "1-1-23", desc: "BOBINA MONTELIMAR 91-09 1.8KG" },
  { codigo: "1-1-24", desc: "BOBINA MONTELIMAR 99-01 1.8KG" },
  { codigo: "1-1-25", desc: "BOBINA EL ANGEL 80-20 1.8KG" },
  { codigo: "1-1-26", desc: "BOBINA EL ANGEL 90-10 1.8KG" },
  { codigo: "1-1-27", desc: "BOBINA EL ANGEL 99-01 1.8KG" },
  { codigo: "1-1-28", desc: "BOBINA EL ANGEL 95-05 1.8KG" },
  { codigo: "1-1-30", desc: "BOBINA LIBORIO 95-05 2 KG" },
  { codigo: "1-1-33", desc: "BOBINA MOLINA 95-05 5KG" },
  { codigo: "1-1-34", desc: "BOBINA MOLINA 95-10 3KG" },
  { codigo: "1-1-35", desc: "BOBINA LIBORIO 90-10 2 KG" },
  { codigo: "1-1-36", desc: "BOBINA BM 90% 1,8 KG" },
  { codigo: "1-1-37", desc: "BOBINA BM 95% 1.8 KG" },
  { codigo: "1-1-38", desc: "BOBINA BM 99% 1.8 KG" },
  { codigo: "1-1-39", desc: "BOBINA CHIKO PRAIS 80% 1.8 KG" },
  { codigo: "1-1-40", desc: "BOBINA CHIKO PRAIS 90% 1.8 KG" },
  { codigo: "1-1-41", desc: "BOBINA CHICO PRAIS 99% 1.8 KG" },
  { codigo: "1-1-42", desc: "BOBINA LIBORIO 80% 1KG" },
  { codigo: "1-1-43", desc: "BOBINA MOLINA 90-10 1.8KG" },
  { codigo: "1-2-1", desc: "BOLSA COLECTIVA (31+8+8) X 83" },
  { codigo: "1-2-3", desc: "BOLSA COLECTIVA (26+7.5+7.5) X 89" },
  { codigo: "1-2-4", desc: "BOLSA COLECTIVA (29+8+8) X 80 AZUL" },
  { codigo: "1-2-5", desc: "BOLSA COLECTIVA (29+8+8) X 57 TRANSPARENTE" },
  { codigo: "1-2-9", desc: "BOBINA AZUL PARA ENFARDADORA 90CM" },
  { codigo: "1-2-10", desc: "BOBINA TRANSPARENTE ENFARDADORA 90CM" },
  { codigo: "1-2-11", desc: "BOLSA COLECTIVA TRANSP. (26+7.5+7.5) X 93" },
  { codigo: "1-2-13", desc: "BOLSA 10X16X5 TRANSP GRUESA" },
  { codigo: "1-3-1", desc: "PLASTICO PALETIZADOR 18 (MANUAL)" },
  { codigo: "1-3-2", desc: "PLASTICO PALETIZADOR 20 (PALETIZADORA)" },
  { codigo: "1-4-5", desc: "SAQUITO LIBORIO 80-20 10KG" },
  { codigo: "1-4-6", desc: "SAQUITO LIBORIO 95-05 6KG" },
  { codigo: "1-4-11", desc: "SAQUITO LIBORIO 90-10 8KG" },
  { codigo: "1-4-20", desc: "SAQUITO LIBORIO 99-01 6KG" },
  { codigo: "1-4-13", desc: "SACO P/ARROZ 23KG" },
  { codigo: "1-4-14", desc: "SACONA H5 90 X 90 X 120" },
  { codigo: "1-4-17", desc: "SACO BLANCO P/ARROZ 46KG" },
  { codigo: "1-4-18", desc: "SACO P/SEMOLINA NUEVO 71 X 107" },
  { codigo: "1-4-19", desc: "SACO SEGUNDA 56 X 95 (CASCARILLA)" },
  { codigo: "1-4-22", desc: "SAQUITA BLANCA 8KG 42X60" },
  { codigo: "1-4-23", desc: "SACO BLANCO COSTEÑA NUEVO 42X60 23KG" },
  { codigo: "1-4-24", desc: "SACO ARROZ CON LOGO 80% 46KG 22\"X37" },
  { codigo: "1-4-25", desc: "SACO NUEVO CON LOGO 80% 23KG" },
  { codigo: "1-4-26", desc: "FRIJOL ROJO 46KG" },
  { codigo: "1-4-27", desc: "FRIJOL NEGRO 46KG" },
  { codigo: "1-4-28", desc: "SAQUITAS COSTEÑA 8KG" },
  { codigo: "1-4-29", desc: "SACO LIBORIO CON LOGO 90% 23KG" },
  { codigo: "1-4-30", desc: "SACO LIBORIO CON LOGO 90% 46KG" },
  { codigo: "1-4-31", desc: "SAQUITO LIBORIO 90% 5KG" },
  { codigo: "1-5-1", desc: "CINTA TRANSPARENTE P/EMPAQUE 2\"" },
  { codigo: "1-5-2", desc: "HILO PABILO P/MAQUINA COSER" },
  { codigo: "1-5-6", desc: "SOLVENTE PARA IMPRESOR HITACHI TH-18U" },
  { codigo: "1-5-7", desc: "TINTA PARA IMPRESOR HITACHI K304A" },
  { codigo: "1-5-11", desc: "ETIQUETA P/ IMPRESORA SATO R-08 X 3000" },
  { codigo: "1-5-12", desc: "CERA NEGRA PARA IMPRESORA SATO" },
  { codigo: "1-5-21", desc: "AGUJAS" },
  { codigo: "1-5-28", desc: "CINTA NEAR EDGE NEGRO 33MM X 500MM" },
  { codigo: "1-5-29", desc: "MILLTERIO R-72 CENTRO 4\"" },
  { codigo: "1-5-34", desc: "FAJA INDUSTRIAL MAQUINA 150 X L037" },
  { codigo: "1-5-35", desc: "FAJA INDUSTRIAL MAQUINA 160 X L037" },
  { codigo: "1-5-37", desc: "ETIQUETA BLANCA R-75" },
  { codigo: "1-5-38", desc: "CINTA NEAR EDGE SILVER 33MM X 500MM" },
  { codigo: "1-5-39", desc: "COBERTOR TARIMAS" },
  { codigo: "1-5-42", desc: "PAPEL KRAFT" },
  { codigo: "1-6-2", desc: "BOBINA DON PEDRO 90-10 1.8KG" },
  { codigo: "1-6-5", desc: "BOBINA DON PEDRO 80-20 1.8KG" },
  { codigo: "1-6-6", desc: "BOBINA DON PEDRO 91-09 1.8KG" },
  { codigo: "1-6-10", desc: "SAQUITA DON PEDRO 80-20 10KG" },
  { codigo: "1-6-11", desc: "SAQUITA DON PEDRO 90-10 8KG" },
  { codigo: "1-6-12", desc: "SAQUITA DON PEDRO 95-05 7KG" },
  { codigo: "1-6-22", desc: "SAQUITA DON PEDRO 99-01 7KG" },
  { codigo: "1-6-14", desc: "BOBINA DON PEDRO 95-05 1.8KG" },
  { codigo: "1-6-15", desc: "BOBINA DON PEDRO 95-05 5KG" },
  { codigo: "1-6-16", desc: "BOBINA DON PEDRO 99-01 1.8KG" },
  { codigo: "1-6-18", desc: "BOBINA DON PEDRO 99-01 4KG" },
  { codigo: "1-8-1", desc: "BOBINA FRIJOL NEGRO 700G" },
  { codigo: "1-8-2", desc: "BOBINA FRIJOL ROJO 700G" },
  { codigo: "1-8-3", desc: "BOBINA BM FRIJOL NEGRO 700G" },
  { codigo: "1-8-4", desc: "BOBINA BM FRIJOL ROJO 700G" },
  { codigo: "1-8-5", desc: "BOBINA CHIKO PRAIS FRIJOL ROJO 700G" },
  { codigo: "1-8-6", desc: "BOBINA CHIKO PRAIS FRIJOL NEGRO 700G" },
  { codigo: "1-8-7", desc: "FRIJOL ROJO CAÑERO 700G" },
  { codigo: "1-8-8", desc: "FRIJOL NEGRO CAÑERO 700G" },
  { codigo: "1-8-9", desc: "FRIJOLES ROJOS DON MANUEL 800G" },
  { codigo: "1-8-10", desc: "FRIJOLES NEGROS DON MANUEL 800G" },
  { codigo: "2-20-5", desc: "TEFLÓN DE APOYO 6MM ANCHO" },
  { codigo: "2-20-64", desc: "MILLTERIO R-16 CENTRO 3\"" },
  { codigo: "2-20-65", desc: "TEFLÓN ADHESIVO 0.13MM X 35MM" },
  { codigo: "10-2-102", desc: "ETIQUETAS 80% 46KG" },
  { codigo: "10-2-118", desc: "ETIQUETAS 80% 23KG" },
  { codigo: "10-2-122", desc: "ETIQUETAS 90% 23KG" },
  { codigo: "10-2-123", desc: "ETIQUETAS 90% 46KG" },
  { codigo: "10-2-124", desc: "ETIQUETAS 95% 23KG" },
  { codigo: "10-2-125", desc: "ETIQUETAS 95% 46KG" },
  { codigo: "10-2-142", desc: "FORMULARIO SACO 46 KILOS BLANCO 99-1%" },
  { codigo: "10-2-143", desc: "FORMULARIO SACO 23 KILOS BLANCO 99-1%" },
  { codigo: "12-1-1", desc: "VITAMINA" },
  { codigo: "17-1-1", desc: "RODILLOS DE HULE FOREMAN" },
  { codigo: "1-8-9", desc: "FRIJOLES ROJOS DON MANUEL 800G" },
  { codigo: "1-8-10", desc: "FRIJOLES NEGROS DON MANUEL 800G" },
  { codigo: "1-4-28", desc: "SAQUITAS COSTEÑA 8KG" },
  { codigo: "1-4-29", desc: "SAQUITAS LIBORIO 95% 5KG" },
  { codigo: "1-1-33", desc: "BOBINA MOLINA 95-05 5KG" },
  { codigo: "1-1-43", desc: "BOBINA MOLINA 90-10 1.8KG" },
  { codigo: "1-1-34", desc: "BOBINA MOLINA 95-10 3KG" },
];

const SINO_OPC = [
  { value: "SI", label: "Sí" },
  { value: "NO", label: "No" },
  { value: "NA", label: "N/A" }
];

const FORMS = [
  // =================================================================
  // 1. R-ARL-001 Registro de Arranque Producciones
  // =================================================================
  {
    id: "ARL-001",
    code: "R-ARL-001",
    title: "Registro de Arranque de Producciones",
    shortTitle: "Arranque de Producciones",
    desc: "Verificación previa al arranque de empacadoras.",
    icon: "🏁",
    version: 3,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields",
        title: "Descripción del producto empacado",
        columns: 2,
        fields: [
          { id: "fecha",          label: "Fecha",                  type: "date",    required: true, default: "today" },
          { id: "encargado",      label: "Encargado de Calidad",   type: "select",  required: true, options: RESPONSABLES },
          { id: "presentacion",   label: "Presentación",           type: "text",    placeholder: "Ej: LB 99% 1.8 KG" },
          { id: "calidades",      label: "Calidades empacadas",    type: "text" },
          { id: "lotes",          label: "Números de lote",        type: "text" },
          { id: "tarimas",        label: "Cantidad de tarimas",    type: "number",  min: 0 }
        ]
      },
      {
        type: "checklist",
        title: "Revisiones generales previas al inicio de producción",
        options: [
          { value: "SI",  label: "Sí"  },
          { value: "NO",  label: "No"  },
          { value: "NA",  label: "N/A" }
        ],
        optionsDefault: "SI",
        items: CHECKLIST_ARL
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaInocuidad", label: "Firma Inocuidad" },
          { id: "firmaSIG",       label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 2. R-DAC-001 Registro de Dosificación de Amonio
  // =================================================================
  {
    id: "DAC-001",
    code: "R-DAC-001",
    title: "Registro de Dosificación de Amonio",
    shortTitle: "Dosificación Amonio",
    desc: "Verificación diaria de concentración de amonio cuaternario.",
    icon: "💧",
    version: 4,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields",
        title: "Información general",
        columns: 2,
        fields: [
          { id: "fechaInicio", label: "Fecha",           type: "date",   required: true, default: "today" },
          { id: "encargado",   label: "Encargado",       type: "select", required: true, options: RESPONSABLES }
        ]
      },
      {
        type: "radio-area",
        title: "Área",
        id: "area",
        options: AREAS_DAC,
        required: true
      },
      {
        type: "daily-checks",
        title: "Dosificación de amonio (marque por día)",
        note: "Marque ✓ si cumple con la concentración indicada, X si no cumple. Dosis: 39 ml por litro de agua.",
        rows: [
          { label: "Producto",            valor: "AC Bioeco" },
          { label: "Dosificación",        valor: "740 ml/L" },
          { label: "Partes por millón",   valor: "300 a 500 ppm" }
        ],
        days: DIAS_SEMANA,
        options: [
          { value: "OK",  label: "✓" },
          { value: "NO",  label: "✗" },
          { value: "NA",  label: "—" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG",     label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 3. R-EPP-001 Registro Uso Diario de EPP
  // =================================================================
  {
    id: "EPP-001",
    code: "R-EPP-001",
    title: "Uso diario de Equipo de Protección Personal",
    shortTitle: "Uso diario de EPP",
    desc: "Control diario del uso de EPP por colaborador.",
    icon: "🥽",
    version: 4,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields",
        title: "Información general",
        columns: 2,
        fields: [
          { id: "fecha",     label: "Fecha",               type: "date",   required: true, default: "today" },
          { id: "encargado", label: "Encargado (firma)",   type: "select", required: true, options: RESPONSABLES }
        ]
      },
      {
        type: "radio-area",
        title: "Área",
        id: "area",
        options: AREAS_EPP,
        required: true
      },
      {
        type: "epp-grid",
        title: "Registro por colaborador",
        note: "Marque Sí si el colaborador está utilizando el EPP, No si no lo está utilizando, y N/A para los que no aplican en su área.",
        items: EPP_ITEMS,
        options: [
          { value: "SI", label: "Sí" },
          { value: "NO", label: "No" },
          { value: "NA", label: "N/A" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaInocuidad", label: "Firma Inocuidad" },
          { id: "firmaSIG",       label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 4. R-LDD-001 Limpieza y Desinfección Dispensadores de Agua
  // =================================================================
  {
    id: "LDD-001",
    code: "R-LDD-001",
    area: "Limpieza",
    title: "Limpieza y Desinfección Dispensadores de Agua",
    shortTitle: "Dispensadores de Agua",
    desc: "Registro semanal de limpieza y desinfección de dispensadores.",
    icon: "🚰",
    version: 3,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields",
        title: "Información general",
        columns: 2,
        fields: [
          { id: "fecha",      label: "Fecha",      type: "date",   required: true, default: "weekStart" },
          { id: "areaBidon",  label: "Área bidón", type: "text",   placeholder: "Ej: Comedor" },
          { id: "responsable",label: "Responsable",type: "select", required: true, options: RESPONSABLES }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades por día",
        note: "Desinfectante: AC Bioeco — Dosis: 39 ml/L. Rango: 500 a 1000 ppm (contacto no directo).",
        days: DIAS_SEMANA,
        columns: [
          { key: "limpieza",     label: "Limpieza" },
          { key: "desinfeccion", label: "Desinfección" }
        ],
        rows: [
          "Limpieza de exterior",
          "Limpieza de bandeja de recolección de derrames",
          "Limpieza y desinfección de bandeja de goteo"
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG",     label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 5. R-PBM-001 Preoperativo BPM
  // =================================================================
  {
    id: "PBM-001",
    code: "R-PBM-001",
    title: "Reporte Preoperativo de Buenas Prácticas de Manufactura",
    shortTitle: "Preoperativo BPM",
    desc: "Evaluación preoperativa por aspectos y día de la semana.",
    icon: "✅",
    version: 4,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields",
        title: "Información general",
        columns: 2,
        fields: [
          { id: "fechaInicio", label: "Fecha", type: "date", required: true, default: "today" }
        ]
      },
      {
        type: "radio-area",
        title: "Área",
        id: "area",
        options: AREAS_BPM,
        required: true
      },
      {
        type: "evaluacion-grid",
        title: "Aspectos a evaluar — Cumplimiento",
        note: "Evaluación: AC (Aceptable), RE (Rechazado), N/A (No Aplica).",
        aspectos: ASPECTOS_PBM,
        days: DIAS_SEMANA,
        options: [
          { value: "AC", label: "AC" },
          { value: "RE", label: "RE" },
          { value: "NA", label: "N/A" }
        ],
        responsablePorDia: true,
        responsables: RESPONSABLES
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG",     label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 6. R-PBP-001 Post Operativo BPM
  // =================================================================
  {
    id: "PBP-001",
    code: "R-PBP-001",
    title: "Reporte Post Operativo de Buenas Prácticas de Manufactura",
    shortTitle: "Post Operativo BPM",
    desc: "Evaluación post operativa (áreas internas y externas).",
    icon: "🧼",
    version: 4,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields",
        title: "Información general",
        columns: 2,
        fields: [
          { id: "fechaInicio", label: "Fecha", type: "date", required: true, default: "today" }
        ]
      },
      {
        type: "radio-area",
        title: "Área",
        id: "area",
        options: AREAS_BPM,
        required: true
      },
      {
        type: "evaluacion-grid",
        title: "Aspectos a evaluar — Áreas internas",
        note: "Coloque Sí si cumple, No si no cumple y N/A en los que no aplican.",
        aspectos: ASPECTOS_PBP_INTERNOS,
        days: DIAS_SEMANA,
        options: [
          { value: "SI", label: "Sí" },
          { value: "NO", label: "No" },
          { value: "NA", label: "N/A" }
        ],
        responsablePorDia: true,
        responsables: RESPONSABLES,
        key: "internos"
      },
      {
        type: "evaluacion-grid",
        title: "Aspectos a evaluar — Áreas externas",
        aspectos: ASPECTOS_PBP_EXTERNOS,
        days: DIAS_SEMANA,
        options: [
          { value: "SI", label: "Sí" },
          { value: "NO", label: "No" },
          { value: "NA", label: "N/A" }
        ],
        responsablePorDia: false,
        key: "externos"
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG",     label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 7. R-PLP-001 Control de Producción y Liberación
  // =================================================================
  {
    id: "PLP-001",
    code: "R-PLP-001",
    title: "Control de Producción y Liberación de Producto Terminado",
    shortTitle: "Producción y Liberación",
    desc: "Registro de producción con análisis de calidad y liberación.",
    icon: "📦",
    version: 3,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields",
        title: "Información general",
        columns: 2,
        fields: [
          { id: "area",  label: "Área",  type: "select", required: true, options: AREAS_DAC, default: "Empaque" },
          { id: "fecha", label: "Fecha", type: "date",   required: true, default: "today" }
        ]
      },
      {
        type: "produccion",
        title: "Registros de producción",
        note: "Agregue una fila por cada producción ejecutada. Todos los porcentajes son numéricos (0 – 100).",
        productos: PRODUCTOS,
        responsables: RESPONSABLES
      },
      {
        type: "info",
        title: "Información del producto",
        lines: [
          "Vida útil: 4 meses manteniendo condiciones recomendadas de almacenamiento.",
          "Condiciones de almacenamiento: Almacenado en tarimas en buen estado o estanterías dentro de una bodega cerrada. No almacenar junto a rechazos de materia prima, devoluciones o productos químicos. Mantener alejado de fuentes de agua."
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG",     label: "Firma SIG" }
        ]
      }
    ]
  },

  {
    id: "LBE-001", code: "R-LBE-001", area: "Empaque",
    title: "Registro Limpieza Bodega de Empaque", shortTitle: "Limpieza Bodega Empaque",
    desc: "Limpieza y desinfección semanal de la bodega de material de empaque.", icon: "🧹",
    version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true, default: "Bodega de empaque" },
          { id: "semana", label: "Fecha", type: "date", default: "today" }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza y desinfección",
        note: "Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm. Marque la actividad realizada y el día en que se ejecutó.",
        days: DIAS_SEMANA,
        columns: [{ key: "limpieza", label: "Limpieza" }, { key: "desinfeccion", label: "Desinfección" }],
        rows: [
          { label: "Piso", equipo: "Escoba, Sopladora Manual" },
          { label: "Paredes", equipo: "Escoba, Sopladora Manual" },
          { label: "Techo", equipo: "Escoba" },
          { label: "Puertas", equipo: "Escoba, Sopladora Manual" },
          { label: "Escobas", equipo: "Hidrolavadora" },
          { label: "Recogedor de Basura", equipo: "Hidrolavadora" },
          { label: "Botes de Basura", equipo: "Sopladora Maunal" },
          { label: "Escaleras", equipo: "Sopladora Maunal" },
          { label: "Estantes", equipo: "Escoba, Sopladora Manual" },
          { label: "Lámparas", equipo: "Escoba, Sopladora Manual" },
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm) y responsables", columns: 2,
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" },
          { id: "concS", label: "Concentración Sábado", type: "text" },
          { id: "realizadoPor", label: "Realizado por", type: "text" },
          { id: "supervisadoPor", label: "Supervisado por", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  {
    id: "LEA-001", code: "R-LEA-001", area: "Empaque",
    title: "Registro Limpieza Equipos Auxiliares de Empaque", shortTitle: "Limpieza Equipos Empaque",
    desc: "Limpieza y desinfección semanal de equipos auxiliares de empaque.", icon: "🧽",
    version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true },
          { id: "semana", label: "Fecha", type: "date", default: "today" }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza y desinfección",
        note: "Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm. Marque la actividad realizada y el día en que se ejecutó.",
        days: DIAS_SEMANA,
        columns: [{ key: "limpieza", label: "Limpieza" }, { key: "desinfeccion", label: "Desinfección" }],
        groups: [
          { name: "Cámara densimétrica", rows: [
            { label: "Mesanín (1m alrededor)", equipo: "Escoba y Aire comprimido" },
            { label: "Transportador Helicoidal", equipo: "Atomizador, cepillo, espátula y aspiradora" },
            { label: "Lámpara (sobre equipo)", equipo: "Escoba y Aire comprimido" },
            { label: "Motores", equipo: "Aire Comprimido" },
            { label: "Estructura externa", equipo: "Paños, Aire comprimido" },
          ] },
          { name: "Elevador Tolvas Empaque", rows: [
            { label: "Huacales de Elevadores", equipo: "Cepillo y espátula" },
            { label: "Bota elevador", equipo: "Aspiradora" },
            { label: "Campanola elevador", equipo: "Aire Comprimido" },
          ] },
          { name: "Paletizadora", rows: [
            { label: "Piso (1m alrededor enfardadora)", equipo: "Escoba y Aire comprimido" },
            { label: "Estructura externa", equipo: "Paños, Aire comprimido" },
            { label: "Lámpara (sobre equipo)", equipo: "Escoba y Aire comprimido" },
            { label: "Plato giratorio (sección interna)", equipo: "Cepillo, espátula y aspiradora" },
            { label: "Estructura interna", equipo: "Aire Comprimido" },
          ] },
          { name: "Romana Tarimera", rows: [
            { label: "Piso (1m alrededor romana)", equipo: "Escoba y Aire comprimido" },
            { label: "Estructura externa", equipo: "Paños, Aire comprimido" },
            { label: "Lámpara (sobre tarimera)", equipo: "Escoba y Aire comprimido" },
            { label: "Debajo plato soporte", equipo: "Cepillo, espátula y aspiradora" },
          ] },
          { name: "Mesa giratoria", rows: [
            { label: "Piso (1m alrededor romana)", equipo: "Escoba y Aire comprimido" },
            { label: "Lámpara (sobre mesa)", equipo: "Escoba y Aire comprimido" },
            { label: "Estructura externa", equipo: "Paños, Aire comprimido" },
            { label: "Plancha", equipo: "Paños, Aire comprimido" },
            { label: "Motor", equipo: "Aire Comprimido" },
          ] },
          { name: "Estantería Material Empaque", rows: [
            { label: "Piso (1m alrededor romana)", equipo: "Escoba y Aire comprimido" },
            { label: "Estructura externa", equipo: "Paños, Aire comprimido" },
            { label: "Debajo estructura", equipo: "Escoba y Aspiradora" },
          ] },
          { name: "Equipos limpieza / desinfección", rows: [
            { label: "Soportes para escobas", equipo: "Aire comprimido" },
            { label: "Atomizadores", equipo: "Lavado manual" },
          ] },
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm) y responsables", columns: 2,
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" },
          { id: "concS", label: "Concentración Sábado", type: "text" },
          { id: "realizadoPor", label: "Realizado por", type: "text" },
          { id: "supervisadoPor", label: "Supervisado por", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  {
    id: "LEH-001", code: "R-LEH-001", area: "Empaque",
    title: "Registro Limpieza Empacadoras y Enfardadora", shortTitle: "Limpieza Empacadoras",
    desc: "Limpieza y desinfección semanal de empacadoras y enfardadora.", icon: "✨",
    version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true },
          { id: "semana", label: "Fecha", type: "date", default: "today" }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza y desinfección",
        note: "Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm. Marque la actividad realizada y el día en que se ejecutó.",
        days: DIAS_SEMANA,
        columns: [{ key: "limpieza", label: "Limpieza" }, { key: "desinfeccion", label: "Desinfección" }],
        groups: [
          { name: "Empacadora Tecnotock", rows: [
            { label: "Piso (1 m alrededor empacadora)", equipo: "Escoba, Aire comprimido" },
            { label: "Banda transportadora", equipo: "Atomizador, Aire comprimido" },
            { label: "Pistones Hidráulicos", equipo: "Paños, cepillo" },
            { label: "Lámpara (sobre empacadora)", equipo: "Escoba, Aire comprimido" },
            { label: "Verificador de Peso", equipo: "Paños, aire comprimido" },
            { label: "Tolva Empacadora", equipo: "Aire comprimido, cepillos y espátulas" },
            { label: "Imanes", equipo: "Cepillo, espátula" },
            { label: "Dosificador Vitamina", equipo: "Paños, Aire comprimido" },
            { label: "Contenedor rechazo bolsas", equipo: "Atomizador, Aire comprimido" },
            { label: "Motores empacadora", equipo: "Aire comprimido" },
            { label: "Estructura externa empacadora", equipo: "Paños, Aire comprimido" },
          ] },
          { name: "Empacadora Novo Horizonte 1", rows: [
            { label: "Piso (1 m alrededor empacadora)", equipo: "Escoba, Aire comprimido" },
            { label: "Banda transportadora", equipo: "Atomizador, Aire comprimido" },
            { label: "Pistones Hidráulicos", equipo: "Paños, cepillo" },
            { label: "Lámpara (sobre empacadora)", equipo: "Escoba, Aire comprimido" },
            { label: "Verificador de Peso", equipo: "Paños, aire comprimido" },
            { label: "Tolva Empacadora", equipo: "Aire comprimido, cepillos y espátulas" },
            { label: "Imanes", equipo: "Cepillo, espátula" },
            { label: "Dosificador Vitamina", equipo: "Paños, Aire comprimido" },
            { label: "Contenedor rechazo bolsas", equipo: "Atomizador, Aire comprimido" },
            { label: "Motores empacadora", equipo: "Aire comprimido" },
            { label: "Estructura externa empacadora", equipo: "Paños, Aire comprimido" },
          ] },
          { name: "Empacadora Novo Horizonte 2", rows: [
            { label: "Piso (1 m alrededor empacadora)", equipo: "Escoba, Aire comprimido" },
            { label: "Banda transportadora", equipo: "Atomizador, Aire comprimido" },
            { label: "Pistones Hidráulicos", equipo: "Paños, cepillo" },
            { label: "Lámpara (sobre empacadora)", equipo: "Escoba, Aire comprimido" },
            { label: "Verificador de Peso", equipo: "Paños, aire comprimido" },
            { label: "Contenedor rechazo bolsas", equipo: "Atomizador, Aire comprimido" },
            { label: "Tolva Empacadora", equipo: "Aire comprimido, cepillos y espátulas" },
            { label: "Imanes", equipo: "Cepillo, espátula" },
            { label: "Dosificador Vitamina", equipo: "Paños, Aire comprimido" },
            { label: "Motores empacadora", equipo: "Aire comprimido" },
            { label: "Estructura externa empacadora", equipo: "Paños, Aire comprimido" },
          ] },
          { name: "Enfardora Novo Horizonte", rows: [
            { label: "Piso (1 m alrededor enfardadora)", equipo: "Escoba, Aire comprimido" },
            { label: "Bandas transportadoras", equipo: "Atomizador, Aire comprimido" },
            { label: "Pistones Hidráulicos", equipo: "Paños, cepillo" },
            { label: "Lámpara (sobre empacadora)", equipo: "Escoba, Aire comprimido" },
            { label: "Motores enfardadora", equipo: "Aire comprimido" },
            { label: "Mesa Giratoria", equipo: "Atomizador, paños, escoba" },
            { label: "Estructura externa enfaradora", equipo: "Paños, Aire comprimido" },
          ] },
          { name: "Cosedora Sacos", rows: [
            { label: "Piso (1 m alrededor enfardadora)", equipo: "Escoba, Aire comprimido" },
            { label: "Tolva", equipo: "Aire comprimido, cepillos y espátulas" },
            { label: "Dosificador Vitamina", equipo: "Paños, Aire comprimido" },
            { label: "Imanes", equipo: "Cepillo, espátula" },
            { label: "Transportador Helicoidal", equipo: "Atomizador, cepillo, espátula y aspiradora" },
            { label: "Lámpara (sobre empacadora)", equipo: "Escoba, Aire comprimido" },
            { label: "Cosedoras", equipo: "Aire Comprimido" },
            { label: "Estructura empaque sacos", equipo: "Escoba, Aire comprimido" },
            { label: "Báscula empaque sacos", equipo: "Aire comprimido" },
            { label: "Banda empacadora", equipo: "Atomizador, Aire comprimido" },
            { label: "Motores", equipo: "Aire comprimido" },
          ] },
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm) y responsables", columns: 2,
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" },
          { id: "concS", label: "Concentración Sábado", type: "text" },
          { id: "realizadoPor", label: "Realizado por", type: "text" },
          { id: "supervisadoPor", label: "Supervisado por", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  {
    id: "BCI-001", code: "R-BCI-001", area: ["Empaque", "Proveeduría", "Frijoles"],
    title: "Registro Boleta Control Inventario Mensual y Salida de Material de Empaque",
    shortTitle: "Inventario Material Empaque",
    desc: "Inventario mensual y salida de material de empaque por código.",
    icon: "📋", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "encargado", label: "Encargado", type: "text", required: true }
        ]
      },
      {
        type: "material-list", id: "inv",
        title: "Inventario de material de empaque",
        note: "Anote la cantidad por código. Deje en blanco los materiales sin movimiento.",
        columns: [
          { key: "kg", label: "Kilogramos", type: "number" },
          { key: "uds", label: "Unidades", type: "number" }
        ],
        items: MATERIALES_EMPAQUE
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaInocuidad", label: "Firma Inocuidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  {
    id: "CAG-001", code: "R-CAG-001", area: "Empaque",
    title: "Registro Control de Agujas", shortTitle: "Control de Agujas",
    desc: "Control de instalación, cambio y recolección de agujas de costura.",
    icon: "🪡", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" }
        ]
      },
      {
        type: "repeater-table", id: "aguja", rowLabel: "Aguja",
        title: "Registro de agujas",
        columns: [
          { key: "maquina", label: "No. de máquina", type: "text" },
          { key: "instalada", label: "Aguja instalada", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "cambio", label: "Cambio de aguja", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "fechaCambio", label: "Fecha de cambio", type: "date" },
          { key: "razon", label: "Razón de cambio", type: "select", options: ["Quebrado", "Desgaste"] },
          { key: "recogio", label: "Se recogió la aguja", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "respRecibe", label: "Responsable recibir", type: "text" },
          { key: "respEntrega", label: "Responsable entrega", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  {
    id: "CDE-001", code: "R-CDE-001", area: "Empaque",
    title: "Registro Control de Empaque", shortTitle: "Control de Empaque",
    desc: "Consumo de masa blanca, producto empacado, plástico e inactividad.",
    icon: "📦", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "responsable", label: "Responsable", type: "text", required: true }
        ]
      },
      {
        type: "repeater-table", id: "masa", rowLabel: "Registro",
        title: "Control consumo de masa blanca",
        columns: [
          { key: "horaInicio", label: "Hora inicio", type: "time" },
          { key: "horaFinal", label: "Hora final", type: "time" },
          { key: "calidad", label: "Calidad", type: "text" },
          { key: "flujoNacIni", label: "Flujómetro Nacional inicial", type: "number" },
          { key: "flujoNacFin", label: "Flujómetro Nacional final", type: "number" },
          { key: "flujoImpIni", label: "Flujómetro Importado inicial", type: "number" },
          { key: "flujoImpFin", label: "Flujómetro Importado final", type: "number" },
          { key: "flujoQuebIni", label: "Flujómetro Quebrado inicial", type: "number" },
          { key: "flujoQuebFin", label: "Flujómetro Quebrado final", type: "number" },
          { key: "inyQuintales", label: "Inyecciones (quintales)", type: "number" },
          { key: "inyKilos", label: "Inyecciones (kilogramos)", type: "number" }
        ]
      },
      {
        type: "repeater-table", id: "empacado", rowLabel: "Producto",
        title: "Control de producto empacado",
        columns: [
          { key: "lote", label: "Lote", type: "text" },
          { key: "producto", label: "Producto", type: "text" },
          { key: "calidad", label: "Calidad", type: "text" },
          { key: "horaInicio", label: "Hora inicio", type: "time" },
          { key: "horaFin", label: "Hora final", type: "time" },
          { key: "codigoProducto", label: "Código de producto", type: "text" },
          { key: "bultos", label: "Producción (bultos)", type: "number" },
          { key: "unidades", label: "Producción (unidades)", type: "number" },
          { key: "empacadoras", label: "Empacadoras", type: "text" },
          { key: "detectorPeso", label: "Detector de peso", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "detectorMetal", label: "Detector de metal", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "densimetrica", label: "Densimétrica", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "kilosReproceso", label: "Kilos netos reproceso", type: "number" }
        ]
      },
      {
        type: "repeater-table", id: "plastico", rowLabel: "Registro",
        title: "Control de plástico",
        columns: [
          { key: "lote", label: "Lote", type: "text" },
          { key: "tipo", label: "Tipo de plástico", type: "select", options: ["Enfarde", "Laminado", "Colectiva", "Paletizador"] },
          { key: "invInicial", label: "Inventario inicial", type: "number" },
          { key: "invFinal", label: "Inventario final", type: "number" },
          { key: "desperdicio", label: "Desperdicio", type: "number" }
        ]
      },
      {
        type: "repeater-table", id: "inactividad", rowLabel: "Inactividad",
        title: "Control de inactividad",
        columns: [
          { key: "horaInicio", label: "Hora inicio", type: "time" },
          { key: "horaFinal", label: "Hora final", type: "time" },
          { key: "equipo", label: "Equipo", type: "text" },
          { key: "causa", label: "Causa / motivo", type: "textarea" },
          { key: "lotes", label: "Lotes afectados", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaOperario", label: "Firma Operario" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  {
    id: "CEA-001", code: "R-CEA-001", area: "Empaque",
    title: "Registro de Cuchillos y Cucharones — Empaque Arroz",
    shortTitle: "Cuchillos Empaque Arroz",
    desc: "Control semanal de cuchillos y cucharones del grupo de empaque de arroz.",
    icon: "🔪", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true },
          { id: "semana", label: "Fecha", type: "date", default: "today" }
        ]
      },
      {
        type: "repeater-table", id: "cuchillo", rowLabel: "Cuchillo",
        title: "Cuchillos",
        columns: [
          { key: "numero", label: "No. de cuchillo", type: "text" },
          { key: "dia", label: "Día", type: "select", options: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] },
          { key: "limpio", label: "Limpió", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "desinfecto", label: "Desinfectó", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "estado", label: "Estado", type: "radio", options: [{ value: "BUENO", label: "Buen estado" }, { value: "MALO", label: "Mal estado" }] },
          { key: "responsable", label: "Responsable", type: "text" }
        ]
      },
      {
        type: "repeater-table", id: "cucharon", rowLabel: "Cucharón",
        title: "Cucharones",
        columns: [
          { key: "numero", label: "No. de cucharón", type: "text" },
          { key: "dia", label: "Día", type: "select", options: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] },
          { key: "limpio", label: "Limpió", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "desinfecto", label: "Desinfectó", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "estado", label: "Estado", type: "radio", options: [{ value: "BUENO", label: "Buen estado" }, { value: "MALO", label: "Mal estado" }] },
          { key: "responsable", label: "Responsable", type: "text" }
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm)", columns: 2,
        note: "Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm.",
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" },
          { id: "concS", label: "Concentración Sábado", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  {
    id: "CME-001", code: "R-CME-001", area: "Empaque",
    title: "Registro Control Consumo Material de Empaque Arroz",
    shortTitle: "Consumo Material Empaque",
    desc: "Consumo de material de empaque por máquina y presentación.",
    icon: "🧵", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "repeater-table", id: "consumo", rowLabel: "Registro",
        title: "Registros de consumo",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "responsable", label: "Responsable", type: "text" },
          { key: "maquina", label: "Máquina de empaque", type: "text" },
          { key: "presentacion", label: "Presentación", type: "text" },
          { key: "pesoBolsa", label: "Peso de bolsa (kg)", type: "number" },
          { key: "bobinaIni", label: "Peso de bobina inicial", type: "number" },
          { key: "bobinaFin", label: "Peso de bobina final", type: "number" },
          { key: "rodillos", label: "Rodillos", type: "number" },
          { key: "desperdicio", label: "Desperdicio (gramos)", type: "number" },
          { key: "bultos", label: "Bultos", type: "number" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaOperador", label: "Firma Operador Empaque" },
        { id: "firmaSIG", label: "Firma Encargado SIG" }
      ] }
    ]
  },

  {
    id: "DSD-001", code: "R-DSD-001", area: "Empaque",
    title: "Devolución de Sacos y Saquitas Defectuosas",
    shortTitle: "Devolución de Sacos",
    desc: "Registro de sacos y saquitas devueltos a proveeduría por defectos.",
    icon: "↩️", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "proveedor", label: "Proveedor del material devuelto", type: "text", required: true }
        ]
      },
      {
        type: "checkbox-list", id: "material", withQty: true,
        title: "Material devuelto",
        note: "Marque el material e indique la cantidad devuelta.",
        items: [
          "Saquito Liborio 99% 6kg", "Saquito Liborio 95% 6kg",
          "Saquito Liborio 90% 8kg", "Saquito Liborio 80% 10kg",
          "Sacos de 46kg", "Sacos de 23kg", "Privados"
        ]
      },
      {
        type: "checkbox-list", id: "motivo",
        title: "Motivo de la devolución",
        items: [
          "Impresión", "Daños en superficie", "Olor",
          "Trozado", "Falta manigueta", "Medida incorrecta"
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaOperador", label: "Firma Operador" },
        { id: "firmaProveeduria", label: "Firma Proveeduría" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // ===== Lote A =====
// =================================================================
  // 1. R-ANU-001 Registro de Actividades No Usuales
  // =================================================================
  {
    id: "ANU-001", code: "R-ANU-001", area: "Calidad",
    title: "Registro de Actividades No Usuales",
    shortTitle: "Actividades No Usuales",
    desc: "Registro de eventos no usuales con acciones correctivas y responsables.",
    icon: "⚠️", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "repeater-table", id: "evento", rowLabel: "Evento",
        title: "Registro de actividades no usuales",
        columns: [
          { key: "fecha", label: "Fecha reporte", type: "date", default: "today" },
          { key: "hora", label: "Hora", type: "time" },
          { key: "evento", label: "Evento", type: "textarea" },
          { key: "acciones", label: "Observaciones y acciones correctivas", type: "textarea" },
          { key: "respHallazgo", label: "Responsable hallazgo", type: "text" },
          { key: "respCorreccion", label: "Responsable corrección", type: "text" },
          { key: "departamento", label: "Departamento", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaInocuidad", label: "Firma Inocuidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // 2. R-CDV-001 Registro Control Dosificación de Vitamina
  // =================================================================
  {
    id: "CDV-001", code: "R-CDV-001", area: "Calidad",
    title: "Registro Control Dosificación de Vitamina",
    shortTitle: "Dosificación de Vitamina",
    desc: "Control de la dosificación de vitamina con tres réplicas y promedio.",
    icon: "💊", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true }
        ]
      },
      {
        type: "repeater-table", id: "dosif", rowLabel: "Registro",
        title: "Control de dosificación de vitamina",
        note: "Registre las tres réplicas (R1, R2, R3). El promedio se calcula a partir de ellas.",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "hora", label: "Hora", type: "time" },
          { key: "presentacion", label: "Presentación", type: "text" },
          { key: "dosifRequerida", label: "Dosificación requerida", type: "text" },
          { key: "dosificacion", label: "Dosificación", type: "text" },
          { key: "r1", label: "Revisión dosificador R1", type: "number", step: "0.01" },
          { key: "r2", label: "Revisión dosificador R2", type: "number", step: "0.01" },
          { key: "r3", label: "Revisión dosificador R3", type: "number", step: "0.01" },
          { key: "promedio", label: "Promedio", type: "number", step: "0.01" },
          { key: "ajuste", label: "Ajuste realizado", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "responsable", label: "Responsable", type: "select", options: RESPONSABLES },
          { key: "observaciones", label: "Observaciones", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // 3. R-CPB-001 Control de Peso de Bolsas equipo Perfor
  // =================================================================
  {
    id: "CPB-001", code: "R-CPB-001", area: "Calidad",
    title: "Registro Control de Pesos de Bolsas Equipo Perfor",
    shortTitle: "Peso de Bolsas Perfor",
    desc: "Control de pesaje de plástico de bolsas del equipo Perfor (tres pesos y promedio).",
    icon: "⚖️", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "repeater-table", id: "pesaje", rowLabel: "Registro",
        title: "Control de pesaje de plástico (g)",
        note: "Registre los tres pesos del plástico; el promedio se calcula a partir de ellos.",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "producto", label: "Producto empacado", type: "text" },
          { key: "codigo", label: "Código", type: "text" },
          { key: "empacadora", label: "Empacadora", type: "text" },
          { key: "peso1", label: "Peso 1 (g)", type: "number", step: "0.01", min: 0 },
          { key: "peso2", label: "Peso 2 (g)", type: "number", step: "0.01", min: 0 },
          { key: "peso3", label: "Peso 3 (g)", type: "number", step: "0.01", min: 0 },
          { key: "promedio", label: "Promedio (g)", type: "number", step: "0.01", min: 0 },
          { key: "analista", label: "Analista", type: "select", options: RESPONSABLES },
          { key: "observaciones", label: "Observaciones", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // 4. R-ETP-001 Registro Etiquetado de Producto Terminado
  // =================================================================
  {
    id: "ETP-001", code: "R-ETP-001", area: "Calidad",
    title: "Registro Etiquetado de Producto Terminado",
    shortTitle: "Etiquetado Producto Terminado",
    desc: "Verificación de etiquetas de producto terminado: legibilidad, código de barras y aceptación.",
    icon: "🏷️", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "repeater-table", id: "etiqueta", rowLabel: "Registro",
        title: "Etiquetado de producto terminado",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "codigoProducto", label: "Código producto", type: "text" },
          { key: "calidad", label: "Calidad", type: "text" },
          { key: "registroSanitario", label: "Registro sanitario", type: "text" },
          { key: "lote", label: "Lote", type: "text" },
          { key: "fechaVencimiento", label: "Fecha vencimiento", type: "date" },
          { key: "cantidadEtiquetas", label: "Cantidad de etiquetas", type: "number", min: 0 },
          { key: "legible", label: "Legible", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "centrada", label: "Centrada", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "sinSaltos", label: "Sin saltos de impresión", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "codigoBarras", label: "Buen código de barras", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "aceptaLiborio", label: "Firma aceptación uso — Calidad Liborio", type: "text" },
          { key: "aceptaKani", label: "Firma aceptación uso — Calidad KANI", type: "text" },
          { key: "observaciones", label: "Observaciones", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // 5. R-INV-001 Registro Inventario Diario Vitamina
  // =================================================================
  {
    id: "INV-001", code: "R-INV-001", area: "Calidad",
    title: "Registro Inventario Diario de Vitamina",
    shortTitle: "Inventario Diario Vitamina",
    desc: "Inventario inicial y final diario de vitamina y cálculo de consumo.",
    icon: "📊", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true, default: "Empaque" },
          { id: "responsable", label: "Responsable", type: "select", required: true, options: RESPONSABLES }
        ]
      },
      {
        type: "repeater-table", id: "inv", rowLabel: "Día",
        title: "Inventario diario de vitamina",
        note: "Registre el inventario inicial y final por día; el consumo es la diferencia.",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "iniTarimas", label: "Inicial — Tarimas", type: "number", min: 0 },
          { key: "iniTolvas", label: "Inicial — Tolvas", type: "number", min: 0 },
          { key: "iniDosificador", label: "Inicial — Dosificador", type: "number", min: 0 },
          { key: "iniKg", label: "Inicial — Kg", type: "number", step: "0.01", min: 0 },
          { key: "iniTotal", label: "Inicial — Total inventario", type: "number", step: "0.01", min: 0 },
          { key: "finTarimas", label: "Final — Tarimas", type: "number", min: 0 },
          { key: "finTolvas", label: "Final — Tolvas", type: "number", min: 0 },
          { key: "finDosificador", label: "Final — Dosificador", type: "number", min: 0 },
          { key: "finKg", label: "Final — Kg", type: "number", step: "0.01", min: 0 },
          { key: "finTotal", label: "Final — Total inventario", type: "number", step: "0.01", min: 0 },
          { key: "consumo", label: "Consumo", type: "number", step: "0.01", min: 0 },
          { key: "observaciones", label: "Observaciones", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // 6. R-LHM-001 Control, Limpieza y Desinfección de Herramientas para Muestras
  // =================================================================
  {
    id: "LHM-001", code: "R-LHM-001", area: "Calidad",
    title: "Registro de Control, Limpieza y Desinfección de Herramientas para Muestras",
    shortTitle: "Herramientas para Muestras",
    desc: "Limpieza, desinfección y estado de las herramientas usadas para tomar muestras.",
    icon: "🧪", version: 1, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "responsable", label: "Responsable", type: "select", required: true, options: RESPONSABLES }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza y desinfección por día",
        note: "Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto directo 300–500 ppm. Marque la actividad realizada y el día de la semana.",
        days: DIAS_SEMANA,
        columns: [
          { key: "limpieza", label: "Limpieza" },
          { key: "desinfeccion", label: "Desinfección" }
        ],
        rows: [
          "Bandeja Plástica 1", "Bandeja Plástica 2", "Bandeja Plástica 3", "Bandeja Plástica 4",
          "Cribas 1", "Cilindro 1", "Cilindro 2", "Cilindro 3", "Chuzo 1", "Chuzo 2"
        ]
      },
      {
        type: "checklist",
        title: "Estado de las herramientas",
        note: "Indique el estado de cada herramienta.",
        options: [
          { value: "BUENO", label: "Bueno" },
          { value: "MALO", label: "Malo" }
        ],
        items: [
          "Bandeja Plástica 1", "Bandeja Plástica 2", "Bandeja Plástica 3", "Bandeja Plástica 4",
          "Cribas 1", "Cilindro 1", "Cilindro 2", "Cilindro 3", "Chuzo 1", "Chuzo 2"
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // 7. R-POM-001 Pruebas de Operación Material de Empaque
  // =================================================================
  {
    id: "POM-001", code: "R-POM-001", area: "Calidad",
    title: "Registro Pruebas de Operación Material de Empaque",
    shortTitle: "Pruebas Operación Empaque",
    desc: "Pruebas de operación en equipos para validar el material de empaque recibido.",
    icon: "🔧", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Descripción del producto", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "proveedor", label: "Proveedor", type: "text", required: true },
          { id: "lote", label: "Lote", type: "text" },
          { id: "calidad", label: "Calidad", type: "text" },
          { id: "encargado", label: "Encargado operación", type: "select", options: RESPONSABLES }
        ]
      },
      {
        type: "checklist",
        title: "Pruebas de operación en equipos",
        options: [
          { value: "SI", label: "Sí" },
          { value: "NO", label: "No" }
        ],
        items: [
          "Adecuado desbobinado",
          "Adecuado paso por cuello y tubo formador",
          "Exceso de antideslizante",
          "Sellado vertical adecuado",
          "Centrado adecuado del sello vertical",
          "Sellado horizontal adecuado",
          "Variación en parámetros de temperatura",
          "Formación adecuada de fuelles",
          "Adecuada adherencia de cinta impresión",
          "Apertura homogénea de orificios en espuela",
          "Resistencia adecuada al rasgado vertical",
          "Presencia de corte horizontal en costura",
          "Apertura excesiva en costura",
          "Resistencia a la formación de cadenilla",
          "Resistencia adecuada del paletizado en tarima",
          "Adecuado rendimiento de paletizado"
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // 8. R-PRR-001 Control de Producto Rechazado o Retenido
  // =================================================================
  {
    id: "PRR-001", code: "R-PRR-001", area: "Calidad",
    title: "Registro Control de Producto Rechazado o Retenido",
    shortTitle: "Producto Rechazado/Retenido",
    desc: "Control de producto rechazado o retenido con cantidades, resultado y causa.",
    icon: "🚫", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "repeater-table", id: "prr", rowLabel: "Registro",
        title: "Control de producto rechazado o retenido",
        columns: [
          { key: "fechaIngreso", label: "Fecha ingreso", type: "date", default: "today" },
          { key: "responsable", label: "Responsable", type: "select", options: RESPONSABLES },
          { key: "area", label: "Área", type: "text" },
          { key: "tipoProducto", label: "Tipo de producto", type: "text" },
          { key: "sacos", label: "Cantidad — Sacos", type: "number", min: 0 },
          { key: "saconas", label: "Cantidad — Saconas", type: "number", min: 0 },
          { key: "bultos", label: "Cantidad — Bultos", type: "number", min: 0 },
          { key: "saquitos", label: "Cantidad — Saquitos / Sacos", type: "number", min: 0 },
          { key: "kilogramos", label: "Cantidad — Kilogramos", type: "number", step: "0.01", min: 0 },
          { key: "resultado", label: "Resultado de la revisión", type: "select", options: ["Retenido", "Rechazado"] },
          { key: "causa", label: "Causa", type: "textarea" },
          { key: "observaciones", label: "Observaciones", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // 9. R-RDI-001 Revisión de Imanes
  // =================================================================
  {
    id: "RDI-001", code: "R-RDI-001", area: ["Calidad", "Pilado"],
    title: "Registro Revisión de Imanes",
    shortTitle: "Revisión de Imanes",
    desc: "Revisión de imanes por equipo (Empaque, Pilado y Frijoles), metales y residuos.",
    icon: "🧲", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha de revisión", type: "date", required: true, default: "today" },
          { id: "responsable", label: "Responsable", type: "select", required: true, options: RESPONSABLES }
        ]
      },
      {
        type: "radio-area", title: "Área", id: "area",
        options: ["Empaque", "Pilado", "Frijoles"], required: true
      },
      {
        type: "checklist",
        title: "Revisión de imanes por equipo",
        note: "√ Revisado-aceptable · Χ Presencia de objetos · N/A No aplica. Marque solo los equipos del área seleccionada.",
        options: [
          { value: "OK", label: "√" },
          { value: "X", label: "Χ" },
          { value: "NA", label: "N/A" }
        ],
        items: [
          "Empaque — Banda Entrada",
          "Empaque — Máquina 1 (1,8 Kg)",
          "Empaque — Máquina 2 (1,8 Kg)",
          "Empaque — Máquina 3 (3-5 Kg)",
          "Empaque — Máquina 4 (Saquitas)",
          "Empaque — Máquina 5 (Sacos)",
          "Pilado — Precisión Sizer",
          "Pilado — Buhler #1",
          "Pilado — Pulidor Buhler",
          "Pilado — Pulidor KB",
          "Pilado — Selectora Electrónica",
          "Frijoles — Pulidor",
          "Frijoles — Caja Densimétrica",
          "Frijoles — Tolva llenado",
          "Frijoles — Máquina empaque (700-800 g)"
        ]
      },
      {
        type: "fields", title: "Hallazgos", columns: 2,
        fields: [
          { id: "metales", label: "Metales encontrados", type: "text" },
          { id: "pesoResidual", label: "Peso de material residual", type: "number", step: "0.01", min: 0 },
          { id: "accionesCorrectivas", label: "Acciones correctivas", type: "textarea" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // 10. R-TPD-001 Trazabilidad de Producto de Desecho / Reprocesos
  // =================================================================
  {
    id: "TPD-001", code: "R-TPD-001", area: "Calidad",
    title: "Registro de Trazabilidad de Reprocesos",
    shortTitle: "Trazabilidad de Reprocesos",
    desc: "Trazabilidad del producto de desecho / reproceso: punto de salida y destino.",
    icon: "♻️", version: 3, emision: "Aug-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "departamento", label: "Departamento", type: "text", required: true }
        ]
      },
      {
        type: "repeater-table", id: "tpd", rowLabel: "Registro",
        title: "Trazabilidad de reprocesos",
        columns: [
          { key: "tipoProducto", label: "Tipo de producto", type: "text" },
          { key: "peso", label: "Peso", type: "number", step: "0.01", min: 0 },
          { key: "puntoSalida", label: "Punto salida", type: "text" },
          { key: "puntoDestino", label: "Punto destino", type: "text" },
          { key: "lote", label: "Lote", type: "text" },
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "analista", label: "Analista responsable", type: "select", options: RESPONSABLES },
          { key: "observaciones", label: "Observaciones", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // 11. R-CEF-001 Cuchillos y Cucharones Empaque Frijoles
  // =================================================================
  {
    id: "CEF-001", code: "R-CEF-001", area: "Frijoles",
    title: "Registro de Cuchillos y Cucharones — Empaque Frijoles",
    shortTitle: "Cuchillos Empaque Frijoles",
    desc: "Control semanal de cuchillos y cucharones del grupo de empaque de frijoles.",
    icon: "🔪", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true, default: "Frijoles" },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" }
        ]
      },
      {
        type: "repeater-table", id: "cuchillo", rowLabel: "Cuchillo",
        title: "Cuchillos",
        columns: [
          { key: "numero", label: "No. de cuchillo", type: "text" },
          { key: "dia", label: "Día", type: "select", options: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] },
          { key: "limpio", label: "Limpió", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "desinfecto", label: "Desinfectó", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "responsable", label: "Responsable", type: "text" }
        ]
      },
      {
        type: "repeater-table", id: "cucharon", rowLabel: "Cucharón",
        title: "Cucharones",
        columns: [
          { key: "numero", label: "No. de cucharón", type: "text" },
          { key: "dia", label: "Día", type: "select", options: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] },
          { key: "limpio", label: "Limpió", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "desinfecto", label: "Desinfectó", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "responsable", label: "Responsable", type: "text" }
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm)", columns: 2,
        note: "Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm.",
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" },
          { id: "concS", label: "Concentración Sábado", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // 12. R-ASL-001 Control Industrial Compra Arroz en Granza — Secadora de Laboratorio
  // =================================================================
  {
    id: "ASL-001", code: "R-ASL-001", area: "Calidad",
    title: "Registro Control Industrial Compra Arroz en Granza — Secadora de Laboratorio",
    shortTitle: "Secadora de Laboratorio",
    desc: "Control de temperatura y humedad de la granza durante el secado de laboratorio.",
    icon: "🌾", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "numeroEntrega", label: "Número de entrega muestra", type: "text", required: true }
        ]
      },
      {
        type: "repeater-table", id: "secado", rowLabel: "Lectura",
        title: "Control de secado",
        columns: [
          { key: "dia", label: "Día", type: "date", default: "today" },
          { key: "hora", label: "Hora", type: "time" },
          { key: "tempGranza", label: "Temp. Granza (°C)", type: "number", step: "0.1" },
          { key: "humGranza", label: "Hum. Granza (%)", type: "number", step: "0.01", min: 0, max: 100 },
          { key: "tempSecadora", label: "Temp. Secadora (°C)", type: "number", step: "0.1" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // 13. R-CIA-001 Control Ingresos y Análisis Compra Materia Prima
  // =================================================================
  {
    id: "CIA-001", code: "R-CIA-001", area: "Calidad",
    title: "Registro Control Ingresos y Análisis de Compra de Materia Prima",
    shortTitle: "Ingresos y Análisis Materia Prima",
    desc: "Control de ingreso y análisis de calidad, rendimiento e inocuidad de arroz en granza comprado.",
    icon: "🌾", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true },
          { id: "responsable", label: "Responsable", type: "select", required: true, options: RESPONSABLES },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "numeroSilo", label: "Número de silo", type: "text" }
        ]
      },
      {
        type: "fields", title: "Datos del productor", columns: 2,
        fields: [
          { id: "nombre", label: "Nombre", type: "text" },
          { id: "cedula", label: "Cédula", type: "text" },
          { id: "variedadArroz", label: "Variedad de arroz", type: "text" }
        ]
      },
      {
        type: "fields", title: "Datos descarga camión", columns: 2,
        fields: [
          { id: "fechaIngreso", label: "Fecha ingreso", type: "date" },
          { id: "numGuia", label: "Nº Guía", type: "text" },
          { id: "reciboSistema", label: "Recibo sistema", type: "text" },
          { id: "placaCamion", label: "Placa camión", type: "text" },
          { id: "pesoBruto", label: "Peso bruto (kg)", type: "number", step: "0.01", min: 0 },
          { id: "pesoTara", label: "Peso tara (kg)", type: "number", step: "0.01", min: 0 },
          { id: "pesoNeto", label: "Peso neto (kg)", type: "number", step: "0.01", min: 0 },
          { id: "totalQuintales", label: "Total quintales", type: "number", step: "0.01", min: 0 }
        ]
      },
      {
        type: "fields", title: "Condición arroz en granza", columns: 2,
        fields: [
          { id: "temperatura", label: "Temperatura (°C)", type: "number", step: "0.1" },
          { id: "olor", label: "Olor", type: "text" },
          { id: "humCompra", label: "Hum. compra (%)", type: "number", step: "0.01", min: 0, max: 100 },
          { id: "impCompra", label: "Imp. compra (%)", type: "number", step: "0.01", min: 0, max: 100 },
          { id: "numeroMancha", label: "Número de mancha", type: "text" },
          { id: "alergenosGranza", label: "Alérgenos", type: "text" },
          { id: "infestacion", label: "Infestación", type: "text" },
          { id: "otrosContaminantes", label: "Otros contaminantes", type: "text" }
        ]
      },
      {
        type: "fields", title: "Componentes grado calidad", columns: 2,
        fields: [
          { id: "pesoMuestra", label: "Peso muestra (g)", type: "number", step: "0.01", min: 0 },
          { id: "pesoManchado", label: "Peso manchado (g)", type: "number", step: "0.01", min: 0 },
          { id: "pesoYesoso", label: "Peso yesoso (g)", type: "number", step: "0.01", min: 0 },
          { id: "pesoGranoRojo", label: "Peso grano rojo (g)", type: "number", step: "0.01", min: 0 },
          { id: "granoRojoUnd", label: "Grano rojo (und/kg)", type: "number", step: "0.01", min: 0 },
          { id: "pesoGDanado", label: "Peso G. dañado (g)", type: "number", step: "0.01", min: 0 },
          { id: "semObjetables", label: "Sem. objetables", type: "text" },
          { id: "arrozManchado", label: "Arroz manchado (%)", type: "number", step: "0.01", min: 0, max: 100 },
          { id: "arrozYesoso", label: "Arroz yesoso (%)", type: "number", step: "0.01", min: 0, max: 100 },
          { id: "arrozRojo", label: "Arroz rojo (%)", type: "number", step: "0.01", min: 0, max: 100 },
          { id: "arrozDanado", label: "Arroz dañado (%)", type: "number", step: "0.01", min: 0, max: 100 }
        ]
      },
      {
        type: "fields", title: "Componentes de rendimiento", columns: 2,
        fields: [
          { id: "humAnalisis", label: "Hum. análisis (%)", type: "number", step: "0.01", min: 0, max: 100 },
          { id: "pesoGranzaSucia", label: "Peso muestra granza sucia (g)", type: "number", step: "0.01", min: 0 },
          { id: "pesoGranzaLimpia", label: "Peso muestra granza limpia (g)", type: "number", step: "0.01", min: 0 },
          { id: "pesoIntegral", label: "Peso integral (g)", type: "number", step: "0.01", min: 0 },
          { id: "pesoPilado", label: "Peso pilado (g)", type: "number", step: "0.01", min: 0 },
          { id: "pesoMuestraEnteros", label: "Peso muestra enteros (g)", type: "number", step: "0.01", min: 0 },
          { id: "pesoEntero", label: "Peso entero (g)", type: "number", step: "0.01", min: 0 },
          { id: "pesoQuebrado", label: "Peso quebrado (g)", type: "number", step: "0.01", min: 0 },
          { id: "pesoPuntilla", label: "Peso puntilla (g)", type: "number", step: "0.01", min: 0 },
          { id: "rendEntero", label: "Rend. entero (%)", type: "number", step: "0.01", min: 0, max: 100 },
          { id: "rendQuebrado", label: "Rend. quebrado (%)", type: "number", step: "0.01", min: 0, max: 100 },
          { id: "rendMiga", label: "Rend. miga (%)", type: "number", step: "0.01", min: 0, max: 100 },
          { id: "rendSemolina", label: "Rend. semolina (%)", type: "number", step: "0.01", min: 0, max: 100 }
        ]
      },
      {
        type: "fields", title: "Inocuidad camión", columns: 2,
        note: 'Indique con "Sí / No" la presencia de plagas, alérgenos, olores u otros contaminantes.',
        fields: [
          { id: "camionLibrePlagas", label: "Libre de plagas", type: "select", options: ["Sí", "No"] },
          { id: "camionSinOlores", label: "Sin malos olores", type: "select", options: ["Sí", "No"] },
          { id: "camionLimpio", label: "Camión limpio", type: "select", options: ["Sí", "No"] },
          { id: "camionSeco", label: "Camión seco", type: "select", options: ["Sí", "No"] },
          { id: "camionAlergenos", label: "Alérgenos", type: "select", options: ["Sí", "No"] },
          { id: "camionOtros", label: "Otros contaminantes (vidrio, excretas, animales muertos)", type: "text" }
        ]
      },
      {
        type: "fields", title: "Inocuidad materia prima", columns: 2,
        fields: [
          { id: "mpLibrePlagas", label: "Libre de plagas", type: "select", options: ["Sí", "No"] },
          { id: "mpSinOlores", label: "Sin malos olores", type: "select", options: ["Sí", "No"] },
          { id: "mpAlergenos", label: "Alérgenos", type: "select", options: ["Sí", "No"] },
          { id: "mpOtros", label: "Otros contaminantes (vidrio, excretas, animales muertos)", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // R-EDL-01 retirado temporalmente del sistema (2026-06-02).
  // =================================================================

  // =================================================================
  // 15. R-LLC-001 Limpieza Laboratorio Calidad
  // =================================================================
  {
    id: "LLC-001", code: "R-LLC-001", area: "Calidad",
    title: "Registro para la Limpieza del Laboratorio de Calidad",
    shortTitle: "Limpieza Laboratorio Calidad",
    desc: "Limpieza y desinfección semanal de equipos y áreas del laboratorio de calidad.",
    icon: "🧹", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true, default: "Laboratorio Pilado" },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "realizadoPor", label: "Realizado por", type: "select", options: RESPONSABLES }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza y desinfección",
        note: "Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm. Indique con un Sí la actividad realizada y el día que se ejecutó.",
        days: DIAS_SEMANA,
        columns: [
          { key: "limpieza", label: "Limpieza" },
          { key: "desinfeccion", label: "Desinfección" }
        ],
        rows: [
          "Computadora", "Monitor", "Teclado", "Mouse", "Sillas", "Mesas",
          "Medidor de blancuras", "Romanas", "Cámara fría", "Pulidor",
          "Determinador humedad de granos", "Aspirador de muestras",
          "Descascarador de muestras", "Mesas de clasificación de masa blanca",
          "Equipos para laboratorio Zaccarrias", "Herramientas generales",
          "Bandejas triangulares", "Bandejas y fondos para arroz en granza",
          "Piso", "Puertas de acceso", "Aire acondicionado", "Recipientes plásticos"
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm)", columns: 2,
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" },
          { id: "concS", label: "Concentración Sábado", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // ===== Lote B =====
// =================================================================
  // 1. R-CAC-001 — Inspección compresores de aire comprimido
  // =================================================================
  {
    id: "CAC-001", code: "R-CAC-001", area: "Mantenimiento",
    title: "Registro de inspección compresores de aire comprimido",
    shortTitle: "Inspección Compresores",
    desc: "Inspección de compresores de aire comprimido y su mantenimiento.",
    icon: "🌀", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "responsable", label: "Responsable", type: "select", required: true, options: RESPONSABLES },
          { id: "modelo", label: "Modelo compresor", type: "text" },
          { id: "horimetroInicial", label: "Horímetro inicial", type: "number", min: 0 },
          { id: "horimetroFinal", label: "Horímetro final", type: "number", min: 0 }
        ]
      },
      {
        type: "checklist", title: "Detalle de la inspección",
        note: "Marque Sí / No para cada ítem. Anote hallazgos y acción correctiva en Observaciones.",
        options: SINO_OPC,
        items: [
          "El compresor se encuentra limpio, sin derrames de aceite y sin daños en la pantalla digital (revisión semanal).",
          "Se realiza la revisión del nivel de aceite en el compresor (revisión semanal).",
          "Se muestran mensajes de error o advertencia en la pantalla digital del compresor (revisión semanal).",
          "Se presentan fugas de aire en las tuberías o en los componentes externos/internos del compresor.",
          "Se desarrolla la revisión de sus componentes eléctricos internos, incluye fusibles de línea.",
          "Se desarrolla la revisión y limpieza de los filtros del compresor.",
          "Se desarrolla la revisión del estado del monitor de fase en el compresor.",
          "Se desarrolla la medición y revisión de temperatura y presión en el compresor.",
          "Se desarrolla la medición y revisión del sistema de alimentación eléctrica.",
          "Se desarrolla la limpieza y ajuste de las conexiones eléctricas internas/externas del compresor.",
          "Se desarrolla el cambio de los elementos filtrantes de los filtros del compresor (recomendado cada 4000 horas).",
          "Se desarrolla la purga de los filtros del compresor (recomendado cada 4000 horas).",
          "Se realiza el cambio de aceite del compresor (recomendado cada 4000 horas).",
          "Se desarrolla la revisión y prueba de funcionamiento de los LED/pantalla (recomendado cada 8000 horas)."
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas", fields: [
          { id: "firmaMantenimiento", label: "Firma Mantenimiento" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 2. R-CEH-001 — Control consumo de energía en horas punta
  // =================================================================
  {
    id: "CEH-001", code: "R-CEH-001", area: "Mantenimiento",
    title: "Registro Control consumo de energía en horas punta",
    shortTitle: "Consumo Energía Horas Punta",
    desc: "Control del consumo de energía en los horarios punta (ICE 3, 8 y 13).",
    icon: "⚡", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "info", title: "Parámetros de control",
        lines: [
          "Revisión de parámetros de control en tres horarios punta:",
          "9:50 am (ICE 3) · 4:50 pm (ICE 8) · 7:50 pm (ICE 13)."
        ]
      },
      {
        type: "repeater-table", id: "consumo", rowLabel: "Registro",
        title: "Registros de consumo de energía",
        note: "Agregue una fila por fecha de revisión.",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "operador", label: "Operador de energía", type: "text", default: "ICE" },
          { key: "area", label: "Área", type: "text", default: "Transformadores" },
          { key: "ice3", label: "9:50 am (ICE 3)", type: "number", step: 0.01 },
          { key: "ice8", label: "4:50 pm (ICE 8)", type: "number", step: 0.01 },
          { key: "ice13", label: "7:50 pm (ICE 13)", type: "number", step: 0.01 }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas", fields: [
          { id: "firmaMantenimiento", label: "Firma Mantenimiento / Supervisor Energía" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 3. R-IGE-001 — Inspección gabinetes eléctricos
  // =================================================================
  {
    id: "IGE-001", code: "R-IGE-001", area: "Mantenimiento",
    title: "Registro inspección gabinetes eléctricos",
    shortTitle: "Inspección Gabinetes Eléctricos",
    desc: "Inspección del estado y seguridad de los gabinetes eléctricos.",
    icon: "🔌", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "codigoGabinete", label: "Código gabinete eléctrico", type: "text" },
          { id: "responsable", label: "Responsable", type: "select", required: true, options: RESPONSABLES }
        ]
      },
      {
        type: "checklist", title: "Detalle de la inspección",
        note: "Marque Sí / No para cada ítem. Anote hallazgos y acción correctiva en Observaciones.",
        options: SINO_OPC,
        items: [
          "El acceso al tablero se encuentra despejado (sin obstrucciones de ningún tipo).",
          "El tablero cuenta con la puerta frontal debidamente sellada y sin daños estructurales.",
          "El tablero presenta la señalización de riesgo eléctrico en forma legible en la puerta frontal.",
          "El tablero tiene señalizado el número de fases y su código de identificación en forma visible y legible.",
          "El tablero se encuentra libre de humedad o hidrocarburos (aceite) en su superficie externa o interna.",
          "El tablero se encuentra libre de polvo, harinas o semolina en su superficie externa e interna.",
          "Las pantallas se encuentran en buenas condiciones.",
          "El tablero posee tapa interior que no permite el contacto con partes energizadas.",
          "El tablero se encuentra instalado entre 0.6 m y 2 m de altura desde el nivel del piso.",
          "El tablero se encuentra conectado a tierras (incluyendo su puerta).",
          "El tablero cuenta con interruptores de corte o interruptores termomagnéticos automáticos.",
          "El tablero cuenta con interruptores diferenciales (10 mA para 220V monofásicos y 30 mA para 380V trifásicos).",
          "Todos los interruptores del tablero están debidamente identificados."
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas", fields: [
          { id: "firmaMantenimiento", label: "Firma Jefatura Mantenimiento" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 4. R-ILP-001 — Inspección de línea de pulido
  // =================================================================
  {
    id: "ILP-001", code: "R-ILP-001", area: "Mantenimiento",
    title: "Registro de inspección de línea de pulido",
    shortTitle: "Inspección Línea de Pulido",
    desc: "Inspección eléctrica y mecánica de la línea de pulido por máquina.",
    icon: "🛠️", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "responsable", label: "Responsable", type: "select", required: true, options: RESPONSABLES },
          { id: "maquina", label: "Máquina", type: "text", placeholder: "Ej: Pulidor KB 1" }
        ]
      },
      {
        type: "checklist", title: "Cableado",
        options: SINO_OPC,
        items: [
          "Corrección de empalmes o deficiencias de aislamiento en las líneas.",
          "Revisión y cambio de etiquetas dañadas.",
          "Limpieza de conductores.",
          "Ajuste de terminales de los conductores.",
          "Ordenamiento de conductores en sus canalizaciones respectivas."
        ]
      },
      {
        type: "checklist", title: "Amperímetro",
        options: SINO_OPC,
        items: [
          "Comparación de lectura con consumo real.",
          "Limpieza interna y externa del dispositivo.",
          "Carátula externa y aguja/pantalla en buen estado.",
          "Correcto funcionamiento del equipo en general."
        ]
      },
      {
        type: "checklist", title: "Iluminación",
        options: SINO_OPC,
        items: [
          "Limpieza interna y externa.",
          "Inspección de conexiones.",
          "LED/Fluorescente.",
          "Limpieza de soporte estructural."
        ]
      },
      {
        type: "checklist", title: "Motores",
        options: SINO_OPC,
        items: [
          "Limpieza de carcasa y sistema de ventilación.",
          "Ajuste y limpieza de caja de conexión eléctrica.",
          "Revisión del sonido de los rodamientos.",
          "Medición de consumo del equipo.",
          "Medición de temperatura."
        ]
      },
      {
        type: "checklist", title: "Panel eléctrico",
        options: SINO_OPC,
        items: [
          "Limpieza interna, externa y hermetizar.",
          "Ordenamiento del cableado interno.",
          "Limpieza y ajuste de terminales de conexión.",
          "Limpieza general de componentes internos del panel."
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas", fields: [
          { id: "firmaMantenimiento", label: "Firma Mantenimiento" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 5. R-IME-001 — Inspección de motores eléctricos
  // =================================================================
  {
    id: "IME-001", code: "R-IME-001", area: "Mantenimiento",
    title: "Registro de inspección de motores eléctricos",
    shortTitle: "Inspección Motores Eléctricos",
    desc: "Inspección del estado mecánico y eléctrico de los motores.",
    icon: "⚙️", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "responsable", label: "Responsable", type: "select", required: true, options: RESPONSABLES },
          { id: "codigoMotor", label: "Código motor", type: "text" }
        ]
      },
      {
        type: "checklist", title: "Detalle de la inspección",
        note: "Marque Sí / No para cada ítem. Anote hallazgos y acción correctiva en Observaciones.",
        options: SINO_OPC,
        items: [
          "La placa del fabricante del motor se encuentra en buenas condiciones y con información legible.",
          "La base de sujeción a la carcasa del motor se encuentra en buenas condiciones y sin daños estructurales.",
          "La carcasa del motor se encuentra en buenas condiciones y sin daños estructurales.",
          "El abanico del motor se encuentra en buenas condiciones, sin daños estructurales y con su respectivo cobertor.",
          "La placa de bornes del motor se encuentra en buenas condiciones, sin daños estructurales y con su respectivo cobertor.",
          "El cable del motor se encuentra debidamente canalizado, identificado, sin cortes y con los debidos conectores en sus extremos.",
          "El motor presenta una temperatura normal de operación de acuerdo a la información dada por el fabricante.",
          "El motor presenta ruidos no característicos.",
          "El motor presenta una revisión de embobinado menor a 6 meses.",
          "El motor presenta una revisión de rodamientos, rotor y eje menor a 3 meses.",
          "El piñón y cadena asociados al motor se encuentran en buenas condiciones y con su debido cobertor.",
          "La polea y fajas de arrastre asociadas al motor se encuentran en buenas condiciones y con su debido cobertor.",
          "El motor cuenta con una caja reductora libre de derrames de aceite y libre de daños estructurales.",
          "El motor se encuentra libre de suciedades que afecten su adecuado funcionamiento (polvo, semolina, cascarilla, ceniza, etc.)."
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas", fields: [
          { id: "firmaMantenimiento", label: "Firma Mantenimiento" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 6. R-ITE-001 — Inspección transformadores eléctricos
  // =================================================================
  {
    id: "ITE-001", code: "R-ITE-001", area: "Mantenimiento",
    title: "Registro Inspección transformadores eléctricos",
    shortTitle: "Inspección Transformadores",
    desc: "Inspección del estado y seguridad de los transformadores eléctricos.",
    icon: "🔋", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "codigoTransformador", label: "Código transformador", type: "text" },
          { id: "responsable", label: "Responsable", type: "select", required: true, options: RESPONSABLES }
        ]
      },
      {
        type: "checklist", title: "Detalle de la inspección",
        note: "Marque Sí / No para cada ítem. Anote hallazgos y acción correctiva en Observaciones.",
        options: SINO_OPC,
        items: [
          "El transformador cuenta con la placa del fabricante en buen estado y legible.",
          "El transformador se encuentra libre de impurezas, derrames de líquidos, residuos orgánicos y de animales.",
          "El transformador se encuentra sobre el nivel del piso en un soporte adecuado y sin daños estructurales.",
          "El transformador cuenta con un indicador de nivel de refrigerante en un punto visible y sin daños estructurales.",
          "El transformador cuenta con una adecuada puesta a tierra del tanque y del terminal neutro de baja tensión.",
          "Los pasatapas de alta tensión del transformador se encuentran libres de daños estructurales o de impurezas.",
          "Los terminales de alta tensión del transformador se encuentran libres de daños estructurales o de impurezas.",
          "Los pasatapas de baja tensión del transformador se encuentran libres de daños estructurales o de impurezas.",
          "Los terminales de baja tensión del transformador se encuentran libres de daños estructurales o de impurezas.",
          "El dispositivo de alivio de sobrepresión del transformador se encuentra libre de daños estructurales o de impurezas.",
          "El transformador cuenta con las etiquetas de riesgo eléctrico y equipo de protección requerido durante las inspecciones.",
          "El transformador cuenta con una revisión estructural profunda en un centro especializado durante el último año.",
          "El transformador cuenta con un estudio de medición eléctrica realizado por un técnico especializado durante el último año.",
          "El transformador cuenta con una revisión profunda del refrigerante en un centro especializado durante el último año."
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas", fields: [
          { id: "firmaMantenimiento", label: "Firma Jefatura Mantenimiento" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 7. R-LTM-001 — Limpieza Taller de Mantenimiento
  // =================================================================
  {
    id: "LTM-001", code: "R-LTM-001", area: "Mantenimiento",
    title: "Registro limpieza Taller de Mantenimiento",
    shortTitle: "Limpieza Taller Mantenimiento",
    desc: "Limpieza y desinfección semanal del taller de mantenimiento.",
    icon: "🧹", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true, default: "Taller de mantenimiento" },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "responsable", label: "Responsable", type: "select", required: true, options: RESPONSABLES }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza y desinfección",
        note: "Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm. Marque la actividad realizada y el día en que se ejecutó.",
        days: DIAS_SEMANA,
        columns: [{ key: "limpieza", label: "Limpieza" }, { key: "desinfeccion", label: "Desinfección" }],
        rows: [
          "Basureros",
          "Paredes",
          "Techo",
          "Piso",
          "Torno",
          "Estante de motores / piñones y poleas",
          "Taladro de mesa",
          "Esmeriladoras",
          "Banco de trabajo",
          "Dobladora",
          "Enrolladora",
          "Mesa de corte o trazado",
          "Mesa de revisión y reparación de motores",
          "Cortadora de metal",
          "Equipo para soldar",
          "Equipo de protección en alturas",
          "Iluminación",
          "Caño pluvial",
          "Caños para aguas pluviales",
          "Caño para recolección de derrames",
          "Tanque para recolección de derrames",
          "Zona frente al taller"
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm)", columns: 2,
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" },
          { id: "concS", label: "Concentración Sábado", type: "text" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas", fields: [
          { id: "firmaMantenimiento", label: "Firma Mantenimiento" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 8. R-OTM-001 — Orden de Trabajo para Mantenimiento
  // =================================================================
  {
    id: "OTM-001", code: "R-OTM-001", area: "Mantenimiento",
    title: "Registro orden de trabajo para Mantenimiento",
    shortTitle: "Orden de Trabajo Mantenimiento",
    desc: "Solicitud y seguimiento de órdenes de trabajo de mantenimiento.",
    icon: "📋", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Datos del solicitante", columns: 2,
        fields: [
          { id: "fechaSolicitud", label: "Fecha de solicitud", type: "date", required: true, default: "today" },
          { id: "solicitante", label: "Nombre del solicitante", type: "text", required: true },
          { id: "proceso", label: "Proceso", type: "text" },
          { id: "equipos", label: "Equipo(s)", type: "text" },
          { id: "descripcion", label: "Descripción del mantenimiento requerido", type: "textarea" }
        ]
      },
      {
        type: "fields", title: "Recepción de la solicitud", columns: 2,
        fields: [
          { id: "mantRequerido", label: "Mantenimiento requerido", type: "select", options: ["Eléctrico", "Mecánico", "Soldadura"] },
          { id: "tipoMant", label: "Tipo de mantenimiento", type: "select", options: ["Predictivo", "Preventivo", "Correctivo"] },
          { id: "prioridad", label: "Prioridad", type: "select", options: ["Alta", "Media", "Baja"] },
          { id: "tiempoRequerido", label: "Tiempo requerido", type: "select", options: ["Horas", "Días", "Semanas"] },
          { id: "fechaRecepcion", label: "Fecha de recepción", type: "date" },
          { id: "fechaInicio", label: "Fecha inicio mantenimiento", type: "date" },
          { id: "fechaFinal", label: "Fecha final mantenimiento", type: "date" },
          { id: "especialista", label: "Especialista responsable", type: "select", options: RESPONSABLES }
        ]
      },
      {
        type: "repeater-table", id: "materiales", rowLabel: "Material",
        title: "Materiales y herramientas",
        note: "Agregue los materiales requeridos y su cantidad.",
        columns: [
          { key: "material", label: "Material requerido", type: "text" },
          { key: "cantidad", label: "Cantidad", type: "number", min: 0 }
        ]
      },
      {
        type: "fields", title: "Finalización", columns: 2,
        fields: [
          { id: "limpiaArea", label: "¿Limpia y desinfecta el área?", type: "select", options: ["Sí", "No"] }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas", fields: [
          { id: "firmaMantenimiento", label: "Firma Mantenimiento" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 9. R-SAC-001 — Inspección secadores de aire comprimido
  // =================================================================
  {
    id: "SAC-001", code: "R-SAC-001", area: "Mantenimiento",
    title: "Registro inspección secadores de aire comprimido",
    shortTitle: "Inspección Secadores Aire",
    desc: "Inspección de los secadores de aire comprimido y su mantenimiento.",
    icon: "💨", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "responsable", label: "Responsable", type: "select", required: true, options: RESPONSABLES },
          { id: "modeloSecador", label: "Modelo secador", type: "text" }
        ]
      },
      {
        type: "checklist", title: "Detalle de la inspección",
        note: "Marque Sí / No para cada ítem. Anote hallazgos y acción correctiva en Observaciones.",
        options: SINO_OPC,
        items: [
          "El secador se encuentra limpio (estructura externa/interna) y sin daños en su superficie.",
          "Se presentan fugas en las tuberías o en sus componentes externos/internos.",
          "Se desarrolla la revisión de sus componentes eléctricos internos.",
          "La descarga del condensado se encuentra en buen estado y sin obstrucciones.",
          "Se desarrolla la purga de la descarga de condensado.",
          "Se desarrolla la limpieza y soplado externo del radiador serpentín.",
          "Se desarrolla la medición y revisión de temperatura.",
          "Se desarrolla la medición y revisión del sistema de alimentación eléctrica.",
          "Se desarrolla la limpieza y ajuste de las conexiones eléctricas internas/externas del secador."
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas", fields: [
          { id: "firmaMantenimiento", label: "Firma Mantenimiento" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 10. R-CMO-001 — Chequeo de montacargas
  // =================================================================
  {
    id: "CMO-001", code: "R-CMO-001", area: "Despacho",
    title: "Registro Chequeo de Montacargas",
    shortTitle: "Chequeo de Montacargas",
    desc: "Chequeo diario del estado del montacargas durante la semana.",
    icon: "🚜", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "horometro", label: "Horómetro", type: "number", min: 0 },
          { id: "codigoEquipo", label: "Código de equipo", type: "text" },
          { id: "responsable", label: "Responsable", type: "select", required: true, options: RESPONSABLES }
        ]
      },
      {
        type: "daily-checks",
        title: "Chequeo diario del montacargas",
        note: "Indique con ✓ que el ítem se encuentra en buen estado; marque ✗ en caso contrario y justifique en Observaciones.",
        days: DIAS_SEMANA,
        rows: [
          { label: "Revisión de ajuste de frenos", valor: "Frenos" },
          { label: "Revisión de líquidos de frenos", valor: "Frenos" },
          { label: "Revisar el agua o coolant del radiador", valor: "Radiador" },
          { label: "Aceite y filtros", valor: "Motor" },
          { label: "Revisión de retenedores", valor: "Mecánico" },
          { label: "Revisión de filtro de aire", valor: "Motor" },
          { label: "Revisión de fugas de aceite y agua o coolant", valor: "Fugas" },
          { label: "Revisión total de montacargas", valor: "General" }
        ],
        options: [
          { value: "OK", label: "✓" },
          { value: "NO", label: "✗" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas", fields: [
          { id: "firmaMantenimiento", label: "Firma Mantenimiento" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 11. R-CPT-001 — Control Pesado de Tarimas Producto Terminado
  // =================================================================
  {
    id: "CPT-001", code: "R-CPT-001", area: "Despacho",
    title: "Registro Control Pesado de Tarimas Producto Terminado",
    shortTitle: "Pesado de Tarimas PT",
    desc: "Control del pesaje de tarimas de producto terminado estibado.",
    icon: "⚖️", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true },
          { id: "responsable", label: "Responsable", type: "select", required: true, options: RESPONSABLES }
        ]
      },
      {
        type: "repeater-table", id: "tarima", rowLabel: "Tarima",
        title: "Registros de pesaje de tarimas",
        note: "Agregue una fila por cada tarima pesada.",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "producto", label: "Producto estibado", type: "text" },
          { key: "codigoProducto", label: "Código del producto", type: "text" },
          { key: "cantidad", label: "Cantidad bultos / sacos", type: "number", min: 0 },
          { key: "colorTarima", label: "Color de tarima", type: "text" },
          { key: "cobertor", label: "Cobertor", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "pesoVacia", label: "Peso vacía (kg)", type: "number", step: 0.01, min: 0 },
          { key: "pesoLlena", label: "Peso llena (kg)", type: "number", step: 0.01, min: 0 },
          { key: "condicion", label: "Condición", type: "select", options: ["En producción", "Rechazada"] }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas", fields: [
          { id: "firmaDespacho", label: "Firma Despacho" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 12. R-DPT-001 — Verificación de despacho de producto terminado
  // =================================================================
  {
    id: "DPT-001", code: "R-DPT-001", area: "Despacho",
    title: "Registro de Verificación de despacho del producto terminado",
    shortTitle: "Verificación Despacho PT",
    desc: "Verificación del producto y condición del camión al despachar.",
    icon: "🚚", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true }
        ]
      },
      {
        type: "repeater-table", id: "despacho", rowLabel: "Despacho",
        title: "Registros de verificación de despacho",
        note: "Datos del producto y condición del camión: Aceptado (✓) / Rechazado (✗).",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "horaEntrada", label: "Hora entrada", type: "time" },
          { key: "horaSalida", label: "Hora salida", type: "time" },
          { key: "notaEnvio", label: "Nota de envío", type: "text" },
          { key: "placaCabezal", label: "Placa cabezal", type: "text" },
          { key: "placaContenedor", label: "Placa contenedor", type: "text" },
          { key: "sopla", label: "Se sopla el producto", type: "radio", options: [{ value: "SI", label: "✓" }, { value: "NO", label: "✗" }] },
          { key: "cambioPaletizado", label: "Se cambió el paletizado", type: "radio", options: [{ value: "SI", label: "✓" }, { value: "NO", label: "✗" }] },
          { key: "tarimaBuena", label: "Tarima en buen estado", type: "radio", options: [{ value: "SI", label: "✓" }, { value: "NO", label: "✗" }] },
          { key: "productoLibrePlaga", label: "Producto libre de plaga", type: "radio", options: [{ value: "SI", label: "✓" }, { value: "NO", label: "✗" }] },
          { key: "camionFumigado", label: "Camión fumigado", type: "radio", options: [{ value: "SI", label: "✓" }, { value: "NO", label: "✗" }] },
          { key: "camionLimpio", label: "Camión limpio", type: "radio", options: [{ value: "SI", label: "✓" }, { value: "NO", label: "✗" }] },
          { key: "camionLibrePlaga", label: "Camión libre de plagas", type: "radio", options: [{ value: "SI", label: "✓" }, { value: "NO", label: "✗" }] },
          { key: "camionLibreOlor", label: "Camión libre de olores", type: "radio", options: [{ value: "SI", label: "✓" }, { value: "NO", label: "✗" }] },
          { key: "sinFiltraciones", label: "Sin filtraciones", type: "radio", options: [{ value: "SI", label: "✓" }, { value: "NO", label: "✗" }] },
          { key: "sinAberturas", label: "Sin aberturas", type: "radio", options: [{ value: "SI", label: "✓" }, { value: "NO", label: "✗" }] },
          { key: "sinMaterialesExtranos", label: "Sin materiales extraños", type: "radio", options: [{ value: "SI", label: "✓" }, { value: "NO", label: "✗" }] },
          { key: "realizadoPor", label: "Realizado por", type: "select", options: RESPONSABLES }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas", fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 13. R-LYT-001 — Revisión y Limpieza de tarimas
  // =================================================================
  {
    id: "LYT-001", code: "R-LYT-001", area: "Despacho",
    title: "Registro Revisión y Limpieza de tarimas",
    shortTitle: "Revisión y Limpieza Tarimas",
    desc: "Revisión, limpieza y aceptación de tarimas por contenedor.",
    icon: "🪵", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "info", title: "Estado de la tarima que se acepta",
        lines: [
          "La limpieza se realiza con aire comprimido.",
          "Una tarima se acepta si está: sin astillas ni quebraduras, libre de olores, sin clavos expuestos y sin humedad."
        ]
      },
      {
        type: "repeater-table", id: "tarima", rowLabel: "Registro",
        title: "Registros de revisión de tarimas",
        note: "Agregue una fila por cada lote de tarimas revisadas.",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "revisadas", label: "Cantidad de tarimas revisadas", type: "number", min: 0 },
          { key: "aceptadas", label: "Cantidad de tarimas aceptadas", type: "number", min: 0 },
          { key: "rechazadas", label: "Cantidad de tarimas rechazadas", type: "number", min: 0 },
          { key: "reparadas", label: "Cantidad de tarimas reparadas", type: "number", min: 0 },
          { key: "contenedor", label: "# de contenedor", type: "text" },
          { key: "sinAstillas", label: "Sin astillas / quebraduras", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "libreOlores", label: "Libre de olores", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "sinClavos", label: "Sin clavos expuestos", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "sinHumedad", label: "Sin humedad", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "realizadoPor", label: "Realizado por", type: "select", options: RESPONSABLES },
          { key: "observaciones", label: "Observaciones", type: "textarea" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas", fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 14. R-RPC-001 — Inspección Interna recibido Furgones PT Bodega Cañas
  // =================================================================
  {
    id: "RPC-001", code: "R-RPC-001", area: "Despacho",
    title: "Registro Inspección Interna recibido Furgones de Producto Terminado Bodega Cañas",
    shortTitle: "Inspección Furgones PT Cañas",
    desc: "Inspección interna de furgones de producto terminado en Bodega Cañas.",
    icon: "🚛", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Descripción del contenedor y su carga", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "area", label: "Área", type: "text", default: "Bodega Cañas" },
          { id: "cliente", label: "Cliente", type: "text" },
          { id: "placaFurgon", label: "Placa de furgón", type: "text" },
          { id: "numeroMarchamo", label: "Número de marchamo", type: "text" },
          { id: "cantidadTarimas", label: "Cantidad de tarimas", type: "number", min: 0 },
          { id: "encargadoBodega", label: "Encargado de bodega", type: "select", options: RESPONSABLES }
        ]
      },
      {
        type: "checklist", title: "Revisión interna del furgón",
        note: "Marque Sí / No para cada ítem.",
        options: [
          { value: "SI", label: "Sí" },
          { value: "NO", label: "No" }
        ],
        items: [
          "Piso limpio y seco.",
          "Paredes limpias y en buen estado.",
          "Piso / cielo raso en buen estado.",
          "Presenta malos olores.",
          "Presenta filtraciones de humedad.",
          "Presenta presencia de insectos.",
          "Presenta presencia de roedores.",
          "Presenta fumigación previa.",
          "Sellos de puertas en buen estado.",
          "Requiere lavado interno.",
          "Se acepta el furgón para carga de producto."
        ]
      },
      {
        type: "fields", title: "Descripción de labores de fumigación", columns: 2,
        fields: [
          { id: "equipoUtilizado", label: "Equipo utilizado", type: "select", options: ["Termonebulizadora", "Motobomba"] },
          { id: "productoUtilizado", label: "Producto utilizado", type: "text" },
          { id: "familiaQuimica", label: "Familia química empleada", type: "text" },
          { id: "dosis", label: "Dosis", type: "text" },
          { id: "encargadoFumigacion", label: "Encargado de la fumigación", type: "text" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas", fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaCliente", label: "Firma Cliente" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // ===== Lote C =====
// =================================================================
  // 1. R-FDT-001 — Registro de fumigación de tarimas
  // =================================================================
  {
    id: "FDT-001",
    code: "R-FDT-001",
    area: "Plagas",
    title: "Registro de Fumigación de Tarimas",
    shortTitle: "Fumigación de Tarimas",
    desc: "Registro de fumigación de tarimas con producto químico y equipo utilizado.",
    icon: "🪵",
    version: 2,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true }
        ]
      },
      {
        type: "repeater-table", id: "fumigacion", rowLabel: "Registro",
        title: "Registros de fumigación",
        note: "Agregue una fila por cada fumigación realizada.",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "tarimas", label: "Cantidad de tarimas", type: "number", min: 0 },
          { key: "nombreComercial", label: "Nombre comercial del producto", type: "text" },
          { key: "familiaQuimica", label: "Familia química", type: "text" },
          { key: "dosis", label: "Dosis (ml/L)", type: "text" },
          { key: "equipo", label: "Equipo de fumigación", type: "select", options: ["Bomba Manual", "Motobomba", "Termonebulizadora"] },
          { key: "realizadoPor", label: "Realizado por", type: "text" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 2. R-FFC-001 — Registro de Fumigación Fosfuro Contenedores
  // =================================================================
  {
    id: "FFC-001",
    code: "R-FFC-001",
    area: "Plagas",
    title: "Registro de Fumigación con Fosfuro en Contenedores",
    shortTitle: "Fumigación Fosfuro Contenedores",
    desc: "Registro de fumigación con fosfuro de aluminio en contenedores y su liberación.",
    icon: "🚛",
    version: 2,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "repeater-table", id: "fumigacion", rowLabel: "Contenedor",
        title: "Registros de fumigación de contenedores",
        note: "Agregue una fila por cada contenedor fumigado.",
        columns: [
          { key: "fechaFumigacion", label: "Fecha de fumigación", type: "date", default: "today" },
          { key: "contenedor", label: "Contenedor", type: "text" },
          { key: "productoFumigar", label: "Producto a fumigar", type: "text" },
          { key: "productoAplicado", label: "Producto aplicado", type: "text" },
          { key: "dosificacion", label: "Dosificación", type: "text" },
          { key: "fechaLiberacion", label: "Fecha de liberación", type: "date" },
          { key: "responsableLiberacion", label: "Responsable de liberación", type: "text" },
          { key: "observaciones", label: "Observaciones", type: "textarea" }
        ]
      },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 3. R-IDI-001 — Registro Inventario de Insecticidas
  // =================================================================
  {
    id: "IDI-001",
    code: "R-IDI-001",
    area: "Plagas",
    title: "Registro de Inventario de Insecticidas",
    shortTitle: "Inventario de Insecticidas",
    desc: "Control semanal de entradas, salidas y saldo de insecticidas en bodega.",
    icon: "🧴",
    version: 2,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true, default: "Bodega Control de Plagas" },
          { id: "fechaInicio", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "realizadoPor", label: "Realizado por", type: "text" }
        ]
      },
      {
        type: "material-list", id: "inv",
        title: "Inventario de insecticidas",
        note: "Anote disponible, entrada, salida y saldo de cada producto. Unidad indicada entre paréntesis.",
        columns: [
          { key: "disponible", label: "Disponible", type: "number" },
          { key: "entrada",    label: "Entrada",    type: "number" },
          { key: "salida",     label: "Salida",     type: "number" },
          { key: "saldo",      label: "Saldo",      type: "number", compute: "entrada + disponible - salida" }
        ],
        items: [
          { codigo: "ml", desc: "Actellic EC (Pirimifos Metil)" },
          { codigo: "ml", desc: "Dragnet EC (Permetrina)" },
          { codigo: "ml", desc: "Gurú (Lambda Cialotrina)" },
          { codigo: "kg", desc: "Biosil" },
          { codigo: "ml", desc: "Cynoff Plus EC (Cipermetrina)" },
          { codigo: "kg", desc: "Detia 57 (1kg)" },
          { codigo: "ml", desc: "Dorfen EW (Imidacloprid + Pyriproxyfen)" },
          { codigo: "ml", desc: "K-Obiol 2,5 EC (Deltametrina + PBO)" },
          { codigo: "kg", desc: "Malation" },
          { codigo: "ml", desc: "Proxur 15 EC (Propoxur)" },
          { codigo: "g", desc: "Proxur 70 WP (Propoxur)" },
          { codigo: "ml", desc: "Riptide EW (Piretrina + PBO)" },
          { codigo: "kg", desc: "Rodenticida" },
          { codigo: "uds", desc: "Sachets" },
          { codigo: "l", desc: "Spraycol" },
          { codigo: "ml", desc: "Starycide" },
          { codigo: "ml", desc: "Tenopa SC (Alfacipermetrina + Flufenoxuron)" },
          { codigo: "ml", desc: "Tremprid (Imidacloprid)" },
          { codigo: "ml", desc: "Valendo (Chlorfenapyr)" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 4. R-MPA-001 — Registro Monitoreo de Feromonas
  // =================================================================
  {
    id: "MPA-001",
    code: "R-MPA-001",
    area: "Plagas",
    title: "Registro de Monitoreo de Feromonas",
    shortTitle: "Monitoreo de Feromonas",
    desc: "Monitoreo de trampas de feromonas, capturas, hallazgos y correcciones.",
    icon: "🦋",
    version: 3,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha de revisión", type: "date", required: true, default: "today" }
        ]
      },
      {
        type: "info", title: "Códigos de Hallazgos, Correcciones e Insumos",
        lines: [
          "Descripción de Hallazgos — A: Excede el límite de palomillas · B: Trampa sucia · C: Trampa dañada · D: No se encuentra la trampa.",
          "Correcciones — A: Limpiar y fumigar área · B: Limpiar trampa de monitoreo y colocar adhesivo nuevo · C: Reparar trampa o colocar nueva trampa · D: Colocar nueva trampa.",
          "Nomenclatura del atrayente — P/E: Plodia / Ephestia spp. · S: Sitotroga cerealella.",
          "Insumos y equipos a utilizar — A: Goma adhesiva · B: Escobilla.",
          "Umbral máximo permisible: 15 palomillas por trampa por semana."
        ]
      },
      {
        type: "material-list", id: "feromonas",
        title: "Monitoreo de trampas de feromonas",
        note: "Anote las capturas por trampa. Marque las casillas A/B/C/D de Hallazgo y Corrección que apliquen según los códigos arriba.",
        columns: [
          { key: "capturas", label: "Capturas", type: "number" },
          { key: "hallA",    label: "H-A",      type: "checkbox" },
          { key: "hallB",    label: "H-B",      type: "checkbox" },
          { key: "hallC",    label: "H-C",      type: "checkbox" },
          { key: "hallD",    label: "H-D",      type: "checkbox" },
          { key: "corrA",    label: "C-A",      type: "checkbox" },
          { key: "corrB",    label: "C-B",      type: "checkbox" },
          { key: "corrC",    label: "C-C",      type: "checkbox" },
          { key: "corrD",    label: "C-D",      type: "checkbox" }
        ],
        items: [
          { codigo: "F-01", desc: "Empaque · Sitotroga" },
          { codigo: "F-02", desc: "Empaque · Plodia" },
          { codigo: "F-03", desc: "Empaque · Ephestia" },
          { codigo: "F-04", desc: "Empaque · Sitotroga" },
          { codigo: "F-05", desc: "Empaque · Plodia" },
          { codigo: "F-06", desc: "Empaque · Sitotroga" },
          { codigo: "F-07", desc: "Empaque · Ephestia" },
          { codigo: "F-08", desc: "Empaque · Sitotroga" },
          { codigo: "F-09", desc: "Planta Frijol · Sitotroga" },
          { codigo: "F-10", desc: "Planta Frijol · Plodia" },
          { codigo: "F-11", desc: "Planta Frijol · Sitotroga" },
          { codigo: "F-12", desc: "Planta Frijol · Plodia" },
          { codigo: "F-13", desc: "Planta Frijol · Sitotroga" },
          { codigo: "F-14", desc: "Planta Frijol · Ephestia" },
          { codigo: "F-15", desc: "Planta Frijol · Plodia" },
          { codigo: "F-16", desc: "Pilado · Sitotroga" },
          { codigo: "F-17", desc: "Pilado · Plodia" },
          { codigo: "F-18", desc: "Pilado · Sitotroga" },
          { codigo: "F-19", desc: "Pilado · Ephestia" },
          { codigo: "F-20", desc: "Pilado · Plodia" },
          { codigo: "F-21", desc: "Pilado · Ephestia" },
          { codigo: "F-22", desc: "Pilado · Sitotroga" },
          { codigo: "F-23", desc: "Secado · Plodia" },
          { codigo: "F-24", desc: "Secado · Ephestia" },
          { codigo: "F-25", desc: "Secado · Sitotroga" },
          { codigo: "F-26", desc: "Secado · Plodia" },
          { codigo: "F-27", desc: "Secado · Sitotroga" },
          { codigo: "F-28", desc: "Secado · Plodia" },
          { codigo: "F-29", desc: "Secado · Plodia" },
          { codigo: "F-30", desc: "Secado · Sitotroga" },
          { codigo: "F-31", desc: "Silos · Plodia" },
          { codigo: "F-32", desc: "Silos · Sitotroga" },
          { codigo: "F-33", desc: "Silos · Ephestia" },
          { codigo: "F-34", desc: "Silos · Sitotroga" },
          { codigo: "F-35", desc: "Silos · Plodia" },
          { codigo: "F-36", desc: "Silos · Sitotroga" },
          { codigo: "F-37", desc: "Silos · Plodia" },
          { codigo: "F-38", desc: "Silos · Plodia" },
          { codigo: "F-39", desc: "Silos · Sitotroga" },
          { codigo: "F-40", desc: "Silos · Ephestia" },
          { codigo: "F-41", desc: "Silos · Sitotroga" }
        ]
      },
      {
        type: "fields", title: "Reporte de Irregularidades",
        fields: [
          { id: "descripcionIrregularidad", label: "Descripción de la irregularidad", type: "textarea" },
          { id: "observacionesReporte",     label: "Observaciones",                   type: "textarea" },
          { id: "accionCorrectivaPreventiva", label: "Acción correctiva / preventiva", type: "textarea" }
        ]
      },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 5. R-REC-001 — Cebaderos externos de roedores en contenedores
  // =================================================================
  {
    id: "REC-001",
    code: "R-REC-001",
    area: "Plagas",
    title: "Registro de Revisión de Trampas Externas de Roedores en Contenedores",
    shortTitle: "Cebaderos Roedores Contenedores",
    desc: "Revisión de cebaderos externos de roedores en contenedores (CC-01 a CC-36).",
    icon: "🐀",
    version: 3,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "responsable", label: "Responsable", type: "text", required: true },
          { id: "fecha", label: "Fecha de revisión", type: "date", required: true, default: "today" },
          { id: "horaInicio", label: "Hora inicio", type: "time" },
          { id: "horaFinal", label: "Hora final", type: "time" }
        ]
      },
      {
        type: "material-list", id: "cebaderos", showCode: false,
        title: "Revisión de cebaderos (CC-01 a CC-36)",
        note: "Por cada cebadero marque el hallazgo: / = sin actividad, X = hallazgo. CC = Cambio de Cebo, TS = Trampa Sucia, EX = Excretas, FT = Falta trampa.",
        columns: [
          { key: "cc", label: "CC", type: "text" },
          { key: "ts", label: "TS", type: "text" },
          { key: "ex", label: "EX", type: "text" },
          { key: "ft", label: "FT", type: "text" }
        ],
        items: [
          { desc: "CC-01" }, { desc: "CC-02" }, { desc: "CC-03" }, { desc: "CC-04" },
          { desc: "CC-05" }, { desc: "CC-06" }, { desc: "CC-07" }, { desc: "CC-08" },
          { desc: "CC-09" }, { desc: "CC-10" }, { desc: "CC-11" }, { desc: "CC-12" },
          { desc: "CC-13" }, { desc: "CC-14" }, { desc: "CC-15" }, { desc: "CC-16" },
          { desc: "CC-17" }, { desc: "CC-18" }, { desc: "CC-19" }, { desc: "CC-20" },
          { desc: "CC-21" }, { desc: "CC-22" }, { desc: "CC-23" }, { desc: "CC-24" },
          { desc: "CC-25" }, { desc: "CC-26" }, { desc: "CC-27" }, { desc: "CC-28" },
          { desc: "CC-29" }, { desc: "CC-30" }, { desc: "CC-31" }, { desc: "CC-32" },
          { desc: "CC-33" }, { desc: "CC-34" }, { desc: "CC-35" }, { desc: "CC-36" }
        ]
      },
      {
        type: "fields", title: "Hallazgos y acciones",
        fields: [
          { id: "hallazgos", label: "Hallazgos detectados", type: "textarea" },
          { id: "acciones", label: "Acciones correctivas", type: "textarea" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 6. R-RIT-01 — Control de atrape internas de roedores
  // =================================================================
  {
    id: "RIT-01",
    code: "R-RIT-01",
    area: "Plagas",
    title: "Registro de Revisión de Trampas Internas de Roedores",
    shortTitle: "Trampas Internas Roedores",
    desc: "Revisión de trampas internas de roedores por ubicación (I-01 a I-66).",
    icon: "🪤",
    version: 3,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "responsable", label: "Responsable", type: "text", required: true },
          { id: "fecha", label: "Fecha de revisión", type: "date", required: true, default: "today" },
          { id: "horaInicio", label: "Hora inicio", type: "time" },
          { id: "horaFinal", label: "Hora final", type: "time" }
        ]
      },
      {
        type: "material-list", id: "trampas",
        title: "Revisión de trampas internas",
        note: "Marque las casillas que apliquen para cada trampa (sin marcar = sin actividad). Anote hallazgos y acción correctiva directamente en la fila. La columna Código indica la ubicación.",
        columns: [
          { key: "cr",        label: "Captura de Roedores", type: "checkbox" },
          { key: "cc",        label: "Cambio de Cebo",      type: "checkbox" },
          { key: "ts",        label: "Trampa Sucia",        type: "checkbox" },
          { key: "ex",        label: "Excretas",            type: "checkbox" },
          { key: "ft",        label: "Falta Trampa",        type: "checkbox" },
          { key: "hallazgo",  label: "Hallazgo",            type: "text" },
          { key: "accion",    label: "Acción correctiva",   type: "text" }
        ],
        items: [
          { codigo: "Empaque", desc: "I-01" }, { codigo: "Empaque", desc: "I-02" },
          { codigo: "Empaque", desc: "I-03" }, { codigo: "Empaque", desc: "I-04" },
          { codigo: "Empaque", desc: "I-05" }, { codigo: "Empaque", desc: "I-06" },
          { codigo: "Empaque", desc: "I-07" }, { codigo: "Empaque", desc: "I-08" },
          { codigo: "Empaque", desc: "I-09" }, { codigo: "Empaque", desc: "I-10" },
          { codigo: "Empaque", desc: "I-11" }, { codigo: "Empaque", desc: "I-12" },
          { codigo: "Empaque", desc: "I-13" }, { codigo: "Empaque", desc: "I-58" },
          { codigo: "Empaque", desc: "I-59" },
          { codigo: "Comedor", desc: "I-14" }, { codigo: "Comedor", desc: "I-15" },
          { codigo: "Planta Frijol", desc: "I-16" }, { codigo: "Planta Frijol", desc: "I-17" },
          { codigo: "Planta Frijol", desc: "I-18" }, { codigo: "Planta Frijol", desc: "I-19" },
          { codigo: "Planta Frijol", desc: "I-20" }, { codigo: "Planta Frijol", desc: "I-21" },
          { codigo: "Planta Frijol", desc: "I-22" }, { codigo: "Planta Frijol", desc: "I-23" },
          { codigo: "Planta Frijol", desc: "I-24" }, { codigo: "Planta Frijol", desc: "I-25" },
          { codigo: "Planta Frijol", desc: "I-62" }, { codigo: "Planta Frijol", desc: "I-63" },
          { codigo: "Bod. Químicos", desc: "I-60" }, { codigo: "Bod. Químicos", desc: "I-61" },
          { codigo: "Mantenimiento", desc: "I-26" }, { codigo: "Mantenimiento", desc: "I-27" },
          { codigo: "Mantenimiento", desc: "I-28" }, { codigo: "Mantenimiento", desc: "I-29" },
          { codigo: "Proveeduría", desc: "I-30" }, { codigo: "Proveeduría", desc: "I-31" },
          { codigo: "Proveeduría", desc: "I-32" },
          { codigo: "Lab. Pilado", desc: "I-33" }, { codigo: "Lab. Pilado", desc: "I-34" },
          { codigo: "Planta Pilado", desc: "I-35" }, { codigo: "Planta Pilado", desc: "I-36" },
          { codigo: "Planta Pilado", desc: "I-37" }, { codigo: "Planta Pilado", desc: "I-38" },
          { codigo: "Planta Pilado", desc: "I-39" }, { codigo: "Planta Pilado", desc: "I-40" },
          { codigo: "Planta Pilado", desc: "I-41" }, { codigo: "Planta Pilado", desc: "I-42" },
          { codigo: "Planta Pilado", desc: "I-43" }, { codigo: "Planta Pilado", desc: "I-44" },
          { codigo: "Planta Pilado", desc: "I-45" }, { codigo: "Planta Pilado", desc: "I-46" },
          { codigo: "Planta Pilado", desc: "I-47" },
          { codigo: "Bod. Subproductos", desc: "I-64" }, { codigo: "Bod. Subproductos", desc: "I-65" },
          { codigo: "Bod. Subproductos", desc: "I-66" },
          { codigo: "Planta Secado", desc: "I-48" }, { codigo: "Planta Secado", desc: "I-49" },
          { codigo: "Planta Secado", desc: "I-50" }, { codigo: "Planta Secado", desc: "I-51" },
          { codigo: "Planta Secado", desc: "I-52" }, { codigo: "Planta Secado", desc: "I-53" },
          { codigo: "Planta Secado", desc: "I-54" }, { codigo: "Planta Secado", desc: "I-55" },
          { codigo: "Planta Secado", desc: "I-56" }, { codigo: "Planta Secado", desc: "I-57" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Encargado de Calidad" }
        ]
      }
    ]
  },

  // =================================================================
  // 7. R-SFU-001 — Registro Solicitud de Fumigación
  // =================================================================
  {
    id: "SFU-001",
    code: "R-SFU-001",
    area: "Plagas",
    title: "Registro de Solicitud de Fumigación",
    shortTitle: "Solicitud de Fumigación",
    desc: "Solicitud de fumigación preventiva o correctiva con datos del producto químico.",
    icon: "📝",
    version: 2,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "hora", label: "Hora", type: "time" },
          { id: "responsable", label: "Responsable de fumigación", type: "text", required: true },
          { id: "areaTrabajo", label: "Área de trabajo", type: "text" },
          { id: "tipoAplicacion", label: "Tipo de aplicación", type: "text" },
          { id: "tipoFumigacion", label: "Tipo de fumigación", type: "select", options: ["Preventivo", "Correctivo"] },
          { id: "areaFumigada", label: "Área fumigada", type: "text" }
        ]
      },
      {
        type: "fields", title: "Aplicación de producto químico", columns: 2,
        fields: [
          { id: "nombreComercial", label: "Nombre comercial", type: "text" },
          { id: "familiaQuimica", label: "Familia química", type: "text" },
          { id: "dosis", label: "Dosis", type: "text" },
          { id: "cantidadesMezcla", label: "Cantidades de mezcla", type: "text" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 8. R-TER-001 — Cebaderos externos de roedores
  // =================================================================
  {
    id: "TER-001",
    code: "R-TER-001",
    area: "Plagas",
    title: "Registro de Revisión de Trampas Externas de Roedores",
    shortTitle: "Cebaderos Externos Roedores",
    desc: "Revisión de cebaderos externos de roedores por ubicación (E-01 a E-87).",
    icon: "🐭",
    version: 3,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "responsable", label: "Responsable", type: "text", required: true },
          { id: "fecha", label: "Fecha de revisión", type: "date", required: true, default: "today" },
          { id: "horaInicio", label: "Hora inicio", type: "time" },
          { id: "horaFinal", label: "Hora final", type: "time" }
        ]
      },
      {
        type: "material-list", id: "cebaderos",
        title: "Revisión de cebaderos externos",
        note: "Por cada cebadero marque el hallazgo: / = sin actividad, X = hallazgo. CC = Cambio de Cebo, TS = Trampa Sucia, EX = Excretas, FT = Falta trampa. La columna Código indica la ubicación.",
        columns: [
          { key: "cc", label: "CC", type: "text" },
          { key: "ts", label: "TS", type: "text" },
          { key: "ex", label: "EX", type: "text" },
          { key: "ft", label: "FT", type: "text" }
        ],
        items: [
          { codigo: "Empaque", desc: "E-01" }, { codigo: "Empaque", desc: "E-02" },
          { codigo: "Empaque", desc: "E-03" }, { codigo: "Empaque", desc: "E-04" },
          { codigo: "Empaque", desc: "E-05" }, { codigo: "Empaque", desc: "E-06" },
          { codigo: "Empaque", desc: "E-07" }, { codigo: "Empaque", desc: "E-08" },
          { codigo: "Empaque", desc: "E-09" }, { codigo: "Empaque", desc: "E-10" },
          { codigo: "Comedor", desc: "E-11" }, { codigo: "Comedor", desc: "E-12" },
          { codigo: "Oficinas Administrativas", desc: "E-13" }, { codigo: "Oficinas Administrativas", desc: "E-14" },
          { codigo: "Oficinas Administrativas", desc: "E-15" }, { codigo: "Oficinas Administrativas", desc: "E-16" },
          { codigo: "Oficinas Administrativas", desc: "E-17" }, { codigo: "Oficinas Administrativas", desc: "E-18" },
          { codigo: "Oficinas Administrativas", desc: "E-19" },
          { codigo: "Recibo de Granza #1", desc: "E-20" }, { codigo: "Recibo de Granza #1", desc: "E-21" },
          { codigo: "Recibo de Granza #1", desc: "E-22" }, { codigo: "Recibo de Granza #1", desc: "E-23" },
          { codigo: "Recibo de Granza #1", desc: "E-24" }, { codigo: "Recibo de Granza #1", desc: "E-25" },
          { codigo: "Planta Frijol", desc: "E-26" }, { codigo: "Planta Frijol", desc: "E-27" },
          { codigo: "Planta Frijol", desc: "E-28" }, { codigo: "Planta Frijol", desc: "E-29" },
          { codigo: "Planta Frijol", desc: "E-30" }, { codigo: "Planta Frijol", desc: "E-31" },
          { codigo: "Planta Frijol", desc: "E-32" }, { codigo: "Planta Frijol", desc: "E-33" },
          { codigo: "Proveeduría y Lab. Pilado", desc: "E-34" }, { codigo: "Proveeduría y Lab. Pilado", desc: "E-35" },
          { codigo: "Proveeduría y Lab. Pilado", desc: "E-36" }, { codigo: "Proveeduría y Lab. Pilado", desc: "E-37" },
          { codigo: "Proveeduría y Lab. Pilado", desc: "E-38" }, { codigo: "Proveeduría y Lab. Pilado", desc: "E-39" },
          { codigo: "Planta Pilado", desc: "E-40" }, { codigo: "Planta Pilado", desc: "E-41" },
          { codigo: "Planta Pilado", desc: "E-42" }, { codigo: "Planta Pilado", desc: "E-43" },
          { codigo: "Planta Pilado", desc: "E-44" }, { codigo: "Planta Pilado", desc: "E-45" },
          { codigo: "Planta Pilado", desc: "E-46" }, { codigo: "Planta Pilado", desc: "E-47" },
          { codigo: "Planta Pilado", desc: "E-48" },
          { codigo: "Planta Secado", desc: "E-49" }, { codigo: "Planta Secado", desc: "E-50" },
          { codigo: "Planta Secado", desc: "E-51" }, { codigo: "Planta Secado", desc: "E-52" },
          { codigo: "Planta Secado", desc: "E-53" }, { codigo: "Planta Secado", desc: "E-54" },
          { codigo: "Perimetrales", desc: "E-55" }, { codigo: "Perimetrales", desc: "E-56" },
          { codigo: "Perimetrales", desc: "E-57" }, { codigo: "Perimetrales", desc: "E-58" },
          { codigo: "Perimetrales", desc: "E-59" }, { codigo: "Perimetrales", desc: "E-60" },
          { codigo: "Perimetrales", desc: "E-61" }, { codigo: "Perimetrales", desc: "E-62" },
          { codigo: "Perimetrales", desc: "E-63" }, { codigo: "Perimetrales", desc: "E-64" },
          { codigo: "Perimetrales", desc: "E-65" }, { codigo: "Perimetrales", desc: "E-66" },
          { codigo: "Perimetrales", desc: "E-67" }, { codigo: "Perimetrales", desc: "E-68" },
          { codigo: "Perimetrales", desc: "E-69" }, { codigo: "Perimetrales", desc: "E-70" },
          { codigo: "Perimetrales", desc: "E-71" }, { codigo: "Perimetrales", desc: "E-72" },
          { codigo: "Perimetrales", desc: "E-73" }, { codigo: "Perimetrales", desc: "E-74" },
          { codigo: "Perimetrales", desc: "E-75" }, { codigo: "Perimetrales", desc: "E-76" },
          { codigo: "Perimetrales", desc: "E-77" }, { codigo: "Perimetrales", desc: "E-78" },
          { codigo: "Perimetrales", desc: "E-79" }, { codigo: "Perimetrales", desc: "E-80" },
          { codigo: "Perimetrales", desc: "E-81" }, { codigo: "Perimetrales", desc: "E-82" },
          { codigo: "Perimetrales", desc: "E-83" }, { codigo: "Perimetrales", desc: "E-84" },
          { codigo: "Perimetrales", desc: "E-85" }, { codigo: "Perimetrales", desc: "E-86" },
          { codigo: "Perimetrales", desc: "E-87" }
        ]
      },
      {
        type: "fields", title: "Hallazgos y acciones",
        fields: [
          { id: "hallazgos", label: "Hallazgos detectados", type: "textarea" },
          { id: "acciones", label: "Acciones correctivas", type: "textarea" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" }
        ]
      }
    ]
  },

  // =================================================================
  // 9. R-TRS-001 — Cebaderos de roedores en Silos
  // =================================================================
  {
    id: "TRS-001",
    code: "R-TRS-001",
    area: "Plagas",
    title: "Registro de Revisión de Trampas de Roedores en Silos",
    shortTitle: "Cebaderos Roedores Silos",
    desc: "Revisión de cebaderos de roedores en silos (CS-01 a CS-48).",
    icon: "🌾",
    version: 3,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "responsable", label: "Responsable", type: "text", required: true },
          { id: "fecha", label: "Fecha de revisión", type: "date", required: true, default: "today" },
          { id: "horaInicio", label: "Hora inicio", type: "time" },
          { id: "horaFinal", label: "Hora final", type: "time" }
        ]
      },
      {
        type: "material-list", id: "cebaderos",
        title: "Revisión de cebaderos en silos",
        note: "Marque las casillas que apliquen para cada cebadero (sin marcar = sin actividad). Anote hallazgos y acción correctiva directamente en la fila.",
        columns: [
          { key: "cc",        label: "Cambio de Cebo", type: "checkbox" },
          { key: "ts",        label: "Trampa Sucia",   type: "checkbox" },
          { key: "ex",        label: "Excretas",       type: "checkbox" },
          { key: "ft",        label: "Falta Trampa",   type: "checkbox" },
          { key: "hallazgo",  label: "Hallazgo",       type: "text" },
          { key: "accion",    label: "Acción correctiva", type: "text" }
        ],
        items: [
          { codigo: "Silo #0", desc: "CS-01" }, { codigo: "Silo #0", desc: "CS-02" },
          { codigo: "Silo #0", desc: "CS-03" }, { codigo: "Silo #0", desc: "CS-04" },
          { codigo: "Silo #0", desc: "CS-05" }, { codigo: "Silo #0", desc: "CS-06" },
          { codigo: "Silo #1", desc: "CS-07" }, { codigo: "Silo #1", desc: "CS-08" },
          { codigo: "Silo #1", desc: "CS-09" }, { codigo: "Silo #1", desc: "CS-10" },
          { codigo: "Silo #2", desc: "CS-11" }, { codigo: "Silo #2", desc: "CS-12" },
          { codigo: "Silo #2", desc: "CS-13" }, { codigo: "Silo #2", desc: "CS-14" },
          { codigo: "Silo #3", desc: "CS-15" }, { codigo: "Silo #3", desc: "CS-16" },
          { codigo: "Silo #3", desc: "CS-17" }, { codigo: "Silo #3", desc: "CS-18" },
          { codigo: "Silo #4", desc: "CS-19" }, { codigo: "Silo #4", desc: "CS-20" },
          { codigo: "Silo #4", desc: "CS-21" }, { codigo: "Silo #4", desc: "CS-22" },
          { codigo: "Silo #5", desc: "CS-23" }, { codigo: "Silo #5", desc: "CS-24" },
          { codigo: "Silo #5", desc: "CS-25" }, { codigo: "Silo #5", desc: "CS-26" },
          { codigo: "Silo #6", desc: "CS-27" }, { codigo: "Silo #6", desc: "CS-28" },
          { codigo: "Silo #6", desc: "CS-29" }, { codigo: "Silo #6", desc: "CS-30" },
          { codigo: "Silo #7", desc: "CS-31" }, { codigo: "Silo #7", desc: "CS-32" },
          { codigo: "Silo #7", desc: "CS-33" }, { codigo: "Silo #7", desc: "CS-34" },
          { codigo: "Silo #8", desc: "CS-35" }, { codigo: "Silo #8", desc: "CS-36" },
          { codigo: "Silo #8", desc: "CS-37" }, { codigo: "Silo #8", desc: "CS-38" },
          { codigo: "Silo #8", desc: "CS-39" }, { codigo: "Silo #8", desc: "CS-40" },
          { codigo: "Silo #9", desc: "CS-41" }, { codigo: "Silo #9", desc: "CS-42" },
          { codigo: "Silo #9", desc: "CS-43" }, { codigo: "Silo #9", desc: "CS-44" },
          { codigo: "Silo #9", desc: "CS-45" }, { codigo: "Silo #9", desc: "CS-46" },
          { codigo: "Silo #9", desc: "CS-47" }, { codigo: "Silo #9", desc: "CS-48" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" }
        ]
      }
    ]
  },

  // =================================================================
  // 10. R-BPA-001 — Revisión de Botiquines de Primeros Auxilios
  // =================================================================
  {
    id: "BPA-001",
    code: "R-BPA-001",
    area: "Salud Ocupacional",
    title: "Registro de Revisión de Botiquines de Primeros Auxilios",
    shortTitle: "Revisión de Botiquines",
    desc: "Revisión del contenido de los botiquines de primeros auxilios por ubicación.",
    icon: "🩹",
    version: 3,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "ubicacion", label: "Ubicación del botiquín", type: "select", required: true, options: ["Empaque", "Administrativo", "Lab. Molino", "Frijoles"] },
          { id: "identificador", label: "Identificador", type: "text" },
          { id: "fecha", label: "Fecha de revisión", type: "date", required: true, default: "today" },
          { id: "encargado", label: "Encargado de revisión", type: "text" }
        ]
      },
      {
        type: "material-list", id: "articulos",
        title: "Revisión de artículos del botiquín",
        note: "Marque (✓ en Check List) si el artículo está presente en la cantidad requerida; anote la cantidad faltante si la hay. La columna Código indica la cantidad requerida.",
        columns: [
          { key: "checklist", label: "Check List", type: "text" },
          { key: "faltante", label: "Faltante", type: "number" }
        ],
        items: [
          { codigo: "10", desc: "Apósitos de gasa estéril de 10x10 con envoltura individual" },
          { codigo: "3", desc: "Vendas de gasa en rollos de 2 pulgadas" },
          { codigo: "3", desc: "Vendas de gasa en rollos de 4 pulgadas" },
          { codigo: "3", desc: "Vendas de gasa en rollos de 6 pulgadas" },
          { codigo: "1", desc: "Esparadrapo o tela adhesiva" },
          { codigo: "10", desc: "Apósitos adhesivos tipo curita" },
          { codigo: "1", desc: "Algodón absorbente con envoltura individual 25 gr" },
          { codigo: "1", desc: "Jabón antiséptico de gluconato de clorhexidina" },
          { codigo: "1", desc: "Solución salina normal (fisiológica) 250 ml" },
          { codigo: "1", desc: "Tijeras de punta roma" },
          { codigo: "1", desc: "Aplicadores de algodón (100 unidades)" },
          { codigo: "5", desc: "Baja lenguas en empaque individual" },
          { codigo: "1", desc: "Vendas elásticas de 7.5 cm en rollo" },
          { codigo: "10", desc: "Pares de guantes descartables" },
          { codigo: "1", desc: "Alcohol en gel 240 ml" },
          { codigo: "1", desc: "Alcohol al 70% 250 ml" },
          { codigo: "1", desc: "Bolsa para desechos (color rojo)" },
          { codigo: "1", desc: "Manta o frazada" },
          { codigo: "1", desc: "Férula inmovilizadora de extremidades rígidas" },
          { codigo: "1", desc: "Férula rígida larga de madera o plástico con 3 cintas" },
          { codigo: "1", desc: "Collarín cervical rígido con apoyo mentoniano" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaSaludOcupacional", label: "Firma Salud Ocupacional" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 11. R-REX-001 — Registro Revisión Extintores
  // =================================================================
  {
    id: "REX-001",
    code: "R-REX-001",
    area: "Salud Ocupacional",
    title: "Registro de Revisión de Extintores",
    shortTitle: "Revisión de Extintores",
    desc: "Revisión periódica del estado y condición de los extintores.",
    icon: "🧯",
    version: 2,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "responsable", label: "Responsable", type: "text", required: true }
        ]
      },
      {
        type: "repeater-table", id: "extintor", rowLabel: "Extintor",
        title: "Revisión de extintores",
        note: "Agregue una fila por extintor. En cada condición marque ✓ si está conforme; explique cualquier daño en observaciones.",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "area", label: "Área", type: "text" },
          { key: "tipo", label: "Tipo", type: "text" },
          { key: "numero", label: "Número", type: "text" },
          { key: "altura", label: "Altura N.R.", type: "radio", options: [{ value: "OK", label: "✓" }, { value: "MAL", label: "✗" }] },
          { key: "manguera", label: "Manguera", type: "radio", options: [{ value: "OK", label: "✓" }, { value: "MAL", label: "✗" }] },
          { key: "seguro", label: "Seguro", type: "radio", options: [{ value: "OK", label: "✓" }, { value: "MAL", label: "✗" }] },
          { key: "indicador", label: "Indicador", type: "radio", options: [{ value: "OK", label: "✓" }, { value: "MAL", label: "✗" }] },
          { key: "rotulacion", label: "Rotulación", type: "radio", options: [{ value: "OK", label: "✓" }, { value: "MAL", label: "✗" }] },
          { key: "tanque", label: "Tanque", type: "radio", options: [{ value: "OK", label: "✓" }, { value: "MAL", label: "✗" }] },
          { key: "soporte", label: "Soporte", type: "radio", options: [{ value: "OK", label: "✓" }, { value: "MAL", label: "✗" }] },
          { key: "limpieza", label: "Limpieza", type: "radio", options: [{ value: "OK", label: "✓" }, { value: "MAL", label: "✗" }] },
          { key: "vencimiento", label: "Vencimiento", type: "date" },
          { key: "observaciones", label: "Observaciones", type: "textarea" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" }
        ]
      }
    ]
  },

  // =================================================================
  // 12. R-BCP-001 — Control Inventario Mensual y Salida Material Empaque Pilado
  // =================================================================
  {
    id: "BCP-001",
    code: "R-BCP-001",
    area: "Proveeduría",
    title: "Registro Control Inventario Mensual y Salida de Material de Empaque Pilado",
    shortTitle: "Inventario Material Empaque Pilado",
    desc: "Inventario mensual y salida de material de empaque del área de pilado.",
    icon: "📦",
    version: 1,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "entregadoPor", label: "Entregado por", type: "text", required: true }
        ]
      },
      {
        type: "material-list", id: "inv",
        title: "Inventario de material de empaque",
        note: "Anote la cantidad por código. Deje en blanco los materiales sin movimiento.",
        columns: [
          { key: "kg", label: "Kilogramos", type: "number" },
          { key: "uds", label: "Unidades", type: "number" },
          { key: "lote", label: "Lote", type: "text" }
        ],
        items: [
          { codigo: "17-1-1", desc: "RODILLOS DE HULE FOREMAN" },
          { codigo: "17-1-1", desc: "RODILLOS DE HULE SATECOL" },
          { codigo: "17-1-1", desc: "RODILLOS DE HULE RODAMAX" },
          { codigo: "1-4-17", desc: "SACO BLANCO P/ARROZ 46KG" },
          { codigo: "1-4-18", desc: "SACO P/SEMOLINA NUEVO 71 X 107" },
          { codigo: "1-4-19", desc: "SACO SEGUNDA 56X95 (CASCARILLA)" },
          { codigo: "1-3-1", desc: "PLASTICO PALETIZADOR 18 (MANUAL)" },
          { codigo: "1-3-2", desc: "PLASTICO PALETIZADOR 20 (MANUAL)" },
          { codigo: "1-5-2", desc: "HILO PABILO P/MAQUINA COSER" },
          { codigo: "10-2-100", desc: "ETIQUETAS SEMOLINA" },
          { codigo: "10-2-101", desc: "ETIQUETAS PUNTILLA" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaInocuidad", label: "Firma Inocuidad" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // 13. R-MCA-001 — Boleta Materiales Centro Acopio
  // =================================================================
  {
    id: "MCA-001",
    code: "R-MCA-001",
    area: "Proveeduría",
    title: "Boleta de Materiales para Centro de Acopio",
    shortTitle: "Materiales Centro de Acopio",
    desc: "Boleta de entrega de materiales reciclables al centro de acopio.",
    icon: "♻️",
    version: 2,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true, default: "Reciclaje" },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "responsable", label: "Responsable", type: "text" },
          { id: "cedula", label: "Cédula", type: "text" },
          { id: "vehiculo", label: "Vehículo", type: "text" },
          { id: "placa", label: "Placa #", type: "text" }
        ]
      },
      {
        type: "material-list", id: "materiales", showCode: false,
        title: "Materiales entregados",
        note: "Anote el peso en kilogramos de cada material y la firma de recibido del centro de acopio.",
        columns: [
          { key: "peso", label: "Peso (kg)", type: "number" },
          { key: "firmaRecibido", label: "Firma recibido", type: "text" }
        ],
        items: [
          { desc: "Plástico" },
          { desc: "Cartón" },
          { desc: "Papel" },
          { desc: "Metal" },
          { desc: "Otro" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaInocuidad", label: "Firma Inocuidad" },
          { id: "firmaSIG", label: "Firma SIG" }
        ]
      }
    ]
  },

  // ===== Lote D =====
// =================================================================
  // SECADO
  // =================================================================

  // --- R-AIS-001 Control Aireación Silos Almacenamiento ---
  {
    id: "AIS-001", code: "R-AIS-001", area: "Secado",
    title: "Registro Control Aireación Silos Almacenamiento",
    shortTitle: "Aireación Silos",
    desc: "Control de aireación de silos de almacenamiento (humedad y temperatura).",
    icon: "🌬️", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "operador", label: "Operador", type: "text", required: true }
        ]
      },
      {
        type: "repeater-table", id: "aireacion", rowLabel: "Registro",
        title: "Registros de aireación",
        note: "Agregue una fila por cada silo controlado.",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "silo", label: "Silo", type: "text" },
          { key: "operador", label: "Operador", type: "text" },
          { key: "horaInicio", label: "Hora inicio", type: "time" },
          { key: "horaFinal", label: "Hora final", type: "time" },
          { key: "humedadRel", label: "Humedad relativa (%)", type: "number", min: 0, max: 100, step: 0.1 },
          { key: "tempAmbiente", label: "Temp. ambiente (°C)", type: "number", step: 0.1 },
          { key: "tempGrano", label: "Temp. grano (°C)", type: "number", step: 0.1 }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaSecador", label: "Firma Secador" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // --- R-CSA-001 Control Secado de Arroz en granza húmedo ---
  {
    id: "CSA-001", code: "R-CSA-001", area: "Secado",
    title: "Registro Control Secado de Arroz en Granza Húmedo",
    shortTitle: "Secado Granza Húmedo",
    desc: "Control horario de humedad y temperatura del grano en las tres secadoras.",
    icon: "🌾", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "turno", label: "Turno", type: "text" },
          { id: "secador", label: "Secador", type: "text", required: true },
          { id: "siloLlenando", label: "Silo llenando", type: "text" }
        ]
      },
      {
        type: "repeater-table", id: "lecturas", rowLabel: "Lectura",
        title: "Lecturas por secadora",
        note: "Agregue una fila por cada lectura horaria. Indique la secadora y la hora correspondiente.",
        columns: [
          { key: "secadora", label: "Secadora", type: "select", options: ["Secadora N°1", "Secadora N°2", "Secadora N°3"] },
          { key: "hora", label: "Hora", type: "time" },
          { key: "humedadGrano", label: "Humedad grano (%)", type: "number", min: 0, max: 100, step: 0.1 },
          { key: "tempGrano", label: "Temperatura grano (°C)", type: "number", step: 0.1 },
          { key: "obs", label: "Observación", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaOperario1", label: "Firma Operario 1" },
        { id: "firmaOperario2", label: "Firma Operario 2" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // --- R-CSG-001 Control Industrial Secado arroz en Granza ---
  {
    id: "CSG-001", code: "R-CSG-001", area: "Secado",
    title: "Registro Control Industrial Secado Arroz en Granza",
    shortTitle: "Control Industrial Secado",
    desc: "Análisis de muestras de secadoras: entrada y salida del proceso de secado.",
    icon: "🔬", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "diaEntrega", label: "Día entrega de muestra", type: "date", default: "today" },
          { id: "responsable", label: "Responsable", type: "text", required: true }
        ]
      },
      {
        type: "repeater-table", id: "muestra", rowLabel: "Muestra",
        title: "Análisis de muestras de secadoras",
        note: "Agregue una fila por cada muestra (entrada y salida del secado).",
        columns: [
          { key: "secadora", label: "Secadora", type: "text" },
          { key: "siloDestino", label: "Silo destino", type: "text" },
          { key: "etapa", label: "Etapa", type: "select", options: ["Entrada", "Salida"] },
          { key: "humedad", label: "% Humedad", type: "number", min: 0, max: 100, step: 0.1 },
          { key: "impureza", label: "% Impureza", type: "number", min: 0, max: 100, step: 0.1 },
          { key: "entero", label: "% Entero", type: "number", min: 0, max: 100, step: 0.1 },
          { key: "puntilla", label: "% Puntilla", type: "number", min: 0, max: 100, step: 0.1 },
          { key: "insectos", label: "Insectos", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "pesoIntegral", label: "Peso integral", type: "number", min: 0 },
          { key: "pesoPilado", label: "Peso pilado", type: "number", min: 0 },
          { key: "semolina", label: "% Semolina", type: "number", min: 0, max: 100, step: 0.1 },
          { key: "cascarilla", label: "% Cascarilla", type: "number", min: 0, max: 100, step: 0.1 },
          { key: "blancura", label: "Blancura", type: "number", step: 0.1 },
          { key: "diaInicio", label: "Día inicio secado", type: "date" },
          { key: "horaInicio", label: "Hora inicio secado", type: "time" },
          { key: "diaFinal", label: "Día final secado", type: "date" },
          { key: "horaFinal", label: "Hora final secado", type: "time" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // --- R-LRG-001 Limpieza Recibo Granza ---
  {
    id: "LRG-001", code: "R-LRG-001", area: "Secado",
    title: "Registro Limpieza Recibo de Granza",
    shortTitle: "Limpieza Recibo Granza",
    desc: "Limpieza y desinfección semanal del área de recibo de granza.",
    icon: "🧹", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true, default: "Recibo de granza" },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza y desinfección",
        note: "Indique con la actividad realizada y el día en que se ejecutó la labor. Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm.",
        days: DIAS_SEMANA,
        columns: [{ key: "limpieza", label: "Limpieza" }, { key: "desinfeccion", label: "Desinfección" }],
        rows: [
          { label: "Pisos", equipo: "Escobas, Aire Comprimido" },
          { label: "Paredes", equipo: "Sopladora Manual" },
          { label: "Techo", equipo: "Aire Comprimido, Escoba" },
          { label: "Lámparas", equipo: "Sopladora Manual" },
          { label: "Basurero", equipo: "Toallas" },
          { label: "Escobas", equipo: "Toallas" },
          { label: "Recogedor de Basura", equipo: "Toallas" },
          { label: "Elevador Recibo 1", equipo: "Aire Comprimido, Escoba" },
          { label: "Fosa", equipo: "Aspiradora, Escoba, Recogedor de basura" },
          { label: "Motores Eléctricos", equipo: "Aire comprimido y toallas" }
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm) y responsables", columns: 2,
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" },
          { id: "concS", label: "Concentración Sábado", type: "text" },
          { id: "realizadoPor", label: "Realizado por", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // --- R-LSG-001 Limpieza Secado Granza ---
  {
    id: "LSG-001", code: "R-LSG-001", area: "Secado",
    title: "Registro Limpieza Secado de Granza",
    shortTitle: "Limpieza Secado Granza",
    desc: "Limpieza y desinfección semanal del área de secado de granza.",
    icon: "🧹", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true, default: "Secado de granza" },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza y desinfección",
        note: "Indique la actividad realizada y el día en que se ejecutó la labor. Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm.",
        days: DIAS_SEMANA,
        columns: [{ key: "limpieza", label: "Limpieza" }, { key: "desinfeccion", label: "Desinfección" }],
        rows: [
          { label: "Pisos", equipo: "Escobas, Aire Comprimido" },
          { label: "Paredes", equipo: "Sopladora Manual" },
          { label: "Techo", equipo: "Aire Comprimido, Escoba" },
          { label: "Lámparas", equipo: "Sopladora Manual" },
          { label: "Basurero", equipo: "Toallas" },
          { label: "Escobas", equipo: "Toallas" },
          { label: "Recogedor de Basura", equipo: "Toallas" },
          { label: "Secadora 1", equipo: "Aire Comprimido, Escoba" },
          { label: "Secadora 2", equipo: "Aire Comprimido, Escoba" },
          { label: "Secadora 3", equipo: "Aire Comprimido, Escoba" },
          { label: "Elevador Secadora 1", equipo: "Aire Comprimido, Escoba" },
          { label: "Elevador Secadora 2", equipo: "Aire Comprimido, Escoba" },
          { label: "Elevador Secadora 3", equipo: "Aire Comprimido, Escoba" },
          { label: "Bota Elevador Secadora 1", equipo: "Aspiradora" },
          { label: "Bota Elevador Secadora 2", equipo: "Aspiradora" },
          { label: "Bota Elevador Secadora 3", equipo: "Aspiradora" },
          { label: "Transportador Helicoidal Llenado Secadoras", equipo: "Cepillo, espátula y aire comprimido" },
          { label: "Transportador Helicoidal Vaciado Secadoras", equipo: "Cepillo, espátula y aire comprimido" },
          { label: "Elevador Llenado de Silos", equipo: "Aire Comprimido, Escoba" },
          { label: "Transportador Helicoidal Llenado Silos", equipo: "Cepillo, espátula y aire comprimido" },
          { label: "Nebugram", equipo: "Aire Comprimido, Escoba" },
          { label: "Motores Eléctricos", equipo: "Aire Comprimido, Escoba" }
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm) y responsables", columns: 2,
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" },
          { id: "concS", label: "Concentración Sábado", type: "text" },
          { id: "realizadoPor", label: "Realizado por", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // --- R-RAS-001 Control de Romana Arroz en Granza Sección de Secado ---
  {
    id: "RAS-001", code: "R-RAS-001", area: "Secado",
    title: "Registro Control de Romana Arroz en Granza Sección de Secado",
    shortTitle: "Romana Arroz en Granza",
    desc: "Control de pesaje en romana de arroz en granza y monitoreo de insectos.",
    icon: "⚖️", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" }
        ]
      },
      {
        type: "repeater-table", id: "romana", rowLabel: "Registro",
        title: "Registros de romana",
        note: "Agregue una fila por cada pesaje realizado.",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "turno", label: "Turno", type: "text" },
          { key: "secadora", label: "Secadora", type: "text" },
          { key: "siloDestino", label: "Silo de destino", type: "text" },
          { key: "flujoInicio", label: "Flujómetro de granza inicio", type: "number", min: 0 },
          { key: "flujoFinal", label: "Flujómetro de granza final", type: "number", min: 0 },
          { key: "flujoTotal", label: "Flujómetro de granza total", type: "number", min: 0 },
          { key: "insectos", label: "Control de insectos", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "responsable", label: "Secador responsable", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaOperador1", label: "Firma Operador 1" },
        { id: "firmaOperador2", label: "Firma Operador 2" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // FRIJOLES
  // =================================================================

  // --- R-CMF-001 Control Consumo Material de Empaque Frijoles ---
  {
    id: "CMF-001", code: "R-CMF-001", area: "Frijoles",
    title: "Registro Control Consumo Material de Empaque Frijoles",
    shortTitle: "Consumo Material Empaque Frijoles",
    desc: "Consumo de material de empaque por máquina y presentación en frijoles.",
    icon: "🧵", version: 2, emision: "Sep-2024", revision: "Jun-2026",
    sections: [
      {
        type: "repeater-table", id: "consumo", rowLabel: "Registro",
        title: "Registros de consumo",
        note: "Agregue una fila por cada registro de consumo de material.",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "responsable", label: "Responsable", type: "text" },
          { key: "maquina", label: "Máquina de empaque", type: "text" },
          { key: "presentacion", label: "Presentación", type: "text" },
          { key: "pesoBolsa", label: "Peso de bolsa (kg)", type: "number", min: 0, step: 0.01 },
          { key: "inicial", label: "Inicial", type: "number", min: 0 },
          { key: "final", label: "Final", type: "number", min: 0 },
          { key: "rodillos", label: "Rodillos", type: "number", min: 0 },
          { key: "desperdicio", label: "Desperdicio (gramos)", type: "number", min: 0 },
          { key: "bultos", label: "Bultos", type: "number", min: 0 },
          { key: "mediosBultos", label: "Medios bultos", type: "number", min: 0 }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaOperador", label: "Operador Empaque" },
        { id: "firmaSIG", label: "Encargado SIG" }
      ] }
    ]
  },

  // --- R-IAF-001 Inventario Área Frijoles ---
  {
    id: "IAF-001", code: "R-IAF-001", area: "Frijoles",
    title: "Registro Inventario Área Frijoles",
    shortTitle: "Inventario Área Frijoles",
    desc: "Inventario diario de productos terminados de frijol por código.",
    icon: "📋", version: 2, emision: "Jul-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "responsable", label: "Responsable", type: "text", required: true }
        ]
      },
      {
        type: "material-list", id: "inv",
        title: "Inventario de productos de frijol",
        note: "Anote los movimientos por código. Deje en blanco los productos sin movimiento.",
        columns: [
          { key: "invInicial", label: "Inv. inicial", type: "number" },
          { key: "produccion", label: "Producción", type: "number" },
          { key: "ingresos", label: "Ingresos", type: "number" },
          { key: "consumo", label: "Consumo producción", type: "number" },
          { key: "ventas", label: "Ventas", type: "number" },
          { key: "invFinal", label: "Inv. final", type: "number" },
          { key: "humedad", label: "Humedad (%)", type: "number" }
        ],
        items: [
          { codigo: "703", desc: "1 x 1 kg Frijoles Liborio Negros" },
          { codigo: "704", desc: "1 x 45.4 kg Frijoles Liborio Negros" },
          { codigo: "707", desc: "1 x 1 kg Frijoles Liborio Rojos" },
          { codigo: "710", desc: "Frijol Rojo 15 x 700 g" },
          { codigo: "711", desc: "Frijol Rojo 30 x 700 g" },
          { codigo: "712", desc: "Frijol Negro 15 x 700 g" },
          { codigo: "713", desc: "Frijol Negro 30 x 700 g" },
          { codigo: "714", desc: "1 x 46 kg Frijoles Liborio Negros" },
          { codigo: "715", desc: "1 x 45.4 kg Frijoles Liborio Rojos" },
          { codigo: "721", desc: "Frijol Negro D.Manuel 15 x 0.8" },
          { codigo: "722", desc: "Frijol Negro D.Manuel 30 x 0.8" },
          { codigo: "723", desc: "Frijol Rojos D.Manuel 15 x 0.8" },
          { codigo: "724", desc: "Frijol Rojos D.Manuel 30 x 0.8" },
          { codigo: "733", desc: "Frijol Negro Cañero 15 x 0,700" },
          { codigo: "734", desc: "Frijol Rojo Cañero 15 x 0,700" },
          { codigo: "737", desc: "Frijol Negro BM 15 x 0,700" },
          { codigo: "738", desc: "Frijol Rojo BM 15 x 0,700" },
          { codigo: "739", desc: "Frijol Negro Chiko P 15 x 0,700" },
          { codigo: "740", desc: "Frijol Rojo Chiko P 15 x 0,700" },
          { codigo: "741", desc: "Frijol Negro Cañero 1 x 1" },
          { codigo: "742", desc: "Frijol Rojo Cañero 1 x 1" },
          { codigo: "-", desc: "Contenedor 1" },
          { codigo: "-", desc: "Contenedor 2" },
          { codigo: "-", desc: "Contenedor 3" },
          { codigo: "-", desc: "Contenedor 4" },
          { codigo: "-", desc: "Contenedor 5" },
          { codigo: "-", desc: "Contenedor 6" },
          { codigo: "-", desc: "Contenedor 7" },
          { codigo: "-", desc: "Contenedor 8" },
          { codigo: "-", desc: "Contenedor 9" },
          { codigo: "-", desc: "Contenedor 10" },
          { codigo: "-", desc: "Contenedor 11" },
          { codigo: "-", desc: "Contenedor 12" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // R-IDF-001 retirado de la plataforma (2026-06-12).

  // --- R-PDF-001 Producción Frijol ---
  {
    id: "PDF-001", code: "R-PDF-001", area: "Frijoles",
    title: "Registro Producción de Frijol",
    shortTitle: "Producción de Frijol",
    desc: "Producto enviado a empaque, producción de empaque mecánico y barreduras.",
    icon: "🫘", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "responsable", label: "Responsable", type: "text", required: true }
        ]
      },
      {
        type: "repeater-table", id: "enviado", rowLabel: "Registro",
        title: "A. Producto enviado a empaque mecánico",
        columns: [
          { key: "lote", label: "Lote", type: "text" },
          { key: "tipoFrijol", label: "Tipo frijol", type: "select", options: ["Rojo", "Negro"] },
          { key: "claseFrijol", label: "Clase frijol", type: "select", options: ["Primera", "Segunda"] },
          { key: "pesoSaco", label: "Peso saco (kg)", type: "number", min: 0, step: 0.1 },
          { key: "sacosSuministrados", label: "Sacos suministrados", type: "number", min: 0 },
          { key: "kgSuministrados", label: "Kilogramos suministrados", type: "number", min: 0 },
          { key: "rechazoElectronico", label: "Inyecciones / Rechazo electrónico (kg)", type: "number", min: 0 },
          { key: "zaranda", label: "Zaranda", type: "select", options: ["Manual", "Mecánica"] }
        ]
      },
      {
        type: "repeater-table", id: "empaqueMecanico", rowLabel: "Registro",
        title: "B. Producción empaque mecánico",
        columns: [
          { key: "lote", label: "Lote", type: "text" },
          { key: "tipoFrijol", label: "Tipo frijol", type: "select", options: ["Rojo", "Negro"] },
          { key: "claseFrijol", label: "Clase frijol", type: "select", options: ["Primera", "Segunda"] },
          { key: "bultos15", label: "Bultos 15 und.", type: "number", min: 0 },
          { key: "bultos30", label: "Bultos 30 und.", type: "number", min: 0 },
          { key: "unidades", label: "Unidades", type: "number", min: 0 },
          { key: "sacos46", label: "Sacos 46 kg", type: "number", min: 0 }
        ]
      },
      {
        type: "repeater-table", id: "barreduras", rowLabel: "Registro",
        title: "C. Barreduras",
        columns: [
          { key: "tipoFrijol", label: "Tipo frijol", type: "select", options: ["Rojo", "Negro"] },
          { key: "kgPrimera", label: "Kilogramos primera", type: "number", min: 0 },
          { key: "kgSegunda", label: "Kilogramos segunda", type: "number", min: 0 }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaOperario", label: "Firma Operario" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // --- R-SEF-001 Seleccionado Electrónico de Frijol ---
  {
    id: "SEF-001", code: "R-SEF-001", area: "Frijoles",
    title: "Registro Seleccionado Electrónico de Frijol",
    shortTitle: "Seleccionado Electrónico Frijol",
    desc: "Pesado, selección electrónica y rechazo electrónico de frijol.",
    icon: "⚙️", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "responsable", label: "Responsable", type: "text", required: true }
        ]
      },
      {
        type: "repeater-table", id: "pesado", rowLabel: "Registro",
        title: "A. Pesado de frijol para seleccionado electrónico",
        columns: [
          { key: "tipoFrijol", label: "Tipo de frijol", type: "select", options: ["Rojo", "Negro"] },
          { key: "pesoBruto", label: "Peso bruto frijol (kg)", type: "number", min: 0, step: 0.1 },
          { key: "pesoTarimas", label: "Peso tarimas (kg)", type: "number", min: 0, step: 0.1 },
          { key: "pesoNeto", label: "Peso neto frijol (kg)", type: "number", min: 0, step: 0.1 },
          { key: "sacosContables", label: "Sacos contables", type: "number", min: 0 },
          { key: "sacosPeso", label: "Sacos peso", type: "number", min: 0 }
        ]
      },
      {
        type: "repeater-table", id: "seleccion", rowLabel: "Registro",
        title: "B. Selección electrónica frijol",
        columns: [
          { key: "tipoFrijol", label: "Tipo frijol", type: "select", options: ["Rojo", "Negro"] },
          { key: "claseFrijol", label: "Clase frijol", type: "select", options: ["Primera", "Segunda"] },
          { key: "kgSeleccionados", label: "Kilogramos seleccionados", type: "number", min: 0 },
          { key: "kgPendientes", label: "Kilogramos pendientes de selección", type: "number", min: 0 },
          { key: "sacosContables", label: "Sacos contables", type: "number", min: 0 },
          { key: "sacosPeso", label: "Sacos peso", type: "number", min: 0 }
        ]
      },
      {
        type: "repeater-table", id: "rechazo", rowLabel: "Registro",
        title: "C. Rechazo electrónico",
        columns: [
          { key: "tipoFrijol", label: "Tipo frijol", type: "select", options: ["Rojo", "Negro"] },
          { key: "kgPrimera", label: "Kilogramos primera", type: "number", min: 0 },
          { key: "kgSegunda", label: "Kilogramos segunda", type: "number", min: 0 },
          { key: "sacosContables", label: "Sacos contables", type: "number", min: 0 },
          { key: "sacosPeso", label: "Sacos peso", type: "number", min: 0 }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaOperario", label: "Firma Operario" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // =================================================================
  // LIMPIEZA
  // =================================================================

  // --- R-LAE-001 Limpieza Áreas Externas ---
  {
    id: "LAE-001", code: "R-LAE-001", area: "Limpieza",
    title: "Registro Limpieza de Áreas Externas",
    shortTitle: "Limpieza Áreas Externas",
    desc: "Limpieza semanal de áreas externas, zonas verdes y recolección de escombros.",
    icon: "🌳", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "semana", label: "Fecha", type: "date", required: true, default: "today" }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades por área",
        note: "Indique la actividad realizada y el día en que se ejecutó la labor.",
        days: DIAS_SEMANA,
        columns: [
          { key: "limpiezaExterna", label: "Limpieza Externa de Áreas" },
          { key: "recoleccionDesechos", label: "Recolección Desechos de Áreas" },
          { key: "mtoZonasVerdes", label: "Mto Zonas Verdes" },
          { key: "recoleccionEscombros", label: "Recolección de Escombros" }
        ],
        rows: [
          "Secado", "Pilado", "Bodega Plagas", "Bodega Frijoles", "Área Chatarra",
          "Malla Perimetral", "Empaque", "Oficinas Administrativas", "Cascarilla",
          "Tolva Ceniza", "Tolva Lajilla", "Recibo Granza #1", "Romana", "Zonas Verdes",
          "Limpieza de Caños", "Caseta de Seguridad", "Bodega Frijoles Externa",
          "Pilado Externo", "Secado Externo"
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // --- R-LSI-001 Limpieza de Silos ---
  {
    id: "LSI-001", code: "R-LSI-001", area: "Limpieza",
    title: "Registro Limpieza de Silos",
    shortTitle: "Limpieza de Silos",
    desc: "Limpieza semanal de los equipos y áreas de un silo.",
    icon: "🏗️", version: 3, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true, default: "Silos" },
          { id: "numeroSilo", label: "Número de silo", type: "text", required: true },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza",
        note: "Indique la actividad realizada y el día en que se ejecutó la labor. Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto no directo 500–1000 ppm.",
        days: DIAS_SEMANA,
        columns: [{ key: "limpieza", label: "Limpieza" }],
        rows: [
          { label: "Pisos", equipo: "Escoba" },
          { label: "Paredes de silos", equipo: "Escoba" },
          { label: "Escaleras", equipo: "Escoba" },
          { label: "Motores", equipo: "Escoba" },
          { label: "Abanicos", equipo: "Escoba" },
          { label: "Techo", equipo: "Escoba" },
          { label: "Tubería", equipo: "Escoba" },
          { label: "Transportadores de Colochos", equipo: "Escoba" },
          { label: "Soplado en Silos", equipo: "Motobomba" }
        ]
      },
      {
        type: "fields", title: "Responsables", columns: 2,
        fields: [
          { id: "respAlan", label: "Responsable (Alan M.)", type: "text" },
          { id: "respFreddy", label: "Responsable (Freddy)", type: "text" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

  // ===== Lote E =====
// =================================================================
  // PILADO 1. R-CDM-001 Registro de Control de Molino
  // =================================================================
  {
    id: "CDM-001",
    code: "R-CDM-001",
    area: "Pilado",
    title: "Registro Control de Molino",
    shortTitle: "Control de Molino",
    desc: "Control de consumo, rendimiento, subproductos, paros e inyecciones del molino.",
    icon: "🏭",
    version: 3,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha",   label: "Fecha",   type: "date", required: true, default: "today" },
          { id: "pilador", label: "Pilador", type: "text" },
          { id: "semolina",label: "Semolina",type: "text" }
        ]
      },
      {
        type: "repeater-table", id: "consumo", rowLabel: "Turno",
        title: "Control de consumo y rendimiento de granza",
        note: "Registre un turno (Diurno / Nocturno) por fila con lecturas de flujómetros.",
        columns: [
          { key: "turno", label: "Turno", type: "select", options: ["Diurno", "Nocturno"] },
          { key: "silos", label: "Silos", type: "text" },
          { key: "granzaIni", label: "Flujómetro Granza inicial", type: "number" },
          { key: "granzaFin", label: "Flujómetro Granza final", type: "number" },
          { key: "granzaTot", label: "Flujómetro Granza total", type: "number" },
          { key: "masaIni", label: "Flujómetro Masa Blanca inicial", type: "number" },
          { key: "masaFin", label: "Flujómetro Masa Blanca final", type: "number" },
          { key: "masaTot", label: "Flujómetro Masa Blanca total", type: "number" },
          { key: "integralIni", label: "Flujómetro Integral inicial", type: "number" },
          { key: "integralFin", label: "Flujómetro Integral final", type: "number" },
          { key: "integralTot", label: "Flujómetro Integral total", type: "number" }
        ]
      },
      {
        type: "repeater-table", id: "subproductos", rowLabel: "Turno",
        title: "Control de producción de subproductos",
        note: "Boleta inicial/final por subproducto, un turno por fila.",
        columns: [
          { key: "turno", label: "Turno", type: "select", options: ["Diurno", "Nocturno"] },
          { key: "semolinaIni", label: "Semolina boleta inicial", type: "number" },
          { key: "semolinaFin", label: "Semolina boleta final", type: "number" },
          { key: "puntillaIni", label: "Puntilla boleta inicial", type: "number" },
          { key: "puntillaFin", label: "Puntilla boleta final", type: "number" },
          { key: "polvoZaranda", label: "Polvo Zaranda", type: "number" },
          { key: "afrecho", label: "Afrecho", type: "number" },
          { key: "puntillaAve", label: "Puntilla Ave", type: "number" },
          { key: "cascarilla", label: "Cascarilla", type: "number" }
        ]
      },
      {
        type: "repeater-table", id: "carga", rowLabel: "Carga",
        title: "Control de carga en molino",
        note: "Una fila por verificación de carga (hora, calidad, kilogramos, segundos).",
        columns: [
          { key: "turno", label: "Turno", type: "select", options: ["Diurno", "Nocturno"] },
          { key: "hora", label: "Hora", type: "time" },
          { key: "calidad", label: "Calidad", type: "text" },
          { key: "kilogramos", label: "Kilogramos", type: "number" },
          { key: "segundos", label: "Segundos", type: "number" }
        ]
      },
      {
        type: "repeater-table", id: "paros", rowLabel: "Paro",
        title: "Control de paros en el molino",
        columns: [
          { key: "equipo", label: "Equipo", type: "text" },
          { key: "horaInicio", label: "Hora inicio", type: "time" },
          { key: "horaFinal", label: "Hora final", type: "time" },
          { key: "causa", label: "Causa del paro", type: "textarea" }
        ]
      },
      {
        type: "repeater-table", id: "inyecciones", rowLabel: "Inyección",
        title: "Control de inyecciones generales en molino",
        note: "Una fila por inyección: indique turno, tipo de envase y material inyectado.",
        columns: [
          { key: "turno", label: "Turno", type: "select", options: ["Diurno", "Nocturno"] },
          { key: "envase", label: "Envase", type: "select", options: ["Saconas Grandes", "Saconas Pequeñas", "Sacos", "Góndola", "Otro"] },
          { key: "material", label: "Material inyectado", type: "select", options: ["Devoluciones", "Quebrado Proc.", "Quebrado Selec.", "Entero Recuperado", "Manchado", "Rechazo Electr.", "Barreduras", "Integral", "Granza", "Semolina Granel"] },
          { key: "cantidad", label: "Cantidad", type: "number" }
        ]
      },
      {
        type: "repeater-table", id: "producciones", rowLabel: "Producción",
        title: "Control de producciones generales en molino",
        note: "Una fila por producción: indique turno, tipo de envase y material producido.",
        columns: [
          { key: "turno", label: "Turno", type: "select", options: ["Diurno", "Nocturno"] },
          { key: "envase", label: "Envase", type: "select", options: ["Saconas Grandes", "Saconas Pequeñas", "Sacos", "Góndola", "Otro"] },
          { key: "material", label: "Material producido", type: "select", options: ["Devoluciones", "Quebrado Proc.", "Quebrado Selec.", "Entero Recuperado", "Manchado", "Rechazo Electr.", "Barreduras", "Integral", "Granza", "Semolina Granel"] },
          { key: "cantidad", label: "Cantidad", type: "number" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaPilador1", label: "Firma Pilador Turno 1" },
          { id: "firmaPilador2", label: "Firma Pilador Turno 2" },
          { id: "firmaSIG",      label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // PILADO 2. R-CGM-001 Control Consumo de Granza y Producción Masa Blanca
  // =================================================================
  {
    id: "CGM-001",
    code: "R-CGM-001",
    area: "Pilado",
    title: "Registro Control Consumo de Granza y Producción Masa Blanca",
    shortTitle: "Consumo Granza y Masa Blanca",
    desc: "Control horario de romanas de granza y masa blanca y parámetros de pulidores.",
    icon: "⚙️",
    version: 2,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "turno", label: "Turno", type: "select", options: ["Diurno", "Nocturno"] }
        ]
      },
      {
        type: "repeater-table", id: "romanas", rowLabel: "Lectura",
        title: "Romana granza y masa blanca (por hora)",
        note: "Agregue una fila por cada hora registrada.",
        columns: [
          { key: "hora", label: "Hora", type: "time" },
          { key: "silo", label: "Silo", type: "text" },
          { key: "granzaIni", label: "Romana Granza inicial", type: "number" },
          { key: "granzaFin", label: "Romana Granza final", type: "number" },
          { key: "granzaReproceso", label: "Romana Granza reproceso", type: "number" },
          { key: "granzaTon", label: "Romana Granza TON", type: "number" },
          { key: "masaIni", label: "Romana Masa Blanca inicial", type: "number" },
          { key: "masaFin", label: "Romana Masa Blanca final", type: "number" },
          { key: "masaReproceso", label: "Romana Masa Blanca reproceso", type: "number" },
          { key: "masaTon", label: "Romana Masa Blanca TON", type: "number" },
          { key: "paroMecanico", label: "Paro Mecánico (min)", type: "number" },
          { key: "paroElectrico", label: "Paro Eléctrico (min)", type: "number" },
          { key: "paroCarga", label: "Paro Carga (min)", type: "number" }
        ]
      },
      {
        type: "repeater-table", id: "pulidores", rowLabel: "Lectura",
        title: "Parámetros de pulidores (por hora)",
        note: "Agregue una fila por cada hora registrada.",
        columns: [
          { key: "hora", label: "Hora", type: "time" },
          { key: "silo", label: "Silo", type: "text" },
          { key: "brazoDer", label: "Brazo Derecho % Integral Retorno", type: "number" },
          { key: "brazoIzq", label: "Brazo Izquierdo % Integral Retorno", type: "number" },
          { key: "vtaAmp", label: "Pulidor VTA Amperaje", type: "number" },
          { key: "vtaBlancura", label: "Pulidor VTA Blancura", type: "number" },
          { key: "vtaEntero", label: "Pulidor VTA % Entero", type: "number" },
          { key: "kb1Amp", label: "Pulidor KB1 Amperaje", type: "number" },
          { key: "kb1Blancura", label: "Pulidor KB1 Blancura", type: "number" },
          { key: "kb1Entero", label: "Pulidor KB1 % Entero", type: "number" },
          { key: "kb2Amp", label: "Pulidor KB2 Amperaje", type: "number" },
          { key: "kb2Blancura", label: "Pulidor KB2 Blancura", type: "number" },
          { key: "kb2Entero", label: "Pulidor KB2 % Entero", type: "number" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaOperador", label: "Firma Operador Pilado" },
          { id: "firmaGerencia", label: "Firma Gerencia Producción" },
          { id: "firmaSIG",      label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // PILADO 3. R-IPS-001 Inventario de Producto en Saconas
  // =================================================================
  {
    id: "IPS-001",
    code: "R-IPS-001",
    area: "Pilado",
    title: "Registro Inventario de Producto en Saconas",
    shortTitle: "Inventario Producto en Saconas",
    desc: "Inventario diario de producto en saconas por fila y turno.",
    icon: "📦",
    version: 2,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha",        label: "Fecha",                type: "date",   required: true, default: "today" },
          { id: "responsable1", label: "Responsable Turno 1",  type: "select", options: RESPONSABLES },
          { id: "responsable2", label: "Responsable Turno 2",  type: "select", options: RESPONSABLES }
        ]
      },
      {
        type: "repeater-table", id: "inventario", rowLabel: "Fila",
        title: "Inventario por fila",
        note: "Agregue una fila por cada fila de saconas registrada.",
        columns: [
          { key: "fila", label: "Fila", type: "number" },
          { key: "producto", label: "Producto", type: "text" },
          { key: "t1InvIni", label: "Turno 1 inv. inicial", type: "number" },
          { key: "t1Entrada", label: "Turno 1 entrada", type: "number" },
          { key: "t1Salida", label: "Turno 1 salida", type: "number" },
          { key: "t1InvFin", label: "Turno 1 inv. final", type: "number" },
          { key: "t2InvIni", label: "Turno 2 inv. inicial", type: "number" },
          { key: "t2Entrada", label: "Turno 2 entrada", type: "number" },
          { key: "t2Salida", label: "Turno 2 salida", type: "number" },
          { key: "t2InvFin", label: "Turno 2 inv. final", type: "number" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG",     label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // PILADO 4. R-LBS-001 Limpieza Bodega de Subproductos
  // =================================================================
  {
    id: "LBS-001",
    code: "R-LBS-001",
    area: "Pilado",
    title: "Registro para la limpieza bodega de subproductos",
    shortTitle: "Limpieza Bodega Subproductos",
    desc: "Limpieza semanal de la bodega de subproductos del molino.",
    icon: "🧹",
    version: 3,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area",         label: "Área",          type: "text", required: true, default: "Bodega Subproductos" },
          { id: "realizadoPor", label: "Realizado por", type: "text" },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza por día",
        note: "Frecuencia indicada entre paréntesis. Marque la actividad realizada y el día en que se ejecutó.",
        days: DIAS_SEMANA,
        columns: [
          { key: "limpieza",     label: "Limpieza" },
          { key: "desinfeccion", label: "Desinfección" },
          { key: "fumigacion",   label: "Fumigación" }
        ],
        rows: [
          { label: "Tarimas", equipo: "Diario" },
          { label: "Pisos", equipo: "Diario" },
          { label: "Paredes", equipo: "Diario" },
          { label: "Techo", equipo: "Trimestral" },
          { label: "Lámparas", equipo: "Quincenal" },
          { label: "Puertas", equipo: "Quincenal" },
          { label: "Producto entarimado", equipo: "Diario" },
          { label: "Soporte escobas", equipo: "Semanal" },
          { label: "Recogedor de basura", equipo: "Semanal" },
          { label: "Escobas", equipo: "Semanal" }
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm)", columns: 2,
        note: "Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm.",
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" },
          { id: "concS", label: "Concentración Sábado", type: "text" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG",     label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // PILADO 5. R-LIM-001 Limpieza Interior de Molinos
  // =================================================================
  {
    id: "LIM-001",
    code: "R-LIM-001",
    area: "Pilado",
    title: "Registro para la limpieza interior de molinos",
    shortTitle: "Limpieza Interior Molino",
    desc: "Limpieza y desinfección semanal del interior del molino.",
    icon: "🧽",
    version: 2,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area",         label: "Área",          type: "text", required: true, default: "Molinos" },
          { id: "realizadoPor", label: "Realizado por", type: "text" },
          { id: "fecha",        label: "Fecha",         type: "date", default: "today" }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza y desinfección por día",
        note: "Frecuencia indicada entre paréntesis. Marque la actividad realizada y el día en que se ejecutó.",
        days: DIAS_SEMANA,
        columns: [
          { key: "limpieza",     label: "Limpieza" },
          { key: "desinfeccion", label: "Desinfección" }
        ],
        rows: [
          { label: "Pisos", equipo: "Diario" },
          { label: "Paredes", equipo: "Quincenal" },
          { label: "Techo", equipo: "Trimestral" },
          { label: "Puertas", equipo: "Quincenal" },
          { label: "Cerchas", equipo: "Trimestral" },
          { label: "Recogedor derrames", equipo: "Diario" },
          { label: "Escaleras", equipo: "Quincenal" },
          { label: "Ciclón de Semolina", equipo: "Quincenal" },
          { label: "Ducto de Semolina", equipo: "Quincenal" },
          { label: "Tolva Integral", equipo: "Quincenal" },
          { label: "Tolva 1 (entero)", equipo: "Quincenal" },
          { label: "Tolva 2 (entero)", equipo: "Quincenal" },
          { label: "Tolva 3 (quebrado)", equipo: "Quincenal" },
          { label: "Tolva 4 (quebrado)", equipo: "Quincenal" },
          { label: "Tolva 5 (romana)", equipo: "Quincenal" },
          { label: "Tolva Selectora DELTA", equipo: "Quincenal" },
          { label: "Zaranda Limpieza", equipo: "Semanal" },
          { label: "Descascaradora 1", equipo: "Diario" },
          { label: "Descascaradora 2", equipo: "Diario" },
          { label: "Mesa Paddy", equipo: "Mensual" },
          { label: "Pulidor KB1", equipo: "Semanal" },
          { label: "Pulidor KB2", equipo: "Semanal" },
          { label: "Zaranda Rotex", equipo: "Quincenal" },
          { label: "Cilindro TRIZ 1", equipo: "Quincenal" },
          { label: "Cilindro TRIZ 2", equipo: "Quincenal" },
          { label: "Selectora DELTA", equipo: "Quincenal" },
          { label: "Motores", equipo: "Semanal" },
          { label: "Cosedora Puntilla/Semolina", equipo: "Diario" },
          { label: "Cosedora Quebrado", equipo: "Diario" },
          { label: "Báscula Puntilla/Semolina", equipo: "Diario" },
          { label: "Báscula Quebrado", equipo: "Diario" },
          { label: "Básculas/romanas", equipo: "Diario" },
          { label: "Romana Granza", equipo: "Semanal" },
          { label: "Flujómetro Integral", equipo: "Semanal" },
          { label: "Romana Masa Blanca", equipo: "Semanal" },
          { label: "Lámparas", equipo: "Semanal" },
          { label: "Pulidor Buhler 1", equipo: "Semanal" },
          { label: "Pulidor Buhler 2", equipo: "Semanal" }
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm)", columns: 2,
        note: "Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm.",
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" },
          { id: "concS", label: "Concentración Sábado", type: "text" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG",     label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // PILADO 6. R-LTH-001 Limpieza Transportadores Horizontales
  // =================================================================
  {
    id: "LTH-001",
    code: "R-LTH-001",
    area: "Pilado",
    title: "Registro para la limpieza Transportadores Horizontales",
    shortTitle: "Limpieza Transp. Horizontales",
    desc: "Limpieza y desinfección semanal de transportadores horizontales del molino.",
    icon: "↔️",
    version: 3,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area",        label: "Área",        type: "text", required: true, default: "Transportadores Horizontal" },
          { id: "responsable", label: "Responsable", type: "text" },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza y desinfección por día",
        note: "Frecuencia indicada entre paréntesis. Marque la actividad realizada y el día en que se ejecutó.",
        days: DIAS_SEMANA,
        columns: [
          { key: "limpieza",     label: "Limpieza" },
          { key: "desinfeccion", label: "Desinfección" }
        ],
        groups: [
          { name: "Ingreso Granza", rows: [
            { label: "Aletas", equipo: "Semanal" },
            { label: "Canoas", equipo: "Semanal" },
            { label: "Tapas", equipo: "Diario" }
          ] },
          { name: "Cascarilla", rows: [
            { label: "Aletas", equipo: "Semanal" },
            { label: "Canoas", equipo: "Semanal" },
            { label: "Tapas", equipo: "Diario" }
          ] },
          { name: "Retorno Mesa Paddy", rows: [
            { label: "Aletas", equipo: "Semanal" },
            { label: "Canoas", equipo: "Semanal" },
            { label: "Tapas", equipo: "Diario" }
          ] },
          { name: "Aceptado Mesa Paddy", rows: [
            { label: "Aletas", equipo: "Semanal" },
            { label: "Canoas", equipo: "Semanal" },
            { label: "Tapas", equipo: "Diario" }
          ] },
          { name: "Rechazo Mesa Paddy", rows: [
            { label: "Aletas", equipo: "Semanal" },
            { label: "Canoas", equipo: "Semanal" },
            { label: "Tapas", equipo: "Diario" }
          ] },
          { name: "Salida Pulidores KB", rows: [
            { label: "Aletas", equipo: "Semanal" },
            { label: "Canoas", equipo: "Semanal" },
            { label: "Tapas", equipo: "Diario" }
          ] },
          { name: "Hacia tolvas Quebrado", rows: [
            { label: "Aletas", equipo: "Semanal" },
            { label: "Canoas", equipo: "Semanal" },
            { label: "Tapas", equipo: "Diario" }
          ] },
          { name: "Llenado Tolvas Quebrado", rows: [
            { label: "Aletas", equipo: "Semanal" },
            { label: "Canoas", equipo: "Semanal" },
            { label: "Tapas", equipo: "Diario" }
          ] },
          { name: "Salida Tolvas Quebrado", rows: [
            { label: "Aletas", equipo: "Semanal" },
            { label: "Canoas", equipo: "Semanal" },
            { label: "Tapas", equipo: "Diario" }
          ] },
          { name: "Salida Tolva Entero", rows: [
            { label: "Aletas", equipo: "Semanal" },
            { label: "Canoas", equipo: "Semanal" },
            { label: "Tapas", equipo: "Diario" }
          ] }
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm)", columns: 2,
        note: "Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm.",
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" },
          { id: "concS", label: "Concentración Sábado", type: "text" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG",     label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // PILADO 7. R-LTV-001 Limpieza Transportadores Verticales
  // =================================================================
  {
    id: "LTV-001",
    code: "R-LTV-001",
    area: "Pilado",
    title: "Registro para la limpieza de transportadores verticales",
    shortTitle: "Limpieza Transp. Verticales",
    desc: "Limpieza y desinfección semanal de elevadores (transportadores verticales) del molino.",
    icon: "↕️",
    version: 3,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area",         label: "Área",          type: "text", required: true, default: "Transportador Vertical" },
          { id: "realizadoPor", label: "Realizado por", type: "text" },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza y desinfección por día",
        note: "Todos los elementos tienen frecuencia Semanal. Marque la actividad realizada y el día en que se ejecutó.",
        days: DIAS_SEMANA,
        columns: [
          { key: "limpieza",     label: "Limpieza" },
          { key: "desinfeccion", label: "Desinfección" }
        ],
        groups: [
          { name: "Elevador Ingreso Granza", rows: [
            { label: "Huacales de Elevadores", equipo: "Semanal" },
            { label: "Bota elevador", equipo: "Semanal" },
            { label: "Campanola elevador", equipo: "Semanal" }
          ] },
          { name: "Elevador Descascaradoras", rows: [
            { label: "Huacales de Elevadores", equipo: "Semanal" },
            { label: "Bota elevador", equipo: "Semanal" },
            { label: "Campanola elevador", equipo: "Semanal" }
          ] },
          { name: "Elevador Mesa Paddy", rows: [
            { label: "Huacales de Elevadores", equipo: "Semanal" },
            { label: "Bota elevador", equipo: "Semanal" },
            { label: "Campanola elevador", equipo: "Semanal" }
          ] },
          { name: "Elevador Clasificador Sizer", rows: [
            { label: "Huacales de Elevadores", equipo: "Semanal" },
            { label: "Bota elevador", equipo: "Semanal" },
            { label: "Campanola elevador", equipo: "Semanal" }
          ] },
          { name: "Elevador Línea Pulidores", rows: [
            { label: "Huacales de Elevadores", equipo: "Semanal" },
            { label: "Bota elevador", equipo: "Semanal" },
            { label: "Campanola elevador", equipo: "Semanal" }
          ] },
          { name: "Elevador Masa Blanca", rows: [
            { label: "Huacales de Elevadores", equipo: "Semanal" },
            { label: "Bota elevador", equipo: "Semanal" },
            { label: "Campanola elevador", equipo: "Semanal" }
          ] },
          { name: "Elevador Quebrado", rows: [
            { label: "Huacales de Elevadores", equipo: "Semanal" },
            { label: "Bota elevador", equipo: "Semanal" },
            { label: "Campanola elevador", equipo: "Semanal" }
          ] },
          { name: "Elevador Cilindros TRIZ 3BP", rows: [
            { label: "Huacales de Elevadores", equipo: "Semanal" },
            { label: "Bota elevador", equipo: "Semanal" },
            { label: "Campanola elevador", equipo: "Semanal" }
          ] },
          { name: "Elevador Selectora DELTA", rows: [
            { label: "Huacales de Elevadores", equipo: "Semanal" },
            { label: "Bota elevador", equipo: "Semanal" },
            { label: "Campanola elevador", equipo: "Semanal" }
          ] },
          { name: "Elevador Tolvas Entero", rows: [
            { label: "Huacales de Elevadores", equipo: "Semanal" },
            { label: "Bota elevador", equipo: "Semanal" },
            { label: "Campanola elevador", equipo: "Semanal" }
          ] },
          { name: "Elevador Tolvas Quebrado", rows: [
            { label: "Huacales de Elevadores", equipo: "Semanal" },
            { label: "Bota elevador", equipo: "Semanal" },
            { label: "Campanola elevador", equipo: "Semanal" }
          ] },
          { name: "Elevador Banda Empaque", rows: [
            { label: "Huacales de Elevadores", equipo: "Semanal" },
            { label: "Bota elevador", equipo: "Semanal" },
            { label: "Campanola elevador", equipo: "Semanal" }
          ] }
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm)", columns: 2,
        note: "Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 39 ml por litro de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm.",
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" },
          { id: "concS", label: "Concentración Sábado", type: "text" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaCalidad", label: "Firma Calidad" },
          { id: "firmaSIG",     label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // MISCELÁNEA 1. R-GYJ-001 Reabastecimiento papel, jabón y gel
  // =================================================================
  {
    id: "GYJ-001",
    code: "R-GYJ-001",
    area: "Miscelánea",
    title: "Registro para reabastecimiento de papel, jabón y gel para manos",
    shortTitle: "Reabastecimiento Papel/Jabón/Gel",
    desc: "Revisión y reabastecimiento de dispensadores de jabón, gel y papel por área.",
    icon: "🧴",
    version: 3,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "reviso", label: "Revisó", type: "select", options: RESPONSABLES }
        ]
      },
      {
        type: "repeater-table", id: "dispensadores", rowLabel: "Revisión",
        title: "Revisión de dispensadores por área",
        note: "Agregue una fila por cada revisión: área, día y estado de cada dispensador.",
        columns: [
          { key: "area", label: "Área", type: "select", options: ["Área Empaque", "Área Administrativas", "Área Comedor", "Área Baños Empaque", "Área Romana Camionera", "Área Mantenimiento", "Área Laboratorio", "Área Pilado"] },
          { key: "dia", label: "Día de revisión", type: "select", options: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] },
          { key: "jabon", label: "Dispensador con jabón", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "fechaJabon", label: "Fecha abastecimiento jabón", type: "date" },
          { key: "gel", label: "Dispensador con gel", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "fechaGel", label: "Fecha abastecimiento gel", type: "date" },
          { key: "papel", label: "Dispensador con papel", type: "radio", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }] },
          { key: "fechaPapel", label: "Fecha abastecimiento papel", type: "date" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaInocuidad", label: "Firma Inocuidad" },
          { id: "firmaSIG",       label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // MISCELÁNEA 2. R-LCA-001 Limpieza Casilleros
  // =================================================================
  {
    id: "LCA-001",
    code: "R-LCA-001",
    area: "Miscelánea",
    title: "Registro para la limpieza de casilleros",
    shortTitle: "Limpieza Casilleros",
    desc: "Limpieza semanal del área de casilleros.",
    icon: "🚪",
    version: 2,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area",        label: "Área",        type: "text", required: true, default: "Casilleros" },
          { id: "fecha",       label: "Fecha",       type: "date", default: "today" },
          { id: "responsable", label: "Responsable", type: "text" }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza por día",
        note: "Indique con un √ la actividad realizada y el día en que se ejecutó la labor.",
        days: DIAS_SEMANA,
        columns: [
          { key: "limpieza", label: "Limpieza" }
        ],
        rows: [
          { label: "Piso", equipo: "Escoba" },
          { label: "Interior Casilleros", equipo: "Wipes" },
          { label: "Exterior Casilleros", equipo: "Escoba y Wipes" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaInocuidad", label: "Firma Inocuidad" },
          { id: "firmaSIG",       label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // MISCELÁNEA 3. R-LCO-001 Limpieza Comedor
  // =================================================================
  {
    id: "LCO-001",
    code: "R-LCO-001",
    area: "Miscelánea",
    title: "Registro para la limpieza del comedor",
    shortTitle: "Limpieza Comedor",
    desc: "Limpieza y desinfección semanal del comedor.",
    icon: "🍽️",
    version: 2,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area",        label: "Área",        type: "text", required: true, default: "Comedor" },
          { id: "fecha",       label: "Fecha",       type: "date", default: "today" },
          { id: "responsable", label: "Responsable", type: "text" }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza y desinfección por día",
        note: "Indique con un √ la actividad realizada y el día en que se ejecutó la labor.",
        days: DIAS_SEMANA,
        columns: [
          { key: "limpieza",     label: "Limpieza" },
          { key: "desinfeccion", label: "Desinfección" }
        ],
        rows: [
          { label: "Pisos", equipo: "Escoba, Trapeadores" },
          { label: "Paredes", equipo: "Escoba" },
          { label: "Techo", equipo: "Escoba" },
          { label: "Mesas", equipo: "Atomizador, Paño" },
          { label: "Lavaplatos", equipo: "Atomizador, Paño" },
          { label: "Estantería", equipo: "Atomizador, Paño" },
          { label: "Coffe Maker", equipo: "Atomizador, Paño" },
          { label: "Escobas", equipo: "Paño" },
          { label: "Recogedor de Basura", equipo: "Paño" },
          { label: "Botes de Basura", equipo: "Atomizador, Paño" },
          { label: "Lámparas", equipo: "Escoba" }
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm)", columns: 2,
        note: "Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 300 ml por galón de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm.",
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaInocuidad", label: "Firma Inocuidad" },
          { id: "firmaSIG",       label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // MISCELÁNEA 4. R-LOF-001 Limpieza Oficinas Administrativas
  // =================================================================
  {
    id: "LOF-001",
    code: "R-LOF-001",
    area: "Miscelánea",
    title: "Registro para la limpieza de oficinas",
    shortTitle: "Limpieza Oficinas",
    desc: "Limpieza y desinfección semanal de las oficinas administrativas.",
    icon: "🏢",
    version: 2,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area",        label: "Área",        type: "text", required: true },
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "responsable", label: "Responsable", type: "text" }
        ]
      },
      {
        type: "daily-activity-matrix",
        title: "Actividades de limpieza y desinfección por día",
        note: "Indique con un √ la actividad realizada y el día en que se ejecutó la labor.",
        days: DIAS_SEMANA,
        columns: [
          { key: "limpieza",     label: "Limpieza" },
          { key: "desinfeccion", label: "Desinfección" }
        ],
        rows: [
          { label: "Piso", equipo: "Escoba" },
          { label: "Paredes", equipo: "Escoba" },
          { label: "Techo", equipo: "Escoba" },
          { label: "Puerta", equipo: "Escoba" },
          { label: "Paños", equipo: "Lavado Manual" },
          { label: "Escobas", equipo: "Paño" },
          { label: "Recogedor de Basura", equipo: "Paño" },
          { label: "Botes de Basura", equipo: "Paño" },
          { label: "Ventanas", equipo: "Limpia vidrios y paños" },
          { label: "Lámparas", equipo: "Escoba" },
          { label: "Equipos de oficina", equipo: "Desinfectante y Paños" }
        ]
      },
      {
        type: "fields", title: "Concentración de desinfectante (ppm)", columns: 2,
        note: "Desinfectante: AC Bioeco · Ingrediente activo: Amonio · Dosis: 300 ml por galón de agua · Rango: contacto directo 300–500 ppm, no directo 500–1000 ppm.",
        fields: [
          { id: "concL", label: "Concentración Lunes", type: "text" },
          { id: "concM", label: "Concentración Martes", type: "text" },
          { id: "concK", label: "Concentración Miércoles", type: "text" },
          { id: "concJ", label: "Concentración Jueves", type: "text" },
          { id: "concV", label: "Concentración Viernes", type: "text" },
          { id: "concS", label: "Concentración Sábado", type: "text" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaInocuidad", label: "Firma Inocuidad" },
          { id: "firmaSIG",       label: "Firma SIG" }
        ]
      }
    ]
  },

  // =================================================================
  // MISCELÁNEA 5. R-LSS-001 Limpieza de Servicios Sanitarios
  // =================================================================
  {
    id: "LSS-001",
    code: "R-LSS-001",
    area: "Miscelánea",
    title: "Registro de Limpieza de servicios sanitarios",
    shortTitle: "Limpieza Servicios Sanitarios",
    desc: "Verificación semanal del cumplimiento de limpieza de los servicios sanitarios.",
    icon: "🚻",
    version: 4,
    emision: "Feb-2024",
    revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha",       label: "Fecha",       type: "date", default: "today" },
          { id: "bano",        label: "Baño",        type: "select", options: ["Recepción", "Oficinas", "Gerencia", "Laboratorio-Proveeduría", "Producto Terminado", "Romana camionera", "Mantenimiento"] },
          { id: "responsable", label: "Responsable", type: "text" }
        ]
      },
      {
        type: "daily-checks",
        title: "Cumplimiento semanal",
        note: "Marque Sí si cumple, No si no cumple, por cada día de la semana.",
        days: DIAS_SEMANA,
        options: [
          { value: "SI", label: "Sí" },
          { value: "NO", label: "No" }
        ],
        rows: [
          { label: "Se encuentra el área limpia y sin regueros en el piso", valor: "Ítem 1" },
          { label: "Se encuentran inodoros limpios dentro y sobre la superficie", valor: "Ítem 2" },
          { label: "Se encuentra basura tirada en el suelo", valor: "Ítem 3" },
          { label: "Se encuentra el basurero en buenas condiciones y con bolsa de acopio", valor: "Ítem 4" },
          { label: "Las barras de discapacitados están en excelentes condiciones", valor: "Ítem 5" },
          { label: "Se encuentran derrames de jabón líquido", valor: "Ítem 6" },
          { label: "Los dispensadores de jabón contienen buen porcentaje de jabón de manos", valor: "Ítem 7" },
          { label: "Es un lugar debidamente ventilado", valor: "Ítem 8" },
          { label: "Los espejos están limpios y desinfectados", valor: "Ítem 9" },
          { label: "El lavamanos está en perfectas condiciones y aseado", valor: "Ítem 10" },
          { label: "La llave de paso está en perfecto estado", valor: "Ítem 11" },
          { label: "Cuenta con buena iluminación", valor: "Ítem 12" },
          { label: "Cuenta con el papel higiénico", valor: "Ítem 13" },
          { label: "Se reportan fugas de agua", valor: "Ítem 14" },
          { label: "El dispensador de servilletas para manos está con buena cantidad", valor: "Ítem 15" },
          { label: "Posee información de cómo lavarse las manos", valor: "Ítem 16" }
        ]
      },
      { type: "observaciones" },
      {
        type: "firmas",
        fields: [
          { id: "firmaInocuidad", label: "Firma Inocuidad" },
          { id: "firmaSIG",       label: "Firma SIG" }
        ]
      }
    ]
  },

// ===== R-MTU-001 (PLAGAS, .xls) =====
  {
    id: "MTU-001", code: "R-MTU-001", area: "Plagas",
    title: "Registro Monitoreo de Insectos en Trampas de Luz Ultravioleta",
    shortTitle: "Monitoreo Trampas Luz UV",
    desc: "Conteo de insectos capturados en las 10 trampas de luz ultravioleta.",
    icon: "🪰", version: 3, emision: "Feb-2025", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "hora", label: "Hora", type: "time" }
        ]
      },
      {
        type: "info", title: "Códigos de Hallazgos y Medidas Correctivas",
        lines: [
          "Tipos de Hallazgos — A: Trampa sucia · B: Trampa dañada · C: Fluorescentes dañados · D: Captura excede el nivel máximo aceptable.",
          "Medidas Correctivas — A: Limpiar trampa · B: Reparar trampa o cambiarla · C: Cambiar fluorescentes dañados · D: Informar a Gerencia para limpieza.",
          "Nivel máximo aceptable: 25 insectos plaga/día, 50 por revisión (cada 2 días).",
          "Nombre científico: Sitophilus oryzae, Rhyzopertha dominica, Tribolium confusum, Criptolestes spp."
        ]
      },
      {
        type: "material-list", id: "trampa",
        title: "Insectos recolectados por trampa",
        note: "El total se calcula automáticamente sumando los conteos. Marque hallazgos y medidas correctivas que apliquen (A/B/C/D según códigos arriba).",
        columns: [
          { key: "sitophilus",   label: "Sitophilus",     type: "number" },
          { key: "rhyzopertha",  label: "Rhyzopertha",    type: "number" },
          { key: "tribolium",    label: "Tribolium",      type: "number" },
          { key: "criptolestes", label: "Criptolestes",   type: "number" },
          { key: "sitotroga",    label: "Sitotroga",      type: "number" },
          { key: "plodia",       label: "Plodia",         type: "number" },
          { key: "moscas",       label: "Moscas",         type: "number" },
          { key: "ephestia",     label: "Ephestia",       type: "number" },
          { key: "otros",        label: "Otros",          type: "text" },
          { key: "total",        label: "Sumatoria total", type: "number",
            compute: "sitophilus + rhyzopertha + tribolium + criptolestes + sitotroga + plodia + moscas + ephestia" },
          { key: "hallA",        label: "H-A",            type: "checkbox" },
          { key: "hallB",        label: "H-B",            type: "checkbox" },
          { key: "hallC",        label: "H-C",            type: "checkbox" },
          { key: "hallD",        label: "H-D",            type: "checkbox" },
          { key: "cambioFluor",  label: "Cambio fluor.",  type: "select", options: ["Sí", "No"] },
          { key: "medA",         label: "MC-A",           type: "checkbox" },
          { key: "medB",         label: "MC-B",           type: "checkbox" },
          { key: "medC",         label: "MC-C",           type: "checkbox" },
          { key: "medD",         label: "MC-D",           type: "checkbox" }
        ],
        items: [
          { codigo: "L-01", desc: "Empaque" },
          { codigo: "L-02", desc: "Empaque" },
          { codigo: "L-03", desc: "Empaque" },
          { codigo: "L-04", desc: "Planta Frijol" },
          { codigo: "L-05", desc: "Pilado" },
          { codigo: "L-06", desc: "Pilado" },
          { codigo: "L-07", desc: "Secado" },
          { codigo: "L-08", desc: "Empaque" },
          { codigo: "L-09", desc: "Subproductos" },
          { codigo: "L-10", desc: "Pilado" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG", label: "Firma SIG" }
      ] }
    ]
  },

// ===== R-FFS-001 (PLAGAS) =====
  {
    id: "FFS-001", code: "R-FFS-001", area: "Plagas",
    title: "Registro de Fumigación Fosfuro Silos",
    shortTitle: "Fumigación Fosfuro Silos",
    desc: "Registro de fumigaciones con fosfuro en silos.",
    icon: "🌬️", version: 1, emision: "May-2026", revision: "Jun-2026",
    sections: [
      {
        type: "repeater-table", id: "fumigacion", rowLabel: "Fumigación",
        title: "Registros de fumigación",
        columns: [
          { key: "fecha",            label: "Fecha de fumigación",  type: "date", default: "today" },
          { key: "silos",            label: "Silos",                type: "text" },
          { key: "productoFumigar",  label: "Producto a fumigar",   type: "text" },
          { key: "productoAplicado", label: "Producto aplicado",    type: "text" },
          { key: "dosis",            label: "Dosificación",         type: "text" },
          { key: "fechaLiberacion",  label: "Fecha liberación",     type: "date" },
          { key: "respLiberacion",   label: "Responsable liberación", type: "text" },
          { key: "obs",              label: "Observaciones",        type: "textarea" }
        ]
      },
      { type: "observaciones" },
      { type: "firmas", fields: [
        { id: "firmaCalidad", label: "Firma Calidad" },
        { id: "firmaSIG",     label: "Firma SIG" }
      ] }
    ]
  },

  // ===== R-AGF-001 (CALIDAD) =====
  {
    id: "AGF-001", code: "R-AGF-001", area: "Calidad",
    title: "Registro Control Análisis Grano de Frijol",
    shortTitle: "Análisis Grano de Frijol",
    desc: "Análisis de calidad por lote de frijol: humedad, quebrado, contraste, pesos y revisión visual.",
    icon: "🫘", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "info", title: "Especificaciones de calidad — Frijol",
        lines: [
          "Tabla de referencia — Grado 1 / Grado 2:",
          "Humedad %: 16 / 16 · Tiempo de cocción (min): 95 / 126 · Impurezas %: 0,5 / 2 · Grano contrastante %: 1 / 3.",
          "Grano dañado total %: 1 / 3 · Grano quebrado %: 0,5 / 0,75 · Grano partido %: 0,5 / 3 · Otros granos %: 0,25 / 0,5.",
          "Infestado: no se acepta · Dudosamente infestado: 5 / 5.",
          "Cocción: 500 g de frijol en 1 500 mL de agua a ebullición. Muestreo a los 65, 80, 95, 110, 126 min hasta ≥96% granos cocidos."
        ]
      },
      {
        type: "repeater-table", id: "ana", rowLabel: "Análisis",
        title: "Análisis por lote",
        columns: [
          { key: "dia", label: "Día", type: "text" },
          { key: "turno", label: "Turno", type: "text" },
          { key: "operario", label: "Operario", type: "text" },
          { key: "humedad", label: "Humedad %", type: "number", step: "0.01" },
          { key: "hora", label: "Hora", type: "time" },
          { key: "lote", label: "Lote producción", type: "text" },
          { key: "codigo", label: "Código producto", type: "text" },
          { key: "presentacion", label: "Presentación", type: "text" },
          { key: "calidad", label: "Calidad", type: "text" },
          { key: "quebradoTapita", label: "Quebrado tapita", type: "text" },
          { key: "granoQuebrado", label: "Grano quebrado %", type: "number", step: "0.01" },
          { key: "contraste", label: "Contraste %", type: "number", step: "0.01" },
          { key: "descascarado", label: "Descascarado %", type: "number", step: "0.01" },
          { key: "impureza", label: "Impureza %", type: "number", step: "0.01" },
          { key: "peso1", label: "Peso 1", type: "number", step: "0.01" },
          { key: "peso2", label: "Peso 2", type: "number", step: "0.01" },
          { key: "peso3", label: "Peso 3", type: "number", step: "0.01" },
          { key: "peso4", label: "Peso 4", type: "number", step: "0.01" },
          { key: "promedio", label: "Promedio", type: "number", step: "0.01" },
          { key: "pesoBolsa", label: "Peso bolsa", type: "number", step: "0.01" },
          { key: "diferencial", label: "Diferencial peso", type: "number", step: "0.01" },
          { key: "empacadora", label: "Empacadora", type: "text" },
          { key: "flujo", label: "Flujo", type: "text" },
          { key: "tipoFrijol", label: "Tipo de frijol", type: "text" },
          { key: "impresion", label: "Impresión", type: "text" },
          { key: "selloVert", label: "Sello vertical", type: "text" },
          { key: "selloHoriz", label: "Sello horizontal", type: "text" },
          { key: "plaga", label: "Presencia de plaga", type: "select", options: ["Sí", "No"] }
        ]
      },
      { type: "observaciones" }
    ]
  },

  // ===== R-CDC-001 (PRODUCCIÓN) =====
  {
    id: "CDC-001", code: "R-CDC-001", area: "Producción",
    title: "Certificado de Calidad",
    shortTitle: "Certificado de Calidad",
    desc: "Certificación de calidad de un lote de producto terminado.",
    icon: "📜", version: 1, emision: "Aug-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Detalles generales", columns: 2,
        fields: [
          { id: "nombreComercial", label: "Nombre comercial", type: "text", required: true },
          { id: "calidad", label: "Calidad", type: "text" },
          { id: "presentacion", label: "Presentación", type: "text" },
          { id: "industrializadoPor", label: "Industrializado por", type: "text", default: "Arrocera Liborio S.A." },
          { id: "lote", label: "Lote", type: "text", required: true },
          { id: "registroSanitario", label: "Registro sanitario", type: "text" },
          { id: "fechaProduccion", label: "Fecha de producción", type: "date", required: true, default: "today" },
          { id: "fechaVencimiento", label: "Fecha de vencimiento", type: "date" }
        ]
      },
      {
        type: "info", title: "Certificación",
        lines: [
          "El laboratorio de Calidad de Arrocera Liborio S.A. certifica que el producto descrito se encuentra dentro de las especificaciones de calidad, libre de plagas, libre de alérgenos y libre de otras sustancias de riesgo para la salud humana."
        ]
      },
      {
        type: "fields", title: "Descripción general del producto",
        fields: [
          { id: "porcentajeGranoEntero", label: "% Grano entero", type: "number", step: "0.01" },
          { id: "paisOrigen", label: "País de origen de materia prima", type: "text" },
          { id: "notasDescripcion", label: "Notas adicionales", type: "textarea" }
        ]
      },
      {
        type: "fields", title: "Especificaciones de calidad — resultados", columns: 2,
        fields: [
          { id: "humedadMax", label: "% Humedad (máximo)", type: "number", step: "0.01" },
          { id: "granoEnteroMin", label: "% Grano entero (mínimo)", type: "number", step: "0.01" },
          { id: "granoQuebradoMax", label: "% Grano quebrado (máximo)", type: "number", step: "0.01" },
          { id: "puntillaMax", label: "% Puntilla (máximo)", type: "number", step: "0.01" },
          { id: "manchadoMax", label: "% Arroz manchado (máximo)", type: "number", step: "0.01" },
          { id: "danadoMax", label: "% Arroz dañado (máximo)", type: "number", step: "0.01" },
          { id: "yesosoMax", label: "% Arroz yesoso (máximo)", type: "number", step: "0.01" },
          { id: "rojoMax", label: "% Arroz rojo (máximo)", type: "number", step: "0.01" },
          { id: "semillasGranzasIntegral", label: "Semillas, granzas e integral (máx en 500 g)", type: "number" },
          { id: "blancura", label: "Resultado blancura", type: "number", step: "0.01" },
          { id: "alergenos", label: "Presencia de alérgenos", type: "select", options: ["Ausente", "Presente"] },
          { id: "insectos", label: "Presencia de insectos", type: "select", options: ["Ausente", "Presente"] },
          { id: "coccion", label: "Resultado cocción", type: "text" }
        ]
      },
      {
        type: "info", title: "Instrucciones de uso y conservación",
        lines: [
          "Manténgase en lugar seco bajo techo, sobre tarimas, alejado de agroquímicos o productos de limpieza.",
          "Verifique que la zona de almacenamiento esté protegida contra el ingreso de plagas o roedores.",
          "Una vez abierto, almacenar el producto en un recipiente grado alimenticio, limpio, seco y con tapa."
        ]
      },
      {
        type: "material-list", id: "micro",
        title: "Análisis microbiológico",
        showCode: false,
        columns: [
          { key: "resultado", label: "Resultado", type: "text" },
          { key: "certificado", label: "Certificado", type: "text" }
        ],
        items: [
          { codigo: "", desc: "Recuento de coliformes fecales" },
          { codigo: "", desc: "Recuento de coliformes totales" },
          { codigo: "", desc: "Salmonella" },
          { codigo: "", desc: "Aflatoxinas" }
        ]
      },
      { type: "observaciones" }
    ]
  },

  // ===== R-CPH-001 (CALIDAD) =====
  {
    id: "CPH-001", code: "R-CPH-001", area: "Calidad",
    title: "Registro Control de Cloro y pH en el Agua",
    shortTitle: "Cloro y pH en Agua",
    desc: "Control de cloro residual y pH del agua con acciones correctivas.",
    icon: "💧", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "info", title: "Rangos permitidos",
        lines: [
          "pH: 6,0 – 8,0",
          "Cloro residual libre: 0,3 – 1,0 mg/L"
        ]
      },
      {
        type: "repeater-table", id: "muestra", rowLabel: "Muestra",
        title: "Mediciones",
        columns: [
          { key: "fecha", label: "Fecha", type: "date", default: "today" },
          { key: "hora", label: "Hora", type: "time" },
          { key: "punto", label: "Punto de muestreo", type: "text" },
          { key: "cloro", label: "Cloro (mg/L)", type: "number", step: "0.01" },
          { key: "ph", label: "pH", type: "number", step: "0.01" },
          { key: "acciones", label: "Acciones correctivas", type: "text" }
        ]
      },
      { type: "observaciones" }
    ]
  },

  // ===== R-IBP-001 (CALIDAD) =====
  {
    id: "IBP-001", code: "R-IBP-001", area: "Calidad",
    title: "Registro Control Incumplimiento BPM",
    shortTitle: "Incumplimiento BPM",
    desc: "Registro de incumplimientos de Buenas Prácticas de Manufactura por colaborador.",
    icon: "⚠️", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "area", label: "Área", type: "text" },
          { id: "colaborador", label: "Colaborador", type: "text", required: true }
        ]
      },
      {
        type: "checkbox-list", id: "incumplimientos",
        title: "Incumplimientos detectados",
        note: "Marque cada incumplimiento observado.",
        items: [
          "Uñas largas",
          "Falta uso de redecilla para cabello",
          "Fumado en área laboral",
          "Cabello largo",
          "Ingreso con alhajas y relojes",
          "Uso no permitido de celular",
          "Uniforme no adecuado",
          "Escupir en área laboral",
          "Lavado inadecuado de manos",
          "Barba / bigote largo",
          "Consumo de alimentos en área laboral",
          "Uso de colonia / desodorante no neutro",
          "Falta de anteojos de protección",
          "Falta de tapones auditivos",
          "Falta de zapatos de protección",
          "Falta de arnés / líneas de vida",
          "Falta de máscara para soldar",
          "Falta de guantes, polainas, mangas o delantal de cuero",
          "Falta de máscara para esmerilar",
          "Falta de mascarilla desechable",
          "Falta de mascarilla doble vía",
          "No cierran puertas",
          "Otro incumplimiento"
        ]
      },
      {
        type: "fields", title: "Detalle adicional",
        fields: [
          { id: "otroEspecifique", label: "Otro (especifique)", type: "textarea" }
        ]
      },
      { type: "observaciones" }
    ]
  },

  // ===== R-NCE-001 (CALIDAD) =====
  {
    id: "NCE-001", code: "R-NCE-001", area: "Calidad",
    title: "Registro de No Conformidad — Material de Empaque",
    shortTitle: "No Conformidad Material Empaque",
    desc: "Reporte de no conformidades de material de empaque entregado por proveedor.",
    icon: "📦", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "consecutivo", label: "Consecutivo No Conformidad", type: "text", required: true },
          { id: "comunicaNoConformidad", label: "Encargado de comunicar la no conformidad", type: "text" },
          { id: "inspector", label: "Inspector de Control de Calidad", type: "text" }
        ]
      },
      {
        type: "fields", title: "Datos del material", columns: 2,
        fields: [
          { id: "material", label: "Material", type: "text" },
          { id: "lote", label: "Lote", type: "text" },
          { id: "op", label: "OP", type: "text" },
          { id: "cantidad", label: "Cantidad (kg / unidades)", type: "text" }
        ]
      },
      {
        type: "fields", title: "Datos del proveedor", columns: 2,
        fields: [
          { id: "proveedor", label: "Proveedor", type: "text" },
          { id: "codigoSistema", label: "Código en sistema", type: "text" },
          { id: "telefonoReferencia", label: "Teléfono / referencia", type: "text" },
          { id: "representanteVentas", label: "Representante de ventas", type: "text" }
        ]
      },
      {
        type: "fields", title: "Descripción de la no conformidad",
        fields: [
          { id: "descripcionNoConformidad", label: "Descripción", type: "textarea" }
        ]
      },
      {
        type: "fields", title: "Disposición y observaciones del proveedor",
        fields: [
          { id: "disposicionProducto", label: "Disposición del producto revisado", type: "textarea" },
          { id: "observacionesProveedor", label: "Observaciones del proveedor", type: "textarea" }
        ]
      },
      { type: "observaciones" }
    ]
  },

  // ===== R-PQV-001 (CALIDAD) =====
  {
    id: "PQV-001", code: "R-PQV-001", area: "Calidad",
    title: "Protocolo de Recolección de Vidrio y Materiales Quebradizos",
    shortTitle: "Recolección Vidrio Quebradizo",
    desc: "Protocolo cuando se detecta rotura de vidrio o material quebradizo.",
    icon: "🧯", version: 2, emision: "Feb-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "ubicacion", label: "Ubicación del vidrio o acrílico dañado", type: "text" }
        ]
      },
      {
        type: "fields", title: "Detalle del incidente",
        fields: [
          { id: "descripcion", label: "Descripción de lo sucedido", type: "textarea" },
          { id: "accionesCorrectivas", label: "Acciones correctivas y manejo de producto afectado", type: "textarea" },
          { id: "seguimiento", label: "Seguimiento", type: "textarea" }
        ]
      },
      { type: "observaciones" }
    ]
  },

  // ===== R-RFD-001 (CALIDAD) =====
  {
    id: "RFD-001", code: "R-RFD-001", area: "Calidad",
    title: "Registro de Recepción y Fumigación de Devoluciones",
    shortTitle: "Recepción Fumigación Devoluciones",
    desc: "Recepción de devoluciones con evaluación de plagas y fumigación con fosfuro.",
    icon: "🚛", version: 1, emision: "Apr-2026", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "1. Información general de la recepción", columns: 2,
        fields: [
          { id: "fechaIngreso", label: "Fecha de ingreso", type: "date", default: "today" },
          { id: "numeroBoleta", label: "Número de boleta / factura", type: "text" },
          { id: "cliente", label: "Nombre del cliente", type: "text" },
          { id: "placa", label: "Placa del vehículo", type: "text" },
          { id: "chofer", label: "Nombre del chofer", type: "text" }
        ]
      },
      {
        type: "fields", title: "2. Evaluación de calidad y control de plagas", columns: 2,
        note: "A realizarse en la zona de espera antes del ingreso a planta.",
        fields: [
          { id: "producto", label: "Producto", type: "select", options: ["Arroz Granza", "Arroz Pilado", "Otros"] },
          { id: "productoOtros", label: "Otros (especifique)", type: "text" },
          { id: "cantidad", label: "Cantidad (sacos / kilos)", type: "text" },
          { id: "nivelInfestacion", label: "Nivel de infestación", type: "select",
            options: ["Leve — escasos insectos adultos", "Moderada — adultos y larvas en costuras", "Crítica — alta densidad, harinilla y calor"] },
          { id: "tipoPlaga", label: "Tipo de plaga identificada", type: "text" }
        ]
      },
      {
        type: "fields", title: "3. Tratamiento químico (DETIA / Fosfuro de Aluminio)", columns: 2,
        note: "A realizarse una vez descargado en el contenedor de cuarentena.",
        fields: [
          { id: "idContenedor", label: "ID del contenedor de fumigación", type: "text" },
          { id: "horaSellado", label: "Hora de sellado hermético", type: "time" },
          { id: "productoQuimico", label: "Producto químico", type: "text", default: "DETIA (Fosfuro de Aluminio)" },
          { id: "dosis", label: "Dosis aplicada (tabletas / pellets)", type: "text" },
          { id: "volumenContenedor", label: "Volumen del contenedor (m³)", type: "number", step: "0.01" },
          { id: "fechaAperturaProgramada", label: "Fecha apertura programada (mín 72-96 h)", type: "date" },
          { id: "horaAperturaProgramada", label: "Hora apertura programada", type: "time" }
        ]
      },
      {
        type: "fields", title: "4. Verificación de seguridad y aireación", columns: 2,
        note: "A realizarse antes de retirar el producto del contenedor.",
        fields: [
          { id: "fechaApertura", label: "Fecha de apertura", type: "date" },
          { id: "horaApertura", label: "Hora de apertura", type: "time" },
          { id: "gasResidual", label: "Gas residual PH₃ (ppm; <0,3 para ingreso)", type: "number", step: "0.01" },
          { id: "mortalidad", label: "Verificación de mortalidad", type: "select",
            options: ["Éxito — 100% eliminada", "Fallido — presencia de plaga viva (requiere re-tratamiento)"] }
        ]
      },
      {
        type: "fields", title: "5. Disposición final del producto",
        fields: [
          { id: "destino", label: "Destino autorizado por Calidad", type: "select",
            options: ["Reproceso (limpieza mecánica profunda y re-empaque)", "Subproducto (consumo animal / granja)", "Producto no conforme"] },
          { id: "destinoNotas", label: "Notas del destino", type: "textarea" }
        ]
      },
      { type: "observaciones" }
    ]
  },

  // ===== R-VPQ-001 (CALIDAD) =====
  {
    id: "VPQ-001", code: "R-VPQ-001", area: "Calidad",
    title: "Registro Revisión de Vidrio y Plástico Quebradizo",
    shortTitle: "Vidrio y Plástico Quebradizo",
    desc: "Revisión del estado de vidrios, acrílicos y plásticos quebradizos por ubicación.",
    icon: "🪟", version: 2, emision: "May-2024", revision: "Jun-2026",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "fecha", label: "Fecha", type: "date", required: true, default: "today" },
          { id: "hora", label: "Hora", type: "time" }
        ]
      },
      {
        type: "material-list", id: "vidrios",
        title: "Revisión por elemento",
        note: "Marque el estado de cada elemento revisado.",
        columns: [
          { key: "estado", label: "Estado", type: "select", options: ["Buen Estado", "Dañado"] },
          { key: "observaciones", label: "Observaciones", type: "text" }
        ],
        items: [
          { codigo: "VC-1",  desc: "Oficinas — Ventanales de vidrio, puerta principal" },
          { codigo: "VC-2",  desc: "Oficinas — Ventanal de vidrio Ventas" },
          { codigo: "VC-3",  desc: "Oficinas — Ventana vidrio Ventas" },
          { codigo: "VC-4",  desc: "Oficinas — Ventana y puerta SIG" },
          { codigo: "VC-5",  desc: "Oficinas — Ventana y puerta oficina gerente Administrativo" },
          { codigo: "VC-6",  desc: "Oficinas — Ventana y puerta oficina gerente General" },
          { codigo: "VC-7",  desc: "Oficinas — Ventana y puerta sala de juntas" },
          { codigo: "VC-8",  desc: "Oficinas — Ventana y puerta de comedor" },
          { codigo: "VC-9",  desc: "Oficinas — Ventana y puerta oficina contabilidad y tesorería" },
          { codigo: "VC-10", desc: "Oficinas — Ventana y puerta oficina Recursos Humanos" },
          { codigo: "VC-11", desc: "Oficinas — Ventanillas" },
          { codigo: "VA-12", desc: "Laboratorio Empaque — Ventana acrílico" },
          { codigo: "VA-13", desc: "Laboratorio Empaque — Ventana acrílico" },
          { codigo: "VC-14", desc: "Estación pesaje camiones — Ventana cristal" },
          { codigo: "VC-15", desc: "Estación pesaje camiones — Ventana cristal" },
          { codigo: "VC-16", desc: "Puesto seguridad — Ventana cristal" },
          { codigo: "VC-17", desc: "Laboratorio y Proveeduría — Ventana cristal" },
          { codigo: "VC-18", desc: "Laboratorio y Proveeduría — Ventana cristal" },
          { codigo: "VC-19", desc: "Laboratorio y Proveeduría — Ventana cristal" },
          { codigo: "VC-20", desc: "Laboratorio y Proveeduría — Ventana cristal" },
          { codigo: "VC-21", desc: "Laboratorio y Proveeduría — Ventana cristal" },
          { codigo: "VC-22", desc: "Laboratorio y Proveeduría — Ventana cristal" },
          { codigo: "VC-23", desc: "Laboratorio y Proveeduría — Ventana cristal" }
        ]
      },
      { type: "observaciones" }
    ]
  }
];

// ---------------------------------------------------------------------------
// Reasignación de áreas (2026-06): el área "Calidad" se separó en tres —
// Calidad Pilado, Calidad Empaque y Calidad Frijoles. Un formulario puede
// pertenecer a varias. Se centraliza aquí para no tocar cada esquema.
// ---------------------------------------------------------------------------
(function () {
  const CP = "Calidad Pilado", CE = "Calidad Empaque", CF = "Calidad Frijoles";
  const AREAS = {
    PBM_001: [CP, CE, CF], PBP_001: [CP, CE, CF], RDI_001: [CP, CE, CF],
    LHM_001: [CP, CE, CF], IBP_001: [CP, CE, CF], EPP_001: [CP, CE, CF],
    CPH_001: [CP, CE, CF], DAC_001: [CP, CE, CF],
    PRR_001: [CP, CE], TPD_001: [CP, CE], ANU_001: [CP, CE],
    AGF_001: [CP, CF],
    LLC_001: [CP], CIA_001: [CP], ASL_001: [CP], VPQ_001: [CP], PQV_001: [CP],
    ARL_001: [CE], PLP_001: [CE], CDV_001: [CE], INV_001: [CE],
    ETP_001: [CE], POM_001: [CE], NCE_001: [CE],
    LDD_001: [CP, CF, "Limpieza", "Mantenimiento", "Empaque"]
  };
  // Formularios retirados de la plataforma.
  const REMOVED = { "CPB-001": 1, "RFD-001": 1 };

  for (let i = FORMS.length - 1; i >= 0; i--) {
    const f = FORMS[i];
    if (REMOVED[f.id]) { FORMS.splice(i, 1); continue; }
    const key = f.id.replace(/-/g, "_");
    if (AREAS[key]) f.area = AREAS[key].slice();
  }

  // R-RDI-001: segregado por área. El renderer oculta el selector de área y
  // muestra solo las máquinas del área desde la que se abre el formulario.
  const rdi = FORMS.find(f => f.id === "RDI-001");
  if (rdi) {
    rdi.areaScoped = true;
    (rdi.sections || []).forEach(s => { if (s.type === "checklist") s.scopeByArea = true; });
  }
})();
