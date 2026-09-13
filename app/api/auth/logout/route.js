const { NextResponse } = require("next/server");
const { SESSION_COOKIE } = require("../../../../lib/auth");

async function POST(req) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

module.exports = { POST };
