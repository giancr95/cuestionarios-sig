const bcrypt = require("bcryptjs");
const db = require("./db");

function login(usuario, password) {
  const u = db
    .prepare("SELECT id, usuario, nombre, password, rol FROM users WHERE usuario = ? COLLATE NOCASE")
    .get(String(usuario || "").trim());
  if (!u) return null;
  if (!bcrypt.compareSync(password, u.password)) return null;
  return { id: u.id, usuario: u.usuario, nombre: u.nombre, rol: u.rol };
}

function requireAuth(req, res, next) {
  if (!req.session || !req.session.uid) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const u = db.prepare("SELECT id, usuario, nombre, rol FROM users WHERE id = ?").get(req.session.uid);
  if (!u) {
    req.session = null;
    return res.status(401).json({ error: "Sesión inválida" });
  }
  req.user = u;
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Requiere permisos de administrador" });
    }
    next();
  });
}

module.exports = { login, requireAuth, requireAdmin };
