// ---------------------------------------------------------------------------
// Reportes — visualización agregada de los registros guardados.
//
// Cada reporte agrega los envíos de uno o varios formularios y dibuja su
// propio resumen. Para agregar un reporte nuevo basta con empujar otra entrada
// a REPORTS con su función `render`. El primer reporte cubre el R-PBM-001
// (cumplimiento por aspecto); paulatinamente se irán sumando los demás.
// ---------------------------------------------------------------------------
const Reports = (() => {

  // --- mini helper DOM (independiente de app.js) ---
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // SQLite guarda created_at en UTC sin marca; para fechas solo usamos el día.
  function dayOf(sub, dateKey) {
    const d = sub.data || {};
    if (dateKey && d[dateKey]) {
      const v = String(d[dateKey]).slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    }
    return String(sub.savedAt || "").slice(0, 10);
  }

  function fmtPct(n) { return (Math.round(n * 1000) / 10).toFixed(1) + "%"; }

  // -------------------------------------------------------------------------
  // Registro de reportes disponibles.
  // -------------------------------------------------------------------------
  const REPORTS = [
    {
      id: "pbm",
      label: "Preoperativo BPM (R-PBM-001)",
      desc: "Cumplimiento por aspecto: tasa de aceptación y rechazos con sus explicaciones.",
      formIds: ["PBM-001"],
      dateKey: "fechaInicio",
      render: renderEvalGridReport
    }
  ];

  function list() {
    // Solo muestra reportes cuyos formularios existan en el catálogo actual.
    return REPORTS.filter(r =>
      r.formIds.every(fid => typeof FORMS === "undefined" || FORMS.some(f => f.id === fid))
    );
  }
  function get(id) { return REPORTS.find(r => r.id === id); }

  // Filtra una lista de envíos por rango de fechas (inclusive). from/to son
  // strings YYYY-MM-DD o vacíos (sin límite por ese extremo).
  function filterByDate(report, subs, from, to) {
    return subs.filter(s => {
      const day = dayOf(s, report.dateKey);
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    });
  }

  // -------------------------------------------------------------------------
  // Reporte genérico para formularios cuyo dato vive en secciones
  // `evaluacion-grid` (PBM, PBP, …). Agrega por aspecto: cuántos AC, cuántos
  // RE (con sus descripciones/acciones) y el % de aceptación.
  // -------------------------------------------------------------------------
  function renderEvalGridReport(container, subs, opts) {
    const report = opts.report;

    // Junta las secciones evaluacion-grid de los formularios del reporte.
    const sections = [];
    report.formIds.forEach(fid => {
      const form = (typeof FORMS !== "undefined") && FORMS.find(f => f.id === fid);
      if (!form) return;
      (form.sections || []).filter(s => s.type === "evaluacion-grid").forEach(s => {
        sections.push({ form, sec: s, keyPrefix: s.key ? "eval-" + s.key : "eval" });
      });
    });

    // Acumula por texto de aspecto (mezcla el mismo aspecto entre formularios).
    const order = [];
    const byAspecto = new Map(); // texto -> { ac, re, na, rejections:[] }
    subs.forEach(sub => {
      sections.forEach(({ form, sec, keyPrefix }) => {
        if (sub.formId !== form.id) return;
        (sec.aspectos || []).forEach((aspecto, i) => {
          const data = sub.data || {};
          const val = data[`${keyPrefix}__${i}__val`];
          if (!val) return;
          if (!byAspecto.has(aspecto)) { byAspecto.set(aspecto, { ac: 0, re: 0, na: 0, rejections: [] }); order.push(aspecto); }
          const a = byAspecto.get(aspecto);
          if (val === "AC") a.ac++;
          else if (val === "RE") {
            a.re++;
            a.rejections.push({
              fecha: dayOf(sub, report.dateKey),
              area: data.area || "—",
              desc: data[`${keyPrefix}__${i}__desc`] || "",
              accion: data[`${keyPrefix}__${i}__accion`] || "",
              by: sub.savedByName || "—"
            });
          } else if (val === "NA") a.na++;
        });
      });
    });

    const rows = order.map(text => {
      const a = byAspecto.get(text);
      const evaluated = a.ac + a.re;
      return { text, ac: a.ac, re: a.re, na: a.na, evaluated, rate: evaluated ? a.ac / evaluated : null, rejections: a.rejections };
    });

    // ---- resumen global ----
    const totalAc = rows.reduce((n, r) => n + r.ac, 0);
    const totalRe = rows.reduce((n, r) => n + r.re, 0);
    const totalEval = totalAc + totalRe;
    const globalRate = totalEval ? totalAc / totalEval : null;

    container.innerHTML = "";

    if (!subs.length) {
      container.appendChild(el("div", "empty", "No hay registros de este formulario en el rango seleccionado."));
      return;
    }

    const summary = el("div", "report-summary");
    function stat(label, value) {
      const box = el("div", "report-stat");
      box.appendChild(el("div", "report-stat-value", value));
      box.appendChild(el("div", "report-stat-label", label));
      return box;
    }
    summary.appendChild(stat("Registros", String(subs.length)));
    summary.appendChild(stat("Evaluaciones", String(totalEval)));
    summary.appendChild(stat("Aceptados", String(totalAc)));
    summary.appendChild(stat("Rechazos", String(totalRe)));
    summary.appendChild(stat("% Aceptación", globalRate == null ? "—" : fmtPct(globalRate)));
    container.appendChild(summary);

    // ---- tabla por aspecto ----
    const wrap = el("div", "table-wrap");
    const table = el("table", "data-table report-table");
    table.innerHTML =
      "<thead><tr><th>#</th><th>Aspecto</th><th>Evaluado</th>" +
      "<th>% Aceptación</th><th>Aceptados</th><th>Rechazos</th></tr></thead>";
    const tbody = document.createElement("tbody");

    rows.forEach((r, idx) => {
      const tr = el("tr", "report-row" + (r.re > 0 ? " has-rejections" : ""));
      tr.appendChild(el("td", "cell-sub", String(idx + 1)));
      tr.appendChild(el("td", "cell-main", r.text));
      tr.appendChild(el("td", null, String(r.evaluated)));

      // % con barra
      const tdRate = el("td");
      if (r.rate == null) {
        tdRate.appendChild(el("span", "cell-sub", "—"));
      } else {
        const bar = el("div", "rate-bar");
        const fill = el("div", "rate-fill" + (r.rate < 0.85 ? " low" : ""));
        fill.style.width = Math.round(r.rate * 100) + "%";
        bar.appendChild(fill);
        const lbl = el("span", "rate-label", fmtPct(r.rate));
        tdRate.appendChild(bar);
        tdRate.appendChild(lbl);
      }
      tr.appendChild(tdRate);

      tr.appendChild(el("td", null, String(r.ac)));

      const tdRe = el("td");
      if (r.re > 0) {
        const btn = el("button", "btn btn-sm rej-toggle", `${r.re} ▾`);
        btn.type = "button";
        tdRe.appendChild(btn);
        // fila expandible con el detalle de los rechazos
        const detailTr = el("tr", "rej-detail");
        detailTr.style.display = "none";
        const detailTd = document.createElement("td");
        detailTd.colSpan = 6;
        const list = el("div", "rej-list");
        r.rejections.forEach(rej => {
          const item = el("div", "rej-item");
          const head = el("div", "rej-head");
          head.appendChild(el("span", "rej-date", rej.fecha || "—"));
          if (rej.area && rej.area !== "—") head.appendChild(el("span", "rej-area", rej.area));
          head.appendChild(el("span", "rej-by", rej.by));
          item.appendChild(head);
          if (rej.desc) item.appendChild(el("div", "rej-line", "Descripción: " + rej.desc));
          if (rej.accion) item.appendChild(el("div", "rej-line", "Acción: " + rej.accion));
          if (!rej.desc && !rej.accion) item.appendChild(el("div", "rej-line rej-empty", "Sin descripción registrada."));
          list.appendChild(item);
        });
        detailTd.appendChild(list);
        detailTr.appendChild(detailTd);
        btn.addEventListener("click", () => {
          const open = detailTr.style.display !== "none";
          detailTr.style.display = open ? "none" : "table-row";
          btn.textContent = `${r.re} ${open ? "▾" : "▴"}`;
        });
        tr._detail = detailTr;
      } else {
        tdRe.appendChild(el("span", "cell-sub", "0"));
      }
      tr.appendChild(tdRe);

      tbody.appendChild(tr);
      if (tr._detail) tbody.appendChild(tr._detail);
    });

    table.appendChild(tbody);
    wrap.appendChild(table);
    container.appendChild(wrap);
  }

  return { list, get, filterByDate, render: (report, container, subs, opts) =>
    report.render(container, subs, Object.assign({ report }, opts || {})) };
})();
