const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { cookies } = require("next/headers");

const SESSION_COOKIE = "session";
const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";

function signSession(user) {
  return jwt.sign(
    { uid: user.id, email: user.email, isAdmin: user.isAdmin, name: user.name },
    SECRET,
    { expiresIn: "180d" }
  );
}

function verifySessionToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

// Server Components / Route Handlers (reads cookies())
function getSession() {
  const store = cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

function makeLoginToken() {
  return crypto.randomBytes(24).toString("hex");
}

// Origin header isn't reliably sent by every client, but Host is always present
// on any HTTP request, so build the link from that instead (proxies like
// Railway override it via X-Forwarded-Host/Proto).
function getRequestOrigin(req) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) return req.headers.get("origin") || process.env.APP_URL;
  const proto = req.headers.get("x-forwarded-proto") || new URL(req.url).protocol.replace(":", "");
  return `${proto}://${host}`;
}

module.exports = {
  SESSION_COOKIE,
  signSession,
  verifySessionToken,
  getSession,
  makeLoginToken,
  getRequestOrigin,
};
