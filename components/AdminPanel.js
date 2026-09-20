"use client";
import { useState } from "react";

const FREQ_OPTIONS = [
  { value: "WEEKLY", label: "Каждую неделю" },
  { value: "MONTHLY", label: "Каждый месяц" },
  { value: "YEARLY", label: "Раз в год" },
];

async function api(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка");
  return data;
}

export default function AdminPanel({ initialRooms, initialUsers }) {
  const [tab, setTab] = useState("rooms");
  const [rooms, setRooms] = useState(initialRooms);
  const [users, setUsers] = useState(initialUsers);
  const [notice, setNotice] = useState(null);

  function flash(message, ok = true) {
    setNotice({ message, ok });
    setTimeout(() => setNotice(null), 3500);
  }

  return (
    <div className="page">
      <a className="back-link" href="/">
        ← На главную
      </a>
      <h1 className="title" style={{ marginBottom: 20 }}>
        Админ
      </h1>

      <div className="tabs">
        <button className={`tab ${tab === "rooms" ? "active" : ""}`} onClick={() => setTab("rooms")}>
          Комнаты и задачи
        </button>
        <button className={`tab ${tab === "reset" ? "active" : ""}`} onClick={() => setTab("reset")}>
          Сброс
        </button>
        <button className={`tab ${tab === "people" ? "active" : ""}`} onClick={() => setTab("people")}>
          Люди
        </button>
      </div>

      {notice && <div className={`notice ${notice.ok ? "" : "error"}`} style={{ marginBottom: 16 }}>{notice.message}</div>}

      {tab === "rooms" && <RoomsTab rooms={rooms} setRooms={setRooms} users={users} flash={flash} />}
      {tab === "reset" && <ResetTab rooms={rooms} flash={flash} />}
      {tab === "people" && <PeopleTab users={users} setUsers={setUsers} flash={flash} />}
    </div>
  );
}

function RoomsTab({ rooms, setRooms, users, flash }) {
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomImage, setNewRoomImage] = useState("");

  async function addRoom(e) {
    e.preventDefault();
    try {
      const { room } = await api("/api/admin/rooms", "POST", {
        name: newRoomName,
        imageUrl: newRoomImage,
      });
      setRooms((prev) => [...prev, { ...room, tasks: [] }]);
      setNewRoomName("");
      setNewRoomImage("");
      flash("Комната добавлена");
    } catch (err) {
      flash(err.message, false);
    }
  }

  async function deleteRoom(roomId) {
    if (!confirm("Удалить комнату и все её задачи?")) return;
    try {
      await api("/api/admin/rooms", "DELETE", { roomId });
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      flash("Комната удалена");
    } catch (err) {
      flash(err.message, false);
    }
  }

  function updateRoomTasks(roomId, tasks) {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, tasks } : r)));
  }

  return (
    <>
      <div className="admin-section">
        <h2>Добавить комнату</h2>
        <form onSubmit={addRoom}>
          <input placeholder="Название (например, Кухня)" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} required />
          <input placeholder="Ссылка на картинку (/rooms/kitchen.jpg или https://...)" value={newRoomImage} onChange={(e) => setNewRoomImage(e.target.value)} required />
          <button className="btn" type="submit">Добавить комнату</button>
        </form>
      </div>

      {rooms.map((room) => (
        <RoomEditor key={room.id} room={room} users={users} onDeleteRoom={deleteRoom} onTasksChange={(tasks) => updateRoomTasks(room.id, tasks)} flash={flash} />
      ))}
    </>
  );
}

