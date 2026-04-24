const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cookieSession = require("cookie-session");

const { login, requireAuth } = require("./auth");
const subs = require("./submissions");

const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  (NODE_ENV === "production"
    ? (() => { throw new Error("SESSION_SECRET requerido en producción"); })()
    : "dev-secret-change-me");

const APP_DIR = path.join(__dirname, "..", "app");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1); // Coolify/Traefik frente a nosotros

app.use(express.json({ limit: "1mb" }));
app.use(
  cookieSession({
    name: "sig_sess",
    keys: [SESSION_SECRET],
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    httpOnly: true,
    sameSite: "lax",
    secure: NODE_ENV === "production"
  })
);

// ---------- Rate limit muy simple (memoria) para /api/login ----------
const loginAttempts = new Map();
function loginRateLimit(req, res, next) {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, resetAt: now + 60_000 };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + 60_000; }
  entry.count++;
  loginAttempts.set(ip, entry);
  if (entry.count > 10) {
    return res.status(429).json({ error: "Demasiados intentos. Espere un minuto." });
  }
  next();
}

// ---------- API ----------
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.post("/api/login", loginRateLimit, (req, res) => {
  const { usuario, password } = req.body || {};
  if (!usuario || !password) return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  const u = login(usuario, password);
  if (!u) return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  req.session.uid = u.id;
  req.session.iat = Date.now();
  res.json({ usuario: u.usuario, nombre: u.nombre, rol: u.rol });
});

app.post("/api/logout", (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json({
    usuario: req.user.usuario,
    nombre: req.user.nombre,
    rol: req.user.rol
  });
});

app.get("/api/submissions", requireAuth, (req, res) => {
  const list = subs.list({ userId: req.user.id, isAdmin: req.user.rol === "admin" });
  res.json(list);
});

app.post("/api/submissions", requireAuth, (req, res) => {
  const { formId, data } = req.body || {};
  if (!formId || !data || typeof data !== "object") {
    return res.status(400).json({ error: "formId y data requeridos" });
  }
  const rec = subs.create(req.user.id, req.user.nombre, formId, data);
  res.status(201).json(rec);
});

app.get("/api/submissions/:id", requireAuth, (req, res) => {
  const rec = subs.get(req.params.id);
  if (!rec) return res.status(404).json({ error: "No encontrado" });
  if (req.user.rol !== "admin" && rec.savedBy !== req.user.id) {
    return res.status(403).json({ error: "Sin permiso" });
  }
  res.json(rec);
});

app.delete("/api/submissions/:id", requireAuth, (req, res) => {
  const ok = subs.remove(req.params.id, { userId: req.user.id, isAdmin: req.user.rol === "admin" });
  if (!ok) return res.status(404).json({ error: "No encontrado o sin permiso" });
  res.json({ ok: true });
});

// ---------- Archivos estáticos (frontend) ----------
app.use(express.static(APP_DIR, { index: "index.html", extensions: ["html"] }));

// SPA fallback (cualquier ruta no-API sirve index.html)
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(APP_DIR, "index.html"));
});

// ---------- Error handler ----------
app.use((err, _req, res, _next) => {
  console.error("[error]", err);
  res.status(err.status || 500).json({ error: err.message || "Error interno" });
});

app.listen(PORT, () => {
  console.log(`[sig] escuchando en :${PORT}  (${NODE_ENV})`);
});
