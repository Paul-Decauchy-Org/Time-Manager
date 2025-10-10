-- Exemple de seeds : 5 utilisateurs, 1 équipe, 2 membres, et quelques entrées/plannings.
-- Utilise des UUID fixes pour pouvoir facilement référencer les mêmes ids.

BEGIN;

-- Users
INSERT INTO users (id, first_name, last_name, email, phone, password, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin',   'System',  'admin@timemanager.com',   '+33123456789', 'adminpass',   'ADMIN')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, first_name, last_name, email, phone, password, role) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Manager', 'Project', 'manager@timemanager.com', '+33234567890', 'managerpass', 'MANAGER')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, first_name, last_name, email, phone, password, role) VALUES
  ('33333333-3333-3333-3333-333333333333', 'John',    'Doe',     'john.doe@timemanager.com', '+33345678901', 'johnpass',    'USER')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, first_name, last_name, email, phone, password, role) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Jane',    'Smith',   'jane.smith@timemanager.com', '+33456789012', 'janepass',   'USER')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, first_name, last_name, email, phone, password, role) VALUES
  ('55555555-5555-5555-5555-555555555555', 'Alice',   'Johnson', 'alice.johnson@timemanager.com', '+33567890123', 'alicepass', 'USER')
ON CONFLICT (email) DO NOTHING;

-- Team
INSERT INTO teams (id, name, description, manager_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Development Team', 'Main development team for TimeManager project', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- Team members (add John and Jane to the team)
INSERT INTO team_users (id, user_id, team_id) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (user_id, team_id) DO NOTHING;

INSERT INTO team_users (id, user_id, team_id) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (user_id, team_id) DO NOTHING;

-- Time table entries (one sample entry per user for today)
-- Remplacez les dates/heures si nécessaire
INSERT INTO time_table_entries (id, user_id, day, arrival, departure, status) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', CURRENT_DATE, now() - interval '8 hours', now() - interval '1 hour', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO time_table_entries (id, user_id, day, arrival, departure, status) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', CURRENT_DATE, now() - interval '8 hours', now() - interval '1 hour', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO time_table_entries (id, user_id, day, arrival, departure, status) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', CURRENT_DATE, now() - interval '8 hours', now() - interval '1 hour', true)
ON CONFLICT (id) DO NOTHING;

-- Time tables (one sample planning per user for today)
INSERT INTO time_tables (id, user_id, day, start, "end") VALUES
  ('10101010-1010-1010-1010-101010101010', '33333333-3333-3333-3333-333333333333', CURRENT_DATE, now() - interval '9 hours', now() + interval '8 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO time_tables (id, user_id, day, start, "end") VALUES
  ('12121212-1212-1212-1212-121212121212', '44444444-4444-4444-4444-444444444444', CURRENT_DATE, now() - interval '9 hours', now() + interval '8 hours')
ON CONFLICT (id) DO NOTHING;

COMMIT;