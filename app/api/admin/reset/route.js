const { NextResponse } = require("next/server");
const { prisma } = require("../../../../lib/db");
const { getSession } = require("../../../../lib/auth");

async function POST(req) {
  const session = getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Только для админа" }, { status: 403 });
  }

  const { scope, taskId, roomId, frequency } = await req.json();

  let where = {};
  if (scope === "task") where = { id: taskId };
  else if (scope === "room") where = { roomId };
  else if (scope === "frequency") where = { frequency };
  else if (scope === "all") where = {};
  else return NextResponse.json({ error: "Неверный scope" }, { status: 400 });

  const result = await prisma.task.updateMany({
    where,
    data: { lastDoneAt: null, lastDoneBy: null },
  });

  return NextResponse.json({ ok: true, count: result.count });
}

module.exports = { POST };
