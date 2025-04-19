//node init_db.jsコマンドを実行
const Database = require('better-sqlite3');
const db = new Database('todos.db');

db.exec(`
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date_time TEXT NOT NULL,
  completed INTEGER NOT NULL,
  completed_at TEXT,
  deleted INTEGER NOT NULL,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  reminders TEXT,
  color TEXT DEFAULT 'white',
  tags TEXT,
  eventId TEXT
);
`);

db.close();
console.log('todosテーブルを作成しました');
