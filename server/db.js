const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "sig.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario     TEXT NOT NULL UNIQUE,
    nombre      TEXT NOT NULL,
    password    TEXT NOT NULL,
    rol         TEXT NOT NULL CHECK (rol IN ('admin','operador')),
    activo      INTEGER NOT NULL DEFAULT 1,
    is_reviewer INTEGER NOT NULL DEFAULT 0,
    areas       TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id              TEXT PRIMARY KEY,
    form_id         TEXT NOT NULL,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name       TEXT NOT NULL,
    data            TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'approved'
                    CHECK (status IN ('pending','approved')),
    edited_at       DATETIME,
    edited_by_id    INTEGER,
    edited_by_name  TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS submission_reviews (
    submission_id   TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_name   TEXT NOT NULL,
    approved_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (submission_id, reviewer_id)
  );

  CREATE INDEX IF NOT EXISTS idx_submissions_user    ON submissions(user_id);
  CREATE INDEX IF NOT EXISTS idx_submissions_form    ON submissions(form_id);
  CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_submissions_status  ON submissions(status);
`);

// Migraciones para instalaciones previas a esta versión.
function addColumn(table, name, ddl) {
  const has = db.prepare(`PRAGMA table_info(${table})`).all().some(c => c.name === name);
  if (!has) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${ddl}`);
}
addColumn("users", "activo",        "INTEGER NOT NULL DEFAULT 1");
addColumn("users", "is_reviewer",   "INTEGER NOT NULL DEFAULT 0");
addColumn("users", "areas",         "TEXT");
addColumn("submissions", "status",         "TEXT NOT NULL DEFAULT 'approved'");
addColumn("submissions", "edited_at",      "DATETIME");
addColumn("submissions", "edited_by_id",   "INTEGER");
addColumn("submissions", "edited_by_name", "TEXT");
db.exec(`
  CREATE TABLE IF NOT EXISTS submission_reviews (
    submission_id   TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_name   TEXT NOT NULL,
    approved_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (submission_id, reviewer_id)
  );
  CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
`);

// ---------------------------------------------------------------------------
// Seed inicial — si la tabla users está vacía, crea los 6 usuarios base.
// Las contraseñas pueden venir por variable de entorno SEED_USERS (JSON) o
// se usa la lista por defecto. En producción cambie las contraseñas desde
// el panel/admin o usando la variable SEED_ADMIN_PASSWORD.
// ---------------------------------------------------------------------------
function seedIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
  if (count > 0) return;

  const adminPwd = process.env.SEED_ADMIN_PASSWORD || "sig2026";
  const opPwd    = process.env.SEED_OPERATOR_PASSWORD || "liborio";

  const seed = [
    { usuario: "admin",    nombre: "Administrador",   password: adminPwd, rol: "admin" },
    { usuario: "diego",    nombre: "Diego Morales",   password: opPwd,    rol: "operador" },
    { usuario: "jose",     nombre: "José Perez",      password: opPwd,    rol: "operador" },
    { usuario: "vladimir", nombre: "Vladimir Castro", password: opPwd,    rol: "operador" },
    { usuario: "evelyn",   nombre: "Evelyn Ordoñez",  password: opPwd,    rol: "operador" },
    { usuario: "minor",    nombre: "Minor Mesén",     password: opPwd,    rol: "operador" }
  ];

  const insert = db.prepare(
    "INSERT INTO users (usuario, nombre, password, rol) VALUES (?, ?, ?, ?)"
  );
  const tx = db.transaction(() => {
    for (const u of seed) {
      insert.run(u.usuario, u.nombre, bcrypt.hashSync(u.password, 10), u.rol);
    }
  });
  tx();
  console.log(`[db] seed: ${seed.length} usuarios creados (admin / operador).`);
}

seedIfEmpty();

module.exports = db;
