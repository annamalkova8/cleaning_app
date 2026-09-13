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
          return (
            <a key={room.id} href={`/rooms/${room.id}`} className="room-card">
              <img className="thumb" src={room.imageUrl} alt={room.name} />
              <div className="meta">
                <span className="name">{room.name}</span>
                <span className={`badge ${allDone ? "" : "pending"}`}>
                  {done}/{total}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
