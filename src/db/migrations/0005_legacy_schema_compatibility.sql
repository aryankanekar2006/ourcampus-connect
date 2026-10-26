BEGIN;

-- Existing accounts without verification metadata remain unverified until reviewed.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'approved';

-- Legacy events without an approval status stay unpublished until Principal review.
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'event',
  ADD COLUMN IF NOT EXISTS programme_type TEXT,
  ADD COLUMN IF NOT EXISTS sub_headline TEXT,
  ADD COLUMN IF NOT EXISTS date_mode TEXT DEFAULT 'single',
  ADD COLUMN IF NOT EXISTS end_date TEXT,
  ADD COLUMN IF NOT EXISTS multiple_dates TEXT,
  ADD COLUMN IF NOT EXISTS highlights TEXT,
  ADD COLUMN IF NOT EXISTS resource_person TEXT,
  ADD COLUMN IF NOT EXISTS for_whom TEXT,
  ADD COLUMN IF NOT EXISTS social_handle TEXT,
  ADD COLUMN IF NOT EXISTS college_logo TEXT,
  ADD COLUMN IF NOT EXISTS dept_logo TEXT,
  ADD COLUMN IF NOT EXISTS registration_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ticket_price TEXT,
  ADD COLUMN IF NOT EXISTS eligibility TEXT,
  ADD COLUMN IF NOT EXISTS registration_deadline TEXT,
  ADD COLUMN IF NOT EXISTS external_registration_url TEXT,
  ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
  ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'Everyone',
  ADD COLUMN IF NOT EXISTS attendance_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_approval',
  ADD COLUMN IF NOT EXISTS principal_message TEXT,
  ADD COLUMN IF NOT EXISTS flyer_data TEXT,
  ADD COLUMN IF NOT EXISTS flyer_versions TEXT,
  ADD COLUMN IF NOT EXISTS selected_flyer_image TEXT,
  ADD COLUMN IF NOT EXISTS creator_email TEXT,
  ADD COLUMN IF NOT EXISTS creator_name TEXT;

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'Everyone',
  ADD COLUMN IF NOT EXISTS event_id INTEGER;

ALTER TABLE feedbacks
  ADD COLUMN IF NOT EXISTS event_id INTEGER;

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_requests (
  id SERIAL PRIMARY KEY,
  session_id INTEGER,
  event_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  roll_no TEXT,
  student_class TEXT,
  status TEXT DEFAULT 'Pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  event_id INTEGER,
  event_title TEXT,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
