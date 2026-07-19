"use client";
// FORCE_REBUILD_3
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@/lib/store";
import {
  USERS, PROPERTIES, TEMPLATES, TASKS, PLANS, FINDINGS, ISSUES,
  myJobs, myProps, myPlans, myFindings, propStatus, trustScore,
  STATUS_MAP, JOBSTATUS, isToday,
} from "@/lib/data";
import { useUI } from "@/components/UIProvider";
import Topbar from "@/components/Topbar";
import Tabs from "@/components/Tabs";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function AppMain() {
  const tab = useStore(s => s.tab);
  const role = useStore(s => s.getRole)();
  const userId = useStore(s => s.user);

  return (
    <div id="app">
      <Topbar />
      <Tabs />
      <div className="main">
        {tab === "map" ? (
          <div id="mapwrap" className="on"><MapView /></div>
        ) : (
          <div id="view" className="pad">
            <TabContent tab={tab} userId={userId} role={role} />
          </div>
        )}
      </div>
    </div>
  );
}

function TabContent({ tab, userId, role }: { tab: string; userId: string; role: string }) {
  switch (tab) {
    case "todo": return <TodoView userId={userId} />;
    case "jobs": return <JobsView userId={userId} />;
    case "props": return <PropsView userId={userId} />;
    case "team": return <TeamView />;
    case "fix": return <FixView userId={userId} role={role} />;
    case "plans": return <PlansView userId={userId} />;
    case "reports": return <ReportsView userId={userId} />;
    case "hist": return <HistView userId={userId} />;
    default: return null;
  }
}

