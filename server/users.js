// ---------------------------------------------------------------------------
// Gestión de usuarios (solo administradores). Las contraseñas se guardan
// con hash bcrypt; nunca se devuelven al cliente.
// ---------------------------------------------------------------------------
const bcrypt = require("bcryptjs");
const db = require("./db");

function httpErr(status, msg) {
  const e = new Error(msg);
  e.status = status;
  return e;
}

function publicRow(id) {
  return db
    .prepare("SELECT id, usuario, nombre, rol, created_at FROM users WHERE id = ?")
    .get(id);
}

function adminCount() {
  return db.prepare("SELECT COUNT(*) AS n FROM users WHERE rol = 'admin'").get().n;
}

function submissionCount(userId) {
  return db.prepare("SELECT COUNT(*) AS n FROM submissions WHERE user_id = ?").get(userId).n;
}

function list() {
  return db
    .prepare("SELECT id, usuario, nombre, rol, created_at FROM users ORDER BY rol, usuario COLLATE NOCASE")
    .all()
    .map(u => ({ ...u, submissions: submissionCount(u.id) }));
}

function create({ usuario, nombre, password, rol }) {
  usuario = String(usuario || "").trim();
  nombre = String(nombre || "").trim();
  rol = rol === "admin" ? "admin" : "operador";
  if (!usuario || !nombre || !password) {
    throw httpErr(400, "Usuario, nombre y contraseña son obligatorios");
  }
  if (String(password).length < 4) {
    throw httpErr(400, "La contraseña debe tener al menos 4 caracteres");
  }
  const exists = db
    .prepare("SELECT id FROM users WHERE usuario = ? COLLATE NOCASE")
    .get(usuario);
  if (exists) throw httpErr(409, "Ya existe un usuario con ese nombre de acceso");

  const info = db
    .prepare("INSERT INTO users (usuario, nombre, password, rol) VALUES (?, ?, ?, ?)")
    .run(usuario, nombre, bcrypt.hashSync(String(password), 10), rol);
  return publicRow(info.lastInsertRowid);
}

function update(id, { nombre, password, rol }) {
  const u = db.prepare("SELECT id, rol FROM users WHERE id = ?").get(id);
  if (!u) throw httpErr(404, "Usuario no encontrado");

  const sets = [];
  const vals = [];
  if (nombre != null && String(nombre).trim()) {
    sets.push("nombre = ?");
    vals.push(String(nombre).trim());
  }
  if (rol != null) {
    const r = rol === "admin" ? "admin" : "operador";
    if (u.rol === "admin" && r !== "admin" && adminCount() <= 1) {
      throw httpErr(400, "Debe existir al menos un administrador");
    }
    sets.push("rol = ?");
    vals.push(r);
  }
  if (password != null && String(password) !== "") {
    if (String(password).length < 4) {
      throw httpErr(400, "La contraseña debe tener al menos 4 caracteres");
    }
    sets.push("password = ?");
    vals.push(bcrypt.hashSync(String(password), 10));
  }
  if (!sets.length) throw httpErr(400, "No se indicó ningún cambio");

  vals.push(id);
  db.prepare("UPDATE users SET " + sets.join(", ") + " WHERE id = ?").run(...vals);
  return publicRow(id);
}

function remove(id, currentUserId) {
  const u = db.prepare("SELECT id, rol FROM users WHERE id = ?").get(id);
  if (!u) return false;
  if (u.id === currentUserId) {
    throw httpErr(400, "No puede eliminar su propia cuenta");
  }
  if (u.rol === "admin" && adminCount() <= 1) {
    throw httpErr(400, "Debe existir al menos un administrador");
  }
  // Nota: las submissions del usuario se eliminan en cascada (FK ON DELETE CASCADE).
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  return true;
}

module.exports = { list, create, update, remove };
