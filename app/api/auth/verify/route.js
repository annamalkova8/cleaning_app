const { NextResponse } = require("next/server");
const { prisma } = require("../../../../lib/db");
const { signSession, SESSION_COOKIE } = require("../../../../lib/auth");

async function GET(req) {
  const { searchParams, origin } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=missing`);
  }

  const loginToken = await prisma.loginToken.findUnique({ where: { token } });

  if (
    !loginToken ||
    loginToken.usedAt ||
    loginToken.expiresAt < new Date()
  ) {
    return NextResponse.redirect(`${origin}/login?error=expired`);
  }

  const user = await prisma.user.findUnique({ where: { email: loginToken.email } });

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=notfound`);
  }

  await prisma.loginToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  const sessionToken = signSession(user);

  const res = NextResponse.redirect(`${origin}/`);
  res.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}

module.exports = { GET };
