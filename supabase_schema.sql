-- ==============================================================================
-- PrepSmart AI 2.0 - Supabase PostgreSQL Schema
-- Run this script in your Supabase project's SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. Create mockInterview table
CREATE TABLE IF NOT EXISTS public."mockInterview" (
    id SERIAL PRIMARY KEY,
    "mockId" VARCHAR(255) NOT NULL UNIQUE,
    "jsonMockResp" TEXT NOT NULL,
    "jobPosition" VARCHAR(255) NOT NULL,
    "jobDesc" VARCHAR(255) NOT NULL,
    "jobExperience" VARCHAR(255) NOT NULL,
    "createdBy" VARCHAR(255) NOT NULL,
    "createdAt" VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying interviews by creator
CREATE INDEX IF NOT EXISTS idx_mock_interview_created_by 
ON public."mockInterview" ("createdBy");

-- 2. Create userAnswer table
CREATE TABLE IF NOT EXISTS public."userAnswer" (
    id SERIAL PRIMARY KEY,
    "mockId" VARCHAR(255) NOT NULL,
    question VARCHAR(500) NOT NULL,
    "correctAns" TEXT,
    "userAns" TEXT,
    feedback TEXT,
    rating VARCHAR(50),
    "userEmail" VARCHAR(255),
    "createdAt" VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying answers by interview mockId
CREATE INDEX IF NOT EXISTS idx_user_answer_mock_id 
ON public."userAnswer" ("mockId");

-- Index for querying answers by user email
CREATE INDEX IF NOT EXISTS idx_user_answer_email 
ON public."userAnswer" ("userEmail");

-- 3. Row Level Security (RLS) Configuration
ALTER TABLE public."mockInterview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."userAnswer" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and service users to read and insert mock interviews
CREATE POLICY "Allow users to view own interviews" 
ON public."mockInterview" 
FOR SELECT 
USING (true);

CREATE POLICY "Allow users to create interviews" 
ON public."mockInterview" 
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated and service users to read and insert answers
CREATE POLICY "Allow users to view answers" 
ON public."userAnswer" 
FOR SELECT 
USING (true);

CREATE POLICY "Allow users to record answers" 
ON public."userAnswer" 
FOR INSERT 
WITH CHECK (true);
