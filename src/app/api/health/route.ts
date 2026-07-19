import { NextResponse } from 'next/server';
import { db, createTables } from '@/db/index';
import { properties, templates, users } from '@/db/schema';

createTables();

export async function GET() {
  try {
    const props = db.select({ id: properties.id, name: properties.name, type: properties.type })
      .from(properties).all();
    const tmpls = db.select({ id: templates.id, name: templates.name, module: templates.module })
      .from(templates).all();
    const usrs = db.select({ id: users.id, name: users.name, role: users.role })
      .from(users).all();

    return NextResponse.json({
      status: 'ok',
      counts: { properties: props.length, templates: tmpls.length, users: usrs.length },
      modules: {
        cleaning: tmpls.filter(t => t.module === 'cleaning').length,
        inspection: tmpls.filter(t => t.module === 'inspection').length,
      },
      properties: props.map(p => `${p.name} (${p.type})`),
      users: usrs.map(u => `${u.name} — ${u.role}`),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
