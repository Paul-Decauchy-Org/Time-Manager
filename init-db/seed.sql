-- Additional Users (beyond the default ones in init.sql)
INSERT INTO users (id, first_name, last_name, email, phone, password, role)
VALUES 
  (uuid_generate_v4(), 'John', 'Doe', 'john.doe@timemanager.com', '3333333333', '$2a$10$lAy7kX6nOTnoWeWcZRxVeOkzXEgvjEKOB7IZ3fkglmKJ7Mh1gNqDe', 'USER'),
  (uuid_generate_v4(), 'Jane', 'Smith', 'jane.smith@timemanager.com', '4444444444', '$2a$10$lAy7kX6nOTnoWeWcZRxVeOkzXEgvjEKOB7IZ3fkglmKJ7Mh1gNqDe', 'USER'),
  (uuid_generate_v4(), 'Bob', 'Johnson', 'bob.johnson@timemanager.com', '5555555555', '$2a$10$lAy7kX6nOTnoWeWcZRxVeOkzXEgvjEKOB7IZ3fkglmKJ7Mh1gNqDe', 'USER'),
  (uuid_generate_v4(), 'Alice', 'Williams', 'alice.williams@timemanager.com', '6666666666', '$2a$10$lAy7kX6nOTnoWeWcZRxVeOkzXEgvjEKOB7IZ3fkglmKJ7Mh1gNqDe', 'USER'),
  (uuid_generate_v4(), 'Michael', 'Brown', 'michael.brown@timemanager.com', '7777777777', '$2a$10$lAy7kX6nOTnoWeWcZRxVeOkzXEgvjEKOB7IZ3fkglmKJ7Mh1gNqDe', 'MANAGER'),
  (uuid_generate_v4(), 'Admin', 'User', 'admin@timemanager.com', '9999999999', '$2a$10$lAy7kX6nOTnoWeWcZRxVeOkzXEgvjEKOB7IZ3fkglmKJ7Mh1gNqDe', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Create Teams
WITH manager_users AS (
  SELECT id, email FROM users WHERE role = 'MANAGER'
)
INSERT INTO teams (id, name, description, manager_id)
VALUES
  (uuid_generate_v4(), 'Marketing Team', 'Marketing specialists', (SELECT id FROM manager_users WHERE email = 'michael.brown@timemanager.com')),
  (uuid_generate_v4(), 'Sales Team', 'Sales representatives', (SELECT id FROM manager_users WHERE email = 'michael.brown@timemanager.com'));

-- Assign users to teams
WITH 
  user_ids AS (
    SELECT id, email FROM users WHERE role = 'USER'
  ),
  team_ids AS (
    SELECT id, name FROM teams
  )
INSERT INTO team_users (id, user_id, team_id)
VALUES
  -- Development Team
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'user@timemanager.com'), (SELECT id FROM team_ids WHERE name = 'Development Team')),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'john.doe@timemanager.com'), (SELECT id FROM team_ids WHERE name = 'Development Team')),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'jane.smith@timemanager.com'), (SELECT id FROM team_ids WHERE name = 'Development Team')),
  
  -- Design Team
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'bob.johnson@timemanager.com'), (SELECT id FROM team_ids WHERE name = 'Design Team')),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'alice.williams@timemanager.com'), (SELECT id FROM team_ids WHERE name = 'Design Team')),
  
  -- Marketing Team
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'user@timemanager.com'), (SELECT id FROM team_ids WHERE name = 'Marketing Team')),
  
  -- Sales Team
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'jane.smith@timemanager.com'), (SELECT id FROM team_ids WHERE name = 'Sales Team'))
ON CONFLICT DO NOTHING;

