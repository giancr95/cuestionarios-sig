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
  function tabBar(active) {
    const bar = el2("div", "tab-bar");
    const user = Store.cachedUser();
    const tabs = [["select", "Registros"], ["saved", "Guardados"]];
    if (user && user.rol === "admin") tabs.push(["users", "Usuarios"]);
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
    btnBack.hidden = state.view === "select" || state.view === "saved" || state.view === "users";
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

    // Agrupa los formularios por área, conservando el orden de aparición.
    const areas = [];
    const byArea = {};
    FORMS.forEach(f => {
      const area = f.area || "Calidad";
      if (!byArea[area]) { byArea[area] = []; areas.push(area); }
      byArea[area].push(f);
    });

    const groups = [];
    areas.forEach(area => {
      const group = el2("div", "area-group");

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
        card.addEventListener("click", () => goForm(f.id));
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

  function renderFormView() {
    const schema = FORMS.find(f => f.id === state.currentFormId);
    if (!schema) { goSelect(); return; }
    Render.renderForm(schema, root);
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
      s._area = f ? (f.area || "Calidad") : "—";
      s._date = new Date(s.savedAt);
    });

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

    function draw() {
      const q = search.value.trim().toLowerCase();
      const rows = subs.filter(s => !q ||
        s._name.toLowerCase().includes(q) ||
        s._code.toLowerCase().includes(q) ||
        s._area.toLowerCase().includes(q) ||
        s.savedByName.toLowerCase().includes(q) ||
        fmtDate(s._date).toLowerCase().includes(q));
      tableWrap.innerHTML = "";
      tableWrap.appendChild(el2("p", "result-count",
        `${rows.length} de ${subs.length} registro${subs.length === 1 ? "" : "s"}`));

      if (!rows.length) {
        tableWrap.appendChild(el2("div", "empty", "Sin coincidencias."));
        return;
      }

      const table = el2("table", "data-table");
      table.innerHTML =
        "<thead><tr><th>Registro</th><th>Área</th><th>Fecha</th>" +
        "<th>Llenado por</th><th></th></tr></thead>";
      const tbody = document.createElement("tbody");
      rows.forEach(s => {
        const tr = el2("tr", "data-row");
        const tdName = document.createElement("td");
        tdName.appendChild(el2("div", "cell-main", s._name));
        tdName.appendChild(el2("div", "cell-sub", s._code));
        tr.appendChild(tdName);
        tr.appendChild(el2("td", null, s._area));
        tr.appendChild(el2("td", null, fmtDate(s._date)));
        tr.appendChild(el2("td", null, s.savedByName));

        const actions = el2("td", "row-actions");
        const view = mkBtn("Ver", "btn btn-sm", () => goSubmission(s));
        const dl = mkBtn("⤓", "btn btn-sm btn-icon", () => downloadJSON(s, s._form));
        dl.title = "Descargar JSON";
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
        tr.appendChild(actions);

        tr.addEventListener("click", () => goSubmission(s));
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableWrap.appendChild(table);
    }

    search.addEventListener("input", draw);
    draw();
  }

  function renderSubmission() {
    const s = state.currentSubmission;
    if (!s) { goSaved(); return; }
    root.innerHTML = "";
    const schema = FORMS.find(f => f.id === s.formId);
    if (!schema) {
      root.appendChild(el2("div", "empty",
        "No se encontró la definición del formulario de este registro."));
      return;
    }
    root.appendChild(el2("div", "ro-banner",
      `Solo lectura · Llenado por ${s.savedByName} · ` +
      new Date(s.savedAt).toLocaleString("es-CR")));
    const formWrap = document.createElement("div");
    root.appendChild(formWrap);
    Render.renderForm(schema, formWrap, { readonly: true, data: s.data || {} });
    window.scrollTo({ top: 0, behavior: "instant" });
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
      [fUsuario, fNombre, fPass, fRol].forEach(f => grid.appendChild(f));
      formCard.appendChild(grid);

      const actions = el2("div", "form-actions");
      actions.appendChild(mkBtn(editing ? "Guardar cambios" : "Crear usuario", "btn btn-primary", async () => {
        const body = {
          nombre: fNombre._input.value.trim(),
          rol: fRol._input.value,
          password: fPass._input.value
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
        "<th>Registros</th><th></th></tr></thead>";
      const tbody = document.createElement("tbody");
      usuarios.forEach(u => {
        const tr = document.createElement("tr");
        tr.appendChild(el2("td", "cell-main", u.usuario));
        tr.appendChild(el2("td", null, u.nombre));
        const tdRol = document.createElement("td");
        tdRol.appendChild(el2("span", "rol-badge rol-" + u.rol,
          u.rol === "admin" ? "Administrador" : "Operador"));
        tr.appendChild(tdRol);
        tr.appendChild(el2("td", null, String(u.submissions != null ? u.submissions : "—")));
        const acc = el2("td", "row-actions");
        acc.appendChild(mkBtn("Editar", "btn btn-sm", () => {
          editId = u.id; drawForm(); window.scrollTo({ top: 0, behavior: "instant" });
        }));
        const del = mkBtn("Eliminar", "btn btn-sm btn-danger", async () => {
          const warn = u.submissions > 0
            ? `Eliminar a ${u.usuario} también borrará sus ${u.submissions} registro(s) guardado(s). ¿Continuar?`
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

  function downloadJSON(submission, form) {
    const filename = `${(form && form.code) || submission.formId}_${submission.savedAt.slice(0,10)}.json`;
    const blob = new Blob([JSON.stringify(submission, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // --- Navigation ---
  function goSelect() {
    state = { view: "select", currentFormId: null };
    render();
  }
  function goForm(id) {
    state = { view: "form", currentFormId: id };
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
    state.view = me ? "select" : "login";
    render();
  }

  return { init, goSelect, goForm, handleSave };
})();

document.addEventListener("DOMContentLoaded", App.init);
