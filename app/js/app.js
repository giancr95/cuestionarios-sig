// ---------------------------------------------------------------------------
// Orquestador principal: router simple con vistas asíncronas contra el API.
// ---------------------------------------------------------------------------
const App = (() => {
  const root = document.getElementById("app");
  const topbar = document.getElementById("topbar");
  const userChip = document.getElementById("userChip");
  const btnBack = document.getElementById("btnBack");
  const btnLogout = document.getElementById("btnLogout");
  const toast = document.getElementById("toast");

  let state = { view: "login", currentFormId: null };
  let saving = false;

  // --- Toast ---
  let toastTimer = null;
  function showToast(msg, type) {
    toast.textContent = msg;
    toast.className = "toast" + (type ? " " + type : "");
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2800);
  }

  // --- DOM helpers ---
  function el2(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function mkBtn(text, cls, onClick) {
    const b = el2("button", cls, text);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }
  // SQLite guarda created_at en UTC sin marca de zona. Interpretarlo como
  // local (lo que hace `new Date(...)` por defecto en navegadores) da la hora
  // equivocada en CR; añadir la Z fuerza el parseo como UTC.
  function parseUTC(s) {
    return s ? new Date(String(s).replace(" ", "T") + "Z") : null;
  }
  function fmtDateTime(d) {
    return d ? d.toLocaleString("es-CR", { dateStyle: "short", timeStyle: "short" }) : "—";
  }
  // Áreas de un formulario — admite string ("Calidad") o array (["Calidad","Pilado"]).
  function formAreas(f) {
    if (Array.isArray(f.area)) return f.area.length ? f.area : ["Calidad"];
    return [f.area || "Calidad"];
  }

  function tabBar(active) {
    const bar = el2("div", "tab-bar");
    const user = Store.cachedUser();
    const tabs = [["select", "Registros"], ["saved", "Guardados"]];
    if (user && user.rol === "admin") {
      tabs.push(["reports", "Reportes"]);
      tabs.push(["editor", "Editor"]);
      tabs.push(["users", "Usuarios"]);
    }
    tabs.forEach(([v, label]) => {
      const t = el2("button", "tab" + (v === active ? " active" : ""), label);
      t.type = "button";
      t.addEventListener("click", () => { if (v !== active) { state = { view: v }; render(); } });
      bar.appendChild(t);
    });
    return bar;
  }

  // --- Topbar ---
  function updateTopbar() {
    const user = Store.cachedUser();
    if (!user || state.view === "login") {
      topbar.hidden = true;
      return;
    }
    topbar.hidden = false;
    userChip.textContent = user.rol === "admin" ? `${user.nombre} · admin` : user.nombre;
    btnBack.hidden = state.view === "select" || state.view === "saved" ||
                     state.view === "users" || state.view === "reports";
  }

  btnBack.addEventListener("click", () => {
    if (state.view === "submission") goSaved();
    else goSelect();
  });
  btnLogout.addEventListener("click", async () => {
    await Store.logout();
    state = { view: "login" };
    render();
  });

  // --- Views ---
  async function render() {
    updateTopbar();
    if (state.view === "login")  return renderLogin();
    if (state.view === "select") return renderSelect();
    if (state.view === "form")   return renderFormView();
    if (state.view === "saved")  return renderSaved();
    if (state.view === "submission") return renderSubmission();
    if (state.view === "users")  return renderUsers();
    if (state.view === "reports") return renderReports();
    if (state.view === "editor") return renderEditor();
  }

  async function renderEditor() {
    root.innerHTML = "";
    root.appendChild(tabBar("editor"));
    const me = Store.cachedUser();
    if (!me || me.rol !== "admin") {
      root.appendChild(el2("div", "empty", "Solo los administradores pueden editar formularios."));
      return;
    }
    root.appendChild(el2("h1", "page-title", "Editor de formularios"));
    await Editor.render(root);
  }

  // Aplica las ediciones guardadas (form_overrides) sobre el catálogo FORMS.
  async function applyFormOverrides() {
    try {
      const ov = await Store.formOverrides();
      Object.keys(ov || {}).forEach(fid => {
        const i = FORMS.findIndex(f => f.id === fid);
        if (i >= 0 && ov[fid] && ov[fid].schema) FORMS[i] = ov[fid].schema;
      });
    } catch (_) { /* sin sesión o sin overrides — se usa el catálogo del código */ }
  }

  function renderLogin() {
    root.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "login-wrap";
    wrap.innerHTML = `
      <div class="login-card">
        <div class="login-logo"><div class="logo-circle">SIG</div></div>
        <h1>Cuestionarios SIG</h1>
        <p class="sub">Arrocera Liborio S.A.</p>
        <form id="login-form" autocomplete="off">
          <div class="field">
            <label for="lu">Usuario</label>
            <input id="lu" class="input" type="text" required autocomplete="username" />
          </div>
          <div class="field">
            <label for="lp">Contraseña</label>
            <input id="lp" class="input" type="password" required autocomplete="current-password" />
          </div>
          <button class="btn btn-primary btn-block" id="btnLogin" type="submit">Ingresar</button>
        </form>
      </div>`;
    root.appendChild(wrap);
    const form = document.getElementById("login-form");
    const btn = document.getElementById("btnLogin");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const u = document.getElementById("lu").value;
      const p = document.getElementById("lp").value;
      btn.disabled = true;
      btn.textContent = "Ingresando…";
      try {
        const s = await Store.login(u, p);
        showToast("Bienvenido, " + s.nombre, "ok");
        await applyFormOverrides();
        state.view = "select";
        render();
      } catch (err) {
        showToast(err.message || "Error al iniciar sesión", "err");
        btn.disabled = false;
        btn.textContent = "Ingresar";
      }
    });
    setTimeout(() => document.getElementById("lu").focus(), 60);
  }

  async function renderSelect() {
    root.innerHTML = "";
    root.appendChild(tabBar("select"));
    root.appendChild(el2("h1", "page-title", "Seleccione el registro a completar"));
    root.appendChild(el2("p", "page-sub", "Formularios del Sistema Integrado de Gestión."));

    const search = document.createElement("input");
    search.className = "input search-input";
    search.type = "search";
    search.placeholder = "Buscar registro por nombre, palabra clave o código…";
    root.appendChild(search);

    // Si el usuario tiene áreas asignadas, solo ve esas. Admins ven todas.
    const me0 = Store.cachedUser();
    const allowedAreas = (me0 && me0.rol !== "admin" && Array.isArray(me0.areas) && me0.areas.length)
      ? new Set(me0.areas) : null;
    const visibleForms = FORMS.filter(f => {
      if (!allowedAreas) return true;
      return formAreas(f).some(a => allowedAreas.has(a));
    });

    // Agrupa los formularios por área. Un formulario con varias áreas aparece
    // en cada grupo correspondiente, pero SOLO en las áreas que el usuario
    // tiene asignadas: un formulario compartido no debe arrastrar los grupos
    // de otras áreas a la vista de un usuario restringido.
    const areas = [];
    const byArea = {};
    visibleForms.forEach(f => {
      formAreas(f)
        .filter(area => !allowedAreas || allowedAreas.has(area))
        .forEach(area => {
          if (!byArea[area]) { byArea[area] = []; areas.push(area); }
          byArea[area].push(f);
        });
    });

    const groups = [];
    areas.forEach(area => {
      // Por defecto los grupos arrancan colapsados — el operario abre solo el
      // área en la que va a trabajar y no tiene que ir cerrando las demás.
      const group = el2("div", "area-group collapsed");

      const heading = el2("button", "area-title");
      heading.type = "button";
      heading.appendChild(el2("span", null, area));
      const count = el2("span", "area-count", String(byArea[area].length));
      const chevron = el2("span", "sec-chevron", "▾");
      const right = el2("span", "area-title-right");
      right.appendChild(count);
      right.appendChild(chevron);
      heading.appendChild(right);
      heading.addEventListener("click", () => {
        group.className = group.className.indexOf("collapsed") >= 0
          ? "area-group" : "area-group collapsed";
      });

      const grid = el2("div", "form-grid");
      const cards = [];
      byArea[area].forEach(f => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "form-card";
        card.innerHTML = `
          <div class="badge-icon">${f.icon}</div>
          <span class="code">${f.code}</span>
          <h3>${f.shortTitle}</h3>
          <p class="desc">${f.desc}</p>
          <div class="meta">
            <span>v${f.version}</span>
            <span>·</span>
            <span>Revisión ${f.revision}</span>
          </div>`;
        card.addEventListener("click", () => goForm(f.id, area));
        grid.appendChild(card);
        cards.push({ card, form: f });
      });

      group.appendChild(heading);
      group.appendChild(grid);
      root.appendChild(group);
      groups.push({ area, group, cards });
    });

    const noResults = el2("div", "empty", "Ningún registro coincide con la búsqueda.");
    noResults.style.display = "none";
    root.appendChild(noResults);

    function applyFilter() {
      const q = search.value.trim().toLowerCase();
      let totalVisible = 0;
      groups.forEach(g => {
        let visible = 0;
        g.cards.forEach(({ card, form }) => {
          const hay = !q || [form.shortTitle, form.title, form.code, form.desc, g.area]
            .some(s => s && s.toLowerCase().indexOf(q) >= 0);
          card.style.display = hay ? "" : "none";
          if (hay) visible++;
        });
        g.group.style.display = visible ? "" : "none";
        totalVisible += visible;
        // Al buscar, expande los grupos que tienen coincidencias.
        if (q && visible) g.group.className = "area-group";
      });
      noResults.style.display = totalVisible ? "none" : "";
    }
    search.addEventListener("input", applyFilter);
  }

  async function renderFormView() {
    const schema = FORMS.find(f => f.id === state.currentFormId);
    if (!schema) { goSelect(); return; }
    // Área desde la que se abrió (para formularios segregados por área, ej. RDI).
    let opts = state.currentArea ? { area: state.currentArea } : undefined;
    // El R-IDI-001 precarga "Disponible" con el saldo del último registro.
    if (schema.id === "IDI-001") {
      try {
        const latest = await Store.latestFormSubmission("IDI-001");
        if (latest && latest.data) {
          const invItems = (schema.sections.find(x => x.type === "material-list") || {}).items || [];
          const data = {};
          for (const k in latest.data) {
            const m = k.match(/^inv__(\d+)__saldo$/);
            const v = latest.data[k];
            // Los químicos retirados no se precargan (su fila ya no se ofrece).
            if (m && v !== "" && v !== null && v !== undefined &&
                !(invItems[+m[1]] && invItems[+m[1]].retired)) {
              data["inv__" + m[1] + "__disponible"] = v;
            }
          }
          if (Object.keys(data).length) opts = Object.assign({}, opts, { data });
        }
      } catch (_) {}
    }
    Render.renderForm(schema, root, opts);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  async function renderSaved() {
    root.innerHTML = "";
    root.appendChild(tabBar("saved"));
    const user = Store.cachedUser();
    root.appendChild(el2("h1", "page-title", "Registros guardados"));
    root.appendChild(el2("p", "page-sub",
      user && user.rol === "admin"
        ? "Todos los registros enviados en el sistema."
        : "Registros enviados por su cuenta."));

    const loading = el2("div", "empty", "Cargando…");
    root.appendChild(loading);

    let subs = [];
    try {
      subs = await Store.allSubmissions();
    } catch (err) {
      loading.textContent = "No fue posible cargar los registros.";
      showToast(err.message || "Error al cargar", "err");
      return;
    }
    loading.remove();

    if (!subs.length) {
      root.appendChild(el2("div", "empty", "Aún no hay registros guardados."));
      return;
    }

    // Enriquece cada registro con datos del formulario asociado.
    subs.forEach(s => {
      const f = FORMS.find(x => x.id === s.formId);
      s._form = f;
      s._name = f ? f.shortTitle : s.formId;
      s._code = f ? f.code : s.formId;
      s._area = f ? formAreas(f).join(", ") : "—";
      s._date = parseUTC(s.savedAt);
      s._editedDate = parseUTC(s.editedAt);
    });

    // Filtro por estado (Todos / Pendientes / Revisados / Aprobados).
    let statusFilter = "all";
    const filterBar = el2("div", "chip-bar");
    [["all", "Todos"], ["pending", "Pendientes"], ["revisado", "Revisados"], ["approved", "Aprobados"]].forEach(([v, label]) => {
      const chip = mkBtn(label, "chip" + (v === statusFilter ? " active" : ""), () => {
        statusFilter = v;
        [...filterBar.children].forEach(c =>
          c.className = c.textContent === label ? "chip active" : "chip");
        draw();
      });
      filterBar.appendChild(chip);
    });
    root.appendChild(filterBar);

    const search = document.createElement("input");
    search.className = "input search-input";
    search.type = "search";
    search.placeholder = "Buscar por registro, área, fecha o responsable…";
    root.appendChild(search);

    const tableWrap = el2("div", "table-wrap");
    root.appendChild(tableWrap);

    function fmtDate(d) {
      return d.toLocaleString("es-CR", { dateStyle: "short", timeStyle: "short" });
    }

    function statusBadge(s) {
      const cls = s.status === "approved" ? "aprobado"
        : s.status === "revisado" ? "revisado" : "pendiente";
      const txt = s.status === "approved" ? "Aprobado"
        : s.status === "revisado" ? "Revisado" : "Pendiente";
      return el2("span", "estado-badge estado-" + cls, txt);
    }

    function draw() {
      const q = search.value.trim().toLowerCase();
      const rows = subs.filter(s => {
        if (statusFilter !== "all" && s.status !== statusFilter) return false;
        if (!q) return true;
        return s._name.toLowerCase().includes(q) ||
          s._code.toLowerCase().includes(q) ||
          s._area.toLowerCase().includes(q) ||
          s.savedByName.toLowerCase().includes(q) ||
          fmtDate(s._date).toLowerCase().includes(q);
      });
      tableWrap.innerHTML = "";
      tableWrap.appendChild(el2("p", "result-count",
        `${rows.length} de ${subs.length} registro${subs.length === 1 ? "" : "s"}`));
      if (!rows.length) {
        tableWrap.appendChild(el2("div", "empty", "Sin coincidencias."));
        return;
      }

      // Agrupa: área → formulario → envíos individuales.
      const areaOrder = [], byArea = {};
      rows.forEach(s => {
        if (!byArea[s._area]) { byArea[s._area] = { order: [], by: {} }; areaOrder.push(s._area); }
        const ag = byArea[s._area];
        if (!ag.by[s.formId]) { ag.by[s.formId] = { form: s._form, name: s._name, code: s._code, items: [] }; ag.order.push(s.formId); }
        ag.by[s.formId].items.push(s);
      });

      const expandAll = !!q;
      areaOrder.forEach(area => {
        const areaGroup = el2("div", "area-group" + (expandAll ? "" : " collapsed"));
        const areaHead = el2("button", "area-title");
        areaHead.type = "button";
        areaHead.appendChild(el2("span", null, area));
        const totalInArea = byArea[area].order.reduce((n, fid) => n + byArea[area].by[fid].items.length, 0);
        const right = el2("span", "area-title-right");
        right.appendChild(el2("span", "area-count", String(totalInArea)));
        right.appendChild(el2("span", "sec-chevron", "▾"));
        areaHead.appendChild(right);
        areaHead.addEventListener("click", () => {
          areaGroup.className = areaGroup.className.indexOf("collapsed") >= 0
            ? "area-group" : "area-group collapsed";
        });
        areaGroup.appendChild(areaHead);

        const subs = el2("div", "subgroups");
        byArea[area].order.forEach(fid => {
          const g = byArea[area].by[fid];
          const formGroup = el2("div", "form-subgroup" + (expandAll ? "" : " collapsed"));
          const formHead = el2("button", "form-subtitle");
          formHead.type = "button";
          const left = el2("div", "form-subtitle-name");
          left.appendChild(el2("span", "form-subtitle-main", g.name));
          left.appendChild(el2("span", "form-subtitle-code", g.code));
          formHead.appendChild(left);
          const fr = el2("span", "area-title-right");
          fr.appendChild(el2("span", "area-count", String(g.items.length)));
          fr.appendChild(el2("span", "sec-chevron", "▾"));
          formHead.appendChild(fr);
          formHead.addEventListener("click", () => {
            formGroup.className = formGroup.className.indexOf("collapsed") >= 0
              ? "form-subgroup" : "form-subgroup collapsed";
          });
          formGroup.appendChild(formHead);

          const list = el2("div", "submission-list");
          g.items.forEach(s => {
            const row = el2("div", "submission-row");
            row.addEventListener("click", () => goSubmission(s));
            row.appendChild(statusBadge(s));
            const meta = el2("div", "submission-meta");
            meta.appendChild(el2("div", "submission-date", fmtDate(s._date)));
            meta.appendChild(el2("div", "submission-by", s.savedByName));
            row.appendChild(meta);
            const actions = el2("div", "submission-actions");
            const view = mkBtn("Ver", "btn btn-sm", () => goSubmission(s));
            const dl = mkBtn("⤓", "btn btn-sm btn-icon", () => exportSubmissionPDF(s));
            dl.title = "Descargar PDF";
            const rm = mkBtn("✕", "btn btn-sm btn-icon btn-danger", async () => {
              if (!confirm("¿Eliminar este registro?")) return;
              try { await Store.deleteSubmission(s.id); render(); }
              catch (err) { showToast(err.message || "No se pudo eliminar", "err"); }
            });
            rm.title = "Eliminar";
            [view, dl, rm].forEach(b => {
              b.addEventListener("click", e => e.stopPropagation());
              actions.appendChild(b);
            });
            row.appendChild(actions);
            list.appendChild(row);
          });
          formGroup.appendChild(list);
          subs.appendChild(formGroup);
        });
        areaGroup.appendChild(subs);
        tableWrap.appendChild(areaGroup);
      });
    }

    search.addEventListener("input", draw);
    draw();
  }

  function renderSubmission() {
    const s = state.currentSubmission;
    if (!s) { goSaved(); return; }
    root.innerHTML = "";
    const me = Store.cachedUser() || {};
    const schema = FORMS.find(f => f.id === s.formId);
    if (!schema) {
      // Formulario retirado del catálogo: el registro sigue siendo legible —
      // se muestran los datos crudos para no perder acceso a la información.
      root.appendChild(el2("div", "ro-banner",
        `Registro de un formulario retirado (${s.formId}) · Llenado por ${s.savedByName} · ${fmtDateTime(parseUTC(s.savedAt))}`));
      const wrap = el2("div", "table-wrap");
      const table = el2("table", "data-table");
      table.innerHTML = "<thead><tr><th>Campo</th><th>Valor</th></tr></thead>";
      const tb = document.createElement("tbody");
      Object.keys(s.data || {}).forEach(k => {
        if (k === "_checklist") return;
        const tr = document.createElement("tr");
        tr.appendChild(el2("td", "cell-sub", k));
        tr.appendChild(el2("td", null, String(s.data[k])));
        tb.appendChild(tr);
      });
      (s.data && s.data._checklist || []).forEach(c => {
        const tr = document.createElement("tr");
        tr.appendChild(el2("td", "cell-sub", c.item));
        tr.appendChild(el2("td", null, c.valor || "—"));
        tb.appendChild(tr);
      });
      table.appendChild(tb);
      wrap.appendChild(table);
      root.appendChild(wrap);
      return;
    }
    const isAdmin = me.rol === "admin";
    const isOwner = s.savedBy === me.id;
    // Quién puede editar: admin (siempre), el autor mientras esté pendiente, o
    // cualquier usuario si el formulario es de llenado colaborativo (ej. RPC:
    // fumigación primero, recepción después) y el registro sigue pendiente.
    const isCollab = !!schema.collaborative && s.status === "pending";
    const canEdit = isAdmin || (isOwner && s.status === "pending") || isCollab;

    // ¿Puedo accionar este registro? El flujo es pending → revisado → approved.
    // Brian (is_reviewer) marca pendientes como revisados; Andrea (is_approver)
    // aprueba los revisados. Los admins pueden hacer ambas cosas.
    let nextAction = null;
    if (s.status === "pending" && (me.isReviewer || isAdmin)) {
      nextAction = { label: "Marcar como revisado", successMsg: "Marcado como revisado — falta aprobación" };
    } else if (s.status === "revisado" && (me.isApprover || isAdmin)) {
      nextAction = { label: "Aprobar registro", successMsg: "Registro aprobado" };
    }

    // Banner de estado / autoría / edición / aprobaciones.
    const banner = el2("div", "ro-banner");
    const statusLabel =
      s.status === "approved" ? "Aprobado"
        : s.status === "revisado" ? "Revisado · pendiente de aprobación"
        : "Pendiente de revisión";
    banner.appendChild(el2("div", null,
      `${statusLabel} · Llenado por ${s.savedByName} · ${fmtDateTime(parseUTC(s.savedAt))}`));
    if (s.editedAt) {
      banner.appendChild(el2("div", null,
        `Editado por ${s.editedByName || "—"} · ${fmtDateTime(parseUTC(s.editedAt))}`));
    }
    if (s.approvals && s.approvals.length) {
      banner.appendChild(el2("div", null,
        "Acciones: " + s.approvals
          .map(a => `${a.reviewer_name} (${fmtDateTime(parseUTC(a.approved_at))})`)
          .join(", ")));
    }
    root.appendChild(banner);

    const topActions = el2("div", "submission-topactions");
    topActions.appendChild(mkBtn("Descargar PDF", "btn btn-sm", () => exportSubmissionPDF(s)));
    root.appendChild(topActions);

    const formWrap = document.createElement("div");
    root.appendChild(formWrap);

    if (canEdit) {
      // Admin siempre, el autor mientras siga pendiente, o llenado colaborativo.
      // En el flujo colaborativo las fases ya llenadas quedan bloqueadas (salvo
      // admin) y al guardar se conservan sus valores fusionando con lo previo.
      const lockFilled = isCollab && !isAdmin;
      Render.renderForm(schema, formWrap, {
        data: s.data || {},
        lockFilled,
        submitLabel: "Guardar cambios",
        onCancel: () => goSaved(),
        onSubmit: async (data) => {
          try {
            const payload = lockFilled ? Object.assign({}, s.data || {}, data) : data;
            await Store.updateSubmission(s.id, payload);
            showToast("Registro actualizado", "ok");
            goSaved();
          } catch (err) { showToast(err.message || "No se pudo guardar", "err"); }
        }
      });
    } else {
      Render.renderForm(schema, formWrap, { readonly: true, data: s.data || {} });
    }

    if (nextAction) {
      const bar = el2("div", "review-bar");
      bar.appendChild(mkBtn(nextAction.label, "btn btn-primary btn-block", async () => {
        try {
          await Store.reviewSubmission(s.id);
          showToast(nextAction.successMsg, "ok");
          // Encadena la revisión/aprobación: abre de inmediato el siguiente
          // registro que este usuario pueda accionar, sin volver a la lista.
          await openNextForAction(s.id);
        } catch (err) { showToast(err.message || "No se pudo registrar la acción", "err"); }
      }));
      root.appendChild(bar);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  // ¿Puede este usuario accionar (revisar/aprobar) este registro?
  function canActOn(sub, me) {
    return ((me.isReviewer || me.rol === "admin") && sub.status === "pending") ||
           ((me.isApprover || me.rol === "admin") && sub.status === "revisado");
  }

  // Abre el siguiente registro pendiente de acción (más antiguo primero) para
  // seguir el proceso; si no queda ninguno, vuelve a Guardados.
  async function openNextForAction(afterId) {
    const me = Store.cachedUser() || {};
    let subs;
    try { subs = await Store.allSubmissions(); }
    catch { goSaved(); return; }
    const next = subs
      .filter(x => x.id !== afterId && canActOn(x, me))
      .sort((a, b) => (parseUTC(a.savedAt) - parseUTC(b.savedAt)))[0];
    if (next) {
      goSubmission(next);
    } else {
      showToast("No quedan registros por procesar", "ok");
      goSaved();
    }
  }

  // Estado persistente de la pestaña Reportes mientras dura la sesión de vista.
  let reportState = { reportId: null, from: "", to: "" };

  async function renderReports() {
    root.innerHTML = "";
    root.appendChild(tabBar("reports"));
    const me = Store.cachedUser();
    if (!me || me.rol !== "admin") {
      root.appendChild(el2("div", "empty", "Solo los administradores pueden ver los reportes."));
      return;
    }
    root.appendChild(el2("h1", "page-title", "Reportes"));
    root.appendChild(el2("p", "page-sub",
      "Resumen de los datos recolectados. Filtre por fecha para acotar el período."));

    const available = Reports.list();
    if (!available.length) {
      root.appendChild(el2("div", "empty", "Aún no hay reportes disponibles."));
      return;
    }
    if (!reportState.reportId || !available.some(r => r.id === reportState.reportId)) {
      reportState.reportId = available[0].id;
    }

    // --- controles: selector de reporte + rango de fechas ---
    const controls = el2("div", "report-controls");

    const selWrap = el2("div", "field");
    selWrap.appendChild(el2("label", null, "Reporte"));
    const sel = document.createElement("select");
    sel.className = "select";
    available.forEach(r => {
      const o = el2("option", null, r.label); o.value = r.id;
      if (r.id === reportState.reportId) o.selected = true;
      sel.appendChild(o);
    });
    selWrap.appendChild(sel);
    controls.appendChild(selWrap);

    const fromWrap = el2("div", "field");
    fromWrap.appendChild(el2("label", null, "Desde"));
    const fromInp = document.createElement("input");
    fromInp.type = "date"; fromInp.className = "input"; fromInp.value = reportState.from;
    fromWrap.appendChild(fromInp);
    controls.appendChild(fromWrap);

    const toWrap = el2("div", "field");
    toWrap.appendChild(el2("label", null, "Hasta"));
    const toInp = document.createElement("input");
    toInp.type = "date"; toInp.className = "input"; toInp.value = reportState.to;
    toWrap.appendChild(toInp);
    controls.appendChild(toWrap);

    root.appendChild(controls);

    // Botón de imprimir / exportar a PDF (vía diálogo de impresión del navegador).
    const actions = el2("div", "report-actions");
    actions.appendChild(mkBtn("Imprimir / PDF", "btn btn-primary report-print-btn",
      () => window.print()));
    root.appendChild(actions);

    const descEl = el2("p", "report-desc");
    root.appendChild(descEl);

    // Encabezado que solo aparece al imprimir/exportar (oculto en pantalla).
    const printHeader = el2("div", "print-header");
    root.appendChild(printHeader);

    const out = el2("div", "report-output");
    root.appendChild(out);

    let allSubs = null;
    async function refresh() {
      reportState.reportId = sel.value;
      reportState.from = fromInp.value;
      reportState.to = toInp.value;
      const report = Reports.get(reportState.reportId);
      descEl.textContent = report.desc || "";

      // Arma el encabezado de impresión con el reporte y el período.
      printHeader.innerHTML = "";
      printHeader.appendChild(el2("div", "print-brand",
        "Arrocera Liborio S.A. · Sistema Integrado de Gestión"));
      printHeader.appendChild(el2("div", "print-title", report.label));
      const rango = (reportState.from || "inicio") + "  –  " + (reportState.to || "actualidad");
      printHeader.appendChild(el2("div", "print-range",
        "Período: " + rango + "  ·  Generado: " + new Date().toLocaleDateString("es-CR")));

      out.innerHTML = "";
      out.appendChild(el2("div", "empty", "Cargando…"));
      try {
        if (allSubs === null) allSubs = await Store.allSubmissions();
      } catch (err) {
        out.innerHTML = "";
        out.appendChild(el2("div", "empty", "No fue posible cargar los registros."));
        showToast(err.message || "Error al cargar", "err");
        return;
      }
      const subs = allSubs.filter(s => report.formIds.indexOf(s.formId) >= 0);
      const filtered = Reports.filterByDate(report, subs, reportState.from, reportState.to);
      out.innerHTML = "";
      Reports.render(report, out, filtered, {});
    }

    sel.addEventListener("change", refresh);
    fromInp.addEventListener("change", refresh);
    toInp.addEventListener("change", refresh);
    refresh();
  }

  async function renderUsers() {
    root.innerHTML = "";
    root.appendChild(tabBar("users"));
    const me = Store.cachedUser();
    if (!me || me.rol !== "admin") {
      root.appendChild(el2("div", "empty", "Solo los administradores pueden gestionar usuarios."));
      return;
    }
    root.appendChild(el2("h1", "page-title", "Gestión de usuarios"));
    root.appendChild(el2("p", "page-sub", "Cree y administre las cuentas de acceso al sistema."));

    const loading = el2("div", "empty", "Cargando…");
    root.appendChild(loading);
    let usuarios = [];
    try { usuarios = await Store.listUsers(); }
    catch (err) {
      loading.textContent = "No fue posible cargar los usuarios.";
      showToast(err.message || "Error al cargar", "err");
      return;
    }
    loading.remove();

    let editId = null;
    const formCard = el2("div", "user-form-card");
    const tableWrap = el2("div", "table-wrap");
    root.appendChild(formCard);
    root.appendChild(tableWrap);

    function inputField(label, type, value, disabled) {
      const wrap = el2("div", "field");
      wrap.appendChild(el2("label", null, label));
      const inp = document.createElement("input");
      inp.className = "input";
      inp.type = type;
      if (value != null) inp.value = value;
      if (disabled) inp.disabled = true;
      wrap.appendChild(inp);
      wrap._input = inp;
      return wrap;
    }
    function selectField(label, value) {
      const wrap = el2("div", "field");
      wrap.appendChild(el2("label", null, label));
      const sel = document.createElement("select");
      sel.className = "select";
      [["operador", "Operador"], ["admin", "Administrador"]].forEach(([v, l]) => {
        const o = el2("option", null, l); o.value = v;
        if (v === value) o.selected = true;
        sel.appendChild(o);
      });
      wrap.appendChild(sel);
      wrap._input = sel;
      return wrap;
    }

    function checkboxField(label, checked) {
      const wrap = el2("div", "field");
      const lbl = el2("label", "check-inline");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!checked;
      lbl.appendChild(cb);
      lbl.appendChild(el2("span", null, " " + label));
      wrap.appendChild(lbl);
      wrap._input = cb;
      return wrap;
    }

    const ALL_AREAS = [...new Set(FORMS.flatMap(f => formAreas(f)))].sort();

    function drawForm() {
      formCard.innerHTML = "";
      const editing = editId != null;
      const u = editing ? usuarios.find(x => x.id === editId) : null;
      formCard.appendChild(el2("h3", null, editing ? "Editar usuario" : "Nuevo usuario"));

      const grid = el2("div", "two-col");
      const fUsuario = inputField("Usuario (acceso)", "text", u ? u.usuario : "", editing);
      const fNombre = inputField("Nombre completo", "text", u ? u.nombre : "", false);
      const fPass = inputField(editing ? "Contraseña nueva (opcional)" : "Contraseña", "text", "", false);
      const fRol = selectField("Rol", u ? u.rol : "operador");
      const fReviewer = checkboxField("Revisor (marca pendientes como revisados)",
        u ? !!u.isReviewer : false);
      const fApprover = checkboxField("Aprobador (aprueba los registros ya revisados)",
        u ? !!u.isApprover : false);
      [fUsuario, fNombre, fPass, fRol, fReviewer, fApprover].forEach(f => grid.appendChild(f));
      formCard.appendChild(grid);

      // Áreas asignadas (vacío = sin restricción).
      formCard.appendChild(el2("label", "areas-label",
        "Áreas asignadas (sin marcar = puede ver todas)"));
      const areasGrid = el2("div", "areas-checkbox-grid");
      const areaCBs = {};
      ALL_AREAS.forEach(a => {
        const lbl = el2("label", "area-checkbox");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        if (u && Array.isArray(u.areas) && u.areas.indexOf(a) >= 0) cb.checked = true;
        areaCBs[a] = cb;
        lbl.appendChild(cb);
        lbl.appendChild(el2("span", null, " " + a));
        areasGrid.appendChild(lbl);
      });
      formCard.appendChild(areasGrid);

      const actions = el2("div", "form-actions");
      actions.appendChild(mkBtn(editing ? "Guardar cambios" : "Crear usuario", "btn btn-primary", async () => {
        const selectedAreas = Object.keys(areaCBs).filter(a => areaCBs[a].checked);
        const body = {
          nombre: fNombre._input.value.trim(),
          rol: fRol._input.value,
          password: fPass._input.value,
          isReviewer: fReviewer._input.checked,
          isApprover: fApprover._input.checked,
          areas: selectedAreas.length ? selectedAreas : null
        };
        try {
          if (editing) {
            await Store.updateUser(editId, body);
            showToast("Usuario actualizado", "ok");
          } else {
            body.usuario = fUsuario._input.value.trim();
            await Store.createUser(body);
            showToast("Usuario creado", "ok");
          }
          editId = null;
          renderUsers();
        } catch (err) {
          showToast(err.message || "No se pudo guardar", "err");
        }
      }));
      if (editing) {
        actions.appendChild(mkBtn("Cancelar", "btn btn-ghost", () => { editId = null; drawForm(); }));
      }
      formCard.appendChild(actions);
    }

    function drawTable() {
      tableWrap.innerHTML = "";
      const table = el2("table", "data-table");
      table.innerHTML =
        "<thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th>" +
        "<th>Estado</th><th>Registros</th><th></th></tr></thead>";
      const tbody = document.createElement("tbody");
      usuarios.forEach(u => {
        const tr = document.createElement("tr");
        if (!u.activo) tr.className = "row-inactive";
        tr.appendChild(el2("td", "cell-main", u.usuario));
        const tdNombre = document.createElement("td");
        tdNombre.appendChild(el2("div", null, u.nombre));
        if (u.areas && u.areas.length) {
          tdNombre.appendChild(el2("div", "cell-sub", `Áreas: ${u.areas.join(", ")}`));
        }
        tr.appendChild(tdNombre);
        const tdRol = document.createElement("td");
        tdRol.appendChild(el2("span", "rol-badge rol-" + u.rol,
          u.rol === "admin" ? "Administrador" : "Operador"));
        if (u.isReviewer) {
          tdRol.appendChild(el2("span", "rol-badge rol-revisor", "Revisor"));
        }
        if (u.isApprover) {
          tdRol.appendChild(el2("span", "rol-badge rol-aprobador", "Aprobador"));
        }
        tr.appendChild(tdRol);
        const tdEstado = document.createElement("td");
        tdEstado.appendChild(el2("span",
          "estado-badge estado-" + (u.activo ? "activo" : "inactivo"),
          u.activo ? "Activo" : "Inactivo"));
        tr.appendChild(tdEstado);
        tr.appendChild(el2("td", null, String(u.submissions != null ? u.submissions : "—")));

        const acc = el2("td", "row-actions");
        acc.appendChild(mkBtn("Editar", "btn btn-sm", () => {
          editId = u.id; drawForm(); window.scrollTo({ top: 0, behavior: "instant" });
        }));
        const toggle = mkBtn(u.activo ? "Desactivar" : "Activar",
          "btn btn-sm" + (u.activo ? "" : " btn-primary"), async () => {
          const msg = u.activo
            ? `¿Desactivar a ${u.usuario}? No podrá iniciar sesión; sus registros se conservan.`
            : `¿Reactivar al usuario ${u.usuario}?`;
          if (!confirm(msg)) return;
          try {
            await Store.updateUser(u.id, { activo: !u.activo });
            showToast(u.activo ? "Usuario desactivado" : "Usuario reactivado", "ok");
            renderUsers();
          } catch (err) {
            showToast(err.message || "No se pudo actualizar", "err");
          }
        });
        if (u.usuario === me.usuario && u.activo) toggle.disabled = true;
        acc.appendChild(toggle);

        const del = mkBtn("Eliminar", "btn btn-sm btn-danger", async () => {
          const warn = u.submissions > 0
            ? `Eliminar a ${u.usuario} también borrará sus ${u.submissions} registro(s). Para conservarlos use «Desactivar». ¿Eliminar de todas formas?`
            : `¿Eliminar al usuario ${u.usuario}?`;
          if (!confirm(warn)) return;
          try {
            await Store.deleteUser(u.id);
            showToast("Usuario eliminado", "ok");
            renderUsers();
          } catch (err) {
            showToast(err.message || "No se pudo eliminar", "err");
          }
        });
        if (u.usuario === me.usuario) del.disabled = true;
        acc.appendChild(del);
        tr.appendChild(acc);
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableWrap.appendChild(table);
    }

    drawForm();
    drawTable();
  }

  // Exporta un registro guardado a PDF mediante el diálogo de impresión del
  // navegador ("Guardar como PDF"). Reusa el renderer en solo-lectura y arma un
  // documento con el encabezado (logo) de la Arrocera. Produce un PDF con texto
  // seleccionable, sin librerías externas.
  function exportSubmissionPDF(s) {
    const schema = FORMS.find(f => f.id === s.formId);
    if (!schema) { showToast("No se encontró el formulario de este registro", "err"); return; }
    const form = s._form || schema;

    const doc = el2("div", "print-doc");

    const header = el2("div", "print-doc-header");
    const logo = el2("div", "print-doc-logo");
    logo.appendChild(el2("span", "print-doc-logo-dot"));
    logo.appendChild(el2("span", "print-doc-logo-name", "Arrocera Liborio"));
    logo.appendChild(el2("span", "print-doc-logo-sa", "S.A."));
    header.appendChild(logo);
    header.appendChild(el2("div", "print-doc-org", "Sistema Integrado de Gestión"));
    doc.appendChild(header);

    const meta = el2("div", "print-doc-meta");
    meta.appendChild(el2("div", "print-doc-title", schema.title));
    const areaTxt = form ? formAreas(form).join(", ") : "";
    meta.appendChild(el2("div", "print-doc-sub",
      `${schema.code} · v${schema.version}` + (areaTxt ? ` · ${areaTxt}` : "")));
    const estado = s.status === "approved" ? "Aprobado"
      : s.status === "revisado" ? "Revisado" : "Pendiente";
    meta.appendChild(el2("div", "print-doc-sub",
      `Llenado por ${s.savedByName} · ${fmtDateTime(parseUTC(s.savedAt))} · Estado: ${estado}`));
    if (s.approvals && s.approvals.length) {
      meta.appendChild(el2("div", "print-doc-sub",
        "Aprobaciones: " + s.approvals
          .map(a => `${a.reviewer_name} (${fmtDateTime(parseUTC(a.approved_at))})`).join(", ")));
    }
    doc.appendChild(meta);

    const formWrap = el2("div");
    Render.renderForm(schema, formWrap, { readonly: true, data: s.data || {} });
    doc.appendChild(formWrap);

    document.body.appendChild(doc);
    document.body.classList.add("printing-doc");
    let done = false;
    const cleanup = () => {
      if (done) return; done = true;
      document.body.classList.remove("printing-doc");
      doc.remove();
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    // Respaldo por si afterprint no dispara (algunos navegadores).
    setTimeout(cleanup, 1500);
  }

  // --- Navigation ---
  function goSelect() {
    state = { view: "select", currentFormId: null };
    render();
  }
  function goForm(id, area) {
    state = { view: "form", currentFormId: id, currentArea: area || null };
    render();
  }
  function goSaved() {
    state = { view: "saved" };
    render();
  }
  function goSubmission(s) {
    state = { view: "submission", currentSubmission: s };
    render();
  }

  async function handleSave(schema, data) {
    if (saving) return;
    saving = true;
    const btn = document.querySelector("#sig-form button[type=submit]");
    const prev = btn ? btn.textContent : null;
    if (btn) { btn.disabled = true; btn.textContent = "Guardando…"; }
    try {
      await Store.saveSubmission(schema.id, data);
      showToast("Registro guardado correctamente", "ok");
      goSelect();
    } catch (err) {
      if (err.status === 401) {
        showToast("Sesión expirada, vuelva a iniciar sesión", "err");
        state = { view: "login" };
        render();
      } else {
        showToast(err.message || "Error al guardar", "err");
      }
      if (btn) { btn.disabled = false; btn.textContent = prev || "Guardar"; }
    } finally {
      saving = false;
    }
  }

  // --- Init ---
  async function init() {
    const me = await Store.currentUser();
    if (me) await applyFormOverrides();
    state.view = me ? "select" : "login";
    render();
  }

  return { init, goSelect, goForm, handleSave };
})();

document.addEventListener("DOMContentLoaded", App.init);
