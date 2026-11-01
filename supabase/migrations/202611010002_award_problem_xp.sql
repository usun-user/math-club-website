CREATE OR REPLACE FUNCTION public.award_problem_xp(
  p_user_id UUID,
  p_problem_id UUID,
  p_hints_used INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_base_points INTEGER;
  v_max_hints INTEGER;
  v_xp INTEGER;
  v_awarded INTEGER;
BEGIN
  IF p_user_id IS NULL OR p_problem_id IS NULL
     OR p_hints_used IS NULL OR p_hints_used < 0 THEN
    RAISE EXCEPTION 'Invalid progress data';
  END IF;

  SELECT p.points INTO v_base_points
  FROM public.problems p
  JOIN public.weekly_sets w ON w.id = p.weekly_set_id
  WHERE p.id = p_problem_id AND w.is_published = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Published problem not found';
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_max_hints
  FROM public.hints
  WHERE problem_id = p_problem_id;

  IF p_hints_used > v_max_hints THEN
    RAISE EXCEPTION 'Invalid hint count';
  END IF;

  v_xp := ROUND(
    v_base_points * (1 - LEAST(0.6, p_hints_used * 0.2))
  )::INTEGER;

  INSERT INTO public.problem_progress (
    user_id, problem_id, hints_used,
    is_solved, xp_earned, solved_at
  )
  VALUES (
    p_user_id, p_problem_id, p_hints_used,
    TRUE, v_xp, now()
  )
  ON CONFLICT (user_id, problem_id) DO NOTHING
  RETURNING xp_earned INTO v_awarded;

  RETURN COALESCE(v_awarded, 0);
END;
$$;

-- Only trusted backend code can award XP.
REVOKE ALL ON FUNCTION
  public.award_problem_xp(UUID, UUID, INTEGER)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
  public.award_problem_xp(UUID, UUID, INTEGER)
TO service_role;