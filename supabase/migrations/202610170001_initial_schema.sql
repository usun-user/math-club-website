-- Weekly practice sets linked to club meetings
CREATE TABLE public.weekly_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  meeting_date DATE,
  week_number INTEGER NOT NULL UNIQUE
    CHECK (week_number > 0),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public information about math problems
CREATE TABLE public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_set_id UUID NOT NULL
    REFERENCES public.weekly_sets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL
    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question TEXT NOT NULL,
  answer_type TEXT NOT NULL
    CHECK (answer_type IN ('number', 'expression', 'proof')),
  points INTEGER NOT NULL DEFAULT 10
    CHECK (points >= 0),
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Progressive hints written by executives
CREATE TABLE public.hints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL
    REFERENCES public.problems(id) ON DELETE CASCADE,
  hint_order INTEGER NOT NULL
    CHECK (hint_order > 0),
  content TEXT NOT NULL,
  UNIQUE (problem_id, hint_order)
);

-- Private answer keys (never readable by students)
CREATE TABLE public.answer_keys (
  problem_id UUID PRIMARY KEY
    REFERENCES public.problems(id) ON DELETE CASCADE,
  answer_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student attempts and manual review status
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL
    REFERENCES public.problems(id),
  user_id UUID REFERENCES auth.users(id),
  submitted_answer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN (
      'correct', 'incorrect', 'pending_review'
    )),
  points_awarded INTEGER NOT NULL DEFAULT 0
    CHECK (points_awarded >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.weekly_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can read published weekly practice sets
CREATE POLICY "Read published weekly sets"
ON public.weekly_sets
FOR SELECT
TO anon, authenticated
USING (is_published = TRUE);

-- Anyone can read problems in published sets
CREATE POLICY "Read published problems"
ON public.problems
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.weekly_sets
    WHERE weekly_sets.id = problems.weekly_set_id
      AND weekly_sets.is_published = TRUE
  )
);

-- Anyone can read hints for published problems
CREATE POLICY "Read published hints"
ON public.hints
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.problems
    JOIN public.weekly_sets
      ON weekly_sets.id = problems.weekly_set_id
    WHERE problems.id = hints.problem_id
      AND weekly_sets.is_published = TRUE
  )
);

-- Answer keys have no client-readable policies.
-- Submissions have no client-write policies.
-- Both will be accessed through trusted backend functions.