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

// `user` es req.user (id, rol, isReviewer).
//   admin     → ve todos los registros.
//   reviewer  → ve los propios + los pendientes que aún no haya aprobado.
//   operador  → ve los propios.
function list(user) {
  let rows;
  if (user.rol === "admin") {
    rows = db.prepare(
      "SELECT id, form_id, user_id, user_name, data, status, edited_at, edited_by_id, edited_by_name, created_at FROM submissions ORDER BY created_at DESC"
    ).all();
  } else if (user.isReviewer) {
    rows = db.prepare(
      "SELECT id, form_id, user_id, user_name, data, status, edited_at, edited_by_id, edited_by_name, created_at FROM submissions s " +
      "WHERE s.user_id = ? OR (s.status = 'pending' AND NOT EXISTS (" +
      "  SELECT 1 FROM submission_reviews r WHERE r.submission_id = s.id AND r.reviewer_id = ?" +
      ")) ORDER BY created_at DESC"
    ).all(user.id, user.id);
  } else {
    rows = db.prepare(
      "SELECT id, form_id, user_id, user_name, data, status, edited_at, edited_by_id, edited_by_name, created_at FROM submissions WHERE user_id = ? ORDER BY created_at DESC"
    ).all(user.id);
  }
  return rows.map(shape);
}

function update(id, user, data) {
  const sub = db.prepare("SELECT id FROM submissions WHERE id = ?").get(id);
  if (!sub) throw httpErr(404, "Registro no encontrado");
  if (data == null || typeof data !== "object") throw httpErr(400, "Datos inválidos");
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

// Registra la aprobación de un revisor. Si todos los revisores activos del
// sistema (is_reviewer = 1 AND activo = 1) han aprobado, el estado pasa a
// `approved`.
function addReview(submissionId, reviewer) {
  const sub = db.prepare("SELECT id, status FROM submissions WHERE id = ?").get(submissionId);
  if (!sub) throw httpErr(404, "Registro no encontrado");
  if (sub.status === "approved") throw httpErr(400, "El registro ya está aprobado");

  db.prepare(
    "INSERT OR IGNORE INTO submission_reviews (submission_id, reviewer_id, reviewer_name) VALUES (?, ?, ?)"
  ).run(submissionId, reviewer.id, reviewer.nombre);

  const totalReviewers = db.prepare(
    "SELECT COUNT(*) AS n FROM users WHERE is_reviewer = 1 AND activo = 1"
  ).get().n;
  const approvals = db.prepare(
    "SELECT COUNT(DISTINCT reviewer_id) AS n FROM submission_reviews WHERE submission_id = ?"
  ).get(submissionId).n;
  if (totalReviewers > 0 && approvals >= totalReviewers) {
    db.prepare("UPDATE submissions SET status = 'approved' WHERE id = ?").run(submissionId);
  }
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

module.exports = { create, get, list, update, remove, addReview };
