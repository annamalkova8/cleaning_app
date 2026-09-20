import { redirect } from "next/navigation";
import { getSession } from "../lib/auth";
import { prisma } from "../lib/db";
import LogoutButton from "../components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = getSession();
  if (!session) redirect("/login");

  const rooms = await prisma.room.findMany({
    orderBy: { order: "asc" },
    include: { tasks: true },
  });

  const myTasksRaw = await prisma.task.findMany({
    where: { assignedToId: session.uid },
    include: { room: { select: { id: true, name: true } } },
  });
  const myTasks = myTasksRaw.sort((a, b) => {
    if (!!a.lastDoneAt === !!b.lastDoneAt) return 0;
    return a.lastDoneAt ? 1 : -1;
  });

  const FREQ_LABEL = { WEEKLY: "Каждую неделю", MONTHLY: "Каждый месяц", YEARLY: "Раз в год" };

  return (
    <div className="page">
      <div className="topbar">
        <h1 className="title">🧹 Уборка</h1>
        <div className="who">
          {session.name || session.email}
          {session.isAdmin && (
            <a href="/admin" style={{ marginLeft: 10, color: "var(--teal)", textDecoration: "underline", fontSize: 13 }}>
              Админ
            </a>
          )}
          <LogoutButton />
        </div>
      </div>

      {myTasks.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 10 }}>Мои задачи</h2>
          <div className="task-list-fallback">
            {myTasks.map((task) => (
              <a key={task.id} href={`/rooms/${task.room.id}`} className="task-row" style={{ textDecoration: "none", color: "inherit" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {task.imageUrl && (
                    <img src={task.imageUrl} alt="" style={{ width: 28, height: 28 }} />
                  )}
                  <span>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                      {task.room.name} · {FREQ_LABEL[task.frequency]}
                    </div>
                  </span>
                </span>
                <span className={`badge ${task.lastDoneAt ? "" : "pending"}`}>
                  {task.lastDoneAt ? "✓" : "!"}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {rooms.length === 0 && (
        <p style={{ color: "var(--ink-soft)" }}>
          Комнат пока нет. {session.isAdmin ? "Зайди в «Админ», чтобы добавить первую." : "Попроси админа добавить комнаты."}
        </p>
      )}

      <div className="room-grid">
        {rooms.map((room) => {
          const total = room.tasks.length;
          const done = room.tasks.filter((t) => t.lastDoneAt).length;
          const allDone = total > 0 && done === total;
          const percent = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <a key={room.id} href={`/rooms/${room.id}`} className="room-card">
              <img className="thumb" src={room.imageUrl} alt={room.name} />
              <div className="meta">
                <span className="name">{room.name}</span>
                <span className={`badge ${allDone ? "" : "pending"}`}>
                  {done}/{total}
                </span>
              </div>
              {total > 0 && (
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${percent}%` }} />
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
