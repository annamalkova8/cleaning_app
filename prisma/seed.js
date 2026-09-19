const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (!adminEmail) {
    console.log("ADMIN_EMAIL не задан — админ не создан. Задай переменную окружения и запусти seed ещё раз.");
  } else {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { isAdmin: true },
      create: { email: adminEmail, name: process.env.ADMIN_NAME || null, isAdmin: true },
    });
    console.log(`Админ создан: ${adminEmail}`);
  }

  const existingRooms = await prisma.room.count();
  if (existingRooms > 0) {
    console.log("Комнаты уже есть — пропускаю создание стартовых данных.");
    return;
  }

  const rooms = [
    {
      name: "Кухня",
      imageUrl: "/rooms/kitchen.svg",
      order: 1,
      tasks: [
        { title: "Плита", instruction: "Мыть специальным средством.", imageUrl: "/objects/stove.svg", frequency: "WEEKLY", x: 20, y: 60 },
        { title: "Духовка", instruction: "Мыть или прожарить.", imageUrl: "/objects/oven.svg", frequency: "MONTHLY", x: 35, y: 55 },
        { title: "Раковина", instruction: "Помыть всё либо средством для раковин, либо водой с кондиционером и щёткой.\nКран — спец. средство от соли.\nСливное отверстие и смыв — щёткой.", imageUrl: "/objects/sink.svg", frequency: "WEEKLY", x: 55, y: 62 },
        { title: "Столы, ящики, стена", instruction: "Протереть тряпкой с водой и кондиционером.", imageUrl: "/objects/counter.svg", frequency: "WEEKLY", x: 70, y: 45 },
        { title: "Мусорки", instruction: "Помыть мусорные вёдра.", imageUrl: "/objects/trash.svg", frequency: "WEEKLY", x: 85, y: 70 },
        { title: "Решётка от вытяжки", instruction: "Помыть в посудомойке.", imageUrl: "/objects/hood-filter.svg", frequency: "MONTHLY", x: 50, y: 20 },
        { title: "Посудомойка", instruction: "Прогнать с лимонной кислотой.", imageUrl: "/objects/dishwasher.svg", frequency: "MONTHLY", x: 65, y: 75 },
        { title: "Пол", instruction: "Пропылесосить или помыть.", imageUrl: "/objects/floor.svg", frequency: "WEEKLY", x: 15, y: 90 },
        { title: "Коврик", instruction: "Постирать.", imageUrl: "/objects/mat.svg", frequency: "MONTHLY", x: 40, y: 92 },
      ],
    },
    {
      name: "Спальня",
      imageUrl: "/rooms/bedroom.svg",
      order: 2,
      tasks: [
        { title: "Полка над кроватью, тумбочка, подоконник", instruction: "Протереть тряпкой с водой и кондиционером.", imageUrl: "/objects/shelf-nightstand.svg", frequency: "WEEKLY", x: 30, y: 35 },
        { title: "Занавески", instruction: "Постирать.", imageUrl: "/objects/curtains.svg", frequency: "MONTHLY", x: 10, y: 20 },
        { title: "Пол", instruction: "Пропылесосить или помыть.", imageUrl: "/objects/floor.svg", frequency: "WEEKLY", x: 70, y: 85 },
      ],
    },
    {
      name: "Ванная",
      imageUrl: "/rooms/bathroom.svg",
      order: 3,
      tasks: [
        { title: "Душ", instruction: "Стёкла — спец. средство.\nКраны — спец. средство.\nВнизу пыль — можно влажной туалеткой.\nСлив — залить антизасор, помыть изнутри (обычной туалеткой или ватным диском).", imageUrl: "/objects/shower.svg", frequency: "WEEKLY", x: 20, y: 30 },
        { title: "Туалет", instruction: "Все поверхности — влажной туалеткой.\nЗалить средством для мытья туалета на 10 минут, потом всё помыть ёршиком.", imageUrl: "/objects/toilet.svg", frequency: "WEEKLY", x: 80, y: 30 },
        { title: "Раковина", instruction: "Помыть всё либо средством для раковин, либо водой с кондиционером и щёткой.\nКран — спец. средство от соли.\nИногда зеркало — спец. средство для зеркал.\nПолочки — от пыли.\nИногда отверстие под краном (может быть бяка).\nСливное отверстие и смыв — щёткой.", imageUrl: "/objects/sink.svg", frequency: "WEEKLY", x: 50, y: 45 },
        { title: "Стиральная машина", instruction: "Протереть тряпкой с водой и кондиционером.", imageUrl: "/objects/washing-machine.svg", frequency: "WEEKLY", x: 15, y: 70 },
        { title: "Стиральная машина — лимонная кислота", instruction: "Прогнать с лимонной кислотой.", imageUrl: "/objects/washing-machine.svg", frequency: "MONTHLY", x: 15, y: 70 },
        { title: "Коврик", instruction: "Постирать.", imageUrl: "/objects/mat.svg", frequency: "MONTHLY", x: 50, y: 90 },
        { title: "Пол", instruction: "Пропылесосить или помыть.", imageUrl: "/objects/floor.svg", frequency: "WEEKLY", x: 85, y: 85 },
      ],
    },
    {
      name: "Гостиная",
      imageUrl: "/rooms/living-room.svg",
      order: 4,
      tasks: [
        { title: "Тумба с телевизором, столик, лампа, подоконники", instruction: "Протереть тряпкой с водой и кондиционером.", imageUrl: "/objects/tv-stand.svg", frequency: "WEEKLY", x: 75, y: 40 },
        { title: "Диван, подушки, плед", instruction: "Пропылесосить.", imageUrl: "/objects/sofa.svg", frequency: "WEEKLY", x: 40, y: 65 },
        { title: "Пол", instruction: "Пропылесосить или помыть.", imageUrl: "/objects/floor.svg", frequency: "WEEKLY", x: 20, y: 85 },
        { title: "Телевизор", instruction: "Протереть влажной салфеткой.", imageUrl: "/objects/tv.svg", frequency: "WEEKLY", x: 78, y: 30 },
      ],
    },
    {
      name: "Прихожая",
      imageUrl: "/rooms/hall.svg",
      order: 5,
      tasks: [
        { title: "Пол", instruction: "Пропылесосить или помыть.", imageUrl: "/objects/floor.svg", frequency: "WEEKLY", x: 50, y: 85 },
        { title: "Тумба, шкаф", instruction: "Протереть тряпкой с водой и кондиционером.", imageUrl: "/objects/console-wardrobe.svg", frequency: "WEEKLY", x: 30, y: 40 },
      ],
    },
  ];

  for (const roomData of rooms) {
    const { tasks, ...roomFields } = roomData;
    const room = await prisma.room.create({ data: roomFields });
    for (const task of tasks) {
      await prisma.task.create({ data: { ...task, roomId: room.id } });
    }
  }

  console.log("Стартовые комнаты и задачи созданы.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
