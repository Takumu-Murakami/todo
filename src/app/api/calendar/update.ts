import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/authOptions";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "認証情報がありません。再度ログインしてください。" }, { status: 401 });
  }

  const body = await req.json();
  const { eventId, title, description, date } = body;
  if (!eventId || !title || !date) {
    return NextResponse.json({ error: "イベントID、タイトル、日付は必須です。" }, { status: 400 });
  }

  // Google Calendar API: 終日イベントとして更新
  const event = {
    summary: title,
    description: description || "",
    start: { date },
    end: { date: getNextDate(date) },
  };

  const response = await fetch(`${GOOGLE_CALENDAR_API}/${eventId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.error?.message || "Googleカレンダーの更新に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

function getNextDate(date: string): string {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
