"use client";

import { create } from "zustand";
import { USERS } from "@/lib/data";

const ROLES: Record<string, string[]> = {
  admin: ["map", "jobs", "fix", "props", "team"],
  owner: ["plans", "map", "fix", "reports"],
  cleaner: ["todo", "map", "hist"],
  inspector: ["todo", "map", "hist"],
};

const TAB_LABELS: Record<string, string> = {
  map: "Карта", jobs: "Задачи", fix: "Ремонти", props: "Обекти",
  team: "Екип", plans: "Абонаменти", reports: "Доклади",
  todo: "Днес", hist: "История",
};

export const useStore = create<{
  user: string; tab: string;
  setUser: (id: string) => void; setTab: (tab: string) => void;
  getTabs: () => string[]; getLabel: (tab: string) => string; getRole: () => string;
}>((set, get) => ({
  user: "u_admin1",
  tab: "map",

  setUser: (id) => {
    const u = USERS.find(x => x.id === id);
    const role = u?.role || "admin";
    const defaultTab = ROLES[role]?.[0] || "map";
    set({ user: id, tab: defaultTab });
  },

  setTab: (tab) => set({ tab }),

  getTabs: () => {
    const u = USERS.find(x => x.id === get().user);
    const role = u?.role || "admin";
    return ROLES[role] || ["map"];
  },

  getLabel: (tab) => TAB_LABELS[tab] || tab,

  getRole: () => {
    const u = USERS.find(x => x.id === get().user);
    return u?.role || "admin";
  },
}));
