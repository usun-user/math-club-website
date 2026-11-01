CREATE TABLE public.problem_hint_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  hints_revealed INTEGER NOT NULL DEFAULT 0 CHECK (hints_revealed >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, problem_id)
);

ALTER TABLE public.problem_hint_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students read own hint progress"
ON public.problem_hint_progress
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

GRANT SELECT ON public.problem_hint_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
ON public.problem_hint_progress TO service_role;