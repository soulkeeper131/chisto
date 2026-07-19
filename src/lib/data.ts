// Пълни mock данни — 3 потребителя на роля (12 общо)
// + обекти + шаблони + задачи + абонаменти + констатации

export interface User {
  id: string; name: string; role: 'admin' | 'owner' | 'cleaner' | 'inspector';
  color: string; sub: string;
}

export interface Property {
  id: string; name: string; addr: string; lat: number; lng: number;
  type: string; ownerId: string; radius: number; access: string; utils: string;
  zones: string[]; vacantSince?: number;
}

export interface Template {
  id: string; name: string; module: 'cleaning' | 'inspection';
  mins: number; icon: string; season: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  zone: string; text: string; proof: 'photo' | 'note' | 'count' | 'none';
  req: boolean;
}

export interface Task {
  id: string; propertyId: string; templateId: string; assigneeId: string;
  plannedAt: number; status: string; checkIn?: number; checkOut?: number;
  inZone?: boolean; gpsAcc?: number; items: TaskItem[]; planId?: string;
  review?: { by: string; verdict: string; note: string; ts: number };
}

export interface TaskItem extends ChecklistItem {
  id: string; done: boolean; photos: { url: string; ts: number }[];
  note: string; count: number | null;
}

export interface Plan {
  id: string; propertyId: string; templateId: string; name: string;
  module: string; season: string; perMonth: number; price: number;
}

export interface Finding {
  id: string; propertyId: string; reportedById: string;
  title: string; text: string; photos: { url: string; ts: number }[];
  status: string; offer?: { price: number; days: number; scope: string; ts: number };
  decision?: { by: string; ts: number };
  ts: number;
}

export interface Issue {
  id: string; taskId: string; propertyId: string; reportedById: string;
  text: string; ts: number; open: boolean;
}

// ====== USERS (3 per role) ======
export const USERS: User[] = [
  // Admins
  { id:'u_admin1', name:'Владимир Тодоров', role:'admin', color:'#0F172A', sub:'Диспечер' },
  { id:'u_admin2', name:'Петя Димитрова', role:'admin', color:'#334155', sub:'Диспечер' },
  { id:'u_admin3', name:'Георги Стоянов', role:'admin', color:'#475569', sub:'Диспечер' },

  // Owners
  { id:'u_own1', name:'Елена Петрова', role:'owner', color:'#7C3AED', sub:'Собственик · София' },
  { id:'u_own2', name:'Димитър Андреев', role:'owner', color:'#A855F7', sub:'Собственик · Варна' },
  { id:'u_own3', name:'Радост Иванова', role:'owner', color:'#C084FC', sub:'Собственик · Пловдив' },

  // Cleaners
  { id:'u_cl1', name:'Мария Стоянова', role:'cleaner', color:'#0F766E', sub:'Изпълнител' },
  { id:'u_cl2', name:'Иван Георгиев', role:'cleaner', color:'#B45309', sub:'Изпълнител' },
  { id:'u_cl3', name:'Силвия Колева', role:'cleaner', color:'#0891B2', sub:'Изпълнител' },

  // Inspectors
  { id:'u_ins1', name:'Мария Стоянова', role:'inspector', color:'#1D4E89', sub:'Инспектор · Център' },
  { id:'u_ins2', name:'Иван Георгиев', role:'inspector', color:'#B45309', sub:'Инспектор · Изток' },
  { id:'u_ins3', name:'Красимира Ангелова', role:'inspector', color:'#6D28D9', sub:'Инспектор · Запад' },
];

