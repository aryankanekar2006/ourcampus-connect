-- ========================================================
-- OURCAMPUS CONNECT - POSTGRESQL DATABASE RESET & SETUP SCRIPT
-- Run this in pgAdmin 4 Query Tool or psql
-- ========================================================

-- (Optional) If you want to drop and recreate clean tables:
DROP TABLE IF EXISTS feedbacks CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS volunteers CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Students, Teachers, Admins)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uid TEXT UNIQUE,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  roll_no TEXT,
  faculty_id TEXT,
  admin_id TEXT,
  student_class TEXT,
  stream TEXT,
  department TEXT,
  admin_role TEXT,
  phone TEXT,
  avatar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  department TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  description TEXT NOT NULL,
  prizes TEXT,
  contact TEXT,
  image TEXT,
  max_seats INTEGER DEFAULT 100,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Event Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  roll_no TEXT,
  student_class TEXT,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Event Volunteers Table
CREATE TABLE IF NOT EXISTS volunteers (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role_applied TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Notifications & Broadcasts Table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_role TEXT DEFAULT 'all',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Event Feedback Table
CREATE TABLE IF NOT EXISTS feedbacks (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  event_title TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- SEED DEFAULT DEMO DATA FOR EASY TESTING
-- ========================================================

-- Insert Demo Users
INSERT INTO users (name, email, role, password, roll_no, student_class, stream, department, phone, faculty_id, admin_id, admin_role)
VALUES
  (
    'Aryan Kanekar',
    'aryan.kanekar@rkt.edu.in',
    'student',
    'password123',
    '2524020',
    'TYCS',
    'BSc CS',
    'Department of Computer Science',
    '+91 98765 43210',
    NULL,
    NULL,
    NULL
  ),
  (
    'Prof. Aryan Kanekar',
    'a.kanekar@rkt.edu.in',
    'teacher',
    'password123',
    NULL,
    NULL,
    NULL,
    'Computer Science',
    '+91 98200 11223',
    'TCH-CS-102',
    NULL,
    NULL
  ),
  (
    'Dr. R. K. Sharma',
    'principal@rkt.edu.in',
    'admin',
    'password123',
    NULL,
    NULL,
    NULL,
    'Administration',
    '+91 98111 22334',
    NULL,
    'ADM-RKT-001',
    'Principal'
  )
ON CONFLICT (email) DO NOTHING;

-- Insert Demo Events
INSERT INTO events (title, category, department, date, time, venue, description, prizes, contact, image, max_seats, created_by)
VALUES
  (
    'TechVista 2026 - Annual CS TechFest',
    'TechFest',
    'Computer Science & IT',
    '2026-08-15',
    '09:00 AM',
    'Main Auditorium & CS Labs',
    'Inter-collegiate technical extravaganza featuring Coding Marathons, Web Crafting, AI Prompt Battle, and Robotics Demonstration.',
    '₹25,000 Cash Prizes & Winner Trophies',
    'Prof. A. Kanekar (+91 98200 11223)',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    250,
    'Department of CS'
  ),
  (
    'Cultural Waves - Youth Festival 2026',
    'Cultural',
    'Arts & Humanities',
    '2026-08-28',
    '10:00 AM',
    'College Quadrangle',
    'A vibrant celebration of music, dance, fashion show, street play, and fine arts showcasing talented youth across Mumbai colleges.',
    'Trophies & Certificates for Top 3 Performers',
    'Dr. R. K. Sharma (+91 98111 22334)',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    500,
    'Cultural Committee'
  ),
  (
    'RKT Inter-Collegiate Cricket Trophy 2026',
    'Sports',
    'Gymkhana & Sports',
    '2026-09-10',
    '08:30 AM',
    'College Sports Ground',
    'Annual T20 inter-collegiate cricket tournament with knockout stages, trophies, and player of the tournament awards.',
    'Championship Trophy + ₹15,000 Cash Prize',
    'Sports Secretary (+91 98333 44556)',
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    150,
    'Sports Committee'
  );

-- Insert Demo Notifications
INSERT INTO notifications (title, message, target_role)
VALUES
  (
    'TechVista 2026 Registrations Open!',
    'All students from CS, IT, and Science streams can now register for coding & web design events.',
    'all'
  ),
  (
    'Faculty Staff Meeting',
    'Important faculty meeting on NAAC accreditation updates scheduled for Tuesday at 2 PM.',
    'teacher'
  ),
  (
    'Sports Trials Announcement',
    'Selection trials for college cricket and football teams begin this Friday at 8:00 AM.',
    'student'
  );

-- Verification Query
SELECT 'Users Count: ' || COUNT(*) FROM users;
SELECT 'Events Count: ' || COUNT(*) FROM events;