// ====== TODO ======
function TodoView({ userId }: { userId: string }) {
  const jobs = myJobs(userId).filter(j => isToday(j.plannedAt)).sort((a, b) => a.plannedAt - b.plannedAt);
  const done = jobs.filter(j => j.status === 'done' || j.status === 'approved').length;
  const todayStr = new Date().toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' });
  const u = USERS.find(x => x.id === userId);
  const { openSheet, toast } = useUI();

  return (
    <>
      <div className="card card-pad" style={{ background: `linear-gradient(140deg,${u?.color || '#0F766E'},${u?.color || '#115E59'})`, color: '#fff', border: 'none' }}>
        <div className="row">
          <div className="col" style={{ flex: 1 }}>
            <div style={{ fontSize: 13, opacity: .75, fontWeight: 550 }}>{todayStr}</div>
            <h2 style={{ fontSize: 23, marginTop: 3 }}>{jobs.length} {jobs.length === 1 ? 'задача' : 'задачи'}</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 27, fontWeight: 750 }}>{done}/{jobs.length}</div>
            <div style={{ fontSize: 11.5, opacity: .75 }}>завършени</div>
          </div>
        </div>
        <div className="bar" style={{ marginTop: 14, background: 'rgba(255,255,255,.2)' }}>
          <div style={{ width: `${jobs.length ? done / jobs.length * 100 : 0}%`, background: '#fff' }} />
        </div>
      </div>

      {!jobs.length && <div className="empty"><div className="ic">☕</div><h4>Няма задачи днес</h4><p>Почивен ден.</p></div>}

      <div className="section-title">График</div>
      {jobs.map(j => {
        const p = PROPERTIES.find(x => x.id === j.propertyId);
        const t = TEMPLATES.find(x => x.id === j.templateId);
        const st = JOBSTATUS[j.status] || JOBSTATUS.planned;
        const prog = j.items.filter(i => i.done).length;
        return (
          <button key={j.id} className="card" style={{ width: '100%', textAlign: 'left', display: 'block', marginBottom: 10 }}
            onClick={() => {
              // Open task sheet
              const prop = PROPERTIES.find(x => x.id === j.propertyId);
              const tpl = TEMPLATES.find(x => x.id === j.templateId);
              openSheet(
                prop?.name || 'Задача',
                `${tpl?.icon || ''} ${tpl?.name || ''} · ${new Date(j.plannedAt).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}`,
                <TaskSheetContent task={j} />,
                <div className="row" style={{ width: '100%' }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => {
                    window.open(`https://www.openstreetmap.org/?mlat=${prop?.lat}&mlon=${prop?.lng}#map=18/${prop?.lat}/${prop?.lng}`, '_blank');
                  }}>🧭 Навигация</button>
                  {j.status === 'in_progress' ? (
                    <button className="btn btn-primary" style={{ flex: 1.4 }} onClick={() => toast('Готово! Докладът е изпратен')}>Завърши и изпрати</button>
                  ) : null}
                </div>
              );
            }}
          >
            <div className="card-pad">
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <div style={{ width: 52, flexShrink: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{new Date(j.plannedAt).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="tiny muted">{t?.mins} мин</div>
                </div>
                <div className="col" style={{ flex: 1, minWidth: 0 }}>
                  <div className="strong" style={{ fontSize: 15 }}>{p?.name}</div>
                  <div className="small muted" style={{ marginTop: 2 }}>{t?.icon} {t?.name}</div>
                  <div className="tiny muted" style={{ marginTop: 5 }}>📍 {p?.addr}</div>
                </div>
                <span className={`pill ${st.p}`}><span className="bullet" />{st.t}</span>
              </div>
              {j.status === 'in_progress' && (
                <div style={{ marginTop: 13 }}>
                  <div className="row tiny muted" style={{ marginBottom: 5 }}>
                    <span>Чек-лист</span><div className="spacer" /><span>{prog}/{j.items.length}</span>
                  </div>
                  <div className="bar"><div style={{ width: `${prog / j.items.length * 100}%` }} /></div>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </>
  );
}

// Task sheet content
function TaskSheetContent({ task }: { task: any }) {
  const p = PROPERTIES.find(x => x.id === task.propertyId);
  const t = TEMPLATES.find(x => x.id === task.templateId);
  
  // Local state for checklist items (so checkboxes are interactive)
  const [items, setItems] = useState(task.items.map((i: any) => ({ ...i, photos: (i.photos||[]).map((p:any)=>({...p})) })));
  const [viewerImg, setViewerImg] = useState<string | null>(null);
  const [photoMenuFor, setPhotoMenuFor] = useState<number | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const pendingItemRef = useRef<number>(0);
  
  const toggleItem = (itemId: number) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, done: !i.done } : i));
  };
  
  const openPhotoMenu = (itemId: number) => {
    setPhotoMenuFor(itemId);
  };
  
  const takeCamera = () => {
    pendingItemRef.current = photoMenuFor!;
    setPhotoMenuFor(null);
    cameraRef.current?.click();
  };
  
  const pickGallery = () => {
    pendingItemRef.current = photoMenuFor!;
    setPhotoMenuFor(null);
    galleryRef.current?.click();
  };
  
  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const itemId = pendingItemRef.current;
    const url = URL.createObjectURL(file);
    setItems(prev => prev.map(i => i.id === itemId ? {
      ...i,
      photos: [...(i.photos || []), { url, ts: Date.now() }]
    } : i));
    e.target.value = '';
  };
  
  // Group items by zone
  const zones = [...new Set(items.map((i: any) => i.zone))] as string[];
  
  return (
    <div>
      {/* Hidden file inputs — camera (capture) and gallery (no capture) */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment"
        style={{ display: 'none' }} onChange={handleFilePicked} />
      <input ref={galleryRef} type="file" accept="image/*"
        style={{ display: 'none' }} onChange={handleFilePicked} />
      
      {/* Image viewer overlay */}
      {viewerImg && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setViewerImg(null)}>
          <img src={viewerImg} style={{ maxWidth: '94vw', maxHeight: '94dvh', borderRadius: 12, objectFit: 'contain' }} alt="" />
          <button style={{
            position: 'absolute', top: 16, right: 16, width: 36, height: 36,
            borderRadius: '50%', background: 'rgba(255,255,255,.15)', color: '#fff',
            border: 'none', fontSize: 20, cursor: 'pointer', display: 'grid', placeItems: 'center',
          }} onClick={(e) => { e.stopPropagation(); setViewerImg(null); }}>✕</button>
        </div>
      )}

      {/* Photo source menu — 📸 camera or 🖼️ gallery (portal to body to escape sheet stacking context) */}
      {photoMenuFor !== null && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.45)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={() => setPhotoMenuFor(null)}>
          <div style={{
            width: '100%', maxWidth: 420, background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '20px 16px 30px', display: 'flex', gap: 12, flexWrap: 'wrap',
          }} onClick={e => e.stopPropagation()}>
            <button style={{
              flex: 1, minWidth: 140, padding: '16px 12px', borderRadius: 14,
              border: '2px solid var(--line-2)', background: '#fff',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }} onClick={takeCamera}>
              <span style={{ fontSize: 24 }}>📸</span> Снимай
            </button>
            <button style={{
              flex: 1, minWidth: 140, padding: '16px 12px', borderRadius: 14,
              border: '2px solid var(--line-2)', background: '#fff',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }} onClick={pickGallery}>
              <span style={{ fontSize: 24 }}>🖼️</span> От галерия
            </button>
          </div>
        </div>,
        document.body
      )}

      <div className="card card-pad" style={{ background: '#FFFBEB', borderColor: '#FDE68A', marginBottom: 8 }}>
        <div className="tiny strong" style={{ color: '#B45309', textTransform: 'uppercase', letterSpacing: '.05em' }}>Достъп</div>
        <div className="small" style={{ marginTop: 5, lineHeight: 1.5 }}>{p?.access || '—'}</div>
      </div>

      {zones.map(z => {
        const zoneItems = items.filter((i: any) => i.zone === z);
        const done = zoneItems.filter((i: any) => i.done).length;
        return (
          <div key={z}>
            <div className="zone-h">
              <div className="zi">{done === zoneItems.length ? '✓' : '○'}</div>
              {z}
              <span className="zc">{done}/{zoneItems.length}</span>
            </div>
            {zoneItems.map((i: any) => (
              <div key={i.id} className={`chk ${i.done ? 'done' : ''}`}>
                <button className="box" onClick={() => toggleItem(i.id)}>{i.done ? '✓' : ''}</button>
                <div className="chk-body">
                  <div className="chk-txt">{i.text}</div>
                  <div className="chk-meta">
                    {i.req && <span className="req">ЗАДЪЛЖИТЕЛНО</span>}
                    {i.proof === 'photo' && (
                      <span className="cam" style={{ cursor: 'pointer' }} onClick={() => openPhotoMenu(i.id)}>
                        📷 {i.photos?.length ? 'Още' : 'Снимка'}
                      </span>
                    )}
                    {i.proof === 'count' && <span className="cam">Брой: {i.count ?? '—'}</span>}
                    {i.proof === 'note' && i.note && <span className="cam">{i.note}</span>}
                  </div>
                  {i.photos?.length > 0 && (
                    <div className="thumbs">
                      {i.photos.map((ph: any, pi: number) => (
                        <img key={pi} className="thumb" src={ph.url} alt=""
                          style={{ cursor: 'pointer' }}
                          onClick={() => setViewerImg(ph.url)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ====== JOBS ======
function JobsView({ userId }: { userId: string }) {
  const js = [...TASKS].sort((a, b) => b.plannedAt - a.plannedAt);
  const t = js.filter(j => isToday(j.plannedAt));
  const { openSheet } = useUI();

  return (
    <>
      <div className="stats">
        <Stat n={t.length} l="днес" />
        <Stat n={t.filter(j => j.status === 'in_progress').length} l="в процес" color="var(--s-amber)" />
        <Stat n={js.filter(j => j.status === 'done').length} l="чакат" color="var(--s-blue)" />
        <Stat n={ISSUES.filter(i => i.open).length} l="проблема" color="var(--s-red)" />
      </div>

      {ISSUES.filter(i => i.open).map(is => {
        const p = PROPERTIES.find(x => x.id === is.propertyId);
        const u = USERS.find(x => x.id === is.reportedById);
        return (
          <div key={is.id} className="card card-pad" style={{ borderLeft: '3px solid var(--s-red)', marginTop: 12, cursor: 'pointer' }}
            onClick={() => {
              const pp = PROPERTIES.find(x => x.id === is.propertyId);
              openSheet(pp?.name || 'Проблем', is.text, <div className="card-pad"><p className="small">{is.text}</p><p className="tiny muted">{u?.name} · {new Date(is.ts).toLocaleString('bg-BG')}</p></div>);
            }}>
            <div className="row"><div className="lrow-ic" style={{ background: '#FEF2F2' }}>⚠️</div>
              <div className="col"><div className="strong small">{p?.name}</div>
                <div className="small">{is.text}</div>
                <div className="tiny muted">{u?.name} · {new Date(is.ts).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}</div>
              </div></div>
          </div>
        );
      })}

      <div className="section-title">Всички задачи</div>
      <div className="card">
        {js.map(j => {
          const p = PROPERTIES.find(x => x.id === j.propertyId);
          const tpl = TEMPLATES.find(x => x.id === j.templateId);
          const a = USERS.find(x => x.id === j.assigneeId);
          const st = JOBSTATUS[j.status] || JOBSTATUS.planned;
          const tr = trustScore(j);
          return (
            <div key={j.id} className="lrow" style={{ cursor: 'pointer' }}
              onClick={() => {
                const prop = PROPERTIES.find(x => x.id === j.propertyId);
                const templ = TEMPLATES.find(x => x.id === j.templateId);
                openSheet(
                  prop?.name || 'Задача',
                  `${templ?.icon || ''} ${templ?.name || ''} · ${new Date(j.plannedAt).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}`,
                  <TaskSheetContent task={j} />,
                  <div className="row" style={{ width: '100%' }}>
                    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => {
                      window.open(`https://www.openstreetmap.org/?mlat=${prop?.lat}&mlon=${prop?.lng}#map=18/${prop?.lat}/${prop?.lng}`, '_blank');
                    }}>🧭 Навигация</button>
                  </div>
                );
              }}>
              <div className="lrow-ic" style={{ background: 'var(--accent-soft)' }}>{tpl?.icon}</div>
              <div className="lrow-body">
                <div className="lrow-title">{p?.name}</div>
                <div className="lrow-sub">{new Date(j.plannedAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}, {new Date(j.plannedAt).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })} · {a?.name}</div>
              </div>
              {tr && <span className="tiny strong" style={{ color: tr.score >= 85 ? 'var(--s-green)' : tr.score >= 60 ? 'var(--s-amber)' : 'var(--s-red)', marginRight: 6 }}>{tr.score}</span>}
              <span className={`pill ${st.p}`}>{st.t}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ====== Shared components ======
function PropsView({ userId }: { userId: string }) {
  const ps = myProps(userId);
  const ICON: Record<string, string> = { apartment: '🏢', studio: '🏠', house: '🏡', office: '🏬', villa: '🏰' };
  const { openSheet } = useUI();
  return (
    <>
      <div className="section-title">{ps.length} обекта</div>
      <div className="card">
        {ps.map(p => {
          const st = propStatus(p.id, userId); const cfg = STATUS_MAP[st] || STATUS_MAP.none;
          return (
            <div key={p.id} className="lrow" style={{ cursor: 'pointer' }}
              onClick={() => {
                const pJobs = [...TASKS].filter(j => j.propertyId === p.id).sort((a, b) => b.plannedAt - a.plannedAt);
                openSheet(
                  p.name, p.addr,
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
                        const st2 = JOBSTATUS[j.status] || JOBSTATUS.planned;
                        return (
                          <div key={j.id} className="lrow">
                            <div className="lrow-ic" style={{ background: 'var(--accent-soft)' }}>{tp?.icon}</div>
                            <div className="lrow-body">
                              <div className="lrow-title">{tp?.name}</div>
                              <div className="lrow-sub">{new Date(j.plannedAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}, {new Date(j.plannedAt).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })} · {a?.name}</div>
                            </div>
                            <span className={`pill ${st2.p}`}>{st2.t}</span>
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
              }}>
              <div className="lrow-ic" style={{ background: 'var(--line-2)' }}>{ICON[p.type] || '🏠'}</div>
              <div className="lrow-body"><div className="lrow-title">{p.name}</div><div className="lrow-sub">{p.addr}</div></div>
              <span className={`pill p-${cfg.c === 'gray' ? 'gray' : cfg.c}`}><span className="bullet" />{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TeamView() {
  return (
    <>
      {(['cleaner', 'inspector', 'owner'] as const).map(role => {
        const roleUsers = USERS.filter(u => u.role === role);
        const labels = { cleaner: 'Изпълнители (Почистване)', inspector: 'Инспектори (Обходи)', owner: 'Собственици' };
        return (
          <div key={role}><div className="section-title">{labels[role]}</div><div className="card">
            {roleUsers.map(u => {
              const js = TASKS.filter(j => j.assigneeId === u.id);
              const tds = js.filter(j => isToday(j.plannedAt));
              const scores = js.map(trustScore).filter(Boolean).map(t => t!.score);
              const avg = scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : null;
              return (
                <div key={u.id} className="lrow">
                  <div className="lrow-ic" style={{ background: u.color, color: '#fff', fontWeight: 700 }}>{u.name[0]}</div>
                  <div className="lrow-body"><div className="lrow-title">{u.name}</div><div className="lrow-sub">{tds.length} днес · {js.length} общо</div></div>
                  {avg !== null && <span className={`pill ${avg >= 85 ? 'p-green' : avg >= 60 ? 'p-amber' : 'p-red'}`}>{avg}</span>}
                </div>
              );
            })}
          </div></div>
        );
      })}
    </>
  );
}

function PlansView({ userId }: { userId: string }) {
  const pls = myPlans(userId);
  const month = new Date().toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' });
  return (
    <>
      <div className="card card-pad" style={{ background: 'linear-gradient(140deg,#0F766E,#115E59)', color: '#fff', border: 'none' }}>
        <div style={{ fontSize: 13, opacity: .75 }}>{month}</div>
        <h2 style={{ fontSize: 23, marginTop: 3 }}>Обектите ти са под наблюдение</h2>
        <div className="row" style={{ marginTop: 16, gap: 22 }}>
          <div><div style={{ fontSize: 25, fontWeight: 730 }}>{pls.length}</div><div style={{ fontSize: 11.5, opacity: .75 }}>абонамента</div></div>
          <div><div style={{ fontSize: 25, fontWeight: 730 }}>{pls.reduce((s, p) => s + p.perMonth, 0)}</div><div style={{ fontSize: 11.5, opacity: .75 }}>посещения/мес</div></div>
          <div><div style={{ fontSize: 25, fontWeight: 730 }}>{pls.reduce((s, p) => s + p.price, 0)} лв</div><div style={{ fontSize: 11.5, opacity: .75 }}>месечно</div></div>
        </div>
      </div>
      <div className="section-title">Абонаменти</div>
      {pls.map(pl => {
        const p = PROPERTIES.find(x => x.id === pl.propertyId);
        const t = TEMPLATES.find(x => x.id === pl.templateId);
        return (
          <div key={pl.id} className="card" style={{ marginBottom: 12 }}>
            <div className="card-pad">
              <div className="row"><div className="lrow-ic" style={{ background: 'var(--accent-soft)', fontSize: 19 }}>{t?.icon}</div>
                <div className="col"><div className="strong">{pl.name}</div><div className="small muted">{p?.name}</div></div>
                <div style={{ textAlign: 'right' }}><div className="strong">{pl.price} лв</div><div className="tiny muted">/мес</div></div>
              </div>
              <div style={{ marginTop: 15 }}><div className="bar"><div style={{ width: '67%' }} /></div></div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function FixView({ userId, role }: { userId: string; role: string }) {
  const fs = myFindings(userId);
  const { openSheet } = useUI();
  const FSTATUS: Record<string, { p: string; t: string; ic: string }> = {
    reported: { p: 'p-amber', t: 'Чака решение', ic: '⏳' },
    quoted: { p: 'p-blue', t: 'Оферта', ic: '📄' },
    accepted: { p: 'p-green', t: 'Приета', ic: '✓' },
    declined: { p: 'p-gray', t: 'Отказана', ic: '—' },
  };
  return (
    <>
      <div className="stats">
        <Stat n={fs.filter(f => f.status === 'reported').length} l="чакат" color="var(--s-amber)" />
        <Stat n={fs.filter(f => f.status === 'quoted').length} l="с оферта" color="var(--s-blue)" />
        <Stat n={fs.filter(f => f.status === 'accepted').length} l="приети" color="var(--s-green)" />
      </div>
      <div className="section-title">Констатации</div>
      <div className="card">
        {fs.map(f => {
          const st = FSTATUS[f.status]; const p = PROPERTIES.find(x => x.id === f.propertyId);
          return (
            <div key={f.id} className="lrow" style={{ cursor: 'pointer' }}
              onClick={() => openSheet(f.title, p?.name || '', 
                <div className="card-pad">
                  <span className={`pill ${st.p}`}>{st.t}</span>
                  <div className="strong" style={{ marginTop: 12 }}>{f.title}</div>
                  <div className="small muted" style={{ marginTop: 6 }}>{f.desc}</div>
                  <div className="tiny muted" style={{ marginTop: 10 }}>{p?.name} · {new Date(f.ts).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                  {f.photos?.length > 0 && <div className="thumbs">{f.photos.map((ph: any, pi: number) => <img key={pi} className="thumb" src={ph} alt="" />)}</div>}
                </div>
              )}>
              <div className="lrow-ic">{st.ic}</div>
              <div className="lrow-body"><div className="lrow-title">{f.title}</div><div className="lrow-sub">{p?.name} · {new Date(f.ts).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}</div></div>
              <span className={`pill ${st.p}`}>{st.t}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function ReportsView({ userId }: { userId: string }) {
  const js = myJobs(userId).filter(j => j.status !== 'planned' && j.status !== 'in_progress').sort((a, b) => (b.checkOut || b.plannedAt) - (a.checkOut || a.plannedAt));
  const { openSheet } = useUI();
  return (
    <>
      <div className="section-title">История</div>
      <div className="card">
        {js.map(j => {
          const p = PROPERTIES.find(x => x.id === j.propertyId);
          const tpl = TEMPLATES.find(x => x.id === j.templateId);
          const st = JOBSTATUS[j.status] || JOBSTATUS.planned;
          return (
            <div key={j.id} className="lrow" style={{ cursor: 'pointer' }}
              onClick={() => {
                openSheet(p?.name || 'Задача', `${tpl?.icon || ''} ${tpl?.name || ''}`, <TaskSheetContent task={j} />);
              }}>
              <div className="lrow-ic" style={{ background: 'var(--accent-soft)' }}>{tpl?.icon}</div>
              <div className="lrow-body"><div className="lrow-title">{p?.name}</div><div className="lrow-sub">{new Date(j.checkOut || j.plannedAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}</div></div>
              <span className={`pill ${st.p}`}>{st.t}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function HistView({ userId }: { userId: string }) {
  const js = myJobs(userId).filter(j => j.status !== 'planned').sort((a, b) => (b.checkOut || b.plannedAt) - (a.checkOut || a.plannedAt));
  const scores = js.map(trustScore).filter(Boolean).map(t => t!.score);
  const avg = scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : null;
  const { openSheet } = useUI();
  return (
    <>
      <div className="stats">
        <Stat n={js.length} l="посещения" />
        <Stat n={avg || '—'} l="средна оценка" color={avg && avg >= 85 ? 'var(--s-green)' : 'var(--s-amber)'} />
      </div>
      <div className="section-title">Завършени</div>
      <div className="card">
        {js.map(j => {
          const p = PROPERTIES.find(x => x.id === j.propertyId);
          const tpl = TEMPLATES.find(x => x.id === j.templateId);
          const tr = trustScore(j);
          return (
            <div key={j.id} className="lrow" style={{ cursor: 'pointer' }}
              onClick={() => {
                openSheet(p?.name || 'Задача', `${tpl?.icon || ''} ${tpl?.name || ''}`, <TaskSheetContent task={j} />);
              }}>
              <div className="lrow-ic" style={{ background: 'var(--accent-soft)' }}>{tpl?.icon}</div>
              <div className="lrow-body"><div className="lrow-title">{p?.name}</div><div className="lrow-sub">{new Date(j.checkOut || j.plannedAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}</div></div>
              {tr && <span className={`pill ${tr.score >= 85 ? 'p-green' : tr.score >= 60 ? 'p-amber' : 'p-red'}`}>{tr.score}</span>}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Stat({ n, l, color }: { n: number | string; l: string; color?: string }) {
  return <div className="stat"><div className="n" style={color ? { color } : undefined}>{n}</div><div className="l">{l}</div></div>;
}
