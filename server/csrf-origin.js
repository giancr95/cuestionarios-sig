// server/csrf-origin.js — guard CSRF por Origin/Referer.
// Necesario al pasar la cookie a SameSite=None (Lax era la única defensa CSRF).
"use strict";

const ALLOWED = new Set([
    "https://sig.liboriocr.com",
    "https://erp.mecacr.work",
    "https://erp.liboriocr.com", // ERP que embebe la app
]);

module.exports = function csrfOrigin(req, res, next) {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const src = req.headers.origin || req.headers.referer || "";
    let origin = "";
    try {
        origin = new URL(src).origin;
    } catch {
        /* sin Origin/Referer en mutación → rechazar */
    }
    if (ALLOWED.has(origin)) return next();
    return res.status(403).json({ error: "origen no permitido" });
};
