"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function AuthTest() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  // サインイン時にエラーを検知
  const handleSignIn = async () => {
    try {
      setError(null);
      await signIn("google");
    } catch (e) {
      setError("Google認証に失敗しました。別のアカウントでお試しください。");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Google認証テスト</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {status === "unauthenticated" && typeof window !== "undefined" && window.location.search.includes("error") && (
        <p style={{ color: "red" }}>Google認証に失敗しました。別のアカウントでお試しください。</p>
      )}
      {session ? (
        <div>
          <p>ログイン済み: {session.user?.email}</p>
          <button onClick={() => signOut()}>サインアウト</button>
        </div>
      ) : (
        <button onClick={handleSignIn}>Googleでログイン</button>
      )}
    </div>
  );
}
