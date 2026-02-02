-- =============================================================
-- MIGRATION: Add compliant_contract column to audits table
-- Run this in Supabase SQL Editor
-- =============================================================

ALTER TABLE public.audits ADD COLUMN compliant_contract TEXT;
