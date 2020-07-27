
DROP TABLE IF EXISTS investment_info;

CREATE TABLE investment_info (
    id SERIAL PRIMARY KEY,
    companyName VARCHAR(255),
    symbol VARCHAR(20),
    current_price VARCHAR(255),
    sentimentResult VARCHAR(400),
    sector VARCHAR(400),
    UNIQUE(symbol)
);

INSERT INTO investment_info (companyName, symbol, current_price,sentimentResult, sector) VALUES ('Wang Corp', 'WAN', '1000', 'Positive', 'Technology') RETURNING *;
INSERT INTO investment_info (companyName, symbol, current_price,sentimentResult, sector) VALUES ('Reagan Corp', 'REA', '1000', 'Positive', 'Technology') RETURNING *;
-- INSTRUCTIONS:

-- ////////////// WINDOWS
-- WINDOWS USERS:

-- STEP 1: RUN COMMAND "pgstart" in terminal.
-- STEP 2: RUN COMMAND "psql".
-- STEP 3: RUN COMMAND "CREATE DATABASE investment_db;"
-- STEP 4: RUN COMMAND "\q"
-- STEP 5: RUN COMMAND "psql -f ./public/data/db_setup.sql -d investment_db;"



-- ////////////// MAC
-- MAC USERS: START WITH STEP 1.

-- STEP 1: RUN COMMAND "psql".
-- STEP 2: RUN COMMAND "CREATE DATABASE investment_db;"
-- STEP 3: RUN COMMAND "\q"
-- STEP 4: RUN COMMAND "psql -f ./public/data/db_setup.sql -d investment_db;"
