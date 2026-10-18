import { useState } from "react";
import { submitAnswer } from "../services/submissionService";

function ProblemSolver() {
  const [studentAnswer, setStudentAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  // Example problem ID for testing
  const problemId = "e269a536-49d1-46f6-b9a3-305c6eb64078";

  async function handleSubmit() {
    try {
      const result = await submitAnswer({
        problemId,
        answer: studentAnswer,
      });

      setFeedback(result.feedback);
    } catch {
      setFeedback("Unable to check answer. Please try again.");
    }
  }

  return (
    <div>
      <h2>Math Problem</h2>

      <input
        value={studentAnswer}
        onChange={(e) => setStudentAnswer(e.target.value)}
        placeholder="Enter your answer"
      />

      <button onClick={handleSubmit}>
        Check Answer
      </button>

      <p>{feedback}</p>
    </div>
  );
}

export default ProblemSolver;