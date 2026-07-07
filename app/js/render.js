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

  // Opciones del render en curso (modo solo-lectura, datos guardados).
  let currentOpts = {};

  // Cuántas filas de un repeater reconstruir a partir de los datos guardados.
  function repeaterRowCount(prefix) {
    const data = currentOpts.data;
    if (!data) return 1;
    let max = -1;
    const esc = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("^" + esc + "(\\d+)__");
    for (const k in data) { const m = k.match(re); if (m) max = Math.max(max, +m[1]); }
    return max >= 0 ? max + 1 : 1;
  }

  // Rellena los campos del formulario con los datos guardados.
  function fillFromData(form, data) {
    data = data || {};
    const cl = {};
    (data._checklist || []).forEach(c => { cl["checklist__" + (c.idx - 1)] = c.valor; });
    form.querySelectorAll("input, select, textarea").forEach(node => {
      const name = node.getAttribute("name");
      if (!name) return;
      let val = data[name];
      if (val === undefined && cl[name] !== undefined) val = cl[name];
      const type = (node.getAttribute("type") || "").toLowerCase();
      if (type === "radio") {
        if (val !== undefined && node.value === String(val)) node.checked = true;
      } else if (type === "checkbox") {
        if (val !== undefined && val !== null && val !== "" && val !== false) {
          if (!node.value || node.value === "on" || node.value === String(val)) node.checked = true;
        }
      } else if (val !== undefined && val !== null) {
        node.value = val;
      }
    });
  }

  // Deshabilita todos los controles y elimina botones interactivos.
  function disableForm(form) {
    form.querySelectorAll("input, select, textarea").forEach(node => {
      node.setAttribute("disabled", "");
      node.disabled = true;
    });
    form.querySelectorAll(".add-row, .row-del").forEach(b => b.remove());
  }

  // Campos de identificación que ya se conocen por la sesión del usuario.
  function isAutoFilledField(f) {
    if (!f || !f.id) return false;
    return /^(encargado|responsable|realizado[_-]?por)$/i.test(f.id);
  }

  // Las listas que apuntan a `RESPONSABLES` se llenan a mano: ya no hay una
  // lista fija de responsables (los usuarios cambian).
  function isResponsablesList(opts) {
    return typeof RESPONSABLES !== "undefined" && opts === RESPONSABLES;
  }

  // Convierte una sección con título en un bloque colapsable.
  function makeCollapsible(section) {
    const h = section.children[0];
    if (!h || String(h.tagName).toLowerCase() !== "h3") return;
    section.className += " collapsible";
    h.appendChild(el("span", { class: "sec-chevron" }, "▾"));
    h.addEventListener("click", () => {
      section.className = section.className.indexOf("collapsed") >= 0
        ? section.className.replace(/\s*collapsed/, "")
        : section.className + " collapsed";
    });
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

  // Listas de referencia según el nombre del campo:
  //   "presentacion*"           → Presentaciones Liborio
  //   "empleado" / "*colaborador*" → Empleados activos
  function refListFor(idOrKey) {
    const k = String(idOrKey || "").toLowerCase();
    if (typeof PRESENTACIONES_LIBORIO !== "undefined" && /presentacion/.test(k)) return PRESENTACIONES_LIBORIO;
    if (typeof EMPLEADOS_ACTIVOS !== "undefined" && (k === "empleado" || /colaborador/.test(k))) return EMPLEADOS_ACTIVOS;
    return null;
  }
  // Combo de referencia buscable: input + datalist. A diferencia del <select>
  // nativo (que solo salta por el inicio del texto — el primer apellido), el
  // datalist filtra por coincidencia de caracteres en cualquier parte, así que
  // se puede buscar por nombre, presentación, etc.
  let refComboSeq = 0;
  function buildRefCombo(name, id, options, opts) {
    opts = opts || {};
    const listId = "refdl-" + (++refComboSeq);
    const iattrs = {
      name, class: "input", type: "text", list: listId,
      autocomplete: "off", placeholder: opts.placeholder || "Escriba para buscar…"
    };
    if (id) iattrs.id = id;
    if (opts.required) iattrs.required = true;
    const input = el("input", iattrs);
    if (opts.value != null && opts.value !== "") input.value = opts.value;
    const datalist = el("datalist", { id: listId });
    options.forEach(o => datalist.appendChild(el("option", { value: o })));
    return el("span", { class: "ref-combo" }, input, datalist);
  }

  // ---------- field ----------
  function renderField(field) {
    const labelHtml = field.label + (field.required ? ' <span class="req">*</span>' : "");
    const wrap = el("div", { class: "field" });
    wrap.appendChild(el("label", { html: labelHtml, for: field.id }));

    const refList = refListFor(field.id);
    if (refList) {
      wrap.appendChild(buildRefCombo(field.id, field.id, refList,
        { required: field.required, value: field.default }));
      return wrap;
    }

    let input;
    if (field.type === "select" && isResponsablesList(field.options)) {
      // El listado de responsables ya no se ofrece — se llena manualmente.
      input = el("input", {
        id: field.id, name: field.id, class: "input", type: "text",
        placeholder: field.placeholder || ""
      });
    } else if (field.type === "select") {
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
        min: field.min, max: field.max,
        // Permitir decimales por defecto en inputs numéricos.
        step: field.step || (field.type === "number" ? "any" : undefined)
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
    if (sec.note) box.appendChild(el("div", { class: "note" }, sec.note));
    const grid = el("div", { class: sec.columns === 2 ? "two-col" : "" });
    const fields = (sec.fields || []).filter(f => !isAutoFilledField(f));
    for (const f of fields) grid.appendChild(renderField(f));
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
    trh.appendChild(el("th", { style: "text-align:center" }, "Cumplimiento"));
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = el("tbody");
    sec.rows.forEach((row, rIdx) => {
      const tr = el("tr");
      tr.appendChild(el("td", { class: "aspect" }, `${row.label}`, el("div", { class: "meta", style: "font-size:11px;color:var(--ink-muted);margin-top:2px" }, row.valor)));
      const td = el("td", { style: "text-align:center" });
      const seg = el("div", { class: "segmented sm", style: "justify-content:center" });
      for (const opt of sec.options) {
        const name = `daily__${rIdx}`;
        const id = `${name}-${opt.value}`;
        seg.appendChild(el("input", { type: "radio", name, id, value: opt.value }));
        seg.appendChild(el("label", { for: id }, opt.label));
      }
      td.appendChild(seg);
      tr.appendChild(td);
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
    trh.appendChild(el("th", { style: "text-align:center" }, "Estado"));
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = el("tbody");
    let rIdx = 0;
    function dataRow(label, equipo) {
      const tr = el("tr");
      const cell = el("td", { class: "aspect" }, `${rIdx + 1}. ${label}`);
      if (equipo) cell.appendChild(el("div", { class: "meta", style: "font-size:11px;color:var(--ink-muted);margin-top:2px" }, equipo));
      tr.appendChild(cell);
      const myIdx = rIdx;
      const td = el("td", { class: "day-cell" });
      const stack = el("div", { class: "stack" });
      sec.columns.forEach((col) => {
        const line = el("label", { class: "check-inline", style: "display:flex;align-items:center;gap:6px;font-size:12px" });
        const cb = el("input", { type: "checkbox", name: `ldd__${myIdx}__${col.key}` });
        line.appendChild(cb);
        line.appendChild(el("span", null, col.label));
        stack.appendChild(line);
      });
      td.appendChild(stack);
      tr.appendChild(td);
      tbody.appendChild(tr);
      rIdx++;
    }
    if (sec.groups) {
      sec.groups.forEach((g) => {
        const trg = el("tr", { class: "group-row" });
        trg.appendChild(el("td", { colspan: "2", class: "group-head" }, g.name));
        tbody.appendChild(trg);
        g.rows.forEach((row) => dataRow(row.label, row.equipo));
      });
    } else {
      sec.rows.forEach((row) => {
        if (typeof row === "string") dataRow(row);
        else dataRow(row.label, row.equipo);
      });
    }
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

    const eppRows = repeaterRowCount("epp__");
    for (let i = 0; i < eppRows; i++) addEppRow(wrap, sec);
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
      (typeof EMPLEADOS_ACTIVOS !== "undefined")
        ? buildRefCombo(`epp__${idx}__colaborador`, null, EMPLEADOS_ACTIVOS, {})
        : el("input", { type: "text", class: "input", name: `epp__${idx}__colaborador`, placeholder: "Nombre completo" })
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
    trh.appendChild(el("th", { style: "text-align:center", "class": "subhead" }, "Evaluación"));
    trh.appendChild(el("th", { style: "text-align:center", "class": "subhead" }, "Descripción"));
    trh.appendChild(el("th", { style: "text-align:center", "class": "subhead" }, "Acción"));
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = el("tbody");
    sec.aspectos.forEach((aspecto, i) => {
      const tr = el("tr");
      tr.appendChild(el("td", { class: "aspect" }, `${i + 1}. ${aspecto}`));
      // Eval
      const tdEval = el("td", { style: "text-align:center" });
      const seg = el("div", { class: "segmented sm", style: "justify-content:center" });
      for (const opt of sec.options) {
        const name = `${keyPrefix}__${i}__val`;
        const id = `${name}-${opt.value}`;
        seg.appendChild(el("input", { type: "radio", name, id, value: opt.value }));
        seg.appendChild(el("label", { for: id }, opt.label));
      }
      tdEval.appendChild(seg);
      tr.appendChild(tdEval);
      // Desc
      tr.appendChild(el("td", null, el("input", {
        type: "text", class: "mini-input",
        name: `${keyPrefix}__${i}__desc`,
        placeholder: "—"
      })));
      // Acción
      tr.appendChild(el("td", null, el("input", {
        type: "text", class: "mini-input",
        name: `${keyPrefix}__${i}__accion`,
        placeholder: "—"
      })));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    box.appendChild(scroll);

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

    const prodRows = repeaterRowCount("prod__");
    for (let i = 0; i < prodRows; i++) addProdRow(wrap, sec);
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

    // Físicos / Organolépticos — de "metales" a "textura" son numéricos.
    row.appendChild(el("div", { class: "label", style: "margin-top:16px;color:var(--green-dark);font-weight:600" }, "Parámetros físicos y organolépticos"));
    const grid3 = el("div", { class: "two-col" });
    [
      ["metales",    "Metales"],
      ["vidrios",    "Vidrios"],
      ["impurezas",  "Impurezas"],
      ["apariencia", "Apariencia"],
      ["olor",       "Olor"],
      ["color",      "Color"],
      ["sabor",      "Sabor"],
      ["textura",    "Textura"]
    ].forEach(([k, lbl]) => grid3.appendChild(fld(`prod__${idx}__${k}`, lbl, "number", "", "0", "any")));
    grid3.appendChild(selSiNo(`prod__${idx}__alergenos`, "Alérgenos"));
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
  function selPres(name, label /*, productos (ignorado) */) {
    // Presentación desde la lista de referencia "Presentaciones Liborio".
    const d = el("div", { class: "field" });
    d.appendChild(el("label", null, label));
    const opts = (typeof PRESENTACIONES_LIBORIO !== "undefined") ? PRESENTACIONES_LIBORIO : [];
    d.appendChild(buildRefCombo(name, null, opts, {}));
    return d;
  }
  function selResp(name, label /*, responsables (ignorado) */) {
    // El nombre del responsable se llena a mano (sin listado predefinido).
    const d = el("div", { class: "field" });
    d.appendChild(el("label", null, label));
    d.appendChild(el("input", { type: "text", class: "input", name }));
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

  // ---------- generic field for repeater tables ----------
  function repField(name, col) {
    const d = el("div", { class: "field" });
    d.appendChild(el("label", null, col.label));
    const refList = refListFor(col.key);
    if (refList) {
      d.appendChild(buildRefCombo(name, null, refList, { value: col.default }));
    } else if (col.type === "select" && isResponsablesList(col.options)) {
      d.appendChild(el("input", { type: "text", class: "input", name, placeholder: col.placeholder || "" }));
    } else if (col.type === "select") {
      const s = el("select", { class: "select", name });
      s.appendChild(el("option", { value: "" }, "—"));
      (col.options || []).forEach(o => {
        const v = typeof o === "string" ? o : o.value;
        const l = typeof o === "string" ? o : o.label;
        s.appendChild(el("option", { value: v }, l));
      });
      d.appendChild(s);
    } else if (col.type === "radio") {
      const seg = el("div", { class: "segmented sm" });
      (col.options || []).forEach(o => {
        const v = typeof o === "string" ? o : o.value;
        const l = typeof o === "string" ? o : o.label;
        const id = `${name}-${v}`;
        seg.appendChild(el("input", { type: "radio", name, id, value: v }));
        seg.appendChild(el("label", { for: id }, l));
      });
      d.appendChild(seg);
    } else if (col.type === "textarea") {
      d.appendChild(el("textarea", { class: "textarea", name, placeholder: col.placeholder || "" }));
    } else {
      d.appendChild(el("input", {
        type: col.type || "text", class: "input", name,
        placeholder: col.placeholder || "",
        value: col.default === "today" ? todayISO() : (col.default || ""),
        min: col.min, max: col.max,
        step: col.step || (col.type === "number" ? "any" : undefined)
      }));
    }
    return d;
  }

  // ---------- section: material-list (fixed item list with inputs) ----------
  function sectionMaterialList(sec) {
    const box = el("section", { class: "section" });
    if (sec.title) box.appendChild(el("h3", null, sec.title));
    if (sec.note) box.appendChild(el("div", { class: "note" }, sec.note));

    const scroll = el("div", { class: "grid-scroll" });
    const table = el("table", { class: "grid-table" });
    const thead = el("thead");
    const trh = el("tr");
    if (sec.showCode !== false) trh.appendChild(el("th", null, "Código"));
    trh.appendChild(el("th", null, "Descripción"));
    sec.columns.forEach(c => trh.appendChild(el("th", { style: "text-align:center" }, c.label)));
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = el("tbody");
    sec.items.forEach((item, idx) => {
      const tr = el("tr");
      if (sec.showCode !== false) tr.appendChild(el("td", { class: "code-cell" }, item.codigo || ""));
      tr.appendChild(el("td", { class: "aspect" }, item.desc));
      const rowInputs = {};
      sec.columns.forEach(col => {
        const td = el("td");
        let inp;
        if (col.type === "checkbox") {
          inp = el("input", {
            type: "checkbox", class: "mini-checkbox",
            name: `${sec.id}__${idx}__${col.key}`,
            value: col.value || "1"
          });
          td.setAttribute("style", "text-align:center");
        } else if (col.type === "select") {
          inp = el("select", {
            class: "mini-input", name: `${sec.id}__${idx}__${col.key}`
          });
          inp.appendChild(el("option", { value: "" }, "—"));
          (col.options || []).forEach(o => {
            const v = typeof o === "string" ? o : o.value;
            const l = typeof o === "string" ? o : o.label;
            inp.appendChild(el("option", { value: v }, l));
          });
        } else {
          inp = el("input", {
            type: col.type || "number",
            class: "mini-input" + (col.compute ? " computed" : ""),
            name: `${sec.id}__${idx}__${col.key}`,
            min: col.type === "number" ? "0" : col.min,
            // Permitir decimales por defecto (sin step explícito el navegador exige enteros).
            step: col.step || ((col.type || "number") === "number" ? "any" : undefined),
            placeholder: "—"
          });
          if (col.compute) inp.setAttribute("readonly", "");
        }
        rowInputs[col.key] = inp;
        td.appendChild(inp);
        tr.appendChild(td);
      });
      // Recalculadora por columna calculada — reacciona a cambios en las
      // demás celdas de la fila (incluye checkboxes y selects).
      sec.columns.forEach(col => {
        if (!col.compute) return;
        const target = rowInputs[col.key];
        const recalc = () => {
          const env = {};
          let anyInput = false;
          Object.keys(rowInputs).forEach(k => {
            const inp = rowInputs[k];
            if (inp.type === "checkbox") {
              env[k] = inp.checked ? 1 : 0;
              if (inp.checked && k !== col.key) anyInput = true;
            } else {
              const v = inp.value;
              env[k] = parseFloat(v) || 0;
              if (v !== "" && k !== col.key) anyInput = true;
            }
          });
          if (!anyInput) { target.value = ""; return; }
          try {
            const fn = new Function(...Object.keys(env), "return (" + col.compute + ")");
            const r = fn(...Object.values(env));
            target.value = isFinite(r) ? String(r) : "";
          } catch { target.value = ""; }
        };
        target._recalc = recalc;
        Object.keys(rowInputs).forEach(k => {
          if (k !== col.key) {
            rowInputs[k].addEventListener("input", recalc);
            rowInputs[k].addEventListener("change", recalc);
          }
        });
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    box.appendChild(scroll);
    return box;
  }

  // ---------- section: repeater-table (add-row card list) ----------
  function sectionRepeaterTable(sec) {
    const box = el("section", { class: "section" });
    if (sec.title) box.appendChild(el("h3", null, sec.title));
    if (sec.note) box.appendChild(el("div", { class: "note" }, sec.note));

    const wrap = el("div", { class: "repeater", id: `${sec.id}-repeater` });
    box.appendChild(wrap);

    const addBtn = el("button", {
      type: "button", class: "btn btn-ghost add-row",
      onclick: () => addRepRow(wrap, sec)
    }, `+ Agregar ${sec.rowLabel || "fila"}`);
    box.appendChild(addBtn);

    const repRows = repeaterRowCount(sec.id + "__");
    for (let i = 0; i < repRows; i++) addRepRow(wrap, sec);
    return box;
  }

  function addRepRow(container, sec) {
    const idx = container.querySelectorAll(".repeater-row").length;
    const label = sec.rowLabel || "Fila";
    const row = el("div", { class: "repeater-row", "data-idx": idx });
    const head = el("div", { class: "row-head" });
    head.appendChild(el("div", { class: "row-num" }, `${label} ${idx + 1}`));
    head.appendChild(el("button", {
      type: "button", class: "row-del",
      onclick: () => { row.remove(); renumberRep(container, label); }
    }, "Eliminar"));
    row.appendChild(head);

    const grid = el("div", { class: sec.columns.length > 1 ? "two-col" : "" });
    sec.columns.forEach(col => {
      grid.appendChild(repField(`${sec.id}__${idx}__${col.key}`, col));
    });
    row.appendChild(grid);
    container.appendChild(row);
  }

  function renumberRep(container, label) {
    container.querySelectorAll(".repeater-row").forEach((r, i) => {
      r.setAttribute("data-idx", i);
      const num = r.querySelector(".row-num");
      if (num) num.textContent = `${label} ${i + 1}`;
    });
  }

  // ---------- section: checkbox-list (multi-select, optional quantity) ----------
  function sectionCheckboxList(sec) {
    const box = el("section", { class: "section" });
    if (sec.title) box.appendChild(el("h3", null, sec.title));
    if (sec.note) box.appendChild(el("div", { class: "note" }, sec.note));
    const list = el("div", { class: "checklist" });
    sec.items.forEach((item, idx) => {
      const row = el("div", { class: "check-row" });
      const lbl = el("label", { class: "check-inline", style: "display:flex;align-items:center;gap:8px;flex:1" });
      lbl.appendChild(el("input", { type: "checkbox", name: `${sec.id}__${idx}`, value: item }));
      lbl.appendChild(el("span", null, item));
      row.appendChild(lbl);
      if (sec.withQty) {
        row.appendChild(el("input", {
          type: "number", class: "mini-input", min: "0",
          name: `${sec.id}__${idx}__qty`, placeholder: "Cant."
        }));
      }
      list.appendChild(row);
    });
    box.appendChild(list);
    return box;
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
  function renderForm(schema, container, opts) {
    currentOpts = opts || {};
    const readonly = !!currentOpts.readonly;
    container.innerHTML = "";
    const header = el("header", { class: "form-header" });
    header.appendChild(el("p", { class: "code" }, schema.code + " · v" + schema.version));
    header.appendChild(el("h2", null, schema.title));
    header.appendChild(el("div", { class: "meta" },
      `Arrocera Liborio S.A. · Emisión ${schema.emision} · Revisión ${schema.revision}`));
    container.appendChild(header);

    const form = el("form", { id: "sig-form", autocomplete: "off" });

    // Segregación por área (ej. R-RDI-001): cuando el formulario está marcado
    // como `areaScoped` y se abre desde un área concreta, se oculta el selector
    // de área y solo se muestran las máquinas de esa área. El área se toma de
    // opts.area (al abrir) o de data.area (al ver un registro guardado). El
    // último token del área — "Calidad Pilado" → "Pilado" — es el valor interno.
    let scopedArea = null;
    if (schema.areaScoped) {
      const src = currentOpts.area || (currentOpts.data && currentOpts.data.area);
      if (src) scopedArea = String(src).trim().split(" ").pop();
    }

    let effectiveSections = (schema.sections || []).slice();
    if (scopedArea) {
      effectiveSections = [];
      (schema.sections || []).forEach(sec => {
        if (sec.type === "radio-area") return; // se elimina el selector
        if (sec.type === "checklist" && sec.scopeByArea) {
          const items = (sec.items || [])
            .filter(it => it.split(" — ")[0].trim() === scopedArea)
            .map(it => { const k = it.indexOf(" — "); return k >= 0 ? it.slice(k + 3) : it; });
          effectiveSections.push(Object.assign({}, sec, { items }));
        } else {
          effectiveSections.push(sec);
        }
      });
      // Guarda el área resuelta (el selector ya no existe).
      form.appendChild(el("input", { type: "hidden", name: "area", value: scopedArea }));
    }

    // Las firmas en papel ya no son necesarias: la aprobación queda registrada
    // por el usuario que llena (sesión) y los revisores que aprueban.
    const visibleSections = effectiveSections.filter(s => s.type !== "firmas");
    visibleSections.forEach(sec => {
      let node;
      switch (sec.type) {
        case "fields":                 node = sectionFields(sec); break;
        case "radio-area":             node = sectionRadioArea(sec); break;
        case "checklist":              node = sectionChecklist(sec); break;
        case "daily-checks":           node = sectionDailyChecks(sec); break;
        case "daily-activity-matrix":  node = sectionActivityMatrix(sec); break;
        case "material-list":          node = sectionMaterialList(sec); break;
        case "repeater-table":         node = sectionRepeaterTable(sec); break;
        case "checkbox-list":          node = sectionCheckboxList(sec); break;
        case "epp-grid":               node = sectionEppGrid(sec); break;
        case "evaluacion-grid":        node = sectionEvalGrid(sec); break;
        case "produccion":             node = sectionProduccion(sec); break;
        case "observaciones":          node = sectionObservaciones(); break;
        case "firmas":                 return; // se filtra arriba — se conserva por compatibilidad
        case "info":                   node = sectionInfo(sec); break;
        default: node = el("div", null, `[sección desconocida: ${sec.type}]`);
      }
      makeCollapsible(node);
      form.appendChild(node);
    });

    const opts0 = currentOpts;
    if (!readonly) {
      const actions = el("div", { class: "form-actions" });
      const cancelLabel = opts0.cancelLabel || "Cancelar";
      const submitLabel = opts0.submitLabel || "Guardar";
      const onCancel = opts0.onCancel || (() => App.goSelect());
      actions.appendChild(el("button", {
        type: "button", class: "btn btn-ghost btn-block",
        onclick: onCancel
      }, cancelLabel));
      actions.appendChild(el("button", {
        type: "submit", class: "btn btn-primary btn-block"
      }, submitLabel));
      form.appendChild(actions);

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = collectData(form, effectiveSections);
        if (opts0.onSubmit) opts0.onSubmit(data);
        else App.handleSave(schema, data);
      });
    }

    container.appendChild(form);

    if (opts0.data) fillFromData(form, opts0.data);
    if (readonly) disableForm(form);
    // Dispara las columnas calculadas (ej. saldo) después de prefill/edición.
    form.querySelectorAll("input.computed").forEach(inp => {
      if (typeof inp._recalc === "function") inp._recalc();
    });
    currentOpts = {};
  }

  // ---------- collection ----------
  // `sections` son las secciones efectivas realmente renderizadas (ya filtradas
  // por área si aplica), para que el índice del checklist coincida con el DOM.
  function collectData(form, sections) {
    const fd = new FormData(form);
    const obj = {};

    // Gather by name patterns
    for (const [name, value] of fd.entries()) {
      obj[name] = value;
    }

    // checklist__idx => array ordered
    const checklist = [];
    (sections || [])
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
