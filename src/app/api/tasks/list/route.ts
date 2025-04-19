import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

// DBファイルのパス（プロジェクト直下/todos.db）
const DB_PATH = path.join(process.cwd(), "todos.db");

export async function GET() {
  try {
    const db = new Database(DB_PATH);
    // deleted=0（未削除）のタスクのみ取得
    const rows = db.prepare("SELECT * FROM todos WHERE deleted = 0").all();
    db.close();
    // reminders, tagsはJSON文字列→配列に変換
    const tasks = rows.map((row: any) => ({
      ...row,
      reminders: row.reminders ? JSON.parse(row.reminders) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
      completed: !!row.completed,
      deleted: !!row.deleted,
      createdAt: row.created_at,
      dueDate: row.due_date_time,
      completedAt: row.completed_at,
      deletedAt: row.deleted_at,
      // eventIdプロパティが必要な場合はDBにカラム追加 or description等から抽出
    }));
    return NextResponse.json({ tasks });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
