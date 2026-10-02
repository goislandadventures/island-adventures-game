CREATE TABLE IF NOT EXISTS account_reset_assertions (
  check_name TEXT PRIMARY KEY,
  remaining_count INTEGER NOT NULL CHECK (remaining_count = 0)
);

DELETE FROM account_reset_assertions;

DELETE FROM sessions
WHERE player_id IN (SELECT id FROM players WHERE email='jim@goislandadventures.com');

INSERT INTO account_reset_assertions(check_name,remaining_count)
VALUES(
  'sessions',
  (SELECT COUNT(*) FROM sessions
   WHERE player_id IN (SELECT id FROM players WHERE email='jim@goislandadventures.com'))
);

DELETE FROM companies
WHERE player_id IN (SELECT id FROM players WHERE email='jim@goislandadventures.com');

INSERT INTO account_reset_assertions(check_name,remaining_count)
VALUES(
  'companies',
  (SELECT COUNT(*) FROM companies
   WHERE player_id IN (SELECT id FROM players WHERE email='jim@goislandadventures.com'))
);

DELETE FROM players
WHERE email='jim@goislandadventures.com';

INSERT INTO account_reset_assertions(check_name,remaining_count)
VALUES(
  'players',
  (SELECT COUNT(*) FROM players WHERE email='jim@goislandadventures.com')
);
