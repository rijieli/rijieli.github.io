-- Initial schema for article visit counter
-- This migration creates the necessary table for tracking article visits

-- Table to store visit counts for articles
CREATE TABLE IF NOT EXISTS article_visits (
    article_url TEXT PRIMARY KEY,
    visits INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER DEFAULT 0,
    updated_at INTEGER DEFAULT 0
);

-- Create index for faster lookups by URL
CREATE INDEX IF NOT EXISTS idx_article_visits_url ON article_visits(article_url);

-- Create index for sorting by most visited articles
CREATE INDEX IF NOT EXISTS idx_article_visits_visits ON article_visits(visits DESC);

-- Create index for sorting by last updated
CREATE INDEX IF NOT EXISTS idx_article_visits_updated ON article_visits(updated_at DESC);

-- Add some initial data for testing (optional)
-- Update these URLs to match your actual blog posts
INSERT OR IGNORE INTO article_visits (article_url, visits) VALUES
    ('https://roger.zone/post/welcome-to-my-blog', 0),
    ('https://roger.zone/post/about-me', 0),
    ('https://roger.zone/post/my-first-post', 0);