// ---------------------------------------------------------------------------
// Editor de formularios (solo administradores).
//
// Permite modificar los formularios desde la app sin tocar el código: los
// cambios se guardan como "overrides" en la base de datos y reemplazan al
// esquema del código al cargar la aplicación. Cada tipo de sección expone sus
// partes editables (títulos, ítems, opciones, columnas…) de forma estructurada,
// con vista previa en vivo y opción de restaurar el original.
// ---------------------------------------------------------------------------
const Editor = (() => {

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function input(value, cls) {
    const i = document.createElement("input");
    i.type = "text"; i.className = cls || "input";
    if (value != null) i.value = value;
    return i;
  }
  function textarea(value, rows) {
    const t = document.createElement("textarea");
    t.className = "textarea"; t.rows = rows || 4;
    if (value != null) t.value = value;
    return t;
  }
  function btn(label, cls, onClick) {
    const b = el("button", cls || "btn btn-sm", label);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }
  function fieldWrap(label, widget) {
    const w = el("div", "field");
    w.appendChild(el("label", null, label));
    w.appendChild(widget);
    return w;
  }
  const lines = v => String(v || "").split("\n").map(s => s.trim()).filter(Boolean);

  // Estado del editor.
  let working = null;      // copia de trabajo (se muta al guardar cada widget)
  let collectors = [];     // funciones que vuelcan la UI a `working`
  let overrides = {};      // formId -> info (para saber cuáles están editados)
  let host = null;         // contenedor raíz

  const SECTION_LABEL = {
    "fields": "Campos", "radio-area": "Selector de área", "checklist": "Lista de verificación",
    "daily-checks": "Chequeos", "daily-activity-matrix": "Matriz de actividades",
    "material-list": "Lista de ítems", "repeater-table": "Tabla repetible",
    "checkbox-list": "Casillas", "epp-grid": "Cuadro EPP", "evaluacion-grid": "Aspectos evaluados",
    "produccion": "Producción", "observaciones": "Observaciones", "firmas": "Firmas", "info": "Texto informativo"
  };
  const FIELD_TYPES = ["text", "number", "date", "time", "select", "textarea"];
  const COL_TYPES = ["text", "number", "date", "time", "select", "radio", "textarea", "checkbox"];

  function collect() { collectors.forEach(fn => { try { fn(); } catch (_) {} }); }

  function optionsToText(opts) {
    return (opts || []).map(o => typeof o === "string" ? o : `${o.value}:${o.label}`).join("\n");
  }
  function textToOptions(t) {
    return lines(t).map(l => {
      const i = l.indexOf(":");
      return i > 0 ? { value: l.slice(0, i).trim(), label: l.slice(i + 1).trim() } : l;
    });
  }

  // ---------------- editores por tipo de sección ----------------
  function editFields(sec, body) {
    const list = el("div", "ed-rows");
    body.appendChild(list);
    function row(f) {
      const r = el("div", "ed-row");
      const lab = input(f.label, "input ed-grow");
      const type = document.createElement("select"); type.className = "select ed-type";
      FIELD_TYPES.forEach(t => { const o = el("option", null, t); o.value = t; if ((f.type || "text") === t) o.selected = true; type.appendChild(o); });
      const req = document.createElement("input"); req.type = "checkbox"; req.checked = !!f.required; req.title = "Obligatorio";
      const opts = textarea(Array.isArray(f.options) ? f.options.join("\n") : "", 2);
      opts.placeholder = "Opciones (una por línea)";
      opts.style.display = (f.type === "select") ? "" : "none";
      type.addEventListener("change", () => { opts.style.display = type.value === "select" ? "" : "none"; });
      const del = btn("✕", "btn btn-sm btn-icon btn-danger", () => { r._deleted = true; r.remove(); });
      del.title = "Eliminar campo";
      [lab, type, req, del].forEach(x => r.appendChild(x));
      r.appendChild(opts);
      r._collect = () => r._deleted ? null : {
        ...f, label: lab.value.trim() || f.label, type: type.value,
        required: req.checked || undefined,
        options: type.value === "select" ? lines(opts.value) : undefined
      };
      list.appendChild(r);
    }
    (sec.fields || []).forEach(row);
    body.appendChild(btn("+ Agregar campo", "btn btn-sm", () => {
      const id = prompt("Identificador del campo (sin espacios, ej. numeroLote):");
      if (!id || !/^[A-Za-z][A-Za-z0-9_]*$/.test(id)) return;
      row({ id, label: id, type: "text" });
    }));
    collectors.push(() => {
      sec.fields = [...list.children].map(r => r._collect && r._collect()).filter(Boolean);
    });
  }

  function editSimpleList(sec, body, prop, label, toText, fromText) {
    const t = textarea(toText(sec[prop]), Math.min(14, Math.max(4, (sec[prop] || []).length + 1)));
    body.appendChild(fieldWrap(label, t));
    collectors.push(() => { sec[prop] = fromText(t.value); });
  }

  function editColumns(sec, body) {
    const list = el("div", "ed-rows");
    body.appendChild(list);
    function row(c) {
      const r = el("div", "ed-row");
      const lab = input(c.label, "input ed-grow");
      const type = document.createElement("select"); type.className = "select ed-type";
      COL_TYPES.forEach(t => { const o = el("option", null, t); o.value = t; if ((c.type || "text") === t) o.selected = true; type.appendChild(o); });
      const opts = textarea(optionsToText(c.options), 2);
      opts.placeholder = "Opciones (una por línea, o valor:Etiqueta)";
      const showOpts = () => { opts.style.display = (type.value === "select" || type.value === "radio") ? "" : "none"; };
      showOpts(); type.addEventListener("change", showOpts);
      const del = btn("✕", "btn btn-sm btn-icon btn-danger", () => { r._deleted = true; r.remove(); });
      del.title = "Eliminar columna";
      [lab, type, del].forEach(x => r.appendChild(x));
      r.appendChild(opts);
      r._collect = () => r._deleted ? null : {
        ...c, label: lab.value.trim() || c.label, type: type.value,
        options: (type.value === "select" || type.value === "radio") ? textToOptions(opts.value) : undefined
      };
      list.appendChild(r);
    }
    (sec.columns || []).forEach(row);
    body.appendChild(btn("+ Agregar columna", "btn btn-sm", () => {
      const key = prompt("Clave de la columna (sin espacios, ej. numeroLote):");
      if (!key || !/^[A-Za-z][A-Za-z0-9_]*$/.test(key)) return;
      row({ key, label: key, type: "text" });
    }));
    collectors.push(() => {
      sec.columns = [...list.children].map(r => r._collect && r._collect()).filter(Boolean);
    });
  }

  function editItems(sec, body) {
    // material-list: items {codigo, desc} como "codigo | descripción"
    const t = textarea((sec.items || []).map(i => `${i.codigo || ""} | ${i.desc || ""}`).join("\n"),
      Math.min(16, Math.max(4, (sec.items || []).length + 1)));
    body.appendChild(fieldWrap("Ítems (código | descripción — uno por línea)", t));
    collectors.push(() => {
      sec.items = lines(t.value).map(l => {
        const i = l.indexOf("|");
        return i >= 0 ? { codigo: l.slice(0, i).trim(), desc: l.slice(i + 1).trim() } : { codigo: "", desc: l };
      });
    });
  }

  function editMatrixRows(sec, body) {
    // daily-activity-matrix: grupos con "## Nombre", filas "label | equipo".
    let text = "";
    if (sec.groups) {
      sec.groups.forEach(g => {
        text += `## ${g.name}\n`;
        (g.rows || []).forEach(r => { text += `${r.label} | ${r.equipo || ""}\n`; });
      });
    } else {
      (sec.rows || []).forEach(r => {
        text += (typeof r === "string") ? `${r}\n` : `${r.label} | ${r.equipo || ""}\n`;
      });
    }
    const t = textarea(text.trim(), Math.min(18, Math.max(5, text.split("\n").length + 1)));
    body.appendChild(fieldWrap('Filas ("etiqueta | equipo"; use "## Grupo" para encabezados)', t));
    collectors.push(() => {
      const ls = lines(t.value);
      if (ls.some(l => l.startsWith("##"))) {
        const groups = []; let cur = null;
        ls.forEach(l => {
          if (l.startsWith("##")) { cur = { name: l.replace(/^#+\s*/, ""), rows: [] }; groups.push(cur); }
          else {
            if (!cur) { cur = { name: "", rows: [] }; groups.push(cur); }
            const i = l.indexOf("|");
            cur.rows.push(i >= 0 ? { label: l.slice(0, i).trim(), equipo: l.slice(i + 1).trim() } : { label: l, equipo: "" });
          }
        });
        sec.groups = groups; delete sec.rows;
      } else {
        sec.rows = ls.map(l => {
          const i = l.indexOf("|");
          return i >= 0 ? { label: l.slice(0, i).trim(), equipo: l.slice(i + 1).trim() } : l;
        });
        delete sec.groups;
      }
    });
  }

  function sectionCard(sec, idx, secList) {
    const card = el("div", "ed-section");
    const head = el("div", "ed-section-head");
    head.appendChild(el("span", "ed-section-type", SECTION_LABEL[sec.type] || sec.type));
    const controls = el("div", "ed-section-controls");
    controls.appendChild(btn("↑", "btn btn-sm btn-icon", () => moveSection(idx, -1)));
    controls.appendChild(btn("↓", "btn btn-sm btn-icon", () => moveSection(idx, +1)));
    controls.appendChild(btn("✕", "btn btn-sm btn-icon btn-danger", () => {
      if (!confirm("¿Eliminar esta sección del formulario?")) return;
      secList.splice(idx, 1); renderFormEditor();
    }));
    head.appendChild(controls);
    card.appendChild(head);
    const body = el("div", "ed-section-body");
    card.appendChild(body);

    if ("title" in sec || ["fields", "checklist", "material-list", "repeater-table", "info", "checkbox-list", "evaluacion-grid", "daily-checks", "daily-activity-matrix", "radio-area"].indexOf(sec.type) >= 0) {
      const t = input(sec.title || "", "input");
      body.appendChild(fieldWrap("Título de la sección", t));
      collectors.push(() => { if (t.value.trim()) sec.title = t.value.trim(); else delete sec.title; });
    }
    if ("note" in sec || ["checklist", "material-list", "repeater-table", "daily-checks", "daily-activity-matrix", "evaluacion-grid", "checkbox-list"].indexOf(sec.type) >= 0) {
      const n = textarea(sec.note || "", 2);
      body.appendChild(fieldWrap("Nota (se muestra bajo el título)", n));
      collectors.push(() => { if (n.value.trim()) sec.note = n.value.trim(); else delete sec.note; });
    }

    switch (sec.type) {
      case "fields": editFields(sec, body); break;
      case "checklist": editSimpleList(sec, body, "items", "Ítems (uno por línea)", v => (v || []).join("\n"), lines); break;
      case "checkbox-list": editSimpleList(sec, body, "items", "Ítems (uno por línea)", v => (v || []).join("\n"), lines); break;
      case "info": editSimpleList(sec, body, "lines", "Líneas de texto (una por línea)", v => (v || []).join("\n"), lines); break;
      case "evaluacion-grid": editSimpleList(sec, body, "aspectos", "Aspectos (uno por línea)", v => (v || []).join("\n"), lines); break;
      case "radio-area": editSimpleList(sec, body, "options", "Opciones de área (una por línea)", v => (v || []).join("\n"), lines); break;
      case "material-list": editItems(sec, body); editColumns(sec, body); break;
      case "repeater-table": editColumns(sec, body); break;
      case "daily-checks":
        editSimpleList(sec, body, "rows", 'Filas ("etiqueta | valor" una por línea)',
          v => (v || []).map(r => `${r.label} | ${r.valor || ""}`).join("\n"),
          t => lines(t).map(l => { const i = l.indexOf("|"); return i >= 0 ? { label: l.slice(0, i).trim(), valor: l.slice(i + 1).trim() } : { label: l, valor: "" }; }));
        break;
      case "daily-activity-matrix": editMatrixRows(sec, body); break;
      default:
        body.appendChild(el("p", "ed-fixed", "Esta sección no tiene opciones editables."));
    }
    return card;
  }

  function moveSection(idx, dir) {
    collect();
    const s = working.sections;
    const j = idx + dir;
    if (j < 0 || j >= s.length) return;
    const tmp = s[idx]; s[idx] = s[j]; s[j] = tmp;
    renderFormEditor();
  }

  // ---------------- metadatos + render principal ----------------
  function allAreas() {
    const set = new Set();
    FORMS.forEach(f => (Array.isArray(f.area) ? f.area : [f.area || "Calidad"]).forEach(a => set.add(a)));
    return [...set].sort();
  }

  function renderFormEditor() {
    collectors = [];
    const zone = host.querySelector(".ed-zone");
    zone.innerHTML = "";
    if (!working) return;

    const meta = el("div", "ed-section");
    meta.appendChild(el("div", "ed-section-head")).appendChild(el("span", "ed-section-type", "Datos del formulario"));
    const mb = el("div", "ed-section-body two-col");
    const fTitle = input(working.title); mb.appendChild(fieldWrap("Título", fTitle));
    const fShort = input(working.shortTitle); mb.appendChild(fieldWrap("Título corto (tarjeta)", fShort));
    const fDesc = input(working.desc); mb.appendChild(fieldWrap("Descripción", fDesc));
    const fIcon = input(working.icon); mb.appendChild(fieldWrap("Ícono (emoji)", fIcon));
    const fVer = input(String(working.version || 1)); mb.appendChild(fieldWrap("Versión", fVer));
    const fRev = input(working.revision); mb.appendChild(fieldWrap("Revisión (ej. Jul-2026)", fRev));
    meta.appendChild(mb);
    // Áreas
    const areasWrap = el("div", "ed-section-body");
    areasWrap.appendChild(el("label", "areas-label", "Áreas donde aparece"));
    const grid = el("div", "areas-checkbox-grid");
    const current = new Set(Array.isArray(working.area) ? working.area : [working.area || "Calidad"]);
    const cbs = {};
    allAreas().forEach(a => {
      const lbl = el("label", "area-checkbox");
      const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = current.has(a);
      cbs[a] = cb;
      lbl.appendChild(cb); lbl.appendChild(el("span", null, " " + a));
      grid.appendChild(lbl);
    });
    areasWrap.appendChild(grid);
    meta.appendChild(areasWrap);
    collectors.push(() => {
      working.title = fTitle.value.trim() || working.title;
      working.shortTitle = fShort.value.trim() || working.shortTitle;
      working.desc = fDesc.value.trim();
      working.icon = fIcon.value.trim() || working.icon;
      const v = parseInt(fVer.value, 10); if (!isNaN(v)) working.version = v;
      working.revision = fRev.value.trim() || working.revision;
      const sel = Object.keys(cbs).filter(a => cbs[a].checked);
      working.area = sel.length === 1 ? sel[0] : (sel.length ? sel : working.area);
    });
    zone.appendChild(meta);

    working.sections.forEach((sec, i) => zone.appendChild(sectionCard(sec, i, working.sections)));

    const addBar = el("div", "ed-addbar");
    [["fields", "Campos"], ["checklist", "Lista de verificación"], ["info", "Texto informativo"], ["observaciones", "Observaciones"]].forEach(([type, label]) => {
      addBar.appendChild(btn("+ " + label, "btn btn-sm", () => {
        collect();
        const sec = type === "fields" ? { type, title: "Nueva sección", columns: 2, fields: [] }
          : type === "checklist" ? { type, title: "Nueva lista", options: [{ value: "SI", label: "Sí" }, { value: "NO", label: "No" }], items: [] }
          : type === "info" ? { type, title: "Información", lines: [] }
          : { type };
        working.sections.push(sec);
        renderFormEditor();
      }));
    });
    zone.appendChild(addBar);

    // Vista previa
    const prevWrap = el("div", "ed-preview");
    prevWrap.style.display = "none";
    zone.appendChild(prevWrap);

    const actions = el("div", "ed-actions");
    actions.appendChild(btn("Vista previa", "btn", () => {
      collect();
      if (prevWrap.style.display === "none") {
        prevWrap.style.display = "";
        prevWrap.innerHTML = "";
        try {
          Render.renderForm(working, prevWrap, { onSubmit: () => {}, onCancel: () => {}, submitLabel: "(vista previa)" });
        } catch (e) {
          prevWrap.appendChild(el("div", "empty", "Error al previsualizar: " + e.message));
        }
      } else {
        prevWrap.style.display = "none";
      }
    }));
    if (overrides[working.id]) {
      actions.appendChild(btn("Restaurar original", "btn btn-danger", async () => {
        if (!confirm("¿Descartar la versión editada y volver al formulario original del sistema?")) return;
        try {
          await Store.deleteFormOverride(working.id);
          location.reload();
        } catch (e) { alert(e.message || "No se pudo restaurar"); }
      }));
    }
    actions.appendChild(btn("Guardar cambios", "btn btn-primary", async () => {
      collect();
      try {
        Render.renderForm(working, document.createElement("div"), { onSubmit: () => {}, onCancel: () => {} });
      } catch (e) {
        alert("El formulario tiene un problema y no se puede guardar: " + e.message);
        return;
      }
      try {
        await Store.saveFormOverride(working.id, working);
        // Aplica en vivo sobre el catálogo cargado.
        const i = FORMS.findIndex(f => f.id === working.id);
        if (i >= 0) FORMS[i] = JSON.parse(JSON.stringify(working));
        overrides[working.id] = { updatedAt: new Date().toISOString() };
        alert("Formulario guardado. Los cambios ya están activos.");
        renderPicker();
      } catch (e) { alert(e.message || "No se pudo guardar"); }
    }));
    zone.appendChild(actions);
  }

  function renderPicker() {
    const pick = host.querySelector(".ed-pick");
    pick.innerHTML = "";
    const sel = document.createElement("select");
    sel.className = "select";
    const o0 = el("option", null, "— Seleccione un formulario —"); o0.value = "";
    sel.appendChild(o0);
    FORMS.slice().sort((a, b) => a.code.localeCompare(b.code)).forEach(f => {
      const o = el("option", null, `${f.code} · ${f.shortTitle}` + (overrides[f.id] ? " (editado)" : ""));
      o.value = f.id;
      if (working && working.id === f.id) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", () => {
      const f = FORMS.find(x => x.id === sel.value);
      working = f ? JSON.parse(JSON.stringify(f)) : null;
      renderFormEditor();
    });
    pick.appendChild(fieldWrap("Formulario a editar", sel));
  }

  async function render(container) {
    host = container;
    working = null;
    container.appendChild(el("p", "page-sub",
      "Edite títulos, ítems, opciones y secciones. Los cambios se guardan aparte del código y puede restaurar el original cuando quiera."));
    try { overrides = await Store.formOverrides(); } catch (_) { overrides = {}; }
    container.appendChild(el("div", "ed-pick"));
    container.appendChild(el("div", "ed-zone"));
    renderPicker();
  }

  return { render };
})();
