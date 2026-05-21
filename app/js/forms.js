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
    revision: "Mar-2026",
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
    revision: "Apr-2026",
    sections: [
      {
        type: "fields",
        title: "Información general",
        columns: 2,
        fields: [
          { id: "semana",      label: "Semana",          type: "number", required: true, default: "weekNum" },
          { id: "fechaInicio", label: "Fecha inicio",    type: "date",   required: true, default: "weekStart" },
          { id: "fechaFin",    label: "Fecha fin",       type: "date",   required: true, default: "weekEnd" },
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
    revision: "Mar-2026",
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
    title: "Limpieza y Desinfección Dispensadores de Agua",
    shortTitle: "Dispensadores de Agua",
    desc: "Registro semanal de limpieza y desinfección de dispensadores.",
    icon: "🚰",
    version: 3,
    emision: "Feb-2024",
    revision: "Apr-2026",
    sections: [
      {
        type: "fields",
        title: "Información general",
        columns: 2,
        fields: [
          { id: "semana",     label: "Semana",     type: "number", required: true, default: "weekNum" },
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
    revision: "Apr-2026",
    sections: [
      {
        type: "fields",
        title: "Información general",
        columns: 2,
        fields: [
          { id: "semana",     label: "Semana",      type: "number", required: true, default: "weekNum" },
          { id: "fechaInicio",label: "Fecha inicio",type: "date",   required: true, default: "weekStart" }
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
    revision: "Apr-2026",
    sections: [
      {
        type: "fields",
        title: "Información general",
        columns: 2,
        fields: [
          { id: "semana",     label: "Semana",      type: "number", required: true, default: "weekNum" },
          { id: "fechaInicio",label: "Fecha inicio",type: "date",   required: true, default: "weekStart" }
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
    revision: "Mar-2026",
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
    version: 2, emision: "Feb-2024", revision: "Jul-2025",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true, default: "Bodega de empaque" },
          { id: "semana", label: "Semana (del / al)", type: "text", placeholder: "Del ___ al ___ de ______" }
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
    version: 2, emision: "Feb-2024", revision: "Jul-2025",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true },
          { id: "semana", label: "Semana (del / al)", type: "text", placeholder: "Del ___ al ___ de ______" }
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
    version: 2, emision: "Feb-2024", revision: "Jul-2025",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true },
          { id: "semana", label: "Semana (del / al)", type: "text", placeholder: "Del ___ al ___ de ______" }
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
    id: "BCI-001", code: "R-BCI-001", area: "Empaque",
    title: "Registro Boleta Control Inventario Mensual y Salida de Material de Empaque",
    shortTitle: "Inventario Material Empaque",
    desc: "Inventario mensual y salida de material de empaque por código.",
    icon: "📋", version: 3, emision: "Feb-2024", revision: "Jul-2025",
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
          { key: "uds", label: "Unidades", type: "number" },
          { key: "lote", label: "Lote", type: "text" }
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
    icon: "🪡", version: 2, emision: "Feb-2024", revision: "Jul-2025",
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
    icon: "📦", version: 2, emision: "Feb-2024", revision: "Jul-2025",
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
    icon: "🔪", version: 2, emision: "Feb-2024", revision: "Jul-2025",
    sections: [
      {
        type: "fields", title: "Información general", columns: 2,
        fields: [
          { id: "area", label: "Área", type: "text", required: true },
          { id: "semana", label: "Semana (del / al)", type: "text", placeholder: "Del ___ al ___ de ______" }
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
    icon: "🧵", version: 2, emision: "Feb-2024", revision: "Jul-2025",
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
    icon: "↩️", version: 2, emision: "Feb-2024", revision: "Jul-2025",
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
  }
];
