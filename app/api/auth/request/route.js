const { NextResponse } = require("next/server");
const { prisma } = require("../../../../lib/db");
const { makeLoginToken, getRequestOrigin } = require("../../../../lib/auth");
const { sendMagicLink } = require("../../../../lib/mail");

async function POST(req) {
  const { email } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!cleanEmail) {
    return NextResponse.json({ error: "Введите email" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

  if (!user) {
    // Don't reveal whether email exists or not - generic message
    return NextResponse.json({
      ok: true,
      message: "Если этот email приглашён, письмо со ссылкой уже отправлено.",
    });
  }

  const token = makeLoginToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.loginToken.create({
    data: { email: cleanEmail, token, expiresAt },
  });

  const origin = getRequestOrigin(req);
  const link = `${origin}/api/auth/verify?token=${token}`;

  await sendMagicLink(cleanEmail, link);

  return NextResponse.json({
    ok: true,
    message: "Если этот email приглашён, письмо со ссылкой уже отправлено.",
  });
}

module.exports = { POST };