// ====== PROPERTIES (5 shared) ======
export const PROPERTIES: Property[] = [
  { id:'p1', name:'Апартамент Витоша 42', addr:'бул. Витоша 42, ет. 3, ап. 7',
    lat:42.6912, lng:23.3186, type:'apartment', ownerId:'u_own1', radius:75,
    access:'Ключова кутия вдясно от входа, код 4471. Паркинг в двора, място №3.',
    utils:'Спирателен кран под мивката. Ел. табло в антрето.',
    zones:['Спалня','Баня','Кухня','Дневна'], vacantSince: Date.now()-90*86400000 },
  { id:'p2', name:'Студио Оборище', addr:'ул. Оборище 18, ет. 2',
    lat:42.6975, lng:23.3421, type:'studio', ownerId:'u_own1', radius:60,
    access:'Домофон 12. Ключът е при портиера до 18:00.',
    utils:'Бойлерът е спрян. Водата остава пусната.',
    zones:['Стая','Баня','Кухненски бокс'], vacantSince: Date.now()-190*86400000 },
  { id:'p3', name:'Къща Драгалевци', addr:'ул. Прохлада 9, Драгалевци',
    lat:42.6389, lng:23.3172, type:'house', ownerId:'u_own1', radius:110,
    access:'Портата се отваря с код 2208. Внимание: куче в двора, вързано е.',
    utils:'Главен кран в шахтата. Отопление на минимум 12°C.',
    zones:['Двор','Партер','Спалня 1','Спалня 2','Баня','Мазе'], vacantSince: Date.now()-620*86400000 },
  { id:'p4', name:'Апартамент Лозенец', addr:'ул. Кричим 24, ет. 5',
    lat:42.6738, lng:23.3208, type:'apartment', ownerId:'u_own2', radius:70,
    access:'Асансьор до 5 ет. Ключ в кутия до пощенските кутии, код 9013.',
    utils:'Климатик в дневната. Спирателен кран в банята.',
    zones:['Спалня','Баня','Кухня','Дневна','Тераса'], vacantSince: Date.now()-95*86400000 },
  { id:'p5', name:'Вила Бояна', addr:'ул. Кумата 61, Бояна',
    lat:42.6435, lng:23.2661, type:'villa', ownerId:'u_own2', radius:130,
    access:'Ключ при пазача на комплекса. Представи се на входа.',
    utils:'Басейнът е източен. Водата към двора е спряна.',
    zones:['Двор','Партер','Етаж','Баня','Котелно'], vacantSince: Date.now()-300*86400000 },
  { id:'p6', name:'Офис Младост', addr:'бул. Ал. Малинов 31, офис 4',
    lat:42.6501, lng:23.3789, type:'office', ownerId:'u_own3', radius:80,
    access:'Рецепция на партера. Достъп след 18:30.',
    utils:'Сървърно помещение с климатик.',
    zones:['Работна зона','Заседателна','Санитарни','Кухня'] },
];

// ====== TEMPLATES (cleaning + inspection) ======
export const TEMPLATES: Template[] = [
  // Cleaning
  { id:'t_clean_std', name:'Стандартно почистване след гост', module:'cleaning', mins:90, icon:'🧹', season:'all', items:[
    {zone:'Спалня', text:'Смяна на спално бельо — пълен комплект', proof:'photo', req:true},
    {zone:'Спалня', text:'Прахосмукачка на пода и под леглото', proof:'none', req:true},
    {zone:'Баня', text:'Дезинфекция на тоалетна, мивка и душ', proof:'photo', req:true},
    {zone:'Баня', text:'Свежи кърпи — брой оставени комплекти', proof:'count', req:true},
    {zone:'Кухня', text:'Празен и почистен хладилник', proof:'photo', req:true},
    {zone:'Дневна', text:'Прахосмукачка и подредба', proof:'photo', req:true},
  ]},
  { id:'t_clean_deep', name:'Дълбоко почистване', module:'cleaning', mins:210, icon:'✨', season:'all', items:[
    {zone:'Баня', text:'Обезваряване на плочки и фуги', proof:'photo', req:true},
    {zone:'Кухня', text:'Фурна отвътре', proof:'photo', req:true},
    {zone:'Дневна', text:'Прозорци отвътре и отвън', proof:'photo', req:true},
  ]},
  { id:'t_clean_tech', name:'Технически преглед', module:'cleaning', mins:45, icon:'🔧', season:'all', items:[
    {zone:'Баня', text:'Проверка за течове — казанче, батерии', proof:'note', req:true},
    {zone:'Кухня', text:'Проверка на уреди', proof:'note', req:true},
    {zone:'Дневна', text:'Климатик — работа и филтри', proof:'photo', req:true},
  ]},
  { id:'t_clean_linen', name:'Смяна на бельо и кърпи', module:'cleaning', mins:30, icon:'🛏️', season:'all', items:[
    {zone:'Спалня', text:'Смяна на спално бельо', proof:'photo', req:true},
    {zone:'Баня', text:'Свежи кърпи — брой комплекти', proof:'count', req:true},
  ]},

  // Inspection
  { id:'t_insp_winter', name:'Зимен обход', module:'inspection', mins:45, icon:'❄️', season:'winter', items:[
    {zone:'Външно', text:'Фасада и покрив — оглед за щети', proof:'photo', req:true},
    {zone:'Външно', text:'Врати и прозорци — следи от опит за взлом', proof:'photo', req:true},
    {zone:'Общо', text:'Проветряване — всички помещения, мин. 15 мин', proof:'photo', req:true},
    {zone:'Общо', text:'Температура в жилището (°C)', proof:'count', req:true},
    {zone:'Общо', text:'Влага и мухъл по стени, ъгли и первази', proof:'photo', req:true},
    {zone:'Баня', text:'Пускане на водата — сифоните да не изсъхнат', proof:'none', req:true},
    {zone:'Баня', text:'Проверка за течове', proof:'note', req:true},
  ]},
  { id:'t_insp_summer', name:'Лятно обслужване', module:'inspection', mins:120, icon:'☀️', season:'summer', items:[
    {zone:'Двор', text:'Метене, косене, проверка на ограда', proof:'photo', req:true},
    {zone:'Спалня', text:'Смяна и пране на спално бельо', proof:'photo', req:true},
    {zone:'Баня', text:'Дезинфекция и свежи кърпи', proof:'count', req:true},
    {zone:'Дневна', text:'Климатик — работа и състояние на филтрите', proof:'note', req:true},
  ]},
];

