import LoginHeader from "./LoginHeader";
import TodoApp from "./todo";

export default function Page() {
  return (
    <main style={{ maxWidth: 600, margin: "40px auto", fontFamily: "'Noto Sans JP', sans-serif" }}>
      <h2 style={{ fontSize: 28, marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <i className="bx bx-list-check" style={{ marginRight: 12, fontSize: 32 }}></i>
        タスク管理アプリ
      </h2>
      <LoginHeader />
      <TodoApp />
    </main>
  );
}