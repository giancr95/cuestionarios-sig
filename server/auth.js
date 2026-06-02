const bcrypt = require("bcryptjs");
const db = require("./db");

function parseAreas(s) {
  if (!s) return null;
  try { const a = JSON.parse(s); return Array.isArray(a) && a.length ? a : null; }
  catch { return null; }
}

function login(usuario, password) {
  const u = db
    .prepare("SELECT id, usuario, nombre, password, rol, activo, is_reviewer, areas FROM users WHERE usuario = ? COLLATE NOCASE")
    .get(String(usuario || "").trim());
  if (!u) return null;
  if (!bcrypt.compareSync(password, u.password)) return null;
  if (!u.activo) return { inactive: true };
  return {
    id: u.id, usuario: u.usuario, nombre: u.nombre, rol: u.rol,
    isReviewer: !!u.is_reviewer, areas: parseAreas(u.areas)
  };
}

function requireAuth(req, res, next) {
  if (!req.session || !req.session.uid) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const u = db.prepare("SELECT id, usuario, nombre, rol, activo, is_reviewer, areas FROM users WHERE id = ?").get(req.session.uid);
  if (!u || !u.activo) {
    req.session = null;
    return res.status(401).json({ error: "Sesión inválida" });
  }
  req.user = {
    id: u.id, usuario: u.usuario, nombre: u.nombre, rol: u.rol,
    isReviewer: !!u.is_reviewer, areas: parseAreas(u.areas)
  };
  next();
}

function requireReviewer(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (!req.user.isReviewer && req.user.rol !== "admin") {
      return res.status(403).json({ error: "Requiere permisos de revisor" });
    }
    next();
  });
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

module.exports = { login, requireAuth, requireAdmin, requireReviewer };
