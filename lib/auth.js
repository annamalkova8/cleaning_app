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

module.exports = {
  SESSION_COOKIE,
  signSession,
  verifySessionToken,
  getSession,
  makeLoginToken,
};
