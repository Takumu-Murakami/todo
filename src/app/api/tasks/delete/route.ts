import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "todos.db");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId } = body;
    if (!eventId) {
      return NextResponse.json({ error: "eventIdは必須です。" }, { status: 400 });
    }
    const db = new Database(DB_PATH);
    const result = db.prepare("UPDATE todos SET deleted = 1, deleted_at = ? WHERE eventId = ?").run(new Date().toISOString(), eventId);
    db.close();
    if (result.changes === 0) {
      return NextResponse.json({ error: "該当タスクがDBに存在しません。" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
