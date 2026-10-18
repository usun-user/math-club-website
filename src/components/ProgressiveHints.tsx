import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import MathImage from "./MathImage";

interface Hint {
  id: string;
  hint_order: number;
  content: string;
  image_path: string | null;
}

interface Props {
  problemId: string;
  onHintsUsedChange?: (count: number) => void;
}

export default function ProgressiveHints({
  problemId,
  onHintsUsedChange,
}: Props) {
  const [hints, setHints] = useState<Hint[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHints() {
      setLoading(true);
      setError("");
      setHints([]);
      setRevealed(0);

      try {
        const { data, error } = await supabase
          .from("hints")
          .select("id, hint_order, content, image_path")
          .eq("problem_id", problemId)
          .order("hint_order", { ascending: true });

        if (error) throw error;

        if (active) {
          setHints(data ?? []);
          onHintsUsedChange?.(0);
        }
      } catch {
        if (active) setError("Unable to load hints.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadHints();

    return () => {
      active = false;
    };
  }, [problemId, onHintsUsedChange]);

  function revealNextHint() {
    if (revealed >= hints.length) return;

    const nextCount = revealed + 1;
    setRevealed(nextCount);
    onHintsUsedChange?.(nextCount);
  }

  if (loading) return <p>Loading hints...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (hints.length === 0) return <p>No hints available.</p>;

  return (
    <section>
      <h2>Hints</h2>

      {hints.slice(0, revealed).map((hint) => (
        <div key={hint.id} className="hint">
          <strong>Hint {hint.hint_order}</strong>
          
          <p>{hint.content}</p>

          <MathImage
            path={hint.image_path}
            alt={'Diagram for hint ${hint.hint_order}'}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={revealNextHint}
        disabled={revealed >= hints.length}
      >
        {revealed >= hints.length
          ? "All hints revealed"
          : "Reveal next hint"}
      </button>

      <p>{revealed} of {hints.length} hints revealed</p>
    </section>
  );
}