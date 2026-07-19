"use client";

import { useStore } from "@/lib/store";
import {
  USERS, PROPERTIES, TEMPLATES, TASKS, PLANS, FINDINGS, ISSUES,
  myJobs, myProps, myPlans, myFindings, propStatus, trustScore,
  STATUS_MAP, JOBSTATUS, isToday,
} from "@/lib/data";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function Home() {
  const { tab, user } = useStore();
  const role = useStore.getRole();

  if (tab === "map") {
    return (
      <>
        <div id="mapwrap" className="on"><MapView /></div>
        <div id="view" style={{ display: "none" }} />
      </>
    );
  }

  return (
    <>
      <div id="mapwrap" />
      <div id="view" className="pad">
        <TabContent tab={tab} userId={user} role={role} />
      </div>
    </>
  );
}

function TabContent({ tab, userId, role }: { tab: string; userId: string; role: string }) {
  switch (tab) {
    case "todo": return <TodoView userId={userId} />;
    case "jobs": return <JobsView />;
    case "props": return <PropsView userId={userId} />;
    case "team": return <TeamView />;
    case "fix": return <FixView userId={userId} role={role} />;
    case "plans": return <PlansView userId={userId} />;
    case "reports": return <ReportsView userId={userId} />;
    case "hist": return <HistView userId={userId} />;
    default: return null;
  }
}

