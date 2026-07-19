# Chisto — Implementation Plan (GSD Edition)

> **For Hermes:** Execute task-by-task. One commit per task. TDD where possible.

**Goal:** Единно приложение с два модула (Почистване + Обходи), self-hosted (Next.js + SQLite), деплойнато на chisto.blv.bg

**Architecture:** Next.js 16 App Router + Drizzle ORM + SQLite + Tailwind CSS + Leaflet. SSR where needed, client-side for interactive maps/checklists.

**Tech Stack:** Next.js, React 19, Tailwind 4, Drizzle, better-sqlite3, Leaflet, PWA

---

## Phase 1: Foundation

### Task 1: Layout + Design System
**Files:** `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.ts`

Копирай CSS custom properties от прототипите в Tailwind тема. Два accent цвята: teal (#0F766E) за cleaning, blue (#1D4E89) за inspection. Мобилно първо с safe-area-inset.

### Task 2: Root Layout with Navigation
**Files:** `src/app/layout.tsx`, `src/components/Sidebar.tsx`, `src/components/Topbar.tsx`

Горен бар с лого "Chisto" + роля чип. Странично/долно меню с линкове: Карта, Задачи, Обекти (и Обходи/Абонаменти според ролята).

### Task 3: Auth Middleware + Login Page
**Files:** `src/middleware.ts`, `src/app/login/page.tsx`, `src/lib/auth.ts`

Проста credential-based auth: admin@chisto.bg / admin123 за demo. Session в cookie. Middleware защитава всичко освен /login и /api/health.

### Task 4: Database API Layer
**Files:** `src/lib/api.ts`, `src/app/api/properties/route.ts`, `src/app/api/templates/route.ts`

REST API за обекти и шаблони. GET /api/properties връща всички обекти с филтър по owner. GET /api/templates?module=cleaning|inspection.

---

## Phase 2: Ядро

### Task 5: Карта с Leaflet
**Files:** `src/components/Map.tsx`, `src/app/page.tsx`

Интерактивна карта с цветни маркери според propStatus(). Клик отваря sheet с детайли. Търсене на адрес чрез Nominatim. Добавяне на обект чрез клик на картата.

### Task 6: Property Sheet
**Files:** `src/components/PropertySheet.tsx`, `src/app/api/properties/[id]/route.ts`

Модален панел с: статус, достъп, зони, списък със задачи, бутон "Навигация". За админ — бутон "+ Задача".

### Task 7: Tasks List + Job Sheet
**Files:** `src/app/tasks/page.tsx`, `src/components/TaskSheet.tsx`, `src/app/api/tasks/route.ts`

Списък със задачи (филтриран по роля). Детайл на задача: чек-лист, снимки, оценка на доверие.

### Task 8: Checklist + Proof Types
**Files:** `src/components/Checklist.tsx`, `src/components/Camera.tsx`

Чек-лист с три типа доказателства: снимка (камера), брой, бележка. GPS проверка при отключване. Бутон "Проблем".

---

## Phase 3: Модули

### Task 9: Module Switcher
**Files:** `src/components/ModuleSwitcher.tsx`, `src/lib/module.ts`

Превключвател между "Почистване" и "Обходи". Филтрира шаблони и задачи по module поле. Запомня избора в cookie.

### Task 10: Cleaning Module
**Files:** `src/app/cleaning/page.tsx`, `src/components/CleaningDashboard.tsx`

Табло за почистване: днешни задачи, изпълнители, активни абонаменти. Специфични шаблони само за cleaning.

### Task 11: Inspection Module
**Files:** `src/app/inspection/page.tsx`, `src/components/InspectionDashboard.tsx`

Табло за обходи: вакантни имоти, сезонни планове, констатации. Шаблони само за inspection.

---

## Phase 4: Разширено

### Task 12: Plans + Subscriptions
**Files:** `src/app/plans/page.tsx`, `src/components/PlanCard.tsx`

Абонаменти с прогрес бар. Месечен изглед с отбелязани посещения. Бутон за ново посещение.

### Task 13: Findings Flow
**Files:** `src/app/findings/page.tsx`, `src/components/FindingSheet.tsx`

Поток: reported → quoted → accepted/declined. Оферта с цена и срок. Бутони според ролята.

### Task 14: Trust Score
**Files:** `src/lib/trust.ts` (pure function)

Изчисли trust score от: GPS, снимки, време, одобрение. Визуализация с color-coded score + флагове.

### Task 15: Reports + History
**Files:** `src/app/reports/page.tsx`, `src/app/history/page.tsx`

Списък с доклади за собственик. История на изпълнителя с оценки.

---

## Phase 5: PWA + Ship

### Task 16: PWA Manifest + Service Worker
**Files:** `public/manifest.json`, `public/sw.js`

PWA конфигурация за инсталиране на телефон. Офлайн кеширане на статични assets.

### Task 17: Docker Polish + Deploy
**Files:** `Dockerfile`, `.dockerignore`

Оптимизиран Dockerfile. Health check endpoint. Persistent volume за /app/data.

### Task 18: Domain + SSL + Final Deploy
**Terminal:** REST API към Coolify

custom_labels с chisto.blv.bg. Рестарт. Верификация на HTTPS.

---

**Total:** 18 tasks, ~5 min each. ~1.5 часа активна работа.
