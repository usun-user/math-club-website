import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";

interface ProgressRow {
  problem_id: string;
  xp_earned: number;
  hints_used: number;
  solved_at: string | null;
  problems: {
    title: string;
    topic: string;
    difficulty: string;
  };
}

export default function MyProgress() {
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      const { data: userData, error: authError } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !userData.user) {
        setSignedIn(false);
        setLoading(false);
        return;
      }

      setSignedIn(true);

      const { data, error: queryError } = await supabase
        .from("problem_progress")
        .select(`
          problem_id,
          xp_earned,
          hints_used,
          solved_at,
          problems!inner(title, topic, difficulty)
        `)
        .eq("user_id", userData.user.id)
        .eq("is_solved", true)
        .order("solved_at", { ascending: false });

      if (!active) return;

      if (queryError) {
        setError("Unable to load your progress.");
      } else {
        setRows((data ?? []) as unknown as ProgressRow[]);
      }

      setLoading(false);
    }

    void loadProgress();
    return () => { active = false; };
  }, []);

  if (loading) return <main><p>Loading progress...</p></main>;

  if (!signedIn) {
    return (
      <main>
        <h1>My Progress</h1>
        <p>Log in to save and view your Math Club achievements.</p>
        <Link to="/auth">Log In / Register</Link>
      </main>
    );
  }

  const totalXP = rows.reduce((sum, row) => sum + row.xp_earned, 0);
  const level = Math.floor(totalXP / 100) + 1;

  return (
    <main>
      <h1>My Progress</h1>
      {error && <p role="alert">{error}</p>}

      <section>
        <h2>Level {level}</h2>
        <p>Total XP: {totalXP}</p>
        <p>Problems solved: {rows.length}</p>
        <p>XP toward next level: {totalXP % 100}/100</p>
        <progress value={totalXP % 100} max={100} />
      </section>

      <section>
        <h2>Completed Problems</h2>

        {rows.length === 0 && <p>You haven't solved any problems yet.</p>}

        {rows.map(row => (
          <article key={row.problem_id}>
            <h3>
              <Link to={`/problems/${row.problem_id}`}>
                {row.problems.title}
              </Link>
            </h3>

            <p>Topic: {row.problems.topic}</p>
            <p>Difficulty: {row.problems.difficulty}</p>
            <p>Hints used: {row.hints_used}</p>
            <p>XP earned: {row.xp_earned}</p>
          </article>
        ))}
      </section>
    </main>
  );
}