// Helper functions
const uid = (p: string) => p + '_' + Math.random().toString(36).slice(2, 9);
const now = Date.now();
const today = new Date(); today.setHours(0,0,0,0);
const at = (h: number, m = 0) => today.getTime() + h*3600000 + m*60000;

function buildItems(tplId: string): TaskItem[] {
  const t = TEMPLATES.find(x => x.id === tplId);
  if (!t) return [];
  return t.items.map((it, i) => ({
    ...it, id: tplId + '_i' + i, done: false, photos: [], note: '', count: null,
  }));
}

// Generate canvas placeholder images (simplified — will be generated client-side)
function ph(h: number, txt: string) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="hsl(${h},32%,88%)"/><text x="150" y="150" text-anchor="middle" dominant-baseline="middle" font-size="70" fill="hsla(${h},30%,32%,.65)" font-family="sans-serif">${txt}</text></svg>`)}`;
}

// ====== TASKS ======
export const TASKS: Task[] = [];

function mkTask(o: Partial<Task> & { propertyId: string; templateId: string; assigneeId: string; plannedAt: number }): Task {
  return {
    id: uid('j'), status: 'planned', items: buildItems(o.templateId),
    ...o,
  } as Task;
}

// Today's tasks
const j1 = mkTask({ propertyId:'p1', templateId:'t_clean_std', assigneeId:'u_cl1', plannedAt: at(9,0) - 86400000 });
// Make j1 completed + approved (yesterday)
j1.status = 'approved'; j1.checkIn = j1.plannedAt + 4*60000;
j1.checkOut = j1.checkIn + 95*60000; j1.inZone = true; j1.gpsAcc = 12;
j1.items.forEach((it, i) => {
  it.done = true;
  if (it.proof === 'photo' && it.req) it.photos = [{ url: ph(170 + i*24, '🛏'), ts: j1.checkIn! + i*8*60000 }];
  if (it.proof === 'count') it.count = 2;
  if (it.proof === 'note') it.note = 'Всичко наред.';
});
j1.review = { by:'u_own1', verdict:'approved', note:'', ts: j1.checkOut + 40*60000 };
TASKS.push(j1);

// In progress (right now)
const j2 = mkTask({ propertyId:'p4', templateId:'t_clean_std', assigneeId:'u_cl1', plannedAt: at(10,30) });
j2.status = 'in_progress'; j2.checkIn = Date.now() - 34*60000; j2.inZone = true; j2.gpsAcc = 18;
j2.items.slice(0, 4).forEach((it, i) => {
  it.done = true;
  if (it.proof === 'photo' && it.req) it.photos = [{ url: ph(195 + i*20, '🧼'), ts: j2.checkIn! + i*7*60000 }];
  if (it.proof === 'count') it.count = 2;
});
TASKS.push(j2);

