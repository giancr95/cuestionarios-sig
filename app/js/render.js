// ---------------------------------------------------------------------------
// Renderizado de formularios a partir del esquema en forms.js
// Recolección de datos al enviar.
// ---------------------------------------------------------------------------
const Render = (() => {

  // ---------- helpers ----------
  function el(tag, attrs, ...children) {
    const n = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === "class") n.className = attrs[k];
        else if (k === "html") n.innerHTML = attrs[k];
        else if (k.startsWith("on") && typeof attrs[k] === "function") n.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] === true) n.setAttribute(k, "");
        else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, attrs[k]);
      }
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return n;
  }

  function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function weekInfo(date) {
    const d = date ? new Date(date) : new Date();
    // ISO week number
    const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = (target.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNum + 3);
    const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
    const weekNum = 1 + Math.round(((target - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
    // Monday of current week
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      weekNum,
      start: monday.toISOString().slice(0, 10),
      end: sunday.toISOString().slice(0, 10)
    };
  }

  function resolveDefault(def) {
    if (def === "today") return todayISO();
    const wi = weekInfo();
    if (def === "weekNum") return wi.weekNum;
    if (def === "weekStart") return wi.start;
    if (def === "weekEnd") return wi.end;
    return def;
  }

  // ---------- field ----------
  function renderField(field) {
    const labelHtml = field.label + (field.required ? ' <span class="req">*</span>' : "");
    const wrap = el("div", { class: "field" });
    wrap.appendChild(el("label", { html: labelHtml, for: field.id }));

    let input;
    if (field.type === "select") {
      input = el("select", { id: field.id, name: field.id, class: "select" });
      input.appendChild(el("option", { value: "" }, "— Seleccione —"));
      for (const opt of field.options) {
        const o = el("option", { value: opt }, opt);
        if (field.default === opt) o.setAttribute("selected", "");
        input.appendChild(o);
      }
    } else if (field.type === "textarea") {
      input = el("textarea", {
        id: field.id, name: field.id, class: "textarea",
        placeholder: field.placeholder || ""
      });
    } else {
      input = el("input", {
        id: field.id, name: field.id, class: "input",
        type: field.type || "text",
        placeholder: field.placeholder || "",
        min: field.min, max: field.max, step: field.step
      });
    }
    if (field.default != null && field.type !== "select") {
      const v = resolveDefault(field.default);
      if (v !== undefined && v !== null) input.value = v;
    }
    if (field.required) input.setAttribute("required", "");
    wrap.appendChild(input);
    return wrap;
  }

  // ---------- section: fields ----------
  function sectionFields(sec) {
    const box = el("section", { class: "section" });
    if (sec.title) box.appendChild(el("h3", null, sec.title));
    const grid = el("div", { class: sec.columns === 2 ? "two-col" : "" });
    for (const f of sec.fields) grid.appendChild(renderField(f));
    box.appendChild(grid);
    return box;
  }

  // ---------- section: radio area ----------
  function sectionRadioArea(sec) {
    const box = el("section", { class: "section" });
    if (sec.title) box.appendChild(el("h3", null, sec.title));
    const seg = el("div", { class: "segmented" });
    for (const opt of sec.options) {
      const inputId = `${sec.id}-${opt.replace(/\s+/g, "")}`;
      seg.appendChild(el("input", {
        type: "radio", name: sec.id, id: inputId, value: opt,
        "data-section": sec.id, required: sec.required || false
      }));
      seg.appendChild(el("label", { for: inputId }, opt));
    }
    box.appendChild(seg);
    return box;
  }

  // ---------- section: checklist ----------
  function sectionChecklist(sec) {
    const box = el("section", { class: "section" });
    if (sec.title) box.appendChild(el("h3", null, sec.title));
    if (sec.note) box.appendChild(el("div", { class: "note" }, sec.note));
    const list = el("div", { class: "checklist" });
    sec.items.forEach((item, idx) => {
      const row = el("div", { class: "check-row" });
      row.appendChild(el("div", { class: "check-label" }, `${idx + 1}. ${item}`));
      const seg = el("div", { class: "segmented sm" });
      for (const opt of sec.options) {
        const inputId = `chk-${idx}-${opt.value}`;
        const name = `checklist__${idx}`;
        const attrs = { type: "radio", name, id: inputId, value: opt.value, "data-checklist-idx": idx };
        if (sec.optionsDefault === opt.value) attrs.checked = true;
        seg.appendChild(el("input", attrs));
        seg.appendChild(el("label", { for: inputId }, opt.label));
      }
      row.appendChild(seg);
      list.appendChild(row);
    });
    box.appendChild(list);
    return box;
  }

  // ---------- section: daily checks (DAC) ----------
  function sectionDailyChecks(sec) {
    const box = el("section", { class: "section" });
    if (sec.title) box.appendChild(el("h3", null, sec.title));
    if (sec.note) box.appendChild(el("div", { class: "note" }, sec.note));

    const scroll = el("div", { class: "grid-scroll" });
    const table = el("table", { class: "grid-table" });

    const thead = el("thead");
    const trh = el("tr");
    trh.appendChild(el("th", null, "Parámetro"));
    for (const d of sec.days) trh.appendChild(el("th", { style: "text-align:center" }, d.label));
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = el("tbody");
    sec.rows.forEach((row, rIdx) => {
      const tr = el("tr");
      tr.appendChild(el("td", { class: "aspect" }, `${row.label}`, el("div", { class: "meta", style: "font-size:11px;color:var(--ink-muted);margin-top:2px" }, row.valor)));
      sec.days.forEach((d) => {
        const td = el("td", { style: "text-align:center" });
        const seg = el("div", { class: "segmented sm", style: "justify-content:center" });
        for (const opt of sec.options) {
          const name = `daily__${rIdx}__${d.key}`;
          const id = `${name}-${opt.value}`;
          seg.appendChild(el("input", { type: "radio", name, id, value: opt.value }));
          seg.appendChild(el("label", { for: id }, opt.label));
        }
        td.appendChild(seg);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    box.appendChild(scroll);
    return box;
  }

  // ---------- section: activity matrix (LDD) ----------
  function sectionActivityMatrix(sec) {
    const box = el("section", { class: "section" });
    if (sec.title) box.appendChild(el("h3", null, sec.title));
    if (sec.note) box.appendChild(el("div", { class: "note" }, sec.note));

    const scroll = el("div", { class: "grid-scroll" });
    const table = el("table", { class: "grid-table" });
    const thead = el("thead");
    const trh = el("tr");
    trh.appendChild(el("th", null, "Equipo / Actividad"));
    for (const d of sec.days) trh.appendChild(el("th", { style: "text-align:center" }, d.label));
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = el("tbody");
    sec.rows.forEach((row, rIdx) => {
      const tr = el("tr");
      tr.appendChild(el("td", { class: "aspect" }, `${rIdx + 1}. ${row}`));
      sec.days.forEach((d) => {
        const td = el("td", { class: "day-cell" });
        const stack = el("div", { class: "stack" });
        sec.columns.forEach((col) => {
          const line = el("label", { class: "check-inline", style: "display:flex;align-items:center;gap:6px;font-size:12px" });
          const cb = el("input", {
            type: "checkbox",
            name: `ldd__${rIdx}__${d.key}__${col.key}`
          });
          line.appendChild(cb);
          line.appendChild(el("span", null, col.label));
          stack.appendChild(line);
        });
        td.appendChild(stack);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    box.appendChild(scroll);
    return box;
  }

  // ---------- section: EPP grid (repeatable colaboradores) ----------
  function sectionEppGrid(sec) {
    const box = el("section", { class: "section" });
    if (sec.title) box.appendChild(el("h3", null, sec.title));
    if (sec.note) box.appendChild(el("div", { class: "note" }, sec.note));

    const wrap = el("div", { class: "repeater", id: "epp-repeater" });
    box.appendChild(wrap);

    const addBtn = el("button", {
      type: "button", class: "btn btn-ghost add-row",
      onclick: () => addEppRow(wrap, sec)
    }, "+ Agregar colaborador");
    box.appendChild(addBtn);

    addEppRow(wrap, sec);
    return box;
  }

  function addEppRow(container, sec) {
    const idx = container.querySelectorAll(".repeater-row").length;
    const row = el("div", { class: "repeater-row", "data-idx": idx });
    const head = el("div", { class: "row-head" });
    head.appendChild(el("div", { class: "row-num" }, `Colaborador ${idx + 1}`));
    head.appendChild(el("button", {
      type: "button", class: "row-del",
      onclick: () => { row.remove(); renumber(container); }
    }, "Eliminar"));
    row.appendChild(head);

    const grid = el("div", { class: "two-col" });
    const nameField = el("div", { class: "field" },
      el("label", null, "Nombre del colaborador"),
      el("input", { type: "text", class: "input", name: `epp__${idx}__colaborador`, placeholder: "Nombre completo" })
    );
    const fechaField = el("div", { class: "field" },
      el("label", null, "Fecha"),
      el("input", { type: "date", class: "input", name: `epp__${idx}__fecha`, value: todayISO() })
    );
    grid.appendChild(nameField);
    grid.appendChild(fechaField);
    row.appendChild(grid);

    const scroll = el("div", { class: "grid-scroll", style: "margin-top:10px" });
    const table = el("table", { class: "grid-table" });
    const thead = el("thead");
    const trh = el("tr");
    trh.appendChild(el("th", null, "EPP"));
    trh.appendChild(el("th", { style: "text-align:center" }, "Estado"));
    thead.appendChild(trh);
    const tbody = el("tbody");
    sec.items.forEach((item, i) => {
      const tr = el("tr");
      tr.appendChild(el("td", { class: "aspect" }, item));
      const td = el("td", { style: "text-align:center" });
      const seg = el("div", { class: "segmented sm", style: "justify-content:center" });
      for (const opt of sec.options) {
        const name = `epp__${idx}__item${i}`;
        const id = `${name}-${opt.value}`;
        seg.appendChild(el("input", { type: "radio", name, id, value: opt.value }));
        seg.appendChild(el("label", { for: id }, opt.label));
      }
      td.appendChild(seg);
      tr.appendChild(td);
      tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    scroll.appendChild(table);
    row.appendChild(scroll);

    container.appendChild(row);
  }

  function renumber(container) {
    container.querySelectorAll(".repeater-row").forEach((r, i) => {
      r.setAttribute("data-idx", i);
      const num = r.querySelector(".row-num");
      if (num) num.textContent = `Colaborador ${i + 1}`;
    });
  }

  // ---------- section: evaluación grid (PBM / PBP) ----------
  function sectionEvalGrid(sec) {
    const box = el("section", { class: "section" });
    if (sec.title) box.appendChild(el("h3", null, sec.title));
    if (sec.note) box.appendChild(el("div", { class: "note" }, sec.note));

    const keyPrefix = sec.key ? `eval-${sec.key}` : "eval";

    const scroll = el("div", { class: "grid-scroll" });
    const table = el("table", { class: "grid-table" });
    const thead = el("thead");
    const trh = el("tr");
    trh.appendChild(el("th", { class: "aspect" }, "Aspecto"));
    for (const d of sec.days) trh.appendChild(el("th", { style: "text-align:center", colspan: "3" }, d.label));
    thead.appendChild(trh);
    const trSub = el("tr");
    trSub.appendChild(el("th", { class: "aspect" }));
    for (const _ of sec.days) {
      trSub.appendChild(el("th", { style: "text-align:center", "class": "subhead" }, "Evaluación"));
      trSub.appendChild(el("th", { style: "text-align:center", "class": "subhead" }, "Descripción"));
      trSub.appendChild(el("th", { style: "text-align:center", "class": "subhead" }, "Acción"));
    }
    thead.appendChild(trSub);
    table.appendChild(thead);

    const tbody = el("tbody");
    sec.aspectos.forEach((aspecto, i) => {
      const tr = el("tr");
      tr.appendChild(el("td", { class: "aspect" }, `${i + 1}. ${aspecto}`));
      sec.days.forEach((d) => {
        // Eval cell
        const tdEval = el("td", { style: "text-align:center" });
        const seg = el("div", { class: "segmented sm", style: "justify-content:center" });
        for (const opt of sec.options) {
          const name = `${keyPrefix}__${i}__${d.key}__val`;
          const id = `${name}-${opt.value}`;
          seg.appendChild(el("input", { type: "radio", name, id, value: opt.value }));
          seg.appendChild(el("label", { for: id }, opt.label));
        }
        tdEval.appendChild(seg);
        tr.appendChild(tdEval);

        // Desc cell
        const tdDesc = el("td");
        tdDesc.appendChild(el("input", {
          type: "text", class: "mini-input",
          name: `${keyPrefix}__${i}__${d.key}__desc`,
          placeholder: "—"
        }));
        tr.appendChild(tdDesc);

        // Acción cell
        const tdAcc = el("td");
        tdAcc.appendChild(el("input", {
          type: "text", class: "mini-input",
          name: `${keyPrefix}__${i}__${d.key}__accion`,
          placeholder: "—"
        }));
        tr.appendChild(tdAcc);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    box.appendChild(scroll);

    if (sec.responsablePorDia) {
      const respRow = el("div", { class: "two-col", style: "margin-top:12px" });
      sec.days.forEach((d) => {
        respRow.appendChild(el("div", { class: "field" },
          el("label", null, `Responsable ${d.label}`),
          (() => {
            const s = el("select", {
              class: "select", name: `${keyPrefix}__resp__${d.key}`
            });
            s.appendChild(el("option", { value: "" }, "—"));
            sec.responsables.forEach(r => s.appendChild(el("option", { value: r }, r)));
            return s;
          })()
        ));
      });
      box.appendChild(respRow);
    }

    return box;
  }

  // ---------- section: producción ----------
  function sectionProduccion(sec) {
    const box = el("section", { class: "section" });
    if (sec.title) box.appendChild(el("h3", null, sec.title));
    if (sec.note) box.appendChild(el("div", { class: "note" }, sec.note));

    const wrap = el("div", { class: "repeater", id: "prod-repeater" });
    box.appendChild(wrap);

    const addBtn = el("button", {
      type: "button", class: "btn btn-ghost add-row",
      onclick: () => addProdRow(wrap, sec)
    }, "+ Agregar producción");
    box.appendChild(addBtn);

    addProdRow(wrap, sec);
    return box;
  }

  function addProdRow(container, sec) {
    const idx = container.querySelectorAll(".repeater-row").length;
    const row = el("div", { class: "repeater-row", "data-idx": idx });

    const head = el("div", { class: "row-head" });
    head.appendChild(el("div", { class: "row-num" }, `Producción ${idx + 1}`));
    head.appendChild(el("button", {
      type: "button", class: "row-del",
      onclick: () => { row.remove(); renumberProd(container); }
    }, "Eliminar"));
    row.appendChild(head);

    // Ejecución
    const head1 = el("div", { class: "label", style: "margin-bottom:8px;color:var(--green-dark);font-weight:600" }, "Ejecución de la producción");
    row.appendChild(head1);
    const grid1 = el("div", { class: "two-col" });
    grid1.appendChild(fld(`prod__${idx}__fechaProd`,    "Fecha de producción",    "date",   todayISO()));
    grid1.appendChild(selPres(`prod__${idx}__presentacion`, "Presentación", sec.productos));
    grid1.appendChild(fld(`prod__${idx}__cantidad`,     "Cantidad producida",     "number", "", "0", "0"));
    grid1.appendChild(fld(`prod__${idx}__loteProd`,     "Lote de producción",     "text"));
    grid1.appendChild(fld(`prod__${idx}__loteEmpaque`,  "# Lote material empaque","text"));
    grid1.appendChild(selResp(`prod__${idx}__responsable`, "Responsable", sec.responsables));
    grid1.appendChild(fld(`prod__${idx}__horaInicio`,   "Hora inicio",            "time"));
    grid1.appendChild(fld(`prod__${idx}__horaFin`,      "Hora fin",               "time"));
    row.appendChild(grid1);

    // Análisis
    row.appendChild(el("div", { class: "label", style: "margin-top:16px;color:var(--green-dark);font-weight:600" }, "Análisis de calidad de materia prima"));
    const grid2 = el("div", { class: "two-col" });
    grid2.appendChild(fld(`prod__${idx}__granza`,     "Granza y semillas objetables", "text"));
    grid2.appendChild(fldPct(`prod__${idx}__entero`,  "% Grano entero"));
    grid2.appendChild(fldPct(`prod__${idx}__quebrado`,"% Grano quebrado"));
    grid2.appendChild(fldPct(`prod__${idx}__manchado`,"% Grano manchado"));
    grid2.appendChild(fldPct(`prod__${idx}__yesoso`,  "% Grano yesoso"));
    grid2.appendChild(fldPct(`prod__${idx}__rojo`,    "% Grano rojo"));
    grid2.appendChild(fldPct(`prod__${idx}__danado`,  "% Grano dañado"));
    grid2.appendChild(fld(`prod__${idx}__integral`,   "Cant. grano integral", "number", "", "0"));
    grid2.appendChild(fld(`prod__${idx}__blancura`,   "Blancura", "number", "", "0", "0.1"));
    grid2.appendChild(fldPct(`prod__${idx}__humedad`, "% Humedad"));
    grid2.appendChild(fld(`prod__${idx}__loteVit`,    "Lote de vitamina", "text"));
    grid2.appendChild(selSiNo(`prod__${idx}__plaga`,  "Plaga viva o muerta"));
    row.appendChild(grid2);

    // Físicos / Organolépticos
    row.appendChild(el("div", { class: "label", style: "margin-top:16px;color:var(--green-dark);font-weight:600" }, "Parámetros físicos y organolépticos"));
    const grid3 = el("div", { class: "two-col" });
    [
      ["metales",    "Metales (presencia)"],
      ["vidrios",    "Vidrios (presencia)"],
      ["impurezas",  "Impurezas (presencia)"],
      ["apariencia", "Apariencia correcta"],
      ["olor",       "Olor característico"],
      ["color",      "Color característico"],
      ["sabor",      "Sabor característico"],
      ["textura",    "Textura característica"],
      ["alergenos",  "Alérgenos"]
    ].forEach(([k, lbl]) => grid3.appendChild(selSiNo(`prod__${idx}__${k}`, lbl)));
    row.appendChild(grid3);

    // Liberación
    row.appendChild(el("div", { class: "label", style: "margin-top:16px;color:var(--green-dark);font-weight:600" }, "Liberación"));
    const grid4 = el("div", { class: "two-col" });
    grid4.appendChild(selSiNo(`prod__${idx}__liberado`, "Producto liberado"));
    grid4.appendChild(fld(`prod__${idx}__cantLiberada`, "Cantidad liberada", "number", "", "0"));
    grid4.appendChild(fld(`prod__${idx}__noProduccion`, "No. producción", "text"));
    row.appendChild(grid4);

    container.appendChild(row);
  }

  function renumberProd(container) {
    container.querySelectorAll(".repeater-row").forEach((r, i) => {
      r.setAttribute("data-idx", i);
      const num = r.querySelector(".row-num");
      if (num) num.textContent = `Producción ${i + 1}`;
    });
  }

  function fld(name, label, type, value, min, step) {
    const d = el("div", { class: "field" });
    d.appendChild(el("label", null, label));
    d.appendChild(el("input", {
      type: type || "text", class: "input", name, value: value || "",
      min: min, step: step
    }));
    return d;
  }
  function fldPct(name, label) {
    const d = el("div", { class: "field" });
    d.appendChild(el("label", null, label));
    d.appendChild(el("input", {
      type: "number", class: "input", name,
      min: "0", max: "100", step: "0.01", placeholder: "0–100"
    }));
    return d;
  }
  function selPres(name, label, productos) {
    const d = el("div", { class: "field" });
    d.appendChild(el("label", null, label));
    const s = el("select", { class: "select", name });
    s.appendChild(el("option", { value: "" }, "— Seleccione —"));
    productos.forEach(p => {
      const label = `${p.codigo ? p.codigo + " · " : ""}${p.nombre}${p.calidad && p.calidad !== "N/A" ? " (" + p.calidad + ")" : ""}`;
      s.appendChild(el("option", { value: p.nombre }, label));
    });
    d.appendChild(s);
    return d;
  }
  function selResp(name, label, responsables) {
    const d = el("div", { class: "field" });
    d.appendChild(el("label", null, label));
    const s = el("select", { class: "select", name });
    s.appendChild(el("option", { value: "" }, "—"));
    responsables.forEach(r => s.appendChild(el("option", { value: r }, r)));
    d.appendChild(s);
    return d;
  }
  function selSiNo(name, label) {
    const d = el("div", { class: "field" });
    d.appendChild(el("label", null, label));
    const seg = el("div", { class: "segmented sm" });
    [["SI","Sí"],["NO","No"],["NA","N/A"]].forEach(([v,l]) => {
      const id = `${name}-${v}`;
      seg.appendChild(el("input", { type: "radio", name, id, value: v }));
      seg.appendChild(el("label", { for: id }, l));
    });
    d.appendChild(seg);
    return d;
  }

  // ---------- observaciones ----------
  function sectionObservaciones() {
    const box = el("section", { class: "section" });
    box.appendChild(el("h3", null, "Observaciones"));
    box.appendChild(el("textarea", {
      class: "textarea", name: "observaciones", placeholder: "Escriba observaciones si las hay…"
    }));
    return box;
  }

  // ---------- firmas ----------
  function sectionFirmas(sec) {
    const box = el("section", { class: "section" });
    box.appendChild(el("h3", null, "Firmas"));
    const grid = el("div", { class: "two-col" });
    for (const f of sec.fields) {
      grid.appendChild(el("div", { class: "field" },
        el("label", null, f.label),
        el("input", { class: "input", type: "text", name: `firma__${f.id}`, placeholder: "Nombre completo" })
      ));
    }
    box.appendChild(grid);
    return box;
  }

  // ---------- info ----------
  function sectionInfo(sec) {
    const box = el("section", { class: "section" });
    if (sec.title) box.appendChild(el("h3", null, sec.title));
    sec.lines.forEach(line => box.appendChild(el("p", { style: "margin:6px 0;font-size:13px;color:var(--ink-muted)" }, line)));
    return box;
  }

  // ---------- main ----------
  function renderForm(schema, container) {
    container.innerHTML = "";
    const header = el("header", { class: "form-header" });
    header.appendChild(el("p", { class: "code" }, schema.code + " · v" + schema.version));
    header.appendChild(el("h2", null, schema.title));
    header.appendChild(el("div", { class: "meta" },
      `Arrocera Liborio S.A. · Emisión ${schema.emision} · Revisión ${schema.revision}`));
    container.appendChild(header);

    const form = el("form", { id: "sig-form", autocomplete: "off" });
    schema.sections.forEach(sec => {
      let node;
      switch (sec.type) {
        case "fields":                 node = sectionFields(sec); break;
        case "radio-area":             node = sectionRadioArea(sec); break;
        case "checklist":              node = sectionChecklist(sec); break;
        case "daily-checks":           node = sectionDailyChecks(sec); break;
        case "daily-activity-matrix":  node = sectionActivityMatrix(sec); break;
        case "epp-grid":               node = sectionEppGrid(sec); break;
        case "evaluacion-grid":        node = sectionEvalGrid(sec); break;
        case "produccion":             node = sectionProduccion(sec); break;
        case "observaciones":          node = sectionObservaciones(); break;
        case "firmas":                 node = sectionFirmas(sec); break;
        case "info":                   node = sectionInfo(sec); break;
        default: node = el("div", null, `[sección desconocida: ${sec.type}]`);
      }
      form.appendChild(node);
    });

    const actions = el("div", { class: "form-actions" });
    actions.appendChild(el("button", {
      type: "button", class: "btn btn-ghost btn-block",
      onclick: () => App.goSelect()
    }, "Cancelar"));
    actions.appendChild(el("button", {
      type: "submit", class: "btn btn-primary btn-block"
    }, "Guardar"));
    form.appendChild(actions);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = collectData(form, schema);
      App.handleSave(schema, data);
    });

    container.appendChild(form);
  }

  // ---------- collection ----------
  function collectData(form, schema) {
    const fd = new FormData(form);
    const obj = {};

    // Gather by name patterns
    for (const [name, value] of fd.entries()) {
      obj[name] = value;
    }

    // checklist__idx => array ordered
    const checklist = [];
    schema.sections
      .filter(s => s.type === "checklist")
      .forEach(sec => {
        sec.items.forEach((item, idx) => {
          checklist.push({
            idx: idx + 1,
            item,
            valor: obj[`checklist__${idx}`] || ""
          });
          delete obj[`checklist__${idx}`];
        });
      });
    if (checklist.length) obj._checklist = checklist;

    return obj;
  }

  return { renderForm, weekInfo, todayISO };
})();
