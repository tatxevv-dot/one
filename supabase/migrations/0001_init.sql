create table if not exists competitions (
  id text primary key,
  name text not null,
  code text unique,
  country text,
  type text
);

create table if not exists seasons (
  id text primary key,
  competition_id text references competitions(id) on delete cascade,
  year int not null,
  start_date date,
  end_date date,
  unique (competition_id, year)
);

create table if not exists teams (
  id text primary key,
  name text not null,
  short_name text,
  crest_url text,
  country text
);

create table if not exists players (
  id text primary key,
  name text not null,
  team_id text references teams(id) on delete set null,
  position text,
  nationality text,
  birth_date date,
  raw jsonb
);

create table if not exists matches (
  id text primary key,
  competition_id text references competitions(id) on delete cascade,
  season_id text references seasons(id) on delete cascade,
  home_team_id text references teams(id) on delete cascade,
  away_team_id text references teams(id) on delete cascade,
  utc_date timestamptz,
  status text,
  matchday int,
  stage text,
  home_goals int,
  away_goals int,
  raw jsonb
);

create table if not exists standings (
  id bigserial primary key,
  competition_id text references competitions(id) on delete cascade,
  season_id text references seasons(id) on delete cascade,
  team_id text references teams(id) on delete cascade,
  position int,
  played int,
  won int,
  drawn int,
  lost int,
  goals_for int,
  goals_against int,
  points int,
  form text,
  xg numeric,
  xga numeric,
  xpts numeric,
  updated_at timestamptz default now(),
  unique (competition_id, season_id, team_id)
);

create table if not exists team_match_stats (
  id bigserial primary key,
  match_id text references matches(id) on delete cascade,
  team_id text references teams(id) on delete cascade,
  possession numeric,
  shots int,
  shots_on_target int,
  xg numeric,
  xga numeric,
  passes int,
  pass_accuracy numeric,
  corners int,
  fouls int,
  cards int,
  raw jsonb,
  unique (match_id, team_id)
);

create table if not exists player_match_stats (
  id bigserial primary key,
  match_id text references matches(id) on delete cascade,
  player_id text references players(id) on delete cascade,
  team_id text references teams(id) on delete cascade,
  minutes int,
  goals int,
  assists int,
  shots int,
  shots_on_target int,
  xg numeric,
  xa numeric,
  passes int,
  pass_accuracy numeric,
  tackles int,
  interceptions int,
  dribbles int,
  rating numeric,
  raw jsonb,
  unique (match_id, player_id)
);

create table if not exists match_events (
  id bigserial primary key,
  match_id text references matches(id) on delete cascade,
  minute int,
  type text,
  team_id text references teams(id) on delete cascade,
  player_id text references players(id) on delete set null,
  detail text,
  raw jsonb
);