// ====== TODO (cleaner/inspector) ======
function TodoView({ userId }: { userId: string }) {
  const jobs = myJobs(userId).filter(j => isToday(j.plannedAt)).sort((a, b) => a.plannedAt - b.plannedAt);
  const done = jobs.filter(j => j.status === 'done' || j.status === 'approved').length;
  const todayStr = new Date().toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' });
  const u = USERS.find(x => x.id === userId);

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
          <button key={j.id} className="card" style={{ width: '100%', textAlign: 'left', display: 'block', marginBottom: 10 }}>
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

// ====== JOBS (admin) ======
function JobsView() {
  const js = [...TASKS].sort((a, b) => b.plannedAt - a.plannedAt);
  const t = js.filter(j => isToday(j.plannedAt));

  return (
    <>
      <div className="stats">
        <Stat n={t.length} l="днес" />
        <Stat n={t.filter(j => j.status === 'in_progress').length} l="в процес" color="var(--s-amber)" />
        <Stat n={js.filter(j => j.status === 'done').length} l="чакат одобрение" color="var(--s-blue)" />
        <Stat n={ISSUES.filter(i => i.open).length} l="проблема" color="var(--s-red)" />
      </div>

      {ISSUES.filter(i => i.open).map(is => {
        const p = PROPERTIES.find(x => x.id === is.propertyId);
        const u = USERS.find(x => x.id === is.reportedById);
        return (
          <div key={is.id} className="card card-pad" style={{ borderLeft: '3px solid var(--s-red)', marginTop: 12 }}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div className="lrow-ic" style={{ background: '#FEF2F2' }}>⚠️</div>
              <div className="col" style={{ flex: 1 }}>
                <div className="strong small">{p?.name}</div>
                <div className="small" style={{ marginTop: 3 }}>{is.text}</div>
                <div className="tiny muted" style={{ marginTop: 5 }}>{u?.name} · {new Date(is.ts).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
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
            <div key={j.id} className="lrow">
              <div className="lrow-ic" style={{ background: 'var(--accent-soft)' }}>{tpl?.icon || '📋'}</div>
              <div className="lrow-body">
                <div className="lrow-title">{p?.name}</div>
                <div className="lrow-sub">{new Date(j.plannedAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}, {new Date(j.plannedAt).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })} · {a?.name}</div>
              </div>
              {tr && <span className="tiny strong" style={{ color: tr.score >= 85 ? 'var(--s-green)' : tr.score >= 60 ? 'var(--s-amber)' : 'var(--s-red)' }}>{tr.score}</span>}
              <span className={`pill ${st.p}`}>{st.t}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ====== PROPS ======
function PropsView({ userId }: { userId: string }) {
  const ps = myProps(userId);
  const role = useStore.getRole();
  const ICON: Record<string, string> = { apartment: '🏢', studio: '🏠', house: '🏡', office: '🏬', villa: '🏰' };

  return (
    <>
      <div className="section-title">{ps.length} {ps.length === 1 ? 'обект' : 'обекта'}</div>
      <div className="card">
        {ps.map(p => {
          const st = propStatus(p.id, userId);
          const cfg = STATUS_MAP[st] || STATUS_MAP.none;
          return (
            <div key={p.id} className="lrow">
              <div className="lrow-ic" style={{ background: 'var(--line-2)' }}>{ICON[p.type] || '🏠'}</div>
              <div className="lrow-body">
                <div className="lrow-title">{p.name}</div>
                <div className="lrow-sub">{p.addr}</div>
              </div>
              <span className={`pill p-${cfg.c === 'gray' ? 'gray' : cfg.c}`}><span className="bullet" />{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ====== TEAM (admin) ======
function TeamView() {
  const roles = [
    { key: 'cleaner', label: 'Изпълнители (Почистване)', users: USERS.filter(u => u.role === 'cleaner') },
    { key: 'inspector', label: 'Инспектори (Обходи)', users: USERS.filter(u => u.role === 'inspector') },
    { key: 'owner', label: 'Собственици', users: USERS.filter(u => u.role === 'owner') },
  ];

  return (
    <>
      {roles.map(({ key, label, users: roleUsers }) => (
        <div key={key}>
          <div className="section-title">{label}</div>
          <div className="card">
            {roleUsers.map(u => {
              const js = TASKS.filter(j => j.assigneeId === u.id);
              const tds = js.filter(j => isToday(j.plannedAt));
              const scores = js.map(trustScore).filter(Boolean).map(t => t!.score);
              const avg = scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : null;
              return (
                <div key={u.id} className="lrow">
                  <div className="lrow-ic" style={{ background: u.color, color: '#fff', fontWeight: 700 }}>{u.name[0]}</div>
                  <div className="lrow-body">
                    <div className="lrow-title">{u.name}</div>
                    <div className="lrow-sub">{tds.length} задачи днес · {js.length} общо</div>
                  </div>
                  {avg !== null && <span className={`pill ${avg >= 85 ? 'p-green' : avg >= 60 ? 'p-amber' : 'p-red'}`}>{avg}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

// ====== PLANS (owner) ======
function PlansView({ userId }: { userId: string }) {
  const pls = myPlans(userId);
  const month = new Date().toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' });

  return (
    <>
      <div className="card card-pad" style={{ background: 'linear-gradient(140deg,#0F766E,#115E59)', color: '#fff', border: 'none' }}>
        <div style={{ fontSize: 13, opacity: .75, fontWeight: 550, textTransform: 'capitalize' }}>{month}</div>
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
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <div className="lrow-ic" style={{ background: pl.season === 'winter' ? '#EFF6FF' : 'var(--accent-soft)', fontSize: 19 }}>{t?.icon}</div>
                <div className="col" style={{ flex: 1, minWidth: 0 }}>
                  <div className="strong" style={{ fontSize: 15.5 }}>{pl.name}</div>
                  <div className="small muted" style={{ marginTop: 2 }}>{p?.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}><div className="strong">{pl.price} лв</div><div className="tiny muted">на месец</div></div>
              </div>
              <div style={{ marginTop: 15 }}>
                <div className="bar"><div style={{ width: '67%' }} /></div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ====== FIX (findings) ======
function FixView({ userId, role }: { userId: string; role: string }) {
  const fs = myFindings(userId);
  const waiting = fs.filter(f => role === 'owner' ? (f.status === 'quoted' || f.status === 'reported') : f.status === 'reported');
  const FSTATUS: Record<string, { p: string; t: string; ic: string }> = {
    reported: { p: 'p-amber', t: 'Чака решение', ic: '⏳' },
    quoted: { p: 'p-blue', t: 'Оферта при теб', ic: '📄' },
    accepted: { p: 'p-green', t: 'Приета', ic: '✓' },
    declined: { p: 'p-gray', t: 'Отказана', ic: '—' },
  };

  return (
    <>
      <div className="stats">
        <Stat n={fs.filter(f => f.status === 'reported').length} l="чакат решение" color="var(--s-amber)" />
        <Stat n={fs.filter(f => f.status === 'quoted').length} l="с оферта" color="var(--s-blue)" />
        <Stat n={fs.filter(f => f.status === 'accepted').length} l="приети" color="var(--s-green)" />
      </div>
      {waiting.length > 0 && (
        <div className="card card-pad" style={{ marginTop: 12, background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <div className="small strong">{waiting.length} {waiting.length === 1 ? 'позиция чака' : 'позиции чакат'} {role === 'owner' ? 'твоето решение' : 'оферта от теб'}</div>
        </div>
      )}
      <div className="section-title">Констатации</div>
      <div className="card">
        {fs.map(f => {
          const st = FSTATUS[f.status];
          const p = PROPERTIES.find(x => x.id === f.propertyId);
          return (
            <div key={f.id} className="lrow">
              <div className="lrow-ic" style={{ background: f.status === 'reported' ? '#FFFBEB' : f.status === 'quoted' ? '#EFF6FF' : '#F1F5F9' }}>{st.ic}</div>
              <div className="lrow-body">
                <div className="lrow-title">{f.title}</div>
                <div className="lrow-sub">{p?.name} · {new Date(f.ts).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}{f.offer ? ` · ${f.offer.price} лв` : ''}</div>
              </div>
              <span className={`pill ${st.p}`}>{st.t}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ====== REPORTS (owner) ======
function ReportsView({ userId }: { userId: string }) {
  const js = myJobs(userId).filter(j => j.status === 'done' || j.status === 'approved' || j.status === 'disputed')
    .sort((a, b) => (b.checkOut || b.plannedAt) - (a.checkOut || a.plannedAt));
  const wait = js.filter(j => j.status === 'done');

  return (
    <>
      {wait.length > 0 && (
        <div className="card card-pad" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <div className="row">
            <div className="lrow-ic" style={{ background: '#FEF3C7' }}>⏳</div>
            <div className="col" style={{ flex: 1 }}>
              <div className="strong small">{wait.length} {wait.length === 1 ? 'доклад чака' : 'доклада чакат'} преглед</div>
              <div className="tiny muted" style={{ marginTop: 2 }}>Ако не реагираш до 48 ч, се приемат автоматично</div>
            </div>
          </div>
        </div>
      )}
      <div className="section-title">История</div>
      <div className="card">
        {js.map(j => {
          const p = PROPERTIES.find(x => x.id === j.propertyId);
          const tpl = TEMPLATES.find(x => x.id === j.templateId);
          const st = JOBSTATUS[j.status] || JOBSTATUS.planned;
          const ph = j.items.reduce((n, i) => n + i.photos.length, 0);
          const dur = (a?: number, b?: number) => {
            if (!a || !b) return '—';
            const m = Math.round((b - a) / 60000);
            return m < 60 ? `${m} мин` : `${Math.floor(m / 60)} ч ${m % 60 ? (m % 60) + ' мин' : ''}`;
          };
          return (
            <div key={j.id} className="lrow">
              <div className="lrow-ic" style={{ background: 'var(--accent-soft)' }}>{tpl?.icon}</div>
              <div className="lrow-body">
                <div className="lrow-title">{p?.name}</div>
                <div className="lrow-sub">{new Date(j.checkOut || j.plannedAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })} · {dur(j.checkIn, j.checkOut)} · {ph} снимки</div>
              </div>
              <span className={`pill ${st.p}`}>{st.t}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ====== HIST (cleaner/inspector) ======
function HistView({ userId }: { userId: string }) {
  const js = myJobs(userId).filter(j => j.status !== 'planned' && !isToday(j.plannedAt || 0))
    .sort((a, b) => (b.checkOut || b.plannedAt) - (a.checkOut || a.plannedAt));
  const scores = js.map(trustScore).filter(Boolean).map(t => t!.score);
  const avg = scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : null;

  return (
    <>
      <div className="stats">
        <Stat n={js.length} l="посещения" />
        <Stat n={avg || '—'} l="средна оценка" color={avg && avg >= 85 ? 'var(--s-green)' : 'var(--s-amber)'} />
        <Stat n={js.filter(j => j.review?.verdict === 'approved').length} l="одобрени" color="var(--s-green)" />
      </div>
      <div className="section-title">Завършени</div>
      <div className="card">
        {js.map(j => {
          const p = PROPERTIES.find(x => x.id === j.propertyId);
          const tpl = TEMPLATES.find(x => x.id === j.templateId);
          const tr = trustScore(j);
          const dur = (a?: number, b?: number) => {
            if (!a || !b) return '—';
            const m = Math.round((b - a) / 60000);
            return m < 60 ? `${m} мин` : `${Math.floor(m / 60)} ч`;
          };
          return (
            <div key={j.id} className="lrow">
              <div className="lrow-ic" style={{ background: 'var(--accent-soft)' }}>{tpl?.icon}</div>
              <div className="lrow-body">
                <div className="lrow-title">{p?.name}</div>
                <div className="lrow-sub">{new Date(j.checkOut || j.plannedAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })} · {dur(j.checkIn, j.checkOut)}</div>
              </div>
              {tr && <span className={`pill ${tr.score >= 85 ? 'p-green' : tr.score >= 60 ? 'p-amber' : 'p-red'}`}>{tr.score}</span>}
            </div>
          );
        })}
      </div>
    </>
  );
}

// Stat helper
function Stat({ n, l, color }: { n: number | string; l: string; color?: string }) {
  return (
    <div className="stat">
      <div className="n" style={color ? { color } : undefined}>{n}</div>
      <div className="l">{l}</div>
    </div>
  );
}