function RoomEditor({ room, users, onDeleteRoom, onTasksChange, flash }) {
  const [tasks, setTasks] = useState(room.tasks);
  const [pendingPos, setPendingPos] = useState(null); // {x,y} from image click
  const [newTitle, setNewTitle] = useState("");
  const [newInstruction, setNewInstruction] = useState("");
  const [newFreq, setNewFreq] = useState("WEEKLY");
  const [newAssignee, setNewAssignee] = useState("");

  function setAndPropagate(next) {
    setTasks(next);
    onTasksChange(next);
  }

  function handleImageClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPos({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }

  async function addTask(e) {
    e.preventDefault();
    if (!pendingPos) {
      flash("Сначала кликни на картинку, чтобы поставить метку", false);
      return;
    }
    try {
      const { task } = await api("/api/admin/tasks", "POST", {
        roomId: room.id,
        title: newTitle,
        instruction: newInstruction,
        frequency: newFreq,
        assignedToId: newAssignee || null,
        x: pendingPos.x,
        y: pendingPos.y,
      });
      setAndPropagate([...tasks, task]);
      setNewTitle("");
      setNewInstruction("");
      setNewAssignee("");
      setPendingPos(null);
      flash("Задача добавлена");
    } catch (err) {
      flash(err.message, false);
    }
  }

  async function deleteTask(taskId) {
    if (!confirm("Удалить задачу?")) return;
    try {
      await api("/api/admin/tasks", "DELETE", { taskId });
      setAndPropagate(tasks.filter((t) => t.id !== taskId));
      flash("Задача удалена");
    } catch (err) {
      flash(err.message, false);
    }
  }

  async function saveTask(task) {
    try {
      const { task: updated } = await api("/api/admin/tasks", "PATCH", {
        taskId: task.id,
        title: task.title,
        instruction: task.instruction,
        frequency: task.frequency,
        assignedToId: task.assignedToId || null,
      });
      setAndPropagate(tasks.map((t) => (t.id === updated.id ? updated : t)));
      flash("Сохранено");
    } catch (err) {
      flash(err.message, false);
    }
  }

  function editLocal(taskId, field, value) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, [field]: value } : t)));
  }

  return (
    <div className="admin-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{room.name}</h2>
        <button className="btn danger small" onClick={() => onDeleteRoom(room.id)}>Удалить комнату</button>
      </div>

      <p className="click-hint">Кликни на картинку, чтобы поставить метку для новой задачи</p>
      <div className="room-view" style={{ maxWidth: 420 }}>
        <img src={room.imageUrl} alt={room.name} onClick={handleImageClick} style={{ cursor: "crosshair" }} />
        {tasks.map((t) => (
          <div key={t.id} className={`marker ${t.lastDoneAt ? "done" : ""}`} style={{ left: `${t.x}%`, top: `${t.y}%`, cursor: "default" }} title={t.title}>
            {t.lastDoneAt ? "✓" : "!"}
          </div>
        ))}
        {pendingPos && (
          <div className="marker" style={{ left: `${pendingPos.x}%`, top: `${pendingPos.y}%`, background: "var(--butter)" }}>
            +
          </div>
        )}
      </div>

      <form onSubmit={addTask} style={{ marginTop: 14 }}>
        <input placeholder="Название задачи (например, Протереть плиту)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
        <textarea placeholder="Инструкция" value={newInstruction} onChange={(e) => setNewInstruction(e.target.value)} />
        <div className="row">
          <select value={newFreq} onChange={(e) => setNewFreq(e.target.value)}>
            {FREQ_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)}>
            <option value="">Не назначено</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
          </select>
        </div>
        <button className="btn" type="submit">Добавить задачу{pendingPos ? ` (${pendingPos.x}%, ${pendingPos.y}%)` : ""}</button>
      </form>

      {tasks.map((task) => (
        <div key={task.id} className="admin-task">
          <input value={task.title} onChange={(e) => editLocal(task.id, "title", e.target.value)} />
          <textarea value={task.instruction} onChange={(e) => editLocal(task.id, "instruction", e.target.value)} />
          <div className="row">
            <select value={task.frequency} onChange={(e) => editLocal(task.id, "frequency", e.target.value)}>
              {FREQ_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <select value={task.assignedToId || ""} onChange={(e) => editLocal(task.id, "assignedToId", e.target.value)}>
              <option value="">Не назначено</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
            </select>
          </div>
          <div className="row">
            <button className="btn small" onClick={() => saveTask(task)}>Сохранить</button>
            <button className="btn danger small" onClick={() => deleteTask(task.id)}>Удалить</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResetTab({ rooms, flash }) {
  async function reset(payload, label) {
    if (!confirm(`Сбросить: ${label}?`)) return;
    try {
      const { count } = await api("/api/admin/reset", "POST", payload);
      flash(`Сброшено задач: ${count}`);
    } catch (err) {
      flash(err.message, false);
    }
  }

  return (
    <div className="admin-section">
      <h2>Сбросить по периоду</h2>
      <div className="row" style={{ marginBottom: 10 }}>
        <button className="btn secondary" onClick={() => reset({ scope: "frequency", frequency: "WEEKLY" }, "все недельные задачи")}>Недельные</button>
        <button className="btn secondary" onClick={() => reset({ scope: "frequency", frequency: "MONTHLY" }, "все месячные задачи")}>Месячные</button>
        <button className="btn secondary" onClick={() => reset({ scope: "frequency", frequency: "YEARLY" }, "все годовые задачи")}>Годовые</button>
      </div>
      <button className="btn danger" onClick={() => reset({ scope: "all" }, "вообще всё")}>Сбросить всё</button>

      <h2 style={{ marginTop: 24 }}>Сбросить по комнате</h2>
      {rooms.map((room) => (
        <div key={room.id} className="row" style={{ marginBottom: 8, alignItems: "center" }}>
          <span style={{ flex: 2 }}>{room.name}</span>
          <button className="btn secondary small" onClick={() => reset({ scope: "room", roomId: room.id }, room.name)}>Сбросить</button>
        </div>
      ))}
    </div>
  );
}

function PeopleTab({ users, setUsers, flash }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  async function invite(e) {
    e.preventDefault();
    try {
      const { user } = await api("/api/admin/invite", "POST", { email, name });
      setUsers((prev) => {
        const exists = prev.find((u) => u.id === user.id);
        return exists ? prev.map((u) => (u.id === user.id ? user : u)) : [...prev, user];
      });
      setEmail("");
      setName("");
      flash("Приглашение отправлено на почту");
    } catch (err) {
      flash(err.message, false);
    }
  }

  return (
    <div className="admin-section">
      <h2>Пригласить</h2>
      <form onSubmit={invite}>
        <input placeholder="Имя (необязательно)" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button className="btn" type="submit">Отправить приглашение</button>
      </form>

      <h2 style={{ marginTop: 20 }}>Участники</h2>
      {users.map((u) => (
        <div key={u.id} className="task-row" style={{ marginBottom: 6 }}>
          <span>{u.name || u.email} {u.isAdmin ? "· админ" : ""}</span>
          <span style={{ color: "var(--ink-soft)", fontSize: 13 }}>{u.email}</span>
        </div>
      ))}
    </div>
  );
}
