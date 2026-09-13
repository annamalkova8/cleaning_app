const { NextResponse } = require("next/server");
const { prisma } = require("../../../../lib/db");
const { getSession, makeLoginToken } = require("../../../../lib/auth");
const { sendInviteEmail } = require("../../../../lib/mail");

async function POST(req) {
  const session = getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Только для админа" }, { status: 403 });
  }

  const { email, name } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return NextResponse.json({ error: "Введите email" }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email: cleanEmail },
    update: { name: name || undefined },
    create: { email: cleanEmail, name: name || null, isAdmin: false },
  });

  const token = makeLoginToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await prisma.loginToken.create({ data: { email: cleanEmail, token, expiresAt } });

  const origin = req.headers.get("origin") || process.env.APP_URL;
  const link = `${origin}/api/auth/verify?token=${token}`;
  await sendInviteEmail(cleanEmail, link);

  return NextResponse.json({ ok: true, user });
}

module.exports = { POST };
