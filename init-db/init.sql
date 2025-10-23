-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création du type énuméré pour les jours
CREATE TYPE day_type AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'USER',
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN', 'MANAGER'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  manager_id uuid NOT NULL,
  CONSTRAINT fk_teams_manager FOREIGN KEY (manager_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_teams_manager_id ON teams(manager_id);

-- Team_users relation table
CREATE TABLE IF NOT EXISTS team_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  team_id uuid NOT NULL,
  CONSTRAINT fk_teamuser_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_teamuser_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT uq_team_user UNIQUE (user_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_team_users_user_id ON team_users(user_id);
CREATE INDEX IF NOT EXISTS idx_team_users_team_id ON team_users(team_id);

-- TimeTableEntry table
CREATE TABLE IF NOT EXISTS time_table_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  day text NOT NULL,
  arrival timestamptz NOT NULL,
  departure timestamptz NOT NULL,
  status boolean NOT NULL DEFAULT false,
  CONSTRAINT fk_tte_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_time_table_entries_user_id ON time_table_entries(user_id);

-- TimeTable table
CREATE TABLE IF NOT EXISTS time_tables (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  day text NOT NULL,
  start timestamptz NOT NULL,
  ends timestamptz NOT NULL,
  CONSTRAINT fk_tt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT time_tables_day_check CHECK (day IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'))
);

CREATE INDEX IF NOT EXISTS idx_time_tables_user_day ON time_tables(user_id, day);