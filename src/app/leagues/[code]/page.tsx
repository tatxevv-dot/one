import { createAdminClient } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function LeaguePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = createAdminClient();
  const { data: standings } = await supabase
    .from("standings")
    .select("position, played, won, drawn, lost, goals_for, goals_against, points, team:teams(name)")
    .eq("competition_id", code.toUpperCase())
    .order("position");

  if (!standings?.length) notFound();

  return (
    <div className="zone-card overflow-x-auto">
      <h1 className="mb-4 text-2xl font-semibold">Standings</h1>
      <table className="w-full text-sm">
        <tbody>
          {standings.map((row: any) => (
            <tr key={row.team.name} className="border-t border-zone-border">
              <td className="py-3">{row.position}</td>
              <td className="py-3 font-medium">{row.team.name}</td>
              <td className="py-3 text-right">{row.played}</td>
              <td className="py-3 text-right font-semibold">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
