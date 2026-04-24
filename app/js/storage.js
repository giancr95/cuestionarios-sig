// ---------------------------------------------------------------------------
// Cliente del API. Todos los métodos devuelven Promises.
// El servidor maneja sesión con cookie httpOnly (credentials: include).
// ---------------------------------------------------------------------------
const Store = (() => {
  const BASE = "/api";
  let cached = null; // usuario en caché (evita pedir /me en cada render)

  async function req(method, path, body) {
    const opts = {
      method,
      credentials: "same-origin",
      headers: { "Accept": "application/json" }
    };
    if (body !== undefined) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    const r = await fetch(BASE + path, opts);
    let data = null;
    try { data = await r.json(); } catch (_) {}
    if (!r.ok) {
      const msg = (data && data.error) || `HTTP ${r.status}`;
      const err = new Error(msg);
      err.status = r.status;
      throw err;
    }
    return data;
  }

  async function login(usuario, password) {
    const u = await req("POST", "/login", { usuario, password });
    cached = u;
    return u;
  }

  async function logout() {
    try { await req("POST", "/logout"); } catch (_) {}
    cached = null;
  }

  async function currentUser({ refresh } = {}) {
    if (cached && !refresh) return cached;
    try {
      cached = await req("GET", "/me");
      return cached;
    } catch (e) {
      cached = null;
      return null;
    }
  }

  function cachedUser() { return cached; }

  async function allSubmissions() {
    return req("GET", "/submissions");
  }

  async function saveSubmission(formId, data) {
    return req("POST", "/submissions", { formId, data });
  }

  async function getSubmission(id) {
    return req("GET", "/submissions/" + encodeURIComponent(id));
  }

  async function deleteSubmission(id) {
    return req("DELETE", "/submissions/" + encodeURIComponent(id));
  }

  return {
    login, logout, currentUser, cachedUser,
    allSubmissions, saveSubmission, getSubmission, deleteSubmission
  };
})();
