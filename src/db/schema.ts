import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============ ПОТРЕБИТЕЛИ ============
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'owner', 'cleaner', 'inspector'] }).notNull(),
  color: text('color').default('#0F172A'),
  sub: text('sub').default(''),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
});

// ============ ОБЕКТИ (споделени между модулите) ============
export const properties = sqliteTable('properties', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  addr: text('addr').default(''),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  type: text('type', { enum: ['apartment', 'studio', 'house', 'office', 'villa'] }).default('apartment'),
  ownerId: text('owner_id').references(() => users.id),
  radius: integer('radius').default(75), // геозона в метри
  access: text('access').default(''),    // инструкции за достъп
  utils: text('utils').default(''),      // спирателни кранове, ел. табло и т.н.
  zones: text('zones').default('[]'),    // JSON array
  vacantSince: integer('vacant_since'),  // за обходи — от кога е празен
  createdAt: integer('created_at').default(sql`(unixepoch())`),
});

// ============ ШАБЛОНИ ЗА УСЛУГИ ============
export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  module: text('module', { enum: ['cleaning', 'inspection'] }).notNull(),
  mins: integer('mins').notNull(),       // очаквана продължителност
  icon: text('icon').default('📋'),
  season: text('season', { enum: ['all', 'winter', 'summer'] }).default('all'),
  items: text('items').default('[]'),    // JSON array от чек-лист точки
  createdAt: integer('created_at').default(sql`(unixepoch())`),
});

// ============ ЗАДАЧИ (почистване + обходи) ============
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').references(() => properties.id),
  templateId: text('template_id').references(() => templates.id),
  assigneeId: text('assignee_id').references(() => users.id),
  plannedAt: integer('planned_at').notNull(),  // timestamp
  status: text('status', {
    enum: ['planned', 'in_progress', 'done', 'approved', 'disputed']
  }).default('planned'),
  checkIn: integer('check_in'),          // кога е влязъл
  checkOut: integer('check_out'),        // кога е излязъл  
  inZone: integer('in_zone'),            // null/0/1 — бил ли е в геозоната
  gpsAcc: integer('gps_acc'),            // точност на GPS
  items: text('items').default('[]'),    // JSON — замразено копие на чек-листа
  planId: text('plan_id'),               // свързано с абонамент
  review: text('review'),                // JSON — {by, verdict, note, ts}
  createdAt: integer('created_at').default(sql`(unixepoch())`),
});

// ============ АБОНАМЕНТИ ============
export const plans = sqliteTable('plans', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').references(() => properties.id),
  templateId: text('template_id').references(() => templates.id),
  name: text('name').notNull(),
  module: text('module', { enum: ['cleaning', 'inspection'] }).notNull(),
  season: text('season', { enum: ['winter', 'summer', 'all'] }).default('all'),
  perMonth: integer('per_month').default(1),  // посещения на месец
  price: integer('price').default(0),         // лв на месец
  active: integer('active', { mode: 'boolean' }).default(true),
  startedAt: integer('started_at').default(sql`(unixepoch())`),
});

// ============ КОНСТАТАЦИИ ЗА РЕМОНТ ============
export const findings = sqliteTable('findings', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').references(() => properties.id),
  reportedById: text('reported_by_id').references(() => users.id),
  title: text('title').notNull(),
  text: text('text').default(''),
  photos: text('photos').default('[]'),   // JSON array от {url, ts}
  status: text('status', {
    enum: ['reported', 'quoted', 'accepted', 'declined']
  }).default('reported'),
  offer: text('offer'),                    // JSON — {price, days, scope, ts}
  decision: text('decision'),              // JSON — {by, ts}
  createdAt: integer('created_at').default(sql`(unixepoch())`),
});

// ============ СИГНАЛИ ЗА ПРОБЛЕМИ ============
export const issues = sqliteTable('issues', {
  id: text('id').primaryKey(),
  taskId: text('task_id').references(() => tasks.id),
  propertyId: text('property_id').references(() => properties.id),
  reportedById: text('reported_by_id').references(() => users.id),
  text: text('text').notNull(),
  photos: text('photos').default('[]'),
  open: integer('open', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
});
