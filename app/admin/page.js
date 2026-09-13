import { redirect } from "next/navigation";
import { getSession } from "../../lib/auth";
import { prisma } from "../../lib/db";
import AdminPanel from "../../components/AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = getSession();
  if (!session) redirect("/login");
  if (!session.isAdmin) redirect("/");

  const rooms = await prisma.room.findMany({
    orderBy: { order: "asc" },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
  });
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return <AdminPanel initialRooms={rooms} initialUsers={users} />;
}
