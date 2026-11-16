import Link from "next/link";
import { COMPETITIONS } from "@/lib/football-data";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
        Understand every match, team and player.
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COMPETITIONS.map((competition) => (
          <Link key={competition.code} href={`/leagues/${competition.code}`} className="zone-card">
            <p className="text-lg font-semibold">{competition.name}</p>
            <p className="zone-muted">{competition.country}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
