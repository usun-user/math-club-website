import type { MathProblem } from "../types/MathProblem";

// defines what info the component receives
interface ProblemCardProps {
  problem: MathProblem;
}

// {problem} is a React prop containing the problem
// {problem.title} displays the title of that problem
function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <div className="problem-card">
      <h3>{problem.title}</h3>

      <p>Topic: {problem.topic}</p>

      <p>Difficulty: {problem.difficulty}</p>

      <p>Points: {problem.points}</p>
    </div>
  );
}

export default ProblemCard;