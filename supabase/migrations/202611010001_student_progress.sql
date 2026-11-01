-- Public display information for registered students
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY
    REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One progress record per student per problem
CREATE TABLE public.problem_progress (
  user_id UUID NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,

  problem_id UUID NOT NULL
    REFERENCES public.problems(id) ON DELETE CASCADE,

  hints_used INTEGER NOT NULL DEFAULT 0
    CHECK (hints_used >= 0),

  is_solved BOOLEAN NOT NULL DEFAULT FALSE,

  xp_earned INTEGER NOT NULL DEFAULT 0
    CHECK (xp_earned >= 0),

  solved_at TIMESTAMPTZ,

  PRIMARY KEY (user_id, problem_id)
);

-- Enable database security
ALTER TABLE public.profiles
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.problem_progress
ENABLE ROW LEVEL SECURITY;

-- Students can read their own profile
CREATE POLICY "Read own profile"
ON public.profiles
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Students can read their own progress
CREATE POLICY "Read own progress"
ON public.problem_progress
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Explicit permissions
GRANT SELECT ON public.profiles
TO authenticated;

GRANT SELECT ON public.problem_progress
TO authenticated;

-- Trusted backend access
GRANT SELECT, INSERT, UPDATE, DELETE
ON public.profiles, public.problem_progress
TO service_role;