
DROP TABLE IF EXISTS investment_info;

CREATE TABLE investment_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    ticker VARCHAR(20),
    lat NUMERIC(9,6),
    long NUMERIC(9,6),
    state VARCHAR(255),
    news_urls VARCHAR(400),
    scorecard DECIMAL(5,2)
);

INSERT INTO investment_info 
    (name, ticker, lat, long, state, news_urls,scorecard) 
VALUES 
    ('Nasdaq Inc', 
    'NDAQ', 
    '40.7128', 
    '74.0060',
    'new york', 
    'https://www.nasdaq.com/news-and-insights',
    '100.00'),

    ('Amazon.com, Inc.', 
    'AMZN', 
    '47.6101', 
    '122.2015',
    'washington', 
    'https://blog.aboutamazon.com/company-news',
    '90.00')
RETURNING * ;

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
