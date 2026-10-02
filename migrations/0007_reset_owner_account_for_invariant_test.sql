DELETE FROM sessions
WHERE player_id IN (SELECT id FROM players WHERE email='jim@goislandadventures.com');

DELETE FROM companies
WHERE player_id IN (SELECT id FROM players WHERE email='jim@goislandadventures.com');

DELETE FROM players
WHERE email='jim@goislandadventures.com';
