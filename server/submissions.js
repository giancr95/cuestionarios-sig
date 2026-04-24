const db = require("./db");

function genId() {
  return "S" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function create(userId, userName, formId, data) {
  const id = genId();
  db.prepare(
    "INSERT INTO submissions (id, form_id, user_id, user_name, data) VALUES (?, ?, ?, ?, ?)"
  ).run(id, formId, userId, userName, JSON.stringify(data));
  return get(id);
}

function get(id) {
  const r = db
    .prepare("SELECT id, form_id, user_id, user_name, data, created_at FROM submissions WHERE id = ?")
    .get(id);
  return r ? shape(r) : null;
}

function list({ userId, isAdmin }) {
  const rows = isAdmin
    ? db.prepare("SELECT id, form_id, user_id, user_name, data, created_at FROM submissions ORDER BY created_at DESC").all()
    : db.prepare("SELECT id, form_id, user_id, user_name, data, created_at FROM submissions WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  return rows.map(shape);
}

function remove(id, { userId, isAdmin }) {
  const row = db.prepare("SELECT user_id FROM submissions WHERE id = ?").get(id);
  if (!row) return false;
  if (!isAdmin && row.user_id !== userId) return false;
  db.prepare("DELETE FROM submissions WHERE id = ?").run(id);
  return true;
}

function shape(r) {
  return {
    id: r.id,
    formId: r.form_id,
    savedBy: r.user_id,
    savedByName: r.user_name,
    savedAt: r.created_at,
    data: safeParse(r.data)
  };
}
function safeParse(s) { try { return JSON.parse(s); } catch { return {}; } }

module.exports = { create, get, list, remove };
