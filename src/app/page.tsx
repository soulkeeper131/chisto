"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import AppMain from "@/components/AppMain";

export default function Home() {
  const [entered, setEntered] = useState(false);
  const { user, setUser } = useStore();

  if (entered) {
    return <AppMain />;
  }

  // Landing page — exactly matching prototype index.html
  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "100dvh", padding: "16px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: "linear-gradient(140deg, #14B8A6, #0F766E)",
          display: "grid", placeItems: "center", margin: "0 auto 20px",
          boxShadow: "0 6px 20px rgba(15,118,110,.3)",
        }}>
          <span style={{ color: "#fff", fontSize: 32, fontWeight: 700 }}>C</span>
        </div>
        <h1 style={{ fontSize: 32, color: "#2d2133", marginBottom: 8, fontWeight: 700 }}>
          Chisto
        </h1>
        <p style={{ color: "#6b626e", marginBottom: 40, fontSize: 16, lineHeight: 1.5 }}>
          Платформа за обслужване и почистване на обекти
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "28px 32px",
            boxShadow: "0 8px 24px rgba(61,37,75,.08)",
            minWidth: 160, cursor: "pointer",
          }}
          onClick={() => {
            setUser("u_admin1");
            setEntered(true);
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#3e2a49", marginBottom: 4 }}>Почистване</div>
            <div style={{ fontSize: 13, color: "#857b89" }}>Задачи, чек-листове, снимки</div>
          </div>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "28px 32px",
            boxShadow: "0 8px 24px rgba(61,37,75,.08)",
            minWidth: 160, cursor: "pointer",
          }}
          onClick={() => {
            setUser("u_ins1");
            setEntered(true);
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#3e2a49", marginBottom: 4 }}>Обходи</div>
            <div style={{ fontSize: 13, color: "#857b89" }}>Имоти, инспекции, поддръжка</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { id: "u_admin1", name: "Владимир (Диспечер)", color: "#0F172A" },
            { id: "u_own1", name: "Елена (Собственик)", color: "#7C3AED" },
            { id: "u_cl1", name: "Мария (Чистач)", color: "#0F766E" },
            { id: "u_ins1", name: "Мария (Инспектор)", color: "#1D4E89" },
          ].map((u) => (
            <button
              key={u.id}
              onClick={() => {
                setUser(u.id);
                setEntered(true);
              }}
              style={{
                padding: "10px 18px", borderRadius: 12, border: "1px solid #E6EAF0",
                background: "#FBFCFD", fontWeight: 600, fontSize: 13,
                color: "#334155", cursor: "pointer",
              }}
            >
              <span style={{
                display: "inline-block", width: 22, height: 22, borderRadius: "50%",
                background: u.color, color: "#fff", fontSize: 11, fontWeight: 700,
                lineHeight: "22px", textAlign: "center", marginRight: 8,
              }}>
                {u.name[0]}
              </span>
              {u.name}
            </button>
          ))}
        </div>

        <p style={{ color: "#94A3B8", fontSize: 12, marginTop: 24 }}>
          Демо прототип — избери роля, за да влезеш
        </p>
      </div>
    </div>
  );
}
