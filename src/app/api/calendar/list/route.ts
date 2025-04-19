import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../auth/[...nextauth]/authOptions";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "認証情報がありません。" }, { status: 401 });
  }

  // 直近1年分のイベントを取得
  const timeMin = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const timeMax = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString();

  const url = `${GOOGLE_CALENDAR_API}?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error: error.error?.message || "Googleカレンダー予定の取得に失敗しました。" }, { status: 500 });
  }

  const data = await response.json();
  // eventIdだけ返す
  const eventIds = (data.items || []).map((item: any) => item.id);
  return NextResponse.json({ eventIds });
}
