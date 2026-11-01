-- Store hint usage for authenticated students.
CREATE TABLE IF NOT EXISTS public.problem_hint_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  hints_revealed INTEGER NOT NULL DEFAULT 0 CHECK (hints_revealed >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, problem_id)
);

ALTER TABLE public.problem_hint_progress ENABLE ROW LEVEL SECURITY;

-- Remove direct client access to hint content and score writes.
REVOKE ALL ON public.hints FROM anon, authenticated;
REVOKE ALL ON public.problem_hint_progress FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.problem_progress FROM anon, authenticated;

GRANT SELECT ON public.problem_hint_progress TO authenticated;
GRANT SELECT ON public.problem_progress TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.problem_hint_progress, public.problem_progress
TO service_role;

-- Students may read only their own hint progress.
DROP POLICY IF EXISTS "Students read own hint progress"
ON public.problem_hint_progress;

CREATE POLICY "Students read own hint progress"
ON public.problem_hint_progress
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Atomically reveal the next hint.
CREATE OR REPLACE FUNCTION public.advance_problem_hint(
  p_user_id UUID,
  p_problem_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count INTEGER;
  v_max INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.problems p
    JOIN public.weekly_sets w ON w.id = p.weekly_set_id
    WHERE p.id = p_problem_id AND w.is_published
  ) THEN
    RAISE EXCEPTION 'Problem unavailable';
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_max
  FROM public.hints WHERE problem_id = p_problem_id;

  INSERT INTO public.problem_hint_progress (
    user_id, problem_id, hints_revealed
  )
  VALUES (p_user_id, p_problem_id, LEAST(1, v_max))
  ON CONFLICT (user_id, problem_id)
  DO UPDATE SET
    hints_revealed = LEAST(
      public.problem_hint_progress.hints_revealed + 1,
      v_max
    ),
    updated_at = now()
  RETURNING hints_revealed INTO v_count;

  RETURN v_count;
END;
$$;

-- Award XP once, using the server-recorded hint count.
CREATE OR REPLACE FUNCTION public.award_problem_xp(
  p_user_id UUID,
  p_problem_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_points INTEGER;
  v_hints INTEGER;
  v_award INTEGER;
  v_inserted INTEGER;
BEGIN
  SELECT p.points INTO v_points
  FROM public.problems p
  JOIN public.weekly_sets w ON w.id = p.weekly_set_id
  WHERE p.id = p_problem_id AND w.is_published;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Problem unavailable';
  END IF;

  -- Lock or initialize the student's hint record.
  INSERT INTO public.problem_hint_progress (user_id, problem_id)
  VALUES (p_user_id, p_problem_id)
  ON CONFLICT (user_id, problem_id)
  DO UPDATE SET updated_at = now();

  SELECT hints_revealed INTO v_hints
  FROM public.problem_hint_progress
  WHERE user_id = p_user_id AND problem_id = p_problem_id
  FOR UPDATE;

  v_award := ROUND(
    v_points * (1 - LEAST(0.6, v_hints * 0.2))
  )::INTEGER;

  INSERT INTO public.problem_progress (
    user_id, problem_id, hints_used,
    is_solved, xp_earned, solved_at
  )
  VALUES (
    p_user_id, p_problem_id, v_hints,
    TRUE, v_award, now()
  )
  ON CONFLICT (user_id, problem_id) DO NOTHING
  RETURNING xp_earned INTO v_inserted;

  RETURN COALESCE(v_inserted, 0);
END;
$$;

-- Restrict privileged operations to the backend.
REVOKE ALL ON FUNCTION public.advance_problem_hint(UUID, UUID)
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.award_problem_xp(UUID, UUID)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.advance_problem_hint(UUID, UUID)
TO service_role;

GRANT EXECUTE ON FUNCTION public.award_problem_xp(UUID, UUID)
TO service_role;

-- Remove the older, caller-supplied hint-count function if present.
DROP FUNCTION IF EXISTS public.award_problem_xp(UUID, UUID, INTEGER);