// Seed данни от двата прототипа, обединени в една БД
import { createTables } from './index';
import { db } from './index';
import { users, properties, templates, tasks, plans, findings, issues } from './schema';
import { sql } from 'drizzle-orm';

createTables();

const now = Date.now();
const today = new Date(); today.setHours(0,0,0,0);
const at = (h: number, m = 0) => today.getTime() + h*3600000 + m*60000;
const uid = (p: string) => p + '_' + Math.random().toString(36).slice(2,9);

// Clear existing
db.run(sql.raw('DELETE FROM issues'));
db.run(sql.raw('DELETE FROM findings'));
db.run(sql.raw('DELETE FROM tasks'));
db.run(sql.raw('DELETE FROM plans'));
db.run(sql.raw('DELETE FROM templates'));
db.run(sql.raw('DELETE FROM properties'));
db.run(sql.raw('DELETE FROM users'));

// === USERS ===
const userData = [
  {id:'u_admin', name:'Владимир', role:'admin' as const, color:'#0F172A', sub:'Диспечер'},
  {id:'u_own1', name:'Елена Петрова', role:'owner' as const, color:'#7C3AED', sub:'Собственик · 5 обекта'},
  {id:'u_cl1', name:'Мария Стоянова', role:'cleaner' as const, color:'#0F766E', sub:'Изпълнител'},
  {id:'u_cl2', name:'Иван Георгиев', role:'cleaner' as const, color:'#B45309', sub:'Изпълнител'},
  {id:'u_ins1', name:'Мария Стоянова', role:'inspector' as const, color:'#1D4E89', sub:'Инспектор'},
  {id:'u_ins2', name:'Иван Георгиев', role:'inspector' as const, color:'#B45309', sub:'Инспектор'},
];

for (const u of userData) {
  db.insert(users).values(u).run();
}

// === PROPERTIES (обединени от двата прототипа) ===
const props = [
  {id:'p1', name:'Апартамент Витоша 42', addr:'бул. Витоша 42, ет. 3, ап. 7', lat:42.6912, lng:23.3186,
   type:'apartment' as const, ownerId:'u_own1', radius:75,
   access:'Ключова кутия вдясно от входа, код 4471. Паркинг в двора, място №3.',
   utils:'Спирателен кран под мивката в кухнята. Ел. табло в антрето.',
   zones:JSON.stringify(['Спалня','Баня','Кухня','Дневна']), vacantSince: now - 30*86400000},
  // ... and more
];

const allProps = [
  {id:'p1', name:'Апартамент Витоша 42', addr:'бул. Витоша 42, ет. 3, ап. 7', lat:42.6912, lng:23.3186,
   type:'apartment' as const, ownerId:'u_own1', radius:75,
   access:'Ключова кутия вдясно от входа, код 4471.',
   utils:'Спирателен кран под мивката. Ел. табло в антрето.',
   zones:JSON.stringify(['Спалня','Баня','Кухня','Дневна']),
   vacantSince: now - 90*86400000},
  {id:'p2', name:'Студио Оборище', addr:'ул. Оборище 18, ет. 2', lat:42.6975, lng:23.3421,
   type:'studio' as const, ownerId:'u_own1', radius:60,
   access:'Домофон 12. Ключ при портиера.',
   utils:'Бойлерът е спрян. Водата остава пусната.',
   zones:JSON.stringify(['Стая','Баня','Кухненски бокс']),
   vacantSince: now - 190*86400000},
  {id:'p3', name:'Къща Драгалевци', addr:'ул. Прохлада 9, Драгалевци', lat:42.6389, lng:23.3172,
   type:'house' as const, ownerId:'u_own1', radius:110,
   access:'Портата с код 2208. Внимание: куче в двора.',
   utils:'Главен кран в шахтата. Отопление на минимум 12°C.',
   zones:JSON.stringify(['Двор','Партер','Спалня 1','Спалня 2','Баня','Мазе']),
   vacantSince: now - 620*86400000},
  {id:'p4', name:'Апартамент Лозенец', addr:'ул. Кричим 24, ет. 5', lat:42.6738, lng:23.3208,
   type:'apartment' as const, ownerId:'u_own1', radius:70,
   access:'Асансьор до 5 ет. Ключ в кутия до пощенските кутии, код 9013.',
   utils:'Климатик в дневната. Спирателен кран в банята.',
   zones:JSON.stringify(['Спалня','Баня','Кухня','Дневна']),
   vacantSince: now - 95*86400000},
  {id:'p5', name:'Вила Бояна', addr:'ул. Кумата 61, Бояна', lat:42.6435, lng:23.2661,
   type:'villa' as const, ownerId:'u_own1', radius:130,
   access:'Ключ при пазача на комплекса. Представи се на входа.',
   utils:'Басейнът е източен. Водата към двора е спряна.',
   zones:JSON.stringify(['Двор','Партер','Етаж','Баня','Котелно']),
   vacantSince: now - 300*86400000},
];

for (const p of allProps) {
  db.insert(properties).values(p).run();
}

// === TEMPLATES (чистене + обходи) ===
const templateItems = [
  // Cleaning
  {id:'t_clean_std', name:'Стандартно почистване след гост', module:'cleaning' as const, mins:90, icon:'🧹', season:'all' as const,
   items:JSON.stringify([
     {zone:'Спалня', text:'Смяна на спално бельо', proof:'photo', req:true},
     {zone:'Спалня', text:'Прахосмукачка на пода', proof:'none', req:true},
     {zone:'Баня', text:'Дезинфекция на тоалетна и мивка', proof:'photo', req:true},
     {zone:'Баня', text:'Свежи кърпи — брой комплекти', proof:'count', req:true},
     {zone:'Кухня', text:'Празен и почистен хладилник', proof:'photo', req:true},
     {zone:'Дневна', text:'Прахосмукачка и подредба', proof:'photo', req:true},
   ])},
  {id:'t_clean_deep', name:'Дълбоко почистване', module:'cleaning' as const, mins:210, icon:'✨',
   items:JSON.stringify([
     {zone:'Баня', text:'Обезваряване на плочки', proof:'photo', req:true},
     {zone:'Кухня', text:'Фурна отвътре', proof:'photo', req:true},
     {zone:'Дневна', text:'Прозорци отвътре и отвън', proof:'photo', req:true},
   ])},
  {id:'t_clean_tech', name:'Технически преглед', module:'cleaning' as const, mins:45, icon:'🔧',
   items:JSON.stringify([
     {zone:'Баня', text:'Проверка за течове', proof:'note', req:true},
     {zone:'Кухня', text:'Проверка на уреди', proof:'note', req:true},
     {zone:'Дневна', text:'Климатик — работа и филтри', proof:'photo', req:true},
   ])},
  // Inspection
  {id:'t_insp_winter', name:'Зимен обход', module:'inspection' as const, mins:45, icon:'❄️', season:'winter' as const,
   items:JSON.stringify([
     {zone:'Външно', text:'Фасада и покрив — оглед за щети', proof:'photo', req:true},
     {zone:'Общо', text:'Проветряване — мин. 15 минути', proof:'photo', req:true},
     {zone:'Общо', text:'Температура в жилището (°C)', proof:'count', req:true},
     {zone:'Общо', text:'Влага и мухъл по стени', proof:'photo', req:true},
     {zone:'Баня', text:'Пускане на водата', proof:'none', req:true},
   ])},
  {id:'t_insp_summer', name:'Лятно обслужване', module:'inspection' as const, mins:120, icon:'☀️', season:'summer' as const,
   items:JSON.stringify([
     {zone:'Двор', text:'Метене, косене, проверка на ограда', proof:'photo', req:true},
     {zone:'Общо', text:'Проветряване и проверка за насекоми', proof:'note', req:true},
   ])},
];

for (const t of templateItems) {
  db.insert(templates).values(t).run();
}

// === SEED PLANS ===
const planData = [
  {id:'pl1', propertyId:'p3', templateId:'t_insp_winter', name:'Зимна поддръжка', module:'inspection' as const,
   season:'winter' as const, perMonth:2, price:80, startedAt: now - 140*86400000},
  {id:'pl2', propertyId:'p1', templateId:'t_clean_std', name:'Редовно почистване', module:'cleaning' as const,
   season:'all' as const, perMonth:4, price:210, startedAt: now - 70*86400000},
];

for (const p of planData) {
  db.insert(plans).values(p).run();
}

console.log('✅ Seed данните са заредени');
console.log(`   ${userData.length} потребители`);
console.log(`   ${allProps.length} обекта`);
console.log(`   ${templateItems.length} шаблона`);
console.log(`   ${planData.length} абонамента`);
