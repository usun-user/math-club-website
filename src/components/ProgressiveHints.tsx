import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import MathImage from "./MathImage";
import MathText from "./MathText";

interface Hint {
  id: string;
  hint_order: number;
  content: string;
  image_path: string | null;
}

interface HintResponse {
  revealed: number;
  total: number;
  solved: boolean;
  hints: Hint[];
}

interface Props {
  problemId: string;
  onHintsUsedChange?: (count: number) => void;
}

export default function ProgressiveHints({ problemId, onHintsUsedChange }: Props) {
  const [hints, setHints] = useState<Hint[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [total, setTotal] = useState(0);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      const { data, error } = await supabase.functions.invoke<HintResponse>(
        "reveal-hint",
        { body: { problemId, action: "status", guestCount: 0 } }
      );

      if (!active) return;

      if (error || !data) {
        setError("Unable to load hints.");
      } else {
        setHints(data.hints);
        setRevealed(data.revealed);
        setTotal(data.total);
        setSolved(data.solved);
        onHintsUsedChange?.(data.revealed);
      }

      setLoading(false);
    }

    void load();
    return () => { active = false; };
  }, [problemId, onHintsUsedChange]);

  async function revealNextHint() {
    if (busy || solved || revealed >= total) return;

    setBusy(true);
    setError("");

    const { data, error } = await supabase.functions.invoke<HintResponse>(
      "reveal-hint",
      { body: { problemId, action: "reveal", guestCount: revealed } }
    );

    if (error || !data) {
      setError("Unable to reveal hint.");
    } else {
      setHints(data.hints);
      setRevealed(data.revealed);
      setTotal(data.total);
      setSolved(data.solved);
      onHintsUsedChange?.(data.revealed);
    }

    setBusy(false);
  }

  if (loading) return <p>Loading hints...</p>;

  return (
    <section>
      <h2>Hints</h2>

      {hints.map(hint => (
        <div key={hint.id} className="hint">
          <strong>Hint {hint.hint_order}</strong>
          <MathText text={hint.content} />
          <MathImage
            path={hint.image_path}
            alt={`Diagram for hint ${hint.hint_order}`}
          />
        </div>
      ))}

      <button type="button" onClick={() => void revealNextHint()}
        disabled={busy || solved || revealed >= total}>
        {busy ? "Loading..." : solved ? "Problem completed"
          : revealed >= total ? "All hints revealed" : "Reveal next hint"}
      </button>

      <p>{revealed} of {total} hints revealed</p>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}