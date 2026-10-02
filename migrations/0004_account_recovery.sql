ALTER TABLE players ADD COLUMN recovery_token_hash TEXT;

UPDATE players
SET recovery_token_hash='e77dec70ad2a6e9d1741469949405e5b6cbe956b931ac0c8a76875b8906165e2',
    force_password_change=1
WHERE email='jim@goislandadventures.com';
