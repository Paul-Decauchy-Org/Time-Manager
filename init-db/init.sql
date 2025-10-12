-- Extensions (UUID generation)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  password text NOT NULL,
  role text NOT NULL CHECK (role IN ('USER','ADMIN','MANAGER'))
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL,
  manager_id uuid NOT NULL,
  CONSTRAINT fk_team_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_teams_manager_id ON teams(manager_id);

-- Team <-> User relation
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

-- Time table entries (pointage)
CREATE TABLE IF NOT EXISTS time_table_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  arrival timestamptz NOT NULL,
  departure timestamptz NOT NULL,
  status boolean NOT NULL,
  CONSTRAINT fk_tte_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tte_user_day ON time_table_entries(user_id, day);

-- Time tables (plannings)
CREATE TABLE IF NOT EXISTS time_tables (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  CONSTRAINT fk_tt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tt_user_day ON time_tables(user_id, day);