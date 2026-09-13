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

  const { roomId, title, instruction, frequency, x, y } = await req.json();
  if (!roomId || !title) {
    return NextResponse.json({ error: "Нужны комната и название" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      roomId,
      title,
      instruction: instruction || "",
      frequency: frequency || "WEEKLY",
      x: x ?? 50,
      y: y ?? 50,
    },
  });
  return NextResponse.json({ ok: true, task });
}

async function PATCH(req) {
  const session = requireAdmin();
  if (!session) return NextResponse.json({ error: "Только для админа" }, { status: 403 });

  const { taskId, title, instruction, frequency, x, y } = await req.json();
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(instruction !== undefined ? { instruction } : {}),
      ...(frequency !== undefined ? { frequency } : {}),
      ...(x !== undefined ? { x } : {}),
      ...(y !== undefined ? { y } : {}),
    },
  });
  return NextResponse.json({ ok: true, task });
}

async function DELETE(req) {
  const session = requireAdmin();
  if (!session) return NextResponse.json({ error: "Только для админа" }, { status: 403 });

  const { taskId } = await req.json();
  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ ok: true });
}

module.exports = { POST, PATCH, DELETE };
