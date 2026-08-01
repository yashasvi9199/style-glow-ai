-- DATABASE.sql
-- Cloudflare D1 Database schema for Style Glow AI
-- Date: 2026-08-01
-- Feature: Cloudflare D1 Migration
-- Type: SCHEMA

CREATE TABLE IF NOT EXISTS analysis_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_url TEXT,
    model_used TEXT NOT NULL,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rate_limits (
    ip_address TEXT PRIMARY KEY,
    last_request_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    request_count INTEGER DEFAULT 1
);
