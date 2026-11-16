const BASE_URL = "https://api.football-data.org/v4";

export const COMPETITIONS = [
  { code: "PL", name: "Premier League", country: "England" },
  { code: "PD", name: "La Liga", country: "Spain" },
  { code: "SA", name: "Serie A", country: "Italy" },
  { code: "BL1", name: "Bundesliga", country: "Germany" },
  { code: "FL1", name: "Ligue 1", country: "France" },
  { code: "CL", name: "UEFA Champions League", country: "Europe" }
] as const;

export type CompetitionCode = (typeof COMPETITIONS)[number]["code"];

async function request<T>(path: string): Promise<T> {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) throw new Error("Missing FOOTBALL_DATA_TOKEN");

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "X-Auth-Token": token },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`football-data.org failed: ${response.status}`);
  }

  return response.json();
}

export const getStandings = (code: CompetitionCode) => request(`/competitions/${code}/standings`);
export const getMatches = (code: CompetitionCode) => request(`/competitions/${code}/matches`);
export const getScorers = (code: CompetitionCode) => request(`/competitions/${code}/scorers`);
