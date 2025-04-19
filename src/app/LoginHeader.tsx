"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginHeader() {
  const { data: session } = useSession();
  return (
    <div style={{ marginBottom: 24, textAlign: "right" }}>
      {session ? (
        <>
          <span style={{ fontSize: 16, marginRight: 12 }}>ログイン中: {session.user?.email}</span>
          <button onClick={() => signOut()} style={{ fontSize: 16, color: '#c00', border: '1px solid #c00', background: 'white', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', marginLeft: 8 }}>
            <i className="bx bx-log-out"></i> サインアウト
          </button>
        </>
      ) : (
        <button onClick={() => signIn("google")}
          style={{ fontSize: 16, color: '#fff', background: '#4285f4', border: 'none', borderRadius: 6, padding: '4px 16px', cursor: 'pointer' }}>
          <i className="bx bxl-google" style={{ marginRight: 4 }}></i> Googleでログイン
        </button>
      )}
    </div>
  );
}
