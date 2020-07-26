
DROP TABLE IF EXISTS stock_info;

CREATE TABLE stock_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    ticker VARCHAR(20),
    dayHigh DECIMAL(9,2),
    dayLow DECIMAL(9,2),
    price DECIMAL(9,2)
);


-- INSTRUCTIONS:

-- ////////////// WINDOWS
-- WINDOWS USERS:

-- STEP 1: RUN COMMAND "pgstart" in terminal.
-- STEP 2: RUN COMMAND "psql".
-- STEP 3: RUN COMMAND "CREATE DATABASE investment_db;"
-- STEP 4: RUN COMMAND "\q"
-- STEP 5: RUN COMMAND "psql -f ./public/data/db_stocks.sql -d investment_db;"



-- ////////////// MAC
-- MAC USERS: START WITH STEP 1.

-- STEP 1: RUN COMMAND "psql".
-- STEP 2: RUN COMMAND "CREATE DATABASE investment_db;"
-- STEP 3: RUN COMMAND "\q"
-- STEP 5: RUN COMMAND "psql -f ./public/data/db_stocks.sql -d investment_db;"
