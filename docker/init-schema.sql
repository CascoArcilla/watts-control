-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS backend_app;

-- Grant usage on schema to the user
GRANT USAGE ON SCHEMA backend_app TO postgres;

-- Grant create privileges on schema
GRANT CREATE ON SCHEMA backend_app TO postgres;

-- Set default search path for the user
ALTER USER postgres SET search_path = backend_app, public;