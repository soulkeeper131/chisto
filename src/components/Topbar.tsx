"use client";

import { useStore } from "@/lib/store";
import { useState, useEffect, useRef } from "react";

const USERS = [
  { id: "u_admin", name: "Владимир Тодоров", role: "admin", color: "#0F172A", sub: "Диспечер" },
  { id: "u_own1", name: "Елена Петрова", role: "owner", color: "#7C3AED", sub: "Собственик · 5 обекта" },
  { id: "u_cl1", name: "Мария Стоянова", role: "cleaner", color: "#0F766E", sub: "Изпълнител · Почистване" },
  { id: "u_ins1", name: "Мария Стоянова", role: "inspector", color: "#1D4E89", sub: "Инспектор · Обходи" },
];

export default function Topbar() {
  const { user, setUser } = useStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function click(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, []);

  const currentUser = USERS.find((u) => u.id === user) || USERS[0];

  return (
    <div className="topbar">
      <div className="brand">
        <div className="dot">C</div>
        Chisto
      </div>
      <div className="spacer" />
      <div className="role-dd" ref={menuRef}>
        <button className="role-chip" onClick={() => setOpen(!open)}>
          <div className="av" style={{ background: currentUser.color }}>
            {currentUser.name[0]}
          </div>
          {currentUser.name.split(" ")[0]}
          <span className="caret">▾</span>
        </button>
        {open && (
          <div className="role-menu on">
            <div className="menu-h">Влез като</div>
            {USERS.map((u) => (
              <button
                key={u.id}
                className={`menu-i ${u.id === user ? "on" : ""}`}
                onClick={() => {
                  setUser(u.id);
                  setOpen(false);
                }}
              >
                <div className="av" style={{ background: u.color }}>
                  {u.name[0]}
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                  <div className="strong small">{u.name}</div>
                  <div className="tiny muted">{u.sub}</div>
                </div>
              </button>
            ))}
            <div style={{ padding: "10px 15px", borderTop: "1px solid var(--line-2)" }} className="tiny muted">
              Демо превключвател. В реалното приложение достъпът е по покана.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
