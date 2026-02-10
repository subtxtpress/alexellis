-- =====================================================
-- FOIA.io Database Schema for Supabase
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- REQUESTS TABLE
-- Core table storing all FOIA requests
-- =====================================================
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Request Identification
  request_id TEXT NOT NULL, -- e.g., "FOIA-2026-001"
  tracking_number TEXT, -- Agency's tracking number
  
  -- Filing Information
  filed_date DATE NOT NULL,
  agency_name TEXT NOT NULL,
  agency_type TEXT NOT NULL CHECK (agency_type IN ('Federal', 'State', 'Local', 'University', 'Private Entity')),
  state_code TEXT, -- Two-letter state code (MO, IN, etc.) - NULL for federal
  
  -- Request Details
  subject TEXT NOT NULL,
  request_summary TEXT, -- Longer description
  investigation TEXT, -- Which investigation/story this belongs to
  
  -- Status & Priority
  status TEXT NOT NULL DEFAULT 'Filed' CHECK (status IN (
    'Filed', 'Acknowledged', 'Processing', 'Responsive Records Identified',
    'Partial Release', 'Denied', 'Appeal Filed', 'Appeal Denied', 
    'Appeal Granted', 'Closed - Complete', 'Closed - Abandoned',
    'Past Due', 'Fee Dispute', 'Awaiting Clarification', 'Appeal Needed'
  )),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
  status_date DATE,
  
  -- Deadlines (auto-calculated)
  response_deadline DATE,
  appeal_deadline DATE,
  days_pending INTEGER,
  days_in_status INTEGER,
  
  -- Contact Information
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  method TEXT CHECK (method IN ('Portal', 'Email', 'Mail', 'Fax', 'In Person')),
  
  -- Appeal Information
  appeal_status TEXT CHECK (appeal_status IN ('N/A', 'Needed', 'Filed', 'Denied', 'Granted', 'Exhausted')),
  appeal_filed_date DATE,
  denial_reason TEXT,
  
  -- Fee Information
  fee_amount DECIMAL(10, 2),
  fee_status TEXT CHECK (fee_status IN ('None', 'Waived', 'Challenged', 'Paid', 'Outstanding', 'Reduced')),
  
  -- Documents Received
  pages_requested INTEGER,
  pages_received INTEGER,
  pages_withheld INTEGER,
  exemptions_cited TEXT, -- Comma-separated list
  
  -- Notes
  notes TEXT,
  next_action TEXT,
  next_action_date DATE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_investigation ON requests(investigation);
CREATE INDEX idx_requests_response_deadline ON requests(response_deadline);

-- =====================================================
-- DOCUMENTS TABLE
-- Store uploaded files associated with requests
-- =====================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- File Information
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_type TEXT CHECK (file_type IN (
    'Request', 'Acknowledgment', 'Response', 'Denial', 
    'Appeal', 'Fee Estimate', 'Receipt', 'Other'
  )),
  file_size_bytes INTEGER,
  mime_type TEXT,
  
  -- Metadata
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_request_id ON documents(request_id);

-- =====================================================
-- ACTIVITY LOG TABLE
-- Track all changes to requests for audit trail
-- =====================================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Change Information
  action TEXT NOT NULL, -- 'status_changed', 'deadline_updated', 'document_uploaded', etc.
  field_name TEXT, -- Which field changed
  old_value TEXT,
  new_value TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_log_request_id ON activity_log(request_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Requests policies
CREATE POLICY "Users can view own requests" 
  ON requests FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own requests" 
  ON requests FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own requests" 
  ON requests FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own requests" 
  ON requests FOR DELETE 
  USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can view own documents" 
  ON documents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" 
  ON documents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" 
  ON documents FOR DELETE 
  USING (auth.uid() = user_id);

-- Activity log policies (read-only for users)
CREATE POLICY "Users can view own activity" 
  ON activity_log FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity" 
  ON activity_log FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- Utility functions for deadline calculations
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on requests
-- 1) Optional holidays table to store observed holidays
CREATE TABLE IF NOT EXISTS holidays (
  holiday_date DATE PRIMARY KEY,
  description TEXT
);

-- 2) Improved add_business_days function (recommended default)
CREATE OR REPLACE FUNCTION add_business_days(start_date DATE, days INTEGER)
RETURNS DATE
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  loop_date DATE;
  days_added INTEGER := 0;
BEGIN
  -- Return NULL if inputs are NULL
  IF start_date IS NULL OR days IS NULL THEN
    RETURN NULL;
  END IF;

  -- Zero or negative -> no forward days added (preserves start_date)
  IF days <= 0 THEN
    RETURN start_date;
  END IF;

  loop_date := start_date;

  WHILE days_added < days LOOP
    loop_date := loop_date + 1; -- advance one calendar day

    -- Skip weekends (Sunday=0, Saturday=6) and any holiday in holidays table
    IF EXTRACT(DOW FROM loop_date) NOT IN (0, 6)
       AND NOT EXISTS (SELECT 1 FROM holidays h WHERE h.holiday_date = loop_date) THEN
      days_added := days_added + 1;
    END IF;
  END LOOP;

  RETURN loop_date;
END;
$$;

-- 3) Optional: insert a small set of upcoming US federal holidays (edit/remove as needed)
INSERT INTO holidays (holiday_date, description) VALUES
  ('2026-01-01','New Year''s Day'),
  ('2026-01-19','Martin Luther King Jr. Day'),
  ('2026-02-16','Presidents Day'),
  ('2026-05-25','Memorial Day'),
  ('2026-06-19','Juneteenth'),
  ('2026-07-04','Independence Day'),
  ('2026-09-07','Labor Day'),
  ('2026-10-12','Columbus Day / Indigenous Peoples'' Day'),
  ('2026-11-11','Veterans Day'),
  ('2026-11-26','Thanksgiving Day'),
  ('2026-12-25','Christmas Day')
ON CONFLICT (holiday_date) DO NOTHING;

-- =====================================================
-- INITIAL DATA (Optional)
-- Add your first request for testing
-- =====================================================

-- NOTE: You'll need to replace 'YOUR_USER_ID_HERE' with your actual user ID
-- after you create your first account. You can find this in the Supabase
-- Auth dashboard or by running: SELECT id FROM auth.users;

-- Example insert (commented out - uncomment and update after signup):
/*
INSERT INTO requests (
  user_id,
  request_id,
  filed_date,
  agency_name,
  agency_type,
  state_code,
  subject,
  status,
  priority,
  investigation,
  response_deadline
) VALUES (
  'YOUR_USER_ID_HERE', -- Replace with your user ID
  'FOIA-2026-001',
  '2026-01-15',
  'Treasury—FinCEN',
  'Federal',
  NULL,
  'NSPM-7 Financial Surveillance Activities',
  'Acknowledged',
  'High',
  'NSPM-7 Surveillance',
  add_business_days('2026-01-15'::DATE, 20)
);
*/

-- =====================================================
-- STORAGE BUCKETS
-- Run these commands in Supabase Storage section
-- =====================================================

-- Go to Storage > Create new bucket
-- Bucket name: request-documents
-- Public: OFF (private)
-- Then add this policy in Storage policies:

/*
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'request-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'request-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- =====================================================
