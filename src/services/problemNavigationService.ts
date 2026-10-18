import { supabase } from "../lib/supabase";

export interface ProblemNavigationItem {
  id: string;
  title: string;
  display_order: number;
  weekly_set_id: string;
}

export interface ProblemNavigation {
  previous: ProblemNavigationItem | null;
  current: ProblemNavigationItem;
  next: ProblemNavigationItem | null;
  position: number;
  total: number;
}

export async function getProblemNavigation(
  problemId: string,
): Promise<ProblemNavigation | null> {
  // Find the selected problem.
  const { data: current, error: currentError } =
    await supabase
      .from("problems")
      .select("id, title, display_order, weekly_set_id")
      .eq("id", problemId)
      .single();

  if (currentError || !current) {
    throw new Error("Unable to load the selected problem.");
  }

  // Get all published problems in the same weekly set.
  const { data: problems, error: listError } =
    await supabase
      .from("problems")
      .select("id, title, display_order, weekly_set_id")
      .eq("weekly_set_id", current.weekly_set_id)
      .order("display_order", { ascending: true })
      .order("id", { ascending: true });

  if (listError || !problems) {
    throw new Error("Unable to load weekly navigation.");
  }

  const index = problems.findIndex(
    (problem) => problem.id === problemId,
  );

  if (index === -1) {
    return null;
  }

  return {
    previous: index > 0 ? problems[index - 1] : null,
    current: problems[index],
    next:
      index < problems.length - 1
        ? problems[index + 1]
        : null,
    position: index + 1,
    total: problems.length,
  };
}