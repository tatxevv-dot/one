import { createAdminClient } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: player } = await supabase.from("players").select("*").eq("id", id).maybeSingle();
  if (!player) notFound();

  return (
    <div className="zone-card">
      <h1 className="text-3xl font-semibold">{player.name}</h1>
    </div>
  );
}
