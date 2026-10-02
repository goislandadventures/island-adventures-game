ALTER TABLE players ADD COLUMN force_password_change INTEGER NOT NULL DEFAULT 0;
UPDATE players
SET password_hash='v2:4b20f60344e5fd9d57231f0a5c8c2bc6549a105a98a93d4d47721dcb256e3343',
    password_salt='/SBsrhnuQZNxb7d5eBQvwQ==',
    force_password_change=1
WHERE (SELECT count(*) FROM players)=1;
