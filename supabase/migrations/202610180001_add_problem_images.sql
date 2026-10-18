-- Optional image for a math problem
ALTER TABLE public.problems
ADD COLUMN image_path TEXT;

-- Optional image for a hint
ALTER TABLE public.hints
ADD COLUMN image_path TEXT;