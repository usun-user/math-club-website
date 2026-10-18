import { supabase } from "../lib/supabase";

export interface PracticeProblem {
  id: string;
  title: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  display_order: number;
  weekly_set_id: string;
  week_number: number;
  week_title: string;
}

type ProblemRow = {
  id: string;
  title: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  display_order: number;
  weekly_set_id: string;
  weekly_sets: {
    week_number: number;
    title: string;
  };
};

export async function getPracticeProblems(): Promise<PracticeProblem[]> {
  const { data, error } = await supabase
    .from("problems")
    .select(`
      id,
      title,
      topic,
      difficulty,
      points,
      display_order,
      weekly_set_id,
      weekly_sets!inner (
        week_number,
        title
      )
    `)
    .eq("weekly_sets.is_published", true);

  if (error) {
    throw new Error(`Unable to load problems: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as ProblemRow[];

  return rows
    .map((problem) => ({
      id: problem.id,
      title: problem.title,
      topic: problem.topic,
      difficulty: problem.difficulty,
      points: problem.points,
      display_order: problem.display_order,
      weekly_set_id: problem.weekly_set_id,
      week_number: problem.weekly_sets.week_number,
      week_title: problem.weekly_sets.title,
    }))
    .sort(
      (a, b) =>
        a.week_number - b.week_number ||
        a.display_order - b.display_order ||
        a.id.localeCompare(b.id)
    );
}