import { createAdminClient } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: team } = await supabase.from("teams").select("*").eq("id", id).maybeSingle();
  if (!team) notFound();

  return (
    <div className="zone-card">
      <h1 className="text-3xl font-semibold">{team.name}</h1>
    </div>
  );
}
