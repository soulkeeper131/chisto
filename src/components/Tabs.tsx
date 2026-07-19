"use client";

import { useStore } from "@/lib/store";

export default function Tabs() {
  const { tab, setTab, getTabs, getLabel } = useStore();
  const tabs = getTabs();

  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
          {getLabel(t)}
        </button>
      ))}
    </div>
  );
}
