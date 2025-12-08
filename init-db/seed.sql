-- UUID generator 
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =======================
-- 1. USERS
-- =======================
INSERT INTO users (id, first_name, last_name, email, phone, password, role)
VALUES
(gen_random_uuid(), 'Alice', 'Dupont', 'alice.dupont@example.fr', '0700000001', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'ADMIN'),
(gen_random_uuid(), 'Bob', 'Sall', 'bob.sall@example.fr', '0700000002', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Carla', 'Diop', 'carla.diop@example.fr', '0700000003', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'David', 'Fall', 'david.fall@example.fr', '0700000004', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Eva', 'Smith', 'eva.smith@example.fr', '0700000005', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Fabrice', 'Ba', 'fabrice.ba@example.fr', '0700000006', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'MANAGER'),
(gen_random_uuid(), 'Gora', 'Sow', 'gora.sow@example.fr', '0700000007', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Helene', 'Césaire', 'helene.cesaire@example.fr', '0700000008', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Ibrahima', 'Sy', 'ibrahima.sy@example.fr', '0700000009', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Julie', 'Loris', 'julie.loris@example.fr', '0700000010', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Karim', 'Buchet', 'karim.buchet@example.fr', '0700000011', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Laura', 'Meron', 'laura.meron@example.fr', '0700000012', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Moussa', 'Kane', 'moussa.kane@example.fr', '0700000013', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Nadia', 'Belet', 'nadia.belet@example.fr', '0700000014', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Julien', 'Gomis', 'julien.gomis@example.fr', '0700000015', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'MANAGER'),
(gen_random_uuid(), 'Kevin', 'Louis', 'kevin.louis@example.fr', '0700000016', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Henri', 'Guerin', 'henri.guerin@example.fr', '0700000017', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Rama', 'Faye', 'rama.faye@example.fr', '0700000018', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Arthur', 'Ba', 'arthur.ba@example.fr', '0700000019', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Thomas', 'Gomis', 'thomas.gomis@example.fr', '0700000020', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'USER'),
(gen_random_uuid(), 'Jessica', 'Sachi', 'jessica.sachi@example.fr', '0700000021', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'MANAGER'),
(gen_random_uuid(), 'Paul', 'Varney', 'paul.varney@example.fr', '0700000022', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'MANAGER'),
(gen_random_uuid(), 'Clara', 'Bob', 'clara.bob@example.fr', '0700000023', '2501b937-782b-4a65-8ad8-0ee55cbdb3a6', 'MANAGER');

-- =======================
-- 2. TEAMS
-- =======================
WITH managers AS (
  SELECT id FROM users WHERE role = 'MANAGER' LIMIT 5
)
INSERT INTO teams (id, name, description, manager_id)
SELECT 
  gen_random_uuid(),
  CONCAT('Team_', ROW_NUMBER() OVER()),
  'Équipe générée automatiquement pour les tests',
  id
FROM managers;

-- =======================
-- 3. TIME TABLES
-- =======================
INSERT INTO time_tables (id, start, ends, effective_from, effective_to, is_active)
VALUES
(gen_random_uuid(), '08:00', '16:00', '2025-01-01', '2026-06-30', TRUE),
(gen_random_uuid(), '09:00', '17:00', '2024-07-01', '2024-12-31', FALSE);

-- =======================
-- 4. TIME TABLE ENTRIES 
-- =======================
DO $$
DECLARE 
    u RECORD;
    i INT;
    random_day DATE;
    arrival TIMESTAMP;
    departure TIMESTAMP;
BEGIN
    FOR u IN SELECT id FROM users LOOP
        FOR i IN 1..10 LOOP
            random_day := (CURRENT_DATE - (i || ' day')::interval)::date;
            arrival := (random_day || ' 08:0' || (i % 5))::timestamp;
            departure := (random_day || ' 16:1' || (i % 5))::timestamp;

            INSERT INTO time_table_entries (id, user_id, day, arrival, departure, status)
            VALUES (
                gen_random_uuid(),
                u.id,
                random_day::text,
                arrival,
                departure,
                TRUE
            );
        END LOOP;
    END LOOP;
END $$;
