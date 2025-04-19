"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

// タスク型定義
export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  eventId?: string; // GoogleカレンダーイベントID
  syncStatus?: "synced" | "error" | "pending";
};

// 仮のローカルタスク配列（DB連携前のデモ用）
const initialTasks: Task[] = [];

export default function TodoApp() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 初回マウント時にDBとカレンダー両方取得し、両方に存在するものだけ表示
    const fetchInitialTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        // DBからタスク一覧取得
        const resDb = await fetch("/api/tasks/list");
        const contentTypeDb = resDb.headers.get("content-type");
        if (!contentTypeDb || !contentTypeDb.includes("application/json")) {
          const text = await resDb.text();
          throw new Error("DBタスク取得失敗: " + text.slice(0, 100));
        }
        const dbData = await resDb.json();
        const dbTasks = dbData.tasks || [];
        // カレンダーからeventId一覧取得
        const resCal = await fetch("/api/calendar/list", { credentials: "include" });
        const contentTypeCal = resCal.headers.get("content-type");
        if (!contentTypeCal || !contentTypeCal.includes("application/json")) {
          const text = await resCal.text();
          throw new Error("カレンダー取得失敗: " + text.slice(0, 100));
        }
        const calData = await resCal.json();
        const calendarEventIds = calData.eventIds || [];
        // eventIdが両方に存在するものだけ表示
        const filtered = dbTasks.filter((task: any) => {
          // eventIdが無いものは表示しない
          if (!task.eventId) return false;
          return calendarEventIds.includes(task.eventId);
        }).map((task: any) => ({ ...task, syncStatus: "synced" }));
        setTasks(filtered);
      } catch (e: any) {
        setError(e.message);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialTasks();
  }, []);

  useEffect(() => {
    // 60秒ごとにDBとGoogleカレンダーを突き合わせて同期
    const interval = setInterval(async () => {
      try {
        // DBからタスク一覧取得
        const resDb = await fetch("/api/tasks/list");
        const contentTypeDb = resDb.headers.get("content-type");
        if (!contentTypeDb || !contentTypeDb.includes("application/json")) {
          const text = await resDb.text();
          throw new Error("DBタスク取得失敗: " + text.slice(0, 100));
        }
        const dbData = await resDb.json();
        const dbTasks = dbData.tasks || [];
        // カレンダーからeventId一覧取得
        const resCal = await fetch("/api/calendar/list", { credentials: "include" });
        const contentTypeCal = resCal.headers.get("content-type");
        if (!contentTypeCal || !contentTypeCal.includes("application/json")) {
          const text = await resCal.text();
          throw new Error("カレンダー取得失敗: " + text.slice(0, 100));
        }
        const calData = await resCal.json();
        const calendarEventIds = calData.eventIds || [];
        // eventIdが両方に存在するものだけ表示
        const filtered = dbTasks.filter((task: any) => {
          if (!task.eventId) return false;
          return calendarEventIds.includes(task.eventId);
        }).map((task: any) => ({ ...task, syncStatus: "synced" }));
        setTasks(filtered);
      } catch (e: any) {
        setError(e.message);
        console.error("[DB+カレンダー同期] エラー", e);
      }
    }, 60000); // 60秒ごと
    return () => clearInterval(interval);
  }, []);

  // タスク追加
  const handleAdd = async () => {
    setLoading(true);
    setError(null);
    try {
      // GoogleカレンダーAPI呼び出し
      const res = await fetch("/api/calendar/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          date: newTask.dueDate,
        }),
        credentials: "include",
      });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`APIレスポンスがJSONではありません: ${text.slice(0, 100)}`);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "APIエラー");
      // DBにも保存
      const dbRes = await fetch("/api/tasks/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate,
          eventId: data.eventId,
          reminders: [],
          color: "white",
          tags: [],
          createdAt: new Date().toISOString(),
        }),
      });
      const dbData = await dbRes.json();
      if (!dbRes.ok) throw new Error(dbData.error || "DB保存エラー");
      // タスク配列に追加
      setTasks([
        ...tasks,
        {
          id: dbData.id || crypto.randomUUID(),
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate,
          eventId: data.eventId,
          syncStatus: "synced",
        },
      ]);
      setNewTask({ title: "", description: "", dueDate: "" });
    } catch (e: any) {
      setError(e.message);
      console.error("[タスク追加] エラー", e);
    } finally {
      setLoading(false);
    }
  };

  // タスク削除
  const handleDelete = async (task: Task) => {
    if (!window.confirm("本当に削除しますか？")) return;
    if (!task.eventId) {
      // ローカルのみ削除
      setTasks(tasks.filter(t => t.id !== task.id));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Googleカレンダーから削除
      const res = await fetch("/api/calendar/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: task.eventId, confirm: true }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "カレンダー削除エラー");
      // DBから論理削除
      const dbRes = await fetch("/api/tasks/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: task.eventId }),
      });
      const dbData = await dbRes.json();
      if (!dbRes.ok) throw new Error(dbData.error || "DB削除エラー");
      setTasks(tasks.filter(t => t.id !== task.id));
    } catch (e: any) {
      setError(e.message);
      alert("タスクの削除に失敗しました: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "24px auto", fontFamily: "'Noto Sans JP', sans-serif" }}>
      <h2><i className="bx bx-list-check" style={{ marginRight: 8 }}></i>タスク管理</h2>
      {/* ログイン中表示・サインアウトボタンはLoginHeaderでまとめて表示するため削除 */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="タイトル"
          value={newTask.title}
          onChange={e => setNewTask({ ...newTask, title: e.target.value })}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <textarea
          placeholder="詳細"
          value={newTask.description}
          onChange={e => setNewTask({ ...newTask, description: e.target.value })}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          type="date"
          value={newTask.dueDate}
          onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button onClick={handleAdd} disabled={loading || !newTask.title || !newTask.dueDate}>
          <i className="bx bx-plus"></i> タスク追加 & カレンダー同期
        </button>
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map(task => (
          <li key={task.id} style={{ marginBottom: 12, border: "1px solid #ccc", borderRadius: 8, padding: 8 }}>
            <div style={{ fontWeight: "bold" }}>{task.title}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{task.description}</div>
            <div style={{ fontSize: 12, color: "#333" }}>期日: {task.dueDate}</div>
            <div style={{ fontSize: 12, color: task.syncStatus === "synced" ? "green" : "red" }}>
              {task.syncStatus === "synced" ? "カレンダー同期済み" : "同期エラー"}
            </div>
            <button
              onClick={() => handleDelete(task)}
              style={{ marginTop: 8, fontSize: 14, color: '#c00', border: '1px solid #c00', background: 'white', borderRadius: 6, padding: '2px 10px', cursor: 'pointer' }}
              disabled={loading}
            >
              <i className="bx bx-trash" style={{ marginRight: 4 }}></i>削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
