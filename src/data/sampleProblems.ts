import type { MathProblem } from "../types/MathProblem";

// Temporary data for development. Later, we'll load the problems from Supabase.
export const problems: MathProblem[] = [
  {
    id: "algebra-001",
    title: "Simple Algebra",
    topic: "Algebra",
    difficulty: "easy",
    question: "Solve for $x$: $2x+6=18$",
    hints: [
      "Try isolating the variable.",
      "Subtract 6 from both sides.",
      "Divide both sides by 2."
    ],
    answerType: "number",
    points: 10,
    weekNumber: 1,
    order: 1
  },
  {
    id: "algebra-002",
    title: "Quadratic Equations",
    topic: "Algebra",
    difficulty: "medium",
    question: "Solve $x^2-5x+6=0$.",
    hints: [
      "Try factoring the quadratic.",
      "Find two numbers that multiply to 6 and add to -5.",
      "Rewrite it as $(x-2)(x-3)$."
    ],
    answerType: "expression",
    points: 20,
    weekNumber: 1,
    order: 2
  }
];