import type { MathProblem } from "../types/MathProblem";

// Temporary data for development. Later, we'll load the problems from Supabase.
export const problems: MathProblem[] = [
  {
    id: "problem-1",
    title: "Simple Algebra",
    topic: "Algebra",
    difficulty: "easy",
    question: "Solve for x: 2x + 6 = 18",
    hints: [
      "Try isolating the variable.",
      "Subtract 6 from both sides.",
      "Divide both sides by 2."
    ],
    points: 10
  },
  {
    id: "problem-2",
    title: "Quadratic Equations",
    topic: "Algebra",
    difficulty: "medium",
    question: "Solve for x: x² - 5x + 6 = 0",
    hints: [
      "Try factoring the quadratic.",
      "Find two numbers that multiply to 6 and add to -5.",
      "Rewrite the expression as (x - 2)(x - 3)."
    ],
    points: 20
  }
];