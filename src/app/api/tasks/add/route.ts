import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "todos.db");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      description,
      dueDate,
      eventId,
      reminders = [],
      color = 'white',
      tags = [],
    } = body;
    const toJSTISOString = (date = new Date()) => {
      // JST(UTC+9)のISO8601文字列
      const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      return jst.toISOString().replace('Z', '+09:00');
    };
    const db = new Database(DB_PATH);
    db.prepare(`INSERT INTO todos (
      id, title, description, due_date_time, completed, completed_at, deleted, deleted_at, created_at, reminders, color, tags, eventId
    ) VALUES (?, ?, ?, ?, 0, NULL, 0, NULL, ?, ?, ?, ?, ?)`)
      .run(
        id,
        title,
        description,
        dueDate,
        toJSTISOString(),
        JSON.stringify(reminders),
        color,
        JSON.stringify(tags),
        eventId
      );
    db.close();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