// Done — waiting approval (too fast — trust signal)
const j3 = mkTask({ propertyId:'p2', templateId:'t_clean_linen', assigneeId:'u_cl2', plannedAt: at(8,30) });
j3.status = 'done'; j3.checkIn = at(8,34); j3.checkOut = at(8,47); j3.inZone = true; j3.gpsAcc = 46;
j3.items.forEach(it => { it.done = true; if (it.proof === 'photo' && it.req) it.photos = [{ url: ph(28, '🛏'), ts: j3.checkIn! + 240000 }]; if (it.proof === 'count') it.count = 1; });
TASKS.push(j3);

// Upcoming today
TASKS.push(mkTask({ propertyId:'p3', templateId:'t_clean_deep', assigneeId:'u_cl1', plannedAt: at(13,0) }));
TASKS.push(mkTask({ propertyId:'p5', templateId:'t_insp_summer', assigneeId:'u_ins1', plannedAt: at(14,0) }));
TASKS.push(mkTask({ propertyId:'p6', templateId:'t_clean_tech', assigneeId:'u_cl3', plannedAt: at(18,30) }));

// Tomorrow
TASKS.push(mkTask({ propertyId:'p1', templateId:'t_insp_winter', assigneeId:'u_ins2', plannedAt: at(9,0) + 86400000 }));
TASKS.push(mkTask({ propertyId:'p4', templateId:'t_clean_std', assigneeId:'u_cl2', plannedAt: at(11,0) + 86400000 }));

// ====== PLANS ======
export const PLANS: Plan[] = [
  { id:'pl1', propertyId:'p3', templateId:'t_insp_winter', name:'Зимна поддръжка', module:'inspection', season:'winter', perMonth:2, price:80 },
  { id:'pl2', propertyId:'p1', templateId:'t_clean_std', name:'Редовно почистване', module:'cleaning', season:'all', perMonth:4, price:210 },
  { id:'pl3', propertyId:'p4', templateId:'t_clean_std', name:'Редовно почистване', module:'cleaning', season:'all', perMonth:4, price:210 },
  { id:'pl4', propertyId:'p5', templateId:'t_insp_winter', name:'Зимна поддръжка', module:'inspection', season:'winter', perMonth:2, price:95 },
];

// ====== FINDINGS ======
export const FINDINGS: Finding[] = [
  { id:'f1', propertyId:'p3', reportedById:'u_ins1', ts: now - 10*86400000,
    title:'Влага по стената зад радиатора в спалня 2',
    text:'Петно около 40 см, стената е влажна на пипане. Не се е разширило от миналия обход.',
    photos:[{ url: ph(205, '💧'), ts: now - 10*86400000 }],
    status:'quoted',
    offer: { price:340, days:2, scope:'Отваряне на стената, проверка на връзката, подсушаване, шпакловка и боя.', ts: now - 9*86400000 },
  },
  { id:'f2', propertyId:'p1', reportedById:'u_cl2', ts: now - 4*86400000,
    title:'Капе батерията в банята',
    text:'Капе бавно при затворен кран. Гумата е износена.',
    photos:[{ url: ph(20, '🔧'), ts: now - 4*86400000 }],
    status:'reported',
  },
  { id:'f3', propertyId:'p4', reportedById:'u_ins1', ts: now - 30*86400000,
    title:'Счупена дръжка на прозореца в кухнята',
    text:'Дръжката се върти на празно, прозорецът не се заключва.',
    photos:[{ url: ph(120, '🪟'), ts: now - 30*86400000 }],
    status:'accepted',
    offer: { price:85, days:1, scope:'Смяна на дръжката, регулиране на крилото.', ts: now - 29*86400000 },
    decision: { by:'u_own2', ts: now - 28*86400000 },
  },
];

// ====== ISSUES ======
export const ISSUES: Issue[] = [
  { id:'is1', taskId: j2.id, propertyId:'p4', reportedById:'u_cl1',
    text:'Липсва тоалетна хартия — свършила е. Взимам от склада.',
    ts: Date.now() - 12*60000, open: true },
];

// ====== ROLE HELPERS ======
export function myJobs(userId: string): Task[] {
  const u = USERS.find(x => x.id === userId);
  if (!u) return [];
  if (u.role === 'cleaner') return TASKS.filter(j => j.assigneeId === userId);
  if (u.role === 'inspector') return TASKS.filter(j => j.assigneeId === userId);
  if (u.role === 'owner') return TASKS.filter(j => PROPERTIES.find(p => p.id === j.propertyId)?.ownerId === userId);
  return TASKS; // admin sees all
}

