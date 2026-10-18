import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  getPracticeProblems,
  type PracticeProblem,
} from "../services/practiceService";
import "./Practice.css";

type SortOption = "week" | "topic" | "difficulty";

const difficultyRank = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export default function Practice() {
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [week, setWeek] = useState("all");
  const [topic, setTopic] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("week");

  useEffect(() => {
    let active = true;

    async function loadProblems() {
      try {
        const result = await getPracticeProblems();

        if (active) {
          setProblems(result);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load problems."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProblems();

    return () => {
      active = false;
    };
  }, []);

  const weeks = [...new Set(problems.map(p => p.week_number))]
    .sort((a, b) => a - b);

  const topics = [...new Set(problems.map(p => p.topic))]
    .sort();

  const filteredProblems = useMemo(() => {
    const result = problems.filter((problem) => {
      return (
        (week === "all" || String(problem.week_number) === week) &&
        (topic === "all" || problem.topic === topic) &&
        (difficulty === "all" || problem.difficulty === difficulty)
      );
    });

    return result.sort((a, b) => {
      if (sortBy === "topic") {
        return a.topic.localeCompare(b.topic) ||
          a.week_number - b.week_number ||
          a.display_order - b.display_order;
      }

      if (sortBy === "difficulty") {
        return difficultyRank[a.difficulty] -
          difficultyRank[b.difficulty] ||
          a.week_number - b.week_number ||
          a.display_order - b.display_order;
      }

      return a.week_number - b.week_number ||
        a.display_order - b.display_order;
    });
  }, [problems, week, topic, difficulty, sortBy]);

  if (loading) return <p>Loading practice problems...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <main>
      <h1>Math Club Practice</h1>
      <p>
        Explore problems from our weekly Math Club meetings.
      </p>

      <section aria-label="Problem filters">
        <label>
          Week:
          <select value={week} onChange={e => setWeek(e.target.value)}>
            <option value="all">All Weeks</option>
            {weeks.map(w => (
              <option key={w} value={w}>Week {w}</option>
            ))}
          </select>
        </label>

        <label>
          Topic:
          <select value={topic} onChange={e => setTopic(e.target.value)}>
            <option value="all">All Topics</option>
            {topics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label>
          Difficulty:
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <label>
          Sort by:
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
          >
            <option value="week">Week</option>
            <option value="topic">Topic</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </label>
      </section>

      <p>{filteredProblems.length} problems found</p>

      {filteredProblems.length === 0 && (
        <p>No problems match your filters.</p>
      )}

      <section className="practice-problems">
        {filteredProblems.map((problem, index) => {
          const previous = filteredProblems[index - 1];

          const groupName =
            sortBy === "topic"
              ? problem.topic
              : sortBy === "difficulty"
                ? problem.difficulty
                : `Week ${problem.week_number}: ${problem.week_title}`;

          const previousGroup =
            previous
              ? sortBy === "topic"
                ? previous.topic
                : sortBy === "difficulty"
                  ? previous.difficulty
                  : `Week ${previous.week_number}: ${previous.week_title}`
              : null;

          return (
            <div key={problem.id}>
              {groupName !== previousGroup && (
                <h2>{groupName}</h2>
              )}

              <Link
                to={`/problems/${problem.id}`}
                className="practice-card"
                title={`${problem.topic} | Week ${problem.week_number} | Problem ${problem.display_order}`}
              >
                <h3>{problem.title}</h3>
                <p>Topic: {problem.topic}</p>
                <p>Difficulty: {problem.difficulty}</p>
                <p>Week: {problem.week_number}</p>
                <p>Points: {problem.points}</p>
                <span>Open Problem →</span>
              </Link>
            </div>
          );
        })}
      </section>
    </main>
  );
}