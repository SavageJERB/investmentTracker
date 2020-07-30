
DROP TABLE IF EXISTS investment_info;
DROP TABLE IF EXISTS stock_info;

CREATE TABLE investment_info (
    id SERIAL PRIMARY KEY,
    companyname VARCHAR(255),
    symbol VARCHAR(20),
    current_price DECIMAL(8,2),
    sentimentResult VARCHAR(400),
    greencheck VARCHAR(400),
    sector VARCHAR(400),
    stockScore DECIMAL(8,2),
    UNIQUE(symbol)
);

CREATE TABLE stock_info (
    id SERIAL PRIMARY KEY,
    companyname VARCHAR(255),
    symbol VARCHAR(20),
    current_price DECIMAL(8,2),
    day_low DECIMAL(8,2),
    day_high DECIMAL(8,2),
    UNIQUE(symbol)
);

INSERT INTO investment_info (companyname, symbol, current_price,sentimentResult, greencheck, sector) VALUES ('Wang Corp', 'WAN', '1000', 'Positive', 'Green', 'Technology') RETURNING *;
INSERT INTO investment_info (companyname, symbol, current_price,sentimentResult, greencheck, sector) VALUES ('Reagan Corp', 'REA', '1000', 'Positive', 'Not Green','Technology') RETURNING *;
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
