"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface SheetState {
  open: boolean;
  title: string;
  subtitle?: string;
  body: ReactNode;
  foot?: ReactNode;
}

interface UIContextType {
  sheet: SheetState;
  openSheet: (title: string, subtitle: string | undefined, body: ReactNode, foot?: ReactNode) => void;
  closeSheet: () => void;
  toast: (msg: string) => void;
}

const UIContext = createContext<UIContextType>({
  sheet: { open: false, title: "", body: null },
  openSheet: () => {},
  closeSheet: () => {},
  toast: () => {},
});

export function useUI() {
  return useContext(UIContext);
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [sheet, setSheet] = useState<SheetState>({ open: false, title: "", body: null });
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);

  const openSheet = useCallback((title: string, subtitle: string | undefined, body: ReactNode, foot?: ReactNode) => {
    setSheet({ open: true, title, subtitle, body, foot });
  }, []);

  const closeSheet = useCallback(() => {
    setSheet({ open: false, title: "", body: null });
  }, []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastOn(true);
    setTimeout(() => setToastOn(false), 2600);
  }, []);

  return (
    <UIContext.Provider value={{ sheet, openSheet, closeSheet, toast }}>
      {children}
      {sheet.open && (
        <>
          <div className="scrim on" onClick={closeSheet} />
          <div className="sheet on">
            <div className="sheet-head">
              <div className="col" style={{ flex: 1, minWidth: 0 }}>
                <h3>{sheet.title}</h3>
                {sheet.subtitle && <div className="small muted" style={{ marginTop: 3 }}>{sheet.subtitle}</div>}
              </div>
              <button className="x" onClick={closeSheet}>✕</button>
            </div>
            <div className="sheet-body">{sheet.body}</div>
            {sheet.foot && <div className="sheet-foot">{sheet.foot}</div>}
          </div>
        </>
      )}
      <div className={`toast ${toastOn ? "on" : ""}`}>{toastMsg}</div>
    </UIContext.Provider>
  );
}
