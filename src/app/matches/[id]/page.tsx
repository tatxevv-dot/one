import { createAdminClient } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: match } = await supabase.from("matches").select("*").eq("id", id).maybeSingle();
  if (!match) notFound();

  return (
    <div className="zone-card">
      <h1 className="text-3xl font-semibold">Match</h1>
    </div>
  );
}
