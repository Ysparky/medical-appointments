-- PostgreSQL schema for appointments table

-- Drop the table if it exists
DROP TABLE IF EXISTS appointments;

-- Create the appointments table with PostgreSQL syntax
CREATE TABLE appointments (
  id VARCHAR(36) PRIMARY KEY,
  insured_id VARCHAR(5) NOT NULL,
  schedule_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- Create an index for faster querying by insured_id and created_at
CREATE INDEX idx_insured_id_created_at ON appointments (insured_id, created_at);