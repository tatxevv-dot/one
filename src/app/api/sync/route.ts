import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { COMPETITIONS, getMatches, getStandings, type CompetitionCode } from "@/lib/football-data";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = createAdminClient();

  for (const competition of COMPETITIONS) {
    const code = competition.code as CompetitionCode;
    const [standings, matches] = await Promise.all([getStandings(code), getMatches(code)]);

    await supabase.from("competitions").upsert({
      id: code,
      name: competition.name,
      code,
      country: competition.country,
      type: code === "CL" ? "cup" : "league"
    });
  }

  return NextResponse.json({ ok: true });
}
