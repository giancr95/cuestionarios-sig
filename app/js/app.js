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

  // --- Topbar ---
  function updateTopbar() {
    const user = Store.cachedUser();
    if (!user || state.view === "login") {
      topbar.hidden = true;
      return;
    }
    topbar.hidden = false;
    userChip.textContent = user.rol === "admin" ? `${user.nombre} · admin` : user.nombre;
    btnBack.hidden = state.view === "select";
  }

  btnBack.addEventListener("click", () => goSelect());
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
    const title = document.createElement("h1");
    title.className = "page-title";
    title.textContent = "Seleccione el registro a completar";
    const sub = document.createElement("p");
    sub.className = "page-sub";
    sub.textContent = "Formularios del Sistema Integrado de Gestión.";
    root.appendChild(title);
    root.appendChild(sub);

    const grid = document.createElement("div");
    grid.className = "form-grid";
    FORMS.forEach(f => {
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
    });
    root.appendChild(grid);

    const savedBtn = document.createElement("button");
    savedBtn.className = "btn btn-ghost";
    savedBtn.style.marginTop = "18px";
    savedBtn.textContent = "Ver registros guardados";
    savedBtn.addEventListener("click", () => { state.view = "saved"; render(); });
    root.appendChild(savedBtn);
  }

  function renderFormView() {
    const schema = FORMS.find(f => f.id === state.currentFormId);
    if (!schema) { goSelect(); return; }
    Render.renderForm(schema, root);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  async function renderSaved() {
    root.innerHTML = "";
    const user = Store.cachedUser();
    const title = document.createElement("h1");
    title.className = "page-title";
    title.textContent = user && user.rol === "admin" ? "Todos los registros guardados" : "Mis registros guardados";
    const sub = document.createElement("p");
    sub.className = "page-sub";
    sub.textContent = user && user.rol === "admin"
      ? "Visualización de administrador: todos los registros del sistema."
      : "Registros enviados por su cuenta.";
    root.appendChild(title);
    root.appendChild(sub);

    const loading = document.createElement("div");
    loading.className = "empty";
    loading.textContent = "Cargando…";
    root.appendChild(loading);

    let subsList = [];
    try {
      subsList = await Store.allSubmissions();
    } catch (err) {
      loading.textContent = "No fue posible cargar los registros.";
      showToast(err.message || "Error al cargar", "err");
      return;
    }
    loading.remove();

    if (!subsList.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "Aún no hay registros guardados.";
      root.appendChild(empty);
      addBack();
      return;
    }

    const list = document.createElement("div");
    list.className = "saved-list";
    subsList.forEach(s => {
      const form = FORMS.find(f => f.id === s.formId);
      const item = document.createElement("div");
      item.className = "saved-item";
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.innerHTML = `
        <div class="title">${form ? form.shortTitle : s.formId}</div>
        <div class="sub">${new Date(s.savedAt).toLocaleString("es-CR")} · ${s.savedByName}</div>`;
      item.appendChild(meta);

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.gap = "6px";
      const dl = document.createElement("button");
      dl.className = "btn";
      dl.textContent = "Descargar";
      dl.addEventListener("click", () => downloadJSON(s, form));
      const rm = document.createElement("button");
      rm.className = "btn btn-danger";
      rm.textContent = "Eliminar";
      rm.addEventListener("click", async () => {
        if (!confirm("¿Eliminar este registro?")) return;
        try {
          await Store.deleteSubmission(s.id);
          render();
        } catch (err) {
          showToast(err.message || "No se pudo eliminar", "err");
        }
      });
      actions.appendChild(dl);
      actions.appendChild(rm);
      item.appendChild(actions);
      list.appendChild(item);
    });
    root.appendChild(list);
    addBack();
  }

  function addBack() {
    const back = document.createElement("button");
    back.className = "btn btn-ghost";
    back.style.marginTop = "18px";
    back.textContent = "← Volver";
    back.addEventListener("click", () => goSelect());
    root.appendChild(back);
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
