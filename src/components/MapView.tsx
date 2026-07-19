"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { PROPERTIES, propStatus, STATUS_MAP } from "@/lib/data";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SOFIA: [number, number] = [42.6795, 23.33];

export default function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [addMode, setAddMode] = useState(false);
  const { user } = useStore();
  const role = useStore.getRole();

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
        // Will wire up to PropertySheet later
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
