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
  }
];
