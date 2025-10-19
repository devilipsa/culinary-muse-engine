-- Remove the strict constraint on n_suggestions
ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_n_suggestions_check;

-- Add a more flexible constraint (1 to 10 recipes)
ALTER TABLE public.sessions ADD CONSTRAINT sessions_n_suggestions_check 
CHECK (n_suggestions >= 1 AND n_suggestions <= 10);