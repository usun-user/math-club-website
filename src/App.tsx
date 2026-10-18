import { Routes, Route, Link } from "react-router";
import "./App.css";

import ProblemSolver from "./pages/ProblemSolver";
import ProblemCard from "./components/ProblemCard";
import { problems } from "./data/sampleProblems";

function App() {
  return (
    <div>
      <header>
        <h1>Math Club Challenges</h1>

        <nav>
          <Link to="/">Home</Link>
          {" | "}
          <Link to="/practice">Practice</Link>
        </nav>
      </header>

      <Routes>
        {/* Homepage */}
        <Route
          path="/"
          element={
            <main>
              <h2>Welcome to Math Club!</h2>
              <p>
                Practice math problems, reveal hints,
                and check your answers.
              </p>
            </main>
          }
        />

        {/* Practice page */}
        <Route
          path="/practice"
          element={
            <main>
              <h2>Practice Problems</h2>

              {problems.map((problem) => (
                <div key={problem.id}>
                  <ProblemCard problem={problem} />
                </div>
              ))}
            </main>
          }
        />

        {/* Individual problem page */}
        <Route
          path="/problems/:problemId"
          element={<ProblemSolver />}
        />
      </Routes>
    </div>
  );
}

export default App;