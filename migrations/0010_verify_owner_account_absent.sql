CREATE TABLE IF NOT EXISTS owner_absence_verification (
  check_name TEXT PRIMARY KEY,
  remaining_count INTEGER NOT NULL CHECK (remaining_count = 0)
);

DELETE FROM owner_absence_verification;

INSERT INTO owner_absence_verification(check_name,remaining_count)
VALUES(
  'players',
  (SELECT COUNT(*) FROM players WHERE email='jim@goislandadventures.com')
);

INSERT INTO owner_absence_verification(check_name,remaining_count)
VALUES(
  'companies',
  (SELECT COUNT(*) FROM companies
   WHERE player_id IN (
     SELECT id FROM players WHERE email='jim@goislandadventures.com'
   ))
);

INSERT INTO owner_absence_verification(check_name,remaining_count)
VALUES(
  'sessions',
  (SELECT COUNT(*) FROM sessions
   WHERE player_id IN (
     SELECT id FROM players WHERE email='jim@goislandadventures.com'
   ))
);
