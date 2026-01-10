-- Add 'embassy' to the candidate_stage enum (before visa_issued)
ALTER TYPE candidate_stage ADD VALUE 'embassy' BEFORE 'visa_issued';