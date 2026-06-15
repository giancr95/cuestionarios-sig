const db = require("./db");

function httpErr(status, msg) {
  const e = new Error(msg);
  e.status = status;
  return e;
}

function genId() {
  return "S" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// El estado inicial depende de quién envía el registro: los administradores
// generan registros aprobados; el resto entra en estado pendiente para que
// los revisores activos lo aprueben.
function initialStatus(user) {
  return user && user.rol === "admin" ? "approved" : "pending";
}

function create(user, formId, data) {
  const id = genId();
  const status = initialStatus(user);
  db.prepare(
    "INSERT INTO submissions (id, form_id, user_id, user_name, data, status) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, formId, user.id, user.nombre, JSON.stringify(data), status);
  return get(id);
}

function get(id) {
  const r = db
    .prepare("SELECT id, form_id, user_id, user_name, data, status, edited_at, edited_by_id, edited_by_name, created_at FROM submissions WHERE id = ?")
    .get(id);
  return r ? shape(r) : null;
}

// `user` es req.user (id, rol, isReviewer, isApprover).
//   admin     → ve todos los registros.
//   reviewer  → ve los propios + los pendientes (para marcar como revisado).
//   approver  → ve los propios + los revisados (para aprobar).
//   operador  → solo los propios.
// Si una persona es ambos (reviewer + approver), ve propios + pendientes + revisados.
function list(user) {
  const SEL = "SELECT id, form_id, user_id, user_name, data, status, edited_at, edited_by_id, edited_by_name, created_at FROM submissions";
  let rows;
  if (user.rol === "admin") {
    rows = db.prepare(SEL + " ORDER BY created_at DESC").all();
  } else if (user.isReviewer || user.isApprover) {
    const wantedStatuses = [];
    if (user.isReviewer) wantedStatuses.push("'pending'");
    if (user.isApprover) wantedStatuses.push("'revisado'");
    const cond = wantedStatuses.length ? " OR status IN (" + wantedStatuses.join(",") + ")" : "";
    rows = db.prepare(SEL + " WHERE user_id = ?" + cond + " ORDER BY created_at DESC").all(user.id);
  } else {
    rows = db.prepare(SEL + " WHERE user_id = ? ORDER BY created_at DESC").all(user.id);
  }
  return rows.map(shape);
}

// Puede editar un registro:
//   - un administrador, siempre;
//   - el autor, mientras el registro siga en `pending`.
// Una vez revisado o aprobado, solo el administrador puede tocarlo.
function update(id, user, data) {
  const sub = db.prepare("SELECT id, user_id, status FROM submissions WHERE id = ?").get(id);
  if (!sub) throw httpErr(404, "Registro no encontrado");
  if (data == null || typeof data !== "object") throw httpErr(400, "Datos inválidos");
  const isAdmin = user.rol === "admin";
  const isOwner = sub.user_id === user.id;
  if (!(isAdmin || (isOwner && sub.status === "pending"))) {
    throw httpErr(403, "Solo el autor puede modificarlo mientras esté pendiente; tras la revisión solo lo edita el administrador.");
  }
  db.prepare(
    "UPDATE submissions SET data = ?, edited_at = CURRENT_TIMESTAMP, edited_by_id = ?, edited_by_name = ? WHERE id = ?"
  ).run(JSON.stringify(data), user.id, user.nombre, id);
  return get(id);
}

function remove(id, { userId, isAdmin }) {
  const row = db.prepare("SELECT user_id FROM submissions WHERE id = ?").get(id);
  if (!row) return false;
  if (!isAdmin && row.user_id !== userId) return false;
  db.prepare("DELETE FROM submissions WHERE id = ?").run(id);
  return true;
}

// Flujo de aprobación en dos pasos:
//   pending  → revisado : un usuario con is_reviewer = 1 marca como revisado.
//   revisado → approved : un usuario con is_approver = 1 lo aprueba.
// Quien acciona queda registrado en submission_reviews para el historial.
function addReview(submissionId, user) {
  const sub = db.prepare("SELECT id, status FROM submissions WHERE id = ?").get(submissionId);
  if (!sub) throw httpErr(404, "Registro no encontrado");
  if (sub.status === "approved") throw httpErr(400, "El registro ya está aprobado");

  let next;
  if (sub.status === "pending") {
    if (!user.isReviewer && user.rol !== "admin") {
      throw httpErr(403, "Este registro está pendiente; requiere revisor");
    }
    next = "revisado";
  } else if (sub.status === "revisado") {
    if (!user.isApprover && user.rol !== "admin") {
      throw httpErr(403, "Este registro está revisado; requiere aprobador");
    }
    next = "approved";
  } else {
    throw httpErr(400, "Estado del registro no permite acciones");
  }

  db.prepare(
    "INSERT OR IGNORE INTO submission_reviews (submission_id, reviewer_id, reviewer_name) VALUES (?, ?, ?)"
  ).run(submissionId, user.id, user.nombre);
  db.prepare("UPDATE submissions SET status = ? WHERE id = ?").run(next, submissionId);
  return get(submissionId);
}

function shape(r) {
  const approvals = db.prepare(
    "SELECT reviewer_id, reviewer_name, approved_at FROM submission_reviews WHERE submission_id = ? ORDER BY approved_at"
  ).all(r.id);
  return {
    id: r.id,
    formId: r.form_id,
    savedBy: r.user_id,
    savedByName: r.user_name,
    savedAt: r.created_at,
    status: r.status,
    editedAt: r.edited_at,
    editedById: r.edited_by_id,
    editedByName: r.edited_by_name,
    approvals,
    data: safeParse(r.data)
  };
}
function safeParse(s) { try { return JSON.parse(s); } catch { return {}; } }

// El último registro enviado para un formulario, independientemente del
// usuario o del estado. Sirve para precargar valores (ej. saldo previo).
function latestForForm(formId) {
  const r = db.prepare(
    "SELECT id, form_id, user_id, user_name, data, status, edited_at, edited_by_id, edited_by_name, created_at FROM submissions WHERE form_id = ? ORDER BY created_at DESC LIMIT 1"
  ).get(formId);
  return r ? shape(r) : null;
}

module.exports = { create, get, list, update, remove, addReview, latestForForm };
