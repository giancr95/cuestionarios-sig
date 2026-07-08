// server/sso.js — verificación del token SSO de Odoo (HS256, cero deps)
"use strict";
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const db = require("./db");

const AUD = "sig";
const ISS = "liborio-odoo";

function b64urlDecode(s) {
    return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function verifyOdooToken(token) {
    const secret = process.env.ODOO_SSO_SECRET;
    if (!secret || !token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;
    let header, payload;
    try {
        header = JSON.parse(b64urlDecode(h).toString("utf8"));
        payload = JSON.parse(b64urlDecode(p).toString("utf8"));
    } catch {
        return null;
    }
    if (header.alg !== "HS256") return null; // sin downgrade
    const expected = crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest();
    const got = b64urlDecode(s);
    if (got.length !== expected.length || !crypto.timingSafeEqual(got, expected)) return null;
    const now = Date.now() / 1000;
    if (typeof payload.exp !== "number" || now > payload.exp + 5) return null;
    if (typeof payload.nbf === "number" && now < payload.nbf - 5) return null;
    if (payload.aud !== AUD || payload.iss !== ISS) return null;
    return payload;
}

function upsertFromClaims(payload) {
    const usuario = String(payload.login || "").trim();
    if (!usuario) return null;
    const roles = Array.isArray(payload.roles) ? payload.roles : [];
    const rol = roles.includes("admin") ? "admin" : "operador";
    const nombre = String(payload.name || usuario);

    const existing = db
        .prepare("SELECT id, activo FROM users WHERE usuario = ? COLLATE NOCASE")
        .get(usuario);
    if (existing) {
        if (!existing.activo) return null; // desactivado: SSO tampoco entra
        // Odoo es autoridad del rol; is_reviewer/is_approver/areas se administran acá.
        db.prepare("UPDATE users SET nombre = ?, rol = ? WHERE id = ?").run(
            nombre, rol, existing.id);
        return existing.id;
    }
    const password = bcrypt.hashSync(crypto.randomBytes(32).toString("hex"), 10);
    const info = db
        .prepare(
            "INSERT INTO users (usuario, nombre, password, rol, is_reviewer, is_approver, areas) " +
            "VALUES (?, ?, ?, ?, 0, 0, NULL)")
        .run(usuario, nombre, password, rol);
    return info.lastInsertRowid;
}

// Strict relative path: single leading '/', no '//' or backslash.
const SAFE_NEXT = /^\/(?![/\\])[^\\]*$/;

function ssoLogin(req, res) {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    const payload = verifyOdooToken(token);
    if (!payload) return res.redirect("/?sso=failed");
    const uid = upsertFromClaims(payload);
    if (!uid) return res.redirect("/?sso=failed");
    req.session.uid = uid;
    req.session.iat = Date.now();
    // Anti-replay: recordar el jti hasta que expire (TTL corto). Evita que un
    // mismo token de handoff fije la sesión de otro navegador dos veces.
    if (payload.jti && !markJtiUsed(payload.jti, payload.exp)) {
        return res.redirect("/?sso=failed");
    }
    let next = typeof req.query.next === "string" ? req.query.next : "/";
    if (!SAFE_NEXT.test(next)) next = "/";
    res.redirect(next);
}

// Single-use jti guard (in-memory; suficiente para un solo proceso Express).
const _usedJti = new Map(); // jti -> exp(s)
function markJtiUsed(jti, exp) {
    const now = Date.now() / 1000;
    for (const [k, e] of _usedJti) if (e < now) _usedJti.delete(k);
    if (_usedJti.has(jti)) return false;
    _usedJti.set(jti, exp || now + 120);
    return true;
}

module.exports = { verifyOdooToken, ssoLogin };
