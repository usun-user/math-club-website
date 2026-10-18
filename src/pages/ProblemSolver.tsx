import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { supabase } from "../lib/supabase";
import { submitAnswer } from "../services/submissionService";
import {
  getProblemNavigation,
  type ProblemNavigation as NavigationData,
} from "../services/problemNavigationService";
import ProblemNavigation from "../components/ProblemNavigation";
import ProgressiveHints from "../components/ProgressiveHints";

interface ProblemDetails {
  id: string;
  title: string;
  question: string;
  difficulty: string;
  answer_type: string;
  points: number;
}

export default function ProblemSolver() {
  const { problemId } = useParams<{ problemId: string }>();

  const [problem, setProblem] = useState<ProblemDetails | null>(null);
  const [navigation, setNavigation] = useState<NavigationData | null>(null);

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProblem() {
      setLoading(true);
      setError("");
      setProblem(null);
      setNavigation(null);
      setAnswer("");
      setFeedback("");

      if (!problemId) {
        setError("No problem selected.");
        setLoading(false);
        return;
      }

      try {
        const [problemResult, navigationResult] =
          await Promise.all([
            supabase
              .from("problems")
              .select(
                "id, title, question, difficulty, answer_type, points"
              )
              .eq("id", problemId)
              .single(),
            getProblemNavigation(problemId),
          ]);

        if (problemResult.error || !problemResult.data) {
          throw new Error("Problem not found.");
        }

        if (!navigationResult) {
          throw new Error("Problem navigation unavailable.");
        }

        if (!cancelled) {
          setProblem(problemResult.data);
          setNavigation(navigationResult);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load problem."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProblem();

    return () => {
      cancelled = true;
    };
  }, [problemId]);

  async function handleSubmit() {
    if (!problem || !answer.trim() || submitting) return;

    setSubmitting(true);
    setFeedback("");

    try {
      const result = await submitAnswer({
        problemId: problem.id,
        answer,
      });

      setFeedback(result.feedback);
    } catch {
      setFeedback("Unable to check answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading problem...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!problem || !navigation) return <p>Problem not found.</p>;

  return (
    <main>
      <h1>{problem.title}</h1>

      <p>
        Difficulty: {problem.difficulty} | Points: {problem.points}
      </p>

      <section>
        <h2>Question</h2>
        <p>{problem.question}</p>
      </section>

      <ProgressiveHints
        key={problem.id}
        problemId={problem.id}
      />

      <section>
        <h2>Your Answer</h2>

        {problem.answer_type === "proof" ? (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your proof..."
            rows={8}
          />
        ) : (
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer"
          />
        )}

        <button
          onClick={() => void handleSubmit()}
          disabled={submitting || !answer.trim()}
        >
          {submitting ? "Checking..." : "Check Answer"}
        </button>

        <p aria-live="polite">{feedback}</p>
      </section>

      <ProblemNavigation navigation={navigation} />
    </main>
  );
}