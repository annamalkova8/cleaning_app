const { NextResponse } = require("next/server");
const { prisma } = require("../../../../lib/db");
const { getSession } = require("../../../../lib/auth");

function requireAdmin() {
  const session = getSession();
  if (!session || !session.isAdmin) return null;
  return session;
}

async function POST(req) {
  const session = requireAdmin();
  if (!session) return NextResponse.json({ error: "Только для админа" }, { status: 403 });

  const { name, imageUrl, order } = await req.json();
  if (!name || !imageUrl) {
    return NextResponse.json({ error: "Нужны название и картинка" }, { status: 400 });
  }

  const room = await prisma.room.create({
    data: { name, imageUrl, order: order || 0 },
  });
  return NextResponse.json({ ok: true, room });
}

async function PATCH(req) {
  const session = requireAdmin();
  if (!session) return NextResponse.json({ error: "Только для админа" }, { status: 403 });

  const { roomId, name, imageUrl, order } = await req.json();
  const room = await prisma.room.update({
    where: { id: roomId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(order !== undefined ? { order } : {}),
    },
  });
  return NextResponse.json({ ok: true, room });
}

async function DELETE(req) {
  const session = requireAdmin();
  if (!session) return NextResponse.json({ error: "Только для админа" }, { status: 403 });

  const { roomId } = await req.json();
  await prisma.room.delete({ where: { id: roomId } });
  return NextResponse.json({ ok: true });
}

module.exports = { POST, PATCH, DELETE };
