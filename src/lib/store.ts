"use client";

import { create } from "zustand";

const ROLES: Record<string, string[]> = {
  admin: ["map", "jobs", "fix", "props", "team"],
  owner: ["plans", "map", "fix", "reports"],
  cleaner: ["todo", "map", "hist"],
  inspector: ["todo", "map", "hist"],
};

const TAB_LABELS: Record<string, string> = {
  map: "Карта",
  jobs: "Задачи",
  fix: "Ремонти",
  props: "Обекти",
  team: "Екип",
  plans: "Абонаменти",
  reports: "Доклади",
  todo: "Днес",
  hist: "История",
};

export const useStore = create<{
  user: string;
  tab: string;
  module: "cleaning" | "inspection";
  setUser: (id: string) => void;
  setTab: (tab: string) => void;
  setModule: (m: "cleaning" | "inspection") => void;
  getTabs: () => string[];
  getLabel: (tab: string) => string;
  getRole: () => string;
}>((set, get) => ({
  user: "u_admin",
  tab: "map",
  module: "cleaning",

  setUser: (id) => {
    const role = ["u_admin"].includes(id) ? "admin"
      : ["u_own1"].includes(id) ? "owner"
      : ["u_cl1"].includes(id) ? "cleaner"
      : "inspector";
    const defaultTab = ROLES[role]?.[0] || "map";
    set({ user: id, tab: defaultTab });
  },

  setTab: (tab) => set({ tab }),
  setModule: (m) => set({ module: m }),

  getTabs: () => {
    const role = ["u_admin"].includes(get().user) ? "admin"
      : ["u_own1"].includes(get().user) ? "owner"
      : ["u_cl1"].includes(get().user) ? "cleaner"
      : "inspector";
    return ROLES[role] || ["map"];
  },

  getLabel: (tab) => TAB_LABELS[tab] || tab,
  getRole: () => {
    const uid = get().user;
    if (["u_admin"].includes(uid)) return "admin";
    if (["u_own1"].includes(uid)) return "owner";
    if (["u_cl1"].includes(uid)) return "cleaner";
    return "inspector";
  },
}));
