"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

// Load Leaflet only on client
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Sofia coordinates
const SOFIA = [42.6795, 23.33] as [number, number];

// Mock properties from prototype
const PROPERTIES = [
  { id: "p1", name: "Апартамент Витоша 42", lat: 42.6912, lng: 23.3186, type: "apartment", status: "done" },
  { id: "p2", name: "Студио Оборище", lat: 42.6975, lng: 23.3421, type: "studio", status: "done" },
  { id: "p3", name: "Къща Драгалевци", lat: 42.6389, lng: 23.3172, type: "house", status: "planned" },
  { id: "p4", name: "Апартамент Лозенец", lat: 42.6738, lng: 23.3208, type: "apartment", status: "active" },
  { id: "p5", name: "Вила Бояна", lat: 42.6435, lng: 23.2661, type: "villa", status: "planned" },
];

const STATUS_COLORS: Record<string, string> = {
  none: "gray",
  planned: "blue",
  active: "amber",
  done: "green",
  problem: "red",
};

const STATUS_ICONS: Record<string, string> = {
  none: "○",
  planned: "◔",
  active: "●",
  done: "✓",
  problem: "!",
};

export default function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [addMode, setAddMode] = useState(false);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", { zoomControl: false, attributionControl: true }).setView(SOFIA, 12.4);
    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO',
      maxZoom: 20,
      subdomains: "abcd",
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    layerRef.current = layer;

    drawMarkers(layer);

    // Resize fix
    [80, 300, 900].forEach((ms) => setTimeout(() => map.invalidateSize(), ms));

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  function drawMarkers(layer: L.LayerGroup) {
    layer.clearLayers();
    PROPERTIES.forEach((p) => {
      const color = STATUS_COLORS[p.status] || "gray";
      const icon = STATUS_ICONS[p.status] || "○";
      const marker = L.marker([p.lat, p.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div class="marker m-${color}"><span>${icon}</span></div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 32],
        }),
      });
      marker.bindTooltip(p.name, { direction: "top", offset: [0, -30] });
      marker.addTo(layer);

      if (p.status === "active") {
        L.circle([p.lat, p.lng], {
          radius: p.type === "house" || p.type === "villa" ? 110 : 75,
          color: "#F59E0B",
          weight: 1.5,
          fillColor: "#F59E0B",
          fillOpacity: 0.1,
        }).addTo(layer);
      }
    });

    if (PROPERTIES.length && !mapRef.current?._fitted) {
      const bounds = L.latLngBounds(PROPERTIES.map((p) => [p.lat, p.lng] as [number, number]));
      mapRef.current?.fitBounds(bounds, { padding: [70, 70], maxZoom: 14 });
      if (mapRef.current) (mapRef.current as any)._fitted = true;
    }
  }

  const canAdd = useStore().getRole() !== "cleaner" && useStore().getRole() !== "inspector";

  return (
    <>
      <div className="map-search">
        <span style={{ opacity: 0.4 }}>⌕</span>
        <input placeholder="Търси адрес…" />
      </div>
      {canAdd && (
        <button
          className={`map-btn ${addMode ? "act" : ""}`}
          onClick={() => setAddMode(!addMode)}
        >
          {addMode ? "✕ Отказ" : "＋ Обект"}
        </button>
      )}
      <div id="map" />
      <div className="legend">
        {["none", "planned", "active", "done", "problem"].map((k) => {
          const colors: Record<string, string> = {
            none: "#94A3B8",
            planned: "#3B82F6",
            active: "#F59E0B",
            done: "#10B981",
            problem: "#EF4444",
          };
          const labels: Record<string, string> = {
            none: "Няма задача",
            planned: "Планирано",
            active: "Работи се",
            done: "Готово",
            problem: "Проблем",
          };
          return (
            <div key={k} className="lg">
              <div className="sw" style={{ background: colors[k] }} />
              {labels[k]}
            </div>
          );
        })}
      </div>
    </>
  );
}
