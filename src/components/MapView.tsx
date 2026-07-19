"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { PROPERTIES, myProps, propStatus, STATUS_MAP, TEMPLATES, TASKS, USERS, myJobs, isToday, JOBSTATUS } from "@/lib/data";
import { useUI } from "@/components/UIProvider";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SOFIA: [number, number] = [42.6795, 23.33];

export default function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [addMode, setAddMode] = useState(false);
  const { user } = useStore();
  const role = useStore.getRole();
  const { openSheet, closeSheet } = useUI();

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", { zoomControl: false, attributionControl: true }).setView(SOFIA, 12.4);
    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO',
      maxZoom: 20, subdomains: "abcd",
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    drawMarkers();
    [80, 300, 900].forEach((ms) => setTimeout(() => map.invalidateSize(), ms));

    return () => { map.remove(); mapRef.current = null; };
  }, [user]);

  function drawMarkers() {
    if (!layerRef.current) return;
    const layer = layerRef.current;
    layer.clearLayers();

    // Filter properties based on role
    let props = PROPERTIES;
    if (role === "owner") {
      props = PROPERTIES.filter(p => p.ownerId === user);
    } else if (role === "cleaner" || role === "inspector") {
      // Show only today's properties
      const todayIds = new Set<string>(); // Will be populated when we have jobs
      if (todayIds.size > 0) props = props.filter(p => todayIds.has(p.id));
    }

    props.forEach((p) => {
      const st = propStatus(p.id, user);
      const cfg = STATUS_MAP[st] || STATUS_MAP.none;
      const marker = L.marker([p.lat, p.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div class="marker m-${cfg.c}"><span>${cfg.icon}</span></div>`,
          iconSize: [34, 34], iconAnchor: [17, 32],
        }),
      });
      marker.bindTooltip(p.name, { direction: "top", offset: [0, -30] });
      marker.on("click", () => {
        // Open property sheet
        const pJobs = [...TASKS].filter(j => j.propertyId === p.id).sort((a, b) => b.plannedAt - a.plannedAt);
        openSheet(
          p.name,
          p.addr,
          <div>
            <span className={`pill p-${cfg.c === 'gray' ? 'gray' : cfg.c}`}><span className="bullet" />{cfg.label}</span>
            <div className="card card-pad" style={{ marginTop: 14, background: '#FFFBEB', borderColor: '#FDE68A' }}>
              <div className="tiny strong" style={{ color: '#B45309', textTransform: 'uppercase', letterSpacing: '.05em' }}>Достъп</div>
              <div className="small" style={{ marginTop: 6, lineHeight: 1.55 }}>{p.access}</div>
            </div>
            <div className="section-title">Зони</div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 7 }}>
              {p.zones.map((z: string) => <span key={z} className="pill p-gray">{z}</span>)}
            </div>
            <div className="section-title">Задачи ({pJobs.length})</div>
            <div className="card">
              {pJobs.slice(0, 5).map(j => {
                const tp = TEMPLATES.find(x => x.id === j.templateId);
                const a = USERS.find(x => x.id === j.assigneeId);
                const st = JOBSTATUS[j.status] || JOBSTATUS.planned;
                return (
                  <div key={j.id} className="lrow">
                    <div className="lrow-ic" style={{ background: 'var(--accent-soft)' }}>{tp?.icon}</div>
                    <div className="lrow-body">
                      <div className="lrow-title">{tp?.name}</div>
                      <div className="lrow-sub">{new Date(j.plannedAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}, {new Date(j.plannedAt).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })} · {a?.name}</div>
                    </div>
                    <span className={`pill ${st.p}`}>{st.t}</span>
                  </div>
                );
              })}
              {pJobs.length === 0 && <div style={{ padding: 16 }} className="small muted">Няма задачи</div>}
            </div>
          </div>,
          <div className="row" style={{ width: '100%' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => {
              window.open(`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=18/${p.lat}/${p.lng}`, '_blank');
            }}>🧭 Навигация</button>
          </div>
        );
      });
      marker.addTo(layer);

      if (st === "active") {
        L.circle([p.lat, p.lng], {
          radius: p.radius, color: "#F59E0B", weight: 1.5,
          fillColor: "#F59E0B", fillOpacity: 0.1,
        }).addTo(layer);
      }
    });

    if (props.length && !(mapRef.current as any)?._fitted) {
      const bounds = L.latLngBounds(props.map(p => [p.lat, p.lng] as [number, number]));
      mapRef.current?.fitBounds(bounds, { padding: [70, 70], maxZoom: 14 });
      (mapRef.current as any)._fitted = true;
    }
  }

  const canAdd = role !== "cleaner" && role !== "inspector";

  return (
    <>
      <div className="map-search">
        <span style={{ opacity: 0.4 }}>⌕</span>
        <input placeholder="Търси адрес…" onKeyDown={async (e) => {
          if (e.key !== "Enter") return;
          const q = (e.target as HTMLInputElement).value.trim();
          if (!q) return;
          try {
            const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=bg&q=${encodeURIComponent(q)}`);
            const d = await r.json();
            if (d[0]) mapRef.current?.setView([+d[0].lat, +d[0].lon], 17);
          } catch {}
        }} />
      </div>
      {canAdd && (
        <button className={`map-btn ${addMode ? "act" : ""}`} onClick={() => setAddMode(!addMode)}>
          {addMode ? "✕ Отказ" : "＋ Обект"}
        </button>
      )}
      <div id="map" />
      <div className="legend">
        {["none", "planned", "active", "done", "problem"].map((k) => (
          <div key={k} className="lg">
            <div className="sw" style={{ background: `var(--s-${STATUS_MAP[k]?.c || 'gray'})` }} />
            {STATUS_MAP[k]?.label}
          </div>
        ))}
      </div>
    </>
  );
}
