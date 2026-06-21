-- Demo data for BuildSync-3D
-- Password for all demo users is "demo" (bcrypt hash below).
USE buildsync3d;

-- bcrypt hash of "demo" (cost 10)
SET @demo_hash = '$2a$10$Jq7y3v1mD0qZxYjTcL2Yp.Q8gE8a3Q6mYwbS/JcW1V0sX8u3Q7C9e';

INSERT INTO users (email, password_hash, name, role) VALUES
  ('contractor@demo.com', @demo_hash, 'Casey Contractor', 'contractor'),
  ('supervisor@demo.com', @demo_hash, 'Sam Supervisor', 'supervisor'),
  ('client@demo.com',     @demo_hash, 'Chris Client',    'client');

INSERT INTO projects (name, client_id, contractor_id, supervisor_id, budget, status) VALUES
  ('Maple Street Renovation', 3, 1, 2, 150000.00, 'in_progress');

INSERT INTO milestones (project_id, title, due_date, status, progress) VALUES
  (1, 'Foundation',  '2026-07-01', 'completed',   100),
  (1, 'Framing',     '2026-08-15', 'in_progress',  60),
  (1, 'Roofing',     '2026-09-10', 'pending',       0),
  (1, 'Finishes',    '2026-10-30', 'pending',       0);

INSERT INTO expenses (project_id, category, description, amount, incurred_at, created_by) VALUES
  (1, 'Materials', 'Concrete + rebar', 12500.00, '2026-06-10', 2),
  (1, 'Labor',     'Framing crew week 1', 8400.00, '2026-06-18', 2);
