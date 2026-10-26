BEGIN;

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS proposed_flyer_image TEXT,
  ADD COLUMN IF NOT EXISTS approved_flyer_image TEXT,
  ADD COLUMN IF NOT EXISTS proposed_cover_image TEXT,
  ADD COLUMN IF NOT EXISTS approved_cover_image TEXT,
  ADD COLUMN IF NOT EXISTS flyer_review_status TEXT DEFAULT 'not_submitted',
  ADD COLUMN IF NOT EXISTS cover_review_status TEXT DEFAULT 'not_submitted',
  ADD COLUMN IF NOT EXISTS flyer_review_message TEXT;

COMMIT;
