// ---------------------------------------------------------------------------
// Gestión de usuarios (solo administradores). Las contraseñas se guardan
// con hash bcrypt; nunca se devuelven al cliente. Los usuarios no se eliminan
// por defecto: se desactivan (activo = 0) para conservar sus registros.
// Cada usuario puede tener una lista de áreas asignadas (JSON) y la marca
// is_reviewer que lo habilita como revisor de los registros pendientes.
// ---------------------------------------------------------------------------
const bcrypt = require("bcryptjs");
const db = require("./db");

function httpErr(status, msg) {
  const e = new Error(msg);
  e.status = status;
  return e;
}

function parseAreas(s) {
  if (!s) return null;
  try { const a = JSON.parse(s); return Array.isArray(a) && a.length ? a : null; }
  catch { return null; }
}

function normalizeAreas(v) {
  if (v == null) return null;
  if (!Array.isArray(v)) return null;
  const clean = v.map(x => String(x).trim()).filter(Boolean);
  return clean.length ? JSON.stringify(clean) : null;
}

function publicRow(id) {
  const r = db
    .prepare("SELECT id, usuario, nombre, rol, activo, is_reviewer, areas, created_at FROM users WHERE id = ?")
    .get(id);
  if (!r) return null;
  return {
    ...r,
    activo: !!r.activo,
    isReviewer: !!r.is_reviewer,
    areas: parseAreas(r.areas)
  };
}

function activeAdminCount() {
  return db.prepare("SELECT COUNT(*) AS n FROM users WHERE rol = 'admin' AND activo = 1").get().n;
}

function submissionCount(userId) {
  return db.prepare("SELECT COUNT(*) AS n FROM submissions WHERE user_id = ?").get(userId).n;
}

function list() {
  return db
    .prepare("SELECT id, usuario, nombre, rol, activo, is_reviewer, areas, created_at FROM users ORDER BY activo DESC, rol, usuario COLLATE NOCASE")
    .all()
    .map(u => ({
      ...u,
      activo: !!u.activo,
      isReviewer: !!u.is_reviewer,
      areas: parseAreas(u.areas),
      submissions: submissionCount(u.id)
    }));
}

function create({ usuario, nombre, password, rol, isReviewer, areas }) {
  usuario = String(usuario || "").trim();
  nombre = String(nombre || "").trim();
  rol = rol === "admin" ? "admin" : "operador";
  if (!usuario || !nombre || !password) {
    throw httpErr(400, "Usuario, nombre y contraseña son obligatorios");
  }
  if (String(password).length < 4) {
    throw httpErr(400, "La contraseña debe tener al menos 4 caracteres");
  }
  if (db.prepare("SELECT id FROM users WHERE usuario = ? COLLATE NOCASE").get(usuario)) {
    throw httpErr(409, "Ya existe un usuario con ese nombre de acceso");
  }
  const info = db
    .prepare("INSERT INTO users (usuario, nombre, password, rol, is_reviewer, areas) VALUES (?, ?, ?, ?, ?, ?)")
    .run(
      usuario, nombre,
      bcrypt.hashSync(String(password), 10),
      rol,
      isReviewer ? 1 : 0,
      normalizeAreas(areas)
    );
  return publicRow(info.lastInsertRowid);
}

function update(id, body, currentUserId) {
  const { nombre, password, rol, activo, isReviewer, areas } = body || {};
  const u = db.prepare("SELECT id, rol, activo FROM users WHERE id = ?").get(id);
  if (!u) throw httpErr(404, "Usuario no encontrado");

  const sets = [];
  const vals = [];

  if (nombre != null && String(nombre).trim()) {
    sets.push("nombre = ?"); vals.push(String(nombre).trim());
  }
  if (rol != null) {
    const r = rol === "admin" ? "admin" : "operador";
    if (u.rol === "admin" && r !== "admin" && u.activo && activeAdminCount() <= 1) {
      throw httpErr(400, "Debe existir al menos un administrador activo");
    }
    sets.push("rol = ?"); vals.push(r);
  }
  if (activo != null) {
    const a = activo ? 1 : 0;
    if (!a) {
      if (u.id === currentUserId) throw httpErr(400, "No puede desactivar su propia cuenta");
      if (u.rol === "admin" && u.activo && activeAdminCount() <= 1) {
        throw httpErr(400, "Debe existir al menos un administrador activo");
      }
    }
    sets.push("activo = ?"); vals.push(a);
  }
  if (isReviewer != null) {
    sets.push("is_reviewer = ?"); vals.push(isReviewer ? 1 : 0);
  }
  if (areas !== undefined) {
    sets.push("areas = ?"); vals.push(normalizeAreas(areas));
  }
  if (password != null && String(password) !== "") {
    if (String(password).length < 4) throw httpErr(400, "La contraseña debe tener al menos 4 caracteres");
    sets.push("password = ?"); vals.push(bcrypt.hashSync(String(password), 10));
  }

  if (!sets.length) throw httpErr(400, "No se indicó ningún cambio");
  vals.push(id);
  db.prepare("UPDATE users SET " + sets.join(", ") + " WHERE id = ?").run(...vals);
  return publicRow(id);
}

function remove(id, currentUserId) {
  const u = db.prepare("SELECT id, rol, activo FROM users WHERE id = ?").get(id);
  if (!u) return false;
  if (u.id === currentUserId) throw httpErr(400, "No puede eliminar su propia cuenta");
  if (u.rol === "admin" && u.activo && activeAdminCount() <= 1) {
    throw httpErr(400, "Debe existir al menos un administrador activo");
  }
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  return true;
}

module.exports = { list, create, update, remove };
