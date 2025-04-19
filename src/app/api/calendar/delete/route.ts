import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "認証情報がありません。再度ログインしてください。" }, { status: 401 });
  }

  const body = await req.json();
  const { eventId, confirm } = body;
  if (!eventId) {
    return NextResponse.json({ error: "イベントIDは必須です。" }, { status: 400 });
  }
  if (!confirm) {
    return NextResponse.json({ error: "カレンダー予定の削除確認が必要です。" }, { status: 400 });
  }

  const response = await fetch(`${GOOGLE_CALENDAR_API}/${eventId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.error?.message || "Googleカレンダー予定の削除に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
