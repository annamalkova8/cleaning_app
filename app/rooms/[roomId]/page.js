import { redirect, notFound } from "next/navigation";
import { getSession } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import RoomView from "../../../components/RoomView";

export const dynamic = "force-dynamic";

export default async function RoomPage({ params }) {
  const session = getSession();
  if (!session) redirect("/login");

  const room = await prisma.room.findUnique({
    where: { id: params.roomId },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
  });

  if (!room) notFound();

  return <RoomView room={room} />;
}
