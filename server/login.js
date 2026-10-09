// server/login.js — ingreso directo al SIG con la cuenta de Odoo.
//
// La contraseña la valida Odoo (POST {ODOO_URL}/liborio/sso/login/sig con el
// secreto de la app); Odoo responde con el mismo token que manda el lanzador y
// la sesión se crea igual que en el handoff SSO (rol desde Odoo; revisor,
// aprobador y áreas siguen administrándose acá).
//
// Transición: hasta LOGIN_LOCAL_HASTA (fecha de Costa Rica, inclusive) también
// sirve la contraseña local del SIG. Después de esa fecha solo entra Odoo.
"use strict";
const bcrypt = require("bcryptjs");
const db = require("./db");
const { sessionFromToken } = require("./sso");

const APP_CODE = "sig";
const ODOO_URL = (process.env.ODOO_URL || "https://erp.liboriocr.com").replace(/\/+$/, "");
const ODOO_TIMEOUT_MS = 10_000;
const DEFAULT_HASTA = "2026-10-31";
const LOCAL_HASTA = /^\d{4}-\d{2}-\d{2}$/.test(process.env.LOGIN_LOCAL_HASTA || "")
  ? process.env.LOGIN_LOCAL_HASTA
  : DEFAULT_HASTA;

const MSG_ODOO_CAIDO = "No se pudo validar con Odoo, intentá de nuevo.";
const MSG_INACTIVA = "La cuenta está desactivada. Contacte al administrador.";

function hoyCR() {
  // en-CA formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Costa_Rica" }).format(new Date());
}

function claveLocalVigente() {
  return hoyCR() <= LOCAL_HASTA;
}

// "1 de noviembre" — primer día en que ya no sirve la clave local.
function primerDiaSoloOdoo() {
  const d = new Date(LOCAL_HASTA + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toLocaleDateString("es-CR", { day: "numeric", month: "long", timeZone: "UTC" });
}

function loginInfo() {
  return { localHasta: LOCAL_HASTA, localActivo: claveLocalVigente(), soloOdooDesde: primerDiaSoloOdoo() };
}

const esCuentaOdoo = (usuario) => String(usuario || "").includes("@");

// Busca por usuario actual y, si no aparece, por el usuario anterior
// (p.ej. el código de empleado con que entraba antes de pasar al correo).
function findAccount(input) {
  const cols = "id, usuario, nombre, password, activo";
  return (
    db.prepare(`SELECT ${cols} FROM users WHERE usuario = ? COLLATE NOCASE`).get(input) ||
    db.prepare(`SELECT ${cols} FROM users WHERE usuario_anterior = ? COLLATE NOCASE ORDER BY activo DESC, id LIMIT 1`).get(input) ||
    null
  );
}

async function verificarEnOdoo(login, password, clientIp) {
  const secret = process.env.ODOO_SSO_SECRET;
  if (!secret) {
    console.error("[login] falta ODOO_SSO_SECRET: no se puede validar con Odoo");
    return { status: 503, error: MSG_ODOO_CAIDO };
  }
  let r, data = null;
  try {
    r = await fetch(`${ODOO_URL}/liborio/sso/login/${APP_CODE}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ login, password, client_ip: clientIp || "" }),
      signal: AbortSignal.timeout(ODOO_TIMEOUT_MS)
    });
    try { data = await r.json(); } catch (_) { data = null; }
  } catch (e) {
    console.error("[login] Odoo no responde:", e.name === "TimeoutError" ? "timeout" : e.message);
    return { status: 503, error: MSG_ODOO_CAIDO };
  }
  const error = data && typeof data.error === "string" ? data.error : null;
  if (r.status === 200 && data && typeof data.token === "string") return { status: 200, token: data.token };
  if (error === "app_no_autorizada") {
    console.error("[login] Odoo rechazó el secreto de la app (app_no_autorizada): revisar ODOO_SSO_SECRET");
    return { status: 503, error: MSG_ODOO_CAIDO };
  }
  if (r.status === 401) return { status: 401, error: error || "Usuario o contraseña incorrectos." };
  if (r.status === 403) return { status: 403, error: error || "Tu usuario no tiene acceso a esta aplicación." };
  if (r.status === 429) return { status: 429, error: error || "Demasiados intentos. Esperá unos minutos." };
  console.error(`[login] respuesta inesperada de Odoo: HTTP ${r.status}`);
  return { status: 503, error: MSG_ODOO_CAIDO };
}

function sessionUser(uid) {
  const u = db.prepare("SELECT id, usuario, nombre, rol, is_reviewer, is_approver, areas FROM users WHERE id = ?").get(uid);
  let areas = null;
  try { const a = JSON.parse(u.areas || "null"); areas = Array.isArray(a) && a.length ? a : null; } catch (_) {}
  return {
    id: u.id, usuario: u.usuario, nombre: u.nombre, rol: u.rol,
    isReviewer: !!u.is_reviewer, isApprover: !!u.is_approver, areas
  };
}

async function loginHandler(req, res) {
  const { usuario, password } = req.body || {};
  const input = String(usuario || "").trim();
  if (!input || !password) return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  const pwd = String(password);
  const acc = findAccount(input);

  // 1) Transición: la clave local del SIG sigue sirviendo hasta el plazo.
  if (acc && claveLocalVigente() && bcrypt.compareSync(pwd, acc.password)) {
    if (!acc.activo) return res.status(403).json({ error: MSG_INACTIVA });
    req.session.uid = acc.id;
    req.session.iat = Date.now();
    const desde = primerDiaSoloOdoo();
    const aviso = esCuentaOdoo(acc.usuario)
      ? `Tu usuario es ${acc.usuario}. Desde el ${desde} se entra con la contraseña de Odoo; pedila a Recursos Humanos.`
      : `Desde el ${desde} solo se podrá entrar con la cuenta de Odoo (correo y contraseña). Pedí la tuya a Recursos Humanos.`;
    return res.json({ ...sessionUser(acc.id), aviso });
  }

  // 2) Odoo valida la contraseña y devuelve el mismo token del lanzador.
  const odooLogin = acc && esCuentaOdoo(acc.usuario) ? acc.usuario : input;
  const r = await verificarEnOdoo(odooLogin, pwd, req.ip);
  if (r.status !== 200) return res.status(r.status).json({ error: r.error });
  const s = sessionFromToken(req, r.token);
  if (s.error === "inactivo") return res.status(403).json({ error: MSG_INACTIVA });
  if (s.error) {
    console.error(`[login] token de Odoo rechazado (${s.error})`);
    return res.status(503).json({ error: MSG_ODOO_CAIDO });
  }
  return res.json(sessionUser(s.uid));
}

module.exports = { loginHandler, loginInfo };
