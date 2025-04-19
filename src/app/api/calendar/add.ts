import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/authOptions";

// Google Calendar API endpoint
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

function getNextDate(date: string): string {
  // YYYY-MM-DD → 翌日
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log('[API/add] セッション:', session);
  if (!session || !session.accessToken) {
    console.error('[API/add] 認証情報がありません');
    return NextResponse.json({ error: "認証情報がありません。再度ログインしてください。" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, date } = body;
  console.log('[API/add] 受信データ:', body);
  if (!title || !date) {
    console.error('[API/add] title/date未入力');
    return NextResponse.json({ error: "タイトルと日付は必須です。" }, { status: 400 });
  }

  // Google Calendar API: 終日イベントとして登録
  const event = {
    summary: title,
    description: description || "",
    start: { date },
    end: { date: getNextDate(date) },
  };
  console.log('[API/add] 送信イベント:', event);

  const response = await fetch(GOOGLE_CALENDAR_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });
  console.log('[API/add] Google Calendar APIレスポンスstatus:', response.status);

  if (!response.ok) {
    let error = null;
    try {
      error = await response.json();
    } catch (e) {
      error = { error: { message: 'JSON以外のエラー' } };
    }
    console.error('[API/add] Google Calendar APIエラー:', error);
    return NextResponse.json({ error: error.error?.message || "Googleカレンダー予定の登録に失敗しました。" }, { status: 500 });
  }

  const data = await response.json();
  console.log('[API/add] Google Calendar API成功:', data);
  return NextResponse.json({ success: true, eventId: data.id });
}