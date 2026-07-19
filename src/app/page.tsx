"use client";

import { useStore } from "@/lib/store";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function Home() {
  const { tab } = useStore();

  if (tab === "map") {
    return (
      <>
        <div id="mapwrap" className="on">
          <MapView />
        </div>
        <div id="view" style={{ display: "none" }} />
      </>
    );
  }

  // Other tabs render in #view
  return (
    <>
      <div id="mapwrap" />
      <div id="view" className="pad">
        <TabContent tab={tab} />
      </div>
    </>
  );
}

function TabContent({ tab }: { tab: string }) {
  switch (tab) {
    case "todo":
      return <div className="empty"><div className="ic">☕</div><h4>Няма задачи днес</h4><p>Почивен ден.</p></div>;
    case "jobs":
      return <div className="empty"><div className="ic">📋</div><h4>Задачи</h4><p>Тук ще се показват всички задачи.</p></div>;
    case "props":
      return <div className="empty"><div className="ic">🏠</div><h4>Обекти</h4><p>Тук ще се показват обектите.</p></div>;
    case "team":
      return <div className="empty"><div className="ic">👥</div><h4>Екип</h4><p>Тук ще се показва екипът.</p></div>;
    case "fix":
      return <div className="empty"><div className="ic">🔧</div><h4>Ремонти</h4><p>Констатации и оферти.</p></div>;
    case "plans":
      return <div className="empty"><div className="ic">📅</div><h4>Абонаменти</h4><p>Сезонни планове.</p></div>;
    case "reports":
      return <div className="empty"><div className="ic">📊</div><h4>Доклади</h4><p>История на посещенията.</p></div>;
    case "hist":
      return <div className="empty"><div className="ic">📖</div><h4>История</h4><p>Завършени задачи.</p></div>;
    default:
      return null;
  }
}
