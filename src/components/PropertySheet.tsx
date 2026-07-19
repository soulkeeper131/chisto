"use client";

import { useState } from "react";

// Mock data matching prototype
const MOCK_PROPERTIES: Record<string, any> = {
  p1: {
    id: "p1", name: "Апартамент Витоша 42", addr: "бул. Витоша 42, ет. 3, ап. 7",
    type: "apartment", status: "done",
    access: "Ключова кутия вдясно от входа, код 4471. Паркинг в двора, място №3.",
    zones: ["Спалня", "Баня", "Кухня", "Дневна"],
    jobs: [
      { id: "j1", tplName: "🧹 Стандартно почистване", date: "18 юли", time: "09:00", assignee: "Мария Стоянова", status: "approved" },
      { id: "j2", tplName: "🛏️ Смяна на бельо", date: "15 юли", time: "08:30", assignee: "Иван Георгиев", status: "approved" },
    ],
  },
};

export function openProperty(pid: string) {
  const el = document.getElementById("property-sheet");
  if (el) el.style.display = "block";
}

export default function PropertySheet({ pid, onClose }: { pid: string; onClose: () => void }) {
  const p = MOCK_PROPERTIES[pid];
  if (!p) return null;

  const statusLabels: Record<string, string> = { none: "Няма задача", planned: "Планирано", active: "Работи се", done: "Готово", problem: "Проблем" };
  const statusColors: Record<string, string> = { none: "gray", planned: "blue", active: "amber", done: "green", problem: "red" };

  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <div className="sheet on">
        <div className="sheet-head">
          <div className="col" style={{ flex: 1, minWidth: 0 }}>
            <h3>{p.name}</h3>
            <div className="small muted" style={{ marginTop: 3 }}>{p.addr}</div>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>
        <div className="sheet-body">
          <span className={`pill p-${statusColors[p.status]}`}>
            <span className="bullet" />{statusLabels[p.status]}
          </span>

          <div className="card card-pad" style={{ marginTop: 14, background: "#FFFBEB", borderColor: "#FDE68A" }}>
            <div className="tiny strong" style={{ color: "#B45309", textTransform: "uppercase", letterSpacing: ".05em" }}>Достъп</div>
            <div className="small" style={{ marginTop: 6, lineHeight: 1.55 }}>{p.access}</div>
          </div>

          <div className="section-title">Зони</div>
          <div className="row" style={{ flexWrap: "wrap", gap: 7 }}>
            {p.zones.map((z: string) => (
              <span key={z} className="pill p-gray">{z}</span>
            ))}
          </div>

          <div className="section-title">Задачи</div>
          <div className="card">
            {p.jobs.map((j: any) => {
              const st: Record<string, string> = {
                planned: "p-blue", approved: "p-green", done: "p-green", in_progress: "p-amber",
              };
              const stl: Record<string, string> = {
                planned: "Планирана", approved: "Одобрена", done: "Чака одобрение", in_progress: "В процес",
              };
              return (
                <div key={j.id} className="lrow">
                  <div className="lrow-ic" style={{ background: "var(--accent-soft)" }}>🧹</div>
                  <div className="lrow-body">
                    <div className="lrow-title">{j.tplName}</div>
                    <div className="lrow-sub">{j.date}, {j.time} · {j.assignee}</div>
                  </div>
                  <span className={`pill ${st[j.status] || "p-gray"}`}>{stl[j.status] || j.status}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="sheet-foot">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => window.open(`https://www.openstreetmap.org/?mlat=42.6912&mlon=23.3186#map=18/42.6912/23.3186`, "_blank")}>
            🧭 Навигация
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }}>＋ Задача</button>
        </div>
      </div>
    </>
  );
}
