"use client";

import { useStore } from "@/lib/store";
import { USERS } from "@/lib/data";
import { useState, useEffect, useRef } from "react";

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
  const roles = [
    { key: "admin", label: "Диспечери" },
    { key: "owner", label: "Собственици" },
    { key: "cleaner", label: "Изпълнители (Почистване)" },
    { key: "inspector", label: "Инспектори (Обходи)" },
  ];

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
            {roles.map(({ key, label }) => {
              const roleUsers = USERS.filter((u) => u.role === key);
              return (
                <div key={key}>
                  <div className="menu-h">{label}</div>
                  {roleUsers.map((u) => (
                    <button
                      key={u.id}
                      className={`menu-i ${u.id === user ? "on" : ""}`}
                      onClick={() => { setUser(u.id); setOpen(false); }}
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
                </div>
              );
            })}
            <div style={{ padding: "10px 15px", borderTop: "1px solid var(--line-2)" }} className="tiny muted">
              Демо превключвател. Реално — достъп по покана.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
