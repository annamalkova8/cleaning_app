"use client";
import { useState } from "react";

const FREQ_LABEL = {
  WEEKLY: "Каждую неделю",
  MONTHLY: "Каждый месяц",
  YEARLY: "Раз в год",
};

export default function RoomView({ room }) {
  const [tasks, setTasks] = useState(room.tasks);
  const [activeTask, setActiveTask] = useState(null);
  const [busy, setBusy] = useState(false);

  async function markDone(taskId) {
    setBusy(true);
    try {
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();
      if (data.task) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
        setActiveTask(data.task);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <a className="back-link" href="/">
        ← Все комнаты
      </a>
      <h1 className="title" style={{ marginBottom: 16 }}>
        {room.name}
      </h1>

      <div className="room-view">
        <img src={room.imageUrl} alt={room.name} />
        {tasks.map((task) => (
          <div
            key={task.id}
            className="marker-wrap"
            style={{ left: `${task.x}%`, top: `${task.y}%` }}
          >
            <button
              className={`marker ${task.lastDoneAt ? "done" : ""}`}
              onClick={() => setActiveTask(task)}
              aria-label={task.title}
            >
              {task.imageUrl ? (
                <img className="marker-icon" src={task.imageUrl} alt="" />
              ) : (
                task.lastDoneAt ? "✓" : "!"
              )}
              {task.imageUrl && task.lastDoneAt && (
                <span className="marker-badge">✓</span>
              )}
              {task.assignedTo && (
                <span className="marker-assignee" title={`Назначено: ${task.assignedTo.name || task.assignedTo.email}`}>
                  {(task.assignedTo.name || task.assignedTo.email)[0].toUpperCase()}
                </span>
              )}
            </button>
            <span className="marker-label">{task.title}</span>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <p style={{ color: "var(--ink-soft)", marginTop: 16 }}>
          В этой комнате пока нет задач.
        </p>
      )}

      {activeTask && (
        <div className="sheet-overlay" onClick={() => setActiveTask(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            {activeTask.imageUrl && (
              <img className="sheet-image" src={activeTask.imageUrl} alt="" />
            )}
            <h3>{activeTask.title}</h3>
            <div className="tag-row">
              <div className="freq-tag">{FREQ_LABEL[activeTask.frequency]}</div>
              {activeTask.assignedTo && (
                <div className="assignee-tag">
                  Назначено: {activeTask.assignedTo.name || activeTask.assignedTo.email}
                </div>
              )}
            </div>
            <div className="instruction">{activeTask.instruction}</div>
            {activeTask.lastDoneAt && (
              <div className="done-meta">
                Сделано: {activeTask.lastDoneBy || "—"},{" "}
                {new Date(activeTask.lastDoneAt).toLocaleDateString("ru-RU")}
              </div>
            )}
            <button
              className="btn"
              disabled={busy}
              onClick={() => markDone(activeTask.id)}
            >
              {activeTask.lastDoneAt ? "Сделано ещё раз ✓" : "Готово! ✓"}
            </button>
            <div style={{ height: 10 }} />
            <button className="btn secondary" onClick={() => setActiveTask(null)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
