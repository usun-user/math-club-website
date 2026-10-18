import { Link } from "react-router";
import type { ProblemNavigation as NavigationData } from "../services/problemNavigationService";

interface Props {
  navigation: NavigationData;
}

// This component is independent of the answer-checking backend, so frontend executives can restyle this later.

export default function ProblemNavigation({ navigation }: Props) {
  const { previous, next, position, total } = navigation;

  return (
    <nav aria-label="Problem navigation">
      <p>
        Problem {position} of {total}
      </p>

      <div className="problem-navigation">
        {previous ? (
          <Link to={`/problems/${previous.id}`}>
            ← Previous Problem
          </Link>
        ) : (
          <span>First problem</span>
        )}

        <Link to="/practice">
          All Problems
        </Link>

        {next ? (
          <Link to={`/problems/${next.id}`}>
            Next Problem →
          </Link>
        ) : (
          <span>Last problem</span>
        )}
      </div>
    </nav>
  );
}