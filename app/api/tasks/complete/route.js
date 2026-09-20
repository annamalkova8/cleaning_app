const { NextResponse } = require("next/server");
const { prisma } = require("../../../../lib/db");
const { getSession } = require("../../../../lib/auth");

async function POST(req) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { taskId } = await req.json();
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
  }

  const now = new Date();

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      lastDoneAt: now,
      lastDoneBy: session.name || session.email,
    },
    include: { assignedTo: { select: { id: true, name: true, email: true } } },
  });

  await prisma.completion.create({
    data: {
      taskId,
      userId: session.uid,
      completedAt: now,
    },
  });

  return NextResponse.json({ ok: true, task: updated });
}

module.exports = { POST };
