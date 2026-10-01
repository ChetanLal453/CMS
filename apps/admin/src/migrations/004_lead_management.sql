ALTER TABLE contact
  ADD COLUMN IF NOT EXISTS lead_type VARCHAR(64) NOT NULL DEFAULT 'contact_form',
  ADD COLUMN IF NOT EXISTS source VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS follow_up_history JSON DEFAULT NULL;

UPDATE contact
SET
  lead_type = COALESCE(NULLIF(lead_type, ''), 'contact_form'),
  source = COALESCE(NULLIF(source, ''), '/contact')
WHERE lead_type IS NULL
  OR lead_type = ''
  OR source IS NULL
  OR source = '';
