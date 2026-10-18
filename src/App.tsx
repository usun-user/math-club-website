import { Routes, Route, Link } from "react-router";
import "./App.css";

import ProblemSolver from "./pages/ProblemSolver";
import Practice from "./pages/Practice";

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
          element={<Practice />}
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