-- Create time_table_entries (clock in/out data)
WITH user_ids AS (
  SELECT id, email FROM users
)
INSERT INTO time_table_entries (id, user_id, day, arrival, departure, status)
VALUES
  -- Regular User
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'user@timemanager.com'), 'MONDAY', 
   NOW() - INTERVAL '7 days' + INTERVAL '9 hours', NOW() - INTERVAL '7 days' + INTERVAL '17 hours', true),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'user@timemanager.com'), 'TUESDAY', 
   NOW() - INTERVAL '6 days' + INTERVAL '8 hours 30 minutes', NOW() - INTERVAL '6 days' + INTERVAL '16 hours 45 minutes', true),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'user@timemanager.com'), 'WEDNESDAY', 
   NOW() - INTERVAL '5 days' + INTERVAL '9 hours 15 minutes', NOW() - INTERVAL '5 days' + INTERVAL '18 hours', true),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'user@timemanager.com'), 'THURSDAY', 
   NOW() - INTERVAL '4 days' + INTERVAL '9 hours', NOW() - INTERVAL '4 days' + INTERVAL '17 hours 30 minutes', true),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'user@timemanager.com'), 'FRIDAY', 
   NOW() - INTERVAL '3 days' + INTERVAL '8 hours 45 minutes', NOW() - INTERVAL '3 days' + INTERVAL '16 hours', true),
   
  -- John Doe
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'john.doe@timemanager.com'), 'MONDAY', 
   NOW() - INTERVAL '7 days' + INTERVAL '9 hours', NOW() - INTERVAL '7 days' + INTERVAL '17 hours 30 minutes', true),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'john.doe@timemanager.com'), 'WEDNESDAY', 
   NOW() - INTERVAL '5 days' + INTERVAL '8 hours 30 minutes', NOW() - INTERVAL '5 days' + INTERVAL '16 hours', true),
   
  -- Current day (incomplete entry)
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'user@timemanager.com'), 
   CASE EXTRACT(DOW FROM NOW())
     WHEN 0 THEN 'SUNDAY'
     WHEN 1 THEN 'MONDAY'
     WHEN 2 THEN 'TUESDAY'
     WHEN 3 THEN 'WEDNESDAY'
     WHEN 4 THEN 'THURSDAY'
     WHEN 5 THEN 'FRIDAY'
     WHEN 6 THEN 'SATURDAY'
   END,
   NOW() - INTERVAL '2 hours', NULL, false);

-- Create time_tables (work schedules)
WITH user_ids AS (
  SELECT id, email FROM users
)
INSERT INTO time_tables (id, user_id, day, start, ends)
VALUES
  -- Regular user schedule
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'user@timemanager.com'), 'MONDAY', 
   NOW()::date + INTERVAL '9 hours', NOW()::date + INTERVAL '17 hours'),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'user@timemanager.com'), 'TUESDAY', 
   NOW()::date + INTERVAL '9 hours', NOW()::date + INTERVAL '17 hours'),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'user@timemanager.com'), 'WEDNESDAY', 
   NOW()::date + INTERVAL '9 hours', NOW()::date + INTERVAL '17 hours'),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'user@timemanager.com'), 'THURSDAY', 
   NOW()::date + INTERVAL '9 hours', NOW()::date + INTERVAL '17 hours'),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'user@timemanager.com'), 'FRIDAY', 
   NOW()::date + INTERVAL '9 hours', NOW()::date + INTERVAL '17 hours'),
   
  -- John Doe - part time
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'john.doe@timemanager.com'), 'MONDAY', 
   NOW()::date + INTERVAL '9 hours', NOW()::date + INTERVAL '17 hours'),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'john.doe@timemanager.com'), 'WEDNESDAY', 
   NOW()::date + INTERVAL '9 hours', NOW()::date + INTERVAL '17 hours'),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'john.doe@timemanager.com'), 'FRIDAY', 
   NOW()::date + INTERVAL '9 hours', NOW()::date + INTERVAL '17 hours'),
   
  -- Jane Smith - flexible hours
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'jane.smith@timemanager.com'), 'MONDAY', 
   NOW()::date + INTERVAL '10 hours', NOW()::date + INTERVAL '19 hours'),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'jane.smith@timemanager.com'), 'TUESDAY', 
   NOW()::date + INTERVAL '10 hours', NOW()::date + INTERVAL '19 hours'),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'jane.smith@timemanager.com'), 'THURSDAY', 
   NOW()::date + INTERVAL '10 hours', NOW()::date + INTERVAL '19 hours'),
  (uuid_generate_v4(), (SELECT id FROM user_ids WHERE email = 'jane.smith@timemanager.com'), 'FRIDAY', 
   NOW()::date + INTERVAL '10 hours', NOW()::date + INTERVAL '19 hours');