export function myProps(userId: string): Property[] {
  const u = USERS.find(x => x.id === userId);
  if (!u) return [];
  if (u.role === 'owner') return PROPERTIES.filter(p => p.ownerId === userId);
  if (u.role === 'cleaner' || u.role === 'inspector') {
    const ids = new Set(myJobs(userId).filter(j => isToday(j.plannedAt)).map(j => j.propertyId));
    return PROPERTIES.filter(p => ids.has(p.id));
  }
  return PROPERTIES; // admin
}

export function myFindings(userId: string): Finding[] {
  const ids = new Set(myProps(userId).map(p => p.id));
  return FINDINGS.filter(f => ids.has(f.propertyId)).sort((a, b) => b.ts - a.ts);
}

export function myPlans(userId: string): Plan[] {
  const ids = new Set(myProps(userId).map(p => p.id));
  return PLANS.filter(pl => ids.has(pl.propertyId));
}

export function isToday(ts: number): boolean {
  const d = new Date(ts); d.setHours(0,0,0,0);
  return d.getTime() === today.getTime();
}

export function propStatus(pid: string, userId: string): string {
  const js = myJobs(userId).filter(j => j.propertyId === pid && isToday(j.plannedAt));
  if (!js.length) return 'none';
  if (js.some(j => j.status === 'in_progress')) return 'active';
  if (js.some(j => j.status === 'disputed')) return 'problem';
  if (js.some(j => j.status === 'planned' && j.plannedAt < Date.now() - 30*60000)) return 'problem';
  if (js.every(j => j.status === 'approved' || j.status === 'done')) return 'done';
  return 'planned';
}

// Trust score
export function trustScore(j: Task): { score: number; flags: { t: string; k: string }[] } | null {
  if (j.status === 'planned' || j.status === 'in_progress') return null;
  let s = 100; const flags: { t: string; k: string }[] = [];
  
  if (j.inZone === false) { s -= 35; flags.push({ t: 'Извън геозоната', k: 'bad' }); }
  else if (j.gpsAcc && j.gpsAcc > 40) { s -= 8; flags.push({ t: `Слаб GPS (±${j.gpsAcc}м)`, k: 'warn' }); }
  else flags.push({ t: 'Потвърдена локация', k: 'ok' });

  const tpl = TEMPLATES.find(t => t.id === j.templateId);
  const need = j.items.filter(i => i.req && i.proof === 'photo');
  const got = need.filter(i => i.photos.length);
  if (got.length < need.length) { s -= 25; flags.push({ t: `Липсват ${need.length - got.length} снимки`, k: 'bad' }); }
  else flags.push({ t: `Всички ${need.length} снимки`, k: 'ok' });

  if (j.checkIn && j.checkOut && tpl) {
    const m = (j.checkOut - j.checkIn) / 60000;
    if (m < tpl.mins * 0.5) { s -= 22; flags.push({ t: `Само ${Math.round(m)} мин (норма ${tpl.mins})`, k: 'warn' }); }
    else flags.push({ t: `Време: ${Math.round(m)} мин`, k: 'ok' });
  }
  if (j.review?.verdict === 'note') { s -= 10; flags.push({ t: 'Бележка от собственика', k: 'warn' }); }
  if (j.review?.verdict === 'disputed') { s -= 40; flags.push({ t: 'Оспорена', k: 'bad' }); }
  if (j.review?.verdict === 'approved') flags.push({ t: 'Одобрена', k: 'ok' });
  
  return { score: Math.max(0, Math.min(100, s)), flags };
}

export const JOBSTATUS: Record<string, { p: string; t: string }> = {
  planned: { p:'p-blue', t:'Планирана' },
  in_progress: { p:'p-amber', t:'В процес' },
  done: { p:'p-green', t:'Чака одобрение' },
  approved: { p:'p-green', t:'Одобрена' },
  disputed: { p:'p-red', t:'Оспорена' },
};

export const STATUS_MAP: Record<string, { c: string; label: string; icon: string }> = {
  none: { c:'gray', label:'Няма задача', icon:'○' },
  planned: { c:'blue', label:'Планирано', icon:'◔' },
  active: { c:'amber', label:'Работи се', icon:'●' },
  done: { c:'green', label:'Готово', icon:'✓' },
  problem: { c:'red', label:'Проблем', icon:'!' },
};
