import { useState } from "react";
import "./App.css";
import ProblemCard from "./components/ProblemCard";
import { problems } from "./data/sampleProblems";
import ProblemSolver from "./pages/ProblemSolver";

function App() {
  const [showHint, setShowHint] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  function checkAnswer() {
    if (answer.trim() === "6") {
      setFeedback("Correct! Great job!");
    } else {
      setFeedback("Incorrect. Try again!");
    }
  }

  return (
    <main>
      <h1>Math Club Challenges</h1>
      <p>Welcome to our interactive math club!</p>

      <h2>Problem 1: Algebra</h2>
      <p>Solve for x: 2x + 6 = 18</p>

      <button onClick={() => setShowHint(!showHint)}>
        {showHint ? "Hide Hint" : "Reveal Hint"}
      </button>

      {showHint && (
        <p>Hint: Subtract 6 from both sides.</p>
      )}

      <div>
        <input
          type="text"
          placeholder="Enter your answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <button onClick={checkAnswer}>
          Check Answer
        </button>
      </div>

      <p>{feedback}</p>
      <h2>Practice Problems</h2>

      {problems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} />
      ))}

      <ProblemSolver />
    </main>
  );
}

export default